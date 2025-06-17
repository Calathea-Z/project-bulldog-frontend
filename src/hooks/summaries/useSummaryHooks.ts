import { useMutation, useQueryClient } from '@tanstack/react-query';
import { summaryService } from '@/services';

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
