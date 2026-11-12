import { useState, useEffect, useRef, useCallback } from 'react';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  isLockEnabled,
  isBiometricAvailable,
  promptBiometric,
  clearLegacyCredentials,
} from '../services/biometricLock';

export type LockStatus = 'checking' | 'locked' | 'unlocked';

const PROMPT_MESSAGE = 'Unlock Calendar App';

/**
 * Decides whether the app must show the lock screen (ADR-003).
 *
 * Only a session *restored at startup* can be locked. Signing in with a
 * password during this launch is proof enough, so it is never locked.
 */
export const useBiometricLock = (
  user: FirebaseAuthTypes.User | null,
  initializing: boolean,
) => {
  const [status, setStatus] = useState<LockStatus>('checking');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Decided once per app launch, when Firebase finishes restoring the session
  const decided = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (initializing || decided.current) {
      return;
    }
    decided.current = true;

    // Best-effort cleanup of data from the old password-storing design
    clearLegacyCredentials().catch(() => {});

    if (!user) {
      setStatus('unlocked'); // no restored session; any later sign-in is interactive
      return;
    }

    const restoredUid = user.uid;
    (async () => {
      try {
        if (!(await isLockEnabled(restoredUid))) {
          if (mounted.current) {
            setStatus('unlocked');
          }
          return;
        }
        const available = await isBiometricAvailable();
        if (mounted.current) {
          setBiometricsAvailable(available);
          setStatus('locked');
        }
      } catch {
        // Fail closed: if the setting can't be read, don't let the session through
        if (mounted.current) {
          setError("Couldn't check your lock settings. Sign in with your password.");
          setStatus('locked');
        }
      }
    })();
  }, [initializing, user]);

  // After signing out (e.g. "Use password"), the next sign-in is interactive
  useEffect(() => {
    if (!initializing && !user && decided.current) {
      setStatus('unlocked');
      setError(null);
    }
  }, [initializing, user]);

  const unlock = useCallback(async () => {
    if (!biometricsAvailable) {
      return;
    }
    setError(null);
    const result = await promptBiometric(PROMPT_MESSAGE);
    if (!mounted.current) {
      return;
    }
    if (result === 'success') {
      setStatus('unlocked');
    } else if (result === 'error') {
      setError("Couldn't verify your identity. Try again or use your password.");
    }
    // 'cancelled': stay locked quietly; the user chose to cancel
  }, [biometricsAvailable]);

  return { status, biometricsAvailable, error, unlock };
};
