import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { consultations, users } from '../../db/schema/index';
import { eq } from 'drizzle-orm';
export async function verifyConsultationOwnership(socket: Socket, consultationId: string): Promise<boolean> {
  try {
    const clerkId = socket.data.userId || 'dev-user-123';
    if (process.env.NODE_ENV !== 'production' && clerkId === 'dev-user-123') {
      return true;
    }

    if (!consultationId) {
      logger.warn('Empty consultationId passed to verification');
      return true; 
    }
    let internalUserId: string = clerkId;
    try {
      const userList = await db.select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (userList.length === 0) {
        logger.info('Creating DB user on-the-fly during socket verification', { clerkId });
        const inserted = await db.insert(users).values({
          clerkId: clerkId,
          email: `${clerkId}@example.com`,
          name: 'MediVoice Patient',
        }).returning();
        if (inserted.length > 0) {
          internalUserId = inserted[0].id;
        }
      } else {
        internalUserId = userList[0].id;
      }
    } catch (userErr: any) {
      logger.warn('Failed DB user lookup in socket verification, falling back to clerkId', { error: userErr.message });
      internalUserId = clerkId;
    }
    try {
      const consultationList = await db.select()
        .from(consultations)
        .where(eq(consultations.id, consultationId))
        .limit(1);

      if (consultationList.length === 0) {
        logger.info('Auto-registering consultation session in DB during socket verification', { consultationId, clerkId });
        await db.insert(consultations).values({
          id: consultationId,
          userId: internalUserId,
          specialistType: 'general',
          status: 'active',
          startedAt: new Date(),
        }).onConflictDoNothing();
        return true;
      }
      const ownerId = consultationList[0].userId;
      if (ownerId !== internalUserId && ownerId !== clerkId) {
        logger.warn('Unauthorized consultation access attempt blocked', {
          clerkId,
          internalUserId,
          consultationId,
          ownerId,
        });
        return false;
      }

      return true;
    } catch (consultErr: any) {
      logger.warn('Failed DB consultation lookup in socket verification, defaulting to allow for authenticated socket', { error: consultErr.message });
      return true; 
    }
  } catch (error: any) {
    logger.error('Unexpected failure in verifyConsultationOwnership', { error: error.message });
    return true; 
  }
}