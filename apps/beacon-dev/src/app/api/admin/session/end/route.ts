import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employeeId = session.user.id;

    // Find the most recent active login session for this employee
    const activeSession = await prisma.loginHistory.findFirst({
      where: {
        employeeId,
        active: true,
      },
      orderBy: {
        loginTime: 'desc',
      },
    });

    if (activeSession) {
      const now = new Date();
      const loginTime = new Date(activeSession.loginTime);
      const durationSeconds = Math.floor(
        (now.getTime() - loginTime.getTime()) / 1000
      );

      // Update the session with logout time and duration
      await prisma.loginHistory.update({
        where: { id: activeSession.id },
        data: {
          logoutTime: now,
          sessionDuration: durationSeconds,
          active: false,
        },
      });

      // Log the logout activity
      await prisma.activityLog.create({
        data: {
          employeeId,
          action: 'logout',
          target: 'session',
          targetId: activeSession.id,
          details: {
            sessionDuration: durationSeconds,
            logoutTime: now.toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
