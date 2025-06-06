// hooks/useGenerateAiTasks.ts
import { useMutation } from '@tanstack/react-query';
import type { AiChunkedSummaryRequest, AiSummaryWithTasksResponse } from '@/types';
import { api } from '@/services/apiService';

export function useGenerateAi() {
  return useMutation<AiSummaryWithTasksResponse, Error, AiChunkedSummaryRequest>({
    mutationFn: async (requestBody) => {
      const { data } = await api.post<AiSummaryWithTasksResponse>(
        '/ai/generate-chunked-summary-with-action-items',
        requestBody,
      );
      return data;
    },
  });
}
