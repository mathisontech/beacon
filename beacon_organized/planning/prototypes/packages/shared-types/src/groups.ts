/**
 * Group Types for Beacon Application
 * Defines group and membership interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of groups
 */
export enum GroupType {
  FAMILY = 'family',
  FRIENDS = 'friends',
  NEIGHBORS = 'neighbors',
  WORKPLACE = 'workplace',
  SCHOOL = 'school',
  COMMUNITY = 'community',
  ORGANIZATION = 'organization',
  VOLUNTEER = 'volunteer',
  EMERGENCY_TEAM = 'emergency_team',
  CUSTOM = 'custom',
}

/**
 * Role of a member within a group
 */
export enum GroupMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/**
 * Status of a group membership
 */
export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  INVITED = 'invited',
  DECLINED = 'declined',
  SUSPENDED = 'suspended',
  LEFT = 'left',
  REMOVED = 'removed',
}

/**
 * Privacy level of the group
 */
export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SECRET = 'secret',
}

/**
 * Join policy for the group
 */
export enum GroupJoinPolicy {
  OPEN = 'open',
  REQUEST_TO_JOIN = 'request_to_join',
  INVITE_ONLY = 'invite_only',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Group location for location-based features
 */
export interface GroupLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  radiusKm?: number;
}

/**
 * Group settings
 */
export interface GroupSettings {
  // Privacy
  privacy: GroupPrivacy;
  joinPolicy: GroupJoinPolicy;

  // Features
  locationSharingEnabled: boolean;
  statusSharingEnabled: boolean;
  checkInRemindersEnabled: boolean;
  emergencyAlertsEnabled: boolean;

  // Notifications
  notifyOnMemberJoin: boolean;
  notifyOnStatusUpdate: boolean;
  notifyOnCheckIn: boolean;

  // Permissions
  membersCanInvite: boolean;
  membersCanPost: boolean;
  membersCanSeeMembers: boolean;

  // Check-in
  autoCheckInReminder: boolean;
  checkInReminderIntervalHours?: number;
}

/**
 * Main Group interface
 */
export interface Group {
  id: string;
  type: GroupType;
  name: string;
  description?: string;
  avatarUrl?: string;
  coverImageUrl?: string;

  // Settings
  settings: GroupSettings;

  // Location
  location?: GroupLocation;

  // Membership
  ownerId: string;
  ownerName?: string;
  memberCount: number;
  maxMembers?: number;

  // Status
  isActive: boolean;
  isVerified: boolean;

  // Event association
  eventId?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Metadata
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Group member interface
 */
export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;

  // User info (denormalized for convenience)
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;
  userPhone?: string;

  // Membership
  role: GroupMemberRole;
  status: MembershipStatus;

  // Permissions (can override group defaults)
  shareLocation: boolean;
  shareStatus: boolean;
  receiveNotifications: boolean;

  // Invitation
  invitedById?: string;
  invitedByName?: string;
  invitedAt?: Date;

  // Timestamps
  joinedAt?: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Last known status
  lastStatusId?: string;
  lastCheckInAt?: Date;
  lastLocationUpdate?: Date;

  // Notes (visible to admins)
  adminNotes?: string;
}

/**
 * Group invitation
 */
export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;

  // Inviter
  invitedById: string;
  invitedByName: string;

  // Invitee
  inviteeEmail?: string;
  inviteePhone?: string;
  inviteeUserId?: string;

  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  role: GroupMemberRole;

  // Message
  message?: string;

  // Timestamps
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
}

/**
 * Join request for groups with request_to_join policy
 */
export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;

  // Request details
  message?: string;
  status: 'pending' | 'approved' | 'rejected';

  // Response
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Group activity feed entry
 */
export interface GroupActivity {
  id: string;
  groupId: string;
  activityType: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Group summary with member stats
 */
export interface GroupSummary {
  groupId: string;
  name: string;
  memberCount: number;
  activeMembers: number;
  pendingInvites: number;
  lastActivityAt: Date;
  memberStatusSummary?: {
    safe: number;
    needsAssistance: number;
    unknown: number;
  };
}

/**
 * Create group request payload
 */
export interface CreateGroupPayload {
  type: GroupType;
  name: string;
  description?: string;
  settings?: Partial<GroupSettings>;
  location?: GroupLocation;
  avatarUrl?: string;
  eventId?: string;
  tags?: string[];
}

/**
 * Update group request payload
 */
export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  type?: GroupType;
  settings?: Partial<GroupSettings>;
  location?: GroupLocation;
  avatarUrl?: string;
  coverImageUrl?: string;
  tags?: string[];
  isActive?: boolean;
}

/**
 * Invite members request payload
 */
export interface InviteMembersPayload {
  emails?: string[];
  phones?: string[];
  userIds?: string[];
  role?: GroupMemberRole;
  message?: string;
}

/**
 * Update member request payload
 */
export interface UpdateMemberPayload {
  role?: GroupMemberRole;
  status?: MembershipStatus;
  shareLocation?: boolean;
  shareStatus?: boolean;
  receiveNotifications?: boolean;
  adminNotes?: string;
}
