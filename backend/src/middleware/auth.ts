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
    
    // Clerk session tokens are JWTs. In production, we must verify them or get the user.
    // If clerkClient is initialized, attempt to resolve user or decode JWT token.
    let user;
    try {
      // For simple Clerk integrations where the user id is passed directly in headers for testing
      // or we resolve the user from Clerk client
      user = await clerkClient.users.getUser(sessionToken);
    } catch (e: any) {
      // If sessionToken is a full Clerk JWT, we can extract the user ID ('sub' claim) from it
      // split JWT and decode payload
      const parts = sessionToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload && payload.sub) {
          (req as any).userId = payload.sub;
          return next();
        }
      }
      throw e;
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }
    
    (req as any).userId = user.id;
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
    const parts = sessionToken.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload && payload.sub) {
          (req as any).userId = payload.sub;
          return next();
        }
      } catch (e) {}
    }
  }
  (req as any).userId = 'dev-user-123';
  next();
};