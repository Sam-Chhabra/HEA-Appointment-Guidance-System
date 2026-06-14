export declare class AvailabilityService {
    /**
     * Add availability — TRANSACTIONAL.
     * Validates times, checks overlap, creates slot.
     */
    addAvailability(adminId: number, doctorId: number, startTime: string, endTime: string): import("../repositories/TimeSlotRepository.js").TimeSlotRow;
    /**
     * Update availability — TRANSACTIONAL.
     * Rejects if slot is BOOKED.
     */
    updateAvailability(adminId: number, slotId: number, newStartTime: string, newEndTime: string): import("../repositories/TimeSlotRepository.js").TimeSlotRow | undefined;
    /**
     * Remove availability — TRANSACTIONAL.
     * Rejects if slot is BOOKED.
     */
    removeAvailability(adminId: number, slotId: number): {
        message: string;
    };
    getDoctorAvailability(doctorId: number, from?: string, to?: string): import("../repositories/TimeSlotRepository.js").TimeSlotRow[];
}
export declare const availabilityService: AvailabilityService;
