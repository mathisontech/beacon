import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';
import { generateTemporaryPassword, hashPassword } from '@/lib/auth/password';

// POST: Reset employee password
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can reset passwords
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
        username: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Generate new temporary password
    const newPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(newPassword);

    // Update employee password
    await prisma.employee.update({
      where: { id },
      data: {
        passwordHash,
        // In a full implementation, you'd set a flag requiring password change on next login
        // mustChangePassword: true
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'reset_password',
        target: 'Employee',
        targetId: employee.id,
        details: {
          employeeId: employee.employeeId,
          name: employee.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        username: employee.username,
        temporaryPassword: newPassword,
      },
      message: 'Password reset successfully. Copy the temporary password.',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
