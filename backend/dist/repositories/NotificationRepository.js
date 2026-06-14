import { getDb } from '../db/database.js';
export class NotificationRepository {
    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    }
    findByUser(userId) {
        const db = getDb();
        return db.prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`).all(userId);
    }
    create(userId, type, message, appointmentId) {
        const db = getDb();
        const result = db.prepare(`
      INSERT INTO notifications (user_id, appointment_id, type, message, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `).run(userId, appointmentId ?? null, type, message);
        return this.findById(Number(result.lastInsertRowid));
    }
    markSent(id) {
        const db = getDb();
        db.prepare(`UPDATE notifications SET status = 'SENT', sent_at = datetime('now') WHERE id = ?`).run(id);
    }
    markFailed(id) {
        const db = getDb();
        db.prepare(`UPDATE notifications SET status = 'FAILED' WHERE id = ?`).run(id);
    }
    markRead(id) {
        const db = getDb();
        db.prepare(`UPDATE notifications SET status = 'READ' WHERE id = ?`).run(id);
    }
}
export const notificationRepository = new NotificationRepository();
//# sourceMappingURL=NotificationRepository.js.map