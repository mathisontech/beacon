import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireEMS, optionalAuth, type AuthenticatedRequest, type OptionalAuthRequest } from '../auth/middleware.js';
import { notificationRoutes } from './notifications.js';
import {
  listAlertsQuerySchema,
  createAlertSchema,
  updateAlertSchema,
  alertIdParamSchema,
  personalAlertsQuerySchema,
  proximityCheckSchema,
  type ListAlertsQuery,
  type CreateAlertInput,
  type UpdateAlertInput,
  type AlertIdParam,
  type PersonalAlertsQuery,
  type ProximityCheckInput,
} from './schemas.js';
import {
  checkTrajectoryIntersections,
  getIntersectingAlerts,
  filterBySeverity,
  type AlertZone,
} from './proximity.js';

/**
 * Helper to parse bounding box coordinates for database queries
 */
function buildBboxFilter(bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }) {
  return {
    AND: [
      { targetLocationLat: { gte: bbox.minLat } },
      { targetLocationLat: { lte: bbox.maxLat } },
      { targetLocationLng: { gte: bbox.minLng } },
      { targetLocationLng: { lte: bbox.maxLng } },
    ],
  };
}

/**
 * Helper to map severity string to numeric priority for sorting
 */
const SEVERITY_ORDER: Record<string, number> = {
  MINOR: 1,
  MODERATE: 2,
  SEVERE: 3,
  EXTREME: 4,
  CATASTROPHIC: 5,
};

/**
 * Alert routes for hazard alert management
 * Mounted at /api/v1/alerts
 */
export async function alertRoutes(fastify: FastifyInstance): Promise<void> {
  // Register notification sub-routes
  fastify.register(notificationRoutes, { prefix: '/notifications' });

  /**
   * GET /api/v1/alerts
   * Get all alerts with optional filters
   */
  fastify.get(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = listAlertsQuerySchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query: ListAlertsQuery = parseResult.data;

      // Build where clause
      const where: Prisma.AlertWhereInput = {};

      // Active filter
      if (query.isActive !== undefined) {
        where.isActive = query.isActive;
      }

      // Bounding box filter
      if (query.bbox) {
        Object.assign(where, buildBboxFilter(query.bbox));
      }

      // Alert type filter
      if (query.types && query.types.length > 0) {
        where.alertType = { in: query.types as Prisma.EnumAlertTypeFilter['in'] };
      }

      // Severity filter
      if (query.severity && query.severity.length > 0) {
        where.severity = { in: query.severity as Prisma.EnumSeverityFilter['in'] };
      }

      // Source filter
      if (query.source) {
        where.source = query.source;
      }

      // Event filter
      if (query.eventId) {
        where.eventId = query.eventId;
      }

      // Client filter
      if (query.clientId) {
        where.clientId = query.clientId;
      }

      // Time filters
      if (query.effectiveAfter) {
        where.effectiveAt = { gte: query.effectiveAfter };
      }
      if (query.effectiveBefore) {
        where.effectiveAt = {
          ...(where.effectiveAt as Record<string, unknown> || {}),
          lte: query.effectiveBefore,
        };
      }

      // Get total count for pagination
      const totalCount = await prisma.alert.count({ where });

      // Calculate pagination
      const skip = (query.page - 1) * query.limit;
      const totalPages = Math.ceil(totalCount / query.limit);

      // Build orderBy
      const orderBy: Prisma.AlertOrderByWithRelationInput = {};
      if (query.sortBy === 'severity') {
        // For severity, we'll sort in the application layer
        orderBy.createdAt = 'desc';
      } else {
        orderBy[query.sortBy] = query.sortOrder;
      }

      // Fetch alerts
      let alerts = await prisma.alert.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Sort by severity if requested
      if (query.sortBy === 'severity') {
        alerts = alerts.sort((a, b) => {
          const aOrder = SEVERITY_ORDER[a.severity] ?? 0;
          const bOrder = SEVERITY_ORDER[b.severity] ?? 0;
          return query.sortOrder === 'desc' ? bOrder - aOrder : aOrder - bOrder;
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: {
          alerts,
          pagination: {
            page: query.page,
            limit: query.limit,
            totalCount,
            totalPages,
            hasMore: query.page < totalPages,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/alerts/personal
   * Get alerts relevant to the current user's location and subscribed zones
   */
  fastify.get(
    '/personal',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Personal alerts are only available for public users',
        });
      }

      const parseResult = personalAlertsQuerySchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query: PersonalAlertsQuery = parseResult.data;

      // Get user's profile for home location and notification radius
      const user = await prisma.publicUser.findUnique({
        where: { id: userId },
        select: {
          homeLocationLat: true,
          homeLocationLng: true,
          homeZipCode: true,
          notificationRadius: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      // Determine location to use (provided or home location)
      const lat = query.lat ?? user.homeLocationLat;
      const lng = query.lng ?? user.homeLocationLng;
      const radiusMiles = user.notificationRadius ?? 25;

      // Build base where clause
      const baseWhere: Prisma.AlertWhereInput = {
        isActive: query.isActive,
        OR: [] as Prisma.AlertWhereInput[],
      };

      // Add location-based filter if we have coordinates
      if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
        // Calculate bounding box for radius
        // Approximate: 1 degree latitude = 69 miles, 1 degree longitude varies
        const latDelta = radiusMiles / 69;
        const lngDelta = radiusMiles / (69 * Math.cos((lat * Math.PI) / 180));

        (baseWhere.OR as Prisma.AlertWhereInput[]).push({
          AND: [
            { targetLocationLat: { gte: lat - latDelta, lte: lat + latDelta } },
            { targetLocationLng: { gte: lng - lngDelta, lte: lng + lngDelta } },
          ],
        });
      }

      // Add zip code filter if available
      if (query.includeSubscribed && user.homeZipCode) {
        (baseWhere.OR as Prisma.AlertWhereInput[]).push({
          targetZipCodes: { has: user.homeZipCode },
        });
      }

      // If no filters could be applied, return empty result
      if ((baseWhere.OR as Prisma.AlertWhereInput[]).length === 0) {
        return reply.status(200).send({
          statusCode: 200,
          data: {
            alerts: [],
            message: 'No location information available. Please update your profile or provide coordinates.',
          },
        });
      }

      // Fetch alerts
      const alerts = await prisma.alert.findMany({
        where: baseWhere,
        orderBy: [{ severity: 'desc' }, { effectiveAt: 'desc' }],
        take: query.limit,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      });

      // Sort by severity priority
      const sortedAlerts = alerts.sort((a, b) => {
        const aOrder = SEVERITY_ORDER[a.severity] ?? 0;
        const bOrder = SEVERITY_ORDER[b.severity] ?? 0;
        return bOrder - aOrder;
      });

      return reply.status(200).send({
        statusCode: 200,
        data: {
          alerts: sortedAlerts,
          locationUsed: lat !== null && lng !== null ? { lat, lng, radiusMiles } : null,
          zipCodeUsed: user.homeZipCode ?? null,
        },
      });
    }
  );

  /**
   * POST /api/v1/alerts/proximity
   * Check if user's trajectory will intersect with hazard zones
   */
  fastify.post(
    '/proximity',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = proximityCheckSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const input: ProximityCheckInput = parseResult.data;

      // Calculate a rough bounding box for the maximum projected distance
      // to limit the initial database query
      const maxMinutes = Math.max(...input.projectionMinutes);
      const maxDistanceMeters = input.speed * maxMinutes * 60;
      const maxDistanceMiles = maxDistanceMeters / 1609.34;

      // Calculate bounding box (generous to account for all directions)
      const latDelta = maxDistanceMiles / 69;
      const lngDelta = maxDistanceMiles / (69 * Math.cos((input.lat * Math.PI) / 180));

      // Fetch active alerts in the potential path area
      const alerts = await prisma.alert.findMany({
        where: {
          isActive: true,
          OR: [
            // Circle-based alerts in bounding box
            {
              AND: [
                { targetLocationLat: { gte: input.lat - latDelta - 0.5 } },
                { targetLocationLat: { lte: input.lat + latDelta + 0.5 } },
                { targetLocationLng: { gte: input.lng - lngDelta - 0.5 } },
                { targetLocationLng: { lte: input.lng + lngDelta + 0.5 } },
              ],
            },
            // Polygon-based alerts (check all, filter later)
            {
              targetAreaGeoJson: { not: Prisma.JsonNull },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          severity: true,
          alertType: true,
          targetLocationLat: true,
          targetLocationLng: true,
          targetRadiusMiles: true,
          targetAreaGeoJson: true,
          targetZipCodes: true,
        },
      });

      // Convert alerts to AlertZone format for proximity checking
      const alertZones: AlertZone[] = alerts.map((alert) => {
        const zone: AlertZone = {
          id: alert.id,
          title: alert.title,
          severity: alert.severity,
          alertType: alert.alertType,
        };

        // Add circle if present
        if (
          alert.targetLocationLat !== null &&
          alert.targetLocationLng !== null &&
          alert.targetRadiusMiles !== null
        ) {
          zone.centerLat = alert.targetLocationLat;
          zone.centerLng = alert.targetLocationLng;
          zone.radiusMiles = alert.targetRadiusMiles;
        }

        // Add polygon if present
        if (alert.targetAreaGeoJson) {
          const geoJson = alert.targetAreaGeoJson as { type: string; coordinates: unknown };
          if (geoJson.type === 'Polygon') {
            zone.polygon = geoJson.coordinates as Array<Array<[number, number]>>;
          } else if (geoJson.type === 'MultiPolygon') {
            // For MultiPolygon, use the first polygon
            const multiCoords = geoJson.coordinates as Array<Array<Array<[number, number]>>>;
            if (multiCoords.length > 0) {
              zone.polygon = multiCoords[0];
            }
          }
        }

        // Add zip codes
        if (alert.targetZipCodes && alert.targetZipCodes.length > 0) {
          zone.zipCodes = alert.targetZipCodes;
        }

        return zone;
      });

      // Check trajectory intersections
      let results = checkTrajectoryIntersections(
        input.lat,
        input.lng,
        input.heading,
        input.speed,
        input.projectionMinutes,
        alertZones
      );

      // Filter by minimum severity if specified
      if (input.minSeverity) {
        results = filterBySeverity(results, input.minSeverity);
      }

      // Get only intersecting alerts
      const intersecting = getIntersectingAlerts(results);

      return reply.status(200).send({
        statusCode: 200,
        data: {
          trajectory: {
            currentPosition: { lat: input.lat, lng: input.lng },
            heading: input.heading,
            speedMps: input.speed,
            projectionMinutes: input.projectionMinutes,
          },
          totalAlertsChecked: alertZones.length,
          hazardsInPath: intersecting.length,
          warnings: intersecting,
          allResults: results,
        },
      });
    }
  );

  /**
   * GET /api/v1/alerts/:id
   * Get a specific alert by ID
   */
  fastify.get(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = alertIdParamSchema.safeParse(request.params);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid alert ID',
          details: parseResult.error.flatten(),
        });
      }

      const { id } = parseResult.data as AlertIdParam;

      const alert = await prisma.alert.findUnique({
        where: { id },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
              severity: true,
              status: true,
              locationName: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          createdByAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              notifications: true,
            },
          },
        },
      });

      if (!alert) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Alert not found',
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: { alert },
      });
    }
  );

  /**
   * POST /api/v1/alerts
   * Create a new alert (EMS users only)
   */
  fastify.post(
    '/',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = (request as AuthenticatedRequest).user;

      const parseResult = createAlertSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const input: CreateAlertInput = parseResult.data;

      // Get EMS user's client ID for association
      const emsUser = await prisma.eMSUser.findUnique({
        where: { id: userId },
        select: { clientId: true },
      });

      if (!emsUser) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'EMS user not found',
        });
      }

      // Create the alert
      const alert = await prisma.alert.create({
        data: {
          title: input.title,
          message: input.message,
          alertType: input.alertType,
          source: input.source,
          severity: input.severity,

          targetLocationLat: input.targetLocationLat,
          targetLocationLng: input.targetLocationLng,
          targetRadiusMiles: input.targetRadiusMiles,
          targetAreaGeoJson: input.targetAreaGeoJson ?? Prisma.JsonNull,
          targetZipCodes: input.targetZipCodes ?? [],

          externalId: input.externalId,
          externalUrl: input.externalUrl,

          effectiveAt: input.effectiveAt ?? new Date(),
          expiresAt: input.expiresAt,

          isActive: input.isActive,

          eventId: input.eventId,
          clientId: input.clientId ?? emsUser.clientId,
        },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      // Publish alert to Redis for real-time distribution
      try {
        await fastify.publishEvent('alerts:broadcast', {
          alertId: alert.id,
          title: alert.title,
          alertType: alert.alertType,
          severity: alert.severity,
          zipCodes: alert.targetZipCodes,
          location:
            alert.targetLocationLat && alert.targetLocationLng
              ? { lat: alert.targetLocationLat, lng: alert.targetLocationLng }
              : null,
        });
      } catch (err) {
        fastify.log.error({ err, alertId: alert.id }, 'Failed to publish alert to Redis');
      }

      return reply.status(201).send({
        statusCode: 201,
        message: 'Alert created successfully',
        data: { alert },
      });
    }
  );

  /**
   * PUT /api/v1/alerts/:id
   * Update an existing alert (EMS users only)
   */
  fastify.put(
    '/:id',
    { preHandler: requireEMS },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = alertIdParamSchema.safeParse(request.params);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid alert ID',
          details: paramResult.error.flatten(),
        });
      }

      const { id } = paramResult.data as AlertIdParam;

      const bodyResult = updateAlertSchema.safeParse(request.body);

      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const input: UpdateAlertInput = bodyResult.data;

      // Check if alert exists
      const existingAlert = await prisma.alert.findUnique({
        where: { id },
      });

      if (!existingAlert) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Alert not found',
        });
      }

      // Build update data
      const updateData: Prisma.AlertUpdateInput = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.message !== undefined) updateData.message = input.message;
      if (input.alertType !== undefined) updateData.alertType = input.alertType;
      if (input.severity !== undefined) updateData.severity = input.severity;
      if (input.targetLocationLat !== undefined) updateData.targetLocationLat = input.targetLocationLat;
      if (input.targetLocationLng !== undefined) updateData.targetLocationLng = input.targetLocationLng;
      if (input.targetRadiusMiles !== undefined) updateData.targetRadiusMiles = input.targetRadiusMiles;
      if (input.targetAreaGeoJson !== undefined) updateData.targetAreaGeoJson = input.targetAreaGeoJson;
      if (input.targetZipCodes !== undefined) updateData.targetZipCodes = input.targetZipCodes;
      if (input.externalUrl !== undefined) updateData.externalUrl = input.externalUrl;
      if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      // Update the alert
      const alert = await prisma.alert.update({
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
        },
      });

      // Publish update to Redis if alert is still active
      if (alert.isActive) {
        try {
          await fastify.publishEvent('alerts:broadcast', {
            alertId: alert.id,
            title: alert.title,
            alertType: alert.alertType,
            severity: alert.severity,
            isUpdate: true,
            zipCodes: alert.targetZipCodes,
          });
        } catch (err) {
          fastify.log.error({ err, alertId: alert.id }, 'Failed to publish alert update to Redis');
        }
      }

      return reply.status(200).send({
        statusCode: 200,
        message: 'Alert updated successfully',
        data: { alert },
      });
    }
  );
}
