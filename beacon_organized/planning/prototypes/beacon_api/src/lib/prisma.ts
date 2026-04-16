import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log: config.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    datasources: {
      db: {
        url: config.DATABASE_URL,
      },
    },
  });
};

// Use global variable in development to prevent hot-reload connection issues
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (config.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Prisma connected to database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  console.log('Prisma disconnected from database');
}
