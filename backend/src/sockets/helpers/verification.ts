import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { consultations, users } from '../../db/schema/index';
import { eq } from 'drizzle-orm';

export interface OwnershipVerificationOptions {
  autoCreateIfMissing?: boolean;
}

/**
 * Core DB-lookup-and-ownership-compare logic shared across transport layers
 * (Socket.io handlers and Express REST middleware).
 *
 * Resolves Clerk ID → internal DB user ID → consultation lookup → compare owner.
 *
 * Security invariants — all error paths return false (deny access):
 *   - Missing clerkId → false
 *   - Missing consultationId → false
 *   - DB user lookup fails → false
 *   - DB consultation lookup fails → false
 *   - Unexpected error → false
 *
 * The only paths that return true:
 *   - Test bypass active AND using the test user
 *   - Consultation does not yet exist AND autoCreateIfMissing is true
 *   - Consultation exists and the authenticated user is the owner
 */
export async function verifyConsultationOwnershipCore(
  clerkId: string | undefined,
  consultationId: string | undefined,
  options: OwnershipVerificationOptions = {}
): Promise<boolean> {
  try {
    // Test harness bypass — only active inside Vitest with explicit flag
    if (process.env.VITEST === 'true' && process.env.TEST_BYPASS_AUTH === 'true' && clerkId === 'test-user-vitest') {
      return true;
    }

    // No authenticated user ID → deny
    if (!clerkId) {
      logger.warn('No userId provided during consultation verification');
      return false;
    }

    // Missing or empty consultationId → deny
    if (!consultationId) {
      logger.warn('Empty consultationId passed to verification', { clerkId });
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
        logger.info('Creating DB user on-the-fly during verification', { clerkId });
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
      logger.error('DB user lookup failed in verification — denying access', { error: message, clerkId });
      return false;
    }

    // Check consultation ownership
    try {
      const consultationList = await db.select()
        .from(consultations)
        .where(eq(consultations.id, consultationId))
        .limit(1);

      if (consultationList.length === 0) {
        if (options.autoCreateIfMissing) {
          logger.info('Auto-registering consultation session in DB during verification', { consultationId, clerkId });
          await db.insert(consultations).values({
            id: consultationId,
            userId: internalUserId,
            specialistType: 'general',
            status: 'active',
            startedAt: new Date(),
          }).onConflictDoNothing();
          return true;
        } else {
          logger.warn('Consultation not found during verification (auto-create disabled)', { consultationId, clerkId });
          return false;
        }
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
      logger.error('DB consultation lookup failed in verification — denying access', { error: message, consultationId });
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Unexpected error → deny access (fail-closed)
    logger.error('Unexpected failure in verifyConsultationOwnershipCore — denying access', { error: message });
    return false;
  }
}

/**
 * Socket.io transport adapter for consultation ownership verification.
 */
export async function verifyConsultationOwnership(socket: Socket, consultationId: string): Promise<boolean> {
  const clerkId: string | undefined = socket.data?.userId;
  return verifyConsultationOwnershipCore(clerkId, consultationId, { autoCreateIfMissing: true });
}