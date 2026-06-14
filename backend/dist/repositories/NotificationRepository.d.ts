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
export declare class NotificationRepository {
    findById(id: number): NotificationRow | undefined;
    findByUser(userId: number): NotificationRow[];
    create(userId: number, type: string, message: string, appointmentId?: number): NotificationRow;
    markSent(id: number): void;
    markFailed(id: number): void;
    markRead(id: number): void;
}
export declare const notificationRepository: NotificationRepository;
