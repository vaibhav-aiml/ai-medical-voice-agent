import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReconciliationService } from '../../src/services/reconciliationService';
import { db } from '../../src/config/database';
import { FHIRService } from '../../src/services/fhirService';
import { users, fhirConnections, hipaaLogs } from '../../src/db/schema/index';

vi.mock('../../src/config/database', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn()
  }
}));

vi.mock('../../src/services/fhirService');
vi.mock('../../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

describe('ReconciliationService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reconcile demographics updating name and dateOfBirth based on EHR source', async () => {
    const mockConnection = {
      id: 'conn-123',
      userId: 'user-uuid-xyz',
      patientId: 'patient-fhir-456',
      provider: 'epic',
      fhirServerUrl: 'https://epic.sandbox.com'
    };

    const mockLocalUser = {
      id: 'user-uuid-xyz',
      clerkId: 'clerk-user-789',
      name: 'Bob Local Name',
      email: 'bob@example.com',
      dateOfBirth: new Date('1980-01-01')
    };

    // Remote FHIR Patient resource returned
    const mockFHIRPatient = {
      resourceType: 'Patient',
      id: 'patient-fhir-456',
      name: [{ family: 'EHRName', given: ['Robert'] }],
      birthDate: '1985-05-15',
      telecom: [{ system: 'email', value: 'robert.ehr@example.com' }]
    };

    // Mock DB Connection & Local User retrieves
    const dbSelectMock = {
      from: vi.fn().mockImplementation((table) => {
        let resolveVal: any[] = [];
        if (table === fhirConnections) resolveVal = [mockConnection];
        if (table === users) resolveVal = [mockLocalUser];
        return {
          where: vi.fn().mockResolvedValue(resolveVal)
        };
      })
    };
    vi.mocked(db.select).mockReturnValue(dbSelectMock as any);
    vi.mocked(FHIRService.getPatient).mockResolvedValueOnce(mockFHIRPatient as any);

    // Mock DB update and hipaa logging inserts
    const dbUpdateMock = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(1)
    };
    vi.mocked(db.update).mockReturnValue(dbUpdateMock as any);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([1])
    } as any);

    const result = await ReconciliationService.reconcileDemographics('user-uuid-xyz');

    expect(result.reconciled).toBe(true);
    expect(result.changes.length).toBe(3); // name, DOB, email should have changes
    expect(result.changes.find(c => c.field === 'name')?.newVal).toBe('Robert EHRName');
    expect(result.changes.find(c => c.field === 'dateOfBirth')?.newVal).toBe('1985-05-15');
    expect(result.changes.find(c => c.field === 'email')?.newVal).toBe('robert.ehr@example.com');
  });

  it('should not update local email if remote patient telecom email is missing', async () => {
    const mockConnection = {
      id: 'conn-123',
      userId: 'user-uuid-xyz',
      patientId: 'patient-fhir-456',
      provider: 'epic',
      fhirServerUrl: 'https://epic.sandbox.com'
    };

    const mockLocalUser = {
      id: 'user-uuid-xyz',
      clerkId: 'clerk-user-789',
      name: 'Robert EHRName',
      email: 'bob@example.com',
      dateOfBirth: new Date('1985-05-15')
    };

    // Remote FHIR Patient with missing telecom details
    const mockFHIRPatient = {
      resourceType: 'Patient',
      id: 'patient-fhir-456',
      name: [{ family: 'EHRName', given: ['Robert'] }],
      birthDate: '1985-05-15',
      telecom: []
    };

    const dbSelectMock = {
      from: vi.fn().mockImplementation((table) => {
        let resolveVal: any[] = [];
        if (table === fhirConnections) resolveVal = [mockConnection];
        if (table === users) resolveVal = [mockLocalUser];
        return {
          where: vi.fn().mockResolvedValue(resolveVal)
        };
      })
    };
    vi.mocked(db.select).mockReturnValue(dbSelectMock as any);
    vi.mocked(FHIRService.getPatient).mockResolvedValueOnce(mockFHIRPatient as any);

    const result = await ReconciliationService.reconcileDemographics('user-uuid-xyz');
    expect(result.reconciled).toBe(false); // No changes detected
    expect(result.changes.length).toBe(0);
  });
});
