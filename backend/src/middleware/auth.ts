import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import logger from '../utils/logger';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Unauthorized: No authorization token provided' });
      }
      // For development, allow requests without token
      (req as any).userId = 'dev-user-123';
      return next();
    }
    
    // Cryptographically verify Clerk session token (JWT)
    let payload;
    try {
      payload = await clerkClient.verifyToken(sessionToken);
    } catch (e: any) {
      logger.error('Clerk token verification failed', { error: e.message });
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Unauthorized: Invalid session token or verification failed' });
      }
      // For development, allow fallback
      (req as any).userId = 'dev-user-123';
      return next();
    }
    
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token claims' });
    }
    
    (req as any).userId = payload.sub;
    next();
  } catch (error: any) {
    logger.error('Authentication check failed', { error: error.message });
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
    }
    // For development, still allow the request
    (req as any).userId = 'dev-user-123';
    next();
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.headers.authorization?.split(' ')[1];
  if (sessionToken) {
    try {
      const payload = await clerkClient.verifyToken(sessionToken);
      if (payload && payload.sub) {
        (req as any).userId = payload.sub;
        return next();
      }
    } catch (e: any) {
      logger.warn('Optional Clerk token verification failed', { error: e.message });
    }
  }
  (req as any).userId = 'dev-user-123';
  next();
};