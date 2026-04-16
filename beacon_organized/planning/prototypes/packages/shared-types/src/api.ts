/**
 * API Types for Beacon Application
 * Defines request/response interfaces for API communication
 */

import type { AdminRole, EMSRole, UserType, VerificationLevel } from './users';

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  deviceName?: string;
  platform?: 'ios' | 'android' | 'web';
}

/**
 * Login response payload
 */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    role?: AdminRole | EMSRole;
    verificationLevel?: VerificationLevel;
    avatarUrl?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  };
  session: {
    id: string;
    deviceId?: string;
    createdAt: Date;
    expiresAt: Date;
  };
}

/**
 * Register request for public users
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  acceptPrivacyPolicy: boolean;
  marketingOptIn?: boolean;
  referralCode?: string;
}

/**
 * Register response
 */
export interface RegisterResponse {
  userId: string;
  email: string;
  verificationRequired: boolean;
  verificationMethod: 'email' | 'phone' | 'both';
  message: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

/**
 * Change password request (authenticated)
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Verify phone request
 */
export interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

/**
 * Request phone verification code
 */
export interface RequestPhoneVerificationRequest {
  phone: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata in responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Validation error detail
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    validationErrors?: ValidationErrorDetail[];
    requestId?: string;
    timestamp: Date;
  };
  status: number;
}

/**
 * Common API error codes
 */
export enum ApiErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

// ============================================================================
// Generic API Types
// ============================================================================

/**
 * Success response wrapper
 */
export interface SuccessResponse<T> {
  data: T;
  message?: string;
}

/**
 * Simple message response
 */
export interface MessageResponse {
  message: string;
  success: boolean;
}

/**
 * Delete response
 */
export interface DeleteResponse {
  deleted: boolean;
  id: string;
  message?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors?: {
    id: string;
    error: string;
  }[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: Date;
  services?: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency?: number;
    message?: string;
  }[];
}

// ============================================================================
// Search and Filter Types
// ============================================================================

/**
 * Generic search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, unknown>;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

/**
 * Location-based search parameters
 */
export interface LocationSearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * WebSocket message wrapper
 */
export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  correlationId?: string;
}

/**
 * WebSocket subscription request
 */
export interface SubscriptionRequest {
  channel: string;
  eventId?: string;
  groupId?: string;
  filters?: Record<string, unknown>;
}

/**
 * WebSocket subscription response
 */
export interface SubscriptionResponse {
  subscriptionId: string;
  channel: string;
  status: 'subscribed' | 'unsubscribed' | 'error';
  message?: string;
}
