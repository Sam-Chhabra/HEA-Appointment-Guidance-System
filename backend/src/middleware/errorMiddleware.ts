import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ZodError } from 'zod';

/**
 * Global error handler middleware.
 * Converts known errors to user-friendly JSON responses.
 * Never exposes raw SQLite or internal errors to clients.
 */
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log full error for debugging
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message);
    res.status(400).json({
      error: 'Validation failed.',
      details: messages,
    });
    return;
  }

  // Handle our custom application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle unknown errors — never expose internals
  res.status(500).json({
    error: 'Something went wrong. Please try again.',
  });
}
