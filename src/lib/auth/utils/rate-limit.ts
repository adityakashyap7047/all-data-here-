import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

function getMemoryStoreKey(action: string, identifier: string): string {
  return `${action}:${identifier}`;
}

function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, value] of Array.from(memoryStore.entries())) {
    if (value.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}

setInterval(cleanupMemoryStore, 60 * 1000);

async function getRedisClient() {
  try {
    const { Redis } = await import('@upstash/redis');
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    return null;
  }
}

export async function rateLimit(
  request: NextRequest,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const redis = await getRedisClient();
  const key = `rate_limit:${action}:${ip}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      pipeline.zcard(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      const results = await pipeline.exec();

      const count = results[2] as number;
      const remaining = Math.max(0, maxRequests - count);
      const resetTime = now + windowMs;

      return {
        success: count <= maxRequests,
        remaining,
        resetTime,
      };
    } catch {
      // Fall through to memory store
    }
  }

  const memKey = getMemoryStoreKey(action, ip);
  const memEntry = memoryStore.get(memKey);
  
  if (!memEntry || memEntry.resetTime < now) {
    memoryStore.set(memKey, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  memEntry.count += 1;
  const remaining = Math.max(0, maxRequests - memEntry.count);
  
  return {
    success: memEntry.count <= maxRequests,
    remaining,
    resetTime: memEntry.resetTime,
  };
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = await getRedisClient();
  const key = `rate_limit:${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);
      const results = await pipeline.exec();

      const count = results[1] as number;
      const remaining = Math.max(0, maxRequests - count);
      const resetTime = now + windowMs;

      return {
        success: count < maxRequests,
        remaining,
        resetTime,
      };
    } catch {
      // Fall through to memory store
    }
  }

  const memKey = getMemoryStoreKey(action, identifier);
  const memEntry = memoryStore.get(memKey);
  
  if (!memEntry || memEntry.resetTime < now) {
    return { success: true, remaining: maxRequests, resetTime: now + windowMs };
  }

  const remaining = Math.max(0, maxRequests - memEntry.count);
  
  return {
    success: memEntry.count < maxRequests,
    remaining,
    resetTime: memEntry.resetTime,
  };
}

export async function incrementRateLimit(
  identifier: string,
  action: string,
  windowMs: number
): Promise<void> {
  const redis = await getRedisClient();
  const key = `rate_limit:${action}:${identifier}`;
  const now = Date.now();

  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      await pipeline.exec();
      return;
    } catch {
      // Fall through to memory store
    }
  }

  const memKey = getMemoryStoreKey(action, identifier);
  const memEntry = memoryStore.get(memKey);
  
  if (!memEntry || memEntry.resetTime < now) {
    memoryStore.set(memKey, { count: 1, resetTime: now + windowMs });
  } else {
    memEntry.count += 1;
  }
}