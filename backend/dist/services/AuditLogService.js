import { auditLogRepository } from '../repositories/AuditLogRepository.js';
export class AuditLogService {
    logAction(actorUserId, action, entityType, entityId, details) {
        auditLogRepository.create(actorUserId, action, entityType, entityId, details ? JSON.stringify(details) : undefined);
    }
}
export const auditLogService = new AuditLogService();
//# sourceMappingURL=AuditLogService.js.map