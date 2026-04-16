/**
 * NextAuth.js Configuration for Beacon Admin
 *
 * Credentials-based authentication with JWT strategy.
 * Supports 2FA flag checking (TOTP verification to be implemented).
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import type { EmployeeRole } from '@prisma/client';

// Extend the default session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      employeeId: string;
      name: string;
      email: string;
      role: EmployeeRole;
      sessionId?: string;
    };
  }

  interface User {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: EmployeeRole;
    twoFactorEnabled: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: EmployeeRole;
    sessionId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: 'TOTP Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required');
        }

        // Find employee by username
        const employee = await prisma.employee.findUnique({
          where: { username: credentials.username as string },
        });

        if (!employee) {
          throw new Error('Invalid credentials');
        }

        // Check if employee is active
        if (!employee.isActive) {
          throw new Error('Account is deactivated');
        }

        // Verify password
        const isValidPassword = await compare(
          credentials.password as string,
          employee.passwordHash
        );

        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        // Check 2FA requirement
        if (employee.twoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error('2FA_REQUIRED');
          }
          // TODO: Implement TOTP verification
          // For now, we just check the flag but don't verify the code
          // This will be implemented in a future update
        }

        // Create login history record
        await prisma.loginHistory.create({
          data: {
            employeeId: employee.id,
            ipAddress: null, // Set in middleware or route handler
            userAgent: null,
            active: true,
          },
        });

        // Track login activity
        await prisma.activityLog.create({
          data: {
            employeeId: employee.id,
            action: 'login',
            target: 'Session',
          },
        });

        return {
          id: employee.id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          twoFactorEnabled: employee.twoFactorEnabled,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in - store user data in token
        token.id = user.id;
        token.employeeId = user.employeeId;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Transfer token data to session
      if (token) {
        session.user.id = token.id as string;
        session.user.employeeId = token.employeeId as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as EmployeeRole;
        session.user.sessionId = token.sessionId as string | undefined;
      }
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      try {
        console.log(`Employee ${user.employeeId} signed in`);
      } catch (e) {
        console.error('signIn event error:', e);
      }
    },

    async signOut(message) {
      try {
        const token = 'token' in message ? message.token : null;
        if (token?.id) {
          console.log(`Employee ${token.employeeId} signed out`);
        }
      } catch (e) {
        console.error('signOut event error:', e);
      }
    },
  },

  debug: false,
  trustHost: true,
});

// Helper to get current session (convenience re-export)
export async function getCurrentEmployee() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

// Track page view activity
export async function trackPageView(employeeId: string, pathname: string) {
  try {
    await prisma.activityLog.create({
      data: {
        employeeId,
        action: 'page_view',
        target: 'Page',
        targetId: pathname,
        details: { pathname },
      },
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}
