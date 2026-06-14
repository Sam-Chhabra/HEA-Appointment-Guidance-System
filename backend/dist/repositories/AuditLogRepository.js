import { getDb } from '../db/database.js';
export class AuditLogRepository {
    create(actorUserId, action, entityType, entityId, details) {
        const db = getDb();
        db.prepare(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(actorUserId, action, entityType, entityId, details ?? null);
    }
    findByEntity(entityType, entityId) {
        const db = getDb();
        return db.prepare(`SELECT * FROM audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC`).all(entityType, entityId);
    }
}
export const auditLogRepository = new AuditLogRepository();
//# sourceMappingURL=AuditLogRepository.js.map