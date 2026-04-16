/**
 * Alert Types for Beacon Application
 * Defines alerts and user notifications interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of alerts
 */
export enum AlertType {
  // Emergency Alerts
  EVACUATION_ORDER = 'evacuation_order',
  EVACUATION_WARNING = 'evacuation_warning',
  SHELTER_IN_PLACE = 'shelter_in_place',
  ALL_CLEAR = 'all_clear',

  // Weather
  SEVERE_WEATHER = 'severe_weather',
  TORNADO_WARNING = 'tornado_warning',
  FLOOD_WARNING = 'flood_warning',
  HURRICANE_WARNING = 'hurricane_warning',
  WINTER_STORM = 'winter_storm',
  HEAT_ADVISORY = 'heat_advisory',
  AIR_QUALITY = 'air_quality',

  // Natural Hazards
  WILDFIRE = 'wildfire',
  EARTHQUAKE = 'earthquake',
  TSUNAMI = 'tsunami',
  VOLCANIC = 'volcanic',
  LANDSLIDE = 'landslide',

  // Public Safety
  AMBER_ALERT = 'amber_alert',
  SILVER_ALERT = 'silver_alert',
  BLUE_ALERT = 'blue_alert',
  ACTIVE_THREAT = 'active_threat',
  CIVIL_DANGER = 'civil_danger',

  // Infrastructure
  POWER_OUTAGE = 'power_outage',
  WATER_ADVISORY = 'water_advisory',
  GAS_LEAK = 'gas_leak',
  ROAD_CLOSURE = 'road_closure',

  // Communication
  TEST = 'test',
  INFORMATIONAL = 'informational',
  UPDATE = 'update',
  CANCELLATION = 'cancellation',
}

/**
 * Source of the alert
 */
export enum AlertSource {
  // Government
  NWS = 'nws', // National Weather Service
  FEMA = 'fema',
  LOCAL_GOVERNMENT = 'local_government',
  STATE_GOVERNMENT = 'state_government',
  FEDERAL = 'federal',

  // Emergency Services
  FIRE_DEPARTMENT = 'fire_department',
  POLICE_DEPARTMENT = 'police_department',
  EMS = 'ems',
  EMERGENCY_MANAGEMENT = 'emergency_management',

  // Utilities
  POWER_COMPANY = 'power_company',
  WATER_UTILITY = 'water_utility',
  GAS_COMPANY = 'gas_company',

  // Internal
  BEACON_SYSTEM = 'beacon_system',
  BEACON_ADMIN = 'beacon_admin',
  USER_GENERATED = 'user_generated',

  // Other
  THIRD_PARTY = 'third_party',
  UNKNOWN = 'unknown',
}

/**
 * Severity level of the alert
 */
export enum AlertSeverity {
  EXTREME = 'extreme',
  SEVERE = 'severe',
  MODERATE = 'moderate',
  MINOR = 'minor',
  UNKNOWN = 'unknown',
}

/**
 * Current status of an alert
 */
export enum AlertStatus {
  ACTIVE = 'active',
  UPDATED = 'updated',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUPERSEDED = 'superseded',
}

/**
 * Urgency level for the alert
 */
export enum AlertUrgency {
  IMMEDIATE = 'immediate',
  EXPECTED = 'expected',
  FUTURE = 'future',
  PAST = 'past',
  UNKNOWN = 'unknown',
}

/**
 * Certainty level of the alert
 */
export enum AlertCertainty {
  OBSERVED = 'observed',
  LIKELY = 'likely',
  POSSIBLE = 'possible',
  UNLIKELY = 'unlikely',
  UNKNOWN = 'unknown',
}

/**
 * Types of user notifications
 */
export enum NotificationType {
  // Alerts
  EMERGENCY_ALERT = 'emergency_alert',
  WEATHER_ALERT = 'weather_alert',
  SAFETY_ALERT = 'safety_alert',

  // Status
  STATUS_REQUEST = 'status_request',
  STATUS_UPDATE = 'status_update',
  CHECK_IN_REMINDER = 'check_in_reminder',

  // Groups
  GROUP_INVITE = 'group_invite',
  GROUP_UPDATE = 'group_update',
  MEMBER_STATUS = 'member_status',

  // Events
  EVENT_UPDATE = 'event_update',
  EVENT_RESOLVED = 'event_resolved',

  // System
  SYSTEM_MESSAGE = 'system_message',
  ACCOUNT_UPDATE = 'account_update',
  VERIFICATION = 'verification',
}

/**
 * Delivery status of a notification
 */
export enum NotificationDeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/**
 * Delivery channel for notifications
 */
export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Geographic area affected by an alert
 */
export interface AlertArea {
  name: string;
  description?: string;
  polygon?: number[][];
  circle?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  geocodes?: {
    type: string;
    value: string;
  }[];
  fipsCode?: string;
  zipCodes?: string[];
}

/**
 * Main Alert interface
 */
export interface Alert {
  id: string;
  type: AlertType;
  source: AlertSource;
  severity: AlertSeverity;
  status: AlertStatus;
  urgency: AlertUrgency;
  certainty: AlertCertainty;

  // Content
  headline: string;
  description: string;
  instruction?: string;
  areaDescription?: string;

  // Affected areas
  areas: AlertArea[];

  // Timing
  issuedAt: Date;
  effectiveAt: Date;
  expiresAt: Date;
  updatedAt?: Date;

  // Source info
  senderName?: string;
  senderId?: string;
  senderEmail?: string;
  senderPhone?: string;
  webUrl?: string;

  // References
  eventId?: string;
  externalId?: string;
  references?: string[];
  supersedes?: string[];
  supersededBy?: string;

  // Response
  responseTypes?: string[];
  category?: string[];

  // Metadata
  language?: string;
  parameters?: Record<string, string>;
  metadata?: Record<string, unknown>;

  // System
  createdAt: Date;
}

/**
 * User notification interface
 */
export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;

  // Content
  title: string;
  body: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;

  // Delivery
  channels: NotificationChannel[];
  deliveryStatus: Record<NotificationChannel, NotificationDeliveryStatus>;

  // Priority
  priority: 'critical' | 'high' | 'normal' | 'low';
  canSnooze: boolean;
  snoozedUntil?: Date;

  // References
  alertId?: string;
  eventId?: string;
  groupId?: string;
  relatedUserId?: string;

  // Status
  isRead: boolean;
  readAt?: Date;
  isDismissed: boolean;
  dismissedAt?: Date;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;

  // Metadata
  data?: Record<string, unknown>;
}

/**
 * Notification preferences for a user
 */
export interface UserNotificationPreferences {
  userId: string;

  // Channel preferences
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;

  // Type preferences
  enabledTypes: NotificationType[];
  mutedTypes: NotificationType[];

  // Alert preferences
  alertSeverityThreshold: AlertSeverity;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;
  quietHoursTimezone?: string;
  emergencyOverride: boolean;

  // Location-based
  locationAlertsEnabled: boolean;
  homeAlertRadius?: number; // in km
  currentLocationAlerts: boolean;

  updatedAt: Date;
}

/**
 * Create alert request payload (admin)
 */
export interface CreateAlertPayload {
  type: AlertType;
  severity: AlertSeverity;
  urgency: AlertUrgency;
  certainty: AlertCertainty;
  headline: string;
  description: string;
  instruction?: string;
  areas: AlertArea[];
  effectiveAt?: Date;
  expiresAt: Date;
  eventId?: string;
  responseTypes?: string[];
}

/**
 * Send notification request
 */
export interface SendNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  channels?: NotificationChannel[];
  priority?: 'critical' | 'high' | 'normal' | 'low';
  alertId?: string;
  eventId?: string;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  data?: Record<string, unknown>;
}

/**
 * Bulk notification request
 */
export interface BulkNotificationPayload {
  userIds?: string[];
  groupIds?: string[];
  eventId?: string;
  type: NotificationType;
  title: string;
  body: string;
  channels?: NotificationChannel[];
  priority?: 'critical' | 'high' | 'normal' | 'low';
  alertId?: string;
  data?: Record<string, unknown>;
}
