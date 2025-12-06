import { ICredentialManager } from './interfaces/ICredentialManager';
import { ISecureStorageService } from './interfaces/ISecureStorageService';
import { IBiometricService } from './interfaces/IBiometricService';

/**
 * Credential Manager
 * Handles credential storage and clearing operations
 * Coordinates between secure storage and biometric services
 */
export class CredentialManager implements ICredentialManager {
  constructor(
    private readonly secureStorage: ISecureStorageService,
    private readonly biometricService: IBiometricService
  ) {}

  /**
   * Save credentials after successful authentication
   * Also enables biometric authentication if available
   */
  async saveCredentialsAfterAuth(email: string, password: string): Promise<void> {
    // Save credentials to secure storage
    await this.secureStorage.saveCredentials(email, password);

    // Enable biometric authentication if available
    const isAvailable = await this.biometricService.isAvailable();
    if (isAvailable) {
      await this.secureStorage.setBiometricsEnabled(true);
    }
  }

  /**
   * Clear credentials when user signs out
   * Also disables biometric authentication
   */
  async clearCredentialsOnSignOut(): Promise<void> {
    // Clear stored credentials
    await this.secureStorage.clearCredentials();

    // Disable biometric authentication
    try {
      await this.secureStorage.setBiometricsEnabled(false);
    } catch (error) {
      // Log but don't throw - clearing credentials is the main goal
      console.warn('[CredentialManager] Failed to disable biometrics:', error);
    }
  }
}

