import { renderHook, act } from '@testing-library/react-native';
import { useCalendar } from '../../src/hooks/useCalendar';

const NOW = new Date(2026, 10, 12, 14, 30); // Thu 12 Nov 2026

const monthOf = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

describe('useCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts on today in month view', () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.viewMode).toBe('month');
    expect(result.current.selectedDate).toEqual(NOW);
    expect(result.current.currentDate).toEqual(NOW);
  });

  it('moves the month grid along when the selected day crosses into another month', () => {
    const { result } = renderHook(() => useCalendar());

    act(() => result.current.selectDate(new Date(2026, 10, 30)));
    act(() => result.current.goToNextDay());
    expect(monthOf(result.current.selectedDate)).toBe('2026-12');
    expect(monthOf(result.current.currentDate)).toBe('2026-12');

    act(() => result.current.goToPrevDay());
    expect(monthOf(result.current.currentDate)).toBe('2026-11');
  });

  it('pages months without changing the selected day', () => {
    const { result } = renderHook(() => useCalendar());

    act(() => result.current.goToNextMonth());
    act(() => result.current.goToNextMonth());
    expect(monthOf(result.current.currentDate)).toBe('2027-1');
    expect(result.current.selectedDate).toEqual(NOW);

    act(() => result.current.goToToday());
    expect(monthOf(result.current.currentDate)).toBe('2026-11');
  });

  it('returns the same object between renders until state changes', () => {
    const { result, rerender } = renderHook(() => useCalendar());
    const first = result.current;

    rerender({});
    expect(result.current).toBe(first);

    act(() => result.current.setViewMode('day'));
    expect(result.current).not.toBe(first);
    // Callbacks stay stable even when state changes
    expect(result.current.selectDate).toBe(first.selectDate);
  });
});
