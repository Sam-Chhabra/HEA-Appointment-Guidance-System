/**
 * Date utility helpers for validation and range checks.
 */
/**
 * Check if a date string is a valid ISO 8601 datetime.
 */
export declare function isValidDateTime(dateStr: string): boolean;
/**
 * Check if a date is in the past.
 */
export declare function isInPast(dateStr: string): boolean;
/**
 * Check if a date is in the future.
 */
export declare function isInFuture(dateStr: string): boolean;
/**
 * Check if start is before end.
 */
export declare function isStartBeforeEnd(start: string, end: string): boolean;
/**
 * Check that a date range does not exceed maxDays (default: 90 days / ~3 months).
 */
export declare function isDateRangeWithinLimit(from: string, to: string, maxDays?: number): boolean;
/**
 * Format a Date object to ISO string for SQLite storage.
 */
export declare function toISOString(date: Date): string;
/**
 * Get current datetime as ISO string.
 */
export declare function nowISO(): string;
