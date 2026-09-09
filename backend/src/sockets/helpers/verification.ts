import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { consultations, users } from '../../db/schema/index';
import { eq } from 'drizzle-orm';

/**
 * Verifies that the authenticated socket user owns (or has access to)
 * the specified consultation.
 *
 * Security invariants — all error paths return false (deny access):
 *   - Missing consultationId → false
 *   - DB user lookup fails → false
 *   - DB consultation lookup fails → false
 *   - Unexpected error → false
 *
 * The only paths that return true:
 *   - Test bypass active AND using the test user
 *   - Consultation does not yet exist (auto-created for authenticated user)
 *   - Consultation exists and the authenticated user is the owner
 */
export async function verifyConsultationOwnership(socket: Socket, consultationId: string): Promise<boolean> {
  try {
    const clerkId: string | undefined = socket.data.userId;

    // Test harness bypass — only active inside Vitest with explicit flag
    if (process.env.VITEST === 'true' && process.env.TEST_BYPASS_AUTH === 'true' && clerkId === 'test-user-vitest') {
      return true;
    }

    // No authenticated user on the socket → deny
    if (!clerkId) {
      logger.warn('No userId on socket during consultation verification', { socketId: socket.id });
      return false;
    }

    // Missing or empty consultationId → deny (not silently allow)
    if (!consultationId) {
      logger.warn('Empty consultationId passed to verification', { socketId: socket.id, clerkId });
      return false;
    }

    // Resolve the Clerk ID to an internal DB user ID
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
    } catch (userErr: unknown) {
      const message = userErr instanceof Error ? userErr.message : String(userErr);
      // DB failure during user lookup → deny access (fail-closed)
      logger.error('DB user lookup failed in socket verification — denying access', { error: message, clerkId });
      return false;
    }

    // Check consultation ownership
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
    } catch (consultErr: unknown) {
      const message = consultErr instanceof Error ? consultErr.message : String(consultErr);
      // DB failure during consultation lookup → deny access (fail-closed)
      logger.error('DB consultation lookup failed in socket verification — denying access', { error: message, consultationId });
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Unexpected error → deny access (fail-closed)
    logger.error('Unexpected failure in verifyConsultationOwnership — denying access', { error: message });
    return false;
  }
}