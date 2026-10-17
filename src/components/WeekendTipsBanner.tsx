import React from 'react';
import { ScheduleTab } from '../types/schedule';
import { Sparkles, Calendar, Bell, Palette, ArrowRight } from 'lucide-react';

interface WeekendTipsBannerProps {
  activeTab: ScheduleTab;
  onSelectTab: (tab: ScheduleTab) => void;
}

export const WeekendTipsBanner: React.FC<WeekendTipsBannerProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/40 p-4 dark:border-indigo-950 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Google Calendar Routine Best Practices Active
            </h3>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              Each block repeats Weekly (Mon–Fri) with custom category colors and 10-minute prep notifications on Deep Work sessions.
            </p>
          </div>
        </div>

        {/* Quick Schedule Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectTab('weekday')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'weekday'
                ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Mon–Fri Routine
          </button>

          <button
            onClick={() => onSelectTab('saturday')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'saturday'
                ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🌿 Saturday Light
          </button>

          <button
            onClick={() => onSelectTab('sunday')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'sunday'
                ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            📋 Sunday Planning
          </button>
        </div>
      </div>
    </div>
  );
};
