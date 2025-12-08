import ReactNativeBiometrics from 'react-native-biometrics';
import { IBiometricService } from './interfaces/IBiometricService';
import { BiometricError } from '../errors';
import { BIOMETRIC_MESSAGES } from '../constants/biometricMessages';

/**
 * Biometric Service
 * Handles biometric authentication using device capabilities
 * Implements IBiometricService interface
 */
export class BiometricService implements IBiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: false,
    });
  }

  /**
   * Check if biometrics are available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await this.rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      // Log error but don't throw - return false to indicate unavailability
      console.warn('[BiometricService] Error checking availability:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric available on the device
   */
  async getBiometricType(): Promise<string | null> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return available ? (biometryType ?? null) : null;
    } catch (error) {
      console.warn('[BiometricService] Error getting biometric type:', error);
      return null;
    }
  }

  /**
   * Get appropriate prompt message based on device biometric type
   */
  async getBiometricPromptMessage(): Promise<string> {
    const biometryType = await this.getBiometricType();
    
    if (!biometryType) {
      return BIOMETRIC_MESSAGES.DEFAULT;
    }

    // Check against known biometric types
    if (biometryType === 'FaceID') {
      return BIOMETRIC_MESSAGES.FACE_ID;
    } else if (biometryType === 'TouchID') {
      return BIOMETRIC_MESSAGES.TOUCH_ID;
    } else if (biometryType === 'Biometrics') {
      return BIOMETRIC_MESSAGES.BIOMETRICS;
    }
    
    return BIOMETRIC_MESSAGES.DEFAULT;
  }

  /**
   * Trigger biometric authentication prompt
   * @param promptMessage - Custom message to display in the prompt
   * @returns true if authentication succeeds, false otherwise
   */
  async authenticate(promptMessage?: string): Promise<boolean> {
    try {
      const message = promptMessage || (await this.getBiometricPromptMessage());
      
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: message,
        cancelButtonText: BIOMETRIC_MESSAGES.CANCEL_BUTTON,
      });

      return success;
    } catch (error) {
      // Log error but return false instead of throwing
      // This allows the caller to handle the failure gracefully
      console.warn('[BiometricService] Authentication error:', error);
      return false;
    }
  }

  /**
   * Create biometric keys (for advanced usage, not needed for basic auth)
   */
  async createKeys(): Promise<{ publicKey: string } | null> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return { publicKey };
    } catch {
      return null;
    }
  }
}
