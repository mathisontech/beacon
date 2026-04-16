/**
 * Map Tag Types for Beacon Application
 * Defines map markers and crowd-sourced tagging interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of map tags
 */
export enum TagType {
  // Hazards
  ROAD_CLOSURE = 'road_closure',
  ROAD_DAMAGE = 'road_damage',
  DEBRIS = 'debris',
  FLOODING = 'flooding',
  DOWNED_POWER_LINE = 'downed_power_line',
  GAS_LEAK = 'gas_leak',
  FIRE = 'fire',
  STRUCTURAL_DAMAGE = 'structural_damage',
  LANDSLIDE = 'landslide',
  SINKHOLE = 'sinkhole',

  // Resources
  SHELTER = 'shelter',
  WATER_STATION = 'water_station',
  FOOD_DISTRIBUTION = 'food_distribution',
  MEDICAL_STATION = 'medical_station',
  CHARGING_STATION = 'charging_station',
  GAS_STATION = 'gas_station',
  SUPPLY_POINT = 'supply_point',

  // Services
  EVACUATION_POINT = 'evacuation_point',
  ASSEMBLY_POINT = 'assembly_point',
  COMMAND_POST = 'command_post',
  FIRST_AID = 'first_aid',
  PET_SHELTER = 'pet_shelter',
  VOLUNTEER_STATION = 'volunteer_station',

  // Information
  ROAD_OPEN = 'road_open',
  SAFE_ZONE = 'safe_zone',
  DANGER_ZONE = 'danger_zone',
  CHECKPOINT = 'checkpoint',
  INFORMATION_POINT = 'information_point',

  // Requests
  HELP_NEEDED = 'help_needed',
  SUPPLIES_NEEDED = 'supplies_needed',
  MEDICAL_NEEDED = 'medical_needed',
  RESCUE_NEEDED = 'rescue_needed',

  // Other
  GENERAL = 'general',
  OTHER = 'other',
}

/**
 * Visibility levels for tags
 */
export enum TagVisibility {
  PUBLIC = 'public',
  EVENT_PARTICIPANTS = 'event_participants',
  EMS_ONLY = 'ems_only',
  ADMIN_ONLY = 'admin_only',
}

/**
 * Current status of a tag
 */
export enum TagStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  DISPUTED = 'disputed',
  RESOLVED = 'resolved',
  EXPIRED = 'expired',
  REMOVED = 'removed',
}

/**
 * Urgency level for the tag
 */
export enum TagUrgency {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

/**
 * Source of the tag creation
 */
export enum TagSource {
  USER_REPORTED = 'user_reported',
  EMS_REPORTED = 'ems_reported',
  OFFICIAL = 'official',
  AUTOMATED = 'automated',
  THIRD_PARTY = 'third_party',
}

/**
 * Confirmation vote type
 */
export enum ConfirmationVote {
  CONFIRMED = 'confirmed',
  DISPUTED = 'disputed',
  NO_LONGER_VALID = 'no_longer_valid',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Geographic location for a tag
 */
export interface TagLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  locationName?: string;
}

/**
 * Media attachment for a tag
 */
export interface TagMedia {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  uploadedAt: Date;
  uploadedById: string;
}

/**
 * Tag confirmation/vote from users
 */
export interface TagConfirmation {
  id: string;
  tagId: string;
  userId: string;
  userName?: string;
  vote: ConfirmationVote;
  comment?: string;
  location?: TagLocation;
  timestamp: Date;
}

/**
 * Main MapTag interface
 */
export interface MapTag {
  id: string;
  type: TagType;
  status: TagStatus;
  visibility: TagVisibility;
  urgency: TagUrgency;
  source: TagSource;

  // Content
  title: string;
  description?: string;
  instructions?: string;

  // Location
  location: TagLocation;

  // Creator
  createdById: string;
  createdByName?: string;
  isAnonymous: boolean;

  // Event association
  eventId?: string;

  // Media
  media?: TagMedia[];

  // Confirmations
  confirmationCount: number;
  disputeCount: number;
  confirmations?: TagConfirmation[];

  // Timing
  reportedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Verification
  verifiedById?: string;
  verifiedByName?: string;
  verificationNotes?: string;

  // Contact info (for resource tags)
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  capacity?: number;
  currentOccupancy?: number;

  // Metadata
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Summary statistics for tags in an area
 */
export interface TagAreaSummary {
  totalTags: number;
  byType: Record<TagType, number>;
  byStatus: Record<TagStatus, number>;
  byUrgency: Record<TagUrgency, number>;
  lastUpdateAt: Date;
}

/**
 * Create tag request payload
 */
export interface CreateTagPayload {
  type: TagType;
  title: string;
  description?: string;
  instructions?: string;
  location: TagLocation;
  visibility?: TagVisibility;
  urgency?: TagUrgency;
  eventId?: string;
  isAnonymous?: boolean;
  expiresAt?: Date;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  capacity?: number;
  tags?: string[];
}

/**
 * Update tag request payload
 */
export interface UpdateTagPayload {
  status?: TagStatus;
  visibility?: TagVisibility;
  urgency?: TagUrgency;
  title?: string;
  description?: string;
  instructions?: string;
  expiresAt?: Date;
  resolvedAt?: Date;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  capacity?: number;
  currentOccupancy?: number;
  verificationNotes?: string;
  tags?: string[];
}

/**
 * Add confirmation/vote request
 */
export interface AddConfirmationPayload {
  vote: ConfirmationVote;
  comment?: string;
  location?: TagLocation;
}

/**
 * Query parameters for fetching tags
 */
export interface TagQueryParams {
  eventId?: string;
  types?: TagType[];
  statuses?: TagStatus[];
  visibility?: TagVisibility;
  urgency?: TagUrgency[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  createdAfter?: Date;
  createdBefore?: Date;
  includeExpired?: boolean;
}
