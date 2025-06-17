import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { ActionItemList } from '@/components';
import { FilterStatus, SortOption } from '@/types';
import { sortActionItems } from '@/utils';
import { EnhancedTaskListProps } from '@/types';
import { motion } from 'framer-motion';

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

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) =>
        statusFilter === 'completed' ? item.isDone : !item.isDone,
      );
    }

    // Apply sorting
    return sortActionItems(filtered, sortBy);
  }, [items, searchQuery, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-12 bg-surface animate-pulse rounded" />
        <div className="h-12 bg-surface animate-pulse rounded" />
        <div className="h-12 bg-surface animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            aria-label="Search tasks"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border border-accent bg-surface text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-0"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded border border-accent bg-surface text-text hover:bg-accent/5 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
          {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filter Options */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded border border-accent bg-surface space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text mb-2">Status</label>
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsFilterOpen(false);
                  }}
                  aria-pressed={statusFilter === status}
                  className={`px-3 py-1 rounded text-sm ${
                    statusFilter === status
                      ? 'bg-accent text-surface'
                      : 'bg-background text-text hover:bg-accent/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Sort By</label>
            <div className="flex gap-2">
              {(['date', 'status', 'text'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setIsFilterOpen(false);
                  }}
                  aria-pressed={sortBy === option}
                  className={`px-3 py-1 rounded text-sm ${
                    sortBy === option
                      ? 'bg-accent text-surface'
                      : 'bg-background text-text hover:bg-accent/10'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-8 text-text/60">
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
          />
        )}
      </div>
    </div>
  );
}
