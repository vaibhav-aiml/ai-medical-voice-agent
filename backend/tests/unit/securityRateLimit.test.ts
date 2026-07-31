import { describe, it, expect } from 'vitest';
import rateLimit from 'express-rate-limit';

describe('Security & Rate Limiter Store Tests', () => {
  it('should increment memory store counters and trigger rate limit callback', async () => {
    let limitExceeded = false;

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      limit: 3, // 3 requests max
      handler: () => {
        limitExceeded = true;
      }
    });

    const mockReq: any = { ip: '127.0.0.1', headers: {} };
    const mockRes: any = { setHeader: () => {}, status: () => ({ json: () => {} }) };
    const mockNext = () => {};

    // 3 requests allowed
    await limiter(mockReq, mockRes, mockNext);
    await limiter(mockReq, mockRes, mockNext);
    await limiter(mockReq, mockRes, mockNext);
    expect(limitExceeded).toBe(false);

    // 4th request triggers rate limit
    await limiter(mockReq, mockRes, mockNext);
    expect(limitExceeded).toBe(true);
  });
});
