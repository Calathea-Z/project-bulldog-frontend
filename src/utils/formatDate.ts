export function formatDueDate(date: string | Date, options?: { dateOnly?: boolean }): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (options?.dateOnly) {
    // Avoid timezone shift: interpret the date as UTC midnight
    return d.toLocaleDateString(undefined, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
