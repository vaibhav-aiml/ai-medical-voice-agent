import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory for Zod validation.
 * Validates req.body against the provided schema.
 *
 * Usage: router.post('/path', validate(mySchema), handler);
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replace with parsed (coerced/defaulted) data
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
