import { notificationService } from '../services/NotificationService.js';
export class NotificationController {
    getMy(req, res, next) {
        try {
            const userId = req.user.userId;
            const notifications = notificationService.getUserNotifications(userId);
            res.json(notifications);
        }
        catch (error) {
            next(error);
        }
    }
    markRead(req, res, next) {
        try {
            const notificationId = parseInt(req.params.id, 10);
            const userId = req.user.userId;
            const result = notificationService.markAsRead(notificationId, userId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
export const notificationController = new NotificationController();
//# sourceMappingURL=notifications.controller.js.map