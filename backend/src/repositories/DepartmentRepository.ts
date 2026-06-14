import { getDb } from '../db/database.js';

export interface DepartmentRow {
  id: number;
  name: string;
  description: string | null;
  keywords: string | null;
}

export class DepartmentRepository {
  findAll(): DepartmentRow[] {
    const db = getDb();
    return db.prepare('SELECT * FROM departments ORDER BY name').all() as DepartmentRow[];
  }

  findById(id: number): DepartmentRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as DepartmentRow | undefined;
  }

  findByName(name: string): DepartmentRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM departments WHERE name = ?').get(name) as DepartmentRow | undefined;
  }
}

export const departmentRepository = new DepartmentRepository();
