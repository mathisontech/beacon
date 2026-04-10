import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';

// POST: Check if username or email is unique
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value, excludeId } = body;

    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      );
    }

    if (field !== 'username' && field !== 'email') {
      return NextResponse.json(
        { error: 'Field must be username or email' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { [field]: value };

    // Exclude current employee when editing
    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    // Check if exists
    const existing = await prisma.employee.findFirst({
      where,
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      unique: !existing,
    });
  } catch (error) {
    console.error('Error checking uniqueness:', error);
    return NextResponse.json(
      { error: 'Failed to check uniqueness' },
      { status: 500 }
    );
  }
}
