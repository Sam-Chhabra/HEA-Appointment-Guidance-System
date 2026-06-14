import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler middleware.
 * Converts known errors to user-friendly JSON responses.
 * Never exposes raw SQLite or internal errors to clients.
 */
export declare function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void;
