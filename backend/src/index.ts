// Env validation must happen before anything else imports env vars
import './config/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

// Import configs & utils
import logger from './utils/logger';
import { db } from './config/database';
import { redis } from './config/redis';
import { setupVoiceSocket } from './sockets/voiceSocket';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter, aiLimiter } from './middleware/rateLimiter';
import { requireAuth } from './middleware/auth';

// Import routes
import consultationRoutes from './routes/consultation.routes';
import voiceRoutes from './routes/voice.routes';
import reportRoutes from './routes/report.routes';
import emailRoutes from './routes/email.routes';
import auditRoutes from './routes/audit';
import hipaaRoutes from './routes/hipaa';
import triageRoutes from './routes/triage.routes';
import ragRoutes from './routes/rag.routes';
import conversationRoutes from './routes/conversation.routes';
import reminderRoutes from './routes/reminder.routes';
import enhancedReportRoutes from './routes/enhanced-report.routes';
import analyticsRoutes from './routes/analytics.routes';
import clinicRoutes from './routes/clinic.routes';
import enhancedSymptomRoutes from './routes/enhanced-symptom.routes';
import fhirRoutes from './routes/fhir.routes';
import hl7Routes from './routes/hl7.routes';
import emrRoutes from './routes/emr.routes';
import interopRoutes from './routes/interop.routes';

const app = express();
const httpServer = createServer(app);

// Allowed origins for CORS - exactly as specified
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://ai-medical-voice-agent.netlify.app',
  'https://ai-medical-frontend.onrender.com',
  'https://medivoice-ai.netlify.app',
  'https://majestic-speculoos-f73a91.netlify.app',
  /\.netlify\.app$/,
  process.env.FRONTEND_URL
].filter(Boolean);

logger.info('Configured CORS allowed origins', { allowedOrigins: allowedOrigins.map(o => o.toString()) });

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Security Middleware (Helmet with strict CSP)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://clerk.accounts.dev"],
      connectSrc: ["'self'", "wss://*", "https://*"],
      imgSrc: ["'self'", "data:", "https://*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (Global)
app.use(globalLimiter);

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ type: ['text/plain', 'application/hl7-v2'], limit: '10mb' }));

// Request logging middleware using Winston
app.use((req, res, next) => {
  logger.info(`Request received`, { method: req.method, path: req.path, ip: req.ip });
  next();
});

// Routes with specific rate limiters applied to AI routes
app.use('/api/consultations', requireAuth, aiLimiter, consultationRoutes);
app.use('/api/voice', requireAuth, aiLimiter, voiceRoutes);
app.use('/api/triage', requireAuth, aiLimiter, triageRoutes);
app.use('/api/enhanced-symptom', requireAuth, aiLimiter, enhancedSymptomRoutes);

// Other standard routes
app.use('/api/reports', requireAuth, reportRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/hipaa', hipaaRoutes);
app.use('/api/rag', requireAuth, ragRoutes);
app.use('/api/conversation', requireAuth, conversationRoutes);
app.use('/api/reminder', reminderRoutes);
app.use('/api/enhanced-report', requireAuth, enhancedReportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/clinic', requireAuth, clinicRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/hl7', hl7Routes);
app.use('/api/emr', requireAuth, emrRoutes);
app.use('/api/interop', requireAuth, interopRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'AI Medical Voice Agent API is running',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      groq: !!process.env.GROQ_API_KEY,
      email: !!process.env.EMAIL_USER,
      database: !!process.env.DATABASE_URL,
      redis: !!redis,
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Medical Voice Agent API',
    version: '1.0.0',
    status: 'running',
  });
});

// Setup WebSocket handlers for voice
setupVoiceSocket(io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`⚡ Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);
  
  // Close socket.io connections
  io.close(() => {
    logger.info('WebSocket connections closed.');
    
    // Close http server
    server.close(async () => {
      logger.info('HTTP server closed.');
      
      // Close Redis connection if any
      if (redis) {
        await redis.quit();
        logger.info('Redis connection closed.');
      }
      
      process.exit(0);
    });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // Force clean shutdown
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

export { io };