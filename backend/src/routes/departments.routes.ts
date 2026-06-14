import { Router } from 'express';
import { departmentController } from '../controllers/departments.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, departmentController.getAll);
router.get('/:id', authenticate, departmentController.getById);

export { router as departmentRoutes };
