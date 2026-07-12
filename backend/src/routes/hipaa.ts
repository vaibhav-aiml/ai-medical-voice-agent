import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { hipaaLogs } from '../db/schema/index';
import { requireAuth } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { desc } from 'drizzle-orm';

const router = Router();

// POST /api/hipaa/log
router.post('/log', catchAsync(async (req: Request, res: Response) => {
  const { type, value, accessReason, accessedBy, timestamp, extraData } = req.body;
  
  await db.insert(hipaaLogs).values({
    type,
    value,
    accessReason,
    accessedBy,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    extraData: extraData || null,
  });
  
  console.log(`[HIPAA] ${type} accessed by ${accessedBy}`);
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