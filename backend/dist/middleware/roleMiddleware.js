import { ForbiddenError } from '../utils/errors.js';
/**
 * Middleware factory that restricts access to specified roles.
 */
export function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new ForbiddenError('Authentication required.'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError('You are not authorized to access this resource.'));
        }
        next();
    };
}
//# sourceMappingURL=roleMiddleware.js.map