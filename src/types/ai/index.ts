import { BaseActionItem } from '../common';
import type { MinimalActionItem as ApiMinimalActionItem } from '../api';

export type AiTaskModalMode = 'manual' | 'file';

// Minimal action item type for AI-related features
export type MinimalActionItem = Pick<BaseActionItem, 'text'> & {
  suggestedTime: string | null;
  dueAt?: string | null;
  isDateOnly?: boolean;
};
export interface AiChunkedSummaryRequest {
  Input: string;
  UseMapReduce?: boolean;
  Model?: string;
}

export interface AiSummaryWithTasksResponse {
  summary: string;
  actionItems: {
    text: string;
    dueAt?: string;
    suggestedTime?: string;
    isDateOnly?: boolean;
  }[];
}

// AI Generation Types
export interface UseAiGenerationReturn {
  aiInput: string;
  setAiInput: (input: string) => void;
  isAiLoading: boolean;
  generateTasks: () => Promise<{
    summary: string;
    actionItems: ApiMinimalActionItem[];
  }>;
}

// AI Review Types
export interface UseAiReviewReturn {
  editableTasks: ApiMinimalActionItem[];
  setEditableTasks: (tasks: ApiMinimalActionItem[]) => void;
  reviewSummary: string;
  setReviewSummary: (summary: string) => void;
  showReview: boolean;
  setShowReview: (show: boolean) => void;
  handleTaskEdit: (index: number, newText: string) => void;
  handleTaskDelete: (index: number) => void;
  handleTaskTimeEdit: (index: number, date: Date | null) => void;
  handleTaskDateOnlyToggle: (index: number, value: boolean) => void;
  handleConfirmSave: (originalText: string) => Promise<void>;
}
// AI Task Modal Types
export interface AiTaskModalProps {
  open: boolean;
  onClose: () => void;
  mode: AiTaskModalMode;
}

export interface AiSuggestionsProps {
  lastSummary?: string;
  timeSensitiveTasks?: number;
}
