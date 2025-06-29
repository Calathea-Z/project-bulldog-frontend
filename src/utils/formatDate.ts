import { getUserTimeZoneId } from './timezone';
import { useEffect, useState } from 'react';

/**
 * SSR-safe date formatting: always uses UTC on the server, uses user timezone on the client.
 */
export function formatDateInUserTimezone(
  utcDateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!utcDateString) return 'No due date';
  let timeZone = 'UTC';
  if (typeof window !== 'undefined') {
    try {
      timeZone = getUserTimeZoneId();
    } catch {}
  }
  try {
    const utcDate = new Date(utcDateString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      ...options,
    }).format(utcDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Client-only hook for timezone-aware formatting (hydration-safe)
 */
export function useFormatDateInUserTimezone(
  utcDateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const [formatted, setFormatted] = useState('...');
  useEffect(() => {
    if (!utcDateString) {
      setFormatted('No due date');
      return;
    }
    try {
      const timeZone = getUserTimeZoneId();
      const utcDate = new Date(utcDateString);
      setFormatted(
        new Intl.DateTimeFormat('en-US', {
          timeZone,
          ...options,
        }).format(utcDate),
      );
    } catch {
      setFormatted('Invalid date');
    }
  }, [utcDateString, JSON.stringify(options)]);
  return formatted;
}

/**
 * Format a date for display in the user's timezone
 * @param utcDateString - UTC date string from the API
 * @returns Formatted date string
 */
export function formatDate(utcDateString: string | null | undefined): string {
  return formatDateInUserTimezone(utcDateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date for display (date only, no time)
 * @param utcDateString - UTC date string from the API
 * @returns Formatted date string
 */
export function formatDateOnly(utcDateString: string | null | undefined): string {
  return formatDateInUserTimezone(utcDateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Convert a local date to UTC for sending to the backend
 * @param localDate - Local date object
 * @returns UTC date string
 */
export function convertLocalToUTC(localDate: Date): string {
  return localDate.toISOString();
}

/**
 * Convert a UTC date string to a local Date object
 * @param utcDateString - UTC date string from the API
 * @returns Local Date object
 */
export function convertUTCToLocal(utcDateString: string | null | undefined): Date | null {
  if (!utcDateString) return null;
  try {
    let timeZone = 'UTC';
    if (typeof window !== 'undefined') {
      timeZone = getUserTimeZoneId();
    }
    const utcDate = new Date(utcDateString);
    const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone }));
    return localDate;
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return null;
  }
}

/**
 * Format a due date (backward compatibility)
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDueDate(date: string | Date, options?: { dateOnly?: boolean }): string {
  const dateString = typeof date === 'string' ? date : date.toISOString();

  if (options?.dateOnly) {
    return formatDateOnly(dateString);
  }

  return formatDate(dateString);
}

/**
 * Format reminder time in a human-readable way
 * @param minutesBeforeDue - Minutes before due date
 * @returns Formatted reminder time string
 */
export function formatReminderTime(minutesBeforeDue: number): string {
  if (minutesBeforeDue < 60) {
    return `${minutesBeforeDue}m before`;
  } else if (minutesBeforeDue < 1440) {
    const hours = Math.floor(minutesBeforeDue / 60);
    return `${hours}h before`;
  } else {
    const days = Math.floor(minutesBeforeDue / 1440);
    return `${days}d before`;
  }
}

/**
 * Normalize a date to minute precision for comparison
 * This removes seconds and milliseconds to avoid millisecond-level comparison issues
 * @param date - Date to normalize
 * @returns Normalized date with seconds and milliseconds set to 0
 */
export function normalizeDateForComparison(date: Date): Date {
  const normalized = new Date(date);
  normalized.setSeconds(0, 0);
  return normalized;
}

/**
 * Normalize a date string for comparison by removing milliseconds
 * This ensures consistent comparison between dates that may have different millisecond precision
 * @param dateString - Date string to normalize
 * @returns Normalized date string with milliseconds removed, or null if input is null
 */
export function normalizeDateString(dateString: string | null): string | null {
  if (!dateString) return null;
  return dateString.replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Check if a task is overdue by comparing normalized dates
 * @param dueAt - Due date string from the API
 * @param isDone - Whether the task is completed
 * @returns True if the task is overdue
 */
export function isTaskOverdue(dueAt: string | null | undefined, isDone: boolean): boolean {
  if (!dueAt || isDone) return false;

  const dueDate = new Date(dueAt);
  const now = new Date();

  // Normalize both dates to minute precision for fair comparison
  const normalizedDueDate = normalizeDateForComparison(dueDate);
  const normalizedNow = normalizeDateForComparison(now);

  return normalizedDueDate < normalizedNow;
}
