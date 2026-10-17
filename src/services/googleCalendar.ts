import { RoutineBlock, UserCalendar, DayOfWeek } from '../types/schedule';
import { ROUTINE_CATEGORIES } from '../data/categories';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Map day codes to JS getDay() values (0 = Sunday, 1 = Monday, etc.)
const DAY_CODE_TO_NUM: Record<DayOfWeek, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

/**
 * Finds the upcoming date that matches the first day in the routine's day list.
 */
function getFirstOccurrenceDate(days: DayOfWeek[]): Date {
  const now = new Date();
  const currentDayNum = now.getDay();
  const targetDayNums = days.map((d) => DAY_CODE_TO_NUM[d]);

  // Find minimum days to add to reach one of targetDayNums (starting from today or tomorrow)
  for (let offset = 0; offset < 7; offset++) {
    const candidateDay = (currentDayNum + offset) % 7;
    if (targetDayNums.includes(candidateDay)) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + offset);
      return targetDate;
    }
  }
  return now;
}

/**
 * Formats date and HH:mm to ISO 8601 string without Z, matching local timezone
 */
function formatLocalISO(date: Date, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}:00`;
}

export interface GoogleCalendarEventResponse {
  id: string;
  summary: string;
  htmlLink: string;
  status: string;
}

export async function listUserCalendars(accessToken: string): Promise<UserCalendar[]> {
  try {
    const res = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch calendars (${res.status})`);
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary,
      primary: !!item.primary,
      backgroundColor: item.backgroundColor,
    }));
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
}

export async function createDedicatedCalendar(
  accessToken: string,
  summary: string = 'DayFlow - Daily Routine',
  description: string = 'Automated daily routine blocks created by DayFlow'
): Promise<UserCalendar> {
  const res = await fetch(`${CALENDAR_API_BASE}/calendars`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary,
      description,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create dedicated calendar');
  }

  const created = await res.json();
  return {
    id: created.id,
    summary: created.summary,
    primary: false,
  };
}

export async function createRoutineEvent(
  accessToken: string,
  block: RoutineBlock,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEventResponse> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = getFirstOccurrenceDate(block.days);
  const startDateTime = formatLocalISO(startDate, block.startTime);
  const endDateTime = formatLocalISO(startDate, block.endTime);

  const category = ROUTINE_CATEGORIES[block.category];
  const byDayRule = block.days.join(',');

  const remindersPayload = block.has10MinReminder
    ? {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      }
    : {
        useDefault: false,
        overrides: [],
      };

  const eventPayload = {
    summary: block.title,
    description: `Category: ${category?.label || block.category}\n` +
      (block.notes ? `Notes: ${block.notes}\n\n` : '') +
      (block.has10MinReminder ? '🔔 Notification set 10 minutes before start.\n' : '') +
      'Created with DayFlow Routine Planner',
    start: {
      dateTime: startDateTime,
      timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone,
    },
    recurrence: [`RRULE:FREQ=WEEKLY;BYDAY=${byDayRule}`],
    colorId: block.colorId,
    reminders: remindersPayload,
    extendedProperties: {
      private: {
        dayflowRoutine: 'true',
        routineBlockId: block.id,
        category: block.category,
      },
    },
  };

  const res = await fetch(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create event '${block.title}' (${res.status})`);
  }

  return await res.json();
}

export async function listSyncedRoutineEvents(
  accessToken: string,
  calendarId: string = 'primary'
): Promise<any[]> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=dayflowRoutine=true&maxResults=250`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list synced events');
  }

  const data = await res.json();
  return data.items || [];
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete event (${res.status})`);
  }
}

/**
 * Generate iCalendar (.ics) content for all routine blocks so users can import or use offline
 */
export function generateIcsFile(blocks: RoutineBlock[]): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DayFlow//Routine Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-TIMEZONE:${timeZone}`,
  ];

  blocks.forEach((block, idx) => {
    const startDate = getFirstOccurrenceDate(block.days);
    const startStr = formatLocalISO(startDate, block.startTime).replace(/[-:]/g, '');
    const endStr = formatLocalISO(startDate, block.endTime).replace(/[-:]/g, '');
    const byDay = block.days.join(',');

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:dayflow-${block.id}-${idx}@dayflow.app`);
    icsLines.push(`DTSTAMP:${stamp}`);
    icsLines.push(`DTSTART;TZID=${timeZone}:${startStr}`);
    icsLines.push(`DTEND;TZID=${timeZone}:${endStr}`);
    icsLines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
    icsLines.push(`SUMMARY:${block.title.replace(/,/g, '\\,')}`);
    icsLines.push(`DESCRIPTION:${(block.notes || block.title).replace(/,/g, '\\,')}`);

    if (block.has10MinReminder) {
      icsLines.push('BEGIN:VALARM');
      icsLines.push('TRIGGER:-PT10M');
      icsLines.push('ACTION:DISPLAY');
      icsLines.push(`DESCRIPTION:Reminder: ${block.title.replace(/,/g, '\\,')} starts in 10 minutes`);
      icsLines.push('END:VALARM');
    }

    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}
