import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import auditRouter from '../../src/routes/audit';
import { errorHandler } from '../../src/middleware/errorHandler';

// Mock DB insert / select
const mockInsertValues = vi.fn().mockResolvedValue({ success: true });
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });
const mockSelectLimit = vi.fn().mockResolvedValue([]);
const mockSelectWhere = vi.fn().mockReturnValue({ limit: mockSelectLimit });
const mockSelectFrom = vi.fn().mockReturnValue({
  where: mockSelectWhere,
  orderBy: () => ({ limit: vi.fn().mockResolvedValue([]) })
});
const mockSelect = vi.fn().mockReturnValue({ from: mockSelectFrom });

vi.mock('../../src/config/database', () => ({
  db: {
    insert: (...args: any[]) => mockInsert(...args),
    select: (...args: any[]) => mockSelect(...args)
  }
}));

vi.mock('../../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.userId = 'dev-user-123';
    next();
  }
}));

describe('Audit Routes Integration', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/audit', auditRouter);
    app.use(errorHandler);
  });

  describe('POST /api/audit/log', () => {
    it('should successfully save audit logs and generate server signature', async () => {
      mockSelectLimit.mockResolvedValueOnce([]); // No duplicates

      const response = await request(app)
        .post('/api/audit/log')
        .send({
          timestamp: new Date().toISOString(),
          userId: 'dev-user-123',
          sessionId: 'session-777',
          action: 'consultation_start',
          message: 'Consultation started successfully'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('signed securely');
      expect(mockInsertValues).toHaveBeenCalled();
      const insertArgs = mockInsertValues.mock.calls[0][0];
      expect(insertArgs.signature).toBeDefined();
      expect(insertArgs.signature.length).toBe(64); // hex-encoded sha256 is 64 chars
    });

    it('should reject requests with mismatching userId (IDOR protection)', async () => {
      const response = await request(app)
        .post('/api/audit/log')
        .send({
          userId: 'other-user-999',
          action: 'consultation_start'
        })
        .expect(403);

      expect(response.body.error).toContain('Cannot log events on behalf of another user');
    });
  });
});
