/**
 * Interface for Secure Storage Service
 * Defines the contract for secure credential storage operations
 */
export interface ISecureStorageService {
  /**
   * Save user credentials securely in keychain
   * @param email - User email
   * @param password - User password
   * @throws StorageError if save fails
   */
  saveCredentials(email: string, password: string): Promise<void>;

  /**
   * Retrieve stored credentials from keychain
   * @returns Promise resolving to credentials object or null if not found
   * @throws StorageError if retrieval fails
   */
  getCredentials(): Promise<{ email: string; password: string } | null>;

  /**
   * Check if credentials are stored
   * @returns Promise resolving to true if credentials exist
   */
  hasStoredCredentials(): Promise<boolean>;

  /**
   * Clear stored credentials from keychain
   */
  clearCredentials(): Promise<void>;

  /**
   * Set biometric authentication preference
   * @param enabled - Whether biometric authentication is enabled
   * @throws StorageError if save fails
   */
  setBiometricsEnabled(enabled: boolean): Promise<void>;

  /**
   * Check if biometric authentication is enabled
   * @returns Promise resolving to true if biometrics are enabled
   */
  isBiometricsEnabled(): Promise<boolean>;
}

