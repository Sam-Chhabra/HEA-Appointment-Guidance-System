import { getDb } from '../db/database.js';

export interface GuidanceSessionRow {
  id: number;
  patient_id: number | null;
  input_text: string;
  extracted_keywords: string | null;
  recommended_department_id: number | null;
  selected_department_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GuidanceSessionWithDepartment extends GuidanceSessionRow {
  recommended_department_name: string | null;
  selected_department_name: string | null;
}

export class GuidanceRepository {
  findById(id: number): GuidanceSessionWithDepartment | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT gs.*,
             rd.name as recommended_department_name,
             sd.name as selected_department_name
      FROM guidance_sessions gs
      LEFT JOIN departments rd ON gs.recommended_department_id = rd.id
      LEFT JOIN departments sd ON gs.selected_department_id = sd.id
      WHERE gs.id = ?
    `).get(id) as GuidanceSessionWithDepartment | undefined;
  }

  create(
    patientId: number | null,
    inputText: string,
    extractedKeywords: string | null,
    recommendedDepartmentId: number | null,
    selectedDepartmentId: number | null
  ): GuidanceSessionRow {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO guidance_sessions (patient_id, input_text, extracted_keywords, recommended_department_id, selected_department_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(patientId, inputText, extractedKeywords, recommendedDepartmentId, selectedDepartmentId);

    return db.prepare('SELECT * FROM guidance_sessions WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as GuidanceSessionRow;
  }

  updateSelectedDepartment(id: number, departmentId: number): void {
    const db = getDb();
    db.prepare(
      `UPDATE guidance_sessions SET selected_department_id = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(departmentId, id);
  }

  updateStatus(id: number, status: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE guidance_sessions SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id);
  }
}

export const guidanceRepository = new GuidanceRepository();
