import { z } from 'zod';

// ============================================================================
// Enums matching Prisma schema
// ============================================================================

export const ReporterTypeEnum = z.enum([
  'SELF',
  'FAMILY_MEMBER',
  'NEIGHBOR',
  'RESPONDER',
  'OFFICIAL',
  'ANONYMOUS',
]);

export const SubjectTypeEnum = z.enum([
  'SELF',
  'FAMILY_MEMBER',
  'DEPENDENT',
  'PET',
  'OTHER_PERSON',
]);

export const SafetyStatusEnum = z.enum([
  'SAFE',
  'NEEDS_ASSISTANCE',
  'INJURED',
  'IN_DANGER',
  'EVACUATING',
  'SHELTERING',
  'UNKNOWN',
  'DECEASED',
]);

export const StatusConfidenceEnum = z.enum([
  'CONFIRMED',
  'REPORTED',
  'UNVERIFIED',
  'CONFLICTING',
]);

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Schema for creating a new status report
 * Reporter type is auto-determined from auth token
 */
export const createStatusSchema = z.object({
  eventId: z.string().uuid('Invalid event ID format'),

  // Subject information
  subjectType: SubjectTypeEnum,
  subjectName: z.string().min(1).max(200).optional(),
  subjectPhone: z.string().max(20).optional(),
  subjectEmail: z.string().email().optional(),
  subjectUserId: z.string().uuid().optional(), // If reporting for a registered user
  numberOfPeople: z.number().int().min(1).max(100).default(1),

  // Status
  safetyStatus: SafetyStatusEnum,
  needsDescription: z.string().max(1000).optional(),

  // Location
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationDescription: z.string().max(500).optional(),

  // Reporter note
  reporterNote: z.string().max(1000).optional(),
});

/**
 * Schema for querying statuses with filters
 */
export const queryStatusSchema = z.object({
  // Event filter
  eventId: z.string().uuid().optional(),

  // Bounding box filter (all four required together)
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),

  // Status filters
  safetyStatus: z.union([
    SafetyStatusEnum,
    z.array(SafetyStatusEnum),
  ]).optional().transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }),

  confidence: z.union([
    StatusConfidenceEnum,
    z.array(StatusConfidenceEnum),
  ]).optional().transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }),

  // Verification filter
  isVerified: z.coerce.boolean().optional(),

  // Reporter filter
  reporterType: z.union([
    ReporterTypeEnum,
    z.array(ReporterTypeEnum),
  ]).optional().transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }),

  // Time filter
  since: z.coerce.date().optional(),
  until: z.coerce.date().optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Sorting
  sortBy: z.enum(['createdAt', 'updatedAt', 'safetyStatus']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => {
    // If any bbox param is provided, all must be provided
    const bboxParams = [data.minLat, data.maxLat, data.minLng, data.maxLng];
    const hasSomeBbox = bboxParams.some((p) => p !== undefined);
    const hasAllBbox = bboxParams.every((p) => p !== undefined);
    return !hasSomeBbox || hasAllBbox;
  },
  { message: 'All bounding box parameters (minLat, maxLat, minLng, maxLng) must be provided together' }
);

/**
 * Schema for status ID parameter
 */
export const statusIdParamSchema = z.object({
  id: z.string().uuid('Invalid status ID format'),
});

/**
 * Schema for EMS verification/upgrade of a status report
 */
export const verifyStatusSchema = z.object({
  // New confidence level after verification
  confidence: StatusConfidenceEnum.optional(),

  // Optionally update the safety status based on verification
  safetyStatus: SafetyStatusEnum.optional(),

  // Verification note
  verificationNote: z.string().max(500).optional(),

  // Mark as verified
  isVerified: z.boolean().default(true),
});

/**
 * Schema for status summary query
 */
export const statusSummaryQuerySchema = z.object({
  // Event filter (optional)
  eventId: z.string().uuid().optional(),

  // Area filter - bounding box
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),

  // Area filter - radius from point
  centerLat: z.coerce.number().min(-90).max(90).optional(),
  centerLng: z.coerce.number().min(-180).max(180).optional(),
  radiusMiles: z.coerce.number().min(0.1).max(500).optional(),

  // Time filter
  since: z.coerce.date().optional(),
}).refine(
  (data) => {
    // If any bbox param is provided, all must be provided
    const bboxParams = [data.minLat, data.maxLat, data.minLng, data.maxLng];
    const hasSomeBbox = bboxParams.some((p) => p !== undefined);
    const hasAllBbox = bboxParams.every((p) => p !== undefined);
    return !hasSomeBbox || hasAllBbox;
  },
  { message: 'All bounding box parameters must be provided together' }
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
// Type exports
// ============================================================================

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type QueryStatusInput = z.infer<typeof queryStatusSchema>;
export type StatusIdParam = z.infer<typeof statusIdParamSchema>;
export type VerifyStatusInput = z.infer<typeof verifyStatusSchema>;
export type StatusSummaryQuery = z.infer<typeof statusSummaryQuerySchema>;
