import logger from './logger';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class SocketRateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  
  private limits: Record<string, number> = {
    'join-consultation': Number(process.env.LIMIT_SOCKET_JOIN) || 10,
    'get-ai-response-stream': Number(process.env.LIMIT_SOCKET_STREAM) || 20,
    'get-ai-response': Number(process.env.LIMIT_SOCKET_RESPONSE) || 20,
  };

  public consume(userId: string, socketId: string, event: string): boolean {
    const limit = this.limits[event] || 30;
    const key = `${userId}:${event}`;
    const now = Date.now();
    
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: limit,
        lastRefill: now
      };
      this.buckets.set(key, bucket);
    } else {
      const elapsed = now - bucket.lastRefill;
      const refillAmount = (elapsed * limit) / 60000;
      
      if (refillAmount >= 1) {
        bucket.tokens = Math.min(limit, bucket.tokens + refillAmount);
        bucket.lastRefill = now;
      }
    }
    
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    
    logger.warn('Socket.IO rate limit exceeded', { userId, socketId, event });
    return false;
  }

  // Helper to manually set limit values in tests
  public setLimit(event: string, value: number) {
    this.limits[event] = value;
  }
}

export const socketRateLimiter = new SocketRateLimiter();
