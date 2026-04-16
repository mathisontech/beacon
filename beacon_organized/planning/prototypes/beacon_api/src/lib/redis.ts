import Redis from 'ioredis';
import { config } from './config.js';

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;
let redisPublisher: Redis | null = null;

function createRedisClient(name: string): Redis {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on('connect', () => {
    console.log(`Redis ${name} client connecting...`);
  });

  client.on('ready', () => {
    console.log(`Redis ${name} client ready`);
  });

  client.on('error', (err) => {
    console.error(`Redis ${name} client error:`, err);
  });

  client.on('close', () => {
    console.log(`Redis ${name} client disconnected`);
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient('main');
  }
  return redisClient;
}

export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    redisSubscriber = createRedisClient('subscriber');
  }
  return redisSubscriber;
}

export function getRedisPublisher(): Redis {
  if (!redisPublisher) {
    redisPublisher = createRedisClient('publisher');
  }
  return redisPublisher;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  const subscriber = getRedisSubscriber();
  const publisher = getRedisPublisher();

  await Promise.all([
    client.connect(),
    subscriber.connect(),
    publisher.connect(),
  ]);

  console.log('All Redis clients connected');
}

export async function disconnectRedis(): Promise<void> {
  const promises: Promise<void>[] = [];

  if (redisClient) {
    promises.push(redisClient.quit().then(() => { redisClient = null; }));
  }
  if (redisSubscriber) {
    promises.push(redisSubscriber.quit().then(() => { redisSubscriber = null; }));
  }
  if (redisPublisher) {
    promises.push(redisPublisher.quit().then(() => { redisPublisher = null; }));
  }

  await Promise.all(promises);
  console.log('All Redis clients disconnected');
}

// Session management helpers
export const sessionStore = {
  async set(userId: string, sessionId: string, data: Record<string, unknown>, ttl: number): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await getRedisClient().setex(key, ttl, JSON.stringify(data));
  },

  async get(userId: string, sessionId: string): Promise<Record<string, unknown> | null> {
    const key = `session:${userId}:${sessionId}`;
    const data = await getRedisClient().get(key);
    return data ? JSON.parse(data) : null;
  },

  async delete(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await getRedisClient().del(key);
  },

  async deleteAllUserSessions(userId: string): Promise<void> {
    const client = getRedisClient();
    const keys = await client.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  },
};

// Refresh token management
export const refreshTokenStore = {
  async set(token: string, userId: string, ttl: number): Promise<void> {
    const key = `refresh:${token}`;
    await getRedisClient().setex(key, ttl, userId);
  },

  async get(token: string): Promise<string | null> {
    const key = `refresh:${token}`;
    return getRedisClient().get(key);
  },

  async delete(token: string): Promise<void> {
    const key = `refresh:${token}`;
    await getRedisClient().del(key);
  },

  async deleteAllUserTokens(userId: string): Promise<void> {
    // This would require maintaining a set of tokens per user
    // For now, we'll use a pattern match (less efficient but simpler)
    const client = getRedisClient();
    const keys = await client.keys('refresh:*');

    for (const key of keys) {
      const value = await client.get(key);
      if (value === userId) {
        await client.del(key);
      }
    }
  },
};
