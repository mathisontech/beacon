import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server } from 'node:http';

import { config } from './lib/config.js';
import { connectPrisma, disconnectPrisma } from './lib/prisma.js';
import { connectRedis, disconnectRedis, getRedisSubscriber, getRedisPublisher } from './lib/redis.js';
import { authRoutes } from './modules/auth/index.js';
import { statusRoutes } from './modules/status/index.js';
import { eventsRoutes } from './modules/events/index.js';
import { alertRoutes } from './modules/alerts/index.js';

// Create HTTP server first
const httpServer = createServer();

// Create Fastify instance with serverFactory to use our HTTP server
const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
  trustProxy: true,
  serverFactory: (handler) => {
    httpServer.on('request', handler);
    return httpServer as Server;
  },
});

// Initialize Socket.io with Redis adapter support
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.CORS_ORIGINS === '*' ? true : config.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Register Fastify plugins
async function registerPlugins(): Promise<void> {
  // CORS
  await fastify.register(cors, {
    origin: config.CORS_ORIGINS === '*' ? true : config.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Helmet (security headers)
  await fastify.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
    }),
  });

  // JWT
  await fastify.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  });
}

// Register routes
async function registerRoutes(): Promise<void> {
  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // API v1 routes
  fastify.register(async (api) => {
    // Auth routes
    api.register(authRoutes, { prefix: '/auth' });

    // Status routes
    api.register(statusRoutes, { prefix: '/status' });

    // Events routes
    api.register(eventsRoutes, { prefix: '/events' });

    // Alerts routes
    api.register(alertRoutes, { prefix: '/alerts' });

    // Add more module routes here as they're created
    // api.register(userRoutes, { prefix: '/users' });
  }, { prefix: '/api/v1' });
}

// Setup Socket.io events
function setupSocketIO(): void {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = fastify.jwt.verify<{ userId: string; userType: string }>(token);
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user?.userId;
    fastify.log.info({ userId, socketId: socket.id }, 'Client connected');

    // Join user-specific room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join location-based room
    socket.on('join:location', (zipCode: string) => {
      socket.join(`location:${zipCode}`);
      fastify.log.debug({ userId, zipCode }, 'Joined location room');
    });

    // Leave location-based room
    socket.on('leave:location', (zipCode: string) => {
      socket.leave(`location:${zipCode}`);
      fastify.log.debug({ userId, zipCode }, 'Left location room');
    });

    // Join event-based room for status updates
    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      fastify.log.debug({ userId, eventId }, 'Joined event room');
    });

    // Leave event-based room
    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      fastify.log.debug({ userId, eventId }, 'Left event room');
    });

    // Handle alert acknowledgment
    socket.on('alert:acknowledge', (alertId: string) => {
      fastify.log.info({ userId, alertId }, 'Alert acknowledged');
      // Process acknowledgment (could emit to other services)
    });

    // Handle user status updates
    socket.on('status:update', (status: { lat?: number; lng?: number; status?: string }) => {
      fastify.log.debug({ userId, status }, 'Status update received');
      // Could broadcast to relevant parties or store
    });

    socket.on('disconnect', (reason) => {
      fastify.log.info({ userId, socketId: socket.id, reason }, 'Client disconnected');
    });
  });

  // Setup Redis pub/sub for cross-server communication
  setupRedisPubSub();
}

// Setup Redis pub/sub for broadcasting across multiple server instances
function setupRedisPubSub(): void {
  const subscriber = getRedisSubscriber();
  const publisher = getRedisPublisher();

  // Subscribe to channels
  subscriber.subscribe(
    'alerts:broadcast',
    'incidents:update',
    'status:update',
    'events:created',
    'events:updated',
    'events:archived',
    'events:workspace:created',
    'events:workspace:invite',
    'events:workspace:access',
    (err, count) => {
    if (err) {
      fastify.log.error({ err }, 'Failed to subscribe to Redis channels');
      return;
    }
    fastify.log.info({ count }, 'Subscribed to Redis channels');
  });

  subscriber.on('message', (channel, message) => {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case 'alerts:broadcast':
          // Broadcast alert to specific location or all users
          if (data.zipCode) {
            io.to(`location:${data.zipCode}`).emit('alert:new', data);
          } else {
            io.emit('alert:new', data);
          }
          break;

        case 'incidents:update':
          // Broadcast incident update to relevant users
          if (data.affectedZipCodes) {
            data.affectedZipCodes.forEach((zip: string) => {
              io.to(`location:${zip}`).emit('incident:update', data);
            });
          }
          break;

        case 'status:update':
          // Broadcast status update to event room
          if (data.eventId) {
            io.to(`event:${data.eventId}`).emit(`status:${data.action}`, data.status);
            fastify.log.debug({ eventId: data.eventId, action: data.action }, 'Status update broadcasted');
          }
          break;

        case 'events:created':
          // Broadcast new event to all connected clients (public events)
          if (data.event?.isPublic) {
            io.emit('event:created', data.event);
          }
          fastify.log.debug({ eventId: data.event?.id }, 'Event created broadcasted');
          break;

        case 'events:updated':
          // Broadcast event update to event room and all clients for public events
          if (data.event?.id) {
            io.to(`event:${data.event.id}`).emit('event:updated', data.event);
            if (data.event.isPublic) {
              io.emit('event:updated', data.event);
            }
          }
          fastify.log.debug({ eventId: data.event?.id }, 'Event updated broadcasted');
          break;

        case 'events:archived':
          // Broadcast event archival
          if (data.eventId) {
            io.to(`event:${data.eventId}`).emit('event:archived', data);
            io.emit('event:archived', { eventId: data.eventId });
          }
          fastify.log.debug({ eventId: data.eventId }, 'Event archived broadcasted');
          break;

        case 'events:workspace:created':
          // Broadcast workspace creation to event room
          if (data.eventId) {
            io.to(`event:${data.eventId}`).emit('workspace:created', data.workspace);
          }
          break;

        case 'events:workspace:invite':
          // Notify invited user
          if (data.invitedUserId) {
            io.to(`user:${data.invitedUserId}`).emit('workspace:invited', {
              eventId: data.eventId,
              workspaceId: data.workspaceId,
            });
          }
          break;

        case 'events:workspace:access':
          // Notify affected participant about access change
          if (data.participantId) {
            io.to(`event:${data.eventId}`).emit('workspace:access:updated', data);
          }
          break;
      }
    } catch (err) {
      fastify.log.error({ err, channel, message }, 'Failed to process Redis message');
    }
  });

  // Expose publisher for other modules to use
  fastify.decorate('publishEvent', async (channel: string, data: unknown) => {
    await publisher.publish(channel, JSON.stringify(data));
  });
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string): Promise<void> {
  fastify.log.info({ signal }, 'Received shutdown signal');

  // Stop accepting new connections
  io.close();

  // Close Fastify server
  await fastify.close();

  // Disconnect from services
  await Promise.all([
    disconnectPrisma(),
    disconnectRedis(),
  ]);

  fastify.log.info('Server shut down gracefully');
  process.exit(0);
}

// Start server
async function start(): Promise<void> {
  try {
    // Register plugins
    await registerPlugins();

    // Register routes
    await registerRoutes();

    // Connect to databases
    await connectPrisma();
    await connectRedis();

    // Setup Socket.io
    setupSocketIO();

    // Start Fastify (which uses our httpServer via serverFactory)
    await fastify.listen({ port: config.PORT, host: config.HOST });
    fastify.log.info(
      { host: config.HOST, port: config.PORT, env: config.NODE_ENV },
      'Beacon API server started'
    );

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Start the server
start();

// Type declarations for Fastify decorations
declare module 'fastify' {
  interface FastifyInstance {
    publishEvent: (channel: string, data: unknown) => Promise<void>;
  }
}

export { fastify, io };
