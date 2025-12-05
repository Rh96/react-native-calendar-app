import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { ViewToggle } from './ViewToggle';
import { ViewMode } from '../../types';

interface TopBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddEvent: () => void;
}

export const TopBar = memo<TopBarProps>(
  ({ viewMode, onViewModeChange, onAddEvent }) => {
    const theme = useTheme();
    const safeAreaInsets = useSafeAreaInsets();

    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: safeAreaInsets.top,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}>
        <ViewToggle viewMode={viewMode} onModeChange={onViewModeChange} />
        <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

TopBar.displayName = 'TopBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});




