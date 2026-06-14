import { getDb } from '../db/database.js';

export interface AuditLogRow {
  id: number;
  actor_user_id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}

export class AuditLogRepository {
  create(
    actorUserId: number,
    action: string,
    entityType: string,
    entityId: number | null,
    details?: string
  ): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(actorUserId, action, entityType, entityId, details ?? null);
  }

  findByEntity(entityType: string, entityId: number): AuditLogRow[] {
    const db = getDb();
    return db.prepare(
      `SELECT * FROM audit_logs WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC`
    ).all(entityType, entityId) as AuditLogRow[];
  }
}

export const auditLogRepository = new AuditLogRepository();
