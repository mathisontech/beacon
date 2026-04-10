import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';
import { ClientStatus } from '@prisma/client';

// GET: List clients with search/filter/pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const orgType = searchParams.get('orgType') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clientId: { contains: search, mode: 'insensitive' } },
        { jurisdiction: { contains: search, mode: 'insensitive' } },
        { primaryContact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status as ClientStatus;
    }

    // Filter by organization type
    if (orgType && orgType !== 'all') {
      where.organizationType = orgType;
    }

    // Get total count for pagination
    const totalCount = await prisma.client.count({ where });

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch clients with pagination and include account managers
    const clients = await prisma.client.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        accountManagers: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            incidents: true,
            usageMetrics: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST: Create new client
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      organizationType,
      primaryContact,
      email,
      phone,
      jurisdiction,
      state,
      plan,
      boundingBox,
    } = body;

    // Validate required fields
    if (!name || !organizationType || !primaryContact || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, organizationType, primaryContact, email' },
        { status: 400 }
      );
    }

    // Generate next client ID
    const lastClient = await prisma.client.findFirst({
      orderBy: { clientId: 'desc' },
      select: { clientId: true },
    });

    let nextNum = 1;
    if (lastClient?.clientId) {
      const match = lastClient.clientId.match(/CLI(\d+)/);
      if (match) {
        nextNum = parseInt(match[1]) + 1;
      }
    }
    const clientId = `CLI${nextNum.toString().padStart(3, '0')}`;

    // Create client
    const client = await prisma.client.create({
      data: {
        clientId,
        name,
        organizationType,
        primaryContact,
        email,
        phone,
        jurisdiction,
        state,
        plan: plan || 'Trial',
        boundingBox,
        status: 'TRIAL',
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      },
    });

    // Create client assignment for current user as Primary
    await prisma.clientAssignment.create({
      data: {
        clientId: client.id,
        employeeId: session.id,
        role: 'Primary',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'created_client',
        target: 'Client',
        targetId: client.id,
        details: { clientId: client.clientId, name: client.name },
      },
    });

    // Fetch the created client with relations
    const createdClient = await prisma.client.findUnique({
      where: { id: client.id },
      include: {
        accountManagers: {
          include: {
            employee: {
              select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: createdClient,
      message: 'Client created successfully',
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
