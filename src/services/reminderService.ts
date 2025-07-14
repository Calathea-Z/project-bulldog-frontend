import { api } from '@/services';
import { Reminder } from '@/types';

export const reminderService = {
  getAll: (): Promise<Reminder[]> => api.get('/reminders').then((r) => r.data),

  get: (id: string): Promise<Reminder> => api.get(`/reminders/${id}`).then((r) => r.data),

  create: (payload: {
    message: string;
    reminderTime: string;
    actionItemId?: string | null;
  }): Promise<Reminder> => api.post('/reminders', payload).then((r) => r.data),

  update: (id: string, payload: Partial<Reminder>): Promise<void> =>
    api.put(`/reminders/${id}`, payload).then((r) => r.data),

  delete: (id: string): Promise<void> => api.delete(`/reminders/${id}`).then((r) => r.data),
};
