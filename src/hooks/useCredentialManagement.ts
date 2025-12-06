import { useState, useEffect, useCallback } from 'react';
import { ICredentialManager } from '../services/interfaces/ICredentialManager';
import { ISecureStorageService } from '../services/interfaces/ISecureStorageService';
import { IBiometricService } from '../services/interfaces/IBiometricService';

interface UseCredentialManagementOptions {
  credentialManager: ICredentialManager;
  secureStorage: ISecureStorageService;
  biometricService: IBiometricService;
  user: any;
}

interface UseCredentialManagementResult {
  hasStoredCredentials: boolean;
  biometricAvailable: boolean;
  saveCredentialsAfterAuth: (email: string, password: string) => Promise<void>;
  clearCredentialsOnSignOut: () => Promise<void>;
}

/**
 * Custom hook for credential management
 * Handles credential state and operations
 * Separates credential management logic from AuthContext
 */
export const useCredentialManagement = ({
  credentialManager,
  secureStorage,
  biometricService,
  user,
}: UseCredentialManagementOptions): UseCredentialManagementResult => {
  const [hasStoredCredentials, setHasStoredCredentials] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);

  // Check biometric availability and stored credentials on mount and when user changes
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [isAvailable, hasCredentials] = await Promise.all([
          biometricService.isAvailable(),
          secureStorage.hasStoredCredentials(),
        ]);
        setBiometricAvailable(isAvailable);
        setHasStoredCredentials(hasCredentials);
      } catch (err) {
        console.warn('[useCredentialManagement] Failed to check status:', err);
        setBiometricAvailable(false);
        setHasStoredCredentials(false);
      }
    };

    checkStatus();
  }, [user, secureStorage, biometricService]);

  // Update stored credentials status when auth state changes
  useEffect(() => {
    const updateCredentialsStatus = async () => {
      if (user) {
        try {
          const hasCredentials = await secureStorage.hasStoredCredentials();
          setHasStoredCredentials(hasCredentials);
        } catch (err) {
          console.warn('[useCredentialManagement] Failed to check credentials:', err);
          setHasStoredCredentials(false);
        }
      } else {
        setHasStoredCredentials(false);
      }
    };

    updateCredentialsStatus();
  }, [user, secureStorage]);

  const saveCredentialsAfterAuth = useCallback(
    async (email: string, password: string) => {
      try {
        await credentialManager.saveCredentialsAfterAuth(email, password);
        setHasStoredCredentials(true);
      } catch (error) {
        // Don't fail sign-in if credential saving fails
        console.warn('[useCredentialManagement] Failed to save credentials:', error);
      }
    },
    [credentialManager]
  );

  const clearCredentialsOnSignOut = useCallback(async () => {
    try {
      await credentialManager.clearCredentialsOnSignOut();
      setHasStoredCredentials(false);
    } catch (error) {
      console.warn('[useCredentialManagement] Failed to clear credentials:', error);
    }
  }, [credentialManager]);

  return {
    hasStoredCredentials,
    biometricAvailable,
    saveCredentialsAfterAuth,
    clearCredentialsOnSignOut,
  };
};
