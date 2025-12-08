import { ServiceContainer } from './ServiceContainer';
import { AuthService } from './AuthService';
import { BiometricService } from './BiometricService';
import { SecureStorageService } from './SecureStorageService';
import { CredentialManager } from './CredentialManager';
import { IAuthService } from './interfaces/IAuthService';
import { IBiometricService } from './interfaces/IBiometricService';
import { ISecureStorageService } from './interfaces/ISecureStorageService';
import { ICredentialManager } from './interfaces/ICredentialManager';

/**
 * Service Keys
 * Constants for service registration keys
 */
export const SERVICE_KEYS = {
  AUTH_SERVICE: 'authService',
  BIOMETRIC_SERVICE: 'biometricService',
  SECURE_STORAGE_SERVICE: 'secureStorageService',
  CREDENTIAL_MANAGER: 'credentialManager',
} as const;

/**
 * Initialize and register all services in the ServiceContainer
 * This should be called once at app startup
 */
export const initializeServices = (): void => {
  const container = ServiceContainer.getInstance();

  // Register SecureStorageService (no dependencies)
  container.register<ISecureStorageService>(
    SERVICE_KEYS.SECURE_STORAGE_SERVICE,
    () => new SecureStorageService()
  );

  // Register BiometricService (no dependencies)
  container.register<IBiometricService>(
    SERVICE_KEYS.BIOMETRIC_SERVICE,
    () => new BiometricService()
  );

  // Register CredentialManager (depends on SecureStorageService and BiometricService)
  container.register<ICredentialManager>(SERVICE_KEYS.CREDENTIAL_MANAGER, () => {
    const secureStorage = container.resolve<ISecureStorageService>(
      SERVICE_KEYS.SECURE_STORAGE_SERVICE
    );
    const biometricService = container.resolve<IBiometricService>(
      SERVICE_KEYS.BIOMETRIC_SERVICE
    );
    return new CredentialManager(secureStorage, biometricService);
  });

  // Register AuthService (depends on SecureStorageService and BiometricService)
  container.register<IAuthService>(SERVICE_KEYS.AUTH_SERVICE, () => {
    const secureStorage = container.resolve<ISecureStorageService>(
      SERVICE_KEYS.SECURE_STORAGE_SERVICE
    );
    const biometricService = container.resolve<IBiometricService>(
      SERVICE_KEYS.BIOMETRIC_SERVICE
    );
    return new AuthService(secureStorage, biometricService);
  });
};
