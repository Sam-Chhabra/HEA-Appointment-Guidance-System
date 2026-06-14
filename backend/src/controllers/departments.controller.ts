import { Request, Response, NextFunction } from 'express';
import { departmentRepository } from '../repositories/DepartmentRepository.js';
import { NotFoundError } from '../utils/errors.js';

export class DepartmentController {
  getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const departments = departmentRepository.findAll();
      res.json(departments);
    } catch (error) {
      next(error);
    }
  }

  getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const department = departmentRepository.findById(id);
      if (!department) {
        throw new NotFoundError('Department not found.');
      }
      res.json(department);
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();
