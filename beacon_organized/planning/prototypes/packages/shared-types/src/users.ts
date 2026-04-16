/**
 * User Types for Beacon Application
 * Defines all user-related interfaces and enums
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Role types for admin users within the system
 */
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  REGIONAL_ADMIN = 'regional_admin',
  SYSTEM_ADMIN = 'system_admin',
  SUPPORT_ADMIN = 'support_admin',
}

/**
 * Role types for EMS (Emergency Medical Services) users
 */
export enum EMSRole {
  DISPATCHER = 'dispatcher',
  FIELD_RESPONDER = 'field_responder',
  SUPERVISOR = 'supervisor',
  COORDINATOR = 'coordinator',
  ANALYST = 'analyst',
}

/**
 * Account status for all user types
 */
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DEACTIVATED = 'deactivated',
}

/**
 * Verification level for public users
 * Determines trust level and feature access
 */
export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  TRUSTED = 'trusted',
}

/**
 * User type discriminator for polymorphic handling
 */
export enum UserType {
  ADMIN = 'admin',
  EMS = 'ems',
  PUBLIC = 'public',
}

// ============================================================================
// Base Interfaces
// ============================================================================

/**
 * Common fields shared across all user types
 */
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * Geographic location for user-related data
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// ============================================================================
// User Type Interfaces
// ============================================================================

/**
 * Admin user interface for system administrators
 */
export interface AdminUser extends BaseUser {
  userType: UserType.ADMIN;
  role: AdminRole;
  permissions: string[];
  managedRegions?: string[];
  department?: string;
  employeeId?: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
}

/**
 * EMS user interface for emergency services personnel
 */
export interface EMSUser extends BaseUser {
  userType: UserType.EMS;
  role: EMSRole;
  agencyId: string;
  agencyName: string;
  badgeNumber?: string;
  certifications?: string[];
  serviceArea?: string[];
  onDuty: boolean;
  currentLocation?: UserLocation;
  dispatcherId?: string;
  shiftStart?: Date;
  shiftEnd?: Date;
}

/**
 * Public user interface for general app users
 */
export interface PublicUser extends BaseUser {
  userType: UserType.PUBLIC;
  verificationLevel: VerificationLevel;
  homeLocation?: UserLocation;
  emergencyContacts?: EmergencyContact[];
  notificationPreferences: NotificationPreferences;
  medicalInfo?: MedicalInfo;
  groupIds?: string[];
  trustedContactIds?: string[];
  privacySettings: PrivacySettings;
}

// ============================================================================
// Supporting Interfaces
// ============================================================================

/**
 * Emergency contact information for public users
 */
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnEmergency: boolean;
}

/**
 * Notification preferences for public users
 */
export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  alertTypes: string[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  emergencyOverride: boolean;
}

/**
 * Optional medical information for public users
 */
export interface MedicalInfo {
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyNotes?: string;
  physicianName?: string;
  physicianPhone?: string;
}

/**
 * Privacy settings for public users
 */
export interface PrivacySettings {
  shareLocationWithGroups: boolean;
  shareLocationWithEMS: boolean;
  shareStatusWithGroups: boolean;
  allowAnonymousReporting: boolean;
  visibleToPublicSearch: boolean;
}

// ============================================================================
// Union Types
// ============================================================================

/**
 * Union type for any user in the system
 */
export type User = AdminUser | EMSUser | PublicUser;

/**
 * User role union type
 */
export type UserRole = AdminRole | EMSRole;
