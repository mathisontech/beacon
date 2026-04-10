/**
 * Middleware for Beacon Admin
 *
 * Protects /admin/* routes and handles authentication redirects.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/admin/login',
  '/api/auth',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-admin routes and static files
  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // If on auth route and already authenticated, redirect to dashboard
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // If trying to access protected route without auth, redirect to login
  if (!isAuthenticated && !isPublicRoute && pathname.startsWith('/admin')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Track page views for authenticated users on admin pages
  if (isAuthenticated && pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    // Page view tracking is handled client-side or in server components
    // to avoid middleware complexity with database calls
    const response = NextResponse.next();

    // Add employee info to headers for downstream use
    response.headers.set('x-employee-id', token.id as string);
    response.headers.set('x-employee-role', token.role as string);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // TEMPORARILY DISABLED - uncomment to re-enable auth protection
    // '/admin/:path*',
  ],
};
