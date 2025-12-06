/**
 * Interface for Credential Manager
 * Defines the contract for credential management operations
 */
export interface ICredentialManager {
  /**
   * Save credentials after successful authentication
   * @param email - User email
   * @param password - User password
   */
  saveCredentialsAfterAuth(email: string, password: string): Promise<void>;

  /**
   * Clear credentials when user signs out
   */
  clearCredentialsOnSignOut(): Promise<void>;
}

