import { Request, Response, NextFunction } from 'express';
export declare class ScheduleController {
    getAppointments(req: Request, res: Response, next: NextFunction): void;
    getSchedule(req: Request, res: Response, next: NextFunction): void;
}
export declare const scheduleController: ScheduleController;
