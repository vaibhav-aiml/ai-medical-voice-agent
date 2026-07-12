import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production'
      ? json()
      : combine(colorize(), devFormat)
  ),
  defaultMeta: { service: 'medivoice-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

// Never log sensitive data
export function sanitizeForLog(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'token', 'apiKey', 'api_key', 'secret', 'authorization', 'cookie', 'email_pass'];
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export default logger;
