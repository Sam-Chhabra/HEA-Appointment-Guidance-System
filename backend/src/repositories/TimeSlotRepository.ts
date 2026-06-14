import { getDb } from '../db/database.js';

export interface TimeSlotRow {
  id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class TimeSlotRepository {
  findById(id: number): TimeSlotRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM time_slots WHERE id = ?').get(id) as TimeSlotRow | undefined;
  }

  findAvailableByDoctor(doctorId: number, from?: string, to?: string): TimeSlotRow[] {
    const db = getDb();
    let sql = `SELECT * FROM time_slots WHERE doctor_id = ? AND status = 'AVAILABLE'`;
    const params: (number | string)[] = [doctorId];

    if (from) {
      sql += ` AND start_time >= ?`;
      params.push(from);
    }
    if (to) {
      sql += ` AND end_time <= ?`;
      params.push(to);
    }

    sql += ` ORDER BY start_time`;
    return db.prepare(sql).all(...params) as TimeSlotRow[];
  }

  findByDoctorAndDateRange(doctorId: number, from: string, to: string): TimeSlotRow[] {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM time_slots
      WHERE doctor_id = ? AND start_time >= ? AND end_time <= ? AND status != 'REMOVED'
      ORDER BY start_time
    `).all(doctorId, from, to) as TimeSlotRow[];
  }

  /**
   * Check if a new time slot would overlap with existing non-removed slots for the same doctor.
   * Excludes a specific slot ID (for update scenarios).
   */
  checkOverlap(doctorId: number, startTime: string, endTime: string, excludeSlotId?: number): TimeSlotRow[] {
    const db = getDb();
    let sql = `
      SELECT * FROM time_slots
      WHERE doctor_id = ?
        AND status IN ('AVAILABLE', 'BOOKED', 'BLOCKED')
        AND start_time < ?
        AND end_time > ?
    `;
    const params: (number | string)[] = [doctorId, endTime, startTime];

    if (excludeSlotId !== undefined) {
      sql += ` AND id != ?`;
      params.push(excludeSlotId);
    }

    return db.prepare(sql).all(...params) as TimeSlotRow[];
  }

  create(doctorId: number, startTime: string, endTime: string, status = 'AVAILABLE'): TimeSlotRow {
    const db = getDb();
    const result = db.prepare(
      `INSERT INTO time_slots (doctor_id, start_time, end_time, status) VALUES (?, ?, ?, ?)`
    ).run(doctorId, startTime, endTime, status);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  updateStatus(id: number, status: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE time_slots SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id);
  }

  updateTimes(id: number, startTime: string, endTime: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE time_slots SET start_time = ?, end_time = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(startTime, endTime, id);
  }

  delete(id: number): void {
    const db = getDb();
    db.prepare(`UPDATE time_slots SET status = 'REMOVED', updated_at = datetime('now') WHERE id = ?`).run(id);
  }
}

export const timeSlotRepository = new TimeSlotRepository();
