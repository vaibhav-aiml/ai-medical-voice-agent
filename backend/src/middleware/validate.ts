import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; 
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(422).json({
          error: 'Validation failed',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
};