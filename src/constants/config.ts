/**
 * Application configuration constants
 */

export const APP_CONFIG = {
  // Calendar configuration
  CALENDAR_WEEKS_TO_DISPLAY: 6,
  CALENDAR_DAYS_PER_WEEK: 7,
  MAX_EVENT_DOTS_PER_DAY: 3,
  
  // Event configuration
  DEFAULT_EVENT_DURATION_HOURS: 1,
  MIN_EVENT_TITLE_LENGTH: 1,
  MAX_EVENT_TITLE_LENGTH: 100,
  
  // Time configuration
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  
  // UI configuration
  ACTIVE_OPACITY: 0.7,
  OTHER_MONTH_OPACITY: 0.3,
} as const;

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;



