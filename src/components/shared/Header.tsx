import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
  logo?: string;
}

export const Header = memo<HeaderProps>(({ 
  showBackButton = false, 
  onBackPress, 
  title,
  logo = 'Calendar App'
}) => {
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
      <View style={styles.content}>
        {/* Left section - Back button or spacer */}
        <View style={styles.leftSection}>
          {showBackButton && onBackPress ? (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBackPress}
              activeOpacity={0.7}>
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                ‹ Back
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center section - Logo/Title */}
        <View style={styles.centerSection}>
          <Text style={[styles.logoText, { color: theme.colors.text }]}>
            {title || logo}
          </Text>
        </View>

        {/* Right section - Spacer for balance */}
        <View style={styles.rightSection}>
          <View style={styles.spacer} />
        </View>
      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 44,
  },
  leftSection: {
    width: 80,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 80,
    justifyContent: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  spacer: {
    width: 1,
  },
});

