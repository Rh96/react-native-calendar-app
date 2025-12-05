import { CalendarEvent } from '../types';
import { APP_CONFIG } from '../constants/config';

/**
 * Validates if a string is a valid event title
 */
export const isValidEventTitle = (title: string): boolean => {
  const trimmed = title.trim();
  return (
    trimmed.length >= APP_CONFIG.MIN_EVENT_TITLE_LENGTH &&
    trimmed.length <= APP_CONFIG.MAX_EVENT_TITLE_LENGTH
  );
};

/**
 * Validates if end date is after start date
 */
export const isValidEventDateRange = (
  startDate: Date,
  endDate: Date
): boolean => {
  return endDate > startDate;
};

/**
 * Validates a complete event object
 */
export const validateEvent = (
  event: Omit<CalendarEvent, 'id'>
): { isValid: boolean; error?: string } => {
  if (!isValidEventTitle(event.title)) {
    return {
      isValid: false,
      error: `Title must be between ${APP_CONFIG.MIN_EVENT_TITLE_LENGTH} and ${APP_CONFIG.MAX_EVENT_TITLE_LENGTH} characters`,
    };
  }

  if (!isValidEventDateRange(event.startDate, event.endDate)) {
    return {
      isValid: false,
      error: 'End time must be after start time',
    };
  }

  return { isValid: true };
};

/**
 * Type guard to check if a value is a valid color
 */
export const isValidColor = (color: string): boolean => {
  // Basic hex color validation
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};




