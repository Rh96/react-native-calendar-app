/**
 * Interface for Biometric Service
 * Defines the contract for biometric authentication operations
 */
export interface IBiometricService {
  /**
   * Check if biometrics are available on the device
   * @returns Promise resolving to true if biometrics are available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the type of biometric available on the device
   * @returns Promise resolving to biometric type string or null
   */
  getBiometricType(): Promise<string | null>;

  /**
   * Get appropriate prompt message based on device biometric type
   * @returns Promise resolving to prompt message string
   */
  getBiometricPromptMessage(): Promise<string>;

  /**
   * Trigger biometric authentication prompt
   * @param promptMessage - Optional custom message to display in the prompt
   * @returns Promise resolving to true if authentication succeeds, false otherwise
   */
  authenticate(promptMessage?: string): Promise<boolean>;

  /**
   * Create biometric keys (for advanced usage)
   * @returns Promise resolving to public key object or null
   */
  createKeys(): Promise<{ publicKey: string } | null>;
}

