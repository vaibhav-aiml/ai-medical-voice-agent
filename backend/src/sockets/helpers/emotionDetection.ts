import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { voiceSessions } from '../../db/schema/index';
import { eq } from 'drizzle-orm';
import { detectEmotionFromSpeech } from '../../services/emotionService';

export async function handleSocketEmotionDetection(socket: Socket, transcript: string, consultationId: string) {
  try {
    logger.info('Performing socket-based emotion detection', { consultationId });
    const emotionResult = await detectEmotionFromSpeech(transcript);
    
    // Emit emotion details back to client
    socket.emit('emotion-detected', {
      consultationId,
      ...emotionResult
    });
    
    // Save to database session
    const sessions = await db.select()
      .from(voiceSessions)
      .where(eq(voiceSessions.consultationId, consultationId));
      
    if (sessions.length > 0) {
      const latestSession = sessions[sessions.length - 1];
      await db.update(voiceSessions)
        .set({
          emotion: emotionResult.emotion,
          emotionConfidence: emotionResult.confidence.toString(),
          emotionScores: emotionResult.scores,
        })
        .where(eq(voiceSessions.id, latestSession.id));
      logger.info('Updated emotion on latest voice session via socket', { sessionId: latestSession.id, emotion: emotionResult.emotion });
    } else {
      await db.insert(voiceSessions).values({
        consultationId,
        emotion: emotionResult.emotion,
        emotionConfidence: emotionResult.confidence.toString(),
        emotionScores: emotionResult.scores,
        transcript: [{ role: 'user', content: transcript, timestamp: new Date().toISOString() }],
      });
      logger.info('Created voice session with emotion via socket', { consultationId, emotion: emotionResult.emotion });
    }
  } catch (error: any) {
    logger.error('Failed in handleSocketEmotionDetection', { error: error.message, consultationId });
  }
}
