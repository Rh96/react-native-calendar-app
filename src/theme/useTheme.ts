import { useThemeContext } from './ThemeProvider';
import { Theme } from './theme';

/**
 * Hook to access the current theme
 * @returns The current theme object
 */
export const useTheme = (): Theme => {
  const { theme } = useThemeContext();
  return theme;
};



