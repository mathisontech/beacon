import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface TrackActivityBody {
  action: string;
  target?: string;
  targetId?: string;
  details?: Prisma.InputJsonValue;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TrackActivityBody = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Create activity log record
    const activityLog = await prisma.activityLog.create({
      data: {
        employeeId: session.user.id,
        action: body.action,
        target: body.target ?? undefined,
        targetId: body.targetId ?? undefined,
        details: body.details ?? undefined,
      },
    });

    return NextResponse.json({
      success: true,
      id: activityLog.id,
    });
  } catch (error) {
    console.error('Activity tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}
