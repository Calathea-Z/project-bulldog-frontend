export interface MinimalActionItem {
  text: string;
  suggestedTime: string | null;
  dueAt: string | null;
  isDateOnly: boolean;
}

export interface ActionItem {
  id: string;
  summaryId: string;
  text: string;
  isDone: boolean;
  dueAt: string | null;
  isDateOnly: boolean;
}

export interface Summary {
  id: string;
  originalText: string;
  summaryText: string;
  createdAt: string;
  actionItems: ActionItem[];
}
