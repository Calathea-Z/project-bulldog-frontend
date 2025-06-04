export interface ActionItem {
  id: string;
  summaryId: string;
  text: string;
  isDone: boolean;
  dueAt: string | null;
}
