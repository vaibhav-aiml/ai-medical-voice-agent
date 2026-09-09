import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

describe('CORS Preflight & Header Policy', () => {
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
  ];

  const app = express();
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
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID', 'Idempotency-Key'],
    exposedHeaders: ['X-Request-ID']
  }));

  app.get('/api/test', (req, res) => {
    res.setHeader('X-Request-ID', 'test-req-123');
    res.json({ success: true });
  });

  it('should allow preflight OPTIONS with X-Request-ID and Idempotency-Key headers from Netlify', async () => {
    const res = await request(app)
      .options('/api/test')
      .set('Origin', 'https://ai-medical-voice-agent.netlify.app')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'x-request-id, idempotency-key, content-type, authorization');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://ai-medical-voice-agent.netlify.app');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-headers']).toContain('X-Request-ID');
    expect(res.headers['access-control-allow-headers']).toContain('Idempotency-Key');
  });

  it('should allow preflight from any *.netlify.app subdomain', async () => {
    const res = await request(app)
      .options('/api/test')
      .set('Origin', 'https://deploy-preview-42--ai-medical-voice-agent.netlify.app')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'X-Request-ID');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://deploy-preview-42--ai-medical-voice-agent.netlify.app');
  });

  it('should expose X-Request-ID in response headers', async () => {
    const res = await request(app)
      .get('/api/test')
      .set('Origin', 'https://ai-medical-voice-agent.netlify.app');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-expose-headers']).toContain('X-Request-ID');
    expect(res.headers['x-request-id']).toBe('test-req-123');
  });
});
