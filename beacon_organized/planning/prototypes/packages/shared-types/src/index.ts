/**
 * Beacon Shared Types
 * Central export file for all shared TypeScript types
 */

// ============================================================================
// User Types
// ============================================================================
export {
  // Enums
  AdminRole,
  EMSRole,
  AccountStatus,
  VerificationLevel,
  UserType,
  // Interfaces
  type BaseUser,
  type UserLocation,
  type AdminUser,
  type EMSUser,
  type PublicUser,
  type EmergencyContact,
  type NotificationPreferences,
  type MedicalInfo,
  type PrivacySettings,
  // Union Types
  type User,
  type UserRole,
} from './users';

// ============================================================================
// Event Types
// ============================================================================
export {
  // Enums
  EventType,
  Severity,
  EventStatus,
  AccessLevel,
  EventSource,
  // Interfaces
  type EventBoundary,
  type EventLocation,
  type EventTimelineEntry,
  type EventResource,
  type Event,
  type EventWorkspace,
  type WorkspaceSettings,
  type EventSummary,
  type CreateEventPayload,
  type UpdateEventPayload,
} from './events';

// ============================================================================
// Status Types
// ============================================================================
export {
  // Enums
  ReporterType,
  SubjectType,
  SafetyStatus,
  StatusConfidence,
  StatusVisibility,
  ReportingMethod,
  // Interfaces
  type StatusLocation,
  type AssistanceNeeds,
  type PersonStatus,
  type StatusHistory,
  type GroupStatusSummary,
  type CreateStatusPayload,
  type UpdateStatusPayload,
  type CheckInRequest,
} from './status';

// ============================================================================
// Tag Types
// ============================================================================
export {
  // Enums
  TagType,
  TagVisibility,
  TagStatus,
  TagUrgency,
  TagSource,
  ConfirmationVote,
  // Interfaces
  type TagLocation,
  type TagMedia,
  type TagConfirmation,
  type MapTag,
  type TagAreaSummary,
  type CreateTagPayload,
  type UpdateTagPayload,
  type AddConfirmationPayload,
  type TagQueryParams,
} from './tags';

// ============================================================================
// Alert Types
// ============================================================================
export {
  // Enums
  AlertType,
  AlertSource,
  AlertSeverity,
  AlertStatus,
  AlertUrgency,
  AlertCertainty,
  NotificationType,
  NotificationDeliveryStatus,
  NotificationChannel,
  // Interfaces
  type AlertArea,
  type Alert,
  type UserNotification,
  type UserNotificationPreferences,
  type CreateAlertPayload,
  type SendNotificationPayload,
  type BulkNotificationPayload,
} from './alerts';

// ============================================================================
// Group Types
// ============================================================================
export {
  // Enums
  GroupType,
  GroupMemberRole,
  MembershipStatus,
  GroupPrivacy,
  GroupJoinPolicy,
  // Interfaces
  type GroupLocation,
  type GroupSettings,
  type Group,
  type GroupMember,
  type GroupInvitation,
  type GroupJoinRequest,
  type GroupActivity,
  type GroupSummary,
  type CreateGroupPayload,
  type UpdateGroupPayload,
  type InviteMembersPayload,
  type UpdateMemberPayload,
} from './groups';

// ============================================================================
// API Types
// ============================================================================
export {
  // Auth
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type RefreshTokenRequest,
  type RefreshTokenResponse,
  type PasswordResetRequest,
  type PasswordResetConfirmRequest,
  type ChangePasswordRequest,
  type VerifyEmailRequest,
  type VerifyPhoneRequest,
  type RequestPhoneVerificationRequest,
  // Pagination
  type PaginationParams,
  type PaginationMeta,
  type PaginatedResponse,
  // Errors
  type ValidationErrorDetail,
  type ErrorResponse,
  ApiErrorCode,
  // Generic
  type SuccessResponse,
  type MessageResponse,
  type DeleteResponse,
  type BulkOperationResult,
  type HealthCheckResponse,
  // Search
  type SearchParams,
  type DateRangeFilter,
  type LocationSearchParams,
  // WebSocket
  type WebSocketMessage,
  type SubscriptionRequest,
  type SubscriptionResponse,
} from './api';
