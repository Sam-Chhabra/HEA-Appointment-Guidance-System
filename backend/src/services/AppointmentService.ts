import { getDb } from '../db/database.js';
import { appointmentRepository } from '../repositories/AppointmentRepository.js';
import { timeSlotRepository } from '../repositories/TimeSlotRepository.js';
import { notificationRepository } from '../repositories/NotificationRepository.js';
import { auditLogRepository } from '../repositories/AuditLogRepository.js';
import { doctorRepository } from '../repositories/DoctorRepository.js';
import { departmentRepository } from '../repositories/DepartmentRepository.js';
import {
  ValidationError, ConflictError, NotFoundError, ForbiddenError,
} from '../utils/errors.js';
import { isValidTransition, type AppointmentStatus } from '../utils/validation.js';
import { isInPast } from '../utils/date.js';

const formatDateTime = (isoString?: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

export class AppointmentService {
  /**
   * Book an appointment - TRANSACTIONAL.
   * Atomically: validate → check slot → create appointment → mark slot BOOKED → notify.
   */
  bookAppointment(
    patientId: number,
    doctorId: number,
    timeSlotId: number,
    departmentId: number,
    reasonOrNeed: string,
    patientInfo: { fullName: string; dateOfBirth: string; phoneNumber: string }
  ) {
    const db = getDb();

    // Validate doctor exists
    const doctor = doctorRepository.findById(doctorId);
    if (!doctor) throw new NotFoundError('Doctor not found.');

    // Validate department exists
    const department = departmentRepository.findById(departmentId);
    if (!department) throw new NotFoundError('Department not found.');

    // Update patient profile with provided info
    db.prepare(`
      UPDATE patient_profiles
      SET full_name = ?, date_of_birth = ?, phone_number = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `).run(patientInfo.fullName, patientInfo.dateOfBirth, patientInfo.phoneNumber, patientId);

    const bookTransaction = db.transaction(() => {
      // Re-check slot availability inside the transaction
      const slot = timeSlotRepository.findById(timeSlotId);
      if (!slot) throw new NotFoundError('Time slot not found.');
      if (slot.status !== 'AVAILABLE') {
        throw new ConflictError('This slot is no longer available. Please choose another slot.');
      }
      if (slot.doctor_id !== doctorId) {
        throw new ValidationError('Time slot does not belong to the selected doctor.');
      }

      // Check slot is not in the past
      if (isInPast(slot.start_time)) {
        throw new ValidationError('Cannot book a time slot in the past.');
      }

      // Check for existing active appointment on this slot
      const existingAppt = appointmentRepository.findByTimeSlot(timeSlotId);
      if (existingAppt) {
        throw new ConflictError('This slot is no longer available. Please choose another slot.');
      }

      // Create appointment (CONFIRMED)
      const appointment = appointmentRepository.create(
        patientId, doctorId, timeSlotId, departmentId, reasonOrNeed, 'CONFIRMED'
      );

      // Mark slot as BOOKED
      timeSlotRepository.updateStatus(timeSlotId, 'BOOKED');

      // Audit log
      auditLogRepository.create(
        patientId,
        'APPOINTMENT_BOOKED',
        'appointment',
        appointment.id,
        JSON.stringify({ doctorId, timeSlotId, departmentId })
      );

      return appointment;
    });

    const appointment = bookTransaction();

    // Create notification (outside transaction - failure must not invalidate booking)
    try {
      const apptDetails = appointmentRepository.findByIdWithDetails(appointment.id);
      notificationRepository.create(
        patientId,
        'CONFIRMATION',
        `Your appointment with Dr. ${apptDetails?.doctor_name} on ${formatDateTime(apptDetails?.slot_start_time)} has been confirmed.`,
        appointment.id
      );
      console.log(`[NOTIFICATION] Appointment confirmation sent to patient ${patientId} for appointment ${appointment.id}`);
    } catch (err) {
      console.error(`[NOTIFICATION FAILED] Could not create confirmation notification for appointment ${appointment.id}`, err);
    }

    return appointmentRepository.findByIdWithDetails(appointment.id);
  }

  /**
   * Modify/reschedule an appointment - TRANSACTIONAL.
   * Atomically: release old slot → book new slot → update appointment.
   */
  modifyAppointment(appointmentId: number, newTimeSlotId: number, actorUserId: number) {
    const db = getDb();

    const appointment = appointmentRepository.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment not found.');

    // Ownership check
    if (appointment.patient_id !== actorUserId) {
      throw new ForbiddenError('You can only modify your own appointments.');
    }

    // Check current status allows rescheduling
    const currentStatus = appointment.status as AppointmentStatus;
    if (!isValidTransition(currentStatus, 'RESCHEDULED')) {
      throw new ValidationError(`Cannot reschedule an appointment with status "${currentStatus}".`);
    }

    // Check the appointment is in the future
    const currentSlot = timeSlotRepository.findById(appointment.time_slot_id);
    if (currentSlot && isInPast(currentSlot.start_time)) {
      throw new ValidationError('Cannot modify a past appointment.');
    }

    const rescheduleTransaction = db.transaction(() => {
      // Check new slot
      const newSlot = timeSlotRepository.findById(newTimeSlotId);
      if (!newSlot) throw new NotFoundError('New time slot not found.');
      if (newSlot.status !== 'AVAILABLE') {
        throw new ConflictError('The selected slot is no longer available. Please choose another.');
      }
      if (newSlot.doctor_id !== appointment.doctor_id) {
        throw new ValidationError('New slot must belong to the same doctor.');
      }
      if (isInPast(newSlot.start_time)) {
        throw new ValidationError('Cannot reschedule to a past time slot.');
      }

      // Release old slot
      timeSlotRepository.updateStatus(appointment.time_slot_id, 'AVAILABLE');

      // Book new slot
      timeSlotRepository.updateStatus(newTimeSlotId, 'BOOKED');

      // Update appointment
      appointmentRepository.updateTimeSlot(appointmentId, newTimeSlotId, 'RESCHEDULED');

      // Audit log
      auditLogRepository.create(
        actorUserId,
        'APPOINTMENT_RESCHEDULED',
        'appointment',
        appointmentId,
        JSON.stringify({ oldSlotId: appointment.time_slot_id, newSlotId: newTimeSlotId })
      );
    });

    rescheduleTransaction();

    // Notification (outside transaction)
    try {
      const apptDetails = appointmentRepository.findByIdWithDetails(appointmentId);
      notificationRepository.create(
        actorUserId,
        'UPDATE',
        `Your appointment has been rescheduled to ${formatDateTime(apptDetails?.slot_start_time)}.`,
        appointmentId
      );
      console.log(`[NOTIFICATION] Reschedule notification sent for appointment ${appointmentId}`);
    } catch (err) {
      console.error(`[NOTIFICATION FAILED] Reschedule notification failed for appointment ${appointmentId}`, err);
    }

    return appointmentRepository.findByIdWithDetails(appointmentId);
  }

  /**
   * Cancel an appointment - TRANSACTIONAL.
   * Atomically: set status CANCELLED → release slot.
   */
  cancelAppointment(appointmentId: number, actorUserId: number) {
    const db = getDb();

    const appointment = appointmentRepository.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment not found.');

    // Ownership check
    if (appointment.patient_id !== actorUserId) {
      throw new ForbiddenError('You can only cancel your own appointments.');
    }

    // Check current status allows cancellation
    const currentStatus = appointment.status as AppointmentStatus;
    if (!isValidTransition(currentStatus, 'CANCELLED')) {
      throw new ValidationError(`Cannot cancel an appointment with status "${currentStatus}".`);
    }

    // Check future
    const slot = timeSlotRepository.findById(appointment.time_slot_id);
    if (slot && isInPast(slot.start_time)) {
      throw new ValidationError('Cannot cancel a past appointment.');
    }

    const cancelTransaction = db.transaction(() => {
      appointmentRepository.updateStatus(appointmentId, 'CANCELLED');
      timeSlotRepository.updateStatus(appointment.time_slot_id, 'AVAILABLE');

      auditLogRepository.create(
        actorUserId,
        'APPOINTMENT_CANCELLED',
        'appointment',
        appointmentId,
        JSON.stringify({ timeSlotId: appointment.time_slot_id })
      );
    });

    cancelTransaction();

    // Notification
    try {
      notificationRepository.create(
        actorUserId,
        'CANCELLATION',
        `Your appointment has been cancelled.`,
        appointmentId
      );
      console.log(`[NOTIFICATION] Cancellation notification sent for appointment ${appointmentId}`);
    } catch (err) {
      console.error(`[NOTIFICATION FAILED] Cancellation notification failed for appointment ${appointmentId}`, err);
    }

    return appointmentRepository.findByIdWithDetails(appointmentId);
  }

  viewPatientAppointments(patientId: number) {
    return appointmentRepository.findByPatient(patientId);
  }

  viewPastAppointments(patientId: number) {
    return appointmentRepository.findPastByPatient(patientId);
  }

  viewFutureAppointments(patientId: number) {
    return appointmentRepository.findFutureByPatient(patientId);
  }
}

export const appointmentService = new AppointmentService();
