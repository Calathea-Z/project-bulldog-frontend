import { MinimalActionItem } from '@/types/api';

// Common Hook Types
export interface UseMutationResult<TData, TError, TVariables, TContext> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: TError | null;
  data: TData | undefined;
  reset: () => void;
}

// Pull to Refresh Types
export interface UsePullToRefreshReturn {
  isPulling: boolean;
  isRefreshing: boolean;
  pullPercent: number;
  offsetY: number;
}

// AI Generation Types
export interface UseAiGenerationReturn {
  aiInput: string;
  setAiInput: (input: string) => void;
  isAiLoading: boolean;
  generateTasks: () => Promise<{
    summary: string;
    actionItems: {
      text: string;
      suggestedTime: string | null;
      isDateOnly: boolean;
    }[];
  }>;
}

// AI Review Types
export interface UseAiReviewReturn {
  editableTasks: MinimalActionItem[];
  setEditableTasks: (tasks: MinimalActionItem[]) => void;
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
