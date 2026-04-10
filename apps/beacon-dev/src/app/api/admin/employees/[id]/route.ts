import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';
import { EmployeeRole } from '@prisma/client';

// GET: Single employee details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can view employee details
    if (!['SUPERADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        username: true,
        role: true,
        twoFactorEnabled: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        loginHistory: {
          orderBy: { loginTime: 'desc' },
          take: 1,
          select: {
            loginTime: true,
          },
        },
        _count: {
          select: {
            loginHistory: true,
            clientAssignments: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...employee,
        lastLogin: employee.loginHistory[0]?.loginTime || null,
        loginHistory: undefined,
      },
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT: Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can update employees
    if (!['SUPERADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, role, isActive, password } = body;

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // If email is being changed, check uniqueness
    if (email && email !== existingEmployee.email) {
      const existingEmail = await prisma.employee.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already in use by another employee' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role as EmployeeRole;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If password is provided, hash it
    if (password && password.length > 0) {
      updateData.passwordHash = await hashPassword(password);
    }

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        username: true,
        role: true,
        twoFactorEnabled: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'updated_employee',
        target: 'Employee',
        targetId: employee.id,
        details: {
          employeeId: employee.employeeId,
          changes: Object.keys(updateData).filter((k) => k !== 'passwordHash'),
          passwordChanged: !!password,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete employee (only if never logged in)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN can delete employees
    if (session.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            loginHistory: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Prevent self-deletion
    if (employee.id === session.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Only allow deletion if employee has never logged in
    if (employee._count.loginHistory > 0) {
      return NextResponse.json(
        { error: 'Cannot delete employee who has logged in. Deactivate instead.' },
        { status: 400 }
      );
    }

    // Delete employee (hard delete since they never logged in)
    await prisma.employee.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'deleted_employee',
        target: 'Employee',
        targetId: id,
        details: {
          employeeId: employee.employeeId,
          name: employee.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}
