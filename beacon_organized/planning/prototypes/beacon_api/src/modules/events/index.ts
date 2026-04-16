import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireEMS, optionalAuth } from '../auth/middleware.js';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../auth/middleware.js';
import {
  listEventsQuerySchema,
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
  type ListEventsQuery,
  type CreateEventInput,
  type UpdateEventInput,
} from './schemas.js';
import { workspaceRoutes } from './workspace.js';

/**
 * Events module routes
 * Handles emergency event declaration and management
 */
export async function eventsRoutes(fastify: FastifyInstance): Promise<void> {
  // Register workspace sub-routes
  fastify.register(workspaceRoutes);

  /**
   * GET /api/v1/events
   * List events with filtering options
   * Public events visible to all, non-public events require EMS auth
   */
  fastify.get(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validate query params
      const queryResult = listEventsQuerySchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: queryResult.error.flatten(),
        });
      }

      const {
        status,
        clientId,
        type,
        severity,
        isPublic,
        bbox,
        page,
        limit,
        sortBy,
        sortOrder,
      } = queryResult.data as ListEventsQuery;

      const user = (request as OptionalAuthRequest).user;
      const isEmsUser = user?.userType === 'ems';

      // Build where clause
      const where: Record<string, unknown> = {};

      // Status filter
      if (status) {
        where.status = status;
      }

      // Client filter
      if (clientId) {
        where.clientId = clientId;
      }

      // Type filter
      if (type) {
        where.type = type;
      }

      // Severity filter
      if (severity) {
        where.severity = severity;
      }

      // Public visibility filter
      // If user is not EMS, only show public events
      if (!isEmsUser) {
        where.isPublic = true;
      } else if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }

      // Bounding box filter for location-based queries
      if (bbox) {
        const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
        where.AND = [
          { locationLat: { gte: minLat, lte: maxLat } },
          { locationLng: { gte: minLng, lte: maxLng } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query with count
      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            severity: true,
            status: true,
            locationLat: true,
            locationLng: true,
            locationName: true,
            affectedAreaGeoJson: true,
            startedAt: true,
            expectedEndAt: true,
            resolvedAt: true,
            externalId: true,
            externalSource: true,
            externalUrl: true,
            estimatedAffectedPopulation: true,
            isPublic: true,
            requiresEvacuation: true,
            createdAt: true,
            updatedAt: true,
            clientId: true,
            client: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            _count: {
              select: {
                workspaces: true,
                mapTags: true,
                alerts: true,
              },
            },
          },
        }),
        prisma.event.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return reply.status(200).send({
        statusCode: 200,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/events
   * Declare a new emergency event
   * Requires EMS authentication
   */
  fastify.post(
    '/',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validate body
      const bodyResult = createEventSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const eventData = bodyResult.data as CreateEventInput;
      const { userId } = (request as AuthenticatedRequest).user;

      // Get the EMS user's client
      const emsUser = await prisma.eMSUser.findUnique({
        where: { id: userId },
        select: { id: true, clientId: true },
      });

      if (!emsUser) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'User not found',
        });
      }

      // If clientId is provided, verify it matches EMS user's client
      // Unless the user is creating a global event (no clientId)
      if (eventData.clientId && eventData.clientId !== emsUser.clientId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only create events for your own organization',
        });
      }

      // Create the event
      const event = await prisma.event.create({
        data: {
          name: eventData.name,
          description: eventData.description,
          type: eventData.type,
          severity: eventData.severity,
          status: eventData.status,
          locationLat: eventData.locationLat,
          locationLng: eventData.locationLng,
          locationName: eventData.locationName,
          affectedAreaGeoJson: eventData.affectedAreaGeoJson as object | undefined,
          startedAt: eventData.startedAt,
          expectedEndAt: eventData.expectedEndAt,
          externalId: eventData.externalId,
          externalSource: eventData.externalSource,
          externalUrl: eventData.externalUrl,
          estimatedAffectedPopulation: eventData.estimatedAffectedPopulation,
          isPublic: eventData.isPublic,
          requiresEvacuation: eventData.requiresEvacuation,
          clientId: eventData.clientId || emsUser.clientId,
          createdByEMSId: userId,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      // Broadcast event creation via Socket.io
      await fastify.publishEvent('events:created', {
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          severity: event.severity,
          status: event.status,
          locationLat: event.locationLat,
          locationLng: event.locationLng,
          locationName: event.locationName,
          isPublic: event.isPublic,
          requiresEvacuation: event.requiresEvacuation,
          createdAt: event.createdAt,
        },
      });

      fastify.log.info({ eventId: event.id, eventName: event.name }, 'Event created');

      return reply.status(201).send({
        statusCode: 201,
        message: 'Event created successfully',
        data: { event },
      });
    }
  );

  /**
   * GET /api/v1/events/:id
   * Get event details
   * Public events visible to all, non-public events require EMS auth
   */
  fastify.get(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validate params
      const paramResult = eventIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid event ID',
          details: paramResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const user = (request as OptionalAuthRequest).user;
      const isEmsUser = user?.userType === 'ems';

      // Get the event
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          createdByAdmin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          _count: {
            select: {
              workspaces: true,
              personStatuses: true,
              mapTags: true,
              communityPosts: true,
              alerts: true,
            },
          },
        },
      });

      if (!event) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Event not found',
        });
      }

      // Check access for non-public events
      if (!event.isPublic && !isEmsUser) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have access to this event',
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: { event },
      });
    }
  );

  /**
   * PUT /api/v1/events/:id
   * Update an event (status, geometry, severity, etc.)
   * Requires EMS authentication
   */
  fastify.put(
    '/:id',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validate params
      const paramResult = eventIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid event ID',
          details: paramResult.error.flatten(),
        });
      }

      // Validate body
      const bodyResult = updateEventSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const updateData = bodyResult.data as UpdateEventInput;
      const { userId } = (request as AuthenticatedRequest).user;

      // Get the existing event
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { id: true, clientId: true, status: true },
      });

      if (!existingEvent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Event not found',
        });
      }

      // Verify EMS user has access (same client or event is global)
      const emsUser = await prisma.eMSUser.findUnique({
        where: { id: userId },
        select: { id: true, clientId: true },
      });

      if (!emsUser) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'User not found',
        });
      }

      // If event has a clientId, verify user belongs to same client
      if (existingEvent.clientId && existingEvent.clientId !== emsUser.clientId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have access to this event',
        });
      }

      // Prevent updating archived events (unless un-archiving)
      if (existingEvent.status === 'ARCHIVED' && updateData.status !== 'RESOLVED') {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Cannot update an archived event',
        });
      }

      // If status is being set to RESOLVED, set resolvedAt
      const additionalData: { resolvedAt?: Date } = {};
      if (updateData.status === 'RESOLVED' && existingEvent.status !== 'RESOLVED') {
        additionalData.resolvedAt = new Date();
      }

      // Update the event
      const event = await prisma.event.update({
        where: { id },
        data: {
          ...updateData,
          ...additionalData,
          affectedAreaGeoJson: updateData.affectedAreaGeoJson as object | undefined,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      // Broadcast event update via Socket.io
      await fastify.publishEvent('events:updated', {
        event: {
          id: event.id,
          name: event.name,
          type: event.type,
          severity: event.severity,
          status: event.status,
          locationLat: event.locationLat,
          locationLng: event.locationLng,
          locationName: event.locationName,
          isPublic: event.isPublic,
          requiresEvacuation: event.requiresEvacuation,
          updatedAt: event.updatedAt,
        },
        previousStatus: existingEvent.status,
      });

      fastify.log.info({ eventId: event.id, eventName: event.name }, 'Event updated');

      return reply.status(200).send({
        statusCode: 200,
        message: 'Event updated successfully',
        data: { event },
      });
    }
  );

  /**
   * DELETE /api/v1/events/:id
   * Close/archive an event
   * Requires EMS authentication
   */
  fastify.delete(
    '/:id',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Validate params
      const paramResult = eventIdParamSchema.safeParse(request.params);
      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid event ID',
          details: paramResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const { userId } = (request as AuthenticatedRequest).user;

      // Get the existing event
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { id: true, clientId: true, status: true, name: true },
      });

      if (!existingEvent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Event not found',
        });
      }

      // Verify EMS user has access (same client or event is global)
      const emsUser = await prisma.eMSUser.findUnique({
        where: { id: userId },
        select: { id: true, clientId: true },
      });

      if (!emsUser) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'User not found',
        });
      }

      // If event has a clientId, verify user belongs to same client
      if (existingEvent.clientId && existingEvent.clientId !== emsUser.clientId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have access to this event',
        });
      }

      // Archive the event (soft delete)
      // We don't hard delete to preserve historical data
      const event = await prisma.event.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          resolvedAt: existingEvent.status !== 'RESOLVED' ? new Date() : undefined,
        },
        select: {
          id: true,
          name: true,
          status: true,
          resolvedAt: true,
          updatedAt: true,
        },
      });

      // Deactivate all workspaces for this event
      await prisma.eventWorkspace.updateMany({
        where: { eventId: id },
        data: { isActive: false },
      });

      // Broadcast event archival via Socket.io
      await fastify.publishEvent('events:archived', {
        eventId: event.id,
        eventName: event.name,
        archivedAt: event.updatedAt,
      });

      fastify.log.info({ eventId: event.id, eventName: event.name }, 'Event archived');

      return reply.status(200).send({
        statusCode: 200,
        message: 'Event archived successfully',
        data: { event },
      });
    }
  );
}

export default eventsRoutes;
