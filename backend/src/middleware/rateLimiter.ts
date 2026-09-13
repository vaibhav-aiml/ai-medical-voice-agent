import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health' || req.path === '/health/ping' || req.path.startsWith('/health');
  },
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI request limit reached. Please try again later.',
    retryAfter: '15 minutes',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
});