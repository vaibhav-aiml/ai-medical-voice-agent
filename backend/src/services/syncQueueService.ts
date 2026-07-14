import { db } from '../config/database';
import { fhirSyncLogs } from '../db/schema/index';
import { eq, and } from 'drizzle-orm';
import { FHIRService } from './fhirService';
import logger from '../utils/logger';

export class SyncQueueService {
  /**
   * Log a synchronization attempt in the database
   */
  static async logSyncAttempt(
    userId: string,
    consultationId: string,
    resourceType: string,
    status: 'success' | 'failed' | 'pending',
    syncType: 'manual' | 'automatic',
    error?: string
  ): Promise<void> {
    try {
      // Check if sync log already exists for this consultation & resource
      const existing = await db
        .select()
        .from(fhirSyncLogs)
        .where(
          and(
            eq(fhirSyncLogs.consultationId, consultationId),
            eq(fhirSyncLogs.resourceType, resourceType)
          )
        );

      if (existing.length > 0) {
        const record = existing[0];
        const nextVersion = (record.version || 1) + 1;
        
        await db
          .update(fhirSyncLogs)
          .set({
            status,
            syncType,
            version: nextVersion,
            error: error || null,
            updatedAt: new Date()
          })
          .where(eq(fhirSyncLogs.id, record.id));
      } else {
        await db.insert(fhirSyncLogs).values({
          userId,
          consultationId,
          resourceType,
          status,
          syncType,
          version: 1,
          error: error || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (err: any) {
      logger.error('Failed to write sync log entry', { error: err.message });
    }
  }

  /**
   * Worker task: Retrieves failed sync logs and re-attempts synchronization
   */
  static async retryFailedSyncs(): Promise<{ processed: number; succeeded: number }> {
    logger.info('Starting sync queue background worker execution');

    const failedLogs = await db
      .select()
      .from(fhirSyncLogs)
      .where(eq(fhirSyncLogs.status, 'failed'));

    let processed = 0;
    let succeeded = 0;

    for (const log of failedLogs) {
      if (!log.consultationId) continue;
      processed++;
      
      try {
        logger.info(`Retrying synchronization for consultation: ${log.consultationId}`);
        // Attempt FHIR Bundle sync
        await FHIRService.syncConsultationToFHIR(log.userId, log.consultationId);
        
        // Update log on success
        await db
          .update(fhirSyncLogs)
          .set({
            status: 'success',
            error: null,
            updatedAt: new Date()
          })
          .where(eq(fhirSyncLogs.id, log.id));
        
        succeeded++;
      } catch (err: any) {
        logger.error(`Sync retry failed again for consultation: ${log.consultationId}`, { error: err.message });
        
        await db
          .update(fhirSyncLogs)
          .set({
            error: `Retry failed: ${err.message}`,
            updatedAt: new Date()
          })
          .where(eq(fhirSyncLogs.id, log.id));
      }
    }

    logger.info('Sync queue worker run finished', { processed, succeeded });
    return { processed, succeeded };
  }
}
