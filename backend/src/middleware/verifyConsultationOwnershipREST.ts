import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { verifyConsultationOwnershipCore } from '../sockets/helpers/verification';

/**
 * Express REST middleware adapter for consultation ownership authorization.
 * 
 * Extracts userId from req.userId (set by requireAuth) and consultationId from
 * req.params.consultationId. Delegates to verifyConsultationOwnershipCore with
 * autoCreateIfMissing: false (the consultation must already exist).
 * 
 * Fail-closed security invariants:
 * - Missing req.userId -> 401 Unauthorized
 * - Missing consultationId -> 400 Bad Request
 * - Failed ownership check or non-existent consultation -> 403 Forbidden
 */
export async function verifyConsultationOwnershipREST(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.userId;
  const rawId = req.params.consultationId;
  const consultationId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
    return;
  }

  if (!consultationId) {
    res.status(400).json({ success: false, error: 'Bad Request: Missing consultation ID parameter' });
    return;
  }

  try {
    const isAuthorized = await verifyConsultationOwnershipCore(userId, consultationId, {
      autoCreateIfMissing: false
    });

    if (!isAuthorized) {
      logger.warn('Blocked unauthorized REST access to consultation', {
        userId,
        consultationId,
        path: req.originalUrl
      });
      res.status(403).json({ success: false, error: 'Forbidden: You do not have permission to access this consultation' });
      return;
    }

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Unexpected error in verifyConsultationOwnershipREST middleware', {
      error: message,
      userId,
      consultationId
    });
    res.status(403).json({ success: false, error: 'Forbidden: Verification failed' });
    return;
  }
}
