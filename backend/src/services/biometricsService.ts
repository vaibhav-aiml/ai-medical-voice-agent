import { db } from '../config/database';
import { voiceBiometrics, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { extractVoiceEmbedding, calculateCosineSimilarity } from '../utils/audioProcessor';
import logger from '../utils/logger';

const SIMILARITY_THRESHOLD = 0.85;

export interface EnrollResult {
  success: boolean;
  message: string;
  embedding?: number[];
}

export interface VerifyResult {
  success: boolean;
  isMatch: boolean;
  confidence: number;
  message: string;
}

/**
 * Enrolls a patient's voice signature template into the database.
 * Enforces the unique constraint to prevent duplicate enrollments for the same user.
 */
export async function enrollVoiceTemplate(userId: string, audioBuffer: Buffer): Promise<EnrollResult> {
  try {
    if (!userId) {
      return { success: false, message: 'Invalid or missing user ID.' };
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return { success: false, message: 'Invalid or missing audio buffer.' };
    }

    let internalUserId = userId;
    const userList = await db.select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
      
    if (userList.length === 0) {
      if (process.env.NODE_ENV !== 'production' && userId === 'dev-user-123') {
        const allUsers = await db.select().from(users).limit(1);
        if (allUsers.length > 0) {
          internalUserId = allUsers[0].id;
        } else {
          return { success: false, message: 'No users found in database to map dev-user-123.' };
        }
      } else {
        return { success: false, message: 'User profile not found in database.' };
      }
    } else {
      internalUserId = userList[0].id;
    }

    // Check if the user is already enrolled to prevent duplicates proactively
    const existing = await db
      .select()
      .from(voiceBiometrics)
      .where(eq(voiceBiometrics.userId, internalUserId));

    if (existing.length > 0) {
      logger.warn('User already enrolled for voice biometrics', { userId: internalUserId });
      return { success: false, message: 'User is already enrolled. Duplicate enrollment prevented.' };
    }

    // Extract embedding vector
    const embedding = extractVoiceEmbedding(audioBuffer);

    // Save to database
    await db.insert(voiceBiometrics).values({
      userId: internalUserId,
      voiceEmbedding: embedding,
    });

    logger.info('Voice profile enrolled successfully', { userId: internalUserId });
    return {
      success: true,
      message: 'Voice profile enrolled successfully.',
      embedding,
    };
  } catch (error: any) {
    logger.error('Failed to enroll voice biometrics', { userId, error: error.message });
    return {
      success: false,
      message: `Failed to enroll voice signature: ${error.message}`,
    };
  }
}

/**
 * Verifies a patient's voice signature against their enrolled template.
 * Computes the cosine similarity vector distance metric.
 */
export async function verifyVoiceTemplate(userId: string, audioBuffer: Buffer): Promise<VerifyResult> {
  try {
    if (!userId) {
      return { success: false, isMatch: false, confidence: 0, message: 'Invalid or missing user ID.' };
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return { success: false, isMatch: false, confidence: 0, message: 'Invalid or missing audio buffer.' };
    }

    let internalUserId = userId;
    const userList = await db.select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
      
    if (userList.length === 0) {
      if (process.env.NODE_ENV !== 'production' && userId === 'dev-user-123') {
        const allUsers = await db.select().from(users).limit(1);
        if (allUsers.length > 0) {
          internalUserId = allUsers[0].id;
        } else {
          return { success: false, isMatch: false, confidence: 0, message: 'No users found in database to map dev-user-123.' };
        }
      } else {
        return { success: false, isMatch: false, confidence: 0, message: 'User profile not found in database.' };
      }
    } else {
      internalUserId = userList[0].id;
    }

    // Retrieve enrolled embedding
    const records = await db
      .select()
      .from(voiceBiometrics)
      .where(eq(voiceBiometrics.userId, internalUserId));

    if (records.length === 0) {
      logger.warn('Voice profile not found for verification', { userId: internalUserId });
      return {
        success: false,
        isMatch: false,
        confidence: 0,
        message: 'No enrolled voice signature template found for this user.',
      };
    }

    const enrolledEmbedding = records[0].voiceEmbedding as number[];
    const testEmbedding = extractVoiceEmbedding(audioBuffer);

    // Calculate similarity score
    const similarity = calculateCosineSimilarity(enrolledEmbedding, testEmbedding);
    const confidence = Math.max(0, Math.min(1, similarity)); // Clamp score between 0 and 1
    const isMatch = confidence >= SIMILARITY_THRESHOLD;

    logger.info('Voice verification completed', {
      userId: internalUserId,
      isMatch,
      confidence,
    });

    return {
      success: true,
      isMatch,
      confidence,
      message: isMatch
        ? 'Voice signature verified successfully.'
        : 'Voice signature verification failed: mismatched characteristics.',
    };
  } catch (error: any) {
    logger.error('Error during voice verification', { userId, error: error.message });
    return {
      success: false,
      isMatch: false,
      confidence: 0,
      message: `Verification process encountered an error: ${error.message}`,
    };
  }
}
