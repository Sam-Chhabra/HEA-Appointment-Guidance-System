import { Router } from 'express';
import { doctorController } from '../controllers/doctors.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/', authenticate, doctorController.search);
router.get('/:id/slots', authenticate, doctorController.getSlots);
export { router as doctorRoutes };
//# sourceMappingURL=doctors.routes.js.map