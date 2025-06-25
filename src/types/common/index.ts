// Common sorting and filtering types
export type SortOption = 'date' | 'status' | 'text';
export type FilterStatus = 'all' | 'active' | 'completed';

// Base action item type that can be extended
export interface BaseActionItem {
  text: string;
  suggestedTime: string | null;
  dueAt?: string | null;
  isDateOnly?: boolean;
  shouldRemind?: boolean;
  reminderMinutesBeforeDue?: number | null;
}

// User and timezone types used in settings and elsewhere
export interface TimeZone {
  id: string;
  displayName: string;
  standardName: string;
  baseUtcOffset: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  timeZoneId?: string;
}
