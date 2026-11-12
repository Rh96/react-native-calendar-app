import {
  isBiometricAvailable,
  promptBiometric,
  isLockEnabled,
  setLockEnabled,
  clearLegacyCredentials,
} from '../../src/services/biometricLock';

// Shared native mocks from __tests__/setup.ts
const Keychain = jest.requireMock('react-native-keychain');
const biometrics = jest.requireMock('react-native-biometrics').mockInstance;

describe('biometricLock service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Keychain.getGenericPassword.mockImplementation(() => Promise.resolve(false));
    biometrics.isSensorAvailable.mockImplementation(() => Promise.resolve({ available: false }));
  });

  describe('lock flag', () => {
    it('is off when nothing is stored', async () => {
      await expect(isLockEnabled('user-1')).resolves.toBe(false);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'com.calendarapp.biometricLock.user-1',
      });
    });

    it('is on when the per-user entry holds the flag', async () => {
      Keychain.getGenericPassword.mockResolvedValue({ username: 'user-1', password: 'enabled' });
      await expect(isLockEnabled('user-1')).resolves.toBe(true);
    });

    it('throws when the keychain cannot be read, so callers can fail closed', async () => {
      Keychain.getGenericPassword.mockRejectedValue(new Error('keystore unavailable'));
      await expect(isLockEnabled('user-1')).rejects.toThrow('keystore unavailable');
    });

    it('stores only a flag, scoped to the user and this device', async () => {
      await setLockEnabled('user-1', true);

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith('user-1', 'enabled', {
        service: 'com.calendarapp.biometricLock.user-1',
        accessible: 'AccessibleWhenUnlockedThisDeviceOnly',
      });
    });

    it('removes the entry when turned off', async () => {
      await setLockEnabled('user-1', false);

      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.calendarapp.biometricLock.user-1',
      });
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    });
  });

  describe('biometrics', () => {
    it('reports sensor availability and treats errors as unavailable', async () => {
      biometrics.isSensorAvailable.mockResolvedValueOnce({ available: true });
      await expect(isBiometricAvailable()).resolves.toBe(true);

      biometrics.isSensorAvailable.mockRejectedValueOnce(new Error('no hardware'));
      await expect(isBiometricAvailable()).resolves.toBe(false);
    });

    it('maps prompt outcomes to success / cancelled / error', async () => {
      biometrics.simplePrompt.mockResolvedValueOnce({ success: true });
      await expect(promptBiometric('Unlock')).resolves.toBe('success');

      biometrics.simplePrompt.mockResolvedValueOnce({ success: false });
      await expect(promptBiometric('Unlock')).resolves.toBe('cancelled');

      biometrics.simplePrompt.mockRejectedValueOnce(new Error('lockout'));
      await expect(promptBiometric('Unlock')).resolves.toBe('error');

      expect(biometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Unlock',
        cancelButtonText: 'Cancel',
      });
    });
  });

  it('clears both keychain entries used by the old password-storing code', async () => {
    await clearLegacyCredentials();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.calendarapp.credentials',
    });
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.calendarapp.biometrics_enabled',
    });
  });
});
