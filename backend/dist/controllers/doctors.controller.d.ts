import { Request, Response, NextFunction } from 'express';
export declare class DoctorController {
    search(req: Request, res: Response, next: NextFunction): void;
    getSlots(req: Request, res: Response, next: NextFunction): void;
}
export declare const doctorController: DoctorController;
