import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, optionalAuth } from '../auth/middleware.js';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../auth/middleware.js';
import {
  listGroupsQuerySchema,
  createGroupSchema,
  updateGroupSchema,
  groupIdParamSchema,
  listMembersQuerySchema,
  addMemberSchema,
  memberUserIdParamSchema,
  updateMemberRoleSchema,
  type ListGroupsQuery,
  type CreateGroupInput,
  type UpdateGroupInput,
  type GroupIdParam,
  type ListMembersQuery,
  type AddMemberInput,
  type MemberUserIdParam,
  type UpdateMemberRoleInput,
} from './schemas.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the client ID for an EMS user
 */
async function getEMSUserClientId(userId: string): Promise<string | null> {
  const user = await prisma.eMSUser.findUnique({
    where: { id: userId },
    select: { clientId: true },
  });
  return user?.clientId ?? null;
}

/**
 * Check if user has access to a group
 * - EMS users can access groups within their client
 * - Public users can access public groups or groups they're members of
 */
async function canAccessGroup(
  groupId: string,
  userId: string,
  userType: 'ems' | 'public'
): Promise<{ hasAccess: boolean; group: Awaited<ReturnType<typeof prisma.group.findUnique>> | null }> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      client: { select: { id: true, name: true } },
    },
  });

  if (!group) {
    return { hasAccess: false, group: null };
  }

  if (userType === 'ems') {
    const clientId = await getEMSUserClientId(userId);
    return { hasAccess: group.clientId === clientId, group };
  }

  // Public user: can access public groups or groups they're a member of
  if (group.isPublic) {
    return { hasAccess: true, group };
  }

  const membership = await prisma.publicGroupMember.findFirst({
    where: {
      groupId,
      userId,
      isActive: true,
    },
  });

  return { hasAccess: !!membership, group };
}

/**
 * Check if user can manage a group (create, update, delete, manage members)
 * - EMS users can manage groups within their client
 * - Public users can only manage groups they lead
 */
async function canManageGroup(
  groupId: string,
  userId: string,
  userType: 'ems' | 'public'
): Promise<boolean> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    return false;
  }

  if (userType === 'ems') {
    const clientId = await getEMSUserClientId(userId);
    return group.clientId === clientId;
  }

  // Public user: can only manage if they're a leader
  const membership = await prisma.publicGroupMember.findFirst({
    where: {
      groupId,
      userId,
      isActive: true,
      isLeader: true,
    },
  });

  return !!membership;
}

// ============================================================================
// Routes
// ============================================================================

export async function groupRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/groups
   * List groups with filtering
   * - EMS users see groups within their client + public groups (if includePublic)
   * - Public users see public groups + groups they're members of
   */
  fastify.get(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = listGroupsQuerySchema.safeParse(request.query);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const query = parseResult.data;
      const user = (request as OptionalAuthRequest).user;
      const { page, limit, sortBy, sortOrder, ...filters } = query;

      // Build where clause based on user type and filters
      const where: Prisma.GroupWhereInput = {
        isActive: filters.isActive,
      };

      // Type filter
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        where.type = { in: types as any };
      }

      // Name search
      if (filters.search) {
        where.name = { contains: filters.search, mode: 'insensitive' };
      }

      // Parent group filter
      if (filters.parentGroupId) {
        // Note: parentGroupId is not in the base Prisma schema,
        // but can be added via metadata or a future migration
        // For now, we'll skip this filter
      }

      // Geographic filters
      if (filters.minLat !== undefined) {
        where.baseLocationLat = {
          gte: filters.minLat,
          lte: filters.maxLat,
        };
        where.baseLocationLng = {
          gte: filters.minLng,
          lte: filters.maxLng,
        };
      }

      // Handle visibility based on user type
      if (user?.userType === 'ems') {
        const clientId = await getEMSUserClientId(user.userId);

        if (filters.includePublic) {
          where.OR = [
            { clientId: clientId ?? undefined },
            { isPublic: true },
          ];
        } else {
          where.clientId = clientId ?? undefined;
        }

        // EMS can filter by specific client if provided
        if (filters.clientId) {
          // Verify EMS user has access to this client
          if (filters.clientId !== clientId) {
            return reply.status(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: 'You can only view groups within your client organization',
            });
          }
          where.clientId = filters.clientId;
          delete where.OR;
        }
      } else if (user?.userType === 'public') {
        // Public users see public groups + their memberships
        const memberships = await prisma.publicGroupMember.findMany({
          where: { userId: user.userId, isActive: true },
          select: { groupId: true },
        });
        const memberGroupIds = memberships.map((m) => m.groupId);

        where.OR = [
          { isPublic: true },
          { id: { in: memberGroupIds } },
        ];
      } else {
        // Unauthenticated: only public groups
        where.isPublic = true;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;

      const [groups, total] = await Promise.all([
        prisma.group.findMany({
          where,
          include: {
            client: { select: { id: true, name: true } },
            _count: {
              select: {
                emsMembers: true,
                publicMembers: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.group.count({ where }),
      ]);

      // Transform response
      const transformedGroups = groups.map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        type: group.type,
        isActive: group.isActive,
        isPublic: group.isPublic,
        maxMembers: group.maxMembers,
        baseLocation: group.baseLocationLat && group.baseLocationLng
          ? { lat: group.baseLocationLat, lng: group.baseLocationLng }
          : null,
        operationalRadius: group.operationalRadius,
        client: group.client,
        memberCount: group._count.emsMembers + group._count.publicMembers,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      }));

      return reply.status(200).send({
        statusCode: 200,
        data: {
          groups: transformedGroups,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/groups
   * Create a new group
   * - EMS users create groups for their client
   * - Public users can create public community groups
   */
  fastify.post(
    '/',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parseResult = createGroupSchema.safeParse(request.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.flatten(),
        });
      }

      const data = parseResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      let clientId: string | null = null;

      if (userType === 'ems') {
        // EMS users must create groups for their client
        clientId = await getEMSUserClientId(userId);

        if (!clientId) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'EMS user must be associated with a client',
          });
        }

        // Validate clientId if provided
        if (data.clientId && data.clientId !== clientId) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'You can only create groups within your client organization',
          });
        }
      } else {
        // Public users can only create public community groups
        if (!data.isPublic) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Public users can only create public community groups',
          });
        }

        // Use clientId if provided (for community groups associated with a client area)
        clientId = data.clientId ?? null;
      }

      // Check client's group limit
      if (clientId) {
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          select: { maxGroups: true },
        });

        if (client) {
          const groupCount = await prisma.group.count({
            where: { clientId },
          });

          if (groupCount >= client.maxGroups) {
            return reply.status(403).send({
              statusCode: 403,
              error: 'Forbidden',
              message: 'Client has reached maximum group limit',
            });
          }
        }
      }

      // Map extended group types to Prisma GroupType enum
      const prismaGroupType = mapToPrismaGroupType(data.type);

      // Create the group
      const group = await prisma.group.create({
        data: {
          name: data.name,
          description: data.description,
          type: prismaGroupType,
          isPublic: data.isPublic ?? false,
          isActive: data.isActive ?? true,
          maxMembers: data.maxMembers,
          baseLocationLat: data.baseLocationLat,
          baseLocationLng: data.baseLocationLng,
          operationalRadius: data.operationalRadius,
          clientId: clientId!,
        },
        include: {
          client: { select: { id: true, name: true } },
        },
      });

      // If public user created the group, add them as a leader
      if (userType === 'public') {
        await prisma.publicGroupMember.create({
          data: {
            userId,
            groupId: group.id,
            isLeader: true,
            isActive: true,
          },
        });
      }

      return reply.status(201).send({
        statusCode: 201,
        message: 'Group created successfully',
        data: {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            type: data.type, // Return the extended type
            isActive: group.isActive,
            isPublic: group.isPublic,
            maxMembers: group.maxMembers,
            baseLocation: group.baseLocationLat && group.baseLocationLng
              ? { lat: group.baseLocationLat, lng: group.baseLocationLng }
              : null,
            operationalRadius: group.operationalRadius,
            client: group.client,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          },
        },
      });
    }
  );

  /**
   * GET /api/v1/groups/:id
   * Get group details with member summary
   */
  fastify.get(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = groupIdParamSchema.safeParse(request.params);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid group ID format',
        });
      }

      const { id } = paramResult.data;
      const user = (request as OptionalAuthRequest).user;

      // Get group with counts
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true } },
          _count: {
            select: {
              emsMembers: { where: { isActive: true } },
              publicMembers: { where: { isActive: true } },
            },
          },
          // Get leaders
          emsMembers: {
            where: { isLeader: true, isActive: true },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, role: true },
              },
            },
            take: 5,
          },
          publicMembers: {
            where: { isLeader: true, isActive: true },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, displayName: true },
              },
            },
            take: 5,
          },
        },
      });

      if (!group) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Group not found',
        });
      }

      // Check access
      if (!group.isPublic) {
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Authentication required to view this group',
          });
        }

        const { hasAccess } = await canAccessGroup(id, user.userId, user.userType);
        if (!hasAccess) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'You do not have access to this group',
          });
        }
      }

      // Check if current user is a member
      let currentUserMembership = null;
      if (user) {
        if (user.userType === 'ems') {
          const membership = await prisma.eMSGroupMember.findFirst({
            where: { groupId: id, userId: user.userId },
          });
          if (membership) {
            currentUserMembership = {
              isLeader: membership.isLeader,
              joinedAt: membership.joinedAt,
              isActive: membership.isActive,
            };
          }
        } else {
          const membership = await prisma.publicGroupMember.findFirst({
            where: { groupId: id, userId: user.userId },
          });
          if (membership) {
            currentUserMembership = {
              isLeader: membership.isLeader,
              joinedAt: membership.joinedAt,
              isActive: membership.isActive,
              contributionScore: membership.contributionScore,
            };
          }
        }
      }

      // Transform leaders
      const leaders = [
        ...group.emsMembers.map((m) => ({
          id: m.user.id,
          name: `${m.user.firstName} ${m.user.lastName}`,
          role: m.user.role,
          userType: 'ems' as const,
        })),
        ...group.publicMembers.map((m) => ({
          id: m.user.id,
          name: m.user.displayName || `${m.user.firstName} ${m.user.lastName}`,
          role: null,
          userType: 'public' as const,
        })),
      ];

      return reply.status(200).send({
        statusCode: 200,
        data: {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            type: group.type,
            isActive: group.isActive,
            isPublic: group.isPublic,
            maxMembers: group.maxMembers,
            baseLocation: group.baseLocationLat && group.baseLocationLng
              ? { lat: group.baseLocationLat, lng: group.baseLocationLng }
              : null,
            operationalRadius: group.operationalRadius,
            client: group.client,
            memberCount: group._count.emsMembers + group._count.publicMembers,
            leaders,
            currentUserMembership,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          },
        },
      });
    }
  );

  /**
   * PUT /api/v1/groups/:id
   * Update a group
   */
  fastify.put(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = groupIdParamSchema.safeParse(request.params);
      const bodyResult = updateGroupSchema.safeParse(request.body);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid group ID format',
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
      const data = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Check management permissions
      const canManage = await canManageGroup(id, userId, userType);
      if (!canManage) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to update this group',
        });
      }

      // Build update data
      const updateData: Parameters<typeof prisma.group.update>[0]['data'] = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = mapToPrismaGroupType(data.type);
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.maxMembers !== undefined) updateData.maxMembers = data.maxMembers;
      if (data.baseLocationLat !== undefined) updateData.baseLocationLat = data.baseLocationLat;
      if (data.baseLocationLng !== undefined) updateData.baseLocationLng = data.baseLocationLng;
      if (data.operationalRadius !== undefined) updateData.operationalRadius = data.operationalRadius;

      const group = await prisma.group.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true } },
          _count: {
            select: {
              emsMembers: { where: { isActive: true } },
              publicMembers: { where: { isActive: true } },
            },
          },
        },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Group updated successfully',
        data: {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            type: group.type,
            isActive: group.isActive,
            isPublic: group.isPublic,
            maxMembers: group.maxMembers,
            baseLocation: group.baseLocationLat && group.baseLocationLng
              ? { lat: group.baseLocationLat, lng: group.baseLocationLng }
              : null,
            operationalRadius: group.operationalRadius,
            client: group.client,
            memberCount: group._count.emsMembers + group._count.publicMembers,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
          },
        },
      });
    }
  );

  /**
   * DELETE /api/v1/groups/:id
   * Delete a group (soft delete by setting isActive to false)
   */
  fastify.delete(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = groupIdParamSchema.safeParse(request.params);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid group ID format',
        });
      }

      const { id } = paramResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Check management permissions
      const canManage = await canManageGroup(id, userId, userType);
      if (!canManage) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to delete this group',
        });
      }

      // Soft delete the group
      await prisma.group.update({
        where: { id },
        data: { isActive: false },
      });

      // Deactivate all memberships
      await Promise.all([
        prisma.eMSGroupMember.updateMany({
          where: { groupId: id },
          data: { isActive: false, leftAt: new Date() },
        }),
        prisma.publicGroupMember.updateMany({
          where: { groupId: id },
          data: { isActive: false, leftAt: new Date() },
        }),
      ]);

      return reply.status(200).send({
        statusCode: 200,
        message: 'Group deleted successfully',
      });
    }
  );

  /**
   * GET /api/v1/groups/:id/members
   * Get members of a group
   */
  fastify.get(
    '/:id/members',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = groupIdParamSchema.safeParse(request.params);
      const queryResult = listMembersQuerySchema.safeParse(request.query);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid group ID format',
        });
      }

      if (!queryResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: queryResult.error.flatten(),
        });
      }

      const { id } = paramResult.data;
      const query = queryResult.data;
      const user = (request as OptionalAuthRequest).user;

      // Check access
      const group = await prisma.group.findUnique({
        where: { id },
        select: { id: true, isPublic: true, clientId: true },
      });

      if (!group) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Group not found',
        });
      }

      if (!group.isPublic) {
        if (!user) {
          return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Authentication required',
          });
        }

        const { hasAccess } = await canAccessGroup(id, user.userId, user.userType);
        if (!hasAccess) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'You do not have access to this group',
          });
        }
      }

      const { page, limit, sortBy, sortOrder, memberType, isActive, isLeader, search } = query;
      const skip = (page - 1) * limit;

      // Build member queries
      const emsWhere: Prisma.EMSGroupMemberWhereInput = {
        groupId: id,
        isActive: isActive,
        isLeader: isLeader,
      };

      const publicWhere: Prisma.PublicGroupMemberWhereInput = {
        groupId: id,
        isActive: isActive,
        isLeader: isLeader,
      };

      // Search filter
      if (search) {
        emsWhere.user = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        };
        publicWhere.user = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { displayName: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Determine sort field for members
      const memberSortBy = sortBy === 'name' ? 'joinedAt' : sortBy;

      // Fetch members based on type filter
      const members: Array<{
        id: string;
        userId: string;
        userType: 'ems' | 'public';
        name: string;
        email: string;
        isLeader: boolean;
        isActive: boolean;
        joinedAt: Date;
        role?: string;
        contributionScore?: number;
      }> = [];

      let total = 0;

      if (memberType === 'all' || memberType === 'ems') {
        const [emsMembers, emsCount] = await Promise.all([
          prisma.eMSGroupMember.findMany({
            where: emsWhere,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { [memberSortBy]: sortOrder },
            skip: memberType === 'ems' ? skip : 0,
            take: memberType === 'ems' ? limit : 50,
          }),
          prisma.eMSGroupMember.count({ where: emsWhere }),
        ]);

        total += emsCount;

        members.push(
          ...emsMembers.map((m) => ({
            id: m.id,
            userId: m.user.id,
            userType: 'ems' as const,
            name: `${m.user.firstName} ${m.user.lastName}`,
            email: m.user.email,
            isLeader: m.isLeader,
            isActive: m.isActive,
            joinedAt: m.joinedAt,
            role: m.user.role,
          }))
        );
      }

      if (memberType === 'all' || memberType === 'public') {
        const [publicMembers, publicCount] = await Promise.all([
          prisma.publicGroupMember.findMany({
            where: publicWhere,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  displayName: true,
                  email: true,
                },
              },
            },
            orderBy: { [memberSortBy]: sortOrder },
            skip: memberType === 'public' ? skip : 0,
            take: memberType === 'public' ? limit : 50,
          }),
          prisma.publicGroupMember.count({ where: publicWhere }),
        ]);

        total += publicCount;

        members.push(
          ...publicMembers.map((m) => ({
            id: m.id,
            userId: m.user.id,
            userType: 'public' as const,
            name: m.user.displayName || `${m.user.firstName} ${m.user.lastName}`,
            email: m.user.email,
            isLeader: m.isLeader,
            isActive: m.isActive,
            joinedAt: m.joinedAt,
            contributionScore: m.contributionScore,
          }))
        );
      }

      // Sort combined results if getting all
      if (memberType === 'all') {
        members.sort((a, b) => {
          if (sortBy === 'name') {
            return sortOrder === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
          return sortOrder === 'asc'
            ? a.joinedAt.getTime() - b.joinedAt.getTime()
            : b.joinedAt.getTime() - a.joinedAt.getTime();
        });

        // Apply pagination to combined results
        const paginatedMembers = members.slice(skip, skip + limit);

        return reply.status(200).send({
          statusCode: 200,
          data: {
            members: paginatedMembers,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit),
            },
          },
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        data: {
          members,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/groups/:id/members
   * Add a member to a group
   */
  fastify.post(
    '/:id/members',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = groupIdParamSchema.safeParse(request.params);
      const bodyResult = addMemberSchema.safeParse(request.body);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid group ID format',
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
      const data = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Check management permissions
      const canManage = await canManageGroup(id, userId, userType);
      if (!canManage) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to add members to this group',
        });
      }

      // Get group to check member limits
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              emsMembers: { where: { isActive: true } },
              publicMembers: { where: { isActive: true } },
            },
          },
        },
      });

      if (!group) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Group not found',
        });
      }

      // Check member limit
      const currentMemberCount = group._count.emsMembers + group._count.publicMembers;
      if (group.maxMembers && currentMemberCount >= group.maxMembers) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Group has reached maximum member limit',
        });
      }

      // Add member based on type
      if (data.emsUserId) {
        // Verify EMS user exists and is in the same client
        const emsUser = await prisma.eMSUser.findUnique({
          where: { id: data.emsUserId },
          select: { id: true, clientId: true, firstName: true, lastName: true },
        });

        if (!emsUser) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'EMS user not found',
          });
        }

        if (emsUser.clientId !== group.clientId) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'EMS user must be in the same client organization',
          });
        }

        // Check for existing membership
        const existing = await prisma.eMSGroupMember.findUnique({
          where: { userId_groupId: { userId: data.emsUserId, groupId: id } },
        });

        if (existing) {
          if (existing.isActive) {
            return reply.status(409).send({
              statusCode: 409,
              error: 'Conflict',
              message: 'User is already a member of this group',
            });
          }

          // Reactivate existing membership
          await prisma.eMSGroupMember.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              isLeader: data.isLeader,
              leftAt: null,
            },
          });
        } else {
          // Create new membership
          await prisma.eMSGroupMember.create({
            data: {
              userId: data.emsUserId,
              groupId: id,
              isLeader: data.isLeader,
              isActive: true,
            },
          });
        }

        return reply.status(201).send({
          statusCode: 201,
          message: 'Member added successfully',
          data: {
            member: {
              userId: emsUser.id,
              name: `${emsUser.firstName} ${emsUser.lastName}`,
              userType: 'ems',
              isLeader: data.isLeader,
            },
          },
        });
      } else if (data.publicUserId) {
        // Verify public user exists
        const publicUser = await prisma.publicUser.findUnique({
          where: { id: data.publicUserId },
          select: { id: true, firstName: true, lastName: true, displayName: true },
        });

        if (!publicUser) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Public user not found',
          });
        }

        // Check for existing membership
        const existing = await prisma.publicGroupMember.findUnique({
          where: { userId_groupId: { userId: data.publicUserId, groupId: id } },
        });

        if (existing) {
          if (existing.isActive) {
            return reply.status(409).send({
              statusCode: 409,
              error: 'Conflict',
              message: 'User is already a member of this group',
            });
          }

          // Reactivate existing membership
          await prisma.publicGroupMember.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              isLeader: data.isLeader,
              leftAt: null,
            },
          });
        } else {
          // Create new membership
          await prisma.publicGroupMember.create({
            data: {
              userId: data.publicUserId,
              groupId: id,
              isLeader: data.isLeader,
              isActive: true,
            },
          });
        }

        return reply.status(201).send({
          statusCode: 201,
          message: 'Member added successfully',
          data: {
            member: {
              userId: publicUser.id,
              name: publicUser.displayName || `${publicUser.firstName} ${publicUser.lastName}`,
              userType: 'public',
              isLeader: data.isLeader,
            },
          },
        });
      }

      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid member data',
      });
    }
  );

  /**
   * DELETE /api/v1/groups/:id/members/:userId
   * Remove a member from a group
   */
  fastify.delete(
    '/:id/members/:userId',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = memberUserIdParamSchema.safeParse(request.params);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid parameters',
        });
      }

      const { id, userId: memberUserId } = paramResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Users can remove themselves, or managers can remove others
      const isSelf = memberUserId === userId;
      const canManage = await canManageGroup(id, userId, userType);

      if (!isSelf && !canManage) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to remove this member',
        });
      }

      // Try to find and deactivate membership in either table
      const [emsMember, publicMember] = await Promise.all([
        prisma.eMSGroupMember.findFirst({
          where: { groupId: id, userId: memberUserId, isActive: true },
        }),
        prisma.publicGroupMember.findFirst({
          where: { groupId: id, userId: memberUserId, isActive: true },
        }),
      ]);

      if (!emsMember && !publicMember) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Member not found in this group',
        });
      }

      if (emsMember) {
        await prisma.eMSGroupMember.update({
          where: { id: emsMember.id },
          data: { isActive: false, leftAt: new Date() },
        });
      }

      if (publicMember) {
        await prisma.publicGroupMember.update({
          where: { id: publicMember.id },
          data: { isActive: false, leftAt: new Date() },
        });
      }

      return reply.status(200).send({
        statusCode: 200,
        message: 'Member removed successfully',
      });
    }
  );

  /**
   * PUT /api/v1/groups/:id/members/:userId
   * Update a member's role in a group
   */
  fastify.put(
    '/:id/members/:userId',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramResult = memberUserIdParamSchema.safeParse(request.params);
      const bodyResult = updateMemberRoleSchema.safeParse(request.body);

      if (!paramResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid parameters',
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

      const { id, userId: memberUserId } = paramResult.data;
      const data = bodyResult.data;
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Check management permissions
      const canManage = await canManageGroup(id, userId, userType);
      if (!canManage) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to update member roles',
        });
      }

      // Try to find membership in either table
      const [emsMember, publicMember] = await Promise.all([
        prisma.eMSGroupMember.findFirst({
          where: { groupId: id, userId: memberUserId },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        }),
        prisma.publicGroupMember.findFirst({
          where: { groupId: id, userId: memberUserId },
          include: {
            user: { select: { firstName: true, lastName: true, displayName: true } },
          },
        }),
      ]);

      if (!emsMember && !publicMember) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Member not found in this group',
        });
      }

      // Build update data
      const updateData: { isLeader?: boolean; isActive?: boolean } = {};
      if (data.isLeader !== undefined) updateData.isLeader = data.isLeader;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      if (emsMember) {
        const updated = await prisma.eMSGroupMember.update({
          where: { id: emsMember.id },
          data: updateData,
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        return reply.status(200).send({
          statusCode: 200,
          message: 'Member role updated successfully',
          data: {
            member: {
              userId: updated.user.id,
              name: `${updated.user.firstName} ${updated.user.lastName}`,
              userType: 'ems',
              isLeader: updated.isLeader,
              isActive: updated.isActive,
            },
          },
        });
      }

      if (publicMember) {
        const updated = await prisma.publicGroupMember.update({
          where: { id: publicMember.id },
          data: updateData,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, displayName: true } },
          },
        });

        return reply.status(200).send({
          statusCode: 200,
          message: 'Member role updated successfully',
          data: {
            member: {
              userId: updated.user.id,
              name: updated.user.displayName || `${updated.user.firstName} ${updated.user.lastName}`,
              userType: 'public',
              isLeader: updated.isLeader,
              isActive: updated.isActive,
            },
          },
        });
      }

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to update member',
      });
    }
  );
}

// ============================================================================
// Helper: Map extended group types to Prisma GroupType enum
// ============================================================================

function mapToPrismaGroupType(extendedType: string): 'EMERGENCY_RESPONSE' | 'VOLUNTEER' | 'NEIGHBORHOOD_WATCH' | 'COMMUNITY_SUPPORT' | 'SEARCH_AND_RESCUE' | 'MEDICAL_RESPONSE' | 'LOGISTICS' | 'COMMUNICATIONS' | 'COMMAND' {
  const mapping: Record<string, 'EMERGENCY_RESPONSE' | 'VOLUNTEER' | 'NEIGHBORHOOD_WATCH' | 'COMMUNITY_SUPPORT' | 'SEARCH_AND_RESCUE' | 'MEDICAL_RESPONSE' | 'LOGISTICS' | 'COMMUNICATIONS' | 'COMMAND'> = {
    // Organizational -> COMMAND
    DEPARTMENT: 'COMMAND',
    DIVISION: 'COMMAND',
    UNIT: 'EMERGENCY_RESPONSE',
    TEAM: 'EMERGENCY_RESPONSE',
    SHIFT: 'EMERGENCY_RESPONSE',
    // Geographic -> COMMUNITY_SUPPORT
    ZONE: 'COMMUNITY_SUPPORT',
    DISTRICT: 'COMMUNITY_SUPPORT',
    NEIGHBORHOOD: 'NEIGHBORHOOD_WATCH',
    EVACUATION_AREA: 'EMERGENCY_RESPONSE',
    // Functional -> Direct mapping
    SEARCH_TEAM: 'SEARCH_AND_RESCUE',
    MEDICAL_TEAM: 'MEDICAL_RESPONSE',
    LOGISTICS: 'LOGISTICS',
    COMMUNICATIONS: 'COMMUNICATIONS',
    COMMAND_STAFF: 'COMMAND',
    // Community -> Direct mapping
    NEIGHBORHOOD_WATCH: 'NEIGHBORHOOD_WATCH',
    VOLUNTEER_TEAM: 'VOLUNTEER',
    CERT_TEAM: 'VOLUNTEER',
    // Legacy types (pass through)
    EMERGENCY_RESPONSE: 'EMERGENCY_RESPONSE',
    VOLUNTEER: 'VOLUNTEER',
    COMMUNITY_SUPPORT: 'COMMUNITY_SUPPORT',
    SEARCH_AND_RESCUE: 'SEARCH_AND_RESCUE',
    MEDICAL_RESPONSE: 'MEDICAL_RESPONSE',
    COMMAND: 'COMMAND',
  };

  return mapping[extendedType] || 'COMMUNITY_SUPPORT';
}

export default groupRoutes;
