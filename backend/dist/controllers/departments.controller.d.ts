import { Request, Response, NextFunction } from 'express';
export declare class DepartmentController {
    getAll(_req: Request, res: Response, next: NextFunction): void;
    getById(req: Request, res: Response, next: NextFunction): void;
}
export declare const departmentController: DepartmentController;
