import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to catch rejected promises
 * and forward them to the Express error handler.
 *
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }));
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
