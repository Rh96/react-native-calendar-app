import {
  nextFullHourOn,
  addHours,
  addDays,
  addMonths,
  getDaysInMonth,
  generateCalendarDays,
  getEventsForDay,
  isSameDay,
  formatHour,
} from '../../src/utils/dateHelpers';
import type { CalendarEvent } from '../../src/types';

// Time zone is pinned to Europe/Berlin in jest.config.js.
// 2026 DST: clocks go forward on 29 Mar (02:00 → 03:00), back on 25 Oct.

const event = (id: string, start: Date, end: Date): CalendarEvent => ({
  id,
  title: id,
  startDate: start,
  endDate: end,
  color: '#4A90E2',
});

describe('getDaysInMonth', () => {
  it('handles month lengths and leap years', () => {
    expect(getDaysInMonth(new Date(2026, 0, 15))).toBe(31);
    expect(getDaysInMonth(new Date(2026, 3, 1))).toBe(30);
    expect(getDaysInMonth(new Date(2026, 1, 1))).toBe(28);
    expect(getDaysInMonth(new Date(2024, 1, 1))).toBe(29);
    expect(getDaysInMonth(new Date(2100, 1, 1))).toBe(28); // century, not divisible by 400
    expect(getDaysInMonth(new Date(2000, 1, 1))).toBe(29); // divisible by 400
  });
});

describe('generateCalendarDays', () => {
  it('starts on the 1st with no filler when the month starts on Sunday (Nov 2026)', () => {
    const days = generateCalendarDays(new Date(2026, 10, 12), []);

    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({ date: new Date(2026, 10, 1), isCurrentMonth: true });
    expect(days[29]).toMatchObject({ date: new Date(2026, 10, 30), isCurrentMonth: true });
    expect(days[30]).toMatchObject({ date: new Date(2026, 11, 1), isCurrentMonth: false });
    expect(days[41].date).toEqual(new Date(2026, 11, 12));
  });

  it('needs all 6 rows for a 31-day month starting on Saturday (Aug 2026)', () => {
    const days = generateCalendarDays(new Date(2026, 7, 1), []);
    const inMonth = days.filter((d) => d.isCurrentMonth);

    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({ date: new Date(2026, 6, 26), isCurrentMonth: false });
    expect(days[6]).toMatchObject({ date: new Date(2026, 7, 1), isCurrentMonth: true });
    expect(inMonth).toHaveLength(31);
    expect(days[36].date).toEqual(new Date(2026, 7, 31)); // last day lands in row 6
  });

  it('produces consecutive calendar days through a DST change (Mar 2026)', () => {
    const days = generateCalendarDays(new Date(2026, 2, 1), []);

    days.slice(1).forEach((day, i) => {
      expect(isSameDay(day.date, addDays(days[i].date, 1))).toBe(true);
    });
  });

  it('marks today and attaches each event to the day it starts on', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 12, 14, 30));
    const late = event('late', new Date(2026, 10, 12, 23, 30), new Date(2026, 10, 12, 23, 59));
    const nextMonth = event('dec', new Date(2026, 11, 3, 9), new Date(2026, 11, 3, 10));

    const days = generateCalendarDays(new Date(2026, 10, 1), [late, nextMonth]);
    jest.useRealTimers();

    expect(days.filter((d) => d.isToday).map((d) => d.date)).toEqual([new Date(2026, 10, 12)]);
    expect(days[11].events.map((e) => e.id)).toEqual(['late']); // 12 Nov
    expect(days[32].events.map((e) => e.id)).toEqual(['dec']); // 3 Dec, shown greyed
  });
});

describe('getEventsForDay', () => {
  it('matches by calendar day, from midnight to 23:59', () => {
    const events = [
      event('midnight', new Date(2026, 10, 12, 0, 0), new Date(2026, 10, 12, 1, 0)),
      event('late', new Date(2026, 10, 12, 23, 59), new Date(2026, 10, 13, 0, 0)),
      event('nextDay', new Date(2026, 10, 13, 0, 0), new Date(2026, 10, 13, 1, 0)),
    ];

    expect(getEventsForDay(new Date(2026, 10, 12, 15), events).map((e) => e.id)).toEqual([
      'midnight',
      'late',
    ]);
  });
});

describe('date arithmetic across DST', () => {
  it('addDays keeps the wall-clock time when clocks change', () => {
    expect(addDays(new Date(2026, 2, 28, 10, 0), 1)).toEqual(new Date(2026, 2, 29, 10, 0));
    expect(addDays(new Date(2026, 9, 24, 10, 0), 1)).toEqual(new Date(2026, 9, 25, 10, 0));
  });

  it('addHours skips the missing hour when clocks go forward', () => {
    // 02:00–02:59 doesn't exist on 29 Mar in Berlin; one real hour after 01:30 is 03:30
    expect(addHours(new Date(2026, 2, 29, 1, 30), 1).getHours()).toBe(3);
  });

  it('addMonths moves across year boundaries', () => {
    expect(addMonths(new Date(2026, 11, 1), 1)).toEqual(new Date(2027, 0, 1));
    expect(addMonths(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 1));
  });
});

describe('day view helpers', () => {
  it('formats hours as 12-hour labels', () => {
    expect([0, 1, 11, 12, 13, 23].map(formatHour)).toEqual([
      '12 AM',
      '1 AM',
      '11 AM',
      '12 PM',
      '1 PM',
      '11 PM',
    ]);
  });
});

describe('nextFullHourOn', () => {
  const day = new Date(2026, 10, 20); // midnight, as selected from the month grid

  it('uses the hour after "now" on the given day', () => {
    expect(nextFullHourOn(day, new Date(2026, 10, 12, 14, 30))).toEqual(
      new Date(2026, 10, 20, 15, 0),
    );
  });

  it('rounds up even on the exact hour', () => {
    expect(nextFullHourOn(day, new Date(2026, 10, 12, 14, 0))).toEqual(
      new Date(2026, 10, 20, 15, 0),
    );
  });

  it('caps at 23:00 so the default never moves to the next day', () => {
    expect(nextFullHourOn(day, new Date(2026, 10, 12, 23, 45))).toEqual(
      new Date(2026, 10, 20, 23, 0),
    );
  });

  it('does not modify the day passed in', () => {
    const original = new Date(day);
    nextFullHourOn(day, new Date(2026, 10, 12, 9, 0));
    expect(day).toEqual(original);
  });
});

describe('addHours', () => {
  it('adds and subtracts hours across a day boundary', () => {
    expect(addHours(new Date(2026, 10, 12, 23, 0), 2)).toEqual(new Date(2026, 10, 13, 1, 0));
    expect(addHours(new Date(2026, 10, 12, 0, 30), -1)).toEqual(new Date(2026, 10, 11, 23, 30));
  });
});
