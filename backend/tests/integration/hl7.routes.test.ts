import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import hl7Router from '../../src/routes/hl7.routes';
import { db } from '../../src/config/database';
import { errorHandler } from '../../src/middleware/errorHandler';
import { consultations, users, medicalReports } from '../../src/db/schema/index';

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn()
  }
}));

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

describe('HL7 Routes Integration', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.text({ type: ['text/plain', 'application/hl7-v2'] }));
    app.use(express.json());
    app.use('/api/hl7', hl7Router);
    app.use(errorHandler);
  });

  describe('POST /api/hl7/ingest', () => {
    it('should parse valid ADT^A08 messages, write to DB, and return AA ACK', async () => {
      const adtPayload = 
        'MSH|^~\\&|SENDAPP|SENDFAC|RECAPP|RECFAC|2026||ADT^A08|CTRL_789|P|2.4\r' +
        'PID|1||CLERK_PAT_123||SMITH^BOB||19851212|M|||||bob.smith@example.com';

      // Mock database user queries
      const dbSelectMock = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]) // Return empty array to trigger user registration
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue([{ id: 'new-user-uuid' }])
      } as any);

      const response = await request(app)
        .post('/api/hl7/ingest')
        .set('Content-Type', 'text/plain')
        .send(adtPayload)
        .expect(200);

      expect(response.text).toContain('MSA|AA|CTRL_789|ADT patient profile registered for patient CLERK_PAT_123');
    });

    it('should return 400 and AE ACK for invalid messages missing control ID', async () => {
      const badPayload = 'MSH|^~\\&|SENDAPP||||||ADT^A08||P|2.4';

      const response = await request(app)
        .post('/api/hl7/ingest')
        .set('Content-Type', 'text/plain')
        .send(badPayload)
        .expect(400);

      expect(response.text).toContain('MSA|AE|');
      expect(response.text).toContain('ERR|||100|E|||MSH-10 Message Control ID is missing');
    });
  });

  describe('GET /api/hl7/export/consultation/:id', () => {
    it('should generate and return raw ORU V2 message payload', async () => {
      const mockConsult = {
        id: 'consult-777',
        userId: 'internal-user-123',
        specialistType: 'general',
        symptoms: 'Cold symptoms',
        notes: 'Advised hydration',
        startedAt: new Date()
      };

      const mockUser = {
        id: 'internal-user-123',
        clerkId: 'clerk-user-123',
        email: 'clerk.user@example.com',
        name: 'Clerk User',
        dateOfBirth: new Date('1990-01-01')
      };

      const mockReport = {
        id: 'report-123',
        consultationId: 'consult-777',
        diagnosis: 'Common Cold'
      };

      // Mock database selects
      const dbSelectMock = {
        from: vi.fn().mockImplementation((table) => {
          let resolveVal: any[] = [];
          if (table === consultations) resolveVal = [mockConsult];
          if (table === users) resolveVal = [mockUser];
          if (table === medicalReports) resolveVal = [mockReport];

          return {
            where: vi.fn().mockResolvedValue(resolveVal)
          };
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      const response = await request(app)
        .get('/api/hl7/export/consultation/consult-777')
        .expect(200);

      expect(response.text).toContain('ORU^R01');
      expect(response.text).toContain('PID|1||clerk-user-123||User^Clerk||19900101|U|||||clerk.user@example.com');
      expect(response.text).toContain('OBX|1|TX|SYMPTOMS^Patient Reported Symptoms||Cold symptoms||||||F');
      expect(response.text).toContain('OBX|2|TX|DIAGNOSIS^Clinical Assessment Diagnosis||Common Cold||||||F');
    });
  });
});
