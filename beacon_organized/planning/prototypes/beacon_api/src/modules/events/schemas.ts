import { z } from 'zod';

// ============================================================================
// Enums matching Prisma schema
// ============================================================================

export const EventTypeEnum = z.enum([
  'WILDFIRE',
  'EARTHQUAKE',
  'FLOOD',
  'HURRICANE',
  'TORNADO',
  'TSUNAMI',
  'WINTER_STORM',
  'HEAT_WAVE',
  'DROUGHT',
  'LANDSLIDE',
  'VOLCANIC_ACTIVITY',
  'HAZMAT_SPILL',
  'INFRASTRUCTURE_FAILURE',
  'CIVIL_UNREST',
  'ACTIVE_SHOOTER',
  'MISSING_PERSON',
  'MASS_CASUALTY',
  'PANDEMIC',
  'UTILITY_OUTAGE',
  'TRAFFIC_INCIDENT',
  'OTHER',
]);

export const SeverityEnum = z.enum([
  'MINOR',
  'MODERATE',
  'SEVERE',
  'EXTREME',
  'CATASTROPHIC',
]);

export const EventStatusEnum = z.enum([
  'MONITORING',
  'ALERT',
  'ACTIVE_RESPONSE',
  'CONTAINED',
  'RECOVERY',
  'RESOLVED',
  'ARCHIVED',
]);

export const AccessLevelEnum = z.enum([
  'VIEWER',
  'CONTRIBUTOR',
  'EDITOR',
  'MANAGER',
  'ADMIN',
]);

// ============================================================================
// GeoJSON Schema for affected areas
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
// Event Schemas
// ============================================================================

// Query params for listing events
export const listEventsQuerySchema = z.object({
  status: EventStatusEnum.optional(),
  clientId: z.string().uuid().optional(),
  type: EventTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  isPublic: z.coerce.boolean().optional(),
  // Bounding box filter: minLng,minLat,maxLng,maxLat
  bbox: z.string().regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/).optional(),
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  // Sorting
  sortBy: z.enum(['createdAt', 'updatedAt', 'startedAt', 'severity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Create event request body
export const createEventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  type: EventTypeEnum,
  severity: SeverityEnum,
  status: EventStatusEnum.default('MONITORING'),

  // Location
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationName: z.string().max(255).optional(),
  affectedAreaGeoJson: GeoJSONGeometrySchema.optional(),

  // Timeline
  startedAt: z.coerce.date().optional(),
  expectedEndAt: z.coerce.date().optional(),

  // External references
  externalId: z.string().max(255).optional(),
  externalSource: z.string().max(255).optional(),
  externalUrl: z.string().url().optional(),

  // Metadata
  estimatedAffectedPopulation: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  requiresEvacuation: z.boolean().default(false),

  // Client association (optional for global events)
  clientId: z.string().uuid().optional(),
});

// Update event request body
export const updateEventSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  type: EventTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  status: EventStatusEnum.optional(),

  // Location
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationName: z.string().max(255).optional(),
  affectedAreaGeoJson: GeoJSONGeometrySchema.optional(),

  // Timeline
  startedAt: z.coerce.date().optional(),
  expectedEndAt: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),

  // External references
  externalId: z.string().max(255).optional(),
  externalSource: z.string().max(255).optional(),
  externalUrl: z.string().url().optional(),

  // Metadata
  estimatedAffectedPopulation: z.number().int().positive().optional(),
  isPublic: z.boolean().optional(),
  requiresEvacuation: z.boolean().optional(),
});

// Event ID param
export const eventIdParamSchema = z.object({
  id: z.string().uuid(),
});

// ============================================================================
// Workspace Schemas
// ============================================================================

// Create workspace request body
export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  groupId: z.string().uuid().optional(),
});

// Invite to workspace request body
export const inviteToWorkspaceSchema = z.object({
  // Can invite either an EMS user or a public user
  emsUserId: z.string().uuid().optional(),
  publicUserId: z.string().uuid().optional(),
  accessLevel: AccessLevelEnum.default('VIEWER'),
}).refine(
  (data) => data.emsUserId || data.publicUserId,
  { message: 'Either emsUserId or publicUserId must be provided' }
).refine(
  (data) => !(data.emsUserId && data.publicUserId),
  { message: 'Cannot provide both emsUserId and publicUserId' }
);

// Update workspace access request body
export const updateWorkspaceAccessSchema = z.object({
  participantId: z.string().uuid(),
  accessLevel: AccessLevelEnum.optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.accessLevel !== undefined || data.isActive !== undefined,
  { message: 'At least one of accessLevel or isActive must be provided' }
);

// ============================================================================
// Type exports
// ============================================================================

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventIdParam = z.infer<typeof eventIdParamSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteToWorkspaceInput = z.infer<typeof inviteToWorkspaceSchema>;
export type UpdateWorkspaceAccessInput = z.infer<typeof updateWorkspaceAccessSchema>;
