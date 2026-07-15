import { Server, Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import logger from '../utils/logger';
import { db } from '../config/database';
import { voiceSessions, consultations, users } from '../db/schema/index';
import { eq } from 'drizzle-orm';
import { detectEmotionFromSpeech } from '../services/emotionService';
import { translateText } from '../services/translationService';
import { phiService } from '../services/phiService';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { socketRateLimiter } from '../utils/socketRateLimiter';


// Helper to asynchronously run emotion detection and update database + socket
async function handleSocketEmotionDetection(socket: Socket, transcript: string, consultationId: string) {
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

// Helper to asynchronously translate dialogue, save to DB, and emit translations
async function saveTranscriptWithTranslation(
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

// Initialize Groq only if API key exists
let groq: Groq | null = null;
try {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10 && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    logger.info('Groq API initialized successfully in voice socket');
  } else {
    logger.warn('GROQ_API_KEY not set or invalid. AI responses will use fallback mode.');
  }
} catch (error: any) {
  logger.error('Failed to initialize Groq client', { error: error.message });
}

async function verifyConsultationOwnership(socket: Socket, consultationId: string): Promise<boolean> {
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

export function setupVoiceSocket(io: Server) {
  // Handshake Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        if (process.env.NODE_ENV === 'production') {
          return next(new Error('Authentication error: Token required'));
        }
        socket.data.userId = 'dev-user-123';
        return next();
      }
      const payload = await clerkClient.verifyToken(token);
      if (!payload || !payload.sub) {
        if (process.env.NODE_ENV === 'production') {
          return next(new Error('Authentication error: Invalid claims'));
        }
        socket.data.userId = 'dev-user-123';
        return next();
      }
      socket.data.userId = payload.sub;
      next();
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        return next(new Error('Authentication error: Token verification failed'));
      }
      socket.data.userId = 'dev-user-123';
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.debug('Client connected to socket', { socketId: socket.id, userId: socket.data.userId });
    
    socket.on('join-consultation', async (consultationId: string) => {
      const allowed = socketRateLimiter.consume(socket.data.userId || 'dev-user-123', socket.id, 'join-consultation');
      if (!allowed) {
        socket.emit('rate-limit-exceeded', { event: 'join-consultation', message: 'Too many requests. Please try again later.' });
        return;
      }

      const authorized = await verifyConsultationOwnership(socket, consultationId);
      if (!authorized) {
        logger.warn('Unauthorized join-consultation attempt blocked', { socketId: socket.id, consultationId });
        socket.emit('error-event', { message: 'Unauthorized: Access denied' });
        return;
      }
      socket.join(`consultation_${consultationId}`);
      logger.info(`Client joined consultation channel`, { socketId: socket.id, consultationId });
    });
    
    // Real-time streaming response with conversation history
    socket.on('get-ai-response-stream', async (data: {
      consultationId: string;
      transcript: string;
      specialistType: string;
      userId?: string;
      contextPrompt?: string;
      conversationHistory?: Array<{role: string, content: string}>;
      language?: string;
    }) => {
      const { consultationId, transcript, specialistType, userId, contextPrompt, conversationHistory, language = 'en' } = data;
      
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
        historyLength: conversationHistory?.length || 0,
        language
      });

      // Async emotion detection in background
      handleSocketEmotionDetection(socket, transcript, consultationId);
      
      // Load user's past consultations as medical background context
      let pastConsultationsContext = '';
      if (userId && userId !== 'dev-user-123') {
        try {
          const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
          if (dbUser.length > 0) {
            const pastConsultationsList = await db.select()
              .from(consultations)
              .where(eq(consultations.userId, dbUser[0].id))
              .orderBy(consultations.startedAt)
              .limit(5); // Load up to 5 past sessions
              
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
      
      if (!groq) {
        logger.warn('Groq client not available, using fallback response', { consultationId });
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
        // Redact PHI from messages before sending to Groq/OpenAI
        const redactedMessages = await Promise.all(messages.map(async (msg) => {
          if (msg.role === 'user') {
            const cleanContent = await phiService.prepareTextForAI(msg.content, 'socket-user', consultationId);
            return { ...msg, content: cleanContent };
          }
          return msg;
        }));

        logger.info('Starting Groq streaming completion', { consultationId });
        
        // Revert to llama-3.3-70b-versatile as mandated
        const stream = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: redactedMessages as any,
          temperature: 0.7,
          max_tokens: 800,
          stream: true,
        });
        
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
        const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response-chunk', {
          chunk: fallbackResponse,
          consultationId,
          isComplete: true,
          fullResponse: fallbackResponse,
        });
        socket.emit('ai-response-error', {
          error: 'Failed to generate response, using fallback',
          consultationId,
        });
        saveTranscriptWithTranslation(socket, consultationId, transcript, fallbackResponse, language);
      }
    });
    
    // Non-streaming with conversation history
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

      // Async emotion detection in background
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
      
      if (!groq) {
        logger.warn('Groq client not available, using fallback response', { consultationId });
        const response = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response', { response, consultationId });
        saveTranscriptWithTranslation(socket, consultationId, transcript, response, language);
        return;
      }
      
      try {
        // Redact PHI from messages before sending to Groq/OpenAI
        const redactedMessages = await Promise.all(messages.map(async (msg) => {
          if (msg.role === 'user') {
            const cleanContent = await phiService.prepareTextForAI(msg.content, 'socket-user', consultationId);
            return { ...msg, content: cleanContent };
          }
          return msg;
        }));

        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: redactedMessages as any,
          temperature: 0.7,
          max_tokens: 800,
        });
        
        const response = completion.choices[0]?.message?.content || 'I understand. Could you please provide more details about your symptoms?';
        
        logger.info(`AI response sent`, { consultationId, responseLength: response.length });
        socket.emit('ai-response', {
          response,
          consultationId,
        });
        saveTranscriptWithTranslation(socket, consultationId, transcript, response, language);
        
      } catch (error: any) {
        logger.error('Non-streaming completion error', { consultationId, error: error.message });
        const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response', {
          response: fallbackResponse,
          consultationId,
        });
        saveTranscriptWithTranslation(socket, consultationId, transcript, fallbackResponse, language);
      }
    });
    
    socket.on('disconnect', () => {
      logger.debug('Client disconnected from socket', { socketId: socket.id });
    });
  });
}

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

function getSystemPrompt(specialistType: string, contextPrompt?: string, language: string = 'en'): string {
  const basePrompts: Record<string, string> = {
    general: `You are a compassionate General Physician AI. 

IMPORTANT RULES:
1. ALWAYS remember the conversation history - answer follow-up questions based on previous messages
2. Be conversational and contextual - NEVER repeat the same generic response
3. For "how much time to recover" - give specific timeframes (e.g., "2-3 days", "5-7 days")
4. For "what medicine" - give specific medication names with dosages
5. Be warm, empathetic, and professional
6. Include self-care tips and when to see a doctor
7. Always end with a disclaimer to consult a real doctor

Example of GOOD contextual response:
- User: "I have a headache"
- AI: "Drink water and rest. For pain, you can take acetaminophen..."
- User: "what medicine should I take" 
- AI: "Based on your headache, acetaminophen 500mg or ibuprofen 400mg would help..."`,

    orthopedic: `You are an Orthopedic Specialist AI. Focus on musculoskeletal issues. ALWAYS remember conversation history and give specific medication recommendations.`,
    
    cardiologist: `You are a Cardiologist AI. Focus on heart health. ALWAYS remember conversation history and give specific recommendations.`,
    
    neurologist: `You are a Neurologist AI. Focus on headaches and nerve issues. ALWAYS remember conversation history.`,
    
    pediatrician: `You are a Pediatrician AI. Focus on children's health. ALWAYS remember conversation history and give child-appropriate advice.`,
  };
  
  let prompt = basePrompts[specialistType] || basePrompts.general;
  if (contextPrompt) {
    prompt += contextPrompt;
  }

  if (language && language !== 'en') {
    const langName = languageNames[language] || language;
    prompt += `\n\nIMPORTANT: The patient's preferred language is ${langName}. You MUST write your entire response in ${langName}. Do not respond in English.`;
  }
  
  return prompt;
}

function getFallbackResponse(symptoms: string, specialistType: string, conversationHistory?: Array<{role: string, content: string}>): string {
  const lowerQuestion = symptoms.toLowerCase();
  
  let previousSymptoms = '';
  let hasFever = false;
  let hasHeadache = false;
  let hasCough = false;
  
  if (conversationHistory) {
    const userMessages = conversationHistory.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
    const allUserText = userMessages.join(' ');
    hasFever = allUserText.includes('fever') || allUserText.includes('temperature');
    hasHeadache = allUserText.includes('headache') || allUserText.includes('head pain');
    hasCough = allUserText.includes('cough') || allUserText.includes('coughing');
    if (userMessages.length > 0) {
      previousSymptoms = userMessages[userMessages.length - 1];
    }
  }
  
  if (lowerQuestion.includes('how much time') || lowerQuestion.includes('recover') || lowerQuestion.includes('how long') || lowerQuestion.includes('when will')) {
    if (hasFever && hasHeadache) {
      return `📅 **Recovery Timeline for Fever & Headache:**

• **Day 1-2:** Symptoms may persist, rest is crucial
• **Day 3:** Most symptoms should improve significantly  
• **Day 5-7:** Complete recovery expected

**What helps speed recovery:**
✅ Get 8-10 hours of sleep daily
✅ Drink 8-10 glasses of water/electrolytes
✅ Take acetaminophen or ibuprofen as needed
✅ Eat light, nutritious meals (soup, fruits)

⚠️ **When to see a doctor:**
• Fever exceeds 103°F (39.4°C)
• Symptoms worsen after 3 days
• Severe headache with stiff neck

Would you like specific home care tips?`;
    }
    
    if (hasFever) {
      return `📅 **Fever Recovery Timeline:**

• **24-48 hours:** Fever should start reducing
• **Day 3:** Most people feel significantly better
• **Day 5-7:** Complete recovery

**Recovery tips:**
💧 Stay hydrated (water, electrolytes, herbal tea)
🛌 Rest in a cool, comfortable room
💊 Take fever reducers as needed
🍲 Eat light soups and broths

⚠️ Seek medical care if fever exceeds 103°F or lasts >3 days.

Is there anything specific about your recovery I can help with?`;
    }
    
    return `📅 **General Recovery Timeline:**

• Minor illness (cold, mild fever): **3-5 days**
• Moderate symptoms (flu, viral infection): **5-7 days**
• Full recovery: **7-10 days**

**To speed up recovery:**
1. Rest 8-10 hours daily
2. Stay hydrated (8+ glasses water)
3. Eat nutritious foods
4. Take medications as needed

⚠️ Consult a doctor if symptoms persist beyond 7 days or worsen.

Would you like to share more about your symptoms for a more accurate estimate?`;
  }
  
  if (lowerQuestion.includes('medicine') || lowerQuestion.includes('medication') || lowerQuestion.includes('should i take') || lowerQuestion.includes('what can i take')) {
    if (hasFever && hasHeadache) {
      return `💊 **Medications for Fever & Headache:**

**Option 1: Acetaminophen (Tylenol)**  
• Dosage: 500mg every 4-6 hours  
• Max: 3000mg per day  
• Best for: Fever AND headache relief

**Option 2: Ibuprofen (Advil/Motrin)**  
• Dosage: 200-400mg every 6-8 hours  
• Take WITH food  
• Best for: Fever, headache, AND body aches

⚠️ **Important:** Don't take both together. Choose ONE.

**Natural alternatives:**
• Cold compress on forehead
• Ginger or peppermint tea
• Rest in dark, quiet room

💡 Improvement expected within 1-2 hours of taking medication.

Would you like dosage for children or any specific concerns?`;
    }
    
    if (hasFever) {
      return `💊 **Fever Medications:**

**Acetaminophen (Tylenol)** - 500mg every 4-6 hours
• Reduces fever effectively
• Gentle on stomach

**Ibuprofen (Advil)** - 400mg every 6-8 hours  
• Reduces fever AND inflammation
• Take with food

⚠️ Don't exceed recommended dosage. Don't take both.

**Natural fever reducers:**
• Cool compress on forehead
• Light clothing
• Stay hydrated

📏 Normal body temperature: 97°F-99°F (36.1°C-37.2°C)
📏 Fever: 100.4°F (38°C) or higher

Would you like to know when to seek medical care?`;
    }
    
    return `💊 **General Over-the-Counter Medication Options:**

**For Pain/Fever:**
• Acetaminophen (Tylenol) - 500mg every 4-6h
• Ibuprofen (Advil/Motrin) - 200-400mg every 6-8h

**For Cold/Flu:**
• DayQuil/NyQuil or generic equivalents
• Follow package instructions

**For Cough:**
• Dextromethorphan (cough suppressant)
• Guaifenesin (expectorant) for mucus

⚠️ **Always:**
• Read labels carefully
• Follow dosage instructions
• Don't exceed maximum daily dose
• Consult pharmacist if unsure

⚠️ **Important:** These are general recommendations. Share your specific symptoms for personalized advice.

Would you tell me more about your symptoms for better recommendations?`;
  }
  
  if (conversationHistory && conversationHistory.length > 2) {
    return `Based on our conversation, here's what I recommend:

📋 **Continue monitoring:** Your symptoms should improve within 2-3 days

💊 **Medication:** Take OTC medication as needed for symptom relief

💧 **Hydration:** Drink 8-10 glasses of water daily

🛌 **Rest:** Get 7-8 hours of quality sleep

🍲 **Diet:** Eat light, nutritious meals (soups, fruits, vegetables)

⚠️ **When to seek medical care:**
• Symptoms worsen after 3 days
• Fever exceeds 103°F
• Difficulty breathing
• Severe pain

Is there anything specific you'd like me to address about your symptoms?`;
  }
  
  return `Thank you for sharing your concern. Here's my general advice:

1️⃣ **Rest:** Get 7-8 hours of sleep daily
2️⃣ **Hydration:** Drink 8-10 glasses of water
3️⃣ **Nutrition:** Eat light, balanced meals
4️⃣ **Medication:** Take OTC medication if needed for symptom relief

📅 Most symptoms improve within 3-5 days.

⚠️ Consult a doctor if symptoms persist beyond 7 days or worsen.

Could you provide more details about your specific symptoms for personalized advice?`;
}