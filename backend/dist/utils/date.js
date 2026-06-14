/**
 * Date utility helpers for validation and range checks.
 */
/**
 * Check if a date string is a valid ISO 8601 datetime.
 */
export function isValidDateTime(dateStr) {
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}
/**
 * Check if a date is in the past.
 */
export function isInPast(dateStr) {
    return new Date(dateStr) < new Date();
}
/**
 * Check if a date is in the future.
 */
export function isInFuture(dateStr) {
    return new Date(dateStr) > new Date();
}
/**
 * Check if start is before end.
 */
export function isStartBeforeEnd(start, end) {
    return new Date(start) < new Date(end);
}
/**
 * Check that a date range does not exceed maxDays (default: 90 days / ~3 months).
 */
export function isDateRangeWithinLimit(from, to, maxDays = 90) {
    const diffMs = new Date(to).getTime() - new Date(from).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= maxDays;
}
/**
 * Format a Date object to ISO string for SQLite storage.
 */
export function toISOString(date) {
    return date.toISOString();
}
/**
 * Get current datetime as ISO string.
 */
export function nowISO() {
    return new Date().toISOString();
}
//# sourceMappingURL=date.js.map