// hooks/ai/useGenerateAi.ts
import { useMutation } from '@tanstack/react-query';
import type { AiChunkedSummaryRequest, AiSummaryWithTasksResponse } from '@/types';
import { generateAi } from '@/services';

/**
 * React Query mutation hook for AI-based action item extraction.
 * Wraps the API call to generate summary and action items.
 */
export function useGenerateAi() {
  return useMutation<AiSummaryWithTasksResponse, Error, AiChunkedSummaryRequest>({
    mutationFn: generateAi,
  });
}
