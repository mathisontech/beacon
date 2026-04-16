import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthenticatedRequest } from '../auth/middleware.js';
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
  type ListNotificationsQuery,
  type NotificationIdParam,
} from './schemas.js';

/**
 * Notification routes for user notification management
 * Mounted at /api/v1/notifications
 */
export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/notifications
   * Get current user's notifications with optional filters
   */
  fastify.get(
    '/',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Only public users have notifications
      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Notifications are only available for public users',
        });
      }

      const parseResult = listNotificationsQuerySchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query: ListNotificationsQuery = parseResult.data;

      // Build where clause
      const where: Record<string, unknown> = {
        userId,
      };

      // Filter by read status
      if (query.isRead !== undefined) {
        if (query.isRead) {
          where.readAt = { not: null };
        } else {
          where.readAt = null;
        }
      }

      // Filter by notification type
      if (query.type) {
        where.type = query.type;
      }

      // Filter by date
      if (query.since) {
        where.createdAt = { gte: query.since };
      }

      // Get total count for pagination
      const totalCount = await prisma.userNotification.count({ where });

      // Calculate pagination
      const skip = (query.page - 1) * query.limit;
      const totalPages = Math.ceil(totalCount / query.limit);

      // Fetch notifications
      const notifications = await prisma.userNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: {
          alert: {
            select: {
              id: true,
              title: true,
              alertType: true,
              severity: true,
            },
          },
          sentByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Count unread notifications
      const unreadCount = await prisma.userNotification.count({
        where: {
          userId,
          readAt: null,
        },
      });

      return reply.status(200).send({
        statusCode: 200,
        data: {
          notifications,
          unreadCount,
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
   * PUT /api/v1/notifications/:id/read
   * Mark a specific notification as read
   */
  fastify.put(
    '/:id/read',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Notifications are only available for public users',
        });
      }

      const parseResult = notificationIdParamSchema.safeParse(request.params);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid notification ID',
          details: parseResult.error.flatten(),
        });
      }

      const { id } = parseResult.data as NotificationIdParam;

      // Find the notification and verify ownership
      const notification = await prisma.userNotification.findUnique({
        where: { id },
      });

      if (!notification) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Notification not found',
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to access this notification',
        });
      }

      // Update the read timestamp
      const updatedNotification = await prisma.userNotification.update({
        where: { id },
        data: { readAt: new Date() },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Notification marked as read',
        data: { notification: updatedNotification },
      });
    }
  );

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read for the current user
   */
  fastify.put(
    '/read-all',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Notifications are only available for public users',
        });
      }

      // Update all unread notifications for this user
      const result = await prisma.userNotification.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'All notifications marked as read',
        data: { updatedCount: result.count },
      });
    }
  );

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a specific notification
   */
  fastify.delete(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Notifications are only available for public users',
        });
      }

      const parseResult = notificationIdParamSchema.safeParse(request.params);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid notification ID',
          details: parseResult.error.flatten(),
        });
      }

      const { id } = parseResult.data as NotificationIdParam;

      // Find the notification and verify ownership
      const notification = await prisma.userNotification.findUnique({
        where: { id },
      });

      if (!notification) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Notification not found',
        });
      }

      if (notification.userId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to delete this notification',
        });
      }

      // Delete the notification
      await prisma.userNotification.delete({
        where: { id },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Notification deleted successfully',
      });
    }
  );
}

export default notificationRoutes;
