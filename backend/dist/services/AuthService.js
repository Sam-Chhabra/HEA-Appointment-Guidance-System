import { userRepository } from '../repositories/UserRepository.js';
import { getDb } from '../db/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { AuthError, ConflictError } from '../utils/errors.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
export class AuthService {
    async registerPatient(name, email, password) {
        // Validate input
        registerSchema.parse({ name, email, password });
        // Check for duplicate email
        const existing = userRepository.findByEmail(email);
        if (existing) {
            throw new ConflictError('An account with this email already exists.');
        }
        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const user = userRepository.create(name, email, passwordHash, 'PATIENT');
        // Create patient profile
        const db = getDb();
        db.prepare(`
      INSERT INTO patient_profiles (user_id, full_name) VALUES (?, ?)
    `).run(user.id, name);
        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        };
    }
    async login(email, password) {
        loginSchema.parse({ email, password });
        const user = userRepository.findByEmail(email);
        if (!user) {
            throw new AuthError('Invalid email or password.');
        }
        const passwordMatch = await comparePassword(password, user.password_hash);
        if (!passwordMatch) {
            throw new AuthError('Invalid email or password.');
        }
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token,
        };
    }
    getCurrentUser(userId) {
        const user = userRepository.findById(userId);
        if (!user) {
            throw new AuthError('User not found.');
        }
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
}
export const authService = new AuthService();
//# sourceMappingURL=AuthService.js.map