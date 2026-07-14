import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EMRExportService } from '../../src/services/emrExportService';
import { db } from '../../src/config/database';
import { consultations, users, medicalReports, voiceSessions } from '../../src/db/schema/index';

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn()
  }
}));

vi.mock('../../src/services/reportGenerator', () => ({
  reportGenerator: {
    generateSOAPReport: vi.fn().mockResolvedValue(Buffer.from('PDF_BUFFER'))
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

describe('EMRExportService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConsult = {
    id: 'consult-123',
    userId: 'user-uuid-abc',
    specialistType: 'cardiologist',
    specialistName: 'Dr. John',
    status: 'completed',
    symptoms: 'Heart palpitations',
    notes: 'Advised lifestyle changes',
    startedAt: new Date(),
    endedAt: new Date(),
    duration: '15'
  };

  const mockUser = {
    id: 'user-uuid-abc',
    clerkId: 'clerk-user-123',
    email: 'patient@example.com',
    name: 'Patient User',
    phone: '9876543210',
    dateOfBirth: new Date('1985-06-20')
  };

  const mockReport = {
    id: 'report-123',
    consultationId: 'consult-123',
    diagnosis: 'Palpitations',
    recommendations: ['Limit caffeine'],
    medications: [],
    followUpNeeded: false,
    followUpDate: null
  };

  const mockSession = {
    id: 'session-123',
    consultationId: 'consult-123',
    transcript: [{ role: 'user', content: 'Feeling palpitations' }],
    aiResponses: [{ role: 'assistant', content: 'Let me assist you' }],
    emotion: 'anxiety',
    emotionConfidence: '0.90'
  };

  describe('exportStructuredJSON', () => {
    it('should query DB and build unified structured clinical details object', async () => {
      const dbSelectMock = {
        from: vi.fn().mockImplementation((table) => {
          let resolveValue: any[] = [];
          if (table === consultations) resolveValue = [mockConsult];
          if (table === users) resolveValue = [mockUser];
          if (table === medicalReports) resolveValue = [mockReport];
          if (table === voiceSessions) resolveValue = [mockSession];

          return {
            where: vi.fn().mockResolvedValue(resolveValue)
          };
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      const data = await EMRExportService.exportStructuredJSON('user-uuid-abc', 'consult-123');
      expect(data.patient.clerkId).toBe('clerk-user-123');
      expect(data.consultation.specialistType).toBe('cardiologist');
      expect(data.report?.diagnosis).toBe('Palpitations');
      expect(data.voiceSession?.emotion).toBe('anxiety');
    });
  });

  describe('exportFHIRBundle', () => {
    it('should generate collection FHIR bundle from structured data', async () => {
      const dbSelectMock = {
        from: vi.fn().mockImplementation((table) => {
          let resolveValue: any[] = [];
          if (table === consultations) resolveValue = [mockConsult];
          if (table === users) resolveValue = [mockUser];
          if (table === medicalReports) resolveValue = [mockReport];
          if (table === voiceSessions) resolveValue = [mockSession];

          return {
            where: vi.fn().mockResolvedValue(resolveValue)
          };
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      const bundle = await EMRExportService.exportFHIRBundle('user-uuid-abc', 'consult-123');
      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('collection');
      expect(bundle.entry.length).toBe(4);
      expect(bundle.entry[0].resource.resourceType).toBe('Encounter');
      expect(bundle.entry[1].resource.resourceType).toBe('Observation');
    });
  });

  describe('exportHL7', () => {
    it('should output a valid pipe-delimited HL7 message text', async () => {
      const dbSelectMock = {
        from: vi.fn().mockImplementation((table) => {
          let resolveValue: any[] = [];
          if (table === consultations) resolveValue = [mockConsult];
          if (table === users) resolveValue = [mockUser];
          if (table === medicalReports) resolveValue = [mockReport];
          if (table === voiceSessions) resolveValue = [mockSession];

          return {
            where: vi.fn().mockResolvedValue(resolveValue)
          };
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      const hl7Text = await EMRExportService.exportHL7('user-uuid-abc', 'consult-123');
      expect(hl7Text).toContain('ORU^R01');
      expect(hl7Text).toContain('PID|1||clerk-user-123||User^Patient||19850620|U|||||patient@example.com');
    });
  });
});
