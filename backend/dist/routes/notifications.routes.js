import { Router } from 'express';
import { notificationController } from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/my', authenticate, notificationController.getMy);
router.patch('/:id/read', authenticate, notificationController.markRead);
export { router as notificationRoutes };
//# sourceMappingURL=notifications.routes.js.map