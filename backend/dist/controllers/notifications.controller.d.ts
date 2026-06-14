import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    getMy(req: Request, res: Response, next: NextFunction): void;
    markRead(req: Request, res: Response, next: NextFunction): void;
}
export declare const notificationController: NotificationController;
