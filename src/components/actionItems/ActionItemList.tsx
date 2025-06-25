import { AnimatePresence } from 'framer-motion';
import { MemoizedActionItemRow } from '@/components';
import { ActionItemListProps } from '@/types/ui';

interface ActionItemListWithTimezoneProps extends ActionItemListProps {
  userTimeZoneDisplay: string;
}

export function ActionItemList({
  items,
  onToggle,
  onDelete,
  onUpdate,
  userTimeZoneDisplay,
}: ActionItemListWithTimezoneProps) {
  return (
    <ul className="space-y-2 mt-4" role="list" aria-label="Action items list">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <MemoizedActionItemRow
            key={item.id}
            item={item}
            handleToggle={onToggle}
            handleDelete={onDelete}
            updateActionItem={onUpdate}
            userTimeZoneDisplay={userTimeZoneDisplay}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
