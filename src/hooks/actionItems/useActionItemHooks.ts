import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actionItemService } from '@/services';
import { ActionItem } from '@/types/api';

/**
 * Hook to fetch all action items
 */
export function useActionItems() {
  return useQuery({
    queryKey: ['actionItems'],
    queryFn: actionItemService.getAll,
    refetchOnWindowFocus: false, // 🛑 prevent refetch loops
    retry: false, // 🛑 prevent auto-retry (optional)
    staleTime: 1000 * 60 * 5, // ✅ data is "fresh" for 5 minutes
  });
}

/**
 * Hook to fetch a single action item by ID
 */
export function useActionItem(id: string) {
  return useQuery({
    queryKey: ['actionItem', id],
    queryFn: () => actionItemService.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new action item
 */
export function useCreateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionItemService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}

/**
 * Hook to update an action item
 */
export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ActionItem> }) =>
      actionItemService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['actionItem', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}

/**
 * Hook to delete an action item
 */
export function useDeleteActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionItemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}

/**
 * Hook to toggle an action item's done status
 */
export function useToggleActionItemDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionItemService.toggleDone,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['actionItem', id] });
      queryClient.invalidateQueries({ queryKey: ['actionItems'] });
    },
  });
}
