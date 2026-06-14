import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
}, {
    name: string;
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const guidanceInputSchema: z.ZodObject<{
    inputText: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    inputText: string;
}, {
    inputText: string;
}>;
export declare function detectEmergency(inputText: string): boolean;
export declare const patientInfoSchema: z.ZodObject<{
    fullName: z.ZodString;
    dateOfBirth: z.ZodString;
    phoneNumber: z.ZodString;
    reasonOrNeed: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    reasonOrNeed: string;
}, {
    fullName: string;
    dateOfBirth: string;
    phoneNumber: string;
    reasonOrNeed: string;
}>;
export declare const bookAppointmentSchema: z.ZodObject<{
    doctorId: z.ZodNumber;
    timeSlotId: z.ZodNumber;
    departmentId: z.ZodNumber;
    reasonOrNeed: z.ZodString;
    patientInfo: z.ZodObject<{
        fullName: z.ZodString;
        dateOfBirth: z.ZodString;
        phoneNumber: z.ZodString;
        reasonOrNeed: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
        reasonOrNeed: string;
    }, {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
        reasonOrNeed: string;
    }>;
}, "strip", z.ZodTypeAny, {
    reasonOrNeed: string;
    doctorId: number;
    timeSlotId: number;
    departmentId: number;
    patientInfo: {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
        reasonOrNeed: string;
    };
}, {
    reasonOrNeed: string;
    doctorId: number;
    timeSlotId: number;
    departmentId: number;
    patientInfo: {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
        reasonOrNeed: string;
    };
}>;
export declare const rescheduleSchema: z.ZodObject<{
    newTimeSlotId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    newTimeSlotId: number;
}, {
    newTimeSlotId: number;
}>;
export declare const addAvailabilitySchema: z.ZodObject<{
    startTime: z.ZodString;
    endTime: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    endTime: string;
}, {
    startTime: string;
    endTime: string;
}>;
export declare const updateAvailabilitySchema: z.ZodObject<{
    startTime: z.ZodString;
    endTime: z.ZodString;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    endTime: string;
}, {
    startTime: string;
    endTime: string;
}>;
export declare const overrideDepartmentSchema: z.ZodObject<{
    departmentId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    departmentId: number;
}, {
    departmentId: number;
}>;
export declare const dateRangeQuerySchema: z.ZodObject<{
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    from?: string | undefined;
    to?: string | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
}>;
export type AppointmentStatus = 'DRAFT' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';
export declare function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean;
export type UserRole = 'PATIENT' | 'ADMIN' | 'DOCTOR';
