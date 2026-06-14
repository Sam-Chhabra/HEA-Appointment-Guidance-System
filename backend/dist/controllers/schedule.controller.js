import { scheduleService } from '../services/ScheduleService.js';
export class ScheduleController {
    getAppointments(req, res, next) {
        try {
            const doctorId = req.user.userId;
            const from = req.query.from;
            const to = req.query.to;
            const appointments = scheduleService.viewAssignedAppointments(doctorId, from, to);
            res.json(appointments);
        }
        catch (error) {
            next(error);
        }
    }
    getSchedule(req, res, next) {
        try {
            const doctorId = req.user.userId;
            const from = req.query.from;
            const to = req.query.to;
            const schedule = scheduleService.viewSchedule(doctorId, from, to);
            res.json(schedule);
        }
        catch (error) {
            next(error);
        }
    }
}
export const scheduleController = new ScheduleController();
//# sourceMappingURL=schedule.controller.js.map