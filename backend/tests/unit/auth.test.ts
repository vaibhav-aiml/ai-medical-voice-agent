import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

// Mock Clerk before importing auth middleware
vi.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    verifyToken: vi.fn(),
  },
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { requireAuth, optionalAuth } from '../../src/middleware/auth';
import { clerkClient } from '@clerk/clerk-sdk-node';

function mockReq(headers: Record<string, string> = {}): Request {
  return {
    headers,
  } as unknown as Request;
}

function mockRes(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Auth Middleware — requireAuth', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure test bypass is NOT active by default
    delete process.env.TEST_BYPASS_AUTH;
    // VITEST is already 'true' because we are running in Vitest
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should return 401 when no authorization header is provided (production)', async () => {
    process.env.NODE_ENV = 'production';
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('No authorization token') }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when no authorization header is provided (development)', async () => {
    process.env.NODE_ENV = 'development';
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification throws (any environment)', async () => {
    process.env.NODE_ENV = 'development';
    const verifyMock = vi.mocked(clerkClient.verifyToken);
    verifyMock.mockRejectedValueOnce(new Error('Network timeout'));

    const req = mockReq({ authorization: 'Bearer some-bad-token' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Invalid session token or verification failed'),
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification returns no sub claim', async () => {
    const verifyMock = vi.mocked(clerkClient.verifyToken);
    verifyMock.mockResolvedValueOnce({ sub: undefined } as any);

    const req = mockReq({ authorization: 'Bearer token-without-sub' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.userId and call next() on valid token', async () => {
    const verifyMock = vi.mocked(clerkClient.verifyToken);
    verifyMock.mockResolvedValueOnce({ sub: 'user_clerk_abc123' } as any);

    const req = mockReq({ authorization: 'Bearer valid-token' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(req.userId).toBe('user_clerk_abc123');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow bypass ONLY when VITEST=true AND TEST_BYPASS_AUTH=true', async () => {
    // VITEST is already 'true' in test environment
    process.env.TEST_BYPASS_AUTH = 'true';

    const req = mockReq(); // no auth header
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(req.userId).toBe('test-user-vitest');
    expect(next).toHaveBeenCalled();
  });

  it('should NOT allow bypass when TEST_BYPASS_AUTH is set but VITEST is not true', async () => {
    process.env.VITEST = '';
    process.env.TEST_BYPASS_AUTH = 'true';

    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should NOT allow bypass when VITEST is true but TEST_BYPASS_AUTH is not set', async () => {
    // VITEST is 'true', but TEST_BYPASS_AUTH is deleted in beforeEach
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Auth Middleware — optionalAuth', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TEST_BYPASS_AUTH;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should call next() with userId=undefined when no token (NOT dev-user-123)', async () => {
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await optionalAuth(req, res, next);

    expect(req.userId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should set userId from valid token', async () => {
    const verifyMock = vi.mocked(clerkClient.verifyToken);
    verifyMock.mockResolvedValueOnce({ sub: 'user_clerk_opt123' } as any);

    const req = mockReq({ authorization: 'Bearer valid-token' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await optionalAuth(req, res, next);

    expect(req.userId).toBe('user_clerk_opt123');
    expect(next).toHaveBeenCalled();
  });

  it('should leave userId undefined when token verification fails (not dev-user-123)', async () => {
    const verifyMock = vi.mocked(clerkClient.verifyToken);
    verifyMock.mockRejectedValueOnce(new Error('Expired token'));

    const req = mockReq({ authorization: 'Bearer expired-token' });
    const res = mockRes();
    const next: NextFunction = vi.fn();

    await optionalAuth(req, res, next);

    expect(req.userId).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
