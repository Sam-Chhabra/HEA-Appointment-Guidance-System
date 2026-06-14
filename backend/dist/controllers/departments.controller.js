import { departmentRepository } from '../repositories/DepartmentRepository.js';
import { NotFoundError } from '../utils/errors.js';
export class DepartmentController {
    getAll(_req, res, next) {
        try {
            const departments = departmentRepository.findAll();
            res.json(departments);
        }
        catch (error) {
            next(error);
        }
    }
    getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const department = departmentRepository.findById(id);
            if (!department) {
                throw new NotFoundError('Department not found.');
            }
            res.json(department);
        }
        catch (error) {
            next(error);
        }
    }
}
export const departmentController = new DepartmentController();
//# sourceMappingURL=departments.controller.js.map