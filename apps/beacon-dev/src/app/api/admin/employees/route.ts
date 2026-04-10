import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee } from '@/lib/auth';
import { hashPassword, generateNextEmployeeId } from '@/lib/auth/password';
import { EmployeeRole } from '@prisma/client';

// GET: List all employees with search/filter/pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can view employees
    if (!['SUPERADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
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
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (role && role !== 'all') {
      where.role = role as EmployeeRole;
    }

    // Filter by status (active/inactive)
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // Get total count for pagination
    const totalCount = await prisma.employee.count({ where });

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch employees with pagination
    const employees = await prisma.employee.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
      },
    });

    // Transform data to include lastLogin
    const transformedEmployees = employees.map((emp) => ({
      ...emp,
      lastLogin: emp.loginHistory[0]?.loginTime || null,
      loginHistory: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: transformedEmployees,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST: Create new employee
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentEmployee();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only SUPERADMIN and ADMIN can create employees
    if (!['SUPERADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, username, password, role, sendWelcomeEmail } = body;

    // Validate required fields
    if (!name || !email || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check username uniqueness
    const existingUsername = await prisma.employee.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existingEmail = await prisma.employee.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Generate next employee ID
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeId: 'desc' },
      select: { employeeId: true },
    });
    const employeeId = generateNextEmployeeId(lastEmployee?.employeeId || null);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email,
        username,
        passwordHash,
        role: role as EmployeeRole,
        isActive: true,
        twoFactorEnabled: false,
      },
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
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.id,
        action: 'created_employee',
        target: 'Employee',
        targetId: employee.id,
        details: {
          employeeId: employee.employeeId,
          name: employee.name,
          username: employee.username,
          role: employee.role,
          sendWelcomeEmail,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: employee,
      message: `Employee added successfully. Username: ${employee.username}`,
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
