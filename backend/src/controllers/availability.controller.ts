import { Request, Response, NextFunction } from 'express';
import { availabilityService } from '../services/AvailabilityService.js';
import { addAvailabilitySchema, updateAvailabilitySchema } from '../utils/validation.js';

export class AvailabilityController {
  add(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const doctorId = parseInt(req.params.doctorId as string, 10);
      const data = addAvailabilitySchema.parse(req.body);

      const slot = availabilityService.addAvailability(adminId, doctorId, data.startTime, data.endTime);
      res.status(201).json(slot);
    } catch (error) {
      next(error);
    }
  }

  update(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const slotId = parseInt(req.params.slotId as string, 10);
      const data = updateAvailabilitySchema.parse(req.body);

      const slot = availabilityService.updateAvailability(adminId, slotId, data.startTime, data.endTime);
      res.json(slot);
    } catch (error) {
      next(error);
    }
  }

  remove(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const slotId = parseInt(req.params.slotId as string, 10);

      const result = availabilityService.removeAvailability(adminId, slotId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  getByDoctor(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = parseInt(req.params.doctorId as string, 10);
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;

      const slots = availabilityService.getDoctorAvailability(doctorId, from, to);
      res.json(slots);
    } catch (error) {
      next(error);
    }
  }
}

export const availabilityController = new AvailabilityController();
