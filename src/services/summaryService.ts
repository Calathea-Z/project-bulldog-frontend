import { api } from './apiService';
import { Summary } from '@/types/api';

export const summaryService = {
  create: (payload: {
    originalText: string;
    summaryText: string;
    actionItems: {
      text: string;
      dueAt: string | null;
      isDateOnly: boolean; // ✅ include this
    }[];
  }): Promise<Summary> => api.post('/summaries', payload).then((r) => r.data),
};
