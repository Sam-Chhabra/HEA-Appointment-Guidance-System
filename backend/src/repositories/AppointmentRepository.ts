import { getDb } from '../db/database.js';

export interface AppointmentRow {
  id: number;
  patient_id: number;
  doctor_id: number;
  time_slot_id: number;
  department_id: number;
  status: string;
  reason_or_need: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends AppointmentRow {
  doctor_name: string;
  department_name: string;
  slot_start_time: string;
  slot_end_time: string;
  patient_name?: string;
}

export class AppointmentRepository {
  findById(id: number): AppointmentRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as AppointmentRow | undefined;
  }

  findByIdWithDetails(id: number): AppointmentWithDetails | undefined {
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
    `).get(id) as AppointmentWithDetails | undefined;
  }

  findByPatient(patientId: number): AppointmentWithDetails[] {
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
    `).all(patientId) as AppointmentWithDetails[];
  }

  findPastByPatient(patientId: number): AppointmentWithDetails[] {
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
    `).all(patientId) as AppointmentWithDetails[];
  }

  findFutureByPatient(patientId: number): AppointmentWithDetails[] {
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
    `).all(patientId) as AppointmentWithDetails[];
  }

  findByDoctor(doctorId: number, from?: string, to?: string): AppointmentWithDetails[] {
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
    const params: (number | string)[] = [doctorId];

    if (from) {
      sql += ` AND ts.start_time >= ?`;
      params.push(from);
    }
    if (to) {
      sql += ` AND ts.end_time <= ?`;
      params.push(to);
    }

    sql += ` ORDER BY ts.start_time ASC`;
    return db.prepare(sql).all(...params) as AppointmentWithDetails[];
  }

  findByTimeSlot(timeSlotId: number): AppointmentRow | undefined {
    const db = getDb();
    return db.prepare(
      `SELECT * FROM appointments WHERE time_slot_id = ? AND status NOT IN ('CANCELLED')`
    ).get(timeSlotId) as AppointmentRow | undefined;
  }

  create(
    patientId: number,
    doctorId: number,
    timeSlotId: number,
    departmentId: number,
    reasonOrNeed: string,
    status = 'CONFIRMED'
  ): AppointmentRow {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO appointments (patient_id, doctor_id, time_slot_id, department_id, reason_or_need, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(patientId, doctorId, timeSlotId, departmentId, reasonOrNeed, status);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  updateStatus(id: number, status: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id);
  }

  updateTimeSlot(id: number, newTimeSlotId: number, status: string): void {
    const db = getDb();
    db.prepare(
      `UPDATE appointments SET time_slot_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(newTimeSlotId, status, id);
  }
}

export const appointmentRepository = new AppointmentRepository();
