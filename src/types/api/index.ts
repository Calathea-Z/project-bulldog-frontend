export interface MinimalActionItem {
  text: string;
  suggestedTime: string | null;
  dueAt: string | null;
  isDateOnly: boolean;
  shouldRemind?: boolean;
  reminderMinutesBeforeDue?: number | null;
}

export interface ActionItem {
  id: string;
  summaryId: string;
  text: string;
  isDone: boolean;
  dueAt: string | null;
  isDateOnly: boolean;
  shouldRemind: boolean;
  reminderMinutesBeforeDue: number | null;
}

export interface Summary {
  id: string;
  originalText: string;
  summaryText: string;
  createdAt: string;
  actionItems: ActionItem[];
}

export interface Reminder {
  id: string;
  message: string;
  reminderTime: string;
  isSent: boolean;
  actionItemId: string | null;
}
