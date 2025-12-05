import { useState, useCallback } from 'react';
import { CalendarState, ViewMode } from '../types';
import { addMonths, addDays } from '../utils/dateHelpers';

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>({
    currentDate: new Date(),
    selectedDate: new Date(),
    viewMode: 'month',
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setState((prev) => ({ ...prev, selectedDate: date }));
  }, []);

  const goToNextMonth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: addMonths(prev.currentDate, 1),
    }));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentDate: addMonths(prev.currentDate, -1),
    }));
  }, []);

  const goToNextDay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDate: addDays(prev.selectedDate, 1),
    }));
  }, []);

  const goToPrevDay = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedDate: addDays(prev.selectedDate, -1),
    }));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setState((prev) => ({
      ...prev,
      currentDate: today,
      selectedDate: today,
    }));
  }, []);

  return {
    ...state,
    setViewMode,
    selectDate,
    goToNextMonth,
    goToPrevMonth,
    goToNextDay,
    goToPrevDay,
    goToToday,
  };
};






