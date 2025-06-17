// Common sorting and filtering types
export type SortOption = 'date' | 'status' | 'text';
export type FilterStatus = 'all' | 'active' | 'completed';

// Base action item type that can be extended
export interface BaseActionItem {
  text: string;
  suggestedTime: string | null;
  dueAt?: string | null;
  isDateOnly?: boolean;
}
