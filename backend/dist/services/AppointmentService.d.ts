export declare class AppointmentService {
    /**
     * Book an appointment — TRANSACTIONAL.
     * Atomically: validate → check slot → create appointment → mark slot BOOKED → notify.
     */
    bookAppointment(patientId: number, doctorId: number, timeSlotId: number, departmentId: number, reasonOrNeed: string, patientInfo: {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
    }): import("../repositories/AppointmentRepository.js").AppointmentWithDetails | undefined;
    /**
     * Modify/reschedule an appointment — TRANSACTIONAL.
     * Atomically: release old slot → book new slot → update appointment.
     */
    modifyAppointment(appointmentId: number, newTimeSlotId: number, actorUserId: number): import("../repositories/AppointmentRepository.js").AppointmentWithDetails | undefined;
    /**
     * Cancel an appointment — TRANSACTIONAL.
     * Atomically: set status CANCELLED → release slot.
     */
    cancelAppointment(appointmentId: number, actorUserId: number): import("../repositories/AppointmentRepository.js").AppointmentWithDetails | undefined;
    viewPatientAppointments(patientId: number): import("../repositories/AppointmentRepository.js").AppointmentWithDetails[];
    viewPastAppointments(patientId: number): import("../repositories/AppointmentRepository.js").AppointmentWithDetails[];
    viewFutureAppointments(patientId: number): import("../repositories/AppointmentRepository.js").AppointmentWithDetails[];
}
export declare const appointmentService: AppointmentService;
