/**
 * Event Types for Beacon Application
 * Defines all event-related interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of emergency events
 */
export enum EventType {
  // Natural Disasters
  WILDFIRE = 'wildfire',
  EARTHQUAKE = 'earthquake',
  FLOOD = 'flood',
  HURRICANE = 'hurricane',
  TORNADO = 'tornado',
  TSUNAMI = 'tsunami',
  LANDSLIDE = 'landslide',
  VOLCANIC_ACTIVITY = 'volcanic_activity',
  SEVERE_WEATHER = 'severe_weather',
  WINTER_STORM = 'winter_storm',

  // Human-Made Emergencies
  HAZMAT = 'hazmat',
  INDUSTRIAL_ACCIDENT = 'industrial_accident',
  STRUCTURE_FIRE = 'structure_fire',
  VEHICLE_ACCIDENT = 'vehicle_accident',
  INFRASTRUCTURE_FAILURE = 'infrastructure_failure',
  POWER_OUTAGE = 'power_outage',

  // Public Safety
  ACTIVE_THREAT = 'active_threat',
  CIVIL_UNREST = 'civil_unrest',
  MISSING_PERSON = 'missing_person',
  EVACUATION = 'evacuation',

  // Medical
  MEDICAL_EMERGENCY = 'medical_emergency',
  MASS_CASUALTY = 'mass_casualty',

  // Other
  AMBER_ALERT = 'amber_alert',
  SILVER_ALERT = 'silver_alert',
  OTHER = 'other',
}

/**
 * Severity levels for events
 */
export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  ADVISORY = 'advisory',
}

/**
 * Current status of an event
 */
export enum EventStatus {
  ACTIVE = 'active',
  MONITORING = 'monitoring',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

/**
 * Access level for event workspaces
 */
export enum AccessLevel {
  PUBLIC = 'public',
  REGISTERED = 'registered',
  EMS_ONLY = 'ems_only',
  ADMIN_ONLY = 'admin_only',
  RESTRICTED = 'restricted',
}

/**
 * Source of event creation/detection
 */
export enum EventSource {
  AUTOMATED = 'automated',
  EMS_REPORTED = 'ems_reported',
  PUBLIC_REPORTED = 'public_reported',
  GOVERNMENT_AGENCY = 'government_agency',
  THIRD_PARTY_API = 'third_party_api',
  MANUAL_ENTRY = 'manual_entry',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Geographic boundary for an event
 */
export interface EventBoundary {
  type: 'polygon' | 'circle' | 'point';
  coordinates: number[][] | number[];
  radius?: number; // For circle type, in meters
}

/**
 * Location information for an event
 */
export interface EventLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  county?: string;
  zipCode?: string;
  country?: string;
  boundary?: EventBoundary;
}

/**
 * Timeline entry for event history
 */
export interface EventTimelineEntry {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  previousValue?: string;
  newValue?: string;
}

/**
 * Resource assigned to an event
 */
export interface EventResource {
  id: string;
  type: string;
  name: string;
  status: 'assigned' | 'en_route' | 'on_scene' | 'released';
  assignedAt: Date;
  arrivedAt?: Date;
  releasedAt?: Date;
  agencyId?: string;
  notes?: string;
}

/**
 * Main Event interface
 */
export interface Event {
  id: string;
  type: EventType;
  severity: Severity;
  status: EventStatus;
  accessLevel: AccessLevel;
  source: EventSource;

  // Basic Info
  title: string;
  description: string;
  instructions?: string;

  // Location
  location: EventLocation;
  affectedAreas?: EventLocation[];

  // Timing
  reportedAt: Date;
  startedAt?: Date;
  expectedEndAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // People
  createdById: string;
  createdByName?: string;
  assignedToId?: string;
  assignedToName?: string;

  // Related Data
  workspaceId?: string;
  parentEventId?: string;
  relatedEventIds?: string[];

  // Metrics
  affectedPopulation?: number;
  casualtyCount?: number;
  evacuationCount?: number;

  // Resources
  resources?: EventResource[];

  // Metadata
  tags?: string[];
  externalIds?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * Event Workspace for coordinating response
 */
export interface EventWorkspace {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  accessLevel: AccessLevel;

  // Members
  coordinatorIds: string[];
  memberIds: string[];
  agencyIds?: string[];

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;

  // Configuration
  settings: WorkspaceSettings;

  // Activity
  timeline?: EventTimelineEntry[];
}

/**
 * Settings for an event workspace
 */
export interface WorkspaceSettings {
  allowPublicViewing: boolean;
  allowPublicReporting: boolean;
  requireApproval: boolean;
  notifyOnUpdate: boolean;
  autoArchiveAfterDays?: number;
}

/**
 * Summary statistics for an event
 */
export interface EventSummary {
  eventId: string;
  totalTags: number;
  confirmedTags: number;
  activeAlerts: number;
  statusReports: number;
  lastUpdateAt: Date;
  responseTeamSize: number;
}

/**
 * Create event request payload
 */
export interface CreateEventPayload {
  type: EventType;
  severity: Severity;
  title: string;
  description: string;
  location: EventLocation;
  accessLevel?: AccessLevel;
  instructions?: string;
  startedAt?: Date;
  expectedEndAt?: Date;
  tags?: string[];
  createWorkspace?: boolean;
}

/**
 * Update event request payload
 */
export interface UpdateEventPayload {
  severity?: Severity;
  status?: EventStatus;
  accessLevel?: AccessLevel;
  title?: string;
  description?: string;
  instructions?: string;
  location?: Partial<EventLocation>;
  expectedEndAt?: Date;
  resolvedAt?: Date;
  affectedPopulation?: number;
  casualtyCount?: number;
  evacuationCount?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}
