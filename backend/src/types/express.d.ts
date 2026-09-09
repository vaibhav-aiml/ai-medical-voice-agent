import { Request } from 'express';
import { Clinic } from '../models/Clinic';

/**
 * Augment Express Request to include properties set by application middleware.
 * This eliminates the need for `(req as any).userId` casts throughout the codebase.
 *
 * - `userId`: Set by `requireAuth` (always a string after middleware passes) or
 *   `optionalAuth` (may be undefined if no valid token was provided).
 * - `requestId`: Set by the request-ID middleware in index.ts.
 * - `clinic`: Set by `clinicMiddleware` when a clinic subdomain is detected.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      requestId?: string;
      clinic?: Clinic;
    }
  }
}

export {};
