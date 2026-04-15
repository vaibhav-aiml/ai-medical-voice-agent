import { Server, Socket } from 'socket.io';
import { VoiceService } from '../services/voice.service';

const voiceService = new VoiceService();

// Store conversation history for each consultation
const conversationHistory: Map<string, Array<{ role: string; content: string }>> = new Map();

export const setupVoiceSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('join-consultation', (consultationId: string) => {
      socket.join(`consultation:${consultationId}`);
      console.log(`📝 Client ${socket.id} joined consultation: ${consultationId}`);
      
      // Initialize conversation history for this consultation
      if (!conversationHistory.has(consultationId)) {
        conversationHistory.set(consultationId, []);
        console.log(`📋 Created new conversation history for ${consultationId}`);
      }
      
      socket.emit('joined', { 
        consultationId, 
        message: 'Connected to AI doctor',
        status: 'ready'
      });
    });

    socket.on('audio-stream', async (data: { 
      consultationId: string; 
      audioChunk: any;
      timestamp: Date;
    }) => {
      try {
        console.log(`🎤 Processing audio for consultation ${data.consultationId}`);
        
        // Placeholder for actual transcription
        const mockTranscript = "I have been experiencing symptoms for the past few days.";
        
        socket.emit('transcript-update', {
          consultationId: data.consultationId,
          transcript: mockTranscript,
          timestamp: data.timestamp,
          isFinal: true
        });
        
      } catch (error) {
        console.error('Audio processing error:', error);
        socket.emit('error', { 
          message: 'Failed to process audio',
          consultationId: data.consultationId 
        });
      }
    });

    socket.on('get-ai-response', async (data: {
      consultationId: string;
      transcript: string;
      specialistType: string;
    }) => {
      try {
        console.log(`🤖 Getting AI response for ${data.specialistType} specialist`);
        console.log(`📝 User said: ${data.transcript}`);
        
        // Get existing conversation history
        let history = conversationHistory.get(data.consultationId) || [];
        
        // Add user message to history
        history.push({ role: 'user', content: data.transcript });
        
        // Get AI response with full conversation context
        const aiResponse = await voiceService.getAIResponse(
          data.transcript,
          data.specialistType,
          history  // Pass the entire conversation history
        );
        
        // Add AI response to history
        history.push({ role: 'assistant', content: aiResponse });
        
        // Save updated history
        conversationHistory.set(data.consultationId, history);
        
        console.log(`📚 Conversation history now has ${history.length} messages`);
        console.log(`🤖 AI Response: ${aiResponse.substring(0, 150)}...`);
        
        socket.emit('ai-response', {
          consultationId: data.consultationId,
          response: aiResponse,
          timestamp: new Date(),
          specialistType: data.specialistType
        });
        
      } catch (error) {
        console.error('AI response error:', error);
        socket.emit('error', { 
          message: 'Failed to get AI response. Please try again.',
          consultationId: data.consultationId 
        });
      }
    });

    socket.on('end-consultation', async (consultationId: string) => {
      console.log(`🔴 Consultation ${consultationId} ended`);
      console.log(`📋 Final conversation had ${conversationHistory.get(consultationId)?.length || 0} messages`);
      conversationHistory.delete(consultationId);
      socket.leave(`consultation:${consultationId}`);
      socket.emit('consultation-ended', { 
        consultationId, 
        message: 'Consultation ended. Thank you for using MediVoice AI.' 
      });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};