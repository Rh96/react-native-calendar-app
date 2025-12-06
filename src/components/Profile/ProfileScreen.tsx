import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

export const ProfileScreen = memo(() => {
  const theme = useTheme();
  const { user, signOut, loading } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      // Error handling is done in AuthContext
    }
  }, [signOut]);

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
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={handleLogout}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.colors.primaryText }]}>
              Log Out
            </Text>
          )}
        </TouchableOpacity>
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
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

