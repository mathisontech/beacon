import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AccessLevel } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireEMS } from '../auth/middleware.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';
import {
  createWorkspaceSchema,
  inviteToWorkspaceSchema,
  updateWorkspaceAccessSchema,
  eventIdParamSchema,
  type CreateWorkspaceInput,
  type InviteToWorkspaceInput,
  type UpdateWorkspaceAccessInput,
  type EventIdParam,
} from './schemas.js';

/**
 * Multi-agency workspace routes for event coordination
 */
export async function workspaceRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/events/:id/workspace
   * Create a new workspace for multi-agency coordination
   * Requires EMS authentication
   */
  fastify.post(
    '/:id/workspace',
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
      const bodyResult = createWorkspaceSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: eventId } = paramResult.data;
      const { name, description, groupId } = bodyResult.data;
      const { userId } = (request as AuthenticatedRequest).user;

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, clientId: true, name: true },
      });

      if (!event) {
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
      if (event.clientId && event.clientId !== emsUser.clientId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have access to this event',
        });
      }

      // If groupId is provided, verify it exists and belongs to user's client
      if (groupId) {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          select: { id: true, clientId: true },
        });

        if (!group) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Group not found',
          });
        }

        if (group.clientId !== emsUser.clientId) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'You do not have access to this group',
          });
        }
      }

      // Create workspace with creator as ADMIN participant
      const workspace = await prisma.eventWorkspace.create({
        data: {
          name,
          description,
          eventId,
          groupId,
          participants: {
            create: {
              emsUserId: userId,
              accessLevel: 'ADMIN',
              isActive: true,
            },
          },
        },
        include: {
          participants: {
            include: {
              emsUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      // Broadcast workspace creation via Socket.io
      await fastify.publishEvent('events:workspace:created', {
        eventId,
        workspace: {
          id: workspace.id,
          name: workspace.name,
          eventId,
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        message: 'Workspace created successfully',
        data: { workspace },
      });
    }
  );

  /**
   * GET /api/v1/events/:id/workspace
   * Get workspace details for an event
   * Requires authentication (EMS or public user if they're a participant)
   */
  fastify.get(
    '/:id/workspace',
    { preHandler: requireAuth },
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

      const { id: eventId } = paramResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, clientId: true },
      });

      if (!event) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Event not found',
        });
      }

      // Build filter based on user type and access
      const userFilter = userType === 'ems'
        ? { emsUserId: userId, isActive: true }
        : { publicUserId: userId, isActive: true };

      // Get workspaces for this event that user has access to
      const workspaces = await prisma.eventWorkspace.findMany({
        where: {
          eventId,
          isActive: true,
          participants: {
            some: userFilter,
          },
        },
        include: {
          participants: {
            where: { isActive: true },
            include: {
              emsUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
              publicUser: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  displayName: true,
                },
              },
            },
          },
          group: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          _count: {
            select: {
              mapTags: true,
            },
          },
        },
      });

      // If user is EMS and in the same client, show all workspaces for the event
      if (userType === 'ems') {
        const emsUser = await prisma.eMSUser.findUnique({
          where: { id: userId },
          select: { clientId: true },
        });

        if (emsUser && (!event.clientId || event.clientId === emsUser.clientId)) {
          const allWorkspaces = await prisma.eventWorkspace.findMany({
            where: {
              eventId,
              isActive: true,
            },
            include: {
              participants: {
                where: { isActive: true },
                include: {
                  emsUser: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      role: true,
                    },
                  },
                  publicUser: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      displayName: true,
                    },
                  },
                },
              },
              group: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
              _count: {
                select: {
                  mapTags: true,
                },
              },
            },
          });

          return reply.status(200).send({
            statusCode: 200,
            data: { workspaces: allWorkspaces },
          });
        }
      }

      return reply.status(200).send({
        statusCode: 200,
        data: { workspaces },
      });
    }
  );

  /**
   * POST /api/v1/events/:id/workspace/invite
   * Invite another user to a workspace
   * Requires EMS authentication with MANAGER or ADMIN access to workspace
   */
  fastify.post(
    '/:id/workspace/invite',
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
      const bodyResult = inviteToWorkspaceSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: eventId } = paramResult.data;
      const { emsUserId, publicUserId, accessLevel } = bodyResult.data as InviteToWorkspaceInput;
      const { userId } = (request as AuthenticatedRequest).user;

      // Get workspaceId from query if provided, otherwise use first workspace for event
      const workspaceId = (request.query as { workspaceId?: string })?.workspaceId;

      // Find the workspace
      const workspaceQuery = workspaceId
        ? { id: workspaceId, eventId, isActive: true }
        : { eventId, isActive: true };

      const workspace = await prisma.eventWorkspace.findFirst({
        where: workspaceQuery,
        include: {
          participants: {
            where: { isActive: true },
          },
        },
      });

      if (!workspace) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Workspace not found',
        });
      }

      // Verify current user has MANAGER or ADMIN access
      const currentUserParticipant = workspace.participants.find(
        (p) => p.emsUserId === userId
      );

      if (!currentUserParticipant || !['MANAGER', 'ADMIN'].includes(currentUserParticipant.accessLevel)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to invite users to this workspace',
        });
      }

      // Verify the invitee exists
      if (emsUserId) {
        const invitee = await prisma.eMSUser.findUnique({
          where: { id: emsUserId },
          select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (!invitee) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'EMS user not found',
          });
        }

        // Check if already a participant
        const existingParticipant = await prisma.workspaceParticipant.findFirst({
          where: {
            workspaceId: workspace.id,
            emsUserId,
          },
        });

        if (existingParticipant) {
          // Reactivate if inactive
          if (!existingParticipant.isActive) {
            const updated = await prisma.workspaceParticipant.update({
              where: { id: existingParticipant.id },
              data: {
                isActive: true,
                accessLevel,
                leftAt: null,
              },
            });

            return reply.status(200).send({
              statusCode: 200,
              message: 'User re-invited to workspace',
              data: { participant: updated },
            });
          }

          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'User is already a participant in this workspace',
          });
        }

        // Create participant
        const participant = await prisma.workspaceParticipant.create({
          data: {
            workspaceId: workspace.id,
            emsUserId,
            accessLevel,
            isActive: true,
          },
          include: {
            emsUser: {
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

        // Broadcast invitation via Socket.io
        await fastify.publishEvent('events:workspace:invite', {
          eventId,
          workspaceId: workspace.id,
          invitedUserId: emsUserId,
          invitedUserType: 'ems',
        });

        return reply.status(201).send({
          statusCode: 201,
          message: 'User invited to workspace',
          data: { participant },
        });
      }

      // Handle public user invitation
      if (publicUserId) {
        const invitee = await prisma.publicUser.findUnique({
          where: { id: publicUserId },
          select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (!invitee) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Public user not found',
          });
        }

        // Check if already a participant
        const existingParticipant = await prisma.workspaceParticipant.findFirst({
          where: {
            workspaceId: workspace.id,
            publicUserId,
          },
        });

        if (existingParticipant) {
          // Reactivate if inactive
          if (!existingParticipant.isActive) {
            const updated = await prisma.workspaceParticipant.update({
              where: { id: existingParticipant.id },
              data: {
                isActive: true,
                accessLevel,
                leftAt: null,
              },
            });

            return reply.status(200).send({
              statusCode: 200,
              message: 'User re-invited to workspace',
              data: { participant: updated },
            });
          }

          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'User is already a participant in this workspace',
          });
        }

        // Create participant
        const participant = await prisma.workspaceParticipant.create({
          data: {
            workspaceId: workspace.id,
            publicUserId,
            accessLevel,
            isActive: true,
          },
          include: {
            publicUser: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        });

        // Broadcast invitation via Socket.io
        await fastify.publishEvent('events:workspace:invite', {
          eventId,
          workspaceId: workspace.id,
          invitedUserId: publicUserId,
          invitedUserType: 'public',
        });

        return reply.status(201).send({
          statusCode: 201,
          message: 'User invited to workspace',
          data: { participant },
        });
      }

      // Should never reach here due to schema validation
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Either emsUserId or publicUserId must be provided',
      });
    }
  );

  /**
   * PUT /api/v1/events/:id/workspace/access
   * Update a participant's access level or deactivate them
   * Requires EMS authentication with ADMIN access to workspace
   */
  fastify.put(
    '/:id/workspace/access',
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
      const bodyResult = updateWorkspaceAccessSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: eventId } = paramResult.data;
      const { participantId, accessLevel, isActive } = bodyResult.data as UpdateWorkspaceAccessInput;
      const { userId } = (request as AuthenticatedRequest).user;

      // Find the participant and their workspace
      const targetParticipant = await prisma.workspaceParticipant.findUnique({
        where: { id: participantId },
        include: {
          workspace: {
            select: {
              id: true,
              eventId: true,
              isActive: true,
            },
          },
        },
      });

      if (!targetParticipant) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Participant not found',
        });
      }

      // Verify workspace belongs to the event
      if (targetParticipant.workspace.eventId !== eventId) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Participant does not belong to a workspace for this event',
        });
      }

      // Verify current user has ADMIN access to the workspace
      const currentUserParticipant = await prisma.workspaceParticipant.findFirst({
        where: {
          workspaceId: targetParticipant.workspace.id,
          emsUserId: userId,
          isActive: true,
        },
      });

      if (!currentUserParticipant || currentUserParticipant.accessLevel !== 'ADMIN') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to update access in this workspace',
        });
      }

      // Prevent removing yourself as the only admin
      if (participantId === currentUserParticipant.id && (accessLevel !== 'ADMIN' || isActive === false)) {
        const adminCount = await prisma.workspaceParticipant.count({
          where: {
            workspaceId: targetParticipant.workspace.id,
            accessLevel: 'ADMIN',
            isActive: true,
          },
        });

        if (adminCount <= 1) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Cannot remove or demote the last admin of the workspace',
          });
        }
      }

      // Build update data
      const updateData: { accessLevel?: AccessLevel; isActive?: boolean; leftAt?: Date | null } = {};
      if (accessLevel !== undefined) {
        updateData.accessLevel = accessLevel as AccessLevel;
      }
      if (isActive !== undefined) {
        updateData.isActive = isActive;
        updateData.leftAt = isActive ? null : new Date();
      }

      // Update the participant
      const updated = await prisma.workspaceParticipant.update({
        where: { id: participantId },
        data: updateData,
        include: {
          emsUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          publicUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
        },
      });

      // Broadcast access update via Socket.io
      await fastify.publishEvent('events:workspace:access', {
        eventId,
        workspaceId: targetParticipant.workspace.id,
        participantId,
        accessLevel: updated.accessLevel,
        isActive: updated.isActive,
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Participant access updated successfully',
        data: { participant: updated },
      });
    }
  );
}

export default workspaceRoutes;
