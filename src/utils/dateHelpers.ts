import { CalendarDay, CalendarEvent } from '../types';

/**
 * Get the number of days in a given month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 */
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Format date as "Month YYYY"
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Format date as "Day, Month DD, YYYY"
 */
export const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time as "HH:MM AM/PM"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date only (without time)
 */
export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time only (without date)
 */
export const formatTimeOnly = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format time range
 */
export const formatTimeRange = (start: Date, end: Date): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

/**
 * Generate calendar grid for a given month
 * Returns array of 42 days (6 weeks x 7 days)
 */
export const generateCalendarDays = (
  date: Date,
  events: CalendarEvent[]
): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = getFirstDayOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const daysInPrevMonth = getDaysInMonth(
    new Date(year, month - 1, 1)
  );

  const days: CalendarDay[] = [];

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const currentDate = new Date(year, month - 1, day);
    days.push({
      date: currentDate,
      isCurrentMonth: false,
      isToday: isToday(currentDate),
      events: getEventsForDay(currentDate, events),
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday: isToday(currentDate),
      events: getEventsForDay(currentDate, events),
    });
  }

  // Next month's days to fill the grid
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const currentDate = new Date(year, month + 1, day);
    days.push({
      date: currentDate,
      isCurrentMonth: false,
      isToday: isToday(currentDate),
      events: getEventsForDay(currentDate, events),
    });
  }

  return days;
};

/**
 * Get events for a specific day
 */
export const getEventsForDay = (
  date: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter((event) => isSameDay(event.startDate, date));
};

/**
 * Get events for a specific date range
 */
export const getEventsForDateRange = (
  startDate: Date,
  endDate: Date,
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.filter((event) => {
    const eventStart = event.startDate.getTime();
    const rangeStart = startDate.getTime();
    const rangeEnd = endDate.getTime();
    return eventStart >= rangeStart && eventStart <= rangeEnd;
  });
};

/**
 * Get hour from date (0-23)
 */
export const getHour = (date: Date): number => {
  return date.getHours();
};

/**
 * Get minutes from date (0-59)
 */
export const getMinutes = (date: Date): number => {
  return date.getMinutes();
};

/**
 * Calculate position percentage for event in day view
 * Returns top position as percentage (0-100)
 */
export const calculateEventPosition = (date: Date): number => {
  const hour = getHour(date);
  const minutes = getMinutes(date);
  return ((hour * 60 + minutes) / (24 * 60)) * 100;
};

/**
 * Calculate height percentage for event duration
 */
export const calculateEventHeight = (start: Date, end: Date): number => {
  const durationMinutes =
    (end.getTime() - start.getTime()) / (1000 * 60);
  return (durationMinutes / (24 * 60)) * 100;
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Generate array of hours for day view (0-23)
 */
export const generateHours = (): number[] => {
  return Array.from({ length: 24 }, (_, i) => i);
};

/**
 * Format hour for display (e.g., "9 AM", "2 PM")
 */
export const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};



