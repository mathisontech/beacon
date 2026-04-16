import { z } from 'zod';

// ============================================================================
// Enums matching Prisma schema
// ============================================================================

export const AlertTypeEnum = z.enum([
  'EMERGENCY',
  'WARNING',
  'WATCH',
  'ADVISORY',
  'STATEMENT',
  'UPDATE',
  'ALL_CLEAR',
  'TEST',
]);

export const AlertSourceEnum = z.enum([
  'NWS',
  'FEMA',
  'LOCAL_GOVERNMENT',
  'EMS_OFFICIAL',
  'SYSTEM_GENERATED',
  'THIRD_PARTY',
]);

export const SeverityEnum = z.enum([
  'MINOR',
  'MODERATE',
  'SEVERE',
  'EXTREME',
  'CATASTROPHIC',
]);

export const NotificationTypeEnum = z.enum([
  'PUSH',
  'SMS',
  'EMAIL',
  'IN_APP',
  'EMERGENCY_BROADCAST',
]);

// ============================================================================
// GeoJSON Schemas
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
// Alert Request Schemas
// ============================================================================

/**
 * Query params for listing alerts with filters
 */
export const listAlertsQuerySchema = z.object({
  // Bounding box filter: minLng,minLat,maxLng,maxLat
  bbox: z.string()
    .regex(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/)
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const [minLng, minLat, maxLng, maxLat] = val.split(',').map(Number);
      return { minLng, minLat, maxLng, maxLat };
    }),

  // Alert type filter (comma-separated or array)
  types: z.union([
    z.string().transform((val) => val.split(',')),
    z.array(z.string()),
  ]).optional(),

  // Severity filter (comma-separated or array)
  severity: z.union([
    z.string().transform((val) => val.split(',')),
    z.array(z.string()),
  ]).optional(),

  // Source filter
  source: AlertSourceEnum.optional(),

  // Only active alerts
  isActive: z.coerce.boolean().optional().default(true),

  // Event filter
  eventId: z.string().uuid().optional(),

  // Client filter
  clientId: z.string().uuid().optional(),

  // Time filters
  effectiveAfter: z.coerce.date().optional(),
  effectiveBefore: z.coerce.date().optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),

  // Sorting
  sortBy: z.enum(['createdAt', 'effectiveAt', 'severity', 'expiresAt']).default('effectiveAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Schema for creating a new alert
 */
export const createAlertSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(5000),
  alertType: AlertTypeEnum,
  source: AlertSourceEnum,
  severity: SeverityEnum,

  // Geographic targeting (at least one should be provided)
  targetLocationLat: z.number().min(-90).max(90).optional(),
  targetLocationLng: z.number().min(-180).max(180).optional(),
  targetRadiusMiles: z.number().positive().max(500).optional(),
  targetAreaGeoJson: GeoJSONGeometrySchema.optional(),
  targetZipCodes: z.array(z.string().regex(/^\d{5}(-\d{4})?$/)).optional(),

  // External reference
  externalId: z.string().max(255).optional(),
  externalUrl: z.string().url().optional(),

  // Timing
  effectiveAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),

  // Relations
  eventId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),

  // Immediately active
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // At least one geographic target should be provided
    const hasLocation = data.targetLocationLat !== undefined && data.targetLocationLng !== undefined;
    const hasGeoJson = data.targetAreaGeoJson !== undefined;
    const hasZipCodes = data.targetZipCodes && data.targetZipCodes.length > 0;
    return hasLocation || hasGeoJson || hasZipCodes;
  },
  { message: 'At least one geographic target (location with radius, GeoJSON area, or zip codes) must be provided' }
);

/**
 * Schema for updating an alert
 */
export const updateAlertSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  message: z.string().min(1).max(5000).optional(),
  alertType: AlertTypeEnum.optional(),
  severity: SeverityEnum.optional(),

  // Geographic targeting
  targetLocationLat: z.number().min(-90).max(90).optional(),
  targetLocationLng: z.number().min(-180).max(180).optional(),
  targetRadiusMiles: z.number().positive().max(500).optional(),
  targetAreaGeoJson: GeoJSONGeometrySchema.optional(),
  targetZipCodes: z.array(z.string().regex(/^\d{5}(-\d{4})?$/)).optional(),

  // External reference
  externalUrl: z.string().url().optional(),

  // Timing
  expiresAt: z.coerce.date().optional(),

  // Status
  isActive: z.boolean().optional(),
});

/**
 * Schema for alert ID parameter
 */
export const alertIdParamSchema = z.object({
  id: z.string().uuid('Invalid alert ID format'),
});

/**
 * Schema for personal alerts query
 */
export const personalAlertsQuerySchema = z.object({
  // Current user location
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),

  // Include alerts from subscribed zones
  includeSubscribed: z.coerce.boolean().default(true),

  // Only active alerts
  isActive: z.coerce.boolean().default(true),

  // Pagination
  limit: z.coerce.number().int().positive().max(50).default(20),
});

/**
 * Schema for proximity/heading check request
 */
export const proximityCheckSchema = z.object({
  // Current position
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),

  // Heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  heading: z.number().min(0).max(360),

  // Speed in meters per second
  speed: z.number().min(0).max(100), // Max ~360 km/h

  // Optional: projection time windows in minutes (default: 5, 10, 30)
  projectionMinutes: z.array(z.number().positive().max(120)).optional().default([5, 10, 30]),

  // Optional: filter by severity
  minSeverity: SeverityEnum.optional(),
});

// ============================================================================
// Notification Request Schemas
// ============================================================================

/**
 * Query params for listing user notifications
 */
export const listNotificationsQuerySchema = z.object({
  // Filter by read status
  isRead: z.coerce.boolean().optional(),

  // Filter by notification type
  type: NotificationTypeEnum.optional(),

  // Filter by date range
  since: z.coerce.date().optional(),

  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Schema for notification ID parameter
 */
export const notificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format'),
});

// ============================================================================
// Type exports
// ============================================================================

export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type AlertIdParam = z.infer<typeof alertIdParamSchema>;
export type PersonalAlertsQuery = z.infer<typeof personalAlertsQuerySchema>;
export type ProximityCheckInput = z.infer<typeof proximityCheckSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>;
