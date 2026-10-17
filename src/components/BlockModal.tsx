import React, { useState, useEffect } from 'react';
import { RoutineBlock, RoutineCategoryId, DayOfWeek } from '../types/schedule';
import { ROUTINE_CATEGORIES, GOOGLE_CALENDAR_COLORS } from '../data/categories';
import { X, Bell, Clock, Calendar, Check, Flame } from 'lucide-react';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: RoutineBlock) => void;
  initialBlock: RoutineBlock | null;
}

const ALL_DAYS: DayOfWeek[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
};

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBlock,
}) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<RoutineCategoryId>('deep-work');
  const [colorId, setColorId] = useState('9');
  const [has10MinReminder, setHas10MinReminder] = useState(true);
  const [days, setDays] = useState<DayOfWeek[]>(['MO', 'TU', 'WE', 'TH', 'FR']);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title);
      setStartTime(initialBlock.startTime);
      setEndTime(initialBlock.endTime);
      setCategory(initialBlock.category);
      setColorId(initialBlock.colorId || ROUTINE_CATEGORIES[initialBlock.category]?.colorId || '1');
      setHas10MinReminder(!!initialBlock.has10MinReminder);
      setDays(initialBlock.days || ['MO', 'TU', 'WE', 'TH', 'FR']);
      setNotes(initialBlock.notes || '');
    } else {
      setTitle('');
      setStartTime('08:00');
      setEndTime('09:00');
      setCategory('deep-work');
      setColorId('9');
      setHas10MinReminder(true);
      setDays(['MO', 'TU', 'WE', 'TH', 'FR']);
      setNotes('');
    }
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: RoutineCategoryId) => {
    setCategory(newCat);
    const catMeta = ROUTINE_CATEGORIES[newCat];
    if (catMeta) {
      setColorId(catMeta.colorId);
      if (newCat === 'deep-work') {
        setHas10MinReminder(true);
      }
    }
  };

  const toggleDay = (d: DayOfWeek) => {
    if (days.includes(d)) {
      if (days.length > 1) {
        setDays(days.filter((x) => x !== d));
      }
    } else {
      setDays([...days, d]);
    }
  };

  const setWeekdayPreset = () => {
    setDays(['MO', 'TU', 'WE', 'TH', 'FR']);
  };

  const setAllDaysPreset = () => {
    setDays(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const block: RoutineBlock = {
      id: initialBlock ? initialBlock.id : `block-${Date.now()}`,
      title: title.trim(),
      startTime,
      endTime,
      category,
      colorId,
      has10MinReminder,
      isDeepWork: category === 'deep-work',
      days,
      notes: notes.trim(),
    };

    onSave(block);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialBlock ? 'Edit Routine Block' : 'Add Routine Block'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task or Activity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep work / study block, Morning Walk, Lunch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROUTINE_CATEGORIES) as RoutineCategoryId[]).map((catKey) => {
                const cat = ROUTINE_CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => handleCategoryChange(catKey)}
                    className={`flex items-center gap-1.5 rounded-lg border p-2 text-left text-xs transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.hex }}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Calendar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Calendar Event Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {GOOGLE_CALENDAR_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  title={c.name}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                    colorId === c.id
                      ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {colorId === c.id && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 10-Minute Reminder switch */}
          <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  10-Minute Notification
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pops up on your phone/desktop 10 minutes before this block starts
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="reminderToggle"
              checked={has10MinReminder}
              onChange={(e) => setHas10MinReminder(e.target.checked)}
              className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          {/* Days selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Recurring Days (RRULE)
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={setWeekdayPreset}
                  className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                >
                  Mon–Fri
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={setAllDaysPreset}
                  className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                >
                  All Days
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-1">
              {ALL_DAYS.map((d) => {
                const isSelected = days.includes(d);
                return (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {DAY_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Tackle hardest task first, zero phone distraction, drink 500ml water"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500"
            >
              {initialBlock ? 'Save Changes' : 'Create Routine Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
