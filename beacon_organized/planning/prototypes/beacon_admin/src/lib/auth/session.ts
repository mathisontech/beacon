/**
 * Session tracking functions for Beacon Admin
 *
 * Tracks login sessions in the LoginHistory table for audit and analytics.
 */

import { prisma } from '@/lib/prisma';

/**
 * Create a new login session for an employee
 * Records IP address and user agent for security tracking
 */
export async function createLoginSession(
  employeeId: string,
  req: Request
): Promise<string> {
  // Extract IP address from headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.headers.get('x-real-ip') || 'unknown';

  // Extract user agent
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Create login history record
  const session = await prisma.loginHistory.create({
    data: {
      employeeId,
      ipAddress,
      userAgent,
      active: true,
      loginTime: new Date(),
    },
  });

  return session.id;
}

/**
 * End a login session
 * Calculates duration and marks session as inactive
 */
export async function endLoginSession(sessionId: string): Promise<void> {
  // Find the session
  const session = await prisma.loginHistory.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    console.warn(`Session ${sessionId} not found`);
    return;
  }

  // Calculate duration in seconds
  const now = new Date();
  const duration = Math.floor(
    (now.getTime() - session.loginTime.getTime()) / 1000
  );

  // Update session with logout info
  await prisma.loginHistory.update({
    where: { id: sessionId },
    data: {
      logoutTime: now,
      sessionDuration: duration,
      active: false,
    },
  });
}

/**
 * Get the current active session for an employee
 * Returns null if no active session exists
 */
export async function getActiveSession(employeeId: string) {
  return prisma.loginHistory.findFirst({
    where: {
      employeeId,
      active: true,
    },
    orderBy: {
      loginTime: 'desc',
    },
  });
}

/**
 * End all active sessions for an employee
 * Useful for security operations like password reset
 */
export async function endAllSessions(employeeId: string): Promise<number> {
  const now = new Date();

  // Get all active sessions to calculate durations
  const activeSessions = await prisma.loginHistory.findMany({
    where: {
      employeeId,
      active: true,
    },
  });

  // Update each session with proper duration
  for (const session of activeSessions) {
    const duration = Math.floor(
      (now.getTime() - session.loginTime.getTime()) / 1000
    );

    await prisma.loginHistory.update({
      where: { id: session.id },
      data: {
        logoutTime: now,
        sessionDuration: duration,
        active: false,
      },
    });
  }

  return activeSessions.length;
}
