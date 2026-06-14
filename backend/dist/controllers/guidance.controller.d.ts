import { Request, Response, NextFunction } from 'express';
export declare class GuidanceController {
    submit(req: Request, res: Response, next: NextFunction): void;
    override(req: Request, res: Response, next: NextFunction): void;
    get(req: Request, res: Response, next: NextFunction): void;
}
export declare const guidanceController: GuidanceController;
