import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services';
import { Reminder } from '@/types';

// Centralized query keys
export const reminderKeys = {
  all: ['reminders'] as const,
  single: (id: string) => ['reminder', id] as const,
} as const;

/**
 * Hook to fetch all reminders
 */
export function useReminders() {
  return useQuery({
    queryKey: reminderKeys.all,
    queryFn: reminderService.getAll,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // data is "fresh" for 5 minutes
  });
}

/**
 * Hook to fetch a single reminder by ID
 */
export function useReminder(id: string) {
  return useQuery({
    queryKey: reminderKeys.single(id),
    queryFn: () => reminderService.get(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reminderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

/**
 * Hook to update a reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Reminder> }) =>
      reminderService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

/**
 * Hook to delete a reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reminderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}
