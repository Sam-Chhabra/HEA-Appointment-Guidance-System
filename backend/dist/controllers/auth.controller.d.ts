import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    logout(_req: Request, res: Response): void;
    getMe(req: Request, res: Response, next: NextFunction): void;
}
export declare const authController: AuthController;
