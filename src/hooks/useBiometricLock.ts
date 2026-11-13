import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  isLockEnabled,
  isBiometricAvailable,
  promptBiometric,
  clearLegacyCredentials,
} from '../services/biometricLock';
import { APP_CONFIG } from '../constants/config';

export type LockStatus = 'checking' | 'locked' | 'unlocked';

const PROMPT_MESSAGE = 'Unlock Calendar App';
const SETTINGS_UNREADABLE = "Couldn't check your lock settings. Sign in with your password.";

/** The lock setting and sensor state, or 'error' if they couldn't be read. */
type LockCheck = { enabled: boolean; available: boolean } | 'error';

const readLockCheck = async (uid: string): Promise<LockCheck> => {
  try {
    if (!(await isLockEnabled(uid))) {
      return { enabled: false, available: false };
    }
    return { enabled: true, available: await isBiometricAvailable() };
  } catch {
    return 'error';
  }
};

/** Taken when the app goes to the background; used when it returns. */
interface BackgroundVisit {
  at: number;
  uid: string;
  check: Promise<LockCheck>;
  result?: LockCheck;
}

/**
 * Decides whether the app must show the lock screen (ADR-003).
 *
 * - At startup, a *restored* session is locked if the lock is on. Signing in
 *   with a password during this launch is proof enough, so that isn't.
 * - After more than LOCK_AFTER_BACKGROUND_MS in the background, any session
 *   with the lock on is locked again, including one signed in with a password.
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
  // Latest values for the AppState listener, which is registered once
  const userRef = useRef(user);
  const statusRef = useRef(status);
  const backgroundVisit = useRef<BackgroundVisit | null>(null);

  useEffect(() => {
    userRef.current = user;
    statusRef.current = status;
  });

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
          setError(SETTINGS_UNREADABLE);
          setStatus('locked');
        }
      }
    })();
  }, [initializing, user]);

  // Lock again after time in the background
  useEffect(() => {
    const lockFrom = (check: LockCheck) => {
      if (!mounted.current || statusRef.current !== 'unlocked') {
        return;
      }
      if (check === 'error') {
        setError(SETTINGS_UNREADABLE); // fail closed, as at startup
        setStatus('locked');
      } else if (check.enabled) {
        // Availability first: LockScreen prompts on mount only if it's true
        setBiometricsAvailable(check.available);
        setError(null);
        setStatus('locked');
      }
    };

    const onChange = (next: AppStateStatus) => {
      // 'inactive' is ignored: the biometric prompt itself can cause it
      if (next === 'background') {
        const current = userRef.current;
        if (current && statusRef.current === 'unlocked' && !backgroundVisit.current) {
          // Read the setting now, so returning can lock at once instead of
          // showing the calendar while the keychain is read
          const visit: BackgroundVisit = {
            at: Date.now(),
            uid: current.uid,
            check: readLockCheck(current.uid),
          };
          visit.check.then((result) => {
            visit.result = result;
          });
          backgroundVisit.current = visit;
        }
        return;
      }
      if (next !== 'active') {
        return;
      }
      const visit = backgroundVisit.current;
      backgroundVisit.current = null;
      if (
        !visit ||
        Date.now() - visit.at < APP_CONFIG.LOCK_AFTER_BACKGROUND_MS ||
        userRef.current?.uid !== visit.uid
      ) {
        return;
      }
      if (visit.result) {
        lockFrom(visit.result);
      } else {
        visit.check.then(lockFrom); // still reading (unlikely after a minute)
      }
    };

    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

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
