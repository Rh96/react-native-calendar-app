import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

export const ProfileScreen = memo(() => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Email:
            </Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {user.email}
            </Text>
          </View>
        )}
        <Text style={[styles.placeholder, { color: theme.colors.textSecondary }]}>
          Profile details will be implemented later
        </Text>
      </View>
    </View>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  userInfo: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
  },
});

