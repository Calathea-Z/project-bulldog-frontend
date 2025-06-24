import { api } from '@/services';
import { Summary } from '@/types';

export const summaryService = {
  create: (payload: {
    originalText: string;
    summaryText: string;
    actionItems: {
      text: string;
      dueAt: string | null;
      isDateOnly: boolean; // ✅ include this
      shouldRemind?: boolean;
      reminderMinutesBeforeDue?: number | null;
    }[];
  }): Promise<Summary> => api.post('/summaries', payload).then((r) => r.data),
};
