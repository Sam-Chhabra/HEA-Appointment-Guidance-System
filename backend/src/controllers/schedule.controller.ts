import { Request, Response, NextFunction } from 'express';
import { scheduleService } from '../services/ScheduleService.js';

export class ScheduleController {
  getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user!.userId;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;

      const appointments = scheduleService.viewAssignedAppointments(doctorId, from, to);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }

  getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const doctorId = req.user!.userId;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;

      const schedule = scheduleService.viewSchedule(doctorId, from, to);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  addAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { startTime, endTime } = req.body;
      const slot = scheduleService.addAvailability(userId, startTime, endTime);
      res.status(201).json(slot);
    } catch (error) {
      next(error);
    }
  }

  removeAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const slotId = parseInt(req.params.slotId as string, 10);
      const result = scheduleService.removeAvailability(userId, slotId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const scheduleController = new ScheduleController();
