import { getDb } from '../db/database.js';
export class GuidanceRepository {
    findById(id) {
        const db = getDb();
        return db.prepare(`
      SELECT gs.*,
             rd.name as recommended_department_name,
             sd.name as selected_department_name
      FROM guidance_sessions gs
      LEFT JOIN departments rd ON gs.recommended_department_id = rd.id
      LEFT JOIN departments sd ON gs.selected_department_id = sd.id
      WHERE gs.id = ?
    `).get(id);
    }
    create(patientId, inputText, extractedKeywords, recommendedDepartmentId, selectedDepartmentId) {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO guidance_sessions (patient_id, input_text, extracted_keywords, recommended_department_id, selected_department_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(patientId, inputText, extractedKeywords, recommendedDepartmentId, selectedDepartmentId);
        return db.prepare('SELECT * FROM guidance_sessions WHERE id = ?')
            .get(Number(result.lastInsertRowid));
    }
    updateSelectedDepartment(id, departmentId) {
        const db = getDb();
        db.prepare(`UPDATE guidance_sessions SET selected_department_id = ?, updated_at = datetime('now') WHERE id = ?`).run(departmentId, id);
    }
    updateStatus(id, status) {
        const db = getDb();
        db.prepare(`UPDATE guidance_sessions SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
    }
}
export const guidanceRepository = new GuidanceRepository();
//# sourceMappingURL=GuidanceRepository.js.map