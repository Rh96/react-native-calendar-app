import { nextFullHourOn, addHours } from '../../src/utils/dateHelpers';

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
