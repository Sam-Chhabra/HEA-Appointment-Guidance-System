export interface AppointmentRow {
    id: number;
    patient_id: number;
    doctor_id: number;
    time_slot_id: number;
    department_id: number;
    status: string;
    reason_or_need: string | null;
    created_at: string;
    updated_at: string;
}
export interface AppointmentWithDetails extends AppointmentRow {
    doctor_name: string;
    department_name: string;
    slot_start_time: string;
    slot_end_time: string;
    patient_name?: string;
}
export declare class AppointmentRepository {
    findById(id: number): AppointmentRow | undefined;
    findByIdWithDetails(id: number): AppointmentWithDetails | undefined;
    findByPatient(patientId: number): AppointmentWithDetails[];
    findPastByPatient(patientId: number): AppointmentWithDetails[];
    findFutureByPatient(patientId: number): AppointmentWithDetails[];
    findByDoctor(doctorId: number, from?: string, to?: string): AppointmentWithDetails[];
    findByTimeSlot(timeSlotId: number): AppointmentRow | undefined;
    create(patientId: number, doctorId: number, timeSlotId: number, departmentId: number, reasonOrNeed: string, status?: string): AppointmentRow;
    updateStatus(id: number, status: string): void;
    updateTimeSlot(id: number, newTimeSlotId: number, status: string): void;
}
export declare const appointmentRepository: AppointmentRepository;
