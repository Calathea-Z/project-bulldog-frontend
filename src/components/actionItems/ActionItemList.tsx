import { ActionItem } from '@/types';
import ActionItemRow from './ActionItemRow';
import { useUpdateActionItem } from '@/hooks';

interface Props {
  items: ActionItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: ReturnType<typeof useUpdateActionItem>;
}

export default function ActionItemList({ items, onToggle, onDelete, onUpdate }: Props) {
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
