import React, { useState, useEffect } from 'react';
import { RoutineBlock } from '../types/schedule';
import { ROUTINE_CATEGORIES } from '../data/categories';
import {
  Clock,
  Play,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface CurrentFocusTrackerProps {
  blocks: RoutineBlock[];
  onOpenSyncModal: () => void;
}

export const CurrentFocusTracker: React.FC<CurrentFocusTrackerProps> = ({
  blocks,
  onOpenSyncModal,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Convert "HH:mm" to minutes from midnight
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  // Find active block
  const activeBlock = blocks.find((b) => {
    const start = timeToMinutes(b.startTime);
    const end = timeToMinutes(b.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  // Find next upcoming block
  const upcomingBlock = blocks
    .filter((b) => timeToMinutes(b.startTime) > currentMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0];

  let progressPercent = 0;
  let remainingMinutes = 0;

  if (activeBlock) {
    const start = timeToMinutes(activeBlock.startTime);
    const end = timeToMinutes(activeBlock.endTime);
    const totalMinutes = end - start;
    const elapsedMinutes = currentMinutes - start + currentSeconds / 60;
    progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100));
    remainingMinutes = Math.max(0, end - currentMinutes);
  }

  const category = activeBlock ? ROUTINE_CATEGORIES[activeBlock.category] : null;

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio chime not permitted or failed', e);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Current Active Block */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Focus Tracker
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {activeBlock?.isDeepWork && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Flame className="h-3 w-3 text-indigo-500" />
                Deep Work Focus
              </span>
            )}
          </div>

          {activeBlock ? (
            <div className="mt-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {activeBlock.title}
                </h2>
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {activeBlock.startTime} - {activeBlock.endTime}
                </span>
                {category && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${category.bgClass} ${category.textClass}`}
                  >
                    {category.label}
                  </span>
                )}
              </div>

              {activeBlock.notes && (
                <p className="mt-1 text-xs text-slate-600 line-clamp-1 dark:text-slate-400">
                  {activeBlock.notes}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Progress ({Math.round(progressPercent)}%)</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {remainingMinutes} min remaining
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Buffer / Transition Time
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are currently between scheduled routine blocks. Take a breath and get ready!
              </p>
            </div>
          )}
        </div>

        {/* Right: Next Up Preview & Chime */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-white/80 p-3 shadow-xs dark:border-slate-800 dark:bg-slate-800/80 lg:w-80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Next Up
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playChime();
                }}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Toggle interval audio chime"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-3 w-3 text-indigo-600" />
                    <span>Chime On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3 w-3" />
                    <span>Chime Off</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {upcomingBlock ? (
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-800 line-clamp-1 dark:text-slate-200">
                  {upcomingBlock.title}
                </span>
                <span className="shrink-0 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {upcomingBlock.startTime}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Starts in {timeToMinutes(upcomingBlock.startTime) - currentMinutes} mins</span>
                {upcomingBlock.has10MinReminder && (
                  <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <Bell className="h-2.5 w-2.5" />
                    10m Alert
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              All routine blocks for today are finished! Have a wonderful evening.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
