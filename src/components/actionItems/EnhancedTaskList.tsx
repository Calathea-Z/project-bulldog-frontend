import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { ActionItemList } from '@/components';
import { FilterStatus, SortOption } from '@/types';
import { sortActionItems } from '@/utils';
import { EnhancedTaskListProps } from '@/types';
import { motion } from 'framer-motion';
import { useUserTimeZoneDisplay } from '@/hooks';

export function EnhancedTaskList({
  items,
  onToggle,
  onDelete,
  onUpdate,
  isLoading,
}: EnhancedTaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const userTimeZoneDisplay = useUserTimeZoneDisplay();

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) =>
        statusFilter === 'completed' ? item.isDone : !item.isDone,
      );
    }
    return sortActionItems(filtered, sortBy);
  }, [items, searchQuery, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-12 bg-muted animate-pulse rounded-xl" />
        <div className="h-12 bg-muted animate-pulse rounded-xl" />
        <div className="h-12 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">Status</label>
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={statusFilter === status}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-200 mb-2">Sort By</label>
            <div className="flex gap-2">
              {(['date', 'status', 'text'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  aria-pressed={sortBy === option}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    sortBy === option
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            {searchQuery || statusFilter !== 'all'
              ? 'No tasks match your filters'
              : 'No tasks yet. Create one using the AI assistant above!'}
          </div>
        ) : (
          <ActionItemList
            items={filteredAndSortedItems}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            userTimeZoneDisplay={userTimeZoneDisplay}
          />
        )}
      </div>
    </div>
  );
}
