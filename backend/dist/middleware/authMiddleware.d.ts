import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    userId: number;
    email: string;
    role: string;
    name: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare function generateToken(user: AuthUser): string;
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
