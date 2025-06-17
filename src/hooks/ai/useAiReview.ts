import { useState } from 'react';
import { useCreateSummary } from '@/hooks';
import { toast } from 'react-hot-toast';
import type { MinimalActionItem } from '@/types';

interface UseAiReviewReturn {
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

export function useAiReview(): UseAiReviewReturn {
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
    setEditableTasks(tasks);
  };

  const handleTaskDateOnlyToggle = (index: number, value: boolean) => {
    const tasks = [...editableTasks];
    tasks[index].isDateOnly = value;
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
    handleConfirmSave,
  };
}
