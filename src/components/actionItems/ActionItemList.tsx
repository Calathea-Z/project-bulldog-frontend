import { ActionItem } from '@/types';
import { ActionItemRow } from '@/components';
import { useUpdateActionItem } from '@/hooks';
import { ActionItemListProps } from '@/types/ui';

export function ActionItemList({ items, onToggle, onDelete, onUpdate }: ActionItemListProps) {
  return (
    <ul className="space-y-2 mt-4" role="list" aria-label="Action items list">
      {items.map((item) => (
        <ActionItemRow
          key={item.id}
          item={item}
          handleToggle={onToggle}
          handleDelete={onDelete}
          updateActionItem={onUpdate}
        />
      ))}
    </ul>
  );
}
