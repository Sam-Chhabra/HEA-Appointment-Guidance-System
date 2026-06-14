import { Router } from 'express';
import { guidanceController } from '../controllers/guidance.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Allow authenticated users (specifically patients)
router.post('/', authenticate, requireRole('PATIENT'), guidanceController.submit);
router.post('/:id/override', authenticate, requireRole('PATIENT'), guidanceController.override);
router.get('/:id', authenticate, requireRole('PATIENT'), guidanceController.get);

export { router as guidanceRoutes };
