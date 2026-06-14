import { getDb } from '../db/database.js';

export interface NotificationRow {
  id: number;
  user_id: number;
  appointment_id: number | null;
  type: string;
  message: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

export class NotificationRepository {
  findById(id: number): NotificationRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as NotificationRow | undefined;
  }

  findByUser(userId: number): NotificationRow[] {
    const db = getDb();
    return db.prepare(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`
    ).all(userId) as NotificationRow[];
  }

  create(
    userId: number,
    type: string,
    message: string,
    appointmentId?: number
  ): NotificationRow {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO notifications (user_id, appointment_id, type, message, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `).run(userId, appointmentId ?? null, type, message);

    return this.findById(Number(result.lastInsertRowid))!;
  }

  markSent(id: number): void {
    const db = getDb();
    db.prepare(
      `UPDATE notifications SET status = 'SENT', sent_at = datetime('now') WHERE id = ?`
    ).run(id);
  }

  markFailed(id: number): void {
    const db = getDb();
    db.prepare(
      `UPDATE notifications SET status = 'FAILED' WHERE id = ?`
    ).run(id);
  }

  markRead(id: number): void {
    const db = getDb();
    db.prepare(
      `UPDATE notifications SET status = 'READ' WHERE id = ?`
    ).run(id);
  }
}

export const notificationRepository = new NotificationRepository();
