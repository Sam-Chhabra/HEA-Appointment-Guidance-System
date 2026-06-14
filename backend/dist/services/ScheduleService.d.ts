export declare class ScheduleService {
    /**
     * View appointments assigned to a doctor within a date range.
     * Doctor can only see their own appointments.
     */
    viewAssignedAppointments(userId: number, from?: string, to?: string): import("../repositories/AppointmentRepository.js").AppointmentWithDetails[];
    /**
     * View full schedule (slots + appointments) for a doctor.
     * Doctor can only see their own schedule.
     */
    viewSchedule(userId: number, from?: string, to?: string): {
        doctor: {
            id: number;
            fullName: string;
            specialization: string | null;
        };
        dateRange: {
            from: string;
            to: string;
        };
        slots: import("../repositories/TimeSlotRepository.js").TimeSlotRow[];
        appointments: import("../repositories/AppointmentRepository.js").AppointmentWithDetails[];
    };
    /**
     * Validate that the requesting user has a doctor profile.
     * Ensures a doctor can only access their own data.
     */
    validateDoctorAccess(userId: number): import("../repositories/DoctorRepository.js").DoctorProfileRow;
}
export declare const scheduleService: ScheduleService;
