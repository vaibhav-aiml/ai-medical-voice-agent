import { Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import logger from '../../utils/logger';
import { db } from '../../config/database';
import { consultations, users } from '../../db/schema/index';
import { eq } from 'drizzle-orm';
import { socketRateLimiter } from '../../utils/socketRateLimiter';
import { verifyConsultationOwnership } from '../helpers/verification';
import { handleSocketEmotionDetection } from '../helpers/emotionDetection';
import { saveTranscriptWithTranslation } from '../helpers/transcriptTranslation';
import { getSystemPrompt, getFallbackResponse } from '../helpers/prompts';
import { phiService } from '../../services/phiService';

export function registerGetAIResponseStreamHandler(socket: Socket, groq: Groq | null) {
  socket.on('get-ai-response-stream', async (data: {
    consultationId: string;
    transcript: string;
    specialistType: string;
    userId?: string;
    contextPrompt?: string;
    conversationHistory?: Array<{role: string, content: string}>;
    language?: string;
    source?: 'voice' | 'text'; 
  }) => {
    const { consultationId, transcript, specialistType, userId, contextPrompt, conversationHistory, language = 'en', source = 'unknown' } = data;
    
    const allowed = socketRateLimiter.consume(socket.data.userId || 'dev-user-123', socket.id, 'get-ai-response-stream');
    if (!allowed) {
      socket.emit('rate-limit-exceeded', { event: 'get-ai-response-stream', message: 'Too many requests. Please try again later.' });
      return;
    }

    const authorized = await verifyConsultationOwnership(socket, consultationId);
    if (!authorized) {
      logger.warn('Unauthorized get-ai-response-stream attempt blocked', { socketId: socket.id, consultationId });
      socket.emit('error-event', { message: 'Unauthorized: Access denied' });
      return;
    }

    logger.info(`Real-time streaming request from socket`, {
      socketId: socket.id,
      consultationId,
      specialistType,
      userId: userId || socket.data.userId,
      source,
      transcriptLength: transcript?.length || 0,
      historyLength: conversationHistory?.length || 0,
      language
    });
    handleSocketEmotionDetection(socket, transcript, consultationId);
    let pastConsultationsContext = '';
    if (userId && userId !== 'dev-user-123') {
      try {
        const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
        if (dbUser.length > 0) {
          const pastConsultationsList = await db.select()
            .from(consultations)
            .where(eq(consultations.userId, dbUser[0].id))
            .orderBy(consultations.startedAt)
            .limit(5); 
            
          if (pastConsultationsList.length > 0) {
            pastConsultationsContext = pastConsultationsList.map((c, idx) => {
              return `Session ${idx + 1} (${c.specialistType} - ${c.status}): Symptoms: ${c.symptoms}. Notes: ${c.notes || 'N/A'}`;
            }).join('\n');
          }
        }
      } catch (pastErr: any) {
        logger.warn('Failed to load past consultations for context', { userId, error: pastErr.message });
      }
    }

    const baseSystemPrompt = getSystemPrompt(specialistType, contextPrompt, language);
    let systemPrompt = baseSystemPrompt;
    if (pastConsultationsContext) {
      systemPrompt += `\n\nPatient Past Medical Consultation History:\n${pastConsultationsContext}\nUse this history to maintain context and remember previous discussions with the patient when relevant.`;
    }

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
      const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
      
      socket.emit('ai-response-chunk', {
        chunk: fallbackResponse,
        consultationId,
        isComplete: true,
        fullResponse: fallbackResponse,
      });
      saveTranscriptWithTranslation(socket, consultationId, transcript, fallbackResponse, language);
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

      logger.info('Starting Groq streaming completion', { consultationId });
      const candidateModels = [
        process.env.GROQ_MODEL,
        'qwen/qwen3.6-27b',
        'groq/compound-mini',
        'openai/gpt-oss-120b',
      ].filter(Boolean) as string[];

      let stream: any = null;
      let lastModelError: any = null;

      for (const modelCandidate of candidateModels) {
        try {
          stream = await groq.chat.completions.create({
            model: modelCandidate,
            // Cast: structurally compatible with ChatCompletionMessageParam
            messages: redactedMessages as Array<{role: 'system' | 'user' | 'assistant', content: string}>,
            temperature: 0.6,
            max_tokens: 600,
            stream: true,
          });
          break;
        } catch (mErr: any) {
          lastModelError = mErr;
          logger.warn(`Groq streaming model ${modelCandidate} failed, attempting alternative`, { error: mErr.message });
        }
      }

      if (!stream) {
        throw lastModelError || new Error('All Groq streaming candidate models failed');
      }
      
      let fullResponse = '';
      let chunkCount = 0;
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          chunkCount++;
          socket.emit('ai-response-chunk', {
            chunk: content,
            consultationId,
            isComplete: false,
          });
        }
      }
      
      logger.info(`Streaming complete`, { consultationId, chunkCount, responseLength: fullResponse.length });
      
      socket.emit('ai-response-chunk', {
        chunk: '',
        consultationId,
        isComplete: true,
        fullResponse,
      });
      saveTranscriptWithTranslation(socket, consultationId, transcript, fullResponse, language);
      
    } catch (error: any) {
      logger.error('Streaming completion error', { consultationId, error: error.message });
      logger.warn('llm_provider_fallback_triggered', {
        reason: 'stream_exception',
        error: error?.message || String(error),
        promptLength,
        consultationId,
        specialistType,
        transcriptLength: transcript.length,
      });
      try {
        const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response-chunk', {
          chunk: fallbackResponse,
          consultationId,
          isComplete: true,
          fullResponse: fallbackResponse,
        });
        saveTranscriptWithTranslation(socket, consultationId, transcript, fallbackResponse, language);
      } catch (fallbackError: any) {
        logger.error('Fallback response generation error', { consultationId, error: fallbackError.message });
        socket.emit('ai-response-error', {
          error: 'Failed to generate response',
          consultationId,
        });
      }
    }
  });
}