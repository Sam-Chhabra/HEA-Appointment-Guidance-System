import { Router } from 'express';
import { doctorController } from '../controllers/doctors.controller.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticate, doctorController.search);
router.get('/:id/slots', optionalAuthenticate, doctorController.getSlots);

export { router as doctorRoutes };
