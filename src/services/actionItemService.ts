import { api } from './apiService';
import { ActionItem } from '@/types/api';

export const actionItemService = {
  getAll: (): Promise<ActionItem[]> => api.get('/actionitems').then((r) => r.data),

  get: (id: string): Promise<ActionItem> => api.get(`/actionitems/${id}`).then((r) => r.data),

  create: (payload: { text: string; dueAt?: string | null }): Promise<ActionItem> =>
    api.post('/actionitems', payload).then((r) => r.data),

  update: (id: string, payload: Partial<ActionItem>): Promise<void> =>
    api.put(`/actionitems/${id}`, payload).then((r) => r.data),

  delete: (id: string): Promise<void> => api.delete(`/actionitems/${id}`).then((r) => r.data),

  toggleDone: (id: string): Promise<ActionItem> =>
    api.patch(`/actionitems/${id}/toggle`).then((r) => r.data),
};
