import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useCreateSummary } from '@/hooks';
import { MinimalActionItem, AiReviewReturn } from '@/types';
import { DEFAULT_REMINDER_MINUTES } from '@/utils';

export function useAiReview(): AiReviewReturn {
  const createSummary = useCreateSummary();
  const [editableTasks, setEditableTasks] = useState<MinimalActionItem[]>([]);
  const [reviewSummary, setReviewSummary] = useState('');
  const [showReview, setShowReview] = useState(false);

  const handleTaskEdit = (index: number, newText: string) => {
    const tasks = [...editableTasks];
    tasks[index].text = newText;
    setEditableTasks(tasks);
  };

  const handleTaskDelete = (index: number) => {
    setEditableTasks((tasks) => tasks.filter((_, i) => i !== index));
  };

  const handleTaskTimeEdit = (index: number, date: Date | null) => {
    const tasks = [...editableTasks];
    tasks[index].suggestedTime = date?.toISOString() || null;

    // Auto-enable reminder if due date is set and reminder isn't already configured
    if (date && !tasks[index].shouldRemind && tasks[index].reminderMinutesBeforeDue === null) {
      tasks[index].shouldRemind = true;
      tasks[index].reminderMinutesBeforeDue = DEFAULT_REMINDER_MINUTES;
    }

    setEditableTasks(tasks);
  };

  const handleTaskDateOnlyToggle = (index: number, value: boolean) => {
    const tasks = [...editableTasks];
    tasks[index].isDateOnly = value;
    setEditableTasks(tasks);
  };

  const handleTaskReminderToggle = (index: number, shouldRemind: boolean) => {
    const tasks = [...editableTasks];
    tasks[index].shouldRemind = shouldRemind;
    if (shouldRemind && tasks[index].reminderMinutesBeforeDue === null) {
      tasks[index].reminderMinutesBeforeDue = DEFAULT_REMINDER_MINUTES;
    }
    setEditableTasks(tasks);
  };

  const handleTaskReminderMinutesChange = (index: number, minutes: number | null) => {
    const tasks = [...editableTasks];
    tasks[index].reminderMinutesBeforeDue = minutes;
    setEditableTasks(tasks);
  };

  const handleConfirmSave = async (originalText: string) => {
    try {
      await createSummary.mutateAsync({
        originalText,
        summaryText: reviewSummary,
        actionItems: editableTasks.map((item) => ({
          text: item.text,
          dueAt: item.suggestedTime,
          isDateOnly: item.isDateOnly ?? false,
          shouldRemind: item.shouldRemind ?? false,
          reminderMinutesBeforeDue: item.reminderMinutesBeforeDue,
        })),
      });
      toast.success(
        `Added ${editableTasks.length} action item${editableTasks.length > 1 ? 's' : ''}`,
      );
      setShowReview(false);
    } catch (error) {
      toast.error('Failed to save summary and action items');
      throw error;
    }
  };

  return {
    editableTasks,
    setEditableTasks,
    reviewSummary,
    setReviewSummary,
    showReview,
    setShowReview,
    handleTaskEdit,
    handleTaskDelete,
    handleTaskTimeEdit,
    handleTaskDateOnlyToggle,
    handleTaskReminderToggle,
    handleTaskReminderMinutesChange,
    handleConfirmSave,
  };
}
