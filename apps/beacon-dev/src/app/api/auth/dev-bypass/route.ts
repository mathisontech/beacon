/**
 * Development Bypass Authentication
 *
 * WARNING: REMOVE BEFORE PRODUCTION
 *
 * This endpoint allows quick authentication during development
 * by bypassing the normal login flow for the 'kristin' user.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

// ============================================================
// WARNING: REMOVE BEFORE PRODUCTION
// This endpoint bypasses authentication for development only
// ============================================================

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Dev bypass is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const { username } = await req.json();

    // Only allow 'kristin' username
    if (username !== 'kristin') {
      return NextResponse.json(
        { error: 'Invalid username' },
        { status: 400 }
      );
    }

    // Find Kristin's employee record
    const employee = await prisma.employee.findUnique({
      where: { username: 'kristin' },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found. Please seed the database first.' },
        { status: 404 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Create login history record
    await prisma.loginHistory.create({
      data: {
        employeeId: employee.id,
        ipAddress: 'dev-bypass',
        userAgent: 'dev-bypass',
        active: true,
      },
    });

    // Track login activity
    await prisma.activityLog.create({
      data: {
        employeeId: employee.id,
        action: 'login',
        target: 'Session',
        details: { method: 'dev-bypass' },
      },
    });

    // Create JWT token using next-auth's encode function
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'beacon-admin-secret-key-change-in-production';

    const token = await encode({
      token: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        sub: employee.id,
      },
      secret,
      salt: 'authjs.session-token',
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('authjs.session-token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
      message: 'Dev bypass authentication successful',
    });
  } catch (error) {
    console.error('Dev bypass error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// WARNING: REMOVE THIS ENTIRE FILE BEFORE PRODUCTION
// ============================================================
