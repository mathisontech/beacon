import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';

// POST: Assign account manager
export async function POST(
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
    const { employeeId, role } = body;

    if (!employeeId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, role' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['Primary', 'Secondary', 'Support'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be Primary, Secondary, or Support' },
        { status: 400 }
      );
    }

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

    // Validate employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.clientAssignment.findUnique({
      where: {
        clientId_employeeId: {
          clientId: id,
          employeeId,
        },
      },
    });

    let assignment;
    if (existingAssignment) {
      // Update existing assignment
      assignment = await prisma.clientAssignment.update({
        where: { id: existingAssignment.id },
        data: { role },
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
      });
    } else {
      // Create new assignment
      assignment = await prisma.clientAssignment.create({
        data: {
          clientId: id,
          employeeId,
          role,
        },
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
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'assigned_account_manager',
        target: 'ClientAssignment',
        targetId: assignment.id,
        details: {
          clientId: client.clientId,
          employeeId: employee.employeeId,
          role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Account manager assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning account manager:', error);
    return NextResponse.json(
      { error: 'Failed to assign account manager' },
      { status: 500 }
    );
  }
}

// DELETE: Remove account manager assignment
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
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: employeeId' },
        { status: 400 }
      );
    }

    // Find and delete the assignment
    const assignment = await prisma.clientAssignment.findUnique({
      where: {
        clientId_employeeId: {
          clientId: id,
          employeeId,
        },
      },
      include: {
        client: true,
        employee: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    await prisma.clientAssignment.delete({
      where: { id: assignment.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'removed_account_manager',
        target: 'ClientAssignment',
        targetId: assignment.id,
        details: {
          clientId: assignment.client.clientId,
          employeeId: assignment.employee.employeeId,
          role: assignment.role,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account manager removed successfully',
    });
  } catch (error) {
    console.error('Error removing account manager:', error);
    return NextResponse.json(
      { error: 'Failed to remove account manager' },
      { status: 500 }
    );
  }
}
