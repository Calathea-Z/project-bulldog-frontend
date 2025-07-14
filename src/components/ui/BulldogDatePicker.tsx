// updated: seamless dropdown that feels like one cohesive unit
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDisableBodyScroll } from '@/hooks/ui/useDisableBodyScroll';

interface BulldogDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  isDateOnly?: boolean;
  disableBodyScroll?: boolean;
}

export function BulldogDatePicker({
  selected,
  onChange,
  isDateOnly = false,
  disableBodyScroll = true,
}: BulldogDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datePicked, setDatePicked] = useState<Date | null>(null);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  // Track which items are currently centered in each scroll wheel
  const [centeredHour, setCenteredHour] = useState(12);
  const [centeredMinute, setCenteredMinute] = useState(0);
  const [centeredAmPm, setCenteredAmPm] = useState<'AM' | 'PM'>('AM');

  const today = new Date();
  const containerRef = useRef<HTMLDivElement>(null);

  const [previewDate, setPreviewDate] = useState<Date | null>(selected);

  // Initialize time picker with current values when opened
  useEffect(() => {
    if (isOpen && selected) {
      const selectedHour = selected.getHours();
      const selectedMinute = selected.getMinutes();
      const displayHour =
        selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;
      const displayAmPm = selectedHour >= 12 ? 'PM' : 'AM';

      setHour(displayHour);
      setMinute(selectedMinute);
      setAmPm(displayAmPm);
      setCenteredHour(displayHour);
      setCenteredMinute(selectedMinute);
      setCenteredAmPm(displayAmPm);
    } else if (isOpen && !selected) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const displayHour =
        currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
      const displayAmPm = currentHour >= 12 ? 'PM' : 'AM';

      setHour(displayHour);
      setMinute(currentMinute);
      setAmPm(displayAmPm);
      setCenteredHour(displayHour);
      setCenteredMinute(currentMinute);
      setCenteredAmPm(displayAmPm);
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewDate(selected);
    }
  }, [isOpen, selected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useDisableBodyScroll(isOpen && disableBodyScroll);

  // Handle scroll to detect centered items
  const handleScroll = (
    e: React.UIEvent<HTMLDivElement>,
    items: any[],
    setter: (value: any) => void,
  ) => {
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    // Find the item closest to center
    const itemElements = container.querySelectorAll('[data-scroll-item]');
    let closestItem = null;
    let closestDistance = Infinity;

    itemElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = items[index];
      }
    });

    if (closestItem !== null) {
      setter(closestItem);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'time') {
      setTimeout(() => {
        document.querySelectorAll('[data-picker-type]').forEach((container) => {
          const centered = container.querySelector(`[data-scroll-item][data-selected="true"]`);
          if (centered) {
            centered.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        });
      }, 300);
    }
  }, [isOpen, activeTab]);

  // Remove the effect that syncs wheels on every tab switch
  // Instead, initialize wheels from previewDate only when the picker is opened or a new date is selected
  useEffect(() => {
    if (isOpen && previewDate) {
      const h = previewDate.getHours();
      setHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
      setMinute(previewDate.getMinutes());
      setAmPm(h >= 12 ? 'PM' : 'AM');
      setCenteredHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
      setCenteredMinute(previewDate.getMinutes());
      setCenteredAmPm(h >= 12 ? 'PM' : 'AM');
    }
  }, [isOpen]);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = (() => {
    const days: number[] = [];
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    for (let i = 0; i < firstDay; i++) days.push(0);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  })();

  const handleDateSelect = (day: number) => {
    if (day === 0) return;
    let newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (previewDate) {
      newDate.setHours(
        previewDate.getHours(),
        previewDate.getMinutes(),
        previewDate.getSeconds(),
        previewDate.getMilliseconds(),
      );
    } else if (selected) {
      newDate.setHours(
        selected.getHours(),
        selected.getMinutes(),
        selected.getSeconds(),
        selected.getMilliseconds(),
      );
    }
    setDatePicked(newDate);
    setPreviewDate(newDate);
    // Also update wheels from newDate
    const h = newDate.getHours();
    setHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setMinute(newDate.getMinutes());
    setAmPm(h >= 12 ? 'PM' : 'AM');
    setCenteredHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setCenteredMinute(newDate.getMinutes());
    setCenteredAmPm(h >= 12 ? 'PM' : 'AM');
    if (isDateOnly) {
      handleConfirm(newDate);
    } else {
      setActiveTab('time');
    }
  };

  const handleTimeChange = (newHour: number, newMinute: number, newAmPm: 'AM' | 'PM') => {
    let hour = newHour % 12;
    if (newAmPm === 'PM') hour += 12;
    const updated = previewDate ? new Date(previewDate) : new Date();
    updated.setHours(hour, newMinute, 0, 0);
    setHour(newHour);
    setMinute(newMinute);
    setAmPm(newAmPm);
    setCenteredHour(newHour);
    setCenteredMinute(newMinute);
    setCenteredAmPm(newAmPm);
    setPreviewDate(updated);
  };

  const handleConfirm = (dateOverride?: Date) => {
    const toSave = dateOverride || previewDate;
    if (!toSave) return;
    if (isDateOnly) {
      toSave.setHours(0, 0, 0, 0);
    }
    onChange(new Date(toSave));
    setIsOpen(false);
    setDatePicked(null);
    setActiveTab('date');
  };

  // For display, use previewDate if open, else selected
  const displayDate = isOpen ? previewDate : selected;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Main Container with unified border */}
      <div
        className={cn(
          'border border-zinc-300 dark:border-zinc-700 rounded-md overflow-hidden transition-all duration-200',
          isOpen && 'border-blue-500 ring-2 ring-blue-500/20',
        )}
      >
        {/* Input Row */}
        <div className="flex divide-x divide-zinc-300 dark:divide-zinc-700">
          {/* Date Input */}
          <button
            onClick={() => {
              setIsOpen(true);
              setActiveTab('date');
            }}
            className="flex-1 px-3 py-2 bg-background text-xs cursor-pointer flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="truncate">
              {displayDate ? displayDate.toLocaleDateString() : 'Select date'}
            </span>
          </button>

          {/* Time Input - only show if not all-day */}
          {!isDateOnly && (
            <button
              onClick={() => {
                if (displayDate) {
                  setIsOpen(true);
                  setActiveTab('time');
                }
              }}
              disabled={!displayDate}
              className={cn(
                'px-3 py-2 bg-background text-xs cursor-pointer flex items-center gap-2 min-w-[80px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors',
                !displayDate && 'opacity-50 cursor-not-allowed',
              )}
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="truncate">
                {displayDate
                  ? displayDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Time'}
              </span>
            </button>
          )}
        </div>

        {/* Dropdown Content - slides down and pushes content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="border-t border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              {/* Tab Navigation */}
              {!isDateOnly && (
                <div className="flex border-b border-zinc-300 dark:border-zinc-700">
                  <button
                    onClick={() => setActiveTab('date')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-medium transition-colors',
                      activeTab === 'date'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800',
                    )}
                  >
                    Date
                  </button>
                  <button
                    onClick={() => setActiveTab('time')}
                    className={cn(
                      'flex-1 px-4 py-2 text-xs font-medium transition-colors',
                      activeTab === 'time'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800',
                    )}
                  >
                    Time
                  </button>
                </div>
              )}

              {/* Date Picker */}
              {activeTab === 'date' && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                        )
                      }
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
                        )
                      }
                      className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-xs text-zinc-500 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center font-medium">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => (
                      <button
                        key={i}
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          'h-8 w-8 flex items-center justify-center rounded text-xs transition-all',
                          day === today.getDate() &&
                            currentDate.getMonth() === today.getMonth() &&
                            currentDate.getFullYear() === today.getFullYear() &&
                            'text-blue-600 border border-blue-600',
                          day === (datePicked?.getDate() || -1) &&
                            'bg-blue-600 text-white font-semibold',
                          day !== 0
                            ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            : 'opacity-0 cursor-default',
                        )}
                      >
                        {day !== 0 ? day : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Picker */}
              {activeTab === 'time' && !isDateOnly && (
                <div className="p-4">
                  <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    Time for {displayDate?.toDateString()}
                  </div>

                  <div className="flex justify-center gap-4">
                    {[
                      {
                        label: 'Hour',
                        items: [...Array(12).keys()].map((h) => h + 1),
                        selected: hour,
                        setter: setHour,
                      },
                      {
                        label: 'Minute',
                        items: [...Array(60).keys()],
                        selected: minute,
                        setter: setMinute,
                      },
                      { label: 'AM/PM', items: ['AM', 'PM'], selected: ampm, setter: setAmPm },
                    ].map((group, idx) => (
                      <div
                        key={idx}
                        data-picker-type
                        className="h-32 w-12 overflow-y-auto snap-y snap-mandatory rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        onScroll={(e) => {
                          if (group.label === 'Hour') {
                            handleScroll(e, group.items, setCenteredHour);
                          } else if (group.label === 'Minute') {
                            handleScroll(e, group.items, setCenteredMinute);
                          } else if (group.label === 'AM/PM') {
                            handleScroll(e, group.items, setCenteredAmPm);
                          }
                        }}
                      >
                        <div className="sr-only">{group.label}</div>
                        <div className="h-[48px]" />
                        {group.items.map((value) => {
                          const isCentered =
                            (group.label === 'Hour' && value === centeredHour) ||
                            (group.label === 'Minute' && value === centeredMinute) ||
                            (group.label === 'AM/PM' && value === centeredAmPm);

                          let onClickHandler;
                          if (group.label === 'Hour') {
                            onClickHandler = () => {
                              setHour(value as number);
                              setCenteredHour(value as number);
                              handleTimeChange(value as number, minute, ampm);
                            };
                          } else if (group.label === 'Minute') {
                            onClickHandler = () => {
                              setMinute(value as number);
                              setCenteredMinute(value as number);
                              handleTimeChange(hour, value as number, ampm);
                            };
                          } else if (group.label === 'AM/PM') {
                            onClickHandler = () => {
                              setAmPm(value as 'AM' | 'PM');
                              setCenteredAmPm(value as 'AM' | 'PM');
                              handleTimeChange(hour, minute, value as 'AM' | 'PM');
                            };
                          }

                          return (
                            <div
                              key={value.toString()}
                              data-scroll-item
                              onClick={onClickHandler}
                              data-selected={group.selected === value}
                              className={cn(
                                'h-8 flex justify-center items-center text-sm snap-center cursor-pointer transition-all duration-150',
                                isCentered
                                  ? 'text-blue-600 font-bold scale-105 bg-blue-50 dark:bg-blue-900/20'
                                  : 'opacity-60 hover:opacity-100',
                              )}
                            >
                              {value.toString().padStart(2, '0')}
                            </div>
                          );
                        })}
                        <div className="h-[48px]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 p-4 border-t border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setDatePicked(null);
                    setActiveTab('date');
                  }}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirm()}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!displayDate}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
