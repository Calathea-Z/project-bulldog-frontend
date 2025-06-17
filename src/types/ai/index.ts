import { Summary } from '../api';

export interface AiChunkedSummaryRequest {
  Input: string;
  UseMapReduce?: boolean; // optional, defaults to true on backend
  Model?: string; // optional model override
}

export interface AiSummaryWithTasksResponse {
  summary: string;
  actionItems: ActionItemWithTime[];
}

export interface ActionItemWithTime {
  text: string;
  suggestedTime: string | null;
  dueAt?: string | null;
  isDateOnly?: boolean;
}
