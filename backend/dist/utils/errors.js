/**
 * Custom error classes with HTTP status codes.
 * These are caught by the global error middleware and returned as user-friendly JSON.
 */
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
export class AuthError extends AppError {
    constructor(message = 'Authentication required.') {
        super(message, 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'You are not authorized to perform this action.') {
        super(message, 403);
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found.') {
        super(message, 404);
    }
}
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
//# sourceMappingURL=errors.js.map