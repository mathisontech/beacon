import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';

// GET: Single client details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
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

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT: Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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
      status,
      boundingBox,
      expiresAt,
    } = body;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (organizationType !== undefined) updateData.organizationType = organizationType;
    if (primaryContact !== undefined) updateData.primaryContact = primaryContact;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (jurisdiction !== undefined) updateData.jurisdiction = jurisdiction;
    if (state !== undefined) updateData.state = state;
    if (plan !== undefined) updateData.plan = plan;
    if (status !== undefined) updateData.status = status;
    if (boundingBox !== undefined) updateData.boundingBox = boundingBox;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'updated_client',
        target: 'Client',
        targetId: client.id,
        details: { clientId: client.clientId, changes: updateData },
      },
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client updated successfully',
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete (set status=CANCELLED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if client exists and is already cancelled
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (existingClient.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Can only delete clients with CANCELLED status. Please cancel the client first.' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to CANCELLED
    const client = await prisma.client.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'deleted_client',
        target: 'Client',
        targetId: client.id,
        details: { clientId: client.clientId, name: client.name },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
