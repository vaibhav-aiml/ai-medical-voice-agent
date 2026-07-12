import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

/**
 * Centralized Express error handler.
 * Must be registered AFTER all routes.
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'UnauthorizedError' || err.message === 'Not allowed by CORS') {
    statusCode = 403;
    message = err.message;
    isOperational = true;
  }

  // Log the error
  if (isOperational) {
    logger.warn('Operational error', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unexpected error', {
      statusCode,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  const response: Record<string, any> = {
    error: message,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
