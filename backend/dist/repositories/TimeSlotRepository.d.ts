export interface TimeSlotRow {
    id: number;
    doctor_id: number;
    start_time: string;
    end_time: string;
    status: string;
    created_at: string;
    updated_at: string;
}
export declare class TimeSlotRepository {
    findById(id: number): TimeSlotRow | undefined;
    findAvailableByDoctor(doctorId: number, from?: string, to?: string): TimeSlotRow[];
    findByDoctorAndDateRange(doctorId: number, from: string, to: string): TimeSlotRow[];
    /**
     * Check if a new time slot would overlap with existing non-removed slots for the same doctor.
     * Excludes a specific slot ID (for update scenarios).
     */
    checkOverlap(doctorId: number, startTime: string, endTime: string, excludeSlotId?: number): TimeSlotRow[];
    create(doctorId: number, startTime: string, endTime: string, status?: string): TimeSlotRow;
    updateStatus(id: number, status: string): void;
    updateTimes(id: number, startTime: string, endTime: string): void;
    delete(id: number): void;
}
export declare const timeSlotRepository: TimeSlotRepository;
