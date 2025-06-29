// updated: smooth scroll wheel with visual depth and polished UX
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDisableBodyScroll } from '@/hooks/ui/useDisableBodyScroll';

interface BulldogDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
}

export function BulldogDatePicker({ selected, onChange }: BulldogDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datePicked, setDatePicked] = useState<Date | null>(null);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');

  // Track which items are currently centered in each scroll wheel
  const [centeredHour, setCenteredHour] = useState(12);
  const [centeredMinute, setCenteredMinute] = useState(0);
  const [centeredAmPm, setCenteredAmPm] = useState<'AM' | 'PM'>('AM');

  const today = new Date();

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

  useDisableBodyScroll(isOpen);

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
    if (isOpen) {
      setTimeout(() => {
        document.querySelectorAll('[data-picker-type]').forEach((container) => {
          const centered = container.querySelector(`[data-scroll-item][data-selected="true"]`);
          if (centered) {
            centered.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        });
      }, 300);
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
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setDatePicked(d);
  };

  const handleTimeConfirm = () => {
    if (!datePicked) return;
    const fullDate = new Date(datePicked);
    let finalHour = centeredHour % 12;
    if (centeredAmPm === 'PM') finalHour += 12;
    fullDate.setHours(finalHour, centeredMinute);
    onChange(fullDate);
    setIsOpen(false);
    setDatePicked(null);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        readOnly
        value={selected ? selected.toLocaleString() : ''}
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 border rounded-md bg-background text-xs cursor-pointer"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[101] bg-background border-t border-zinc-700 shadow-xl rounded-t-xl max-h-screen sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Modal handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-8 h-1 bg-zinc-500 rounded-full opacity-50" />
              </div>

              <div className="px-6 pb-6">
                <div className="text-center font-semibold text-base mb-4">Pick a Date & Time</div>

                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                      )
                    }
                    className="p-2 hover:bg-accent/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-muted">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
                      )
                    }
                    className="p-2 hover:bg-accent/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs text-muted mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center font-medium uppercase tracking-wide">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        'h-9 w-9 flex items-center justify-center rounded-full text-xs transition-all',
                        day === today.getDate() &&
                          currentDate.getMonth() === today.getMonth() &&
                          currentDate.getFullYear() === today.getFullYear() &&
                          'text-primary border border-primary',
                        day === (datePicked?.getDate() || -1) &&
                          'bg-primary text-background font-semibold scale-105',
                        day !== 0 ? 'hover:bg-accent/10' : 'opacity-0 cursor-default',
                      )}
                    >
                      {day !== 0 ? day : ''}
                    </button>
                  ))}
                </div>

                {datePicked && (
                  <>
                    <div className="text-center text-xs text-muted mb-2">
                      Time for{' '}
                      <span className="text-white font-medium">{datePicked.toDateString()}</span>
                    </div>

                    {/* Gradient overlay without selection lines */}
                    <div className="relative mb-6">
                      <div className="flex justify-center gap-6">
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
                            className="h-40 w-16 overflow-y-auto snap-y snap-mandatory rounded-2xl bg-accent/5 shadow-inner border border-accent/10 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                            {/* Top padding for scrolling */}
                            <div className="h-[75px]" />
                            {group.items.map((value) => {
                              const isCentered =
                                (group.label === 'Hour' && value === centeredHour) ||
                                (group.label === 'Minute' && value === centeredMinute) ||
                                (group.label === 'AM/PM' && value === centeredAmPm);

                              return (
                                <div
                                  key={value.toString()}
                                  data-scroll-item
                                  onClick={() => {
                                    group.setter(value as any);
                                    // Also update centered value when clicked
                                    if (group.label === 'Hour') setCenteredHour(value as number);
                                    else if (group.label === 'Minute')
                                      setCenteredMinute(value as number);
                                    else if (group.label === 'AM/PM')
                                      setCenteredAmPm(value as 'AM' | 'PM');
                                  }}
                                  data-selected={group.selected === value}
                                  className={cn(
                                    'h-10 flex justify-center items-center text-sm snap-center cursor-pointer transition-all duration-150 rounded-lg mx-1',
                                    isCentered
                                      ? 'text-primary font-bold scale-105 opacity-100 bg-primary/12 shadow-sm border border-primary/30'
                                      : 'opacity-50 scale-95 hover:opacity-80 hover:bg-accent/5',
                                  )}
                                >
                                  {value.toString().padStart(2, '0')}
                                </div>
                              );
                            })}
                            {/* Bottom padding for scrolling */}
                            <div className="h-[75px]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* Always show Cancel/Confirm buttons at the bottom */}
                <div className="flex justify-center pt-4 gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setDatePicked(null);
                    }}
                    className="px-8 py-3 text-sm bg-zinc-700 text-white font-semibold rounded-2xl shadow-lg hover:bg-zinc-800 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTimeConfirm}
                    className="px-8 py-3 text-sm bg-primary text-background font-semibold rounded-2xl shadow-lg hover:bg-primary/90 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    disabled={!datePicked}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
