import { useEffect, useRef, useState } from 'react';

interface UseBiometricAuthOptions {
  enabled: boolean;
  biometricAvailable: boolean;
  hasStoredCredentials: boolean;
  authLoading: boolean;
  user: any;
  signInWithBiometrics: () => Promise<void>;
}

interface UseBiometricAuthResult {
  attemptingBiometric: boolean;
}

/**
 * Custom hook for biometric authentication
 * Extracts biometric authentication logic from components
 * Handles auto-prompt on app launch
 */
export const useBiometricAuth = ({
  enabled,
  biometricAvailable,
  hasStoredCredentials,
  authLoading,
  user,
  signInWithBiometrics,
}: UseBiometricAuthOptions): UseBiometricAuthResult => {
  const biometricAttempted = useRef(false);
  const [attemptingBiometric, setAttemptingBiometric] = useState(false);

  // Auto-prompt biometric authentication when app loads and user is not authenticated
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const attemptBiometricSignIn = async () => {
      // Only attempt if:
      // 1. Auth loading is complete
      // 2. User is not authenticated
      // 3. Biometrics are available
      // 4. Credentials are stored
      // 5. We haven't already attempted
      if (
        !authLoading &&
        !user &&
        biometricAvailable &&
        hasStoredCredentials &&
        !biometricAttempted.current
      ) {
        biometricAttempted.current = true;
        setAttemptingBiometric(true);

        try {
          await signInWithBiometrics();
          // Success - user will be authenticated via auth state listener
        } catch (error) {
          // Biometric auth failed or was cancelled - show login screen
          console.log('[useBiometricAuth] Biometric authentication failed or cancelled:', error);
        } finally {
          setAttemptingBiometric(false);
        }
      }
    };

    attemptBiometricSignIn();
  }, [
    enabled,
    authLoading,
    user,
    biometricAvailable,
    hasStoredCredentials,
    signInWithBiometrics,
  ]);

  // Reset biometric attempt flag when user signs in
  useEffect(() => {
    if (user) {
      biometricAttempted.current = false;
    }
  }, [user]);

  return {
    attemptingBiometric,
  };
};
