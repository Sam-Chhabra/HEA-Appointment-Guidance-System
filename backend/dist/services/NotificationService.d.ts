export declare class NotificationService {
    createNotification(userId: number, type: string, message: string, appointmentId?: number): import("../repositories/NotificationRepository.js").NotificationRow;
    getUserNotifications(userId: number): import("../repositories/NotificationRepository.js").NotificationRow[];
    markAsRead(notificationId: number, userId: number): {
        message: string;
    };
}
export declare const notificationService: NotificationService;
