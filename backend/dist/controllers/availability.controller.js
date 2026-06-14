import { availabilityService } from '../services/AvailabilityService.js';
import { addAvailabilitySchema, updateAvailabilitySchema } from '../utils/validation.js';
export class AvailabilityController {
    add(req, res, next) {
        try {
            const adminId = req.user.userId;
            const doctorId = parseInt(req.params.doctorId, 10);
            const data = addAvailabilitySchema.parse(req.body);
            const slot = availabilityService.addAvailability(adminId, doctorId, data.startTime, data.endTime);
            res.status(201).json(slot);
        }
        catch (error) {
            next(error);
        }
    }
    update(req, res, next) {
        try {
            const adminId = req.user.userId;
            const slotId = parseInt(req.params.slotId, 10);
            const data = updateAvailabilitySchema.parse(req.body);
            const slot = availabilityService.updateAvailability(adminId, slotId, data.startTime, data.endTime);
            res.json(slot);
        }
        catch (error) {
            next(error);
        }
    }
    remove(req, res, next) {
        try {
            const adminId = req.user.userId;
            const slotId = parseInt(req.params.slotId, 10);
            const result = availabilityService.removeAvailability(adminId, slotId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    getByDoctor(req, res, next) {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);
            const from = req.query.from;
            const to = req.query.to;
            const slots = availabilityService.getDoctorAvailability(doctorId, from, to);
            res.json(slots);
        }
        catch (error) {
            next(error);
        }
    }
}
export const availabilityController = new AvailabilityController();
//# sourceMappingURL=availability.controller.js.map