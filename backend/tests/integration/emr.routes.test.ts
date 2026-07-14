import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import emrRouter from '../../src/routes/emr.routes';
import { EMRExportService } from '../../src/services/emrExportService';
import { errorHandler } from '../../src/middleware/errorHandler';

vi.mock('../../src/services/emrExportService');
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

describe('EMR Routes Integration', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/emr', emrRouter);
    app.use(errorHandler);
  });

  describe('GET /api/emr/export/:consultationId', () => {
    it('should return unified structured JSON for structured format', async () => {
      const mockResult = {
        exportTimestamp: '2026-07-14T18:00:00Z',
        patient: { name: 'Bob' },
        consultation: { id: 'consult-123' }
      };
      vi.mocked(EMRExportService.exportStructuredJSON).mockResolvedValueOnce(mockResult as any);

      const response = await request(app)
        .get('/api/emr/export/consult-123?format=structured')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body.patient.name).toBe('Bob');
      expect(EMRExportService.exportStructuredJSON).toHaveBeenCalledWith('dev-user-123', 'consult-123');
    });

    it('should return FHIR transaction bundle for fhir-bundle format', async () => {
      const mockBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: []
      };
      vi.mocked(EMRExportService.exportFHIRBundle).mockResolvedValueOnce(mockBundle as any);

      const response = await request(app)
        .get('/api/emr/export/consult-123?format=fhir-bundle')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/fhir+json');
      expect(response.body.resourceType).toBe('Bundle');
    });

    it('should return raw HL7 V2 text for hl7 format', async () => {
      const mockHL7 = 'MSH|^~\\&|...\rPID|1|...';
      vi.mocked(EMRExportService.exportHL7).mockResolvedValueOnce(mockHL7);

      const response = await request(app)
        .get('/api/emr/export/consult-123?format=hl7')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('MSH|^~\\&');
    });

    it('should return PDF stream for pdf format', async () => {
      const mockPdf = Buffer.from('PDF_STREAM_CONTENT');
      vi.mocked(EMRExportService.exportPDF).mockResolvedValueOnce(mockPdf);

      const response = await request(app)
        .get('/api/emr/export/consult-123?format=pdf')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.body.toString()).toBe('PDF_STREAM_CONTENT');
    });

    it('should return 400 bad request for unsupported format parameters', async () => {
      const response = await request(app)
        .get('/api/emr/export/consult-123?format=unsupported')
        .expect(400);

      expect(response.body.error).toContain('Format \'unsupported\' not supported');
    });
  });
});
