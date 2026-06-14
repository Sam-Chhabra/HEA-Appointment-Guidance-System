import { guidanceService } from '../services/GuidanceService.js';
import { overrideDepartmentSchema } from '../utils/validation.js';
export class GuidanceController {
    submit(req, res, next) {
        try {
            const { inputText } = req.body;
            const patientId = req.user?.userId ?? null; // Nullable for anonymous
            const result = guidanceService.submitGuidanceInput(inputText, patientId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    override(req, res, next) {
        try {
            const sessionId = parseInt(req.params.id, 10);
            const { departmentId } = overrideDepartmentSchema.parse(req.body);
            const patientId = req.user.userId;
            const result = guidanceService.overrideDepartment(sessionId, departmentId, patientId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    get(req, res, next) {
        try {
            const sessionId = parseInt(req.params.id, 10);
            const patientId = req.user.userId;
            const result = guidanceService.getGuidanceSession(sessionId, patientId);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
export const guidanceController = new GuidanceController();
//# sourceMappingURL=guidance.controller.js.map