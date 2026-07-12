import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: 100 requests / 15 min per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
});

/**
 * AI routes rate limiter: 20 requests / 15 min per IP
 * Applies to /api/voice, /api/consultations, /api/triage, /api/enhanced-symptom
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI request limit reached. Please try again later.',
    retryAfter: '15 minutes',
  },
});

/**
 * Auth routes rate limiter: 10 requests / 15 min per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
});
