import { getDb } from '../db/database.js';
export class DoctorRepository {
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM doctor_profiles WHERE id = ?').get(id);
    }
    findByUserId(userId) {
        const db = getDb();
        return db.prepare('SELECT * FROM doctor_profiles WHERE user_id = ?').get(userId);
    }
    findByDepartment(departmentId) {
        const db = getDb();
        return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      WHERE dp.department_id = ?
      ORDER BY dp.full_name
    `).all(departmentId);
    }
    findByDepartmentAndSpecialization(departmentId, specialization) {
        const db = getDb();
        return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      WHERE dp.department_id = ? AND dp.specialization LIKE ?
      ORDER BY dp.full_name
    `).all(departmentId, `%${specialization}%`);
    }
    findWithAvailability(departmentId, from, to) {
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
    `).all(departmentId, from, to);
    }
    findAll() {
        const db = getDb();
        return db.prepare(`
      SELECT dp.*, d.name as department_name
      FROM doctor_profiles dp
      JOIN departments d ON dp.department_id = d.id
      ORDER BY dp.full_name
    `).all();
    }
}
export const doctorRepository = new DoctorRepository();
//# sourceMappingURL=DoctorRepository.js.map