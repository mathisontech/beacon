/**
 * Status Types for Beacon Application
 * Defines person status reporting interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Type of person reporting the status
 */
export enum ReporterType {
  SELF = 'self',
  FAMILY_MEMBER = 'family_member',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  EMERGENCY_CONTACT = 'emergency_contact',
  EMS_RESPONDER = 'ems_responder',
  WITNESS = 'witness',
  OFFICIAL = 'official',
  UNKNOWN = 'unknown',
}

/**
 * Type of person the status is about
 */
export enum SubjectType {
  SELF = 'self',
  FAMILY_MEMBER = 'family_member',
  DEPENDENT = 'dependent',
  PET = 'pet',
  NEIGHBOR = 'neighbor',
  ACQUAINTANCE = 'acquaintance',
  STRANGER = 'stranger',
  GROUP = 'group',
}

/**
 * Safety status of a person
 */
export enum SafetyStatus {
  SAFE = 'safe',
  SAFE_NEEDS_ASSISTANCE = 'safe_needs_assistance',
  MINOR_INJURY = 'minor_injury',
  SERIOUS_INJURY = 'serious_injury',
  CRITICAL = 'critical',
  MISSING = 'missing',
  UNACCOUNTED = 'unaccounted',
  EVACUATED = 'evacuated',
  SHELTERING = 'sheltering',
  EN_ROUTE = 'en_route',
  UNKNOWN = 'unknown',
}

/**
 * Confidence level in the reported status
 */
export enum StatusConfidence {
  CONFIRMED = 'confirmed',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNVERIFIED = 'unverified',
}

/**
 * Visibility of the status report
 */
export enum StatusVisibility {
  PUBLIC = 'public',
  GROUPS_ONLY = 'groups_only',
  CONTACTS_ONLY = 'contacts_only',
  EMS_ONLY = 'ems_only',
  PRIVATE = 'private',
}

/**
 * Method used to report the status
 */
export enum ReportingMethod {
  APP = 'app',
  SMS = 'sms',
  PHONE_CALL = 'phone_call',
  WEB = 'web',
  IN_PERSON = 'in_person',
  AUTOMATED = 'automated',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Location at the time of status report
 */
export interface StatusLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  locationName?: string;
  timestamp: Date;
}

/**
 * Needs or assistance required
 */
export interface AssistanceNeeds {
  medical: boolean;
  rescue: boolean;
  shelter: boolean;
  food: boolean;
  water: boolean;
  transportation: boolean;
  communication: boolean;
  petCare: boolean;
  other?: string;
  urgencyLevel?: 'immediate' | 'within_hours' | 'within_day' | 'when_possible';
}

/**
 * Main PersonStatus interface
 */
export interface PersonStatus {
  id: string;

  // Who is this about
  subjectUserId?: string;
  subjectName: string;
  subjectType: SubjectType;

  // Who reported it
  reporterUserId: string;
  reporterName?: string;
  reporterType: ReporterType;
  reportingMethod: ReportingMethod;

  // Status details
  safetyStatus: SafetyStatus;
  confidence: StatusConfidence;
  visibility: StatusVisibility;

  // Location
  location?: StatusLocation;
  lastKnownLocation?: StatusLocation;
  intendedDestination?: string;

  // Additional info
  message?: string;
  needs?: AssistanceNeeds;
  contactInfo?: string;
  numberOfPeople?: number;
  hasDependents?: boolean;
  hasPets?: boolean;

  // Event association
  eventId?: string;
  groupIds?: string[];

  // Timestamps
  reportedAt: Date;
  statusAsOf: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Verification
  verifiedById?: string;
  verifiedAt?: Date;
  verificationNotes?: string;

  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Status update history entry
 */
export interface StatusHistory {
  id: string;
  personStatusId: string;
  previousStatus: SafetyStatus;
  newStatus: SafetyStatus;
  changedById: string;
  changedByName?: string;
  reason?: string;
  timestamp: Date;
}

/**
 * Aggregated status for a group
 */
export interface GroupStatusSummary {
  groupId: string;
  groupName: string;
  totalMembers: number;
  statusCounts: Record<SafetyStatus, number>;
  lastUpdateAt: Date;
  pendingCheckIns: number;
}

/**
 * Create status request payload
 */
export interface CreateStatusPayload {
  subjectUserId?: string;
  subjectName: string;
  subjectType: SubjectType;
  safetyStatus: SafetyStatus;
  visibility?: StatusVisibility;
  location?: Omit<StatusLocation, 'timestamp'>;
  message?: string;
  needs?: AssistanceNeeds;
  eventId?: string;
  groupIds?: string[];
  numberOfPeople?: number;
  hasDependents?: boolean;
  hasPets?: boolean;
  intendedDestination?: string;
}

/**
 * Update status request payload
 */
export interface UpdateStatusPayload {
  safetyStatus?: SafetyStatus;
  visibility?: StatusVisibility;
  location?: Omit<StatusLocation, 'timestamp'>;
  message?: string;
  needs?: AssistanceNeeds;
  intendedDestination?: string;
  expiresAt?: Date;
}

/**
 * Status check-in request
 */
export interface CheckInRequest {
  eventId?: string;
  safetyStatus: SafetyStatus;
  location?: Omit<StatusLocation, 'timestamp'>;
  message?: string;
  notifyGroups?: boolean;
  notifyContacts?: boolean;
}
