import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useLockSetting } from '../../hooks/useLockSetting';

export const ProfileScreen = memo(() => {
  const theme = useTheme();
  const { user, signOut, submitting } = useAuth();
  const lock = useLockSetting(user?.uid ?? null);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      // AuthContext already converted this into a user-facing message
      Alert.alert('Sign out failed', err instanceof Error ? err.message : 'Please try again.');
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

        <View style={[styles.settingRow, { borderColor: theme.colors.border }]}>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
              Biometric lock
            </Text>
            <Text style={[styles.settingHelp, { color: theme.colors.textSecondary }]}>
              {lock.available || lock.enabled
                ? 'Ask for your fingerprint or face when the app opens and after a minute away.'
                : "Set up fingerprint or face unlock in your phone's settings to use this."}
            </Text>
          </View>
          {lock.loading || lock.saving ? (
            <ActivityIndicator color={theme.colors.primary} accessibilityLabel="Updating biometric lock" />
          ) : (
            <Switch
              value={lock.enabled}
              onValueChange={lock.setLock}
              disabled={!lock.canToggle}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              accessibilityLabel="Biometric lock"
              // RN only derives this from `disabled` on Android; set it for both platforms
              accessibilityState={{ disabled: !lock.canToggle }}
              accessibilityHint="Requires your fingerprint or face to open the app"
            />
          )}
        </View>
        {lock.error && (
          <Text
            style={[styles.settingError, { color: theme.colors.error }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite">
            {lock.error}
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            submitting && styles.buttonDisabled,
          ]}
          onPress={handleLogout}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          accessibilityState={{ disabled: submitting, busy: submitting }}>
          {submitting ? (
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingHelp: {
    fontSize: 13,
    marginTop: 4,
  },
  settingError: {
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

