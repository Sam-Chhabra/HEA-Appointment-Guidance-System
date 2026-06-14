import jwt from 'jsonwebtoken';
import { AuthError } from '../utils/errors.js';
const JWT_SECRET = process.env.JWT_SECRET || 'hea-dev-secret-change-in-production';
export function generateToken(user) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}
export function authenticate(req, _res, next) {
    try {
        // Check Authorization header first, then cookie
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        if (!token) {
            throw new AuthError('Authentication required. Please log in.');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof AuthError) {
            next(error);
        }
        else {
            next(new AuthError('Invalid or expired token. Please log in again.'));
        }
    }
}
//# sourceMappingURL=authMiddleware.js.map