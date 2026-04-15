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

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  next();
});

// Routes - ALL routes go here (only once each)
app.use('/api/consultations', consultationRoutes);
app.use('/api/consultations', consultationDbRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/email', emailRoutes);  // ← ONLY ONCE, remove the duplicate at the bottom

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