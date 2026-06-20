import { Router } from 'express';
import { guidanceController } from '../controllers/guidance.controller.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Allow authenticated users OR anonymous users
router.post('/', optionalAuthenticate, guidanceController.submit);
router.post('/:id/override', optionalAuthenticate, guidanceController.override);
router.get('/:id', optionalAuthenticate, guidanceController.get);

export { router as guidanceRoutes };
