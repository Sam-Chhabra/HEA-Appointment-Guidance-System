import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../utils/validation.js';
/**
 * Middleware factory that restricts access to specified roles.
 */
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, _res: Response, next: NextFunction) => void;
