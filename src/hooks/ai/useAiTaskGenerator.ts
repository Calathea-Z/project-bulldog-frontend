import { useState } from 'react';
import { useGenerateAi, useCreateSummary } from '@/hooks';
import { toast } from 'react-hot-toast';
import type { ActionItem as FullActionItem } from '@/types';

type MinimalActionItem = Pick<FullActionItem, 'text'>;

interface AiTaskGeneratorReturn {
  aiInput: string;
  setAiInput: (input: string) => void;
  isAiLoading: boolean;
  reviewActionItems: MinimalActionItem[];
  reviewSummary: string;
  showReview: boolean;
  setShowReview: (show: boolean) => void;
  handleAiCreate: () => Promise<void>;
  handleConfirmSave: (approvedActionItems: MinimalActionItem[]) => Promise<void>;
}

/**
 * Custom hook for generating and managing AI tasks from text input
 *
 * This hook provides functionality to:
 * - Generate action items and summary from text input using AI
 * - Review and confirm generated tasks
 * - Save approved tasks and summary to the database
 *
 * @returns {Object} Object containing state and handlers for AI task generation
 * @property {string} aiInput - The current text input for AI processing
 * @property {Function} setAiInput - Function to update the AI input text
 * @property {boolean} isAiLoading - Loading state during AI processing
 * @property {Array<{text: string}>} reviewActionItems - Generated action items awaiting review
 * @property {string} reviewSummary - Generated summary awaiting review
 * @property {boolean} showReview - Controls visibility of review modal
 * @property {Function} setShowReview - Function to toggle review modal
 * @property {Function} handleAiCreate - Function to trigger AI task generation
 * @property {Function} handleConfirmSave - Function to save approved action items and summary
 */
export function useAiTaskGenerator(): AiTaskGeneratorReturn {
  const generateAi = useGenerateAi();
  const createSummary = useCreateSummary();

  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [reviewActionItems, setReviewActionItems] = useState<MinimalActionItem[]>([]);
  const [reviewSummary, setReviewSummary] = useState('');
  const [showReview, setShowReview] = useState(false);

  /**
   * Generates action items and summary from the input text using AI
   * Shows error toast if input is empty
   * Updates review state with generated content on success
   */
  const handleAiCreate = async () => {
    if (!aiInput.trim()) {
      toast.error('Please paste some notes or transcript first');
      return;
    }

    try {
      setIsAiLoading(true);
      const response = await generateAi.mutateAsync({
        Input: aiInput,
        UseMapReduce: true,
        Model: undefined,
      });
      setReviewSummary(response.summary);
      setReviewActionItems(response.actionItems.map((text: string) => ({ text })));
      setShowReview(true);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('AI extraction failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  /**
   * Saves approved action items and summary to the database
   * Clears input and closes review modal on success
   * Shows error toast on failure
   *
   * @param {Array<{text: string}>} approvedActionItems - Action items approved by user
   */
  const handleConfirmSave = async (approvedActionItems: MinimalActionItem[]) => {
    try {
      await createSummary.mutateAsync({
        originalText: aiInput,
        summaryText: reviewSummary,
        actionItems: approvedActionItems.map((item) => ({ text: item.text, dueAt: null })),
      });
      toast.success(
        `Added ${approvedActionItems.length} action item${approvedActionItems.length > 1 ? 's' : ''}`,
      );
      setAiInput('');
      setShowReview(false);
    } catch (error) {
      toast.error('Failed to save summary and action items');
    }
  };

  return {
    aiInput,
    setAiInput,
    isAiLoading,
    reviewActionItems,
    reviewSummary,
    showReview,
    setShowReview,
    handleAiCreate,
    handleConfirmSave,
  };
}
