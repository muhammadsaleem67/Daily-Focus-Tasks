import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_WEEKDAY_BLOCKS } from '../data/defaultRoutine.ts';
import { generateIcsFile } from './googleCalendar.ts';
import { ROUTINE_CATEGORIES } from '../data/categories.ts';

test('DEFAULT_WEEKDAY_BLOCKS has 15 items starting with Wake up at 6:00 AM', () => {
  assert.equal(DEFAULT_WEEKDAY_BLOCKS.length, 15);
  assert.equal(DEFAULT_WEEKDAY_BLOCKS[0].startTime, '06:00');
  assert.equal(DEFAULT_WEEKDAY_BLOCKS[0].endTime, '06:30');
  assert.equal(DEFAULT_WEEKDAY_BLOCKS[0].title, 'Wake up, water, freshen up');
});

test('Deep work blocks have 10-minute reminders enabled', () => {
  const block1 = DEFAULT_WEEKDAY_BLOCKS.find((b) => b.id === 'block-4');
  const block2 = DEFAULT_WEEKDAY_BLOCKS.find((b) => b.id === 'block-6');

  assert.ok(block1);
  assert.ok(block2);
  assert.equal(block1?.has10MinReminder, true);
  assert.equal(block2?.has10MinReminder, true);
  assert.equal(block1?.category, 'deep-work');
  assert.equal(block2?.category, 'deep-work');
});

test('Google Calendar color categories are mapped correctly', () => {
  assert.equal(ROUTINE_CATEGORIES['deep-work'].colorId, '9'); // Blueberry
  assert.equal(ROUTINE_CATEGORIES['break'].colorId, '5'); // Banana
  assert.equal(ROUTINE_CATEGORIES['meetings'].colorId, '3'); // Grape
  assert.equal(ROUTINE_CATEGORIES['admin'].colorId, '4'); // Flamingo
  assert.equal(ROUTINE_CATEGORIES['social'].colorId, '1'); // Lavender
  assert.equal(ROUTINE_CATEGORIES['review'].colorId, '8'); // Graphite
});

test('generateIcsFile outputs valid RFC5545 iCalendar data', () => {
  const ics = generateIcsFile(DEFAULT_WEEKDAY_BLOCKS);
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('END:VCALENDAR'));
  assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'));
  assert.ok(ics.includes('BEGIN:VALARM')); // 10-minute alarms included
  assert.ok(ics.includes('TRIGGER:-PT10M'));
});
