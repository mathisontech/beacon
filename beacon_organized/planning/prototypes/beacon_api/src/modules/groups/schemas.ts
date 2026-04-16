import { z } from 'zod';

// ============================================================================
// Enums for Group Types
// ============================================================================

/**
 * Group types covering organizational, geographic, and functional groups
 * Extended beyond the Prisma GroupType enum to support all use cases
 */
export const GroupTypeEnum = z.enum([
  // Organizational groups
  'DEPARTMENT',
  'DIVISION',
  'UNIT',
  'TEAM',
  'SHIFT',
  // Geographic groups
  'ZONE',
  'DISTRICT',
  'NEIGHBORHOOD',
  'EVACUATION_AREA',
  // Functional/Response groups
  'SEARCH_TEAM',
  'MEDICAL_TEAM',
  'LOGISTICS',
  'COMMUNICATIONS',
  'COMMAND_STAFF',
  // Community groups
  'NEIGHBORHOOD_WATCH',
  'VOLUNTEER_TEAM',
  'CERT_TEAM',
  // Legacy Prisma types (for backwards compatibility)
  'EMERGENCY_RESPONSE',
  'VOLUNTEER',
  'COMMUNITY_SUPPORT',
  'SEARCH_AND_RESCUE',
  'MEDICAL_RESPONSE',
  'COMMAND',
]);

/**
 * Member role within a group
 */
export const GroupMemberRoleEnum = z.enum([
  'MEMBER',
  'LEADER',
  'COORDINATOR',
  'ADMIN',
]);

// ============================================================================
// GeoJSON Schema for geographic groups
// ============================================================================

const GeoJSONPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
});

const GeoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});

const GeoJSONMultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
});

export const GeoJSONGeometrySchema = z.union([
  GeoJSONPointSchema,
  GeoJSONPolygonSchema,
  GeoJSONMultiPolygonSchema,
]);

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Schema for listing groups with filters
 */
export const listGroupsQuerySchema = z.object({
  // Filter by group type
  type: z.union([
    GroupTypeEnum,
    z.string().transform((val) => val.split(',')),
  ]).optional(),

  // Filter by client (for EMS users)
  clientId: z.string().uuid().optional(),

  // Include public groups in results
  includePublic: z.coerce.boolean().default(true),

  // Filter by active status
  isActive: z.coerce.boolean().optional(),

  // Filter by parent group (for hierarchical groups)
  parentGroupId: z.string().uuid().optional(),

  // Search by name
  search: z.string().max(100).optional(),

  // Geographic filter - bounding box
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),

  // Geographic filter - radius from point
  centerLat: z.coerce.number().min(-90).max(90).optional(),
  centerLng: z.coerce.number().min(-180).max(180).optional(),
  radiusMiles: z.coerce.number().min(0.1).max(500).optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Sorting
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'type']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
}).refine(
  (data) => {
    // If any bbox param is provided, all must be provided
    const bboxParams = [data.minLat, data.maxLat, data.minLng, data.maxLng];
    const hasSomeBbox = bboxParams.some((p) => p !== undefined);
    const hasAllBbox = bboxParams.every((p) => p !== undefined);
    return !hasSomeBbox || hasAllBbox;
  },
  { message: 'All bounding box parameters (minLat, maxLat, minLng, maxLng) must be provided together' }
).refine(
  (data) => {
    // If any radius param is provided, all must be provided
    const radiusParams = [data.centerLat, data.centerLng, data.radiusMiles];
    const hasSomeRadius = radiusParams.some((p) => p !== undefined);
    const hasAllRadius = radiusParams.every((p) => p !== undefined);
    return !hasSomeRadius || hasAllRadius;
  },
  { message: 'All radius parameters (centerLat, centerLng, radiusMiles) must be provided together' }
);

// ============================================================================
// Create/Update Schemas
// ============================================================================

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: GroupTypeEnum,

  // Visibility
  isPublic: z.boolean().default(false),
  isActive: z.boolean().default(true),

  // Membership limits
  maxMembers: z.number().int().min(1).max(10000).optional(),

  // Base location (point)
  baseLocationLat: z.number().min(-90).max(90).optional(),
  baseLocationLng: z.number().min(-180).max(180).optional(),
  operationalRadius: z.number().positive().max(500).optional(), // miles

  // Geographic boundary (for zone/district/area types)
  boundaryGeoJson: GeoJSONGeometrySchema.optional(),

  // Hierarchy
  parentGroupId: z.string().uuid().optional(),

  // Client association (required for EMS-created groups)
  clientId: z.string().uuid().optional(),

  // Metadata
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for updating a group
 */
export const updateGroupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  type: GroupTypeEnum.optional(),

  // Visibility
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),

  // Membership limits
  maxMembers: z.number().int().min(1).max(10000).nullable().optional(),

  // Base location
  baseLocationLat: z.number().min(-90).max(90).nullable().optional(),
  baseLocationLng: z.number().min(-180).max(180).nullable().optional(),
  operationalRadius: z.number().positive().max(500).nullable().optional(),

  // Geographic boundary
  boundaryGeoJson: GeoJSONGeometrySchema.nullable().optional(),

  // Hierarchy
  parentGroupId: z.string().uuid().nullable().optional(),

  // Metadata
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

// ============================================================================
// Group ID Parameter Schema
// ============================================================================

export const groupIdParamSchema = z.object({
  id: z.string().uuid('Invalid group ID format'),
});

// ============================================================================
// Member Schemas
// ============================================================================

/**
 * Schema for querying group members
 */
export const listMembersQuerySchema = z.object({
  // Filter by member type
  memberType: z.enum(['ems', 'public', 'all']).default('all'),

  // Filter by role
  role: GroupMemberRoleEnum.optional(),

  // Filter by active status
  isActive: z.coerce.boolean().optional(),

  // Filter by leader status
  isLeader: z.coerce.boolean().optional(),

  // Search by name
  search: z.string().max(100).optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),

  // Sorting
  sortBy: z.enum(['joinedAt', 'name', 'role']).default('joinedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for adding a member to a group
 */
export const addMemberSchema = z.object({
  // User to add (one of these is required)
  emsUserId: z.string().uuid().optional(),
  publicUserId: z.string().uuid().optional(),

  // Role assignment
  isLeader: z.boolean().default(false),
  role: GroupMemberRoleEnum.default('MEMBER'),

  // Optional metadata
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.emsUserId || data.publicUserId,
  { message: 'Either emsUserId or publicUserId must be provided' }
).refine(
  (data) => !(data.emsUserId && data.publicUserId),
  { message: 'Cannot provide both emsUserId and publicUserId' }
);

/**
 * Schema for member ID parameter
 */
export const memberUserIdParamSchema = z.object({
  id: z.string().uuid('Invalid group ID format'),
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * Schema for updating a member's role in a group
 */
export const updateMemberRoleSchema = z.object({
  isLeader: z.boolean().optional(),
  role: GroupMemberRoleEnum.optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500).nullable().optional(),
}).refine(
  (data) => data.isLeader !== undefined || data.role !== undefined || data.isActive !== undefined,
  { message: 'At least one of isLeader, role, or isActive must be provided' }
);

/**
 * Schema for bulk member operations
 */
export const bulkMemberOperationSchema = z.object({
  operation: z.enum(['add', 'remove', 'update_role']),
  members: z.array(z.object({
    emsUserId: z.string().uuid().optional(),
    publicUserId: z.string().uuid().optional(),
    isLeader: z.boolean().optional(),
    role: GroupMemberRoleEnum.optional(),
  })).min(1).max(100),
});

// ============================================================================
// Type Exports
// ============================================================================

export type GroupType = z.infer<typeof GroupTypeEnum>;
export type GroupMemberRole = z.infer<typeof GroupMemberRoleEnum>;
export type GeoJSONGeometry = z.infer<typeof GeoJSONGeometrySchema>;

export type ListGroupsQuery = z.infer<typeof listGroupsQuerySchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type GroupIdParam = z.infer<typeof groupIdParamSchema>;

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type MemberUserIdParam = z.infer<typeof memberUserIdParamSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type BulkMemberOperationInput = z.infer<typeof bulkMemberOperationSchema>;
