/**
 * Time utilities for converting JavaScript dates to backend Time.Time format (nanoseconds since epoch)
 * and comparing timestamps for active/expired classification.
 */

/**
 * Convert a JavaScript Date to backend Time.Time format (nanoseconds since epoch)
 */
export function dateToTime(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}

/**
 * Convert backend Time.Time to JavaScript Date
 */
export function timeToDate(time: bigint): Date {
  return new Date(Number(time / BigInt(1_000_000)));
}

/**
 * Get the end of today (23:59:59.999) as Time.Time
 * Ensures the timestamp is not in the past
 */
export function getEndOfToday(): bigint {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  // If somehow end of day is in the past (shouldn't happen), return now + 1 hour
  if (endOfDay.getTime() < now.getTime()) {
    return dateToTime(new Date(now.getTime() + 60 * 60 * 1000));
  }
  
  return dateToTime(endOfDay);
}

/**
 * Get a timestamp approximately 48 hours in the future
 */
export function getTwoDaysFromNow(): bigint {
  const now = new Date();
  const twoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return dateToTime(twoDays);
}

/**
 * Convert a custom date to Time.Time, setting time to end of day
 */
export function customDateToTime(date: Date): bigint {
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return dateToTime(endOfDay);
}

/**
 * Check if a Time.Time timestamp is in the future (active)
 */
export function isActive(expiryTime: bigint): boolean {
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  return expiryTime > now;
}

/**
 * Format a Time.Time timestamp for display
 */
export function formatTime(time: bigint): string {
  const date = timeToDate(time);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
