export interface AuditLogRow {
    id: number;
    actor_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    details: string | null;
    created_at: string;
}
export declare class AuditLogRepository {
    create(actorUserId: number, action: string, entityType: string, entityId: number | null, details?: string): void;
    findByEntity(entityType: string, entityId: number): AuditLogRow[];
}
export declare const auditLogRepository: AuditLogRepository;
