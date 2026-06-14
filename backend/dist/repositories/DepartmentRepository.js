import { getDb } from '../db/database.js';
export class DepartmentRepository {
    findAll() {
        const db = getDb();
        return db.prepare('SELECT * FROM departments ORDER BY name').all();
    }
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    }
    findByName(name) {
        const db = getDb();
        return db.prepare('SELECT * FROM departments WHERE name = ?').get(name);
    }
}
export const departmentRepository = new DepartmentRepository();
//# sourceMappingURL=DepartmentRepository.js.map