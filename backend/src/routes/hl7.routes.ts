import { Router, Request, Response } from 'express';
import { HL7Service } from '../services/hl7Service';
import { db } from '../config/database';
import { users, consultations, medicalReports, hipaaLogs } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/ingest', catchAsync(async (req: Request, res: Response) => {
  const rawPayload = typeof req.body === 'string' ? req.body : req.body.toString();
  
  if (!rawPayload || rawPayload.trim().length === 0) {
    logger.warn('Empty HL7 payload received in ingestion pipeline');
    const fallbackMsh = { name: 'MSH', fields: ['|', '^~\\&', '', '', '', '', '', '', 'ACK', `ACK_ERR_${Date.now()}`, 'P', '2.4'] };
    const ack = HL7Service.generateACK(fallbackMsh, 'AE', 'Empty message payload received');
    res.setHeader('Content-Type', 'text/plain');
    return res.send(ack);
  }

  logger.info('Ingesting raw HL7 V2 message payload');

  try {
    const parsed = HL7Service.parse(rawPayload);
    const validation = HL7Service.validate(parsed);

    const mshSegment = parsed.segments[0];

    if (!validation.valid || !mshSegment) {
      const fallbackMsh = mshSegment || { name: 'MSH', fields: ['|', '^~\\&', '', '', '', '', '', '', 'ACK', `ACK_ERR_${Date.now()}`, 'P', '2.4'] };
      const ack = HL7Service.generateACK(fallbackMsh, 'AE', validation.error || 'Message validation failed');
      res.setHeader('Content-Type', 'text/plain');
      return res.status(400).send(ack);
    }

    const messageType = HL7Service.getFieldValue(mshSegment, 9); 
    logger.info('Processing validated HL7 message event', { messageType });

    let processMessage = 'Message parsed and validated';
    if (messageType.startsWith('ADT')) {
      const pidSegment = parsed.segments.find(s => s.name === 'PID');
      if (pidSegment) {
        const patientId = HL7Service.getFieldValue(pidSegment, 3);
        const nameField = HL7Service.getFieldValue(pidSegment, 5);
        const familyName = HL7Service.getComponentValue(nameField, 1);
        const givenName = HL7Service.getComponentValue(nameField, 2);
        const email = HL7Service.getFieldValue(pidSegment, 13);
        const genderVal = HL7Service.getFieldValue(pidSegment, 8); 

        if (patientId) {
          
          const existing = await db.select().from(users).where(eq(users.clerkId, patientId));
          if (existing.length > 0) {
            await db.update(users)
              .set({
                name: `${givenName} ${familyName}`.trim(),
                email: email || existing[0].email,
                updatedAt: new Date()
              })
              .where(eq(users.id, existing[0].id));
            processMessage = `ADT demographic details updated for patient ${patientId}`;
          } else {
            
            await db.insert(users).values({
              clerkId: patientId,
              email: email || `${patientId}@example.com`,
              name: `${givenName} ${familyName}`.trim()
            });
            processMessage = `ADT patient profile registered for patient ${patientId}`;
          }
          await db.insert(hipaaLogs).values({
            type: 'HL7 Ingestion',
            value: patientId,
            accessReason: `Auto-ingested demographic message update (${messageType})`,
            accessedBy: 'HL7 Interface Node',
            timestamp: new Date()
          });
        }
      }
    }
    const ack = HL7Service.generateACK(mshSegment, 'AA', processMessage);
    res.setHeader('Content-Type', 'text/plain');
    res.send(ack);
  } catch (err: any) {
    logger.error('Failed to ingest HL7 message', { error: err.message });
    const fallbackMsh = { name: 'MSH', fields: ['|', '^~\\&', '', '', '', '', '', '', 'ACK', `ACK_ERR_${Date.now()}`, 'P', '2.4'] };
    const ack = HL7Service.generateACK(fallbackMsh, 'AE', `Server Ingestion Fault: ${err.message}`);
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send(ack);
  }
}));
router.get('/export/consultation/:id', requireAuth, catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const consultationList = await db.select().from(consultations).where(eq(consultations.id, id as string));
  if (consultationList.length === 0) {
    throw new AppError('Consultation session not found', 404);
  }
  const consultation = consultationList[0];
  const userList = await db.select().from(users).where(eq(users.id, consultation.userId as string));
  if (userList.length === 0) {
    throw new AppError('User linked to consultation not found', 404);
  }
  const user = userList[0];
  const reportList = await db.select().from(medicalReports).where(eq(medicalReports.consultationId, id as string));
  const report = reportList[0] || null;
  const patientData = {
    id: user.clerkId,
    name: user.name || 'MediVoice Patient',
    email: user.email,
    gender: 'U', 
    birthDate: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().substring(0, 10) : undefined
  };

  const consultationData = {
    id: consultation.id,
    symptoms: consultation.symptoms || '',
    notes: consultation.notes || '',
    startedAt: consultation.startedAt || new Date()
  };

  const diagnosis = report?.diagnosis || 'Under evaluation';

  logger.info('Generating raw HL7 ORU^R01 export payload', { consultationId: id });
  const rawHL7 = HL7Service.generateORU(patientData, consultationData, diagnosis);
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(rawHL7);
}));

export default router;