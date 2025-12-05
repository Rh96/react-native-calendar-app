import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface TodayButtonProps {
  onPress: () => void;
}

export const TodayButton = memo<TodayButtonProps>(({ onPress }) => {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          bottom: safeAreaInsets.bottom + 20,
          backgroundColor: theme.colors.primary,
        },
      ]}
      onPress={onPress}>
      <Text style={styles.buttonText}>Today</Text>
    </TouchableOpacity>
  );
});

TodayButton.displayName = 'TodayButton';

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});




