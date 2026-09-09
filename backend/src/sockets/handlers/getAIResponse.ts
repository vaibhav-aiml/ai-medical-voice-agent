import { Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import logger from '../../utils/logger';
import { socketRateLimiter } from '../../utils/socketRateLimiter';
import { verifyConsultationOwnership } from '../helpers/verification';
import { handleSocketEmotionDetection } from '../helpers/emotionDetection';
import { saveTranscriptWithTranslation } from '../helpers/transcriptTranslation';
import { getSystemPrompt, getFallbackResponse } from '../helpers/prompts';
import { phiService } from '../../services/phiService';

export function registerGetAIResponseHandler(socket: Socket, groq: Groq | null) {
  socket.on('get-ai-response', async (data: {
    consultationId: string;
    transcript: string;
    specialistType: string;
    userId?: string;
    conversationHistory?: Array<{role: string, content: string}>;
    language?: string;
  }) => {
    const { consultationId, transcript, specialistType, userId, conversationHistory, language = 'en' } = data;
    
    const allowed = socketRateLimiter.consume(socket.data.userId || 'dev-user-123', socket.id, 'get-ai-response');
    if (!allowed) {
      socket.emit('rate-limit-exceeded', { event: 'get-ai-response', message: 'Too many requests. Please try again later.' });
      return;
    }

    const authorized = await verifyConsultationOwnership(socket, consultationId);
    if (!authorized) {
      logger.warn('Unauthorized get-ai-response attempt blocked', { socketId: socket.id, consultationId });
      socket.emit('error-event', { message: 'Unauthorized: Access denied' });
      return;
    }

    logger.info(`Non-streaming AI request from socket`, {
      socketId: socket.id,
      consultationId,
      specialistType,
      language
    });
    handleSocketEmotionDetection(socket, transcript, consultationId);
    
    const systemPrompt = getSystemPrompt(specialistType, undefined, language);
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt },
    ];
    
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ 
            role: msg.role as 'user' | 'assistant', 
            content: msg.content 
          });
        }
      }
    }
    
    messages.push({ role: 'user', content: transcript });
    const promptLength = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    
    if (!groq) {
      logger.warn('llm_provider_fallback_triggered', {
        reason: 'groq_client_uninitialized',
        error: 'Groq client not initialized',
        promptLength,
        consultationId,
        specialistType,
        transcriptLength: transcript.length,
      });
      const response = getFallbackResponse(transcript, specialistType, conversationHistory);
      socket.emit('ai-response', { response, consultationId });
      saveTranscriptWithTranslation(socket, consultationId, transcript, response, language);
      return;
    }
    
    try {
      
      const redactedMessages = await Promise.all(messages.map(async (msg) => {
        if (msg.role === 'user') {
          const cleanContent = await phiService.prepareTextForAI(msg.content, 'socket-user', consultationId);
          return { ...msg, content: cleanContent };
        }
        return msg;
      }));

      const candidateModels = [
        process.env.GROQ_MODEL,
        'qwen/qwen3.6-27b',
        'groq/compound-mini',
        'openai/gpt-oss-120b',
      ].filter(Boolean) as string[];

      let completion: any = null;
      let lastModelError: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          completion = await groq.chat.completions.create({
            model: modelCandidate,
            // Cast: structurally compatible with ChatCompletionMessageParam
            messages: redactedMessages as Array<{role: 'system' | 'user' | 'assistant', content: string}>,
            temperature: 0.6,
            max_tokens: 600,
          });
          break;
        } catch (mErr: any) {
          lastModelError = mErr;
          logger.warn(`Groq non-streaming model ${modelCandidate} failed, attempting alternative`, { error: mErr.message });
        }
      }

      if (!completion) {
        throw lastModelError || new Error('All Groq candidate models failed');
      }
      
      const response = completion.choices[0]?.message?.content || 'I understand. Could you please provide more details about your symptoms?';
      
      logger.info(`AI response sent`, { consultationId, responseLength: response.length });
      socket.emit('ai-response', {
        response,
        consultationId,
      });
      saveTranscriptWithTranslation(socket, consultationId, transcript, response, language);
      
    } catch (error: any) {
      logger.error('Non-streaming completion error', { consultationId, error: error.message });
      logger.warn('llm_provider_fallback_triggered', {
        reason: 'completion_exception',
        error: error?.message || String(error),
        promptLength,
        consultationId,
        specialistType,
        transcriptLength: transcript.length,
      });
      const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
      socket.emit('ai-response', {
        response: fallbackResponse,
        consultationId,
      });
      saveTranscriptWithTranslation(socket, consultationId, transcript, fallbackResponse, language);
    }
  });
}