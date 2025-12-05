import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { ViewMode } from '../../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewToggle = memo<ViewToggleProps>(({ viewMode, onModeChange }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <TouchableOpacity
        style={[
          styles.button,
          viewMode === 'month' && [
            styles.buttonActive,
            { backgroundColor: theme.colors.primary },
          ],
        ]}
        onPress={() => onModeChange('month')}>
        <Text
          style={[
            styles.buttonText,
            { color: theme.colors.text },
            viewMode === 'month' && styles.buttonTextActive,
          ]}>
          Month
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          viewMode === 'day' && [
            styles.buttonActive,
            { backgroundColor: theme.colors.primary },
          ],
        ]}
        onPress={() => onModeChange('day')}>
        <Text
          style={[
            styles.buttonText,
            { color: theme.colors.text },
            viewMode === 'day' && styles.buttonTextActive,
          ]}>
          Day
        </Text>
      </TouchableOpacity>
    </View>
  );
});

ViewToggle.displayName = 'ViewToggle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonActive: {
    // backgroundColor applied inline
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
});




