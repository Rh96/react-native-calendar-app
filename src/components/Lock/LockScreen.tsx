import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
import { useTheme } from '../../theme';

interface LockScreenProps {
  biometricsAvailable: boolean;
  error: string | null;
  onUnlock: () => Promise<void>;
  /** Signs out; the user then signs in with their password. */
  onUsePassword: () => Promise<void>;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  biometricsAvailable,
  error,
  onUnlock,
  onUsePassword,
}) => {
  const { colors } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // Prompt straight away so unlocking is a single touch
  useEffect(() => {
    if (biometricsAvailable) {
      onUnlock();
    }
    // Only on first show; later attempts come from the Unlock button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUsePassword = useCallback(async () => {
    setSignOutError(null);
    setSigningOut(true);
    try {
      await onUsePassword();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : 'Please try again.');
      setSigningOut(false);
    }
  }, [onUsePassword]);

  const message = biometricsAvailable
    ? 'Use your fingerprint or face to open your calendar.'
    : "Biometric unlock isn't available on this device right now. Sign in with your password instead.";
  const shownError = signOutError ?? error;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MaterialDesignIcons name="lock" size={56} color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        Calendar locked
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

      {shownError && (
        <Text
          style={[styles.error, { color: colors.error }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          {shownError}
        </Text>
      )}

      {biometricsAvailable && (
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onUnlock}
          disabled={signingOut}
          accessibilityRole="button">
          <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Unlock</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleUsePassword}
        disabled={signingOut}
        accessibilityRole="button"
        accessibilityLabel="Use password"
        accessibilityHint="Signs you out so you can sign in with your password"
        accessibilityState={{ disabled: signingOut, busy: signingOut }}>
        {signingOut ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Use password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    alignSelf: 'stretch',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignSelf: 'stretch',
    height: 50,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
