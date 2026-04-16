import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { prisma } from '../../lib/prisma.js';
import { config } from '../../lib/config.js';
import { refreshTokenStore } from '../../lib/redis.js';
import type { JWTPayload, AuthenticatedRequest } from './middleware.js';
import { requireAuth } from './middleware.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  userType: z.enum(['ems', 'public']).default('public'),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Helper to parse JWT expiration string to seconds
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 900;
  }
}

// Generate tokens
async function generateTokens(
  fastify: FastifyInstance,
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const accessToken = fastify.jwt.sign(payload, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTTL = parseExpiresIn(config.JWT_REFRESH_EXPIRES_IN);

  // Store refresh token in Redis with userType prefix for lookup
  await refreshTokenStore.set(refreshToken, `${payload.userType}:${payload.userId}`, refreshTTL);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiresIn(config.JWT_EXPIRES_IN),
  };
}

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/auth/register
   * Register a new public user
   */
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = registerSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { email, password, firstName, lastName, phone, zipCode } = parseResult.data;

    // Check if user already exists in PublicUser table
    const existingUser = await prisma.publicUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'A user with this email already exists',
      });
    }

    // Also check EMS users to prevent cross-table duplicates
    const existingEMS = await prisma.eMSUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEMS) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'This email is already registered',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create public user
    const user = await prisma.publicUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        homeZipCode: zipCode,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        verificationLevel: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await generateTokens(fastify, {
      userId: user.id,
      email: user.email,
      userType: 'public',
    });

    return reply.status(201).send({
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        user: {
          ...user,
          userType: 'public',
        },
        ...tokens,
      },
    });
  });

  /**
   * POST /api/v1/auth/login
   * Login for both EMS and public users
   */
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = loginSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { email, password, userType } = parseResult.data;
    const emailLower = email.toLowerCase();

    let user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      passwordHash: string;
      isActive: boolean;
      role?: string;
      clientId?: string;
    } | null = null;

    // Find user based on userType
    if (userType === 'ems') {
      const emsUser = await prisma.eMSUser.findUnique({
        where: { email: emailLower },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          passwordHash: true,
          isActive: true,
          role: true,
          clientId: true,
        },
      });
      user = emsUser;
    } else {
      const publicUser = await prisma.publicUser.findUnique({
        where: { email: emailLower },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          passwordHash: true,
          isActive: true,
        },
      });
      user = publicUser;
    }

    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Account is deactivated',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    if (userType === 'ems') {
      await prisma.eMSUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      await prisma.publicUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate tokens
    const tokens = await generateTokens(fastify, {
      userId: user.id,
      email: user.email,
      userType,
    });

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return reply.status(200).send({
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          userType,
        },
        ...tokens,
      },
    });
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = refreshSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: parseResult.error.flatten(),
      });
    }

    const { refreshToken } = parseResult.data;

    // Verify refresh token exists in Redis
    const storedValue = await refreshTokenStore.get(refreshToken);

    if (!storedValue) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
    }

    // Parse userType and userId from stored value
    const [userType, userId] = storedValue.split(':') as ['ems' | 'public', string];

    // Get user data based on userType
    let user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
    } | null = null;

    if (userType === 'ems') {
      user = await prisma.eMSUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    } else {
      user = await prisma.publicUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    }

    if (!user || !user.isActive) {
      // Delete the refresh token since user is invalid
      await refreshTokenStore.delete(refreshToken);

      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'User not found or deactivated',
      });
    }

    // Delete old refresh token (rotation)
    await refreshTokenStore.delete(refreshToken);

    // Generate new tokens
    const tokens = await generateTokens(fastify, {
      userId: user.id,
      email: user.email,
      userType,
    });

    return reply.status(200).send({
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        user: {
          ...user,
          userType,
        },
        ...tokens,
      },
    });
  });

  /**
   * POST /api/v1/auth/logout
   * Logout and invalidate refresh token
   */
  fastify.post(
    '/logout',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const refreshToken = (request.body as { refreshToken?: string })?.refreshToken;

      if (refreshToken) {
        await refreshTokenStore.delete(refreshToken);
      }

      return reply.status(200).send({
        statusCode: 200,
        message: 'Logged out successfully',
      });
    }
  );

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  fastify.get(
    '/me',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      let user: Record<string, unknown> | null = null;

      if (userType === 'ems') {
        user = await prisma.eMSUser.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            badgeNumber: true,
            certifications: true,
            isActive: true,
            isOnDuty: true,
            createdAt: true,
            lastLoginAt: true,
            clientId: true,
          },
        });
      } else {
        user = await prisma.publicUser.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            phone: true,
            verificationLevel: true,
            profileImageUrl: true,
            bio: true,
            homeZipCode: true,
            notificationRadius: true,
            isActive: true,
            pushNotifications: true,
            smsNotifications: true,
            emailNotifications: true,
            shareLocationDuringEmergency: true,
            createdAt: true,
            lastLoginAt: true,
          },
        });
      }

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: {
          user: {
            ...user,
            userType,
          },
        },
      });
    }
  );
}

export default authRoutes;
