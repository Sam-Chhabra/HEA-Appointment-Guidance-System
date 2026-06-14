import { getDb } from '../db/database.js';
import { timeSlotRepository } from '../repositories/TimeSlotRepository.js';
import { doctorRepository } from '../repositories/DoctorRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { isStartBeforeEnd, isValidDateTime } from '../utils/date.js';
export class AvailabilityService {
    /**
     * Add availability — TRANSACTIONAL.
     * Validates times, checks overlap, creates slot.
     */
    addAvailability(adminId, doctorId, startTime, endTime) {
        // Validate doctor exists
        const doctor = doctorRepository.findById(doctorId);
        if (!doctor)
            throw new NotFoundError('Doctor not found.');
        // Validate times
        if (!isValidDateTime(startTime) || !isValidDateTime(endTime)) {
            throw new ValidationError('Invalid date/time format.');
        }
        if (!isStartBeforeEnd(startTime, endTime)) {
            throw new ValidationError('Start time must be before end time.');
        }
        const db = getDb();
        const addTransaction = db.transaction(() => {
            // Check overlap
            const overlaps = timeSlotRepository.checkOverlap(doctorId, startTime, endTime);
            if (overlaps.length > 0) {
                throw new ConflictError('This availability slot conflicts with an existing slot.');
            }
            // Create slot
            const slot = timeSlotRepository.create(doctorId, startTime, endTime, 'AVAILABLE');
            // Audit log
            auditLogRepository.create(adminId, 'AVAILABILITY_ADDED', 'time_slot', slot.id, JSON.stringify({ doctorId, startTime, endTime }));
            return slot;
        });
        return addTransaction();
    }
    /**
     * Update availability — TRANSACTIONAL.
     * Rejects if slot is BOOKED.
     */
    updateAvailability(adminId, slotId, newStartTime, newEndTime) {
        // Validate times
        if (!isValidDateTime(newStartTime) || !isValidDateTime(newEndTime)) {
            throw new ValidationError('Invalid date/time format.');
        }
        if (!isStartBeforeEnd(newStartTime, newEndTime)) {
            throw new ValidationError('Start time must be before end time.');
        }
        const db = getDb();
        const updateTransaction = db.transaction(() => {
            const slot = timeSlotRepository.findById(slotId);
            if (!slot)
                throw new NotFoundError('Time slot not found.');
            if (slot.status === 'BOOKED') {
                throw new ConflictError('This availability slot cannot be updated because it has a booked appointment.');
            }
            // Check overlap excluding current slot
            const overlaps = timeSlotRepository.checkOverlap(slot.doctor_id, newStartTime, newEndTime, slotId);
            if (overlaps.length > 0) {
                throw new ConflictError('The updated slot conflicts with an existing slot.');
            }
            // Update
            timeSlotRepository.updateTimes(slotId, newStartTime, newEndTime);
            // Audit log
            auditLogRepository.create(adminId, 'AVAILABILITY_UPDATED', 'time_slot', slotId, JSON.stringify({
                oldStart: slot.start_time, oldEnd: slot.end_time,
                newStart: newStartTime, newEnd: newEndTime,
            }));
            return timeSlotRepository.findById(slotId);
        });
        return updateTransaction();
    }
    /**
     * Remove availability — TRANSACTIONAL.
     * Rejects if slot is BOOKED.
     */
    removeAvailability(adminId, slotId) {
        const db = getDb();
        const removeTransaction = db.transaction(() => {
            const slot = timeSlotRepository.findById(slotId);
            if (!slot)
                throw new NotFoundError('Time slot not found.');
            if (slot.status === 'BOOKED') {
                throw new ConflictError('This availability slot cannot be removed because it has a booked appointment.');
            }
            // Soft delete (set status to REMOVED)
            timeSlotRepository.delete(slotId);
            // Audit log
            auditLogRepository.create(adminId, 'AVAILABILITY_REMOVED', 'time_slot', slotId, JSON.stringify({ doctorId: slot.doctor_id, startTime: slot.start_time, endTime: slot.end_time }));
        });
        removeTransaction();
        return { message: 'Availability slot removed successfully.' };
    }
    getDoctorAvailability(doctorId, from, to) {
        const doctor = doctorRepository.findById(doctorId);
        if (!doctor)
            throw new NotFoundError('Doctor not found.');
        if (from && to) {
            return timeSlotRepository.findByDoctorAndDateRange(doctorId, from, to);
        }
        return timeSlotRepository.findAvailableByDoctor(doctorId, from, to);
    }
}
export const availabilityService = new AvailabilityService();
//# sourceMappingURL=AvailabilityService.js.map