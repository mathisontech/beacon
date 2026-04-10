/**
 * Employee Validation Schemas
 *
 * Zod schemas for employee form validation.
 */

import { z } from 'zod';

// Role options
export const EMPLOYEE_ROLES = [
  'SUPERADMIN',
  'ADMIN',
  'ACCOUNT_MANAGER',
  'ANALYST',
  'SUPPORT',
] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

// Role display names
export const ROLE_LABELS: Record<EmployeeRole, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin',
  ACCOUNT_MANAGER: 'Account Manager',
  ANALYST: 'Analyst',
  SUPPORT: 'Support',
};

// Role badge colors (same pattern as layout)
export const ROLE_BADGE_COLORS: Record<EmployeeRole, { bg: string; text: string }> = {
  SUPERADMIN: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ADMIN: { bg: 'bg-blue-100', text: 'text-blue-800' },
  ACCOUNT_MANAGER: { bg: 'bg-green-100', text: 'text-green-800' },
  ANALYST: { bg: 'bg-amber-100', text: 'text-amber-800' },
  SUPPORT: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

// Base employee schema (for creating new employees)
export const createEmployeeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(EMPLOYEE_ROLES, { message: 'Please select a role' }),
  sendWelcomeEmail: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;

// Edit employee schema (password optional, username readonly)
export const updateEmployeeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  role: z.enum(EMPLOYEE_ROLES, { message: 'Please select a role' }),
  isActive: z.boolean(),
  // Password fields are optional for updates
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    // If password is provided, confirmPassword must match
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

// Check uniqueness request schema
export const checkUniqueSchema = z.object({
  field: z.enum(['username', 'email']),
  value: z.string().min(1),
  excludeId: z.string().optional(),
});

export type CheckUniqueRequest = z.infer<typeof checkUniqueSchema>;
