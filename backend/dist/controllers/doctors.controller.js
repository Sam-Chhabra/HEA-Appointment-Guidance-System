import { doctorSearchService } from '../services/DoctorSearchService.js';
import { doctorRepository } from '../repositories/DoctorRepository.js';
export class DoctorController {
    search(req, res, next) {
        try {
            const departmentId = parseInt(req.query.departmentId, 10);
            if (isNaN(departmentId)) {
                // Return all doctors if no department is specified
                const allDoctors = doctorRepository.findAll();
                res.json(allDoctors);
                return;
            }
            const filters = {
                specialization: req.query.specialization,
                availableFrom: req.query.availableFrom,
                availableTo: req.query.availableTo,
            };
            const doctors = doctorSearchService.searchDoctors(departmentId, filters);
            res.json(doctors);
        }
        catch (error) {
            next(error);
        }
    }
    getSlots(req, res, next) {
        try {
            const doctorId = parseInt(req.params.id, 10);
            const from = req.query.from;
            const to = req.query.to;
            const slots = doctorSearchService.getAvailableSlots(doctorId, from, to);
            res.json(slots);
        }
        catch (error) {
            next(error);
        }
    }
}
export const doctorController = new DoctorController();
//# sourceMappingURL=doctors.controller.js.map