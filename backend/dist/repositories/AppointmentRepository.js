import { getDb } from '../db/database.js';
export class AppointmentRepository {
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    }
    findByIdWithDetails(id) {
        const db = getDb();
        return db.prepare(`
      SELECT a.*,
             dp.full_name as doctor_name,
             d.name as department_name,
             ts.start_time as slot_start_time,
             ts.end_time as slot_end_time
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN departments d ON a.department_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE a.id = ?
    `).get(id);
    }
    findByPatient(patientId) {
        const db = getDb();
        return db.prepare(`
      SELECT a.*,
             dp.full_name as doctor_name,
             d.name as department_name,
             ts.start_time as slot_start_time,
             ts.end_time as slot_end_time
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN departments d ON a.department_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE a.patient_id = ?
      ORDER BY ts.start_time DESC
    `).all(patientId);
    }
    findPastByPatient(patientId) {
        const db = getDb();
        return db.prepare(`
      SELECT a.*,
             dp.full_name as doctor_name,
             d.name as department_name,
             ts.start_time as slot_start_time,
             ts.end_time as slot_end_time
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN departments d ON a.department_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE a.patient_id = ? AND ts.start_time < datetime('now')
      ORDER BY ts.start_time DESC
    `).all(patientId);
    }
    findFutureByPatient(patientId) {
        const db = getDb();
        return db.prepare(`
      SELECT a.*,
             dp.full_name as doctor_name,
             d.name as department_name,
             ts.start_time as slot_start_time,
             ts.end_time as slot_end_time
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN departments d ON a.department_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE a.patient_id = ? AND ts.start_time >= datetime('now')
            AND a.status NOT IN ('CANCELLED', 'COMPLETED')
      ORDER BY ts.start_time ASC
    `).all(patientId);
    }
    findByDoctor(doctorId, from, to) {
        const db = getDb();
        let sql = `
      SELECT a.*,
             dp.full_name as doctor_name,
             d.name as department_name,
             ts.start_time as slot_start_time,
             ts.end_time as slot_end_time,
             pp.full_name as patient_name
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN departments d ON a.department_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      LEFT JOIN patient_profiles pp ON a.patient_id = pp.user_id
      WHERE a.doctor_id = ? AND a.status NOT IN ('CANCELLED')
    `;
        const params = [doctorId];
        if (from) {
            sql += ` AND ts.start_time >= ?`;
            params.push(from);
        }
        if (to) {
            sql += ` AND ts.end_time <= ?`;
            params.push(to);
        }
        sql += ` ORDER BY ts.start_time ASC`;
        return db.prepare(sql).all(...params);
    }
    findByTimeSlot(timeSlotId) {
        const db = getDb();
        return db.prepare(`SELECT * FROM appointments WHERE time_slot_id = ? AND status NOT IN ('CANCELLED')`).get(timeSlotId);
    }
    create(patientId, doctorId, timeSlotId, departmentId, reasonOrNeed, status = 'CONFIRMED') {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, time_slot_id, department_id, reason_or_need, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(patientId, doctorId, timeSlotId, departmentId, reasonOrNeed, status);
        return this.findById(Number(result.lastInsertRowid));
    }
    updateStatus(id, status) {
        const db = getDb();
        db.prepare(`UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
    }
    updateTimeSlot(id, newTimeSlotId, status) {
        const db = getDb();
        db.prepare(`UPDATE appointments SET time_slot_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?`).run(newTimeSlotId, status, id);
    }
}
export const appointmentRepository = new AppointmentRepository();
//# sourceMappingURL=AppointmentRepository.js.map