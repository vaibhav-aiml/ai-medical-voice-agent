import { Server, Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env before anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('🔍 voiceSocket - GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Present' : '❌ Missing');
if (process.env.GROQ_API_KEY) {
  console.log('🔍 Key starts with:', process.env.GROQ_API_KEY.substring(0, 10) + '...');
}

// Initialize Groq only if API key exists
let groq: Groq | null = null;
try {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 10 && process.env.GROQ_API_KEY.startsWith('gsk_')) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    console.log('✅ Groq API initialized successfully');
  } else {
    console.warn('⚠️ GROQ_API_KEY not set or invalid. AI responses will use fallback mode.');
    console.warn('💡 To enable AI responses, add a valid GROQ_API_KEY to your .env file');
    console.warn('💡 Get a free API key from: https://console.groq.com');
  }
} catch (error) {
  console.error('❌ Failed to initialize Groq:', error);
}

export function setupVoiceSocket(io: Server) {
  
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    socket.on('join-consultation', (consultationId: string) => {
      socket.join(`consultation_${consultationId}`);
      console.log(`📋 Client ${socket.id} joined consultation: ${consultationId}`);
    });
    
    // Real-time streaming response with conversation history
    socket.on('get-ai-response-stream', async (data: {
      consultationId: string;
      transcript: string;
      specialistType: string;
      userId?: string;
      contextPrompt?: string;
      conversationHistory?: Array<{role: string, content: string}>;
    }) => {
      const { consultationId, transcript, specialistType, userId, contextPrompt, conversationHistory } = data;
      
      console.log(`🎤 Real-time streaming request from ${socket.id}`);
      console.log(`📝 Transcript: ${transcript.substring(0, 100)}...`);
      console.log(`👤 User ID: ${userId || 'anonymous'}`);
      console.log(`📚 Context: ${contextPrompt ? 'Yes' : 'No'}`);
      console.log(`💬 Conversation history length: ${conversationHistory?.length || 0}`);
      
      // Build system prompt with context
      const systemPrompt = getSystemPrompt(specialistType, contextPrompt);
      
      // Build messages array with full conversation history
      const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        { role: 'system', content: systemPrompt },
      ];
      
      // Add conversation history if available (maintains context between messages)
      if (conversationHistory && conversationHistory.length > 0) {
        console.log(`📜 Adding ${conversationHistory.length} history messages for context`);
        // Add last 10 messages for context (5 exchanges)
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
      
      // Add current user message
      messages.push({ role: 'user', content: transcript });
      
      console.log(`📨 Total messages being sent to AI: ${messages.length}`);
      
      // If Groq is not available, use fallback response
      if (!groq) {
        console.log('⚠️ Using fallback response (no API key)');
        const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
        
        // Send as single response instead of streaming chunks
        socket.emit('ai-response-chunk', {
          chunk: fallbackResponse,
          consultationId,
          isComplete: true,
          fullResponse: fallbackResponse,
        });
        return;
      }
      
      try {
        console.log('🚀 Starting Groq streaming with conversation history...');
        
        // ============================================================
        // ✅ UPDATED: Using Groq's new recommended model
        // Old: llama-3.3-70b-versatile (DEPRECATED)
        // New: gpt-oss-120b (Groq's recommended replacement)
        // ============================================================
        const stream = await groq.chat.completions.create({
          model: 'gpt-oss-120b',  // ✅ Groq OSS 120B - Recommended replacement
          messages: messages as any,
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
        
        console.log(`✅ Streaming complete for ${consultationId}. Total chunks: ${chunkCount}, Response length: ${fullResponse.length}`);
        
        socket.emit('ai-response-chunk', {
          chunk: '',
          consultationId,
          isComplete: true,
          fullResponse,
        });
        
      } catch (error: any) {
        console.error('❌ Streaming error:', error.message);
        // Send fallback response on error
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
      }
    });
    
    // Non-streaming with conversation history (for compatibility)
    socket.on('get-ai-response', async (data: {
      consultationId: string;
      transcript: string;
      specialistType: string;
      userId?: string;
      conversationHistory?: Array<{role: string, content: string}>;
    }) => {
      const { consultationId, transcript, specialistType, userId, conversationHistory } = data;
      
      console.log(`🤖 AI request from ${socket.id}`);
      console.log(`📝 Transcript: ${transcript.substring(0, 100)}...`);
      console.log(`💬 Conversation history length: ${conversationHistory?.length || 0}`);
      
      const systemPrompt = getSystemPrompt(specialistType);
      
      // Build messages array with full conversation history
      const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
        { role: 'system', content: systemPrompt },
      ];
      
      // Add conversation history if available
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
      
      // Add current user message
      messages.push({ role: 'user', content: transcript });
      
      // If Groq is not available, use fallback
      if (!groq) {
        console.log('⚠️ Using fallback response (no API key)');
        const response = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response', { response, consultationId });
        return;
      }
      
      try {
        // ============================================================
        // ✅ UPDATED: Using Groq's new recommended model
        // Old: llama-3.3-70b-versatile (DEPRECATED)
        // New: gpt-oss-120b (Groq's recommended replacement)
        // ============================================================
        const completion = await groq.chat.completions.create({
          model: 'gpt-oss-120b',  // ✅ Groq OSS 120B - Recommended replacement
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 800,
        });
        
        const response = completion.choices[0]?.message?.content || 'I understand. Could you please provide more details about your symptoms?';
        
        console.log(`✅ AI response sent for ${consultationId}. Length: ${response.length}`);
        socket.emit('ai-response', {
          response,
          consultationId,
        });
        
      } catch (error: any) {
        console.error('❌ AI response error:', error.message);
        const fallbackResponse = getFallbackResponse(transcript, specialistType, conversationHistory);
        socket.emit('ai-response', {
          response: fallbackResponse,
          consultationId,
        });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
}

function getSystemPrompt(specialistType: string, contextPrompt?: string): string {
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
  
  return prompt;
}

function getFallbackResponse(symptoms: string, specialistType: string, conversationHistory?: Array<{role: string, content: string}>): string {
  const lowerQuestion = symptoms.toLowerCase();
  
  // Extract previous symptoms from conversation history
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
  
  // Recovery time question
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
  
  // Medicine question
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
  
  // Default contextual response
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