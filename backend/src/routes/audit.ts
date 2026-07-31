import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { auditLogs } from '../db/schema/index';
import { requireAuth } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { desc, and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';

const router = Router();

function getAuditSigningSecret(): string {
  if (process.env.AUDIT_SIGNING_SECRET) {
    return process.env.AUDIT_SIGNING_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: AUDIT_SIGNING_SECRET environment variable must be set in production!');
  }
  return 'dev-only-fallback-audit-secret-2026';
}

export function computeLogSignature(log: {
  userId: string | null;
  sessionId: string | null;
  action: string;
  message: string | null;
  timestamp: string | Date | null;
}): string {
  const dataToSign = {
    userId: log.userId,
    sessionId: log.sessionId,
    action: log.action,
    message: log.message,
    timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : null
  };
  return crypto
    .createHmac('sha256', getAuditSigningSecret())
    .update(JSON.stringify(dataToSign))
    .digest('hex');
}

router.post('/log', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const { timestamp, userId, sessionId, action, message, metadata } = req.body;
  if (!action) {
    throw new AppError('Action is required', 400);
  }
  
  const authenticatedUserId = (req as any).userId;
  if (userId && authenticatedUserId && authenticatedUserId !== userId) {
    throw new AppError('Forbidden: Cannot log events on behalf of another user', 403);
  }

  const logTimestamp = timestamp ? new Date(timestamp) : new Date();
  const duplicates = await db.select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.userId, userId || ''),
        eq(auditLogs.action, action),
        eq(auditLogs.message, message || ''),
        eq(auditLogs.timestamp, logTimestamp)
      )
    )
    .limit(1);

  if (duplicates.length > 0) {
    return res.status(200).json({ success: true, message: 'Audit log received (duplicate ignored)' });
  }
  const signature = computeLogSignature({
    userId,
    sessionId,
    action,
    message,
    timestamp: logTimestamp
  });
  
  await db.insert(auditLogs).values({
    timestamp: logTimestamp,
    userId,
    sessionId,
    action,
    message,
    metadata: metadata || null,
    signature,
  });
  
  res.status(200).json({ success: true, message: 'Audit log received and signed securely' });
}));

router.get('/logs', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const logs = await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.receivedAt))
    .limit(1000); 
  const verifiedLogs = logs.map(log => {
    const calculatedSig = computeLogSignature({
      userId: log.userId,
      sessionId: log.sessionId,
      action: log.action,
      message: log.message,
      timestamp: log.timestamp
    });
    return {
      ...log,
      verified: log.signature === calculatedSig
    };
  });
  
  res.status(200).json({ success: true, logs: verifiedLogs });
}));

export default router;