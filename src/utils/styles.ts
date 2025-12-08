import { ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../theme';

/**
 * Creates a themed style that adapts to the current theme
 */
export const createThemedStyle = <T extends Record<string, ViewStyle | TextStyle>>(
  stylesFn: (theme: Theme) => T
) => {
  return stylesFn;
};

/**
 * Combines multiple style objects into one
 */
export const combineStyles = <T extends ViewStyle | TextStyle>(
  ...styles: (T | undefined | false | null)[]
): T => {
  return Object.assign({}, ...styles.filter(Boolean)) as T;
};

/**
 * Creates a shadow style for iOS and Android
 */
export const createShadow = (
  elevation: number = 2,
  shadowOpacity: number = 0.2
): ViewStyle => {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity,
    shadowRadius: elevation * 2,
    elevation,
  };
};




