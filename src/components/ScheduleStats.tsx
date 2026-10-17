import React from 'react';
import { RoutineBlock } from '../types/schedule';
import { Brain, Coffee, Moon, Bell, CheckCircle2 } from 'lucide-react';

interface ScheduleStatsProps {
  blocks: RoutineBlock[];
}

export const ScheduleStats: React.FC<ScheduleStatsProps> = ({ blocks }) => {
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const calculateTotalMinutes = (filterFn: (b: RoutineBlock) => boolean) => {
    return blocks.filter(filterFn).reduce((acc, b) => {
      const start = timeToMinutes(b.startTime);
      const end = timeToMinutes(b.endTime);
      return acc + Math.max(0, end - start);
    }, 0);
  };

  const formatHoursMinutes = (totalMin: number) => {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const deepWorkMinutes = calculateTotalMinutes((b) => b.category === 'deep-work');
  const breakMinutes = calculateTotalMinutes((b) => b.category === 'break');
  const sleepMinutes = calculateTotalMinutes((b) => b.category === 'sleep');
  const notificationsCount = blocks.filter((b) => b.has10MinReminder).length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Deep Work */}
      <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 shadow-xs dark:border-indigo-900/40 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Deep Focus
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            {formatHoursMinutes(deepWorkMinutes)}
          </p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
            {blocks.filter((b) => b.category === 'deep-work').length} power blocks
          </span>
        </div>
      </div>

      {/* Breaks & Meals */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white p-3 shadow-xs dark:border-amber-900/40 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <Coffee className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Breaks & Meals
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            {formatHoursMinutes(breakMinutes)}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400">
            Restorative recharge
          </span>
        </div>
      </div>

      {/* Sleep & Wind Down */}
      <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3 shadow-xs dark:border-sky-900/40 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
          <Moon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Sleep & Unwind
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            {formatHoursMinutes(sleepMinutes)}
          </p>
          <span className="text-[10px] text-sky-600 dark:text-sky-400">
            Screen-free routine
          </span>
        </div>
      </div>

      {/* Reminders / Notifications */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xs dark:border-emerald-900/40 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            10-Min Alerts
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            {notificationsCount} enabled
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Deep work prep alarms
          </span>
        </div>
      </div>
    </div>
  );
};
