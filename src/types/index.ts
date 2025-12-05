/**
 * Represents a calendar event
 */
export interface CalendarEvent {
  /** Unique identifier for the event */
  id: string;
  /** Title of the event */
  title: string;
  /** Start date and time of the event */
  startDate: Date;
  /** End date and time of the event */
  endDate: Date;
  /** Color code (hex) for the event */
  color: string;
  /** Optional description of the event */
  description?: string;
}

/**
 * Represents a day in the calendar grid
 */
export interface CalendarDay {
  /** The date for this day */
  date: Date;
  /** Whether this day belongs to the current month being displayed */
  isCurrentMonth: boolean;
  /** Whether this day is today */
  isToday: boolean;
  /** Events scheduled for this day */
  events: CalendarEvent[];
}

/**
 * Available view modes for the calendar
 */
export type ViewMode = 'month' | 'day';

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date;
  viewMode: ViewMode;
}



