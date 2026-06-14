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
}

export const scheduleController = new ScheduleController();
