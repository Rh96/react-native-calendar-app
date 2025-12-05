/**
 * Color constants used throughout the application
 * These are base colors that can be overridden by the theme system
 */

export const COLORS = {
  PRIMARY: '#4A90E2',
  PRIMARY_DARK: '#357ABD',
  PRIMARY_LIGHT: '#6BA3E8',
  
  // Event colors
  EVENT_BLUE: '#4A90E2',
  EVENT_ORANGE: '#F5A623',
  EVENT_PURPLE: '#7B61FF',
  EVENT_GREEN: '#50C878',
  EVENT_RED: '#E74C3C',
  EVENT_CYAN: '#3498DB',
  EVENT_PINK: '#E91E63',
  EVENT_VIOLET: '#9C27B0',
} as const;

export const EVENT_COLORS = [
  COLORS.EVENT_BLUE,
  COLORS.EVENT_ORANGE,
  COLORS.EVENT_PURPLE,
  COLORS.EVENT_GREEN,
  COLORS.EVENT_RED,
  COLORS.EVENT_CYAN,
  COLORS.EVENT_PINK,
  COLORS.EVENT_VIOLET,
] as const;



