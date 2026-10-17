import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  RoutineBlock,
  ScheduleTab,
  ScheduleViewMode,
  UserCalendar,
} from './types/schedule';
import {
  DEFAULT_WEEKDAY_BLOCKS,
  SATURDAY_LIGHT_BLOCKS,
  SUNDAY_PLANNING_BLOCKS,
} from './data/defaultRoutine';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  listUserCalendars,
  createDedicatedCalendar,
  createRoutineEvent,
  listSyncedRoutineEvents,
  deleteCalendarEvent,
  generateIcsFile,
} from './services/googleCalendar';
import { Header } from './components/Header';
import { CurrentFocusTracker } from './components/CurrentFocusTracker';
import { ScheduleStats } from './components/ScheduleStats';
import { WeekendTipsBanner } from './components/WeekendTipsBanner';
import { TimelineView } from './components/TimelineView';
import { CardsView } from './components/CardsView';
import { BlockModal } from './components/BlockModal';
import { SyncModal } from './components/SyncModal';
import {
  Calendar,
  Clock,
  LayoutList,
  LayoutGrid,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const STORAGE_KEY_WEEKDAY = 'dayflow_weekday_blocks';
const STORAGE_KEY_SATURDAY = 'dayflow_saturday_blocks';
const STORAGE_KEY_SUNDAY = 'dayflow_sunday_blocks';

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);

  // Routine blocks state
  const [weekdayBlocks, setWeekdayBlocks] = useState<RoutineBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEEKDAY);
      return saved ? JSON.parse(saved) : DEFAULT_WEEKDAY_BLOCKS;
    } catch {
      return DEFAULT_WEEKDAY_BLOCKS;
    }
  });

  const [saturdayBlocks, setSaturdayBlocks] = useState<RoutineBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SATURDAY);
      return saved ? JSON.parse(saved) : SATURDAY_LIGHT_BLOCKS;
    } catch {
      return SATURDAY_LIGHT_BLOCKS;
    }
  });

  const [sundayBlocks, setSundayBlocks] = useState<RoutineBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUNDAY);
      return saved ? JSON.parse(saved) : SUNDAY_PLANNING_BLOCKS;
    } catch {
      return SUNDAY_PLANNING_BLOCKS;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ScheduleTab>('weekday');
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('timeline');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<RoutineBlock | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    currentTitle: string;
  } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncedEventsCount, setSyncedEventsCount] = useState<number>(0);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        loadCalendarsAndSyncedEvents(token);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WEEKDAY, JSON.stringify(weekdayBlocks));
    } catch (e) {
      console.error(e);
    }
  }, [weekdayBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SATURDAY, JSON.stringify(saturdayBlocks));
    } catch (e) {
      console.error(e);
    }
  }, [saturdayBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUNDAY, JSON.stringify(sundayBlocks));
    } catch (e) {
      console.error(e);
    }
  }, [sundayBlocks]);

  const loadCalendarsAndSyncedEvents = async (token: string) => {
    try {
      const userCals = await listUserCalendars(token);
      setCalendars(userCals);

      const events = await listSyncedRoutineEvents(token, 'primary');
      setSyncedEventsCount(events.length);
    } catch (err) {
      console.warn('Could not fetch user calendars or synced events:', err);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        await loadCalendarsAndSyncedEvents(res.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCalendars([]);
    setSyncedEventsCount(0);
  };

  // Get current active blocks based on tab
  const getCurrentBlocks = () => {
    if (activeTab === 'saturday') return saturdayBlocks;
    if (activeTab === 'sunday') return sundayBlocks;
    return weekdayBlocks;
  };

  const setCurrentBlocks = (updater: (prev: RoutineBlock[]) => RoutineBlock[]) => {
    if (activeTab === 'saturday') {
      setSaturdayBlocks(updater);
    } else if (activeTab === 'sunday') {
      setSundayBlocks(updater);
    } else {
      setWeekdayBlocks(updater);
    }
  };

  // Block CRUD handlers
  const handleSaveBlock = (savedBlock: RoutineBlock) => {
    setCurrentBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === savedBlock.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedBlock;
        return next;
      }
      return [...prev, savedBlock];
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setCurrentBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleDuplicateBlock = (block: RoutineBlock) => {
    const newBlock: RoutineBlock = {
      ...block,
      id: `block-${Date.now()}`,
      title: `${block.title} (Copy)`,
    };
    setCurrentBlocks((prev) => [...prev, newBlock]);
  };

  const handleToggleReminder = (blockId: string) => {
    setCurrentBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, has10MinReminder: !b.has10MinReminder } : b
      )
    );
  };

  const handleResetToDefault = () => {
    const confirmReset = window.confirm(
      'Reset routine to the recommended schedule with 15 weekday blocks and 10-minute deep work alerts?'
    );
    if (!confirmReset) return;

    if (activeTab === 'saturday') {
      setSaturdayBlocks(SATURDAY_LIGHT_BLOCKS);
    } else if (activeTab === 'sunday') {
      setSundayBlocks(SUNDAY_PLANNING_BLOCKS);
    } else {
      setWeekdayBlocks(DEFAULT_WEEKDAY_BLOCKS);
    }
  };

  // Export .ICS
  const handleExportIcs = () => {
    const blocksToExport = getCurrentBlocks();
    const icsString = generateIcsFile(blocksToExport);
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayFlow-${activeTab}-Routine.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Google Calendar Sync
  const handleConfirmSync = async (targetCalendarId: string) => {
    let token = await getAccessToken();
    if (!token) {
      const loginRes = await googleSignIn();
      if (!loginRes) return;
      token = loginRes.accessToken;
      setUser(loginRes.user);
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      let finalCalendarId = targetCalendarId;

      // Create new secondary calendar if requested
      if (targetCalendarId === 'CREATE_NEW') {
        const newCal = await createDedicatedCalendar(
          token,
          'DayFlow - Daily Routine',
          'Automated daily routine blocks synchronized by DayFlow'
        );
        finalCalendarId = newCal.id;
        setCalendars((prev) => [newCal, ...prev]);
      }

      const blocksToSync = getCurrentBlocks();
      const total = blocksToSync.length;

      for (let i = 0; i < total; i++) {
        const block = blocksToSync[i];
        setSyncProgress({
          current: i + 1,
          total,
          currentTitle: block.title,
        });

        await createRoutineEvent(token, block, finalCalendarId);
        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 150));
      }

      setSyncSuccess(true);
      const events = await listSyncedRoutineEvents(token, finalCalendarId);
      setSyncedEventsCount(events.length);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncError(err.message || 'Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearPreviousSync = async (calendarId: string) => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      const events = await listSyncedRoutineEvents(token, calendarId);
      for (const ev of events) {
        if (ev.id) {
          await deleteCalendarEvent(token, ev.id, calendarId);
        }
      }
      setSyncedEventsCount(0);
    } catch (err: any) {
      console.error('Failed to clear events:', err);
      setSyncError('Failed to remove events from Google Calendar: ' + err.message);
    }
  };

  const currentBlocks = getCurrentBlocks();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onOpenSyncModal={() => {
          setSyncSuccess(false);
          setSyncError(null);
          setIsSyncModalOpen(true);
        }}
        onAddBlock={() => {
          setEditingBlock(null);
          setIsBlockModalOpen(true);
        }}
        onExportIcs={handleExportIcs}
        onResetDefault={handleResetToDefault}
        syncedCount={syncedEventsCount}
      />

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Live Focus Tracker Banner */}
        <CurrentFocusTracker
          blocks={currentBlocks}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* Schedule Insights Stats */}
        <ScheduleStats blocks={currentBlocks} />

        {/* Best Practice Tips Banner */}
        <WeekendTipsBanner
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Schedule Controls & View Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
          {/* Day / Schedule Context */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {activeTab === 'weekday' && 'Mon–Fri High-Performance Routine'}
                {activeTab === 'saturday' && 'Saturday Light Routine'}
                {activeTab === 'sunday' && 'Sunday Weekly Planning & Reset'}
              </span>
              <span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {currentBlocks.length} blocks
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'weekday' &&
                '15 structured blocks with 10-minute prep notifications for deep focus sessions'}
              {activeTab === 'saturday' &&
                'Lightweight, restorative pace with personal projects and leisure'}
              {activeTab === 'sunday' &&
                'Recharge, organize workspace, and set top priorities for the upcoming week'}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-2xs dark:bg-indigo-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span>Timeline View</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-2xs dark:bg-indigo-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Phase Cards</span>
            </button>
          </div>
        </div>

        {/* Active Schedule View */}
        {viewMode === 'timeline' ? (
          <TimelineView
            blocks={currentBlocks}
            onEditBlock={(block) => {
              setEditingBlock(block);
              setIsBlockModalOpen(true);
            }}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onToggleReminder={handleToggleReminder}
          />
        ) : (
          <CardsView
            blocks={currentBlocks}
            onEditBlock={(block) => {
              setEditingBlock(block);
              setIsBlockModalOpen(true);
            }}
            onDeleteBlock={handleDeleteBlock}
          />
        )}
      </main>

      {/* Edit / Add Block Modal */}
      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onSave={handleSaveBlock}
        initialBlock={editingBlock}
      />

      {/* Sync to Google Calendar Confirmation Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        blocks={currentBlocks}
        user={user}
        onLogin={handleLogin}
        onConfirmSync={handleConfirmSync}
        onClearPreviousSync={handleClearPreviousSync}
        calendars={calendars}
        isSyncing={isSyncing}
        syncProgress={syncProgress}
        syncError={syncError}
        syncSuccess={syncSuccess}
        syncedEventsCount={syncedEventsCount}
      />
    </div>
  );
}
