import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGenerateAi } from '@/hooks';
import { UseAiGenerationReturn } from '@/types';

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
          dueAt: item.dueAt || null,
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
