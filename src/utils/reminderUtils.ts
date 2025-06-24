// Reminder preset options for quick selection
export const REMINDER_PRESETS = [
  { label: '10 min', value: 10 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
  { label: 'Custom...', value: 'custom' as const },
] as const;

export type ReminderPresetValue = (typeof REMINDER_PRESETS)[number]['value'];

// Default reminder time (30 minutes before due date)
export const DEFAULT_REMINDER_MINUTES = 30;

// Helper function to format reminder time for display
export const formatReminderTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
};

// Helper function to get reminder time from due date and minutes before
export const getReminderTime = (dueAt: string, minutesBefore: number): Date => {
  const dueDate = new Date(dueAt);
  return new Date(dueDate.getTime() - minutesBefore * 60 * 1000);
};

// Helper function to check if reminder should be enabled by default
export const shouldEnableReminderByDefault = (dueAt: Date | null): boolean => {
  if (!dueAt) return false;
  // Enable reminder by default if due date is in the future
  return dueAt > new Date();
};
