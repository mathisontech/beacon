import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../auth/middleware.js';
import { requireAuth, optionalAuth } from '../auth/middleware.js';
import {
  createTagSchema,
  updateTagSchema,
  queryTagsSchema,
  confirmTagSchema,
  updateTagStatusSchema,
  tagIdParamsSchema,
  type CreateTagInput,
  type UpdateTagInput,
  type QueryTagsInput,
  type ConfirmTagInput,
  type UpdateTagStatusInput,
  type TagIdParams,
} from './schemas.js';
import {
  calculateCredence,
  getCredenceLabel,
  isTrustedCreator,
  type CredenceInput,
} from './credence.js';
import type { TagVisibility, CreatorType, VerificationLevel, Prisma } from '@prisma/client';

// Type for tag with computed credence
interface TagWithCredence {
  id: string;
  title: string;
  description: string | null;
  creatorType: CreatorType;
  tagType: string;
  visibility: TagVisibility;
  status: string;
  locationLat: number;
  locationLng: number;
  locationAddress: string | null;
  radiusMeters: number | null;
  imageUrls: string[];
  externalUrl: string | null;
  validFrom: Date;
  validUntil: Date | null;
  confirmationCount: number;
  disputeCount: number;
  createdAt: Date;
  updatedAt: Date;
  eventId: string | null;
  workspaceId: string | null;
  credence: {
    score: number;
    label: string;
    isTrusted: boolean;
  };
  creator?: {
    id: string;
    displayName: string | null;
    verificationLevel?: VerificationLevel;
  } | null;
}

/**
 * Get the creator verification level for credence calculation
 */
async function getCreatorVerificationLevel(
  creatorType: CreatorType,
  createdByPublicId: string | null
): Promise<VerificationLevel | null> {
  if (creatorType !== 'PUBLIC_USER' || !createdByPublicId) {
    return null;
  }

  const publicUser = await prisma.publicUser.findUnique({
    where: { id: createdByPublicId },
    select: { verificationLevel: true },
  });

  return publicUser?.verificationLevel ?? null;
}

/**
 * Compute credence for a tag
 */
function computeTagCredence(
  creatorType: CreatorType,
  confirmationCount: number,
  disputeCount: number,
  creatorVerificationLevel: VerificationLevel | null
): TagWithCredence['credence'] {
  const credenceInput: CredenceInput = {
    creatorType,
    confirmationCount,
    disputeCount,
    creatorVerificationLevel,
  };

  const result = calculateCredence(credenceInput);

  return {
    score: result.score,
    label: getCredenceLabel(result.score),
    isTrusted: result.isTrusted,
  };
}

/**
 * Determine visibility for a new tag based on creator type
 */
function getDefaultVisibility(creatorType: CreatorType, requestedVisibility?: TagVisibility): TagVisibility {
  // If visibility is explicitly requested, use it (with permission checks elsewhere)
  if (requestedVisibility) {
    return requestedVisibility;
  }

  // EMS users default to RESPONDERS_ONLY
  if (creatorType === 'EMS_USER') {
    return 'RESPONDERS_ONLY';
  }

  // Admin and System default to PUBLIC
  if (creatorType === 'ADMIN_USER' || creatorType === 'SYSTEM') {
    return 'PUBLIC';
  }

  // Public users default to PUBLIC
  return 'PUBLIC';
}

/**
 * Check if user can view a tag based on visibility rules
 */
function canViewTag(
  tagVisibility: TagVisibility,
  userType: 'ems' | 'public' | null,
  isCreator: boolean
): boolean {
  // Creators can always see their own tags
  if (isCreator) {
    return true;
  }

  // EMS users can see all tags
  if (userType === 'ems') {
    return true;
  }

  // Public users can only see PUBLIC tags
  if (tagVisibility === 'PUBLIC') {
    return true;
  }

  return false;
}

/**
 * Broadcast tag event via Socket.io
 */
async function broadcastTagEvent(
  fastify: FastifyInstance,
  eventType: 'tag:created' | 'tag:updated' | 'tag:deleted' | 'tag:confirmed',
  tag: TagWithCredence,
  eventId?: string | null
): Promise<void> {
  try {
    const channel = eventId ? `tags:event:${eventId}` : 'tags:broadcast';
    await fastify.publishEvent(channel, {
      type: eventType,
      tag,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log but don't fail the request if broadcast fails
    fastify.log.error({ error, eventType, tagId: tag.id }, 'Failed to broadcast tag event');
  }
}

export async function tagRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/v1/tags
   * Create a new map tag
   */
  fastify.post(
    '/',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = createTagSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const { userId, userType } = (request as AuthenticatedRequest).user;
      const input: CreateTagInput = parseResult.data;

      // Determine creator type
      const creatorType: CreatorType = userType === 'ems' ? 'EMS_USER' : 'PUBLIC_USER';

      // Determine visibility
      const visibility = getDefaultVisibility(creatorType, input.visibility as TagVisibility | undefined);

      // Validate visibility permissions (public users cannot create non-public tags)
      if (userType === 'public' && visibility !== 'PUBLIC') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Public users can only create public tags',
        });
      }

      // Verify event exists if provided
      if (input.eventId) {
        const event = await prisma.event.findUnique({
          where: { id: input.eventId },
          select: { id: true },
        });

        if (!event) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Event not found',
          });
        }
      }

      // Verify workspace exists if provided
      if (input.workspaceId) {
        const workspace = await prisma.eventWorkspace.findUnique({
          where: { id: input.workspaceId },
          select: { id: true },
        });

        if (!workspace) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Workspace not found',
          });
        }
      }

      // Get verification level for public users
      let creatorVerificationLevel: VerificationLevel | null = null;
      if (userType === 'public') {
        const publicUser = await prisma.publicUser.findUnique({
          where: { id: userId },
          select: { verificationLevel: true },
        });
        creatorVerificationLevel = publicUser?.verificationLevel ?? null;
      }

      // Create tag data
      const tagData: Prisma.MapTagCreateInput = {
        title: input.title,
        description: input.description,
        tagType: input.tagType,
        visibility,
        status: isTrustedCreator(creatorType) ? 'VERIFIED' : 'UNVERIFIED',
        creatorType,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
        locationAddress: input.locationAddress,
        radiusMeters: input.radiusMeters,
        imageUrls: input.imageUrls ?? [],
        externalUrl: input.externalUrl,
        validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        confirmationCount: 0,
        disputeCount: 0,
        ...(input.eventId && { event: { connect: { id: input.eventId } } }),
        ...(input.workspaceId && { workspace: { connect: { id: input.workspaceId } } }),
        ...(userType === 'ems'
          ? { createdByEMS: { connect: { id: userId } } }
          : { createdByPublic: { connect: { id: userId } } }),
      };

      // Create the tag
      const tag = await prisma.mapTag.create({
        data: tagData,
        include: {
          createdByPublic: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              verificationLevel: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Compute credence
      const credence = computeTagCredence(
        tag.creatorType,
        tag.confirmationCount,
        tag.disputeCount,
        creatorVerificationLevel
      );

      // Format response
      const responseTag: TagWithCredence = {
        id: tag.id,
        title: tag.title,
        description: tag.description,
        creatorType: tag.creatorType,
        tagType: tag.tagType,
        visibility: tag.visibility,
        status: tag.status,
        locationLat: tag.locationLat,
        locationLng: tag.locationLng,
        locationAddress: tag.locationAddress,
        radiusMeters: tag.radiusMeters,
        imageUrls: tag.imageUrls,
        externalUrl: tag.externalUrl,
        validFrom: tag.validFrom,
        validUntil: tag.validUntil,
        confirmationCount: tag.confirmationCount,
        disputeCount: tag.disputeCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        eventId: tag.eventId,
        workspaceId: tag.workspaceId,
        credence,
        creator: tag.createdByPublic
          ? {
              id: tag.createdByPublic.id,
              displayName: tag.createdByPublic.displayName ?? tag.createdByPublic.firstName,
              verificationLevel: tag.createdByPublic.verificationLevel,
            }
          : tag.createdByEMS
            ? {
                id: tag.createdByEMS.id,
                displayName: `${tag.createdByEMS.firstName} ${tag.createdByEMS.lastName}`,
              }
            : null,
      };

      // Broadcast tag creation
      await broadcastTagEvent(fastify, 'tag:created', responseTag, tag.eventId);

      return reply.status(201).send({
        statusCode: 201,
        message: 'Tag created successfully',
        data: { tag: responseTag },
      });
    }
  );

  /**
   * GET /api/v1/tags
   * Get tags with filtering options
   */
  fastify.get(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = queryTagsSchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query: QueryTagsInput = parseResult.data;
      const user = (request as OptionalAuthRequest).user;
      const userType = user?.userType ?? null;
      const userId = user?.userId ?? null;

      // Build where clause
      const where: Prisma.MapTagWhereInput = {};

      // Bounding box filter
      if (query.minLat !== undefined && query.maxLat !== undefined &&
          query.minLng !== undefined && query.maxLng !== undefined) {
        where.locationLat = { gte: query.minLat, lte: query.maxLat };
        where.locationLng = { gte: query.minLng, lte: query.maxLng };
      }

      // Type filter
      if (query.types && query.types.length > 0) {
        where.tagType = { in: query.types as any };
      }

      // Event filter
      if (query.eventId) {
        where.eventId = query.eventId;
      }

      // Status filter
      if (query.status && query.status.length > 0) {
        where.status = { in: query.status as any };
      } else {
        // Default: exclude EXPIRED unless explicitly requested
        if (!query.includeExpired) {
          where.status = { not: 'EXPIRED' };
        }
      }

      // Visibility filter based on user permissions
      if (userType === 'ems') {
        // EMS users can see all tags, optionally filter by requested visibility
        if (query.visibility) {
          where.visibility = query.visibility;
        }
      } else {
        // Public users and unauthenticated users: only PUBLIC tags OR their own tags
        if (userId) {
          where.OR = [
            { visibility: 'PUBLIC' },
            { createdByPublicId: userId },
          ];
        } else {
          where.visibility = 'PUBLIC';
        }
      }

      // Expiry filter
      if (!query.includeExpired) {
        where.OR = where.OR
          ? [
              ...where.OR,
              { validUntil: null },
              { validUntil: { gt: new Date() } },
            ]
          : undefined;

        if (!where.OR) {
          where.AND = [
            ...(Array.isArray(where.AND) ? where.AND : []),
            {
              OR: [
                { validUntil: null },
                { validUntil: { gt: new Date() } },
              ],
            },
          ];
        }
      }

      // Query tags
      const [tags, total] = await Promise.all([
        prisma.mapTag.findMany({
          where,
          include: {
            createdByPublic: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                verificationLevel: true,
              },
            },
            createdByEMS: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: query.offset,
          take: query.limit,
        }),
        prisma.mapTag.count({ where }),
      ]);

      // Process tags with credence and filtering
      const processedTags: TagWithCredence[] = [];

      for (const tag of tags) {
        // Get creator verification level for credence calculation
        const creatorVerificationLevel = await getCreatorVerificationLevel(
          tag.creatorType,
          tag.createdByPublicId
        );

        // Compute credence
        const credence = computeTagCredence(
          tag.creatorType,
          tag.confirmationCount,
          tag.disputeCount,
          creatorVerificationLevel
        );

        // Apply minimum credence filter
        if (query.minCredence !== undefined && credence.score < query.minCredence) {
          continue;
        }

        processedTags.push({
          id: tag.id,
          title: tag.title,
          description: tag.description,
          creatorType: tag.creatorType,
          tagType: tag.tagType,
          visibility: tag.visibility,
          status: tag.status,
          locationLat: tag.locationLat,
          locationLng: tag.locationLng,
          locationAddress: tag.locationAddress,
          radiusMeters: tag.radiusMeters,
          imageUrls: tag.imageUrls,
          externalUrl: tag.externalUrl,
          validFrom: tag.validFrom,
          validUntil: tag.validUntil,
          confirmationCount: tag.confirmationCount,
          disputeCount: tag.disputeCount,
          createdAt: tag.createdAt,
          updatedAt: tag.updatedAt,
          eventId: tag.eventId,
          workspaceId: tag.workspaceId,
          credence,
          creator: tag.createdByPublic
            ? {
                id: tag.createdByPublic.id,
                displayName: tag.createdByPublic.displayName ?? tag.createdByPublic.firstName,
                verificationLevel: tag.createdByPublic.verificationLevel,
              }
            : tag.createdByEMS
              ? {
                  id: tag.createdByEMS.id,
                  displayName: `${tag.createdByEMS.firstName} ${tag.createdByEMS.lastName}`,
                }
              : null,
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: {
          tags: processedTags,
          pagination: {
            total,
            limit: query.limit,
            offset: query.offset,
            hasMore: query.offset + processedTags.length < total,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/tags/:id
   * Get tag details by ID
   */
  fastify.get(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsResult = tagIdParamsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid tag ID',
        });
      }

      const { id } = paramsResult.data;
      const user = (request as OptionalAuthRequest).user;
      const userType = user?.userType ?? null;
      const userId = user?.userId ?? null;

      // Fetch tag with confirmations
      const tag = await prisma.mapTag.findUnique({
        where: { id },
        include: {
          createdByPublic: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              verificationLevel: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          confirmations: {
            select: {
              id: true,
              isConfirmation: true,
              comment: true,
              createdAt: true,
              confirmedByPublic: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                },
              },
              confirmedByEMS: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!tag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      // Check visibility permissions
      const isCreator = Boolean(
        (tag.createdByPublicId && tag.createdByPublicId === userId) ||
        (tag.createdByEMSId && tag.createdByEMSId === userId)
      );

      if (!canViewTag(tag.visibility, userType, isCreator)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to view this tag',
        });
      }

      // Get creator verification level
      const creatorVerificationLevel = await getCreatorVerificationLevel(
        tag.creatorType,
        tag.createdByPublicId
      );

      // Compute credence
      const credence = computeTagCredence(
        tag.creatorType,
        tag.confirmationCount,
        tag.disputeCount,
        creatorVerificationLevel
      );

      // Format confirmations
      const confirmations = tag.confirmations.map((c) => ({
        id: c.id,
        isConfirmation: c.isConfirmation,
        comment: c.comment,
        createdAt: c.createdAt,
        user: c.confirmedByPublic
          ? {
              id: c.confirmedByPublic.id,
              displayName: c.confirmedByPublic.displayName ?? c.confirmedByPublic.firstName,
            }
          : c.confirmedByEMS
            ? {
                id: c.confirmedByEMS.id,
                displayName: `${c.confirmedByEMS.firstName} ${c.confirmedByEMS.lastName}`,
              }
            : null,
      }));

      const responseTag: TagWithCredence & { confirmations: typeof confirmations } = {
        id: tag.id,
        title: tag.title,
        description: tag.description,
        creatorType: tag.creatorType,
        tagType: tag.tagType,
        visibility: tag.visibility,
        status: tag.status,
        locationLat: tag.locationLat,
        locationLng: tag.locationLng,
        locationAddress: tag.locationAddress,
        radiusMeters: tag.radiusMeters,
        imageUrls: tag.imageUrls,
        externalUrl: tag.externalUrl,
        validFrom: tag.validFrom,
        validUntil: tag.validUntil,
        confirmationCount: tag.confirmationCount,
        disputeCount: tag.disputeCount,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        eventId: tag.eventId,
        workspaceId: tag.workspaceId,
        credence,
        creator: tag.createdByPublic
          ? {
              id: tag.createdByPublic.id,
              displayName: tag.createdByPublic.displayName ?? tag.createdByPublic.firstName,
              verificationLevel: tag.createdByPublic.verificationLevel,
            }
          : tag.createdByEMS
            ? {
                id: tag.createdByEMS.id,
                displayName: `${tag.createdByEMS.firstName} ${tag.createdByEMS.lastName}`,
              }
            : null,
        confirmations,
      };

      return reply.status(200).send({
        statusCode: 200,
        data: { tag: responseTag },
      });
    }
  );

  /**
   * PUT /api/v1/tags/:id
   * Update a tag (creator or EMS only)
   */
  fastify.put(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsResult = tagIdParamsSchema.safeParse(request.params);
      const bodyResult = updateTagSchema.safeParse(request.body);

      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid tag ID',
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

      const { id } = paramsResult.data;
      const input: UpdateTagInput = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Fetch existing tag
      const existingTag = await prisma.mapTag.findUnique({
        where: { id },
        select: {
          id: true,
          createdByPublicId: true,
          createdByEMSId: true,
          visibility: true,
          eventId: true,
        },
      });

      if (!existingTag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      // Check update permissions
      const isCreator =
        (existingTag.createdByPublicId && existingTag.createdByPublicId === userId) ||
        (existingTag.createdByEMSId && existingTag.createdByEMSId === userId);
      const isEMS = userType === 'ems';

      if (!isCreator && !isEMS) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only the creator or EMS users can update this tag',
        });
      }

      // Validate visibility change permissions
      if (input.visibility && userType === 'public' && input.visibility !== 'PUBLIC') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Public users can only set visibility to PUBLIC',
        });
      }

      // Build update data
      const updateData: Prisma.MapTagUpdateInput = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.tagType !== undefined) updateData.tagType = input.tagType;
      if (input.visibility !== undefined) updateData.visibility = input.visibility;
      if (input.locationLat !== undefined) updateData.locationLat = input.locationLat;
      if (input.locationLng !== undefined) updateData.locationLng = input.locationLng;
      if (input.locationAddress !== undefined) updateData.locationAddress = input.locationAddress;
      if (input.radiusMeters !== undefined) updateData.radiusMeters = input.radiusMeters;
      if (input.imageUrls !== undefined) updateData.imageUrls = input.imageUrls;
      if (input.externalUrl !== undefined) updateData.externalUrl = input.externalUrl;
      if (input.validUntil !== undefined) {
        updateData.validUntil = input.validUntil ? new Date(input.validUntil) : null;
      }

      // Update the tag
      const updatedTag = await prisma.mapTag.update({
        where: { id },
        data: updateData,
        include: {
          createdByPublic: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              verificationLevel: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get creator verification level
      const creatorVerificationLevel = await getCreatorVerificationLevel(
        updatedTag.creatorType,
        updatedTag.createdByPublicId
      );

      // Compute credence
      const credence = computeTagCredence(
        updatedTag.creatorType,
        updatedTag.confirmationCount,
        updatedTag.disputeCount,
        creatorVerificationLevel
      );

      const responseTag: TagWithCredence = {
        id: updatedTag.id,
        title: updatedTag.title,
        description: updatedTag.description,
        creatorType: updatedTag.creatorType,
        tagType: updatedTag.tagType,
        visibility: updatedTag.visibility,
        status: updatedTag.status,
        locationLat: updatedTag.locationLat,
        locationLng: updatedTag.locationLng,
        locationAddress: updatedTag.locationAddress,
        radiusMeters: updatedTag.radiusMeters,
        imageUrls: updatedTag.imageUrls,
        externalUrl: updatedTag.externalUrl,
        validFrom: updatedTag.validFrom,
        validUntil: updatedTag.validUntil,
        confirmationCount: updatedTag.confirmationCount,
        disputeCount: updatedTag.disputeCount,
        createdAt: updatedTag.createdAt,
        updatedAt: updatedTag.updatedAt,
        eventId: updatedTag.eventId,
        workspaceId: updatedTag.workspaceId,
        credence,
        creator: updatedTag.createdByPublic
          ? {
              id: updatedTag.createdByPublic.id,
              displayName: updatedTag.createdByPublic.displayName ?? updatedTag.createdByPublic.firstName,
              verificationLevel: updatedTag.createdByPublic.verificationLevel,
            }
          : updatedTag.createdByEMS
            ? {
                id: updatedTag.createdByEMS.id,
                displayName: `${updatedTag.createdByEMS.firstName} ${updatedTag.createdByEMS.lastName}`,
              }
            : null,
      };

      // Broadcast tag update
      await broadcastTagEvent(fastify, 'tag:updated', responseTag, updatedTag.eventId);

      return reply.status(200).send({
        statusCode: 200,
        message: 'Tag updated successfully',
        data: { tag: responseTag },
      });
    }
  );

  /**
   * DELETE /api/v1/tags/:id
   * Delete a tag (creator only)
   */
  fastify.delete(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsResult = tagIdParamsSchema.safeParse(request.params);

      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid tag ID',
        });
      }

      const { id } = paramsResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Fetch existing tag
      const existingTag = await prisma.mapTag.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          createdByPublicId: true,
          createdByEMSId: true,
          eventId: true,
          creatorType: true,
          tagType: true,
          visibility: true,
          status: true,
          locationLat: true,
          locationLng: true,
        },
      });

      if (!existingTag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      // Check delete permissions (creator only)
      const isCreator =
        (existingTag.createdByPublicId && existingTag.createdByPublicId === userId) ||
        (existingTag.createdByEMSId && existingTag.createdByEMSId === userId);

      if (!isCreator) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only the creator can delete this tag',
        });
      }

      // Delete confirmations first (cascade)
      await prisma.tagConfirmation.deleteMany({
        where: { tagId: id },
      });

      // Delete the tag
      await prisma.mapTag.delete({
        where: { id },
      });

      // Broadcast tag deletion
      const deletedTagInfo: TagWithCredence = {
        id: existingTag.id,
        title: existingTag.title,
        description: null,
        creatorType: existingTag.creatorType,
        tagType: existingTag.tagType,
        visibility: existingTag.visibility,
        status: existingTag.status,
        locationLat: existingTag.locationLat,
        locationLng: existingTag.locationLng,
        locationAddress: null,
        radiusMeters: null,
        imageUrls: [],
        externalUrl: null,
        validFrom: new Date(),
        validUntil: null,
        confirmationCount: 0,
        disputeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        eventId: existingTag.eventId,
        workspaceId: null,
        credence: { score: 0, label: 'Deleted', isTrusted: false },
      };

      await broadcastTagEvent(fastify, 'tag:deleted', deletedTagInfo, existingTag.eventId);

      return reply.status(200).send({
        statusCode: 200,
        message: 'Tag deleted successfully',
      });
    }
  );

  /**
   * POST /api/v1/tags/:id/confirm
   * Confirm or dispute a tag
   */
  fastify.post(
    '/:id/confirm',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsResult = tagIdParamsSchema.safeParse(request.params);
      const bodyResult = confirmTagSchema.safeParse(request.body);

      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid tag ID',
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

      const { id } = paramsResult.data;
      const input: ConfirmTagInput = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Fetch existing tag
      const existingTag = await prisma.mapTag.findUnique({
        where: { id },
        select: {
          id: true,
          createdByPublicId: true,
          createdByEMSId: true,
          confirmationCount: true,
          disputeCount: true,
          visibility: true,
          eventId: true,
        },
      });

      if (!existingTag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      // Check if user can view the tag
      const isCreator = Boolean(
        (existingTag.createdByPublicId && existingTag.createdByPublicId === userId) ||
        (existingTag.createdByEMSId && existingTag.createdByEMSId === userId)
      );

      if (!canViewTag(existingTag.visibility, userType, isCreator)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to confirm this tag',
        });
      }

      // Prevent self-confirmation
      if (isCreator) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'You cannot confirm your own tag',
        });
      }

      // Check for existing confirmation from this user
      const existingConfirmation = await prisma.tagConfirmation.findFirst({
        where: {
          tagId: id,
          OR: [
            { confirmedByPublicId: userType === 'public' ? userId : undefined },
            { confirmedByEMSId: userType === 'ems' ? userId : undefined },
          ],
        },
      });

      if (existingConfirmation) {
        // Update existing confirmation
        await prisma.tagConfirmation.update({
          where: { id: existingConfirmation.id },
          data: {
            isConfirmation: input.isConfirmation,
            comment: input.comment,
          },
        });

        // Recalculate counts
        const [confirmations, disputes] = await Promise.all([
          prisma.tagConfirmation.count({ where: { tagId: id, isConfirmation: true } }),
          prisma.tagConfirmation.count({ where: { tagId: id, isConfirmation: false } }),
        ]);

        // Update tag counts
        await prisma.mapTag.update({
          where: { id },
          data: {
            confirmationCount: confirmations,
            disputeCount: disputes,
          },
        });
      } else {
        // Create new confirmation
        await prisma.tagConfirmation.create({
          data: {
            tagId: id,
            isConfirmation: input.isConfirmation,
            comment: input.comment,
            ...(userType === 'ems'
              ? { confirmedByEMSId: userId }
              : { confirmedByPublicId: userId }),
          },
        });

        // Update tag counts
        await prisma.mapTag.update({
          where: { id },
          data: {
            [input.isConfirmation ? 'confirmationCount' : 'disputeCount']: {
              increment: 1,
            },
          },
        });
      }

      // Fetch updated tag
      const updatedTag = await prisma.mapTag.findUnique({
        where: { id },
        include: {
          createdByPublic: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              verificationLevel: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!updatedTag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      // Get creator verification level
      const creatorVerificationLevel = await getCreatorVerificationLevel(
        updatedTag.creatorType,
        updatedTag.createdByPublicId
      );

      // Compute credence
      const credence = computeTagCredence(
        updatedTag.creatorType,
        updatedTag.confirmationCount,
        updatedTag.disputeCount,
        creatorVerificationLevel
      );

      const responseTag: TagWithCredence = {
        id: updatedTag.id,
        title: updatedTag.title,
        description: updatedTag.description,
        creatorType: updatedTag.creatorType,
        tagType: updatedTag.tagType,
        visibility: updatedTag.visibility,
        status: updatedTag.status,
        locationLat: updatedTag.locationLat,
        locationLng: updatedTag.locationLng,
        locationAddress: updatedTag.locationAddress,
        radiusMeters: updatedTag.radiusMeters,
        imageUrls: updatedTag.imageUrls,
        externalUrl: updatedTag.externalUrl,
        validFrom: updatedTag.validFrom,
        validUntil: updatedTag.validUntil,
        confirmationCount: updatedTag.confirmationCount,
        disputeCount: updatedTag.disputeCount,
        createdAt: updatedTag.createdAt,
        updatedAt: updatedTag.updatedAt,
        eventId: updatedTag.eventId,
        workspaceId: updatedTag.workspaceId,
        credence,
        creator: updatedTag.createdByPublic
          ? {
              id: updatedTag.createdByPublic.id,
              displayName: updatedTag.createdByPublic.displayName ?? updatedTag.createdByPublic.firstName,
              verificationLevel: updatedTag.createdByPublic.verificationLevel,
            }
          : updatedTag.createdByEMS
            ? {
                id: updatedTag.createdByEMS.id,
                displayName: `${updatedTag.createdByEMS.firstName} ${updatedTag.createdByEMS.lastName}`,
              }
            : null,
      };

      // Broadcast confirmation
      await broadcastTagEvent(fastify, 'tag:confirmed', responseTag, updatedTag.eventId);

      return reply.status(200).send({
        statusCode: 200,
        message: input.isConfirmation ? 'Tag confirmed' : 'Tag disputed',
        data: { tag: responseTag },
      });
    }
  );

  /**
   * PUT /api/v1/tags/:id/status
   * Update tag status (resolve, expire, invalidate) - EMS only
   */
  fastify.put(
    '/:id/status',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsResult = tagIdParamsSchema.safeParse(request.params);
      const bodyResult = updateTagStatusSchema.safeParse(request.body);

      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid tag ID',
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

      const { id } = paramsResult.data;
      const input: UpdateTagStatusInput = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Only EMS users or tag creator can update status
      const existingTag = await prisma.mapTag.findUnique({
        where: { id },
        select: {
          id: true,
          createdByPublicId: true,
          createdByEMSId: true,
          eventId: true,
        },
      });

      if (!existingTag) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Tag not found',
        });
      }

      const isCreator =
        (existingTag.createdByPublicId && existingTag.createdByPublicId === userId) ||
        (existingTag.createdByEMSId && existingTag.createdByEMSId === userId);
      const isEMS = userType === 'ems';

      // Only EMS can set DISPUTED status, creators can RESOLVE or EXPIRE their own
      if (!isEMS && !isCreator) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only EMS users or the creator can update tag status',
        });
      }

      // Public creators cannot set DISPUTED status
      if (!isEMS && input.status === 'DISPUTED') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only EMS users can mark tags as disputed',
        });
      }

      // Update the tag status
      const updatedTag = await prisma.mapTag.update({
        where: { id },
        data: {
          status: input.status,
          ...(input.status === 'EXPIRED' && { validUntil: new Date() }),
        },
        include: {
          createdByPublic: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              verificationLevel: true,
            },
          },
          createdByEMS: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Get creator verification level
      const creatorVerificationLevel = await getCreatorVerificationLevel(
        updatedTag.creatorType,
        updatedTag.createdByPublicId
      );

      // Compute credence
      const credence = computeTagCredence(
        updatedTag.creatorType,
        updatedTag.confirmationCount,
        updatedTag.disputeCount,
        creatorVerificationLevel
      );

      const responseTag: TagWithCredence = {
        id: updatedTag.id,
        title: updatedTag.title,
        description: updatedTag.description,
        creatorType: updatedTag.creatorType,
        tagType: updatedTag.tagType,
        visibility: updatedTag.visibility,
        status: updatedTag.status,
        locationLat: updatedTag.locationLat,
        locationLng: updatedTag.locationLng,
        locationAddress: updatedTag.locationAddress,
        radiusMeters: updatedTag.radiusMeters,
        imageUrls: updatedTag.imageUrls,
        externalUrl: updatedTag.externalUrl,
        validFrom: updatedTag.validFrom,
        validUntil: updatedTag.validUntil,
        confirmationCount: updatedTag.confirmationCount,
        disputeCount: updatedTag.disputeCount,
        createdAt: updatedTag.createdAt,
        updatedAt: updatedTag.updatedAt,
        eventId: updatedTag.eventId,
        workspaceId: updatedTag.workspaceId,
        credence,
        creator: updatedTag.createdByPublic
          ? {
              id: updatedTag.createdByPublic.id,
              displayName: updatedTag.createdByPublic.displayName ?? updatedTag.createdByPublic.firstName,
              verificationLevel: updatedTag.createdByPublic.verificationLevel,
            }
          : updatedTag.createdByEMS
            ? {
                id: updatedTag.createdByEMS.id,
                displayName: `${updatedTag.createdByEMS.firstName} ${updatedTag.createdByEMS.lastName}`,
              }
            : null,
      };

      // Broadcast status update
      await broadcastTagEvent(fastify, 'tag:updated', responseTag, updatedTag.eventId);

      return reply.status(200).send({
        statusCode: 200,
        message: `Tag status updated to ${input.status}`,
        data: { tag: responseTag },
      });
    }
  );
}

export default tagRoutes;
