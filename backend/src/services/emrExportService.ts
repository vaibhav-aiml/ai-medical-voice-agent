import { db } from '../config/database';
import { consultations, users, voiceSessions, medicalReports } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { HL7Service } from './hl7Service';
import { reportGenerator, ConsultationReport, SOAPData } from './reportGenerator';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export interface EMRStructuredReport {
  exportTimestamp: string;
  patient: {
    clerkId: string;
    name: string;
    email: string;
    gender: string;
    birthDate: string | null;
  };
  consultation: {
    id: string;
    specialistType: string;
    specialistName: string | null;
    status: string | null;
    symptoms: string | null;
    notes: string | null;
    startedAt: string;
    endedAt: string | null;
    durationMinutes: number;
  };
  report: {
    diagnosis: string | null;
    recommendations: any | null;
    medications: any | null;
    followUpNeeded: boolean;
    followUpDate: string | null;
  } | null;
  voiceSession: {
    transcript: any | null;
    aiResponses: any | null;
    emotion: string | null;
    emotionConfidence: number;
  } | null;
}

export class EMRExportService {
  /**
   * Fetch elements and build a unified structured clinical report
   */
  static async exportStructuredJSON(userId: string, consultationId: string): Promise<EMRStructuredReport> {
    logger.info('Compiling unified structured clinical EMR report', { consultationId });

    const consultList = await db.select().from(consultations).where(eq(consultations.id, consultationId));
    if (consultList.length === 0) throw new Error('Consultation not found');
    const consult = consultList[0];

    const userList = await db.select().from(users).where(eq(users.id, consult.userId as string));
    if (userList.length === 0) throw new Error('Patient user record not found');
    const user = userList[0];

    const reportList = await db.select().from(medicalReports).where(eq(medicalReports.consultationId, consultationId));
    const report = reportList[0] || null;

    const sessionList = await db.select().from(voiceSessions).where(eq(voiceSessions.consultationId, consultationId));
    const voiceSession = sessionList[0] || null;

    return {
      exportTimestamp: new Date().toISOString(),
      patient: {
        clerkId: user.clerkId,
        name: user.name || 'MediVoice Patient',
        email: user.email,
        gender: user.phone || 'U', // fallback or placeholder
        birthDate: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString() : null
      },
      consultation: {
        id: consult.id,
        specialistType: consult.specialistType,
        specialistName: consult.specialistName,
        status: consult.status,
        symptoms: consult.symptoms,
        notes: consult.notes,
        startedAt: consult.startedAt ? new Date(consult.startedAt).toISOString() : new Date().toISOString(),
        endedAt: consult.endedAt ? new Date(consult.endedAt).toISOString() : null,
        durationMinutes: consult.duration ? parseFloat(consult.duration.toString()) : 0
      },
      report: report ? {
        diagnosis: report.diagnosis,
        recommendations: report.recommendations,
        medications: report.medications,
        followUpNeeded: report.followUpNeeded || false,
        followUpDate: report.followUpDate ? new Date(report.followUpDate).toISOString() : null
      } : null,
      voiceSession: voiceSession ? {
        transcript: voiceSession.transcript,
        aiResponses: voiceSession.aiResponses,
        emotion: voiceSession.emotion,
        emotionConfidence: voiceSession.emotionConfidence ? parseFloat(voiceSession.emotionConfidence.toString()) : 0
      } : null
    };
  }

  /**
   * Generates a standard HL7 ORU^R01 message string for a consultation
   */
  static async exportHL7(userId: string, consultationId: string): Promise<string> {
    const data = await this.exportStructuredJSON(userId, consultationId);
    
    const patientData = {
      id: data.patient.clerkId,
      name: data.patient.name,
      email: data.patient.email,
      gender: 'U',
      birthDate: data.patient.birthDate ? data.patient.birthDate.substring(0, 10) : undefined
    };

    const consultData = {
      id: data.consultation.id,
      symptoms: data.consultation.symptoms || '',
      notes: data.consultation.notes || '',
      startedAt: new Date(data.consultation.startedAt)
    };

    const diagnosis = data.report?.diagnosis || 'Under evaluation';

    return HL7Service.generateORU(patientData, consultData, diagnosis);
  }

  /**
   * Generates a standard FHIR Transaction Bundle
   */
  static async exportFHIRBundle(userId: string, consultationId: string): Promise<any> {
    const data = await this.exportStructuredJSON(userId, consultationId);
    const patientRef = `Patient/${data.patient.clerkId}`;
    const timestampStr = new Date().toISOString();

    const encounter = {
      resourceType: 'Encounter',
      id: `enc-${data.consultation.id}`,
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory'
      },
      subject: { reference: patientRef },
      period: {
        start: data.consultation.startedAt,
        end: data.consultation.endedAt || data.consultation.startedAt
      }
    };

    const observation = {
      resourceType: 'Observation',
      id: `obs-${data.consultation.id}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '75325-1', display: 'Symptom history' }],
        text: 'Patient symptoms summary'
      },
      subject: { reference: patientRef },
      effectiveDateTime: timestampStr,
      valueString: data.consultation.symptoms || 'No symptoms reported'
    };

    const condition = {
      resourceType: 'Condition',
      id: `cond-${data.consultation.id}`,
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
      verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }] },
      code: { text: data.report?.diagnosis || 'Under medical evaluation' },
      subject: { reference: patientRef },
      onsetDateTime: timestampStr
    };

    const docRef = {
      resourceType: 'DocumentReference',
      id: `doc-${data.consultation.id}`,
      status: 'current',
      docStatus: 'final',
      type: {
        coding: [{ system: 'http://loinc.org', code: '11506-3', display: 'Progress note' }],
        text: 'AI SOAP Note'
      },
      subject: { reference: patientRef },
      date: timestampStr,
      content: [
        {
          attachment: {
            contentType: 'application/json',
            data: Buffer.from(JSON.stringify(data)).toString('base64'),
            title: 'Structured Consultation Record'
          }
        }
      ]
    };

    return {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: encounter },
        { resource: observation },
        { resource: condition },
        { resource: docRef }
      ]
    };
  }

  /**
   * Generates a standard FHIR resource (provisional Condition assessment)
   */
  static async exportFHIRJSON(userId: string, consultationId: string): Promise<any> {
    const data = await this.exportStructuredJSON(userId, consultationId);
    return {
      resourceType: 'Condition',
      id: `cond-${data.consultation.id}`,
      clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
      verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'provisional' }] },
      code: { text: data.report?.diagnosis || 'Under medical evaluation' },
      subject: { reference: `Patient/${data.patient.clerkId}` },
      onsetDateTime: new Date(data.consultation.startedAt).toISOString()
    };
  }

  /**
   * Streams/renders standard SOAP clinical report PDF
   */
  static async exportPDF(userId: string, consultationId: string): Promise<Buffer> {
    const data = await this.exportStructuredJSON(userId, consultationId);

    const recommendationsArray = Array.isArray(data.report?.recommendations) 
      ? data.report.recommendations 
      : typeof data.report?.recommendations === 'string'
        ? [data.report.recommendations]
        : ['Follow standard recovery tips'];

    const soapData: SOAPData = {
      subjective: {
        chiefComplaint: data.consultation.symptoms || 'Not specified',
        historyOfPresentIllness: data.consultation.symptoms || 'Patient described symptoms during voice consultation',
        pastMedicalHistory: undefined,
        medications: undefined,
        allergies: undefined
      },
      objective: {
        vitalSigns: undefined,
        physicalExam: undefined,
        labResults: undefined,
        imagingResults: undefined
      },
      assessment: {
        primaryDiagnosis: data.report?.diagnosis || 'Under evaluation',
        differentialDiagnosis: undefined,
        severity: 'mild',
        urgencyLevel: 'routine',
        riskFactors: []
      },
      plan: {
        recommendations: recommendationsArray,
        medications: Array.isArray(data.report?.medications) ? data.report.medications : [],
        followUp: data.report?.followUpDate ? `Schedule follow-up on ${new Date(data.report.followUpDate).toLocaleDateString()}` : 'Schedule follow-up if symptoms worsen',
        referrals: undefined,
        patientInstructions: ['Rest and monitor symptoms'],
        whenToSeekEmergency: 'Seek emergency care if breathing difficulties arise'
      }
    };

    const reportData: ConsultationReport = {
      id: uuidv4(),
      patientId: data.patient.clerkId,
      patientName: data.patient.name,
      patientAge: undefined,
      patientGender: undefined,
      consultationId: data.consultation.id,
      specialistType: data.consultation.specialistType,
      specialistName: data.consultation.specialistName || 'AI Doctor',
      date: new Date(data.consultation.startedAt),
      symptoms: data.consultation.symptoms || '',
      aiAnalysis: data.consultation.notes || '',
      soapData: soapData,
      recommendations: recommendationsArray,
      generatedBy: 'AI Assistant'
    };

    return await reportGenerator.generateSOAPReport(reportData);
  }
}
