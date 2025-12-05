import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Calendar dimensions
export const CALENDAR_CELL_SIZE = (SCREEN_WIDTH - 40) / 7;
export const CALENDAR_DAY_SIZE = 32;
export const CALENDAR_DAY_BORDER_RADIUS = 16;

// Modal dimensions
export const MODAL_MAX_WIDTH = SCREEN_WIDTH * 0.9;
export const MODAL_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;

// Button dimensions
export const BUTTON_HEIGHT = 44;
export const BUTTON_BORDER_RADIUS = 8;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
} as const;



