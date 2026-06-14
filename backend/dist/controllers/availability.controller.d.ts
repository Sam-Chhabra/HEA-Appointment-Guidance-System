import { Request, Response, NextFunction } from 'express';
export declare class AvailabilityController {
    add(req: Request, res: Response, next: NextFunction): void;
    update(req: Request, res: Response, next: NextFunction): void;
    remove(req: Request, res: Response, next: NextFunction): void;
    getByDoctor(req: Request, res: Response, next: NextFunction): void;
}
export declare const availabilityController: AvailabilityController;
