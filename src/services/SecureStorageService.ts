import * as Keychain from 'react-native-keychain';
import { ISecureStorageService } from './interfaces/ISecureStorageService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { StorageError } from '../errors';

/**
 * Secure Storage Service
 * Handles secure storage of user credentials using device keychain
 * Implements ISecureStorageService interface
 */
export class SecureStorageService implements ISecureStorageService {

  /**
   * Save user credentials securely in keychain
   */
  async saveCredentials(email: string, password: string): Promise<void> {
    try {
      const credentials = JSON.stringify({ email, password });
      await Keychain.setGenericPassword(email, credentials, {
        service: STORAGE_KEYS.CREDENTIALS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      throw StorageError.saveFailed(error);
    }
  }

  /**
   * Retrieve stored credentials from keychain
   */
  async getCredentials(): Promise<{ email: string; password: string } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEYS.CREDENTIALS,
      });

      if (!credentials) {
        return null;
      }

      try {
        const parsed = JSON.parse(credentials.password);
        return {
          email: parsed.email,
          password: parsed.password,
        };
      } catch {
        // Legacy format: username is email, password is password
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
    } catch (error) {
      throw StorageError.retrieveFailed(error);
    }
  }

  /**
   * Check if credentials are stored
   */
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      return credentials !== null;
    } catch {
      return false;
    }
  }

  /**
   * Clear stored credentials from keychain
   */
  async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: STORAGE_KEYS.CREDENTIALS,
      });
    } catch (error) {
      // Log but don't throw - clearing should be best-effort
      console.warn('[SecureStorageService] Failed to clear credentials:', error);
    }
  }

  /**
   * Set biometric authentication preference
   */
  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    try {
      await Keychain.setGenericPassword(
        'biometrics_enabled',
        enabled.toString(),
        {
          service: STORAGE_KEYS.BIOMETRICS_ENABLED,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      throw StorageError.saveFailed(error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const result = await Keychain.getGenericPassword({
        service: STORAGE_KEYS.BIOMETRICS_ENABLED,
      });
      if (result === false) {
        return false;
      }
      return result?.password === 'true';
    } catch (error) {
      console.warn('[SecureStorageService] Error checking biometric preference:', error);
      return false;
    }
  }
}
