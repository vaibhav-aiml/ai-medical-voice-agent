import Redis from 'ioredis';
import logger from '../utils/logger';

let redis: Redis | null = null;

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('REDIS_URL not configured — caching disabled');
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    client.on('connect', () => {
      logger.info('Redis connected');
    });

    client.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
    });

    // Attempt connection but don't block startup
    client.connect().catch((err) => {
      logger.warn('Redis connection failed, caching disabled', { error: err.message });
    });

    return client;
  } catch (error: any) {
    logger.warn('Failed to create Redis client', { error: error.message });
    return null;
  }
}

redis = createRedisClient();

/**
 * Get a value from Redis cache.
 * Returns null if Redis is not available or key doesn't exist.
 */
export async function cacheGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

/**
 * Set a value in Redis cache with TTL in seconds.
 */
export async function cacheSet(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, 'EX', ttlSeconds);
  } catch {
    // Silently fail — caching is non-critical
  }
}

/**
 * Delete a key from Redis cache.
 */
export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // Silently fail
  }
}

export { redis };
