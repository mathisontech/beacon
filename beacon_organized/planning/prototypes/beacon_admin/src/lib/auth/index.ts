/**
 * Auth helper functions for Beacon Admin
 *
 * Re-exports auth utilities and provides additional helpers
 * for checking authentication in server components and API routes.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { EmployeeRole } from '@prisma/client';

// Re-export session and activity functions
export { createLoginSession, endLoginSession, getActiveSession, endAllSessions } from './session';
export { trackActivity, trackPageView, trackLogin, trackLogout, getRecentActivity, getActivityLogs } from './activity';

/**
 * Session user type matching what we store in the JWT
 */
export interface SessionUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: EmployeeRole;
  sessionId?: string;
}

/**
 * Get the current authenticated employee
 * Returns null if not authenticated
 */
export async function getCurrentEmployee(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session.user as SessionUser;
}

/**
 * Require authentication - throws redirect if not authenticated
 * Use this in server components and API routes that require auth
 */
export async function requireAuth(): Promise<SessionUser> {
  const employee = await getCurrentEmployee();

  if (!employee) {
    redirect('/admin/login');
  }

  return employee;
}

/**
 * Require specific role(s) - redirects if not authorized
 */
export async function requireRole(
  allowedRoles: EmployeeRole[]
): Promise<SessionUser> {
  const employee = await requireAuth();

  if (!allowedRoles.includes(employee.role)) {
    redirect('/admin/unauthorized');
  }

  return employee;
}

/**
 * Check if the current user has one of the specified roles
 */
export async function hasRole(roles: EmployeeRole[]): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee !== null && roles.includes(employee.role);
}

/**
 * Get full employee record from database
 * Useful when you need more than what's in the session
 */
export async function getFullEmployee(employeeId: string) {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      employeeId: true,
      email: true,
      username: true,
      name: true,
      role: true,
      twoFactorEnabled: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Check if a user is a superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.role === 'SUPERADMIN';
}

/**
 * Check if a user has admin privileges (SUPERADMIN or ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee !== null && ['SUPERADMIN', 'ADMIN'].includes(employee.role);
}
