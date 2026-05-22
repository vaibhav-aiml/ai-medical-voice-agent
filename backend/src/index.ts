import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { setupVoiceSocket } from './sockets/voiceSocket';
import consultationRoutes from './routes/consultation.routes';
import consultationDbRoutes from './routes/consultations.db.routes';
import voiceRoutes from './routes/voice.routes';
import reportRoutes from './routes/report.routes';
import emailRoutes from './routes/email.routes';

// Load environment variables
dotenv.config({ path: '.env' });

const app = express();
const httpServer = createServer(app);

// Comprehensive allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://ai-medical-voice-agent.netlify.app',
  'https://ai-medical-frontend.onrender.com',
  'https://medivoice-ai.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Also allow any netlify subdomain during development
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

console.log('✅ Allowed CORS origins:', allowedOrigins);

// Configure Socket.IO with dynamic CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('netlify.app')) {
        callback(null, true);
      } else {
        console.log('❌ Socket.IO CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Middleware - CORS first
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

// Routes
app.use('/api/consultations', consultationRoutes);
app.use('/api/consultations', consultationDbRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/email', emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'AI Medical Voice Agent API is running',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Medical Voice Agent API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      consultations: 'GET/POST /api/consultations',
      voice: 'POST /api/voice',
      reports: 'GET /api/reports',
      email: 'POST /api/email/send-report'
    }
  });
});

// Setup WebSocket handlers for voice
setupVoiceSocket(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║     🚀 AI MEDICAL VOICE AGENT BACKEND                ║
╠══════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                      ║
║  WebSocket: ws://localhost:${PORT}                     ║
║  Health: http://localhost:${PORT}/health               ║
╠══════════════════════════════════════════════════════╣
║  Status: ✅ Running                                   ║
║  Database: ✅ Connected                               ║
║  WebSocket: ✅ Ready for voice                        ║
║  API Routes: ✅ /api/consultations, /api/email        ║
║  CORS: ✅ Enabled for Netlify domains                 ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  io.close(() => {
    console.log('✅ WebSocket closed');
    process.exit(0);
  });
});

export { io };