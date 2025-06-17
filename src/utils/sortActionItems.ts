import { ActionItem, SortOption } from '@/types';

export function sortActionItems(items: ActionItem[], sortBy: SortOption = 'date'): ActionItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        // Sort by due date, with items without dates at the end
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();

      case 'status':
        // Sort by completion status, then by date
        if (a.isDone === b.isDone) {
          if (!a.dueAt && !b.dueAt) return 0;
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        }
        return a.isDone ? 1 : -1;

      case 'text':
        // Sort alphabetically by text
        return a.text.localeCompare(b.text);

      default:
        return 0;
    }
  });
}
