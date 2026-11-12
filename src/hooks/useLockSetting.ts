import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isLockEnabled,
  isBiometricAvailable,
  promptBiometric,
  setLockEnabled,
} from '../services/biometricLock';

/**
 * The Profile screen's "Biometric lock" setting for one user (ADR-003).
 *
 * - Turning ON requires one successful biometric prompt: it proves the sensor
 *   works and that the person changing the setting can actually unlock.
 * - Turning OFF needs no prompt: the user is already inside an unlocked app,
 *   and requiring it would trap anyone whose sensor stopped working.
 */
export const useLockSetting = (uid: string | null) => {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [isOn, canUse] = await Promise.all([isLockEnabled(uid), isBiometricAvailable()]);
        if (active) {
          setEnabled(isOn);
          setAvailable(canUse);
        }
      } catch {
        if (active) {
          setError("Couldn't load your lock setting.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [uid]);

  const setLock = useCallback(
    async (next: boolean) => {
      if (!uid) {
        return;
      }
      setError(null);
      setSaving(true);
      try {
        if (next) {
          const result = await promptBiometric('Confirm to turn on biometric lock');
          if (result !== 'success') {
            if (result === 'error' && mounted.current) {
              setError("Couldn't verify your fingerprint or face. The lock is still off.");
            }
            return; // cancelled: stay off quietly
          }
        }
        await setLockEnabled(uid, next);
        if (mounted.current) {
          setEnabled(next);
        }
      } catch {
        if (mounted.current) {
          setError(next ? "Couldn't turn on the lock. Please try again." : "Couldn't turn off the lock. Please try again.");
        }
      } finally {
        if (mounted.current) {
          setSaving(false);
        }
      }
    },
    [uid],
  );

  return {
    enabled,
    available,
    loading,
    saving,
    error,
    setLock,
    // Can always turn it off; can only turn it on with working biometrics
    canToggle: !loading && !saving && (enabled || available),
  };
};
