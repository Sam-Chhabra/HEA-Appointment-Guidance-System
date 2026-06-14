import { appointmentService } from '../services/AppointmentService.js';
import { bookAppointmentSchema, rescheduleSchema } from '../utils/validation.js';
export class AppointmentController {
    book(req, res, next) {
        try {
            const data = bookAppointmentSchema.parse(req.body);
            const patientId = req.user.userId;
            const appointment = appointmentService.bookAppointment(patientId, data.doctorId, data.timeSlotId, data.departmentId, data.reasonOrNeed, data.patientInfo);
            res.status(201).json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    reschedule(req, res, next) {
        try {
            const appointmentId = parseInt(req.params.id, 10);
            const data = rescheduleSchema.parse(req.body);
            const patientId = req.user.userId;
            const appointment = appointmentService.modifyAppointment(appointmentId, data.newTimeSlotId, patientId);
            res.json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    cancel(req, res, next) {
        try {
            const appointmentId = parseInt(req.params.id, 10);
            const patientId = req.user.userId;
            const appointment = appointmentService.cancelAppointment(appointmentId, patientId);
            res.json(appointment);
        }
        catch (error) {
            next(error);
        }
    }
    getMy(req, res, next) {
        try {
            const patientId = req.user.userId;
            const appointments = appointmentService.viewPatientAppointments(patientId);
            res.json(appointments);
        }
        catch (error) {
            next(error);
        }
    }
    getMyPast(req, res, next) {
        try {
            const patientId = req.user.userId;
            const appointments = appointmentService.viewPastAppointments(patientId);
            res.json(appointments);
        }
        catch (error) {
            next(error);
        }
    }
    getMyFuture(req, res, next) {
        try {
            const patientId = req.user.userId;
            const appointments = appointmentService.viewFutureAppointments(patientId);
            res.json(appointments);
        }
        catch (error) {
            next(error);
        }
    }
}
export const appointmentController = new AppointmentController();
//# sourceMappingURL=appointments.controller.js.map