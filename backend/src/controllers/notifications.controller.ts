import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService.js';

export class NotificationController {
  getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = notificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationId = parseInt(req.params.id as string, 10);
      const userId = req.user!.userId;

      const result = notificationService.markAsRead(notificationId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
