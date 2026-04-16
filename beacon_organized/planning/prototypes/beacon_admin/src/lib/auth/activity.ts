/**
 * Activity tracking functions for Beacon Admin
 *
 * Records all employee actions in the ActivityLog table for audit trail.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Track an activity/action performed by an employee
 *
 * @param employeeId - The employee's database ID
 * @param action - The action performed (e.g., 'created_client', 'updated_map', 'page_view')
 * @param target - What was acted on (e.g., 'Client', 'MapDataset', 'Employee')
 * @param targetId - ID of the target entity
 * @param details - Additional context as JSON
 */
export async function trackActivity(
  employeeId: string,
  action: string,
  target?: string,
  targetId?: string,
  details?: Prisma.InputJsonValue
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      employeeId,
      action,
      target: target ?? undefined,
      targetId: targetId ?? undefined,
      details: details,
      timestamp: new Date(),
    },
  });
}

/**
 * Convenience function to track page views
 *
 * @param employeeId - The employee's database ID
 * @param page - The page path (e.g., '/admin/dashboard', '/admin/clients')
 */
export async function trackPageView(
  employeeId: string,
  page: string
): Promise<void> {
  await trackActivity(employeeId, 'page_view', 'Page', undefined, { page });
}

/**
 * Track a login event
 */
export async function trackLogin(
  employeeId: string,
  ipAddress?: string
): Promise<void> {
  await trackActivity(employeeId, 'login', 'Session', undefined, { ipAddress });
}

/**
 * Track a logout event
 */
export async function trackLogout(employeeId: string): Promise<void> {
  await trackActivity(employeeId, 'logout', 'Session');
}

/**
 * Get recent activity for an employee
 */
export async function getRecentActivity(
  employeeId: string,
  limit: number = 50
) {
  return prisma.activityLog.findMany({
    where: { employeeId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

/**
 * Get all activity logs with optional filtering
 */
export async function getActivityLogs(options: {
  employeeId?: string;
  action?: string;
  target?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    employeeId,
    action,
    target,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = options;

  return prisma.activityLog.findMany({
    where: {
      ...(employeeId && { employeeId }),
      ...(action && { action }),
      ...(target && { target }),
      ...(startDate || endDate
        ? {
            timestamp: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    include: {
      employee: {
        select: {
          name: true,
          employeeId: true,
          role: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
  });
}
