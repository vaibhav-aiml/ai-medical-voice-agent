import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import fhirRouter from '../../src/routes/fhir.routes';
import { FHIRService } from '../../src/services/fhirService';
import { errorHandler } from '../../src/middleware/errorHandler';

vi.mock('../../src/services/fhirService');
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

describe('FHIR Routes Integration', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/fhir', fhirRouter);
    app.use(errorHandler);
  });

  describe('GET /api/fhir/connection-status', () => {
    it('should return connected false when no FHIR connection is active', async () => {
      vi.mocked(FHIRService.getConnection).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/fhir/connection-status')
        .expect(200);

      expect(response.body).toEqual({ connected: false });
      expect(FHIRService.getConnection).toHaveBeenCalledWith('dev-user-123');
    });

    it('should return connection info when connected', async () => {
      const mockConn = {
        id: 'conn-1',
        userId: 'dev-user-123',
        provider: 'epic',
        fhirServerUrl: 'https://epic.example.com/fhir',
        patientId: 'patient-777',
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        tokenExpiresAt: new Date('2026-12-31T23:59:59.000Z')
      };
      vi.mocked(FHIRService.getConnection).mockResolvedValueOnce(mockConn as any);

      const response = await request(app)
        .get('/api/fhir/connection-status')
        .expect(200);

      expect(response.body).toEqual({
        connected: true,
        provider: 'epic',
        fhirServerUrl: 'https://epic.example.com/fhir',
        patientId: 'patient-777',
        tokenExpiresAt: '2026-12-31T23:59:59.000Z'
      });
    });
  });

  describe('POST /api/fhir/connect', () => {
    it('should return SMART on FHIR auth URL on success', async () => {
      vi.mocked(FHIRService.discoverEndpoints).mockResolvedValueOnce({
        authorization_endpoint: 'https://epic.example.com/oauth/authorize',
        token_endpoint: 'https://epic.example.com/oauth/token'
      });

      const response = await request(app)
        .post('/api/fhir/connect')
        .send({
          provider: 'epic',
          fhirServerUrl: 'https://epic.example.com/fhir',
          clientId: 'client-999',
          redirectUri: 'http://localhost:3000/callback'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authorizationUrl).toContain('https://epic.example.com/oauth/authorize');
      expect(response.body.authorizationUrl).toContain('client_id=client-999');
    });

    it('should return 400 when connection params are missing', async () => {
      const response = await request(app)
        .post('/api/fhir/connect')
        .send({
          provider: 'epic'
        })
        .expect(400);

      expect(response.body.error).toContain('Missing required SMART configuration parameters');
    });
  });

  describe('GET /api/fhir/clinical-data', () => {
    it('should return aggregated clinical details', async () => {
      const mockDetails = {
        patient: { id: 'patient-777', resourceType: 'Patient' },
        appointments: [],
        medications: [],
        allergies: [],
        observations: [],
        conditions: [],
        encounters: [],
        reports: []
      };
      vi.mocked(FHIRService.getClinicalData).mockResolvedValueOnce(mockDetails as any);

      const response = await request(app)
        .get('/api/fhir/clinical-data')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.id).toBe('patient-777');
      expect(FHIRService.getClinicalData).toHaveBeenCalledWith('dev-user-123');
    });
  });
});
