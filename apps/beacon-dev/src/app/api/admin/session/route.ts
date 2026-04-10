import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Create session cookie
    const cookieStore = await cookies();
    cookieStore.set('beacon-admin-session', JSON.stringify({
      user: username,
      role: 'admin',
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Session created',
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('beacon-admin-session');

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      role: session.role,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid session' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('beacon-admin-session');

    return NextResponse.json({
      success: true,
      message: 'Session deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
