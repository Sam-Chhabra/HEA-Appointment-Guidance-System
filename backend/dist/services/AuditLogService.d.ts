export declare class AuditLogService {
    logAction(actorUserId: number, action: string, entityType: string, entityId: number | null, details?: Record<string, unknown>): void;
}
export declare const auditLogService: AuditLogService;
