'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BulldogDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  dateFormat?: string;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  isClearable?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  'aria-label'?: string;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const QUICK_CHIPS = [
  { label: 'Today', getDate: () => new Date() },
  { label: 'Tomorrow', getDate: () => addDays(new Date(), 1) },
  { label: 'Next Week', getDate: () => addDays(new Date(), 7) },
];

export function BulldogDatePicker({
  selected,
  onChange,
  showTimeSelect = false,
  dateFormat = 'MMM d, yyyy',
  placeholderText = 'Select date',
  minDate,
  maxDate,
  className,
  disabled = false,
  isClearable = false,
  timeIntervals = 15,
  timeCaption = 'Time',
  'aria-label': ariaLabel,
}: BulldogDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(selected || new Date());
  const [selectedTime, setSelectedTime] = useState<{ hours: number; minutes: number }>({
    hours: selected ? selected.getHours() : 12,
    minutes: selected ? selected.getMinutes() : 0,
  });
  const [viewMode, setViewMode] = useState<'calendar' | 'time'>('calendar');
  const [isMobile, setIsMobile] = useState(false);
  const timeListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClick = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    };
    if (isOpen) {
      document.addEventListener(isMobile ? 'touchstart' : 'mousedown', handleClick);
    }
    return () => {
      document.removeEventListener(isMobile ? 'touchstart' : 'mousedown', handleClick);
    };
  }, [isOpen, isMobile]);

  // Update current date when selected date changes
  useEffect(() => {
    if (selected) {
      setCurrentDate(selected);
      setSelectedTime({
        hours: selected.getHours(),
        minutes: selected.getMinutes(),
      });
    }
  }, [selected]);

  // Smooth scroll to selected time
  useEffect(() => {
    if (viewMode === 'time' && timeListRef.current && selected) {
      const idx = Math.floor((selected.getHours() * 60 + selected.getMinutes()) / timeIntervals);
      const el = timeListRef.current.children[idx] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [viewMode, selected, timeIntervals]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (showTimeSelect) {
      newDate.setHours(selectedTime.hours, selectedTime.minutes);
      setViewMode('time');
    } else {
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const handleTimeSelect = () => {
    if (selected) {
      const newDate = new Date(selected);
      newDate.setHours(selectedTime.hours, selectedTime.minutes);
      onChange(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setHours(selectedTime.hours, selectedTime.minutes);
      onChange(newDate);
    }
    setIsOpen(false);
    setViewMode('calendar');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const handleQuickSelect = (label: string) => {
    const chip = QUICK_CHIPS.find((c) => c.label === label);
    if (chip) {
      const d = chip.getDate();
      if (showTimeSelect) {
        d.setHours(selectedTime.hours, selectedTime.minutes);
        setCurrentDate(d);
        setViewMode('time');
      } else {
        onChange(d);
        setIsOpen(false);
      }
    }
  };

  const formatDisplayDate = () => {
    if (!selected) return '';

    const formatMap: Record<string, string> = {
      'MMM d, yyyy': selected.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      'MMM d, yyyy h:mm aa': selected.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    return formatMap[dateFormat] || selected.toLocaleDateString();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected =
        selected &&
        selected.getDate() === day &&
        selected.getMonth() === currentDate.getMonth() &&
        selected.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().toDateString() === date.toDateString();
      const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push({
        day,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isDisabled,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: false,
      });
    }

    return days;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeIntervals) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        options.push({
          value: `${hour}:${minute.toString().padStart(2, '0')}`,
          label: time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          hours: hour,
          minutes: minute,
        });
      }
    }
    return options;
  };

  const calendarDays = generateCalendarDays();
  const timeOptions = generateTimeOptions();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayDate()}
          placeholder={placeholderText}
          readOnly
          onClick={() => !disabled && setIsOpen(true)}
          className={cn(
            'w-full pl-8 pr-8 py-1.5 rounded-md border border-zinc-700 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all',
            'min-h-[36px] h-9',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          aria-label={ariaLabel || 'Select due date'}
          disabled={disabled}
          style={{ fontSize: '0.95rem' }}
        />
        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        {isClearable && selected && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted hover:text-text transition-colors"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* Quick Action Chips */}
      <div className="flex gap-2 mt-2 text-xs">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleQuickSelect(chip.label)}
            className="bg-accent/10 hover:bg-accent/20 text-muted px-2 py-1 rounded-md transition"
            type="button"
          >
            {chip.label}
          </button>
        ))}
      </div>
      {/* Date Picker Dropdown */}
      <AnimatePresence>
        {isOpen &&
          (isMobile ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed bottom-0 inset-x-0 z-[120] rounded-t-2xl bg-background border-t border-zinc-700 shadow-lg p-4 max-h-[80vh] overflow-y-auto backdrop-blur-md pb-16"
              style={{ paddingBottom: 'max(4rem, env(safe-area-inset-bottom, 0px))' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors font-medium',
                      viewMode === 'calendar'
                        ? 'bg-primary/10 text-primary underline underline-offset-4'
                        : 'text-muted hover:text-text',
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    Date
                  </button>
                  {showTimeSelect && (
                    <button
                      onClick={() => setViewMode('time')}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors font-medium',
                        viewMode === 'time'
                          ? 'bg-primary/10 text-primary underline underline-offset-4'
                          : 'text-muted hover:text-text',
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      Time
                    </button>
                  )}
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-accent/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Calendar/Time Views */}
              <div className="mt-2">
                <AnimatePresence mode="wait">
                  {viewMode === 'calendar' ? (
                    <motion.div
                      key="calendar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={getPreviousMonth}
                          className="p-1 rounded hover:bg-accent/10 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h3 className="text-xs font-medium">
                          {currentDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </h3>
                        <button
                          onClick={getNextMonth}
                          className="p-1 rounded hover:bg-accent/10 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-[11px] text-muted text-center py-0.5">
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          const isSelected = day.isSelected;
                          const isToday = day.isToday;
                          return (
                            <button
                              key={index}
                              onClick={() => !day.isDisabled && handleDateSelect(day.day)}
                              disabled={day.isDisabled}
                              aria-selected={!!isSelected}
                              className={cn(
                                'h-8 w-8 flex items-center justify-center rounded-full text-xs transition-all relative',
                                isSelected &&
                                  'bg-primary text-background font-semibold scale-105 shadow transition-transform duration-200',
                                isToday && !isSelected && 'border border-primary text-primary',
                                !day.isDisabled && 'hover:bg-accent/10 active:scale-95',
                                day.isDisabled && 'opacity-50 cursor-not-allowed',
                              )}
                              tabIndex={isSelected ? 0 : -1}
                              aria-label={isToday ? 'Today' : undefined}
                            >
                              {day.day}
                              {isToday && (
                                <span
                                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-primary text-[18px] leading-none select-none pointer-events-none"
                                  style={{ lineHeight: '0' }}
                                >
                                  •
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="time"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => setViewMode('calendar')}
                        className="mb-2 text-xs text-primary underline underline-offset-2"
                        type="button"
                      >
                        ← Back to Date
                      </button>
                      <h4 className="text-xs font-medium mb-2">{timeCaption}</h4>
                      <div
                        ref={timeListRef}
                        className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto"
                      >
                        {timeOptions.map((option, idx) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedTime({ hours: option.hours, minutes: option.minutes });
                              handleTimeSelect();
                            }}
                            className={cn(
                              'px-2 py-1 text-xs text-left rounded-full transition-colors',
                              selectedTime.hours === option.hours &&
                                selectedTime.minutes === option.minutes
                                ? 'bg-primary text-background font-semibold scale-105 shadow transition-transform duration-200'
                                : 'hover:bg-accent/10 active:scale-95',
                            )}
                            aria-selected={
                              selectedTime.hours === option.hours &&
                              selectedTime.minutes === option.minutes
                            }
                            tabIndex={
                              selectedTime.hours === option.hours &&
                              selectedTime.minutes === option.minutes
                                ? 0
                                : -1
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            // Desktop dropdown
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.13 }}
              className="absolute top-full left-0 mt-1 z-50 w-full min-w-[220px] max-w-[320px] bg-background border border-zinc-700 rounded-md shadow-md overflow-hidden text-xs"
              style={{ fontSize: '0.95rem' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-2 border-b border-zinc-700 bg-background">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors font-medium',
                      viewMode === 'calendar'
                        ? 'bg-primary/10 text-primary underline underline-offset-4'
                        : 'text-muted hover:text-text',
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    Date
                  </button>
                  {showTimeSelect && (
                    <button
                      onClick={() => setViewMode('time')}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors font-medium',
                        viewMode === 'time'
                          ? 'bg-primary/10 text-primary underline underline-offset-4'
                          : 'text-muted hover:text-text',
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      Time
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <AnimatePresence mode="wait">
                  {viewMode === 'calendar' ? (
                    <motion.div
                      key="calendar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={getPreviousMonth}
                          className="p-1 rounded hover:bg-accent/10 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h3 className="text-xs font-medium">
                          {currentDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </h3>
                        <button
                          onClick={getNextMonth}
                          className="p-1 rounded hover:bg-accent/10 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-[11px] text-muted text-center py-0.5">
                            {day}
                          </div>
                        ))}
                      </div>
                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          const isSelected = day.isSelected;
                          const isToday = day.isToday;
                          return (
                            <button
                              key={index}
                              onClick={() => !day.isDisabled && handleDateSelect(day.day)}
                              disabled={day.isDisabled}
                              aria-selected={!!isSelected}
                              className={cn(
                                'h-8 w-8 flex items-center justify-center rounded-full text-xs transition-all relative',
                                isSelected &&
                                  'bg-primary text-background font-semibold scale-105 shadow transition-transform duration-200',
                                isToday && !isSelected && 'border border-primary text-primary',
                                !day.isDisabled && 'hover:bg-accent/10 active:scale-95',
                                day.isDisabled && 'opacity-50 cursor-not-allowed',
                              )}
                              tabIndex={isSelected ? 0 : -1}
                              aria-label={isToday ? 'Today' : undefined}
                            >
                              {day.day}
                              {isToday && (
                                <span
                                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-primary text-[18px] leading-none select-none pointer-events-none"
                                  style={{ lineHeight: '0' }}
                                >
                                  •
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="time"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => setViewMode('calendar')}
                        className="mb-2 text-xs text-primary underline underline-offset-2"
                        type="button"
                      >
                        ← Back to Date
                      </button>
                      <h4 className="text-xs font-medium mb-2">{timeCaption}</h4>
                      <div
                        ref={timeListRef}
                        className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto"
                      >
                        {timeOptions.map((option, idx) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedTime({ hours: option.hours, minutes: option.minutes });
                              handleTimeSelect();
                            }}
                            className={cn(
                              'px-2 py-1 text-xs text-left rounded-full transition-colors',
                              selectedTime.hours === option.hours &&
                                selectedTime.minutes === option.minutes
                                ? 'bg-primary text-background font-semibold scale-105 shadow transition-transform duration-200'
                                : 'hover:bg-accent/10 active:scale-95',
                            )}
                            aria-selected={
                              selectedTime.hours === option.hours &&
                              selectedTime.minutes === option.minutes
                            }
                            tabIndex={
                              selectedTime.hours === option.hours &&
                              selectedTime.minutes === option.minutes
                                ? 0
                                : -1
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
