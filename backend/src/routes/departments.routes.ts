import { Router } from 'express';
import { departmentController } from '../controllers/departments.controller.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticate, departmentController.getAll);
router.get('/:id', optionalAuthenticate, departmentController.getById);

export { router as departmentRoutes };
