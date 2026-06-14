import { Router } from 'express';
import { appointmentController } from '../controllers/appointments.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
const router = Router();
// Only PATIENT can book or see their own
router.post('/', authenticate, requireRole('PATIENT'), appointmentController.book);
router.get('/my', authenticate, requireRole('PATIENT'), appointmentController.getMy);
router.get('/my/past', authenticate, requireRole('PATIENT'), appointmentController.getMyPast);
router.get('/my/future', authenticate, requireRole('PATIENT'), appointmentController.getMyFuture);
// Reschedule/Cancel (ownership checked in service)
router.patch('/:id/reschedule', authenticate, requireRole('PATIENT'), appointmentController.reschedule);
router.patch('/:id/cancel', authenticate, requireRole('PATIENT'), appointmentController.cancel);
export { router as appointmentRoutes };
//# sourceMappingURL=appointments.routes.js.map