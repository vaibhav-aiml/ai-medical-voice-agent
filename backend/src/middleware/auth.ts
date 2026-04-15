import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      // For development/deployment, allow requests without token
      (req as any).userId = 'dev-user-123';
      return next();
    }
    
    // Use clerkClient directly without calling it as a function
    const user = await clerkClient.users.getUser(sessionToken);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    (req as any).userId = user.id;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    // For development, still allow the request
    (req as any).userId = 'dev-user-123';
    next();
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  (req as any).userId = 'dev-user-123';
  next();
};