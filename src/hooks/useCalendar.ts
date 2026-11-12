import { useState, useCallback, useMemo } from 'react';
import { CalendarState, ViewMode } from '../types';
import { addMonths, addDays } from '../utils/dateHelpers';

/**
 * Calendar view state.
 *
 * - `currentDate`: which month the month grid shows.
 * - `selectedDate`: which day is selected (and shown in day view).
 *
 * Changing the selected day also moves the grid to that day's month, so
 * switching back to Month never shows a month without the selected day.
 * Paging months only moves the grid; the selected day stays where it was.
 */

/** Select `date` and bring the month grid along with it. */
const selectDay = (prev: CalendarState, date: Date): CalendarState => ({
  ...prev,
  selectedDate: date,
  currentDate: date,
});

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>(() => {
    const now = new Date();
    return { currentDate: now, selectedDate: now, viewMode: 'month' };
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setState((prev) => selectDay(prev, date));
  }, []);

  const goToNextMonth = useCallback(() => {
    setState((prev) => ({ ...prev, currentDate: addMonths(prev.currentDate, 1) }));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setState((prev) => ({ ...prev, currentDate: addMonths(prev.currentDate, -1) }));
  }, []);

  const goToNextDay = useCallback(() => {
    setState((prev) => selectDay(prev, addDays(prev.selectedDate, 1)));
  }, []);

  const goToPrevDay = useCallback(() => {
    setState((prev) => selectDay(prev, addDays(prev.selectedDate, -1)));
  }, []);

  const goToToday = useCallback(() => {
    setState((prev) => selectDay(prev, new Date()));
  }, []);

  // Same object between renders unless state changed, so consumers' memo and
  // useCallback dependencies on it actually work. Callbacks are already stable.
  return useMemo(
    () => ({
      ...state,
      setViewMode,
      selectDate,
      goToNextMonth,
      goToPrevMonth,
      goToNextDay,
      goToPrevDay,
      goToToday,
    }),
    [state, setViewMode, selectDate, goToNextMonth, goToPrevMonth, goToNextDay, goToPrevDay, goToToday],
  );
};
