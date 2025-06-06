import { useMutation, useQueryClient } from '@tanstack/react-query';
import { summaryService } from '@/services';

/**
 * Custom hook for creating summaries
 *
 * This hook provides functionality to:
 * - Create new summaries using the summary service
 * - Invalidate and refresh related queries (actionItems and summaries) on successful creation
 */
export function useCreateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: summaryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
      queryClient.invalidateQueries({ queryKey: ['summaries'] });
    },
  });
}
