import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Incidents for this client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = { clientId: id };

    if (status === 'active') {
      where.endTime = null;
    } else if (status === 'resolved') {
      where.endTime = { not: null };
    }

    // Get total count
    const totalCount = await prisma.incident.count({ where });

    // Fetch incidents
    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Add computed fields
    const incidentsWithStatus = incidents.map((incident) => {
      const isActive = !incident.endTime;
      const duration = incident.endTime
        ? Math.round((incident.endTime.getTime() - incident.startTime.getTime()) / (1000 * 60 * 60))
        : Math.round((Date.now() - incident.startTime.getTime()) / (1000 * 60 * 60));

      return {
        ...incident,
        status: isActive ? 'active' : 'resolved',
        durationHours: duration,
      };
    });

    return NextResponse.json({
      success: true,
      data: incidentsWithStatus,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
