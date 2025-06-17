import { useState } from 'react';
import { useGenerateAi } from './useGenerateAi';
import { toast } from 'react-hot-toast';
import type { MinimalActionItem } from '@/types';

interface UseAiGenerationReturn {
  aiInput: string;
  setAiInput: (input: string) => void;
  isAiLoading: boolean;
  generateTasks: () => Promise<{
    summary: string;
    actionItems: MinimalActionItem[];
  }>;
}

export function useAiGeneration(): UseAiGenerationReturn {
  const generateAi = useGenerateAi();
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateTasks = async () => {
    if (!aiInput.trim()) {
      toast.error('Please paste some notes or transcript first');
      throw new Error('Empty input');
    }

    try {
      setIsAiLoading(true);
      const response = await generateAi.mutateAsync({
        Input: aiInput,
        UseMapReduce: true,
        Model: undefined,
      });

      return {
        summary: response.summary,
        actionItems: response.actionItems.map((item) => ({
          text: item.text,
          suggestedTime: item.dueAt || item.suggestedTime || null,
          isDateOnly: item.isDateOnly ?? false,
        })),
      };
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('AI extraction failed');
      throw error;
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    aiInput,
    setAiInput,
    isAiLoading,
    generateTasks,
  };
}
