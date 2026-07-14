import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FHIRService } from '../../src/services/fhirService';
import axios from 'axios';
import { db } from '../../src/config/database';
import { fhirConnections, consultations, medicalReports, voiceSessions } from '../../src/db/schema/index';

vi.mock('axios');
vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn()
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

describe('FHIRService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('discoverEndpoints', () => {
    it('should successfully discover endpoints from smart-configuration', async () => {
      const mockConfig = {
        authorization_endpoint: 'https://fhir.example.com/oauth/authorize',
        token_endpoint: 'https://fhir.example.com/oauth/token'
      };
      
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockConfig });

      const endpoints = await FHIRService.discoverEndpoints('https://fhir.example.com');
      expect(endpoints.authorization_endpoint).toBe('https://fhir.example.com/oauth/authorize');
      expect(endpoints.token_endpoint).toBe('https://fhir.example.com/oauth/token');
      expect(axios.get).toHaveBeenCalledWith('https://fhir.example.com/.well-known/smart-configuration', { timeout: 5000 });
    });

    it('should fall back to capability statement if smart-configuration fails', async () => {
      vi.mocked(axios.get)
        .mockRejectedValueOnce(new Error('Failed to fetch smart-config'))
        .mockResolvedValueOnce({
          data: {
            rest: [{
              security: {
                extension: [{
                  extension: [
                    { url: 'authorize', valueUri: 'https://fhir.example.com/fallback/authorize' },
                    { url: 'token', valueUri: 'https://fhir.example.com/fallback/token' }
                  ]
                }]
              }
            }]
          }
        });

      const endpoints = await FHIRService.discoverEndpoints('https://fhir.example.com');
      expect(endpoints.authorization_endpoint).toBe('https://fhir.example.com/fallback/authorize');
      expect(endpoints.token_endpoint).toBe('https://fhir.example.com/fallback/token');
    });
  });

  describe('getPatient', () => {
    it('should fetch patient data correctly using connection details', async () => {
      const mockConnection = {
        id: 'conn-123',
        userId: 'user-123',
        provider: 'generic',
        fhirServerUrl: 'https://fhir.example.com',
        patientId: 'patient-456',
        accessToken: 'token-abc',
        refreshToken: 'refresh-xyz',
        tokenExpiresAt: new Date(Date.now() + 100000)
      };

      // Mock database connection fetch
      const dbSelectMock = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockConnection])
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      // Mock axios GET Patient resource
      const mockPatient = {
        resourceType: 'Patient',
        id: 'patient-456',
        name: [{ text: 'Alice Smith' }]
      };
      vi.mocked(axios).mockResolvedValueOnce({ data: mockPatient });

      const patient = await FHIRService.getPatient('user-123');
      expect(patient.resourceType).toBe('Patient');
      expect(patient.id).toBe('patient-456');
    });
  });

  describe('syncConsultationToFHIR', () => {
    it('should bundle local database records and push to connected EHR', async () => {
      const mockConnection = {
        id: 'conn-123',
        userId: 'user-123',
        provider: 'generic',
        fhirServerUrl: 'https://fhir.example.com',
        patientId: 'patient-456',
        accessToken: 'token-abc',
        refreshToken: 'refresh-xyz',
        tokenExpiresAt: new Date(Date.now() + 100000)
      };

      const mockConsultation = {
        id: 'consult-123',
        userId: 'user-123',
        specialistType: 'general',
        status: 'completed',
        symptoms: 'Fever and cold',
        notes: 'Clinical notes',
        startedAt: new Date(),
        endedAt: new Date()
      };

      const mockReport = {
        id: 'report-123',
        consultationId: 'consult-123',
        diagnosis: 'Viral Fever',
        recommendations: ['Rest']
      };

      // Mock database queries
      const dbSelectMock = {
        from: vi.fn().mockImplementation((table) => {
          let resolveValue: any[] = [];
          if (table === fhirConnections) resolveValue = [mockConnection];
          if (table === consultations) resolveValue = [mockConsultation];
          if (table === medicalReports) resolveValue = [mockReport];
          if (table === voiceSessions) resolveValue = [];

          return {
            where: vi.fn().mockResolvedValue(resolveValue)
          };
        })
      };
      vi.mocked(db.select).mockReturnValue(dbSelectMock as any);

      // Mock axios POST transaction bundle
      vi.mocked(axios).mockResolvedValueOnce({
        data: { id: 'bundle-xyz-123' }
      });

      const result = await FHIRService.syncConsultationToFHIR('user-123', 'consult-123');
      expect(result.success).toBe(true);
      expect(result.bundleId).toBe('bundle-xyz-123');
    });
  });
});
