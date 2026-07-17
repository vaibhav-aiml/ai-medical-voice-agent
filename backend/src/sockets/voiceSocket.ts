import { Server, Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import logger from '../utils/logger';
import { clerkClient } from '@clerk/clerk-sdk-node';

import { registerJoinConsultationHandler } from './handlers/joinConsultation';
import { registerGetAIResponseStreamHandler } from './handlers/getAIResponseStream';
import { registerGetAIResponseHandler } from './handlers/getAIResponse';

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
    
    // Register Modular Handlers
    registerJoinConsultationHandler(socket);
    registerGetAIResponseStreamHandler(socket, groq);
    registerGetAIResponseHandler(socket, groq);
    
    socket.on('disconnect', () => {
      logger.debug('Client disconnected from socket', { socketId: socket.id });
    });
  });
}