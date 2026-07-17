import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { voiceSessions } from '../../db/schema/index';
import { eq } from 'drizzle-orm';
import { translateText } from '../../services/translationService';

export async function saveTranscriptWithTranslation(
  socket: Socket,
  consultationId: string,
  transcript: string,
  fullResponse: string,
  language: string
) {
  try {
    let translatedTranscript = '';
    let translatedAIResponse = '';
    
    if (language && language !== 'en') {
      logger.info('Translating transcript and response', { language, consultationId });
      const tUser = await translateText(transcript, 'en', language);
      translatedTranscript = tUser.translatedText;
      
      const tAI = await translateText(fullResponse, 'en', language);
      translatedAIResponse = tAI.translatedText;
    }

    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: transcript,
      translation: translatedTranscript || undefined,
      sourceLanguage: language,
      targetLanguage: 'en',
      timestamp: new Date().toISOString()
    };

    const aiMessage = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: fullResponse,
      translation: translatedAIResponse || undefined,
      sourceLanguage: language,
      targetLanguage: 'en',
      timestamp: new Date().toISOString()
    };

    const sessions = await db.select()
      .from(voiceSessions)
      .where(eq(voiceSessions.consultationId, consultationId as string));

    if (sessions.length > 0) {
      const latestSession = sessions[sessions.length - 1];
      const existingTranscript = Array.isArray(latestSession.transcript) ? latestSession.transcript : [];
      const existingAIResponses = Array.isArray(latestSession.aiResponses) ? latestSession.aiResponses : [];

      await db.update(voiceSessions)
        .set({
          transcript: [...existingTranscript, userMessage],
          aiResponses: [...existingAIResponses, aiMessage],
        })
        .where(eq(voiceSessions.id, latestSession.id));
      logger.info('Saved translated dialog turns to existing voice session', { sessionId: latestSession.id });
    } else {
      await db.insert(voiceSessions).values({
        consultationId: consultationId as string,
        transcript: [userMessage],
        aiResponses: [aiMessage],
      });
      logger.info('Created new voice session to save translated dialogue turns', { consultationId });
    }

    // Emit translations to client
    socket.emit('translation-complete', {
      consultationId,
      userMessage,
      aiMessage
    });
  } catch (error: any) {
    logger.error('Failed in saveTranscriptWithTranslation', { error: error.message, consultationId });
  }
}
