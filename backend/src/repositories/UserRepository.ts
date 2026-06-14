import { getDb } from '../db/database.js';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  findByEmail(email: string): UserRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  }

  findById(id: number): UserRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  }

  create(name: string, email: string, passwordHash: string, role: string): UserRow {
    const db = getDb();
    const result = db.prepare(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
    ).run(name, email, passwordHash, role);

    return this.findById(Number(result.lastInsertRowid))!;
  }
}

export const userRepository = new UserRepository();
