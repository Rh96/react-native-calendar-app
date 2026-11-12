import {
  isValidEventTitle,
  isValidEventDateRange,
  validateEvent,
  isValidColor,
} from '../../src/utils/validation';

describe('isValidEventTitle', () => {
  it('rejects empty and whitespace-only titles', () => {
    expect(isValidEventTitle('')).toBe(false);
    expect(isValidEventTitle('   ')).toBe(false);
  });

  it('accepts 1 to 100 characters, counted after trimming', () => {
    expect(isValidEventTitle('a')).toBe(true);
    expect(isValidEventTitle('a'.repeat(100))).toBe(true);
    expect(isValidEventTitle(`  ${'a'.repeat(100)}  `)).toBe(true);
    expect(isValidEventTitle('a'.repeat(101))).toBe(false);
  });
});

describe('isValidEventDateRange', () => {
  const start = new Date(2026, 10, 12, 9, 0);

  it('requires the end to be strictly after the start', () => {
    expect(isValidEventDateRange(start, new Date(2026, 10, 12, 9, 1))).toBe(true);
    expect(isValidEventDateRange(start, new Date(start))).toBe(false);
    expect(isValidEventDateRange(start, new Date(2026, 10, 12, 8, 59))).toBe(false);
  });
});

describe('validateEvent', () => {
  const valid = {
    title: 'Standup',
    startDate: new Date(2026, 10, 12, 9, 0),
    endDate: new Date(2026, 10, 12, 9, 15),
    color: '#4A90E2',
  };

  it('accepts a valid event', () => {
    expect(validateEvent(valid)).toEqual({ isValid: true });
  });

  it('reports the title problem first', () => {
    expect(validateEvent({ ...valid, title: ' ', endDate: valid.startDate })).toEqual({
      isValid: false,
      error: 'Title must be between 1 and 100 characters',
    });
  });

  it('reports an end time that is not after the start', () => {
    expect(validateEvent({ ...valid, endDate: valid.startDate })).toEqual({
      isValid: false,
      error: 'End time must be after start time',
    });
  });
});

describe('isValidColor', () => {
  it('accepts 3- and 6-digit hex colours in any case', () => {
    expect(isValidColor('#4A90E2')).toBe(true);
    expect(isValidColor('#4a90e2')).toBe(true);
    expect(isValidColor('#abc')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidColor('4A90E2')).toBe(false);
    expect(isValidColor('#GGGGGG')).toBe(false);
    expect(isValidColor('#4A90E2FF')).toBe(false);
    expect(isValidColor('blue')).toBe(false);
  });
});
