import { Router } from 'express';
import { availabilityController } from '../controllers/availability.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Only ADMIN can manage availability
router.post('/doctors/:doctorId/availability', authenticate, requireRole('ADMIN'), availabilityController.add);
router.patch('/availability/:slotId', authenticate, requireRole('ADMIN'), availabilityController.update);
router.delete('/availability/:slotId', authenticate, requireRole('ADMIN'), availabilityController.remove);

// Admin reading availability
router.get('/doctors/:doctorId/availability', authenticate, requireRole('ADMIN'), availabilityController.getByDoctor);

export { router as adminAvailabilityRoutes };
