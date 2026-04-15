import { Request, Response, NextFunction } from 'express';
import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = new Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const session = await clerk.sessions.verifySession({
      sessionId: sessionToken,
    });
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    (req as any).userId = session.userId;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Optional: Mock auth for development (if you don't have Clerk keys yet)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  // For development - remove this in production
  (req as any).userId = 'dev-user-123';
  next();
};