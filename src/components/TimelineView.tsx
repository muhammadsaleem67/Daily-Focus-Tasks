import React, { useState } from 'react';
import { RoutineBlock, RoutineCategoryId } from '../types/schedule';
import { ROUTINE_CATEGORIES } from '../data/categories';
import {
  Bell,
  BellOff,
  Edit2,
  Trash2,
  Copy,
  Clock,
  Flame,
  Check,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface TimelineViewProps {
  blocks: RoutineBlock[];
  onEditBlock: (block: RoutineBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (block: RoutineBlock) => void;
  onToggleReminder: (blockId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  blocks,
  onEditBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onToggleReminder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const totalMin = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const format12Hour = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  const filteredBlocks = blocks
    .filter((b) => selectedCategory === 'all' || b.category === selectedCategory)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const categories = Object.values(ROUTINE_CATEGORIES);

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
          }`}
        >
          All Blocks ({blocks.length})
        </button>
        {categories.map((cat) => {
          const count = blocks.filter((b) => b.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.hex }}
              />
              <span>{cat.label}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-3">
          {filteredBlocks.map((block, index) => {
            const category = ROUTINE_CATEGORIES[block.category] || ROUTINE_CATEGORIES.morning;
            const duration = formatDuration(block.startTime, block.endTime);
            const isDeepWork = block.category === 'deep-work';

            return (
              <div
                key={block.id}
                className="group relative flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-start sm:justify-between"
              >
                {/* Timeline node circle */}
                <div
                  className="absolute -left-6 sm:-left-8 top-4 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white shadow-xs dark:border-slate-900"
                  style={{ backgroundColor: category.hex }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                {/* Left: Time & Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{format12Hour(block.startTime)} – {format12Hour(block.endTime)}</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        ({duration})
                      </span>
                    </div>

                    {/* Category pill */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${category.bgClass} ${category.textClass}`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: category.hex }}
                      />
                      {category.label}
                    </span>

                    {/* Deep Work highlight */}
                    {isDeepWork && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                        <Flame className="h-3 w-3 text-indigo-500" />
                        Deep Work
                      </span>
                    )}

                    {/* 10-Minute Reminder Pill */}
                    {block.has10MinReminder && (
                      <button
                        onClick={() => onToggleReminder(block.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/70 dark:text-amber-300"
                        title="10-minute Google Calendar notification active. Click to toggle."
                      >
                        <Bell className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span>10m Alert</span>
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {block.title}
                  </h4>

                  {/* Notes / Tips */}
                  {block.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {block.notes}
                    </p>
                  )}

                  {/* Repeating days info */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>Repeats: {block.days.join(', ')}</span>
                    <span>•</span>
                    <span>Google Calendar Color: {category.colorName}</span>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex shrink-0 items-center gap-1 self-end sm:self-start opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onToggleReminder(block.id)}
                    className={`rounded-lg p-1.5 text-xs transition ${
                      block.has10MinReminder
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800'
                    }`}
                    title={
                      block.has10MinReminder
                        ? 'Disable 10-minute notification'
                        : 'Enable 10-minute notification before event'
                    }
                  >
                    {block.has10MinReminder ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDuplicateBlock(block)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Duplicate block"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditBlock(block)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                    title="Edit block"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeleteBlock(block.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    title="Delete block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
