export function formatDueDate(date: string | Date, options?: { dateOnly?: boolean }) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return options?.dateOnly
    ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}
