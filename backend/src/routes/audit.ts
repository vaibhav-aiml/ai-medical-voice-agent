import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { auditLogs } from '../db/schema/index';
import { requireAuth } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { desc } from 'drizzle-orm';

const router = Router();

// POST /api/audit/log
router.post('/log', catchAsync(async (req: Request, res: Response) => {
  const { timestamp, userId, sessionId, action, message, metadata, signature } = req.body;
  
  await db.insert(auditLogs).values({
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    userId,
    sessionId,
    action,
    message,
    metadata: metadata || null,
    signature,
  });
  
  console.log(`[AUDIT] ${action} - ${userId}`);
  res.status(200).json({ success: true, message: 'Audit log received' });
}));

// GET /api/audit/logs (for admin)
router.get('/logs', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const logs = await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.receivedAt))
    .limit(1000); // safety limit
  
  res.status(200).json({ success: true, logs });
}));

export default router;