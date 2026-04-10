import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';

// GET: Get login history for an employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can view login history
    if (!['SUPERADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        name: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Fetch login history (last 50 sessions)
    const loginHistory = await prisma.loginHistory.findMany({
      where: { employeeId: id },
      orderBy: { loginTime: 'desc' },
      take: 50,
      select: {
        id: true,
        loginTime: true,
        logoutTime: true,
        sessionDuration: true,
        ipAddress: true,
        userAgent: true,
        active: true,
      },
    });

    // Format session duration helper
    const formatDuration = (seconds: number | null): string => {
      if (!seconds) return 'N/A';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    };

    // Transform data
    const transformedHistory = loginHistory.map((session) => ({
      id: session.id,
      loginTime: session.loginTime,
      logoutTime: session.logoutTime,
      duration: session.active
        ? 'Still active'
        : formatDuration(session.sessionDuration),
      durationSeconds: session.sessionDuration,
      ipAddress: session.ipAddress || 'Unknown',
      userAgent: session.userAgent || 'Unknown',
      active: session.active,
    }));

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
        },
        sessions: transformedHistory,
        totalSessions: loginHistory.length,
      },
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
