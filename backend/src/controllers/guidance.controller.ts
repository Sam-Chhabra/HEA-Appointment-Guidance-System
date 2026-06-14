import { Request, Response, NextFunction } from 'express';
import { guidanceService } from '../services/GuidanceService.js';
import { overrideDepartmentSchema } from '../utils/validation.js';

export class GuidanceController {
  submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { inputText } = req.body;
      const patientId = req.user?.userId ?? null; // Nullable for anonymous

      const result = guidanceService.submitGuidanceInput(inputText, patientId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  override(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id as string, 10);
      const { departmentId } = overrideDepartmentSchema.parse(req.body);
      const patientId = req.user!.userId;

      const result = guidanceService.overrideDepartment(sessionId, departmentId, patientId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  get(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseInt(req.params.id as string, 10);
      const patientId = req.user!.userId;

      const result = guidanceService.getGuidanceSession(sessionId, patientId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const guidanceController = new GuidanceController();
