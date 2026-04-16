import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { getRedisPublisher } from '../../lib/redis.js';
import { requireAuth, requireEMS, optionalAuth } from '../auth/middleware.js';
import type { AuthenticatedRequest, OptionalAuthRequest, JWTPayload } from '../auth/middleware.js';
import {
  createStatusSchema,
  queryStatusSchema,
  statusIdParamSchema,
  verifyStatusSchema,
  statusSummaryQuerySchema,
  type CreateStatusInput,
  type QueryStatusInput,
  type StatusIdParam,
  type VerifyStatusInput,
  type StatusSummaryQuery,
} from './schemas.js';
import type { ReporterType, StatusConfidence, VerificationLevel, Prisma } from '@prisma/client';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determines the reporter type based on user type and subject type
 */
function determineReporterType(
  userType: 'ems' | 'public',
  subjectType: string,
  isAnonymous: boolean
): ReporterType {
  if (isAnonymous) {
    return 'ANONYMOUS';
  }

  if (userType === 'ems') {
    return 'RESPONDER';
  }

  // Public user
  if (subjectType === 'SELF') {
    return 'SELF';
  } else if (subjectType === 'FAMILY_MEMBER' || subjectType === 'DEPENDENT') {
    return 'FAMILY_MEMBER';
  } else {
    return 'NEIGHBOR';
  }
}

/**
 * Determines the initial confidence level based on reporter type and verification level
 */
async function determineConfidence(
  reporterType: ReporterType,
  userId: string | undefined,
  userType: 'ems' | 'public'
): Promise<StatusConfidence> {
  // Official/EMS reports start as CONFIRMED
  if (userType === 'ems' || reporterType === 'OFFICIAL' || reporterType === 'RESPONDER') {
    return 'CONFIRMED';
  }

  // Check if user is a verified group member (CERT, retired first responder, etc.)
  if (userId && userType === 'public') {
    const publicUser = await prisma.publicUser.findUnique({
      where: { id: userId },
      select: { verificationLevel: true },
    });

    // TRUSTED_MEMBER or IDENTITY_VERIFIED users get higher confidence
    if (publicUser?.verificationLevel === 'TRUSTED_MEMBER' ||
        publicUser?.verificationLevel === 'IDENTITY_VERIFIED') {
      return 'REPORTED'; // Verified group confidence level
    }
  }

  // Self reports get REPORTED confidence
  if (reporterType === 'SELF' || reporterType === 'FAMILY_MEMBER') {
    return 'REPORTED';
  }

  // Third-party observations start as UNVERIFIED
  return 'UNVERIFIED';
}

/**
 * Broadcasts a status update via Socket.io through Redis pub/sub
 */
async function broadcastStatusUpdate(
  eventId: string,
  status: Record<string, unknown>,
  action: 'created' | 'updated' | 'verified'
): Promise<void> {
  const publisher = getRedisPublisher();
  await publisher.publish('status:update', JSON.stringify({
    eventId,
    action,
    status,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// Route Handlers
// ============================================================================

export async function statusRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/status
   * Report a status (self, household, or third-party observation)
   * Reporter type is auto-determined from auth token
   */
  fastify.post(
    '/',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = createStatusSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const { userId, userType } = (request as AuthenticatedRequest).user;
      const input = parseResult.data;

      // Verify the event exists
      const event = await prisma.event.findUnique({
        where: { id: input.eventId },
        select: { id: true, status: true },
      });

      if (!event) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Event not found',
        });
      }

      // Determine reporter type automatically
      const reporterType = determineReporterType(userType, input.subjectType, false);

      // Determine confidence level based on reporter type and user verification
      const confidence = await determineConfidence(reporterType, userId, userType);

      // Build the create data
      const createData: Prisma.PersonStatusCreateInput = {
        reporterType,
        reporterNote: input.reporterNote,
        subjectType: input.subjectType,
        subjectName: input.subjectName,
        subjectPhone: input.subjectPhone,
        subjectEmail: input.subjectEmail,
        numberOfPeople: input.numberOfPeople,
        safetyStatus: input.safetyStatus,
        confidence,
        needsDescription: input.needsDescription,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        locationDescription: input.locationDescription,
        event: { connect: { id: input.eventId } },
      };

      // Set the reporter based on user type
      if (userType === 'ems') {
        createData.reportedByEMS = { connect: { id: userId } };
      } else {
        createData.reportedByPublic = { connect: { id: userId } };
      }

      // If subject is a registered user, link them
      if (input.subjectUserId) {
        createData.subjectUser = { connect: { id: input.subjectUserId } };
      } else if (input.subjectType === 'SELF' && userType === 'public') {
        // Self-report from public user - link them as subject
        createData.subjectUser = { connect: { id: userId } };
      }

      // Create the status
      const status = await prisma.personStatus.create({
        data: createData,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          reportedByPublic: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
          reportedByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              badgeNumber: true,
            },
          },
        },
      });

      // Broadcast the new status
      await broadcastStatusUpdate(input.eventId, {
        id: status.id,
        safetyStatus: status.safetyStatus,
        confidence: status.confidence,
        subjectType: status.subjectType,
        numberOfPeople: status.numberOfPeople,
        locationLat: status.locationLat,
        locationLng: status.locationLng,
        createdAt: status.createdAt,
      }, 'created');

      return reply.status(201).send({
        statusCode: 201,
        message: 'Status reported successfully',
        data: {
          status,
        },
      });
    }
  );

  /**
   * GET /api/v1/status
   * Get statuses with filtering
   */
  fastify.get(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = queryStatusSchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query = parseResult.data;
      const { page, limit, sortBy, sortOrder } = query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.PersonStatusWhereInput = {};

      if (query.eventId) {
        where.eventId = query.eventId;
      }

      // Bounding box filter
      if (query.minLat !== undefined && query.maxLat !== undefined &&
          query.minLng !== undefined && query.maxLng !== undefined) {
        where.locationLat = {
          gte: query.minLat,
          lte: query.maxLat,
        };
        where.locationLng = {
          gte: query.minLng,
          lte: query.maxLng,
        };
      }

      // Safety status filter
      if (query.safetyStatus && query.safetyStatus.length > 0) {
        where.safetyStatus = { in: query.safetyStatus };
      }

      // Confidence filter
      if (query.confidence && query.confidence.length > 0) {
        where.confidence = { in: query.confidence };
      }

      // Verification filter
      if (query.isVerified !== undefined) {
        where.isVerified = query.isVerified;
      }

      // Reporter type filter
      if (query.reporterType && query.reporterType.length > 0) {
        where.reporterType = { in: query.reporterType };
      }

      // Time filters
      if (query.since || query.until) {
        where.createdAt = {};
        if (query.since) {
          where.createdAt.gte = query.since;
        }
        if (query.until) {
          where.createdAt.lte = query.until;
        }
      }

      // Execute query with count
      const [statuses, total] = await Promise.all([
        prisma.personStatus.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
              },
            },
            reportedByPublic: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
            reportedByEMS: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                badgeNumber: true,
              },
            },
          },
        }),
        prisma.personStatus.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        statusCode: 200,
        data: {
          statuses,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/status/summary
   * Get aggregated status counts for an area/event
   */
  fastify.get(
    '/summary',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = statusSummaryQuerySchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query = parseResult.data;

      // Build where clause
      const where: Prisma.PersonStatusWhereInput = {};

      if (query.eventId) {
        where.eventId = query.eventId;
      }

      // Bounding box filter
      if (query.minLat !== undefined && query.maxLat !== undefined &&
          query.minLng !== undefined && query.maxLng !== undefined) {
        where.locationLat = {
          gte: query.minLat,
          lte: query.maxLat,
        };
        where.locationLng = {
          gte: query.minLng,
          lte: query.maxLng,
        };
      }

      // Time filter
      if (query.since) {
        where.createdAt = { gte: query.since };
      }

      // Get all statuses for aggregation
      let statuses = await prisma.personStatus.findMany({
        where,
        select: {
          safetyStatus: true,
          confidence: true,
          isVerified: true,
          numberOfPeople: true,
          locationLat: true,
          locationLng: true,
          reporterType: true,
        },
      });

      // Apply radius filter if provided (post-query filtering for better accuracy)
      if (query.centerLat !== undefined && query.centerLng !== undefined &&
          query.radiusMiles !== undefined) {
        statuses = statuses.filter((s) => {
          if (s.locationLat === null || s.locationLng === null) {
            return false;
          }
          const distance = haversineDistance(
            query.centerLat!,
            query.centerLng!,
            s.locationLat,
            s.locationLng
          );
          return distance <= query.radiusMiles!;
        });
      }

      // Aggregate by safety status
      const byStatus: Record<string, { count: number; people: number }> = {};
      const byConfidence: Record<string, number> = {};
      const byReporterType: Record<string, number> = {};
      let totalReports = 0;
      let totalPeople = 0;
      let verifiedCount = 0;

      for (const status of statuses) {
        totalReports++;
        totalPeople += status.numberOfPeople;

        // By safety status
        if (!byStatus[status.safetyStatus]) {
          byStatus[status.safetyStatus] = { count: 0, people: 0 };
        }
        byStatus[status.safetyStatus].count++;
        byStatus[status.safetyStatus].people += status.numberOfPeople;

        // By confidence
        byConfidence[status.confidence] = (byConfidence[status.confidence] || 0) + 1;

        // By reporter type
        byReporterType[status.reporterType] = (byReporterType[status.reporterType] || 0) + 1;

        // Verified count
        if (status.isVerified) {
          verifiedCount++;
        }
      }

      return reply.status(200).send({
        statusCode: 200,
        data: {
          summary: {
            totalReports,
            totalPeople,
            verifiedCount,
            unverifiedCount: totalReports - verifiedCount,
            byStatus,
            byConfidence,
            byReporterType,
          },
          filters: {
            eventId: query.eventId,
            hasBoundingBox: query.minLat !== undefined,
            hasRadiusFilter: query.centerLat !== undefined,
            since: query.since,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/status/:id
   * Get single status detail
   */
  fastify.get(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = statusIdParamSchema.safeParse(request.params);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid status ID',
          details: paramResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const user = (request as OptionalAuthRequest).user;

      const status = await prisma.personStatus.findUnique({
        where: { id },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              severity: true,
            },
          },
          reportedByPublic: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
              verificationLevel: true,
            },
          },
          reportedByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              badgeNumber: true,
              role: true,
            },
          },
          subjectUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
        },
      });

      if (!status) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Status not found',
        });
      }

      // Check if user can see sensitive details
      const canSeeSensitive = user && (
        user.userType === 'ems' ||
        status.reportedByPublicId === user.userId ||
        status.subjectUserId === user.userId
      );

      // Redact sensitive info for non-authorized viewers
      const responseStatus = {
        ...status,
        subjectPhone: canSeeSensitive ? status.subjectPhone : undefined,
        subjectEmail: canSeeSensitive ? status.subjectEmail : undefined,
      };

      return reply.status(200).send({
        statusCode: 200,
        data: {
          status: responseStatus,
        },
      });
    }
  );

  /**
   * PUT /api/v1/status/:id/verify
   * EMS endpoint to verify/upgrade a status report
   */
  fastify.put(
    '/:id/verify',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = statusIdParamSchema.safeParse(request.params);
      const bodyResult = verifyStatusSchema.safeParse(request.body);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid status ID',
          details: paramResult.error.flatten(),
        });
      }

      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const input = bodyResult.data;
      const { userId } = (request as AuthenticatedRequest).user;

      // Find the status
      const existingStatus = await prisma.personStatus.findUnique({
        where: { id },
        select: { id: true, eventId: true, isVerified: true },
      });

      if (!existingStatus) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Status not found',
        });
      }

      // Build update data
      const updateData: Prisma.PersonStatusUpdateInput = {
        isVerified: input.isVerified,
        verifiedAt: input.isVerified ? new Date() : null,
        verifiedByEMSId: input.isVerified ? userId : null,
      };

      // EMS verification upgrades confidence to CONFIRMED
      if (input.isVerified) {
        updateData.confidence = 'CONFIRMED';
      }

      // Optionally override confidence if specified
      if (input.confidence) {
        updateData.confidence = input.confidence;
      }

      // Optionally update safety status if specified
      if (input.safetyStatus) {
        updateData.safetyStatus = input.safetyStatus;
      }

      // Add verification note if provided
      if (input.verificationNote) {
        updateData.reporterNote = input.verificationNote;
      }

      // Update the status
      const status = await prisma.personStatus.update({
        where: { id },
        data: updateData,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          reportedByPublic: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
          reportedByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              badgeNumber: true,
            },
          },
        },
      });

      // Broadcast the verification
      await broadcastStatusUpdate(existingStatus.eventId, {
        id: status.id,
        safetyStatus: status.safetyStatus,
        confidence: status.confidence,
        isVerified: status.isVerified,
        verifiedAt: status.verifiedAt,
        updatedAt: status.updatedAt,
      }, 'verified');

      return reply.status(200).send({
        statusCode: 200,
        message: 'Status verified successfully',
        data: {
          status,
        },
      });
    }
  );
}

export default statusRoutes;
