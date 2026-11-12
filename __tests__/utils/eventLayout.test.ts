import { layoutEvents, eventsOverlap, detectOverlapGroups } from '../../src/utils/eventLayout';
import type { CalendarEvent } from '../../src/types';

/** Event on 12 Nov 2026 from "HH:MM" to "HH:MM". */
const ev = (id: string, from: string, to: string): CalendarEvent => {
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  return {
    id,
    title: id,
    startDate: new Date(2026, 10, 12, fh, fm),
    endDate: new Date(2026, 10, 12, th, tm),
    color: '#4A90E2',
  };
};

/** id → [column, totalColumns], easier to read than full layout objects. */
const columnsById = (events: CalendarEvent[]) =>
  Object.fromEntries(
    layoutEvents(events).map((l) => [l.event.id, [l.column, l.totalColumns]]),
  );

describe('eventsOverlap', () => {
  it('treats back-to-back events as not overlapping', () => {
    expect(eventsOverlap(ev('a', '9:00', '10:00'), ev('b', '10:00', '11:00'))).toBe(false);
  });

  it('detects partial and full containment', () => {
    expect(eventsOverlap(ev('a', '9:00', '10:00'), ev('b', '9:30', '11:00'))).toBe(true);
    expect(eventsOverlap(ev('a', '9:00', '12:00'), ev('b', '10:00', '11:00'))).toBe(true);
  });
});

describe('detectOverlapGroups', () => {
  it('chains events that touch through a middle event into one group', () => {
    const groups = detectOverlapGroups([
      ev('C', '10:00', '10:30'),
      ev('A', '9:00', '10:00'),
      ev('D', '13:00', '14:00'),
      ev('B', '9:30', '11:00'),
    ]);

    expect(groups.map((g) => g.map((e) => e.id))).toEqual([['A', 'B', 'C'], ['D']]);
  });
});

describe('layoutEvents', () => {
  it('returns nothing for a day without events', () => {
    expect(layoutEvents([])).toEqual([]);
  });

  it('gives non-overlapping and back-to-back events the full width', () => {
    const layouts = layoutEvents([
      ev('a', '9:00', '10:00'),
      ev('b', '10:00', '11:00'),
      ev('c', '13:00', '14:00'),
    ]);

    layouts.forEach((l) => {
      expect(l).toMatchObject({ column: 0, totalColumns: 1, left: 0, width: 100 });
    });
  });

  it('reuses a column once an earlier event has ended (the HOW_IT_WORKS example)', () => {
    const events = [ev('A', '9:00', '10:00'), ev('B', '9:30', '11:00'), ev('C', '10:00', '10:30')];

    expect(columnsById(events)).toEqual({ A: [0, 2], B: [1, 2], C: [0, 2] });

    const byId = Object.fromEntries(layoutEvents(events).map((l) => [l.event.id, l]));
    expect(byId.B).toMatchObject({ left: 50, width: 50 });
    expect(byId.C).toMatchObject({ left: 0, width: 50 });
  });

  it('puts a nested event next to its container', () => {
    expect(columnsById([ev('outer', '9:00', '12:00'), ev('inner', '10:00', '11:00')])).toEqual({
      outer: [0, 2],
      inner: [1, 2],
    });
  });

  it('orders same-start events shortest first', () => {
    expect(
      columnsById([ev('long', '9:00', '11:00'), ev('mid', '9:00', '10:00'), ev('short', '9:00', '9:30')]),
    ).toEqual({ short: [0, 3], mid: [1, 3], long: [2, 3] });
  });

  it('keeps the column count minimal when a later event fits beside the long one', () => {
    // A overlaps both B and C, but B and C don't overlap each other → 2 columns, not 3
    expect(
      columnsById([ev('A', '9:00', '11:00'), ev('B', '9:30', '10:00'), ev('C', '10:15', '10:45')]),
    ).toEqual({ A: [0, 2], B: [1, 2], C: [1, 2] });
  });

  it('gives the same result whatever order events arrive in, without mutating the input', () => {
    const events = [ev('C', '10:00', '10:30'), ev('B', '9:30', '11:00'), ev('A', '9:00', '10:00')];
    const inputOrder = events.map((e) => e.id);

    expect(columnsById(events)).toEqual({ A: [0, 2], B: [1, 2], C: [0, 2] });
    expect(events.map((e) => e.id)).toEqual(inputOrder);
  });
});
