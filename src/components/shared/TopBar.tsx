import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
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
    const { signOut, user } = useAuth();

    const handleLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

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
        <View style={styles.leftSection}>
          <ViewToggle viewMode={viewMode} onModeChange={onViewModeChange} />
          {user && (
            <TouchableOpacity style={[styles.logoutButton, { marginLeft: 12 }]} onPress={handleLogout}>
              <Text style={[styles.logoutButtonText, { color: theme.colors.textSecondary }]}>
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
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




