import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { consultations, users } from '../../db/schema/index';
import { eq } from 'drizzle-orm';

export async function verifyConsultationOwnership(socket: Socket, consultationId: string): Promise<boolean> {
  try {
    const clerkId = socket.data.userId || 'dev-user-123';
    
    // In dev/test, bypass verification if it is dev-user-123 and database user is not set up
    if (process.env.NODE_ENV !== 'production' && clerkId === 'dev-user-123') {
      return true;
    }
    
    const userList = await db.select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    if (userList.length === 0) {
      logger.warn('Socket user profile not found in DB', { clerkId });
      return false;
    }
    const internalUserId = userList[0].id;
    
    const consultationList = await db.select()
      .from(consultations)
      .where(eq(consultations.id, consultationId))
      .limit(1);
    if (consultationList.length === 0) {
      logger.warn('Consultation not found for socket authorization check', { consultationId });
      return false;
    }
    
    if (consultationList[0].userId !== internalUserId) {
      logger.warn('Unauthorized consultation access attempt blocked', {
        clerkId,
        internalUserId,
        consultationId,
        ownerId: consultationList[0].userId
      });
      return false;
    }
    
    return true;
  } catch (error: any) {
    logger.error('Failed to verify consultation ownership in socket handler', { error: error.message });
    return false;
  }
}
