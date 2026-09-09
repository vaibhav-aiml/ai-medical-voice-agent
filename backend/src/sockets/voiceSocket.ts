import { Server, Socket } from 'socket.io';
import { Groq } from 'groq-sdk';
import logger from '../utils/logger';
import { clerkClient } from '@clerk/clerk-sdk-node';

import { registerJoinConsultationHandler } from './handlers/joinConsultation';
import { registerGetAIResponseStreamHandler } from './handlers/getAIResponseStream';
import { registerGetAIResponseHandler } from './handlers/getAIResponse';
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
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error('Failed to initialize Groq client', { error: message });
}

/**
 * Checks whether the narrow test-bypass is active for socket auth.
 * Mirrors the same guard used in HTTP auth middleware.
 */
function isTestBypassActive(): boolean {
  return process.env.VITEST === 'true' && process.env.TEST_BYPASS_AUTH === 'true';
}

export function setupVoiceSocket(io: Server) {
  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        // Test harness bypass: allow unauthenticated sockets only in Vitest
        if (isTestBypassActive()) {
          socket.data.userId = 'test-user-vitest';
          return next();
        }
        return next(new Error('Authentication error: Token required'));
      }

      let payload;
      try {
        payload = await clerkClient.verifyToken(token);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        logger.error('Socket Clerk token verification failed', { error: message });
        // Verification error is always a rejection — never downgraded to a fake user.
        return next(new Error('Authentication error: Token verification failed'));
      }

      if (!payload || !payload.sub) {
        return next(new Error('Authentication error: Invalid claims'));
      }
      socket.data.userId = payload.sub;
      next();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Socket authentication unexpected error', { error: message });
      return next(new Error('Authentication error: Unexpected failure'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.debug('Client connected to socket', { socketId: socket.id, userId: socket.data.userId });
    registerJoinConsultationHandler(socket);
    registerGetAIResponseStreamHandler(socket, groq);
    registerGetAIResponseHandler(socket, groq);
    
    socket.on('disconnect', () => {
      logger.debug('Client disconnected from socket', { socketId: socket.id });
    });
  });
}