import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import interopRouter from '../../src/routes/interop.routes';
import { ReconciliationService } from '../../src/services/reconciliationService';
import { SyncQueueService } from '../../src/services/syncQueueService';
import { db } from '../../src/config/database';
import { errorHandler } from '../../src/middleware/errorHandler';

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn()
  }
}));

vi.mock('../../src/services/reconciliationService');
vi.mock('../../src/services/syncQueueService');
vi.mock('../../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.userId = 'dev-user-123';
    next();
  }
}));

vi.mock('../../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Interoperability Routes Integration', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/interop', interopRouter);
    app.use(errorHandler);
  });

  describe('GET /api/interop/sync-logs', () => {
    it('should return 200 and list of logs', async () => {
      const mockLogs = [
        { id: 'log-1', status: 'success', resourceType: 'Bundle', version: 1 }
      ];

      const dbSelectMock = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockLogs)
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      const response = await request(app)
        .get('/api/interop/sync-logs')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].status).toBe('success');
    });
  });

  describe('POST /api/interop/reconcile', () => {
    it('should trigger reconciliation service and return details', async () => {
      const mockResult = {
        userId: 'dev-user-123',
        patientId: 'patient-456',
        reconciled: true,
        changes: [{ field: 'name', oldVal: 'Bob', newVal: 'Robert' }]
      };
      vi.mocked(ReconciliationService.reconcileDemographics).mockResolvedValueOnce(mockResult);

      const response = await request(app)
        .post('/api/interop/reconcile')
        .expect(200);

      expect(response.body.reconciled).toBe(true);
      expect(response.body.changes.length).toBe(1);
      expect(response.body.changes[0].newVal).toBe('Robert');
    });
  });

  describe('POST /api/interop/retry', () => {
    it('should trigger retry queue worker successfully', async () => {
      const mockWorkerResult = { processed: 2, succeeded: 1 };
      vi.mocked(SyncQueueService.retryFailedSyncs).mockResolvedValueOnce(mockWorkerResult);

      const response = await request(app)
        .post('/api/interop/retry')
        .expect(200);

      expect(response.body.processed).toBe(2);
      expect(response.body.succeeded).toBe(1);
    });
  });
});
