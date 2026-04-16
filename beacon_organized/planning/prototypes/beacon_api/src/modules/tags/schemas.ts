import { z } from 'zod';

// Enums matching Prisma schema
export const TagTypeEnum = z.enum([
  'HAZARD',
  'ROAD_CLOSURE',
  'SHELTER',
  'RESOURCE_POINT',
  'MEDICAL_STATION',
  'EVACUATION_ROUTE',
  'STAGING_AREA',
  'COMMAND_POST',
  'DAMAGE_REPORT',
  'UTILITY_OUTAGE',
  'WATER_DISTRIBUTION',
  'FOOD_DISTRIBUTION',
  'VOLUNTEER_NEEDED',
  'PET_FRIENDLY',
  'ACCESSIBILITY',
  'CUSTOM',
]);

export const TagVisibilityEnum = z.enum([
  'PUBLIC',
  'RESPONDERS_ONLY',
  'COMMAND_ONLY',
  'CLIENT_ONLY',
]);

export const TagStatusEnum = z.enum([
  'ACTIVE',
  'VERIFIED',
  'UNVERIFIED',
  'DISPUTED',
  'RESOLVED',
  'EXPIRED',
]);

export const CreatorTypeEnum = z.enum([
  'PUBLIC_USER',
  'EMS_USER',
  'ADMIN_USER',
  'SYSTEM',
  'EXTERNAL_FEED',
]);

// Create tag schema
export const createTagSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  tagType: TagTypeEnum,
  visibility: TagVisibilityEnum.optional(),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  locationAddress: z.string().max(500).optional(),
  radiusMeters: z.number().positive().max(50000).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  externalUrl: z.string().url().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  eventId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
});

// Update tag schema (partial)
export const updateTagSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  tagType: TagTypeEnum.optional(),
  visibility: TagVisibilityEnum.optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().max(500).optional(),
  radiusMeters: z.number().positive().max(50000).nullable().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  externalUrl: z.string().url().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
});

// Query tags schema
export const queryTagsSchema = z.object({
  // Bounding box filter
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),
  // Type filter
  types: z.union([
    z.string().transform(val => val.split(',')),
    z.array(z.string()),
  ]).optional(),
  // Visibility filter
  visibility: TagVisibilityEnum.optional(),
  // Event filter
  eventId: z.string().uuid().optional(),
  // Status filter
  status: z.union([
    z.string().transform(val => val.split(',')),
    z.array(z.string()),
  ]).optional(),
  // Minimum credence score filter
  minCredence: z.coerce.number().min(0).max(1).optional(),
  // Pagination
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  // Include expired tags
  includeExpired: z.coerce.boolean().default(false),
});

// Confirm/dispute tag schema
export const confirmTagSchema = z.object({
  isConfirmation: z.boolean(),
  comment: z.string().max(500).optional(),
});

// Update tag status schema
export const updateTagStatusSchema = z.object({
  status: z.enum(['RESOLVED', 'EXPIRED', 'DISPUTED']),
  reason: z.string().max(500).optional(),
});

// Tag ID params schema
export const tagIdParamsSchema = z.object({
  id: z.string().uuid(),
});

// Type exports
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type QueryTagsInput = z.infer<typeof queryTagsSchema>;
export type ConfirmTagInput = z.infer<typeof confirmTagSchema>;
export type UpdateTagStatusInput = z.infer<typeof updateTagStatusSchema>;
export type TagIdParams = z.infer<typeof tagIdParamsSchema>;
