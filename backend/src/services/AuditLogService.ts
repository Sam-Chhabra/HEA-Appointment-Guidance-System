import { auditLogRepository } from '../repositories/AuditLogRepository.js';

export class AuditLogService {
  logAction(
    actorUserId: number,
    action: string,
    entityType: string,
    entityId: number | null,
    details?: Record<string, unknown>
  ): void {
    auditLogRepository.create(
      actorUserId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : undefined
    );
  }
}

export const auditLogService = new AuditLogService();
