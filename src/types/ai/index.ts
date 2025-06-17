import { BaseActionItem } from '../common';

export type AiTaskModalMode = 'manual' | 'file';

// Minimal action item type for AI-related features
export type MinimalActionItem = Pick<BaseActionItem, 'text'> & {
  suggestedTime: string | null;
  dueAt?: string | null; // Add this line
  isDateOnly?: boolean;
};
export interface AiChunkedSummaryRequest {
  Input: string;
  UseMapReduce?: boolean;
  Model?: string;
}

export interface AiSummaryWithTasksResponse {
  summary: string;
  actionItems: MinimalActionItem[];
}
