/**
 * Converts a JS Date to a UTC-based Date object at midnight (00:00) UTC.
 * This avoids timezone drift when saving all-day dates.
 */
export function convertToUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
