import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import logger from '../utils/logger';

/**
 * Checks whether the narrow test-bypass is active.
 * Both conditions must be true:
 *   1. Running inside the Vitest test runner (VITEST === 'true')
 *   2. The explicit bypass flag is set (TEST_BYPASS_AUTH === 'true')
 * This intentionally does NOT activate via NODE_ENV to prevent
 * a development-mode bypass from being deployed to staging/production.
 */
function isTestBypassActive(): boolean {
  return process.env.VITEST === 'true' && process.env.TEST_BYPASS_AUTH === 'true';
}

/**
 * requireAuth — fail-closed authentication middleware.
 *
 * A valid Clerk session token is required in all environments.
 * If no token is provided or verification fails, the request is
 * rejected with 401 — never silently promoted to a fake user.
 *
 * The only exception is a narrowly-scoped test bypass that only
 * activates inside the Vitest test runner with an explicit flag.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];

    if (!sessionToken) {
      // Test harness bypass: allow unauthenticated requests only in Vitest
      if (isTestBypassActive()) {
        req.userId = 'test-user-vitest';
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: No authorization token provided' });
    }

    let payload;
    try {
      payload = await clerkClient.verifyToken(sessionToken);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      logger.error('Clerk token verification failed', { error: message });
      // A thrown verification error (network, malformed, expired) is always a 401.
      // It must never be silently downgraded to a fake authenticated session.
      return res.status(401).json({ error: 'Unauthorized: Invalid session token or verification failed' });
    }

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token claims' });
    }

    req.userId = payload.sub;
    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Authentication check failed', { error: message });
    return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
  }
};

/**
 * optionalAuth — fail-closed optional authentication middleware.
 *
 * If a valid token is present, `req.userId` is set.
 * If no token is present or verification fails, `req.userId` remains
 * undefined — it is NEVER set to a hardcoded fallback user.
 *
 * Downstream handlers using optionalAuth MUST handle `req.userId`
 * being undefined (e.g. anonymous/guest access paths).
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];

  if (!sessionToken) {
    // Test harness bypass
    if (isTestBypassActive()) {
      req.userId = 'test-user-vitest';
    }
    // No token → userId stays undefined (anonymous access)
    return next();
  }

  try {
    const payload = await clerkClient.verifyToken(sessionToken);
    if (payload && payload.sub) {
      req.userId = payload.sub;
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.warn('Optional Clerk token verification failed', { error: message });
    // Verification failed → userId stays undefined, do not assign a fake user
  }

  next();
};