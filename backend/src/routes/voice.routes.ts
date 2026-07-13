import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { voiceProcessSchema } from '../validators/voice.validator';
import { detectEmotionSchema } from '../validators/emotion.validator';
import { detectEmotionFromSpeech } from '../services/emotionService';
import { translateTextSchema } from '../validators/translation.validator';
import { translateText } from '../services/translationService';
import { enrollVoiceSchema, verifyVoiceSchema } from '../validators/biometrics.validator';
import { enrollVoiceTemplate, verifyVoiceTemplate } from '../services/biometricsService';
import { catchAsync } from '../utils/catchAsync';
import { db } from '../config/database';
import { voiceSessions } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const router = Router();

// Process voice (placeholder - actual processing is done via WebSocket)
router.post('/process', validate(voiceProcessSchema), catchAsync(async (req: Request, res: Response) => {
  const { audioBuffer, consultationId } = req.body;
  res.json({ success: true, message: 'Audio received and queued for processing' });
}));

// Run emotion detection on input text
router.post('/detect-emotion', validate(detectEmotionSchema), catchAsync(async (req: Request, res: Response) => {
  const { text, consultationId } = req.body;
  
  logger.info('Analyzing emotion for request', { consultationId });
  const emotionResult = await detectEmotionFromSpeech(text);

  if (consultationId) {
    // Find voice sessions for this consultation and update the latest session with the detected emotion
    const sessions = await db.select()
      .from(voiceSessions)
      .where(eq(voiceSessions.consultationId, consultationId as string));

    if (sessions.length > 0) {
      // Update the latest voice session
      const latestSession = sessions[sessions.length - 1];
      await db.update(voiceSessions)
        .set({
          emotion: emotionResult.emotion,
          emotionConfidence: emotionResult.confidence.toString(), // Store as string for Drizzle decimal compatibility
          emotionScores: emotionResult.scores,
        })
        .where(eq(voiceSessions.id, latestSession.id));
      logger.info('Saved emotion detection result to database', { sessionId: latestSession.id, emotion: emotionResult.emotion });
    } else {
      // Create a voice session on the fly if none exists
      await db.insert(voiceSessions).values({
        consultationId: consultationId as string,
        emotion: emotionResult.emotion,
        emotionConfidence: emotionResult.confidence.toString(),
        emotionScores: emotionResult.scores,
        transcript: [{ role: 'user', content: text, timestamp: new Date().toISOString() }],
      });
      logger.info('Created new voice session to save emotion detection result', { consultationId, emotion: emotionResult.emotion });
    }
  }

  res.json({
    success: true,
    data: emotionResult
  });
}));

// Get all stored emotions for a consultation ID
router.get('/emotions/:consultationId', catchAsync(async (req: Request, res: Response) => {
  const { consultationId } = req.params;

  const sessions = await db.select({
    id: voiceSessions.id,
    emotion: voiceSessions.emotion,
    emotionConfidence: voiceSessions.emotionConfidence,
    emotionScores: voiceSessions.emotionScores,
    startedAt: voiceSessions.startedAt,
  })
  .from(voiceSessions)
  .where(eq(voiceSessions.consultationId, consultationId as string));

  if (!sessions.length) {
    throw new AppError('No voice sessions found for this consultation', 404);
  }

  res.json({
    success: true,
    data: sessions
  });
}));

// Translate text
router.post('/translate', validate(translateTextSchema), catchAsync(async (req: Request, res: Response) => {
  const { text, targetLang, sourceLang } = req.body;
  const translationResult = await translateText(text, targetLang, sourceLang);
  res.json({
    success: true,
    data: translationResult
  });
}));

// Enroll Voice Biometrics
router.post('/biometrics/enroll', validate(enrollVoiceSchema), catchAsync(async (req: Request, res: Response) => {
  const { userId, audio } = req.body;
  const buffer = Buffer.from(audio, 'base64');
  const result = await enrollVoiceTemplate(userId, buffer);
  res.status(result.success ? 200 : 400).json(result);
}));

// Verify Voice Biometrics
router.post('/biometrics/verify', validate(verifyVoiceSchema), catchAsync(async (req: Request, res: Response) => {
  const { userId, audio } = req.body;
  const buffer = Buffer.from(audio, 'base64');
  const result = await verifyVoiceTemplate(userId, buffer);
  res.status(result.success ? 200 : 400).json(result);
}));

export default router;