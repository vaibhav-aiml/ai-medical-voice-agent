import { AssemblyAI } from 'assemblyai';
import { OpenAI } from 'openai';
import Groq from 'groq-sdk';
import { db } from '../config/database';
import { voiceSessions } from '../db/schema/index';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export class VoiceService {
  private assemblyAI: AssemblyAI;
  private openai: OpenAI | null = null;
  private groq: Groq | null = null;
  private useMockAI: boolean = false;
  private aiProvider: string = 'mock';

  constructor() {
    // Initialize AssemblyAI
    this.assemblyAI = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!
    });

    // Try Groq first (free)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
      try {
        this.groq = new Groq({
          apiKey: process.env.GROQ_API_KEY!
        });
        this.aiProvider = 'groq';
        console.log('✅ Groq API initialized (free)');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Groq');
      }
    }

    // Fallback to OpenAI if Groq not available
    if (!this.groq && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY!
        });
        this.aiProvider = 'openai';
        console.log('✅ OpenAI API initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize OpenAI');
      }
    }

    if (!this.groq && !this.openai) {
      console.warn('⚠️ No AI provider available, using mock responses');
      this.useMockAI = true;
    }
  }

  async getAIResponse(transcript: string, specialistType: string, conversationHistory: Array<{ role: string; content: string }> = []) {
    // Use mock AI if no provider available
    if (this.useMockAI) {
      console.log('Using mock AI response');
      return this.getFallbackResponse(transcript, specialistType);
    }

    const systemPrompt = this.getSpecialistPrompt(specialistType);
    
    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log(`📚 Sending ${messages.length} messages to ${this.aiProvider}`);

    try {
      let responseText = '';

      if (this.aiProvider === 'groq' && this.groq) {
        const completion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });
        responseText = completion.choices[0]?.message?.content || '';
        console.log('✅ Groq response received');
      } else if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 500,
        });
        responseText = completion.choices[0].message.content || '';
        console.log('✅ OpenAI response received');
      }

      return responseText || this.getFallbackResponse(transcript, specialistType);
    } catch (error) {
      console.error(`${this.aiProvider} API error:`, error);
      return this.getFallbackResponse(transcript, specialistType);
    }
  }

  private getSpecialistPrompt(specialistType: string): string {
    const prompts: Record<string, string> = {
      general: `You are Dr. AI, a compassionate and experienced General Physician. 
Provide clear, helpful medical advice based on the patient's symptoms. 
Be professional but friendly. Include:
1. Possible causes of their symptoms
2. Recommended home care
3. When they should see a doctor
4. Any precautions or warnings

Remember: You are an AI assistant, not a replacement for real doctors. 
Always advise seeking professional medical help for serious conditions.
IMPORTANT: Remember what the patient told you earlier in the conversation.
If they ask a follow-up question, refer back to their previous symptoms.`,
      
      orthopedic: `You are Dr. AI, an experienced Orthopedic Specialist. 
Focus on musculoskeletal issues including bones, joints, muscles, and spine.
Provide advice on:
1. Possible orthopedic causes
2. RICE protocol (Rest, Ice, Compression, Elevation) if applicable
3. Exercises to avoid and gentle movements
4. When to seek physical therapy or specialist care
IMPORTANT: Remember what the patient told you earlier about their pain location and duration.
If they ask a follow-up question, refer back to their previous symptoms.`,
      
      cardiologist: `You are Dr. AI, a knowledgeable Cardiologist. 
Focus on heart health, blood pressure, circulation, and cardiovascular concerns.
Provide advice on:
1. Heart health assessment based on symptoms
2. Lifestyle modifications (diet, exercise, stress)
3. Warning signs requiring emergency care
4. When to schedule a cardiology appointment
IMPORTANT: Remember the patient's previous symptoms and concerns.
If they ask a follow-up question about medication or recovery, provide specific answers based on their condition.`,
      
      neurologist: `You are Dr. AI, a skilled Neurologist. 
Focus on nervous system disorders including headaches, dizziness, nerve pain, and cognitive concerns.
Provide advice on:
1. Possible neurological causes
2. Headache/migraine management
3. When to seek emergency care
4. Lifestyle factors affecting neurological health
IMPORTANT: Remember the headache location, duration, and triggers the patient mentioned earlier.
If they ask follow-up questions, provide answers specific to their headache type.`,
      
      pediatrician: `You are Dr. AI, a caring Pediatrician specializing in children's health.
Focus on symptoms in children from infancy to adolescence.
Provide advice on:
1. Age-appropriate care recommendations
2. Fever management in children
3. Warning signs requiring immediate care
4. When to consult a pediatrician
IMPORTANT: Remember the child's age and symptoms mentioned earlier.
If parents ask follow-up questions, provide specific answers for their child's condition.`,
    };
    return prompts[specialistType] || prompts.general;
  }

  private getFallbackResponse(transcript: string, specialistType: string): string {
    const fallbacks: Record<string, string> = {
      general: `Thank you for sharing your symptoms. Based on what you've described, I recommend:
1. Getting plenty of rest (7-8 hours of sleep)
2. Staying hydrated with warm fluids
3. Monitoring your symptoms for the next 24-48 hours
4. Taking over-the-counter medication if needed

⚠️ If symptoms worsen or persist beyond 3 days, please consult a doctor in person.

Do you have any other symptoms you'd like to share?`,
      
      orthopedic: `Based on your description, I recommend:
1. Apply ice to the affected area for 15-20 minutes, 3-4 times daily
2. Rest and avoid activities that cause pain
3. Gentle stretching if not painful
4. Consider over-the-counter anti-inflammatory medication

⚠️ If pain persists for more than 5 days or worsens, please consult an orthopedic specialist.

Can you tell me more about when the pain started?`,
      
      cardiologist: `Based on your symptoms, I recommend:
1. Monitor your blood pressure regularly
2. Reduce salt and caffeine intake
3. Light walking for 20 minutes daily
4. Practice stress management techniques

⚠️ If you experience chest pain or shortness of breath, seek immediate medical attention.

Would you like to know more about heart-healthy lifestyle changes?`,
      
      neurologist: `Based on your description, I recommend:
1. Get 7-8 hours of regular sleep
2. Reduce screen time and take frequent breaks
3. Stay hydrated with 8-10 glasses of water daily
4. Keep a headache diary to track triggers

⚠️ If headaches worsen or you experience vision changes, consult a doctor immediately.

Would you like me to suggest some relaxation techniques?`,
      
      pediatrician: `Based on your child's symptoms, I recommend:
1. Ensure plenty of rest
2. Keep hydrated with fluids or electrolyte solution
3. Monitor temperature every 4 hours
4. Provide light, nutritious meals

⚠️ If fever exceeds 103°F or symptoms worsen, consult your pediatrician immediately.

Would you like to know more about when to give fever medication?`,
    };
    return fallbacks[specialistType] || fallbacks.general;
  }

  async processVoiceStream(audioBuffer: Buffer, consultationId: string) {
    try {
      const transcript = await this.assemblyAI.transcripts.transcribe({
        audio: audioBuffer,
        speaker_labels: true,
        entity_detection: true,
        sentiment_analysis: true
      });

      await db.insert(voiceSessions).values({
        consultationId: consultationId,
        transcript: transcript,
      });

      return transcript;
    } catch (error) {
      console.error('Voice processing error:', error);
      throw error;
    }
  }

  async generateMedicalReport(consultationId: string, transcript: string, aiResponses: string) {
    // Use AI to generate report if available
    if (!this.useMockAI && (this.groq || this.openai)) {
      try {
        let responseText = '';
        
        if (this.groq) {
          const completion = await this.groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { 
                role: 'system', 
                content: 'You are a medical report generator. Create a professional, detailed medical report based on the consultation. Include: Patient Symptoms, AI Doctor Assessment, Recommendations, and Follow-up Plan. Keep it clear and organized.'
              },
              { 
                role: 'user', 
                content: `Consultation Transcript: ${transcript}\n\nAI Doctor Responses: ${aiResponses}`
              }
            ],
            temperature: 0.5,
            max_tokens: 800
          });
          responseText = completion.choices[0]?.message?.content || '';
        } else if (this.openai) {
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: 'You are a medical report generator. Create a professional, detailed medical report based on the consultation. Include: Patient Symptoms, AI Doctor Assessment, Recommendations, and Follow-up Plan. Keep it clear and organized.'
              },
              { 
                role: 'user', 
                content: `Consultation Transcript: ${transcript}\n\nAI Doctor Responses: ${aiResponses}`
              }
            ],
            temperature: 0.5,
            max_tokens: 800
          });
          responseText = completion.choices[0].message.content || '';
        }
        
        return responseText || this.getFallbackReport(transcript);
      } catch (error) {
        console.error('Report generation error:', error);
        return this.getFallbackReport(transcript);
      }
    }
    
    return this.getFallbackReport(transcript);
  }

  private getFallbackReport(transcript: string): string {
    return `Medical Report Summary

Patient Symptoms: ${transcript}

AI Doctor Assessment: Based on the consultation, the patient presented with the described symptoms.

Recommendations: 
1. Get adequate rest
2. Stay hydrated
3. Monitor symptoms
4. Follow up with healthcare provider if needed

⚠️ This is an AI-generated summary. Please consult a qualified healthcare provider for medical advice.`;
  }
}