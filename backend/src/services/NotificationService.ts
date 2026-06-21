import { notificationRepository } from '../repositories/NotificationRepository.js';
import { appointmentRepository } from '../repositories/AppointmentRepository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class NotificationService {
  createNotification(userId: number, type: string, message: string, appointmentId?: number) {
    const notification = notificationRepository.create(userId, type, message, appointmentId);

    // Simulate "sending" - just console log and mark as sent
    try {
      console.log(`[NOTIFICATION] Type: ${type} | User: ${userId} | Message: ${message}`);
      notificationRepository.markSent(notification.id);
    } catch (err) {
      console.error(`[NOTIFICATION FAILED] ID: ${notification.id}`, err);
      notificationRepository.markFailed(notification.id);
    }

    return notification;
  }

  getUserNotifications(userId: number) {
    return notificationRepository.findByUser(userId);
  }

  markAsRead(notificationId: number, userId: number) {
    const notification = notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundError('Notification not found.');
    if (notification.user_id !== userId) {
      throw new ForbiddenError('You can only manage your own notifications.');
    }

    notificationRepository.markRead(notificationId);
    return { message: 'Notification marked as read.' };
  }
}

export const notificationService = new NotificationService();
