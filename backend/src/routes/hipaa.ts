import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { hipaaLogs } from '../db/schema/index';
import { requireAuth } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { desc, and, eq } from 'drizzle-orm';
import { AppError } from '../utils/AppError';

const router = Router();

// POST /api/hipaa/log
router.post('/log', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const { type, value, accessReason, accessedBy, timestamp, extraData } = req.body;
  
  if (!type || !accessedBy) {
    throw new AppError('Type and accessedBy are required', 400);
  }

  const authenticatedUserId = (req as any).userId;
  
  // Authorization: Enforce that user can only submit logs for themselves
  if (accessedBy && authenticatedUserId && authenticatedUserId !== accessedBy) {
    throw new AppError('Forbidden: Cannot log HIPAA events on behalf of another user', 403);
  }

  const logTimestamp = timestamp ? new Date(timestamp) : new Date();

  // Duplicate Check
  const duplicates = await db.select()
    .from(hipaaLogs)
    .where(
      and(
        eq(hipaaLogs.type, type),
        eq(hipaaLogs.accessedBy, accessedBy),
        eq(hipaaLogs.accessReason, accessReason || ''),
        eq(hipaaLogs.timestamp, logTimestamp)
      )
    )
    .limit(1);

  if (duplicates.length > 0) {
    return res.status(200).json({ success: true, message: 'HIPAA log received (duplicate ignored)' });
  }
  
  await db.insert(hipaaLogs).values({
    type,
    value,
    accessReason,
    accessedBy,
    timestamp: logTimestamp,
    extraData: extraData || null,
  });
  
  res.status(200).json({ success: true, message: 'HIPAA log received' });
}));

// GET /api/hipaa/logs (for admin)
router.get('/logs', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const logs = await db.select()
    .from(hipaaLogs)
    .orderBy(desc(hipaaLogs.receivedAt))
    .limit(1000); // safety limit
  
  res.status(200).json({ success: true, logs });
}));

export default router;