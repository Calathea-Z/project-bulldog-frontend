'use client';

import React, { useState, Fragment, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Bell } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useActionItems, useCreateActionItem } from '@/hooks';
import { cn, getMutationErrorMessage } from '@/utils';
import { NewManualTaskModal } from '../../../components/dashboard/NewManualTaskModal';
import { toast } from 'react-hot-toast';

export default function CalendarPage() {
  // ── State & Hooks ───────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalDate, setTaskModalDate] = useState<Date | null>(null);
  const [showReminderCountBadge, setShowReminderCountBadge] = useState(false);

  const { data: actionItems = [], isLoading } = useActionItems();
  const createActionItemMutation = useCreateActionItem();

  useEffect(() => {
    const stored = localStorage.getItem('showReminderCountBadge');
    setShowReminderCountBadge(stored === 'true');
  }, []);

  // ── Build & Filter Events ───────────────────────────────────────────────────
  const filteredActionItems = actionItems;

  // ── Calendar Grid Logic ─────────────────────────────────────────────────────
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  for (let dt = startDate; dt <= endDate; dt = addDays(dt, 1)) {
    days.push(dt);
  }
  const weeks = days.length / 7; // either 5 or 6

  const getEventsForDay = (d: Date) =>
    filteredActionItems.filter((ai) => ai.dueAt && isSameDay(new Date(ai.dueAt), d));
  const handleDayClick = (d: Date) => {
    if (isSameMonth(d, monthStart)) {
      setSelectedDate(d);
      setShowDayModal(true);
    }
  };

  // ── Day Modal ───────────────────────────────────────────────────────────────
  const dayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Handlers for FAB and day modal add
  const openTaskModal = (date: Date | null = null) => {
    setTaskModalDate(date);
    setNewDueAt(date);
    setShowTaskModal(true);
  };

  // Local state for new task modal
  const [newText, setNewText] = useState('');
  const [newDueAt, setNewDueAt] = useState<Date | null>(null);
  const [shouldRemind, setShouldRemind] = useState(false);
  const [reminderMinutesBeforeDue, setReminderMinutesBeforeDue] = useState<number | null>(null);
  const [isDateOnly, setIsDateOnly] = useState(false);

  const handleAddTask = async () => {
    if (!newText.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    try {
      await createActionItemMutation.mutateAsync({
        text: newText.trim(),
        dueAt: newDueAt ? newDueAt.toISOString() : null,
        isDateOnly,
        shouldRemind,
        reminderMinutesBeforeDue: shouldRemind ? reminderMinutesBeforeDue : null,
      });

      // Show success message
      toast.success('Task created successfully!');

      // Reset form and close modal on success
      setShowTaskModal(false);
      setNewText('');
      setNewDueAt(null);
      setShouldRemind(false);
      setReminderMinutesBeforeDue(null);
      setIsDateOnly(false);
    } catch (error) {
      // Show user-friendly error message
      const errorMessage = getMutationErrorMessage(
        error,
        'Failed to create task. Please try again.',
      );
      toast.error(errorMessage);
      console.error('Failed to create action item:', error);
    }
  };

  // Helper to reset modal state
  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setNewText('');
    setNewDueAt(null);
    setShouldRemind(false);
    setReminderMinutesBeforeDue(null);
    setIsDateOnly(false);
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* HEADER */}
        <div className="flex-none w-full max-w-4xl mx-auto px-4 py-3 sticky top-0 z-20 bg-background border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Calendar</h1>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-medium bg-zinc-800 rounded hover:bg-zinc-700"
            >
              Today
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-200" />
            </button>
            <span className="text-lg font-semibold text-white min-w-[120px] text-center select-none">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 bg-zinc-800 rounded hover:bg-zinc-700 active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-zinc-200" />
            </button>
          </div>
        </div>

        {/* MONTH VIEW */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-4xl mx-auto px-4 pt-2 pb-2">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-0.5 flex-none mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wide py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid (dynamic rows) */}
          <div
            className="grid flex-1 min-h-0 overflow-hidden grid-cols-7 gap-0.5"
            style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
          >
            {days.map((date, idx) => {
              const inMonth = isSameMonth(date, monthStart);
              const todayCell = isToday(date);
              const dayEvents = getEventsForDay(date);

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(date)}
                  disabled={!inMonth}
                  className={cn(
                    'h-full w-full flex flex-col items-center p-1 relative rounded transition-all',
                    inMonth
                      ? 'bg-zinc-900 hover:bg-zinc-700 active:scale-95'
                      : 'bg-zinc-800 opacity-40 cursor-default',
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-bold mb-1 flex items-center justify-center h-8 w-8 rounded-full',
                      inMonth ? 'text-white' : 'text-zinc-400',
                      todayCell &&
                        inMonth &&
                        'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 transition-transform duration-150 ease-out transform hover:scale-105',
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {inMonth &&
                    dayEvents.length > 0 &&
                    (showReminderCountBadge && dayEvents.length > 3 ? (
                      <span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[10px] rounded-full px-1">
                        +{dayEvents.length}
                      </span>
                    ) : (
                      <div className="flex gap-[2px] justify-center items-center mt-1">
                        {Array(Math.min(dayEvents.length, 3))
                          .fill(null)
                          .map((_, i) => (
                            <div key={i} className="h-[4px] w-[4px] rounded-full bg-blue-400" />
                          ))}
                      </div>
                    ))}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Modal */}
        <Transition show={showDayModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowDayModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
            </TransitionChild>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="translate-y-8 opacity-0"
                enterTo="translate-y-0 opacity-100"
                leave="ease-in duration-150"
                leaveFrom="translate-y-0 opacity-100"
                leaveTo="translate-y-8 opacity-0"
              >
                <DialogPanel className="w-full max-w-md bg-zinc-900 rounded-xl shadow-xl p-6 mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <DialogTitle className="text-lg font-bold">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                    </DialogTitle>
                    <button
                      onClick={() => setShowDayModal(false)}
                      className="text-zinc-400 hover:text-white rounded p-1 transition"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div>
                    <button
                      className="flex items-center justify-center w-full gap-2 py-2 mt-3 mb-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                      onClick={() => {
                        setShowDayModal(false);
                        openTaskModal(selectedDate);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-4 w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add Task
                    </button>
                    {dayEvents.length === 0 ? (
                      <div className="text-zinc-400 text-sm text-center py-8">
                        No events for this day.
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {dayEvents.map((ai) => (
                          <li
                            key={ai.id}
                            className="bg-zinc-800 rounded p-3 flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-sm font-medium text-white">{ai.text}</span>
                            {ai.isDone && <span className="ml-2 text-xs text-green-400">Done</span>}
                            {ai.shouldRemind && ai.dueAt && (
                              <span className="ml-2 text-xs text-blue-300 flex items-center gap-1">
                                <Bell className="h-4 w-4 inline" />
                                {new Date(ai.dueAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      </div>
      <button
        className="fixed bottom-24 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => {
          openTaskModal(new Date());
        }}
        aria-label="Add new task"
      >
        <Plus className="w-5 h-5" />
      </button>
      <NewManualTaskModal
        show={showTaskModal}
        newText={newText}
        setNewText={setNewText}
        newDueAt={newDueAt}
        setNewDueAt={setNewDueAt}
        shouldRemind={shouldRemind}
        setShouldRemind={setShouldRemind}
        reminderMinutesBeforeDue={reminderMinutesBeforeDue}
        setReminderMinutesBeforeDue={setReminderMinutesBeforeDue}
        handleAdd={handleAddTask}
        onClose={handleCloseTaskModal}
        isLoading={createActionItemMutation.isPending}
        isDateOnly={isDateOnly}
        setIsDateOnly={setIsDateOnly}
      />
    </>
  );
}
