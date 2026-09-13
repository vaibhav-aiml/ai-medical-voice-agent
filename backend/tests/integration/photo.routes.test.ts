import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import sharp from 'sharp';

// Mock Clerk auth middleware
vi.mock('../../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    const headerUser = req.headers['x-test-user-id'];
    if (headerUser === 'unauthenticated') {
      return res.status(401).json({ success: false, error: 'Unauthorized: No authorization token provided' });
    }
    const testUserId = headerUser || 'test_user_owner';
    req.userId = testUserId;
    next();
  },
  optionalAuth: (_req: any, _res: any, next: any) => next()
}));

// Mock db for integration tests
vi.mock('../../src/config/database', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue([{ id: 'mock-photo-id' }])
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([])
        }))
      }))
    }))
  }
}));

// Mock photoAnalysisService so we test the route and storage logic deterministically
vi.mock('../../src/services/photoAnalysisService', () => ({
  photoAnalysisService: {
    getPhotoAnalysis: vi.fn(async ({ caption }: { caption?: string }) => {
      if (caption === 'trigger-error') {
        return {
          success: false,
          error: 'Photo analysis is temporarily unavailable. Please describe your symptoms using text or voice mode instead.'
        };
      }
      return {
        success: true,
        analysis: 'Visual features appear consistent with localized erythema. No emergency signs detected.',
        triageResult: {
          urgencyLevel: 'routine',
          score: 10,
          recommendation: 'Monitor symptoms.',
          riskFactors: [],
          suggestedAction: 'Keep area clean and dry.',
          requiresAmbulance: false,
          colorCode: 'green'
        }
      };
    })
  }
}));

// Mock verification core to control ownership checks
const mockOwnershipMap: Record<string, string> = {};
vi.mock('../../src/sockets/helpers/verification', () => ({
  verifyConsultationOwnershipCore: vi.fn(async (clerkId: string | undefined, consultationId: string | undefined) => {
    if (!clerkId || !consultationId) return false;
    const owner = mockOwnershipMap[consultationId];
    return owner === clerkId;
  }),
  verifyConsultationOwnership: vi.fn()
}));

import photoRouter from '../../src/routes/photo.routes';
import { requireAuth } from '../../src/middleware/auth';

describe('Photo Routes Integration & Security Tests', () => {
  let app: express.Express;
  let testImageBuffer: Buffer;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/consultation', requireAuth, photoRouter);

    // Create a valid test image buffer using sharp
    testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 200, g: 50, b: 50 }
      }
    }).jpeg().toBuffer();

    // Reset mock ownership
    mockOwnershipMap['consultation-101'] = 'user_alice';
    mockOwnershipMap['consultation-202'] = 'user_bob';
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'unauthenticated')
      .attach('photo', testImageBuffer, 'test.jpg')
      .field('consentAcknowledged', 'true');

    expect(res.status).toBe(401);
  });

  it('rejects requests to non-existent or unowned consultation with 403 (fail-closed)', async () => {
    // Bob trying to access Alice's consultation
    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_bob')
      .attach('photo', testImageBuffer, 'test.jpg')
      .field('consentAcknowledged', 'true');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('rejects uploads without consent acknowledgment with 400', async () => {
    // Missing consentAcknowledged field
    const res1 = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .attach('photo', testImageBuffer, 'test.jpg');

    expect(res1.status).toBe(400);
    expect(res1.body.error).toContain('Consent must be acknowledged');

    // consentAcknowledged is explicitly false
    const res2 = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .attach('photo', testImageBuffer, 'test.jpg')
      .field('consentAcknowledged', 'false');

    expect(res2.status).toBe(400);
    expect(res2.body.error).toContain('Consent must be acknowledged');
  });

  it('rejects upload when no photo file is provided with 400', async () => {
    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .field('consentAcknowledged', 'true');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('No photo file provided');
  });

  it('rejects unsupported file mime types with 400', async () => {
    const textBuffer = Buffer.from('this is plain text not an image');
    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .attach('photo', textBuffer, 'test.txt')
      .field('consentAcknowledged', 'true');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unsupported image type');
  });

  it('successfully processes photo upload for authorized owner with server-generated timestamp', async () => {
    const beforeRequest = new Date(Date.now() - 1000);

    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .attach('photo', testImageBuffer, 'symptom.jpg')
      .field('consentAcknowledged', 'true')
      .field('caption', 'Red swelling on right arm for 2 days');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis).toContain('localized erythema');
    expect(res.body.triageResult).toBeDefined();
    expect(res.body.triageResult.urgencyLevel).toBe('routine');

    // Verify consentedAt is server-generated ISO string
    expect(res.body.consentedAt).toBeDefined();
    const serverTimestamp = new Date(res.body.consentedAt);
    expect(serverTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
    expect(serverTimestamp.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it('returns 503 when photo analysis service fails', async () => {
    const res = await request(app)
      .post('/api/consultation/consultation-101/photo')
      .set('x-test-user-id', 'user_alice')
      .attach('photo', testImageBuffer, 'symptom.jpg')
      .field('consentAcknowledged', 'true')
      .field('caption', 'trigger-error');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('temporarily unavailable');
  });
});
