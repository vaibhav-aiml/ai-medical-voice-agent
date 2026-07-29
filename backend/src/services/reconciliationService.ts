import { db } from '../config/database';
import { users, fhirConnections, hipaaLogs } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { FHIRService } from './fhirService';
import logger from '../utils/logger';

export interface ReconciliationResult {
  userId: string;
  patientId: string;
  reconciled: boolean;
  changes: { field: string; oldVal: string; newVal: string }[];
}

export class ReconciliationService {
  static async reconcileDemographics(userId: string): Promise<ReconciliationResult> {
    logger.info('Starting demographic reconciliation with FHIR server', { userId });
    const connections = await db.select().from(fhirConnections).where(eq(fhirConnections.userId, userId));
    if (connections.length === 0) {
      throw new Error('User is not connected to any FHIR/EHR platform');
    }
    const connection = connections[0];
    const remotePatient = await FHIRService.getPatient(userId);
    if (!remotePatient) {
      throw new Error(`Failed to retrieve remote FHIR patient resource for ID: ${connection.patientId}`);
    }
    const localUsers = await db.select().from(users).where(eq(users.id, userId));
    if (localUsers.length === 0) {
      throw new Error('Local user profile not found');
    }
    const localUser = localUsers[0];

    const changes: { field: string; oldVal: string; newVal: string }[] = [];
    const updates: Partial<typeof localUser> = {};
    let remoteName = '';
    if (remotePatient.name && remotePatient.name.length > 0) {
      const primary = remotePatient.name[0];
      const family = primary.family || '';
      const given = primary.given ? primary.given.join(' ') : '';
      remoteName = `${given} ${family}`.trim();
    }

    if (remoteName && localUser.name !== remoteName) {
      changes.push({ field: 'name', oldVal: localUser.name || '', newVal: remoteName });
      updates.name = remoteName;
    }
    let remoteBirthDate: Date | null = null;
    if (remotePatient.birthDate) {
      remoteBirthDate = new Date(remotePatient.birthDate);
    }

    if (remoteBirthDate) {
      const localBirthTime = localUser.dateOfBirth ? new Date(localUser.dateOfBirth).getTime() : 0;
      const remoteBirthTime = remoteBirthDate.getTime();
      if (localBirthTime !== remoteBirthTime) {
        changes.push({
          field: 'dateOfBirth',
          oldVal: localUser.dateOfBirth ? new Date(localUser.dateOfBirth).toISOString().substring(0, 10) : 'None',
          newVal: remotePatient.birthDate
        });
        updates.dateOfBirth = remoteBirthDate;
      }
    }
    let remoteEmail = '';
    if (remotePatient.telecom) {
      const emailContact = remotePatient.telecom.find((t: any) => t.system === 'email');
      if (emailContact) remoteEmail = emailContact.value || '';
    }

    if (remoteEmail && localUser.email !== remoteEmail) {
      changes.push({ field: 'email', oldVal: localUser.email || '', newVal: remoteEmail });
      updates.email = remoteEmail;
    }
    if (changes.length > 0) {
      await db.update(users).set(updates).where(eq(users.id, userId));
      await db.insert(hipaaLogs).values({
        type: 'Reconciliation Update',
        value: localUser.clerkId,
        accessReason: `Reconciled user demographics with FHIR server. Updated fields: ${changes.map(c => c.field).join(', ')}`,
        accessedBy: 'Interoperability Engine',
        timestamp: new Date()
      });

      logger.info('User demographics reconciled and updated from EHR sandbox', { userId, changesCount: changes.length });
    }

    return {
      userId,
      patientId: connection.patientId,
      reconciled: changes.length > 0,
      changes
    };
  }
}