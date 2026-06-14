import { getDb } from '../db/database.js';
export class UserRepository {
    findByEmail(email) {
        const db = getDb();
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    create(name, email, passwordHash, role) {
        const db = getDb();
        const result = db.prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`).run(name, email, passwordHash, role);
        return this.findById(Number(result.lastInsertRowid));
    }
}
export const userRepository = new UserRepository();
//# sourceMappingURL=UserRepository.js.map