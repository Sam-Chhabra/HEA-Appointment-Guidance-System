import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';
import type { UserRole } from '../utils/validation.js';

/**
 * Middleware factory that restricts access to specified roles.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(new ForbiddenError('You are not authorized to access this resource.'));
    }

    next();
  };
}
