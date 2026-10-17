import { RoutineCategory, RoutineCategoryId } from '../types/schedule';

export const ROUTINE_CATEGORIES: Record<RoutineCategoryId, RoutineCategory> = {
  morning: {
    id: 'morning',
    label: 'Morning & Wakeup',
    description: 'Fresh start, hydration, hygiene & breakfast',
    colorId: '2', // Sage
    colorName: 'Sage',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/30',
    hex: '#33b679',
    iconName: 'Sun',
  },
  health: {
    id: 'health',
    label: 'Health & Exercise',
    description: 'Physical activity, walking, workouts',
    colorId: '10', // Basil
    colorName: 'Basil',
    bgClass: 'bg-teal-500/10 dark:bg-teal-500/20',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-500/30',
    hex: '#0b8043',
    iconName: 'Activity',
  },
  'deep-work': {
    id: 'deep-work',
    label: 'Deep Work / High Focus',
    description: 'Uninterrupted cognitively demanding tasks & study',
    colorId: '9', // Blueberry
    colorName: 'Blueberry',
    bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-500/40',
    hex: '#3f51b5',
    iconName: 'Brain',
  },
  break: {
    id: 'break',
    label: 'Break & Nourishment',
    description: 'Rest, recharge, lunch, snacks, screen breaks',
    colorId: '5', // Banana / Tangerine
    colorName: 'Banana',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-500/30',
    hex: '#f6bf26',
    iconName: 'Coffee',
  },
  meetings: {
    id: 'meetings',
    label: 'Classes & Meetings',
    description: 'Lectures, team check-ins, discussions',
    colorId: '3', // Grape
    colorName: 'Grape',
    bgClass: 'bg-purple-500/10 dark:bg-purple-500/20',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-500/30',
    hex: '#8e24aa',
    iconName: 'Users',
  },
  admin: {
    id: 'admin',
    label: 'Light Tasks & Admin',
    description: 'Emails, quick assignments, errands, correspondence',
    colorId: '4', // Flamingo
    colorName: 'Flamingo',
    bgClass: 'bg-rose-500/10 dark:bg-rose-500/20',
    textClass: 'text-rose-700 dark:text-rose-300',
    borderClass: 'border-rose-500/30',
    hex: '#e67c73',
    iconName: 'CheckSquare',
  },
  social: {
    id: 'social',
    label: 'Free Time & Social',
    description: 'Hobbies, family, friends, outdoor strolls',
    colorId: '1', // Lavender
    colorName: 'Lavender',
    bgClass: 'bg-violet-500/10 dark:bg-violet-500/20',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-500/30',
    hex: '#7986cb',
    iconName: 'Heart',
  },
  review: {
    id: 'review',
    label: 'Revision & Planning',
    description: 'Reviewing daily lessons, planning tomorrow',
    colorId: '8', // Graphite
    colorName: 'Graphite',
    bgClass: 'bg-slate-500/10 dark:bg-slate-500/20',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-500/30',
    hex: '#616161',
    iconName: 'CalendarCheck',
  },
  sleep: {
    id: 'sleep',
    label: 'Wind Down & Sleep',
    description: 'Screen-free relaxation, deep restorative sleep',
    colorId: '7', // Peacock
    colorName: 'Peacock',
    bgClass: 'bg-sky-500/10 dark:bg-sky-500/20',
    textClass: 'text-sky-700 dark:text-sky-300',
    borderClass: 'border-sky-500/30',
    hex: '#039be5',
    iconName: 'Moon',
  },
};

export const GOOGLE_CALENDAR_COLORS = [
  { id: '1', name: 'Lavender', hex: '#7986cb' },
  { id: '2', name: 'Sage', hex: '#33b679' },
  { id: '3', name: 'Grape', hex: '#8e24aa' },
  { id: '4', name: 'Flamingo', hex: '#e67c73' },
  { id: '5', name: 'Banana', hex: '#f6bf26' },
  { id: '6', name: 'Tangerine', hex: '#f4511e' },
  { id: '7', name: 'Peacock', hex: '#039be5' },
  { id: '8', name: 'Graphite', hex: '#616161' },
  { id: '9', name: 'Blueberry', hex: '#3f51b5' },
  { id: '10', name: 'Basil', hex: '#0b8043' },
  { id: '11', name: 'Tomato', hex: '#d50000' },
];
