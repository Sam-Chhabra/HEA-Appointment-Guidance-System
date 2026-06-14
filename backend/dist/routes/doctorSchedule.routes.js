import { Router } from 'express';
import { scheduleController } from '../controllers/schedule.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
const router = Router();
// Only DOCTOR can view their own schedule
router.get('/appointments', authenticate, requireRole('DOCTOR'), scheduleController.getAppointments);
router.get('/schedule', authenticate, requireRole('DOCTOR'), scheduleController.getSchedule);
export { router as doctorScheduleRoutes };
//# sourceMappingURL=doctorSchedule.routes.js.map