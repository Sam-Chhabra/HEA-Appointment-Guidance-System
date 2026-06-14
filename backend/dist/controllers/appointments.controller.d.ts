import { Request, Response, NextFunction } from 'express';
export declare class AppointmentController {
    book(req: Request, res: Response, next: NextFunction): void;
    reschedule(req: Request, res: Response, next: NextFunction): void;
    cancel(req: Request, res: Response, next: NextFunction): void;
    getMy(req: Request, res: Response, next: NextFunction): void;
    getMyPast(req: Request, res: Response, next: NextFunction): void;
    getMyFuture(req: Request, res: Response, next: NextFunction): void;
}
export declare const appointmentController: AppointmentController;
