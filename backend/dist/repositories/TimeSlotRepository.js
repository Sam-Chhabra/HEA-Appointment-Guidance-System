import { getDb } from '../db/database.js';
export class TimeSlotRepository {
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM time_slots WHERE id = ?').get(id);
    }
    findAvailableByDoctor(doctorId, from, to) {
        const db = getDb();
        let sql = `SELECT * FROM time_slots WHERE doctor_id = ? AND status = 'AVAILABLE'`;
        const params = [doctorId];
        if (from) {
            sql += ` AND start_time >= ?`;
            params.push(from);
        }
        if (to) {
            sql += ` AND end_time <= ?`;
            params.push(to);
        }
        sql += ` ORDER BY start_time`;
        return db.prepare(sql).all(...params);
    }
    findByDoctorAndDateRange(doctorId, from, to) {
        const db = getDb();
        return db.prepare(`
      SELECT * FROM time_slots
      WHERE doctor_id = ? AND start_time >= ? AND end_time <= ? AND status != 'REMOVED'
      ORDER BY start_time
    `).all(doctorId, from, to);
    }
    /**
     * Check if a new time slot would overlap with existing non-removed slots for the same doctor.
     * Excludes a specific slot ID (for update scenarios).
     */
    checkOverlap(doctorId, startTime, endTime, excludeSlotId) {
        const db = getDb();
        let sql = `
      SELECT * FROM time_slots
      WHERE doctor_id = ?
        AND status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')
        AND start_time < ?
        AND end_time > ?
    `;
        const params = [doctorId, endTime, startTime];
        if (excludeSlotId !== undefined) {
            sql += ` AND id != ?`;
            params.push(excludeSlotId);
        }
        return db.prepare(sql).all(...params);
    }
    create(doctorId, startTime, endTime, status = 'AVAILABLE') {
        const db = getDb();
        const result = db.prepare(`INSERT INTO time_slots (doctor_id, start_time, end_time, status) VALUES (?, ?, ?, ?)`).run(doctorId, startTime, endTime, status);
        return this.findById(Number(result.lastInsertRowid));
    }
    updateStatus(id, status) {
        const db = getDb();
        db.prepare(`UPDATE time_slots SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
    }
    updateTimes(id, startTime, endTime) {
        const db = getDb();
        db.prepare(`UPDATE time_slots SET start_time = ?, end_time = ?, updated_at = datetime('now') WHERE id = ?`).run(startTime, endTime, id);
    }
    delete(id) {
        const db = getDb();
        db.prepare(`UPDATE time_slots SET status = 'REMOVED', updated_at = datetime('now') WHERE id = ?`).run(id);
    }
}
export const timeSlotRepository = new TimeSlotRepository();
//# sourceMappingURL=TimeSlotRepository.js.map