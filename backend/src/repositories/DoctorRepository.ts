import { getDb } from '../db/database.js';

export interface DoctorProfileRow {
  id: number;
  user_id: number;
  full_name: string;
  department_id: number;
  specialization: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorWithDepartment extends DoctorProfileRow {
  department_name: string;
}

export class DoctorRepository {
  findById(id: number): DoctorProfileRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM doctor_profiles WHERE id = ?').get(id) as DoctorProfileRow | undefined;
  }

  findByUserId(userId: number): DoctorProfileRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM doctor_profiles WHERE user_id = ?').get(userId) as DoctorProfileRow | undefined;
  }

  findByDepartment(departmentId: number): DoctorWithDepartment[] {
    const db = getDb();
    return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      WHERE dp.department_id = ?
      ORDER BY dp.full_name
    `).all(departmentId) as DoctorWithDepartment[];
  }

  findByDepartmentAndSpecialization(departmentId: number, specialization: string): DoctorWithDepartment[] {
    const db = getDb();
    return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      WHERE dp.department_id = ? AND dp.specialization LIKE ?
      ORDER BY dp.full_name
    `).all(departmentId, `%${specialization}%`) as DoctorWithDepartment[];
  }

  findWithAvailability(departmentId: number, from: string, to: string): DoctorWithDepartment[] {
    const db = getDb();
    return db.prepare(`
      SELECT DISTINCT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      JOIN time_slots ts ON ts.doctor_id = dp.id
      WHERE dp.department_id = ?
        AND ts.status = 'AVAILABLE'
        AND ts.start_time >= ?
        AND ts.end_time <= ?
      ORDER BY dp.full_name
    `).all(departmentId, from, to) as DoctorWithDepartment[];
  }

  findAll(): DoctorWithDepartment[] {
    const db = getDb();
    return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      ORDER BY dp.full_name
    `).all() as DoctorWithDepartment[];
  }
}

export const doctorRepository = new DoctorRepository();
