import axios from 'axios';
import { db } from '../config/database';
import { fhirConnections, consultations, voiceSessions, medicalReports, users } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger';

// Type definitions for FHIR R4 standard structures
export interface FHIRConnectionInfo {
  id: string;
  userId: string;
  provider: string;
  fhirServerUrl: string;
  patientId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}

// FHIR Resource Interfaces
export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  active?: boolean;
  name?: Array<{
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface FHIRAllergy {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: any;
  verificationStatus?: any;
  category?: string[];
  criticality?: string;
  code?: {
    coding?: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  patient: { reference: string };
  recordedDate?: string;
}

export interface FHIRMedicationRequest {
  resourceType: 'MedicationRequest';
  id?: string;
  status: string;
  intent: string;
  medicationCodeableConcept?: {
    coding?: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  patient: { reference: string };
  authoredOn?: string;
  dosageInstruction?: Array<{
    text?: string;
    patientInstruction?: string;
  }>;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id?: string;
  status: string;
  category?: any[];
  code: {
    coding?: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  subject: { reference: string };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: any;
  verificationStatus?: any;
  category?: any[];
  severity?: any;
  code?: {
    coding?: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  subject: { reference: string };
  onsetDateTime?: string;
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id?: string;
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: { reference: string };
  period?: {
    start?: string;
    end?: string;
  };
  reasonCode?: any[];
}

export interface FHIRAppointment {
  resourceType: 'Appointment';
  id?: string;
  status: string;
  serviceCategory?: any[];
  serviceType?: any[];
  specialty?: any[];
  appointmentType?: any;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  participant: Array<{
    actor?: { reference: string; display?: string };
    status: string;
  }>;
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id?: string;
  status: string;
  category?: any[];
  code: {
    coding?: Array<{ system: string; code: string; display: string }>;
    text?: string;
  };
  subject: { reference: string };
  effectiveDateTime?: string;
  issued?: string;
  conclusion?: string;
}

// SMART well-known configuration format
export interface SMARTConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  introspection_endpoint?: string;
  revocation_endpoint?: string;
}

export class FHIRService {
  /**
   * Fetch OAuth metadata using SMART Discovery
   */
  static async discoverEndpoints(fhirServerUrl: string): Promise<SMARTConfig> {
    try {
      const wellKnownUrl = `${fhirServerUrl.replace(/\/$/, '')}/.well-known/smart-configuration`;
      logger.info('Fetching SMART configuration metadata', { wellKnownUrl });
      const response = await axios.get<SMARTConfig>(wellKnownUrl, { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      logger.warn('Failed to fetch SMART config, falling back to conformance statement', { error: error.message });
      // Fallback: Query capability statement
      const capabilityUrl = `${fhirServerUrl.replace(/\/$/, '')}/metadata`;
      const response = await axios.get(capabilityUrl, { timeout: 5000 });
      const rest = response.data?.rest?.[0];
      const security = rest?.security;
      const authorizeExtension = security?.extension?.[0]?.extension?.find((e: any) => e.url === 'authorize');
      const tokenExtension = security?.extension?.[0]?.extension?.find((e: any) => e.url === 'token');

      if (!authorizeExtension?.valueUri || !tokenExtension?.valueUri) {
        throw new Error('Could not discover authorization endpoints from FHIR server');
      }

      return {
        authorization_endpoint: authorizeExtension.valueUri,
        token_endpoint: tokenExtension.valueUri
      };
    }
  }

  /**
   * Retrieves user connection from Database
   */
  static async getConnection(userId: string): Promise<FHIRConnectionInfo | null> {
    const results = await db.select()
      .from(fhirConnections)
      .where(eq(fhirConnections.userId, userId));
    
    if (results.length === 0) return null;
    return results[0] as FHIRConnectionInfo;
  }

  /**
   * Exchange OAuth auth code for Access Token
   */
  static async exchangeAuthorizationCode(
    userId: string,
    provider: string,
    fhirServerUrl: string,
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret?: string
  ): Promise<FHIRConnectionInfo> {
    const endpoints = await this.discoverEndpoints(fhirServerUrl);
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }

    logger.info('Exchanging code for SMART on FHIR tokens', { tokenEndpoint: endpoints.token_endpoint });
    const response = await axios.post(endpoints.token_endpoint, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = response.data;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token || null;
    const patientId = data.patient || 'unknown-patient';
    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const existing = await this.getConnection(userId);
    if (existing) {
      const updated = await db.update(fhirConnections)
        .set({
          provider,
          fhirServerUrl,
          patientId,
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
          updatedAt: new Date()
        })
        .where(eq(fhirConnections.id, existing.id))
        .returning();
      return updated[0] as FHIRConnectionInfo;
    } else {
      const inserted = await db.insert(fhirConnections).values({
        userId,
        provider,
        fhirServerUrl,
        patientId,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt
      }).returning();
      return inserted[0] as FHIRConnectionInfo;
    }
  }

  /**
   * Refreshes access token using Refresh Token
   */
  static async refreshAccessToken(connection: FHIRConnectionInfo): Promise<FHIRConnectionInfo> {
    if (!connection.refreshToken) {
      throw new Error('No refresh token available to refresh session');
    }

    const endpoints = await this.discoverEndpoints(connection.fhirServerUrl);
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', connection.refreshToken);
    params.append('client_id', 'mock-client-id'); // Use config value in production

    logger.info('Refreshing expired SMART access token', { userId: connection.userId });
    const response = await axios.post(endpoints.token_endpoint, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = response.data;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token || connection.refreshToken;
    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const updated = await db.update(fhirConnections)
      .set({
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(fhirConnections.id, connection.id))
      .returning();

    return updated[0] as FHIRConnectionInfo;
  }

  /**
   * Secure REST helper with automatic token refreshing
   */
  static async requestFHIR(connection: FHIRConnectionInfo, urlPath: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    let conn = connection;
    if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt) <= new Date()) {
      try {
        conn = await this.refreshAccessToken(conn);
      } catch (e: any) {
        logger.error('Failed to auto-refresh access token', { userId: conn.userId, error: e.message });
      }
    }

    const cleanUrl = `${conn.fhirServerUrl.replace(/\/$/, '')}/${urlPath.replace(/^\//, '')}`;
    logger.debug('Making SMART on FHIR request', { method, cleanUrl, patientId: conn.patientId });

    try {
      const response = await axios({
        url: cleanUrl,
        method,
        headers: {
          'Authorization': `Bearer ${conn.accessToken}`,
          'Accept': 'application/fhir+json',
          'Content-Type': method !== 'GET' ? 'application/fhir+json' : undefined
        },
        data
      });
      return response.data;
    } catch (error: any) {
      logger.error('FHIR request execution failed', {
        url: cleanUrl,
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error.message
      });
      throw error;
    }
  }

  // --- CRUD FHIR OPERATIONS ---

  static async getPatient(userId: string): Promise<FHIRPatient> {
    const conn = await this.getConnection(userId);
    if (!conn) throw new Error('EHR patient connection not established');
    return await this.requestFHIR(conn, `/Patient/${conn.patientId}`);
  }

  static async createPatient(userId: string, patient: FHIRPatient): Promise<FHIRPatient> {
    const conn = await this.getConnection(userId);
    if (!conn) throw new Error('EHR connection not established');
    const cleanPatient = { ...patient, resourceType: 'Patient' as const };
    return await this.requestFHIR(conn, '/Patient', 'POST', cleanPatient);
  }

  static async updatePatient(userId: string, patient: FHIRPatient): Promise<FHIRPatient> {
    const conn = await this.getConnection(userId);
    if (!conn) throw new Error('EHR connection not established');
    if (!patient.id) patient.id = conn.patientId;
    return await this.requestFHIR(conn, `/Patient/${patient.id}`, 'PUT', patient);
  }

  static async getAppointments(userId: string): Promise<FHIRAppointment[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/Appointment?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getMedications(userId: string): Promise<FHIRMedicationRequest[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/MedicationRequest?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getAllergies(userId: string): Promise<FHIRAllergy[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/AllergyIntolerance?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getObservations(userId: string): Promise<FHIRObservation[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/Observation?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getConditions(userId: string): Promise<FHIRCondition[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/Condition?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getEncounters(userId: string): Promise<FHIREncounter[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/Encounter?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getPractitioners(userId: string): Promise<any[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      // Fetch Encounters to extract doctor references or search directly
      const data = await this.requestFHIR(conn, '/Practitioner');
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  static async getDiagnosticReports(userId: string): Promise<FHIRDiagnosticReport[]> {
    const conn = await this.getConnection(userId);
    if (!conn) return [];
    try {
      const data = await this.requestFHIR(conn, `/DiagnosticReport?patient=${conn.patientId}`);
      return (data.entry || []).map((e: any) => e.resource);
    } catch {
      return [];
    }
  }

  /**
   * Retrieves aggregated clinical data bundle
   */
  static async getClinicalData(userId: string): Promise<{
    patient: FHIRPatient | null;
    appointments: FHIRAppointment[];
    medications: FHIRMedicationRequest[];
    allergies: FHIRAllergy[];
    observations: FHIRObservation[];
    conditions: FHIRCondition[];
    encounters: FHIREncounter[];
    reports: FHIRDiagnosticReport[];
  }> {
    const [patient, appointments, medications, allergies, observations, conditions, encounters, reports] = await Promise.all([
      this.getPatient(userId).catch(() => null),
      this.getAppointments(userId),
      this.getMedications(userId),
      this.getAllergies(userId),
      this.getObservations(userId),
      this.getConditions(userId),
      this.getEncounters(userId),
      this.getDiagnosticReports(userId)
    ]);

    return { patient, appointments, medications, allergies, observations, conditions, encounters, reports };
  }

  /**
   * Synchronizes consultation clinical records to target EHR as standard FHIR R4 Bundle
   */
  static async syncConsultationToFHIR(userId: string, consultationId: string): Promise<{ success: boolean; bundleId?: string }> {
    const conn = await this.getConnection(userId);
    if (!conn) throw new Error('EHR patient connection not established');

    // Fetch local database details
    const consultationList = await db.select().from(consultations).where(eq(consultations.id, consultationId));
    if (consultationList.length === 0) throw new Error('Consultation record not found');
    const consultation = consultationList[0];

    const voiceSessionList = await db.select().from(voiceSessions).where(eq(voiceSessions.consultationId, consultationId));
    const voiceSession = voiceSessionList[0] || null;

    const reportList = await db.select().from(medicalReports).where(eq(medicalReports.consultationId, consultationId));
    const report = reportList[0] || null;

    const patientRef = `Patient/${conn.patientId}`;
    const timestampStr = new Date().toISOString();

    // 1. Encounter resource
    const encounter: FHIREncounter = {
      resourceType: 'Encounter',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB', // Ambulatory / outpatient clinic
        display: 'ambulatory'
      },
      subject: { reference: patientRef },
      period: {
        start: consultation.startedAt ? new Date(consultation.startedAt).toISOString() : timestampStr,
        end: consultation.endedAt ? new Date(consultation.endedAt).toISOString() : timestampStr
      }
    };

    // 2. Symptoms as Observation resource
    const symptomsObs: FHIRObservation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '75325-1',
          display: 'Symptom history'
        }],
        text: 'Patient reported symptoms'
      },
      subject: { reference: patientRef },
      effectiveDateTime: timestampStr,
      valueString: consultation.symptoms || 'No symptoms reported'
    };

    // 3. Assessment Diagnosis as Condition resource
    const condition: FHIRCondition = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'provisional'
        }]
      },
      code: {
        text: report?.diagnosis || 'Under medical evaluation'
      },
      subject: { reference: patientRef },
      onsetDateTime: timestampStr
    };

    // 4. Clinical Report DocumentReference
    const docRef = {
      resourceType: 'DocumentReference',
      status: 'current',
      docStatus: 'final',
      type: {
        coding: [{
          system: 'http://loinc.org',
          code: '11506-3',
          display: 'Provider-unspecified Progress note'
        }],
        text: 'AI Voice SOAP Consultation Note'
      },
      subject: { reference: patientRef },
      date: timestampStr,
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: Buffer.from(
              `MediVoice AI Progress Report\n` +
              `Consultation ID: ${consultationId}\n` +
              `Symptoms: ${consultation.symptoms}\n` +
              `Diagnosis: ${report?.diagnosis || 'N/A'}\n` +
              `Notes: ${consultation.notes || ''}\n` +
              `Emotion Analysis: ${voiceSession?.emotion || 'N/A'}`
            ).toString('base64'),
            title: 'Consultation SOAP Summary'
          }
        }
      ]
    };

    // Create a transaction bundle
    const bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: encounter,
          request: { method: 'POST', url: 'Encounter' }
        },
        {
          resource: symptomsObs,
          request: { method: 'POST', url: 'Observation' }
        },
        {
          resource: condition,
          request: { method: 'POST', url: 'Condition' }
        },
        {
          resource: docRef,
          request: { method: 'POST', url: 'DocumentReference' }
        }
      ]
    };

    try {
      logger.info('Uploading consultation FHIR transaction bundle', { consultationId });
      const response = await this.requestFHIR(conn, '/', 'POST', bundle);
      
      // Log successful sync attempt
      const { SyncQueueService } = await import('./syncQueueService');
      await SyncQueueService.logSyncAttempt(userId, consultationId, 'Bundle', 'success', 'automatic');

      return {
        success: true,
        bundleId: response.id || 'transaction-completed'
      };
    } catch (err: any) {
      // Log failed sync attempt
      const { SyncQueueService } = await import('./syncQueueService');
      await SyncQueueService.logSyncAttempt(userId, consultationId, 'Bundle', 'failed', 'automatic', err.message);
      throw err;
    }
  }
}
