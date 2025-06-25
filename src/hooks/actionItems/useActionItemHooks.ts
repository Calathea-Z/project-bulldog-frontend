import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { actionItemService } from '@/services';
import { ActionItem } from '@/types/api';

// Centralized query keys
export const actionItemKeys = {
  all: ['actionItems'] as const,
  single: (id: string) => ['actionItem', id] as const,
} as const;

/**
 * Hook to fetch all action items
 */
export function useActionItems() {
  return useQuery({
    queryKey: actionItemKeys.all,
    queryFn: actionItemService.getAll,
    refetchOnWindowFocus: false, //prevent refetch loops
    retry: false, //prevent auto-retry (optional)
    staleTime: 1000 * 60 * 5, //data is "fresh" for 5 minutes
  });
}

/**
 * Hook to fetch a single action item by ID
 */
export function useActionItem(id: string) {
  return useQuery({
    queryKey: actionItemKeys.single(id),
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
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
    },
  });
}

/**
 * Hook to update an action item with optimistic updates
 */
export function useUpdateActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ActionItem> }) =>
      actionItemService.update(id, payload),
    onMutate: async ({ id, payload }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: actionItemKeys.all });
      await queryClient.cancelQueries({ queryKey: actionItemKeys.single(id) });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ActionItem[]>(actionItemKeys.all);
      const previousItem = queryClient.getQueryData<ActionItem>(actionItemKeys.single(id));

      // Optimistically update the action items list
      if (previousItems) {
        queryClient.setQueryData<ActionItem[]>(actionItemKeys.all, (old) => {
          if (!old) return old;
          return old.map((item) => (item.id === id ? { ...item, ...payload } : item));
        });
      }

      // Optimistically update the individual action item
      if (previousItem) {
        queryClient.setQueryData<ActionItem>(actionItemKeys.single(id), (old) => {
          if (!old) return old;
          return { ...old, ...payload };
        });
      }

      // Return a context object with the snapshotted value
      return { previousItems, previousItem };
    },
    onError: (_err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        queryClient.setQueryData(actionItemKeys.all, context.previousItems);
      }
      if (context?.previousItem) {
        queryClient.setQueryData(actionItemKeys.single(id), context.previousItem);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
      queryClient.invalidateQueries({ queryKey: actionItemKeys.single(id) });
    },
  });
}

/**
 * Hook to delete an action item with optimistic updates
 */
export function useDeleteActionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionItemService.delete,
    onMutate: async (id) => {
      // Cancel any outgoing re-fetches
      await queryClient.cancelQueries({ queryKey: actionItemKeys.all });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ActionItem[]>(actionItemKeys.all);

      // Optimistically remove the item
      if (previousItems) {
        queryClient.setQueryData<ActionItem[]>(actionItemKeys.all, (old) => {
          if (!old) return old;
          return old.filter((item) => item.id !== id);
        });
      }

      // Return a context object with the snapshotted value
      return { previousItems };
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        queryClient.setQueryData(actionItemKeys.all, context.previousItems);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
    },
  });
}

/**
 * Hook to toggle an action item's done status with optimistic updates
 */
export function useToggleActionItemDone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actionItemService.toggleDone,
    onMutate: async (id) => {
      // Cancel any outgoing re-fetches
      await queryClient.cancelQueries({ queryKey: actionItemKeys.all });
      await queryClient.cancelQueries({ queryKey: actionItemKeys.single(id) });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<ActionItem[]>(actionItemKeys.all);
      const previousItem = queryClient.getQueryData<ActionItem>(actionItemKeys.single(id));

      // Optimistically toggle the done status
      if (previousItems) {
        queryClient.setQueryData<ActionItem[]>(actionItemKeys.all, (old) => {
          if (!old) return old;
          return old.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item));
        });
      }

      if (previousItem) {
        queryClient.setQueryData<ActionItem>(actionItemKeys.single(id), (old) => {
          if (!old) return old;
          return { ...old, isDone: !old.isDone };
        });
      }

      // Return a context object with the snapshotted value
      return { previousItems, previousItem };
    },
    onError: (_err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        queryClient.setQueryData(actionItemKeys.all, context.previousItems);
      }
      if (context?.previousItem) {
        queryClient.setQueryData(actionItemKeys.single(id), context.previousItem);
      }
    },
    onSettled: (_data, _error, id) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: actionItemKeys.all });
      queryClient.invalidateQueries({ queryKey: actionItemKeys.single(id) });
    },
  });
}

/**
 * Hook for debounced text editing with validation
 * @param initialText - Initial text value
 * @param onSave - Callback to save the text
 * @param debounceMs - Debounce delay in milliseconds (default: 500ms)
 * @returns Object with text state and handlers
 */
export function useDebouncedTextEdit(
  initialText: string,
  onSave: (text: string) => void,
  debounceMs: number = 500,
) {
  const [text, setText] = useState(initialText);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // Update local text when initial text changes
  useEffect(() => {
    setText(initialText);
    setIsDirty(false);
  }, [initialText]);

  // Debounced save effect
  useEffect(() => {
    if (!isDirty || !isValid) return;

    const timeoutId = setTimeout(() => {
      onSave(text);
      setIsDirty(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [text, isDirty, isValid, onSave, debounceMs]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setIsDirty(true);

    // Validate text
    const valid = newText.trim().length > 0;
    setIsValid(valid);
  }, []);

  const handleSave = useCallback(() => {
    if (!isValid) return;
    onSave(text);
    setIsDirty(false);
  }, [text, isValid, onSave]);

  return {
    text,
    isValid,
    isDirty,
    handleTextChange,
    handleSave,
  };
}
