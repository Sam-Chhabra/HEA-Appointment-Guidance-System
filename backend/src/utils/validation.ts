import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  email: z.string().email('Valid email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

// ============================================================
// Guidance Schemas
// ============================================================

const EMERGENCY_KEYWORDS = [
  'emergency', 'dying', 'heart attack', 'stroke', 'cannot breathe',
  'unconscious', 'severe bleeding', 'choking', 'suicide', 'overdose',
  'chest crushing', 'anaphylaxis',
];

const PURE_SYMBOLS_REGEX = /^[\d\s\W]+$/;

export const guidanceInputSchema = z.object({
  inputText: z
    .string()
    .min(5, 'Please enter more information about your symptoms or needs.')
    .max(2000, 'Input is too long. Please be more concise.')
    .refine(
      (val) => !PURE_SYMBOLS_REGEX.test(val),
      'This input could not be understood. Please rephrase using words.'
    ),
});

export function detectEmergency(inputText: string): boolean {
  const lower = inputText.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

// ============================================================
// Patient Info Schemas
// ============================================================

export const patientInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.').max(100),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  phoneNumber: z.string().min(1, 'Phone number or email is required.').max(30),
  reasonOrNeed: z.string().min(1, 'Appointment reason is required.').max(500),
});

// ============================================================
// Appointment Schemas
// ============================================================

export const bookAppointmentSchema = z.object({
  doctorId: z.number().int().positive('Doctor ID is required.'),
  timeSlotId: z.number().int().positive('Time slot ID is required.'),
  departmentId: z.number().int().positive('Department ID is required.'),
  reasonOrNeed: z.string().min(1, 'Appointment reason is required.').max(500),
  patientInfo: patientInfoSchema,
});

export const rescheduleSchema = z.object({
  newTimeSlotId: z.number().int().positive('New time slot ID is required.'),
});

// ============================================================
// Availability Schemas
// ============================================================

export const addAvailabilitySchema = z.object({
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
});

export const updateAvailabilitySchema = z.object({
  startTime: z.string().min(1, 'Start time is required.'),
  endTime: z.string().min(1, 'End time is required.'),
});

// ============================================================
// Department Override Schema
// ============================================================

export const overrideDepartmentSchema = z.object({
  departmentId: z.number().int().positive('Department ID is required.'),
});

// ============================================================
// Date Range Query Schema
// ============================================================

export const dateRangeQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

// ============================================================
// Appointment State Machine
// ============================================================

export type AppointmentStatus = 'DRAFT' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  DRAFT: ['CONFIRMED'],
  CONFIRMED: ['RESCHEDULED', 'CANCELLED', 'COMPLETED'],
  RESCHEDULED: ['RESCHEDULED', 'CANCELLED', 'COMPLETED'],
  CANCELLED: [],
  COMPLETED: [],
};

export function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================================
// Role Types
// ============================================================

export type UserRole = 'PATIENT' | 'ADMIN' | 'DOCTOR';
