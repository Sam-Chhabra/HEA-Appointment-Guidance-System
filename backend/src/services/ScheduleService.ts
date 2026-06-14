import { doctorRepository } from '../repositories/DoctorRepository.js';
import { appointmentRepository } from '../repositories/AppointmentRepository.js';
import { timeSlotRepository } from '../repositories/TimeSlotRepository.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors.js';
import { isStartBeforeEnd, isDateRangeWithinLimit } from '../utils/date.js';

export class ScheduleService {
  /**
   * View appointments assigned to a doctor within a date range.
   * Doctor can only see their own appointments.
   */
  viewAssignedAppointments(userId: number, from?: string, to?: string) {
    const doctor = this.validateDoctorAccess(userId);

    if (from && to) {
      if (!isStartBeforeEnd(from, to)) {
        throw new ValidationError('Start date must be before end date.');
      }
      if (!isDateRangeWithinLimit(from, to)) {
        throw new ValidationError('Date range must not exceed 3 months.');
      }
    }

    return appointmentRepository.findByDoctor(doctor.id, from, to);
  }

  /**
   * View full schedule (slots + appointments) for a doctor.
   * Doctor can only see their own schedule.
   */
  viewSchedule(userId: number, from?: string, to?: string) {
    const doctor = this.validateDoctorAccess(userId);

    if (from && to) {
      if (!isStartBeforeEnd(from, to)) {
        throw new ValidationError('Start date must be before end date.');
      }
      if (!isDateRangeWithinLimit(from, to)) {
        throw new ValidationError('Date range must not exceed 3 months.');
      }
    }

    const defaultFrom = from || new Date().toISOString();
    const defaultTo = to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const slots = timeSlotRepository.findByDoctorAndDateRange(doctor.id, defaultFrom, defaultTo);
    const appointments = appointmentRepository.findByDoctor(doctor.id, defaultFrom, defaultTo);

    return {
      doctor: {
        id: doctor.id,
        fullName: doctor.full_name,
        specialization: doctor.specialization,
      },
      dateRange: { from: defaultFrom, to: defaultTo },
      slots,
      appointments,
    };
  }

  /**
   * Validate that the requesting user has a doctor profile.
   * Ensures a doctor can only access their own data.
   */
  validateDoctorAccess(userId: number) {
    const doctor = doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new ForbiddenError('You do not have a doctor profile.');
    }
    return doctor;
  }
}

export const scheduleService = new ScheduleService();
