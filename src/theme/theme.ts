export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Primary colors
  primary: string;
  primaryText: string;
  
  // State colors
  selected: string;
  selectedText: string;
  today: string;
  todayText: string;
  
  // Event colors
  eventColors: string[];
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#AAAAAA',
    border: '#E0E0E0',
    borderSecondary: '#CCCCCC',
    primary: '#4A90E2',
    primaryText: '#FFFFFF',
    selected: '#4A90E2',
    selectedText: '#FFFFFF',
    today: '#4A90E2',
    todayText: '#000000',
    eventColors: [
      '#4A90E2',
      '#F5A623',
      '#7B61FF',
      '#50C878',
      '#E74C3C',
      '#3498DB',
      '#E91E63',
      '#9C27B0',
    ],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#1E1E1E',
    surfaceSecondary: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textTertiary: '#666666',
    border: '#333333',
    borderSecondary: '#444444',
    primary: '#4A90E2',
    primaryText: '#FFFFFF',
    selected: '#4A90E2',
    selectedText: '#FFFFFF',
    today: '#4A90E2',
    todayText: '#FFFFFF',
    eventColors: [
      '#4A90E2',
      '#F5A623',
      '#7B61FF',
      '#50C878',
      '#E74C3C',
      '#3498DB',
      '#E91E63',
      '#9C27B0',
    ],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const themes: Record<ColorScheme, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};




