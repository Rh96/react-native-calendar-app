import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

/**
 * Biometric app lock (ADR-003).
 *
 * Biometrics *lock an existing Firebase session*; they never replace the
 * password. The only thing stored is a per-user "lock enabled" flag. No
 * credentials are ever written to the device.
 */

const LOCK_SERVICE_PREFIX = 'com.calendarapp.biometricLock.';
const LOCK_FLAG_VALUE = 'enabled';

/** Keychain services used by the old, never-wired password storage. */
const LEGACY_SERVICES = [
  'com.calendarapp.credentials',
  'com.calendarapp.biometrics_enabled',
];

export type BiometricPromptResult = 'success' | 'cancelled' | 'error';

// Biometrics only: falling back to the device PIN is the OS's job, not ours.
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

/** One keychain entry per user, so users on a shared device don't overwrite each other. */
const lockService = (uid: string) => `${LOCK_SERVICE_PREFIX}${uid}`;

export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const { available } = await rnBiometrics.isSensorAvailable();
    return available;
  } catch {
    // No sensor / not enrolled / native error: all mean "can't use biometrics now"
    return false;
  }
};

export const promptBiometric = async (
  promptMessage: string,
): Promise<BiometricPromptResult> => {
  try {
    // Resolves success: false when the user cancels; the OS handles retries.
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });
    return success ? 'success' : 'cancelled';
  } catch {
    return 'error';
  }
};

/**
 * Whether `uid` has turned on the lock. Throws if the keychain can't be read,
 * so the caller can fail closed: an unreadable setting must not unlock.
 */
export const isLockEnabled = async (uid: string): Promise<boolean> => {
  const entry = await Keychain.getGenericPassword({ service: lockService(uid) });
  return Boolean(entry) && entry !== false && entry.password === LOCK_FLAG_VALUE;
};

export const setLockEnabled = async (uid: string, enabled: boolean): Promise<void> => {
  if (enabled) {
    await Keychain.setGenericPassword(uid, LOCK_FLAG_VALUE, {
      service: lockService(uid),
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } else {
    await Keychain.resetGenericPassword({ service: lockService(uid) });
  }
};

/**
 * Remove anything the old credential-storage code may have written.
 * That code was never wired up, so this is a safety net.
 */
export const clearLegacyCredentials = async (): Promise<void> => {
  await Promise.all(
    LEGACY_SERVICES.map((service) => Keychain.resetGenericPassword({ service })),
  );
};
