import { Router, Request, Response } from 'express';
import { ReconciliationService } from '../services/reconciliationService';
import { SyncQueueService } from '../services/syncQueueService';
import { db } from '../config/database';
import { fhirSyncLogs } from '../db/schema/index';
import { desc, eq } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Retrieve all FHIR synchronization transaction logs
router.get('/sync-logs', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  logger.info('Fetching FHIR synchronization transaction logs', { userId });

  const logs = await db
    .select()
    .from(fhirSyncLogs)
    .where(eq(fhirSyncLogs.userId, userId))
    .orderBy(desc(fhirSyncLogs.updatedAt));

  res.json(logs);
}));

// Run demographics reconciliation against remote EHR Patient resource
router.post('/reconcile', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  logger.info('Manual demographics reconciliation request received', { userId });

  try {
    const result = await ReconciliationService.reconcileDemographics(userId);
    res.json(result);
  } catch (err: any) {
    logger.error('Failed manual demographic reconciliation', { userId, error: err.message });
    throw new AppError(err.message, 400);
  }
}));

// Manually trigger retry worker execution queue
router.post('/retry', requireAuth, catchAsync(async (req: Request, res: Response) => {
  logger.info('Manual trigger request for sync queue retry worker');
  const result = await SyncQueueService.retryFailedSyncs();
  res.json(result);
}));

export default router;
