export interface ActionItem {
  id: string;
  summaryId: string;
  text: string;
  isDone: boolean;
  dueAt: string | null;
}

export interface Summary {
  id: string;
  originalText: string;
  summaryText: string;
  createdAt: string;
  actionItems: ActionItem[];
}
