import type { FastifyRequest, FastifyReply } from 'fastify';

export interface JWTPayload {
  userId: string;
  email: string;
  userType: 'ems' | 'public';
  iat?: number;
  exp?: number;
}

export type AuthenticatedRequest = FastifyRequest & {
  user: JWTPayload;
};

export type OptionalAuthRequest = FastifyRequest & {
  user?: JWTPayload | null;
};

/**
 * Middleware to require authentication
 * Verifies JWT token and attaches user to request
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JWTPayload>();
    (request as AuthenticatedRequest).user = decoded;
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware to require EMS user authentication
 * Verifies JWT token and ensures user is an EMS user
 */
export async function requireEMS(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JWTPayload>();

    if (decoded.userType !== 'ems') {
      reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'EMS access required',
      });
      return;
    }

    (request as AuthenticatedRequest).user = decoded;
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware to require public user authentication
 * Verifies JWT token and ensures user is a public user
 */
export async function requirePublic(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JWTPayload>();

    if (decoded.userType !== 'public') {
      reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Public user access required',
      });
      return;
    }

    (request as AuthenticatedRequest).user = decoded;
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware to optionally attach user if token is present
 * Does not fail if no token is provided
 */
export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = await request.jwtVerify<JWTPayload>();
      (request as OptionalAuthRequest).user = decoded;
    }
  } catch {
    // Token invalid or expired, but that's okay for optional auth
    // Just don't attach the user
  }
}
