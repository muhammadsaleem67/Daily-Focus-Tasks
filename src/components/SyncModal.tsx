import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { RoutineBlock, UserCalendar } from '../types/schedule';
import { ROUTINE_CATEGORIES } from '../data/categories';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
  Layers,
  ExternalLink,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: RoutineBlock[];
  user: User | null;
  onLogin: () => void;
  onConfirmSync: (calendarId: string) => Promise<void>;
  onClearPreviousSync: (calendarId: string) => Promise<void>;
  calendars: UserCalendar[];
  isSyncing: boolean;
  syncProgress: { current: number; total: number; currentTitle: string } | null;
  syncError: string | null;
  syncSuccess: boolean;
  syncedEventsCount: number;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  blocks,
  user,
  onLogin,
  onConfirmSync,
  onClearPreviousSync,
  calendars,
  isSyncing,
  syncProgress,
  syncError,
  syncSuccess,
  syncedEventsCount,
}) => {
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [createNewCalendar, setCreateNewCalendar] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  if (!isOpen) return null;

  const deepWorkBlocks = blocks.filter((b) => b.category === 'deep-work' || b.has10MinReminder);

  const handleStartSync = async () => {
    await onConfirmSync(createNewCalendar ? 'CREATE_NEW' : selectedCalendarId);
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await onClearPreviousSync(selectedCalendarId);
      setShowClearConfirm(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sync Routine to Google Calendar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated recurring schedule with category colors & 10m alerts
              </p>
            </div>
          </div>
          {!isSyncing && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* User Sign-In Check */}
          {!user ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center dark:border-amber-900/60 dark:bg-amber-950/30">
              <AlertCircle className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Google Calendar Sign-In Required
              </h4>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Please connect your Google Account with calendar permissions to synchronize your routine blocks.
              </p>
              <div className="mt-3">
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            </div>
          ) : syncSuccess ? (
            /* Success View */
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Successfully Synced to Google Calendar!
              </h4>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                {blocks.length} recurring routine events were created with category colors and 10-minute deep work alerts.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://calendar.google.com/calendar/r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-500"
                >
                  <span>Open Google Calendar</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Done
                </button>
              </div>
            </div>
          ) : isSyncing ? (
            /* In-Progress Sync View */
            <div className="space-y-4 py-6 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Synchronizing with Google Calendar...
                </h4>
                {syncProgress && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Adding event {syncProgress.current} of {syncProgress.total}:{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {syncProgress.currentTitle}
                    </span>
                  </p>
                )}
              </div>

              {syncProgress && (
                <div className="mx-auto max-w-sm">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${Math.round((syncProgress.current / syncProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="mt-1 block text-right font-mono text-[11px] text-slate-400">
                    {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Confirmation & Review Screen */
            <div className="space-y-4">
              {/* Mandatory Confirmation Notice */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  Confirmation Required
                </h4>
                <p className="mt-1 text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  Are you ready to create <strong>{blocks.length} recurring routine events</strong> in your Google Calendar?
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-indigo-700 dark:text-indigo-400">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 shadow-2xs dark:bg-slate-800">
                    <Clock className="h-3 w-3" />
                    Weekly (Mon–Fri)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 shadow-2xs dark:bg-slate-800">
                    <Bell className="h-3 w-3 text-amber-600" />
                    10-min alerts on {deepWorkBlocks.length} deep focus blocks
                  </span>
                </div>
              </div>

              {/* Target Calendar Selector */}
              <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Target Google Calendar
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="calTarget"
                      checked={!createNewCalendar}
                      onChange={() => setCreateNewCalendar(false)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Primary Google Calendar (Recommended for daily notifications)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="calTarget"
                      checked={createNewCalendar}
                      onChange={() => setCreateNewCalendar(true)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Create a separate dedicated calendar (&quot;DayFlow - Daily Routine&quot;)</span>
                  </label>
                </div>
              </div>

              {/* Items List Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Events to be created ({blocks.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Weekly recurring • Mon–Fri
                  </span>
                </div>

                <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                  {blocks.map((b) => {
                    const cat = ROUTINE_CATEGORIES[b.category];
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs shadow-2xs dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat?.hex || '#999' }}
                          />
                          <span className="font-medium text-slate-800 line-clamp-1 dark:text-slate-200">
                            {b.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {b.has10MinReminder && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              <Bell className="h-2.5 w-2.5" />
                              10m
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-slate-400">
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Previous sync management */}
              {syncedEventsCount > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <span>{syncedEventsCount} events currently tracked in Google Calendar</span>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1 text-red-600 hover:underline dark:text-red-400 font-medium"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear previous events</span>
                  </button>
                </div>
              )}

              {/* Clear confirmation sub-dialog */}
              {showClearConfirm && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs dark:border-red-900/60 dark:bg-red-950/40">
                  <p className="font-bold text-red-900 dark:text-red-200">
                    Are you sure you want to remove previously synced DayFlow events from Google Calendar?
                  </p>
                  <p className="mt-1 text-red-700 dark:text-red-300">
                    This action will delete the routine events created by DayFlow in your calendar.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={handleClear}
                      disabled={isClearing}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      {isClearing ? 'Deleting...' : 'Yes, Delete from Calendar'}
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Error notice */}
              {syncError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  <p className="font-semibold">Sync error occurred:</p>
                  <p className="mt-0.5">{syncError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isSyncing && !syncSuccess && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            {user && (
              <button
                onClick={handleStartSync}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500"
              >
                <Calendar className="h-4 w-4" />
                <span>Confirm & Sync to Google Calendar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
