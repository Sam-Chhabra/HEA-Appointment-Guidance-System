/**
 * Date utility helpers for validation and range checks.
 */

/**
 * Check if a date string is a valid ISO 8601 datetime.
 */
export function isValidDateTime(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Check if a date is in the past.
 */
export function isInPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

/**
 * Check if a date is in the future.
 */
export function isInFuture(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

/**
 * Check if start is before end.
 */
export function isStartBeforeEnd(start: string, end: string): boolean {
  return new Date(start) < new Date(end);
}

/**
 * Check that a date range does not exceed maxDays (default: 90 days / ~3 months).
 */
export function isDateRangeWithinLimit(from: string, to: string, maxDays = 90): boolean {
  const diffMs = new Date(to).getTime() - new Date(from).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= maxDays;
}

/**
 * Format a Date object to ISO string for SQLite storage.
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Get current datetime as ISO string.
 */
export function nowISO(): string {
  return new Date().toISOString();
}
