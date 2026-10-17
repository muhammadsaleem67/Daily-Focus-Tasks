export type RoutineCategoryId = 
  | 'morning'
  | 'health'
  | 'deep-work'
  | 'break'
  | 'meetings'
  | 'admin'
  | 'social'
  | 'review'
  | 'sleep';

export interface RoutineCategory {
  id: RoutineCategoryId;
  label: string;
  description: string;
  colorId: string; // Google Calendar colorId (1-11)
  colorName: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hex: string;
  iconName: string;
}

export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RoutineBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format (24h), e.g. "06:00", "08:00", "13:15"
  endTime: string;   // HH:mm format (24h), e.g. "06:30", "10:00", "15:15"
  category: RoutineCategoryId;
  colorId: string;   // Google Calendar Color ID 1-11
  has10MinReminder: boolean;
  days: DayOfWeek[];
  isDeepWork?: boolean;
  notes?: string;
}

export type ScheduleViewMode = 'timeline' | 'cards' | 'calendar';
export type ScheduleTab = 'weekday' | 'saturday' | 'sunday' | 'all';

export interface UserCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

export interface SyncedEventRecord {
  blockId: string;
  eventId: string;
  calendarId: string;
  summary: string;
  htmlLink?: string;
  syncedAt: string;
}
