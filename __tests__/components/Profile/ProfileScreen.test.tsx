/**
 * Profile screen with the real hook and service; only native modules are mocked.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../../../src/components/Profile';
import { ThemeProvider } from '../../../src/theme';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import {
  setMockCurrentUser,
  clearMockCurrentUser,
} from '../../../__mocks__/@react-native-firebase/auth';

const Keychain = jest.requireMock('react-native-keychain');
const biometrics = jest.requireMock('react-native-biometrics').mockInstance;

const renderProfile = () =>
  render(
    <ThemeProvider>
      <AuthProvider>
        <ProfileScreen />
      </AuthProvider>
    </ThemeProvider>,
  );

const lockSwitch = () => screen.findByRole('switch', { name: 'Biometric lock' });

describe('ProfileScreen biometric lock setting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockCurrentUser({ uid: 'user-1', email: 'me@example.com' });
    Keychain.getGenericPassword.mockImplementation(() => Promise.resolve(false));
    Keychain.setGenericPassword.mockImplementation(() => Promise.resolve(true));
    biometrics.isSensorAvailable.mockResolvedValue({ available: true });
    biometrics.simplePrompt.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    clearMockCurrentUser();
  });

  it('shows the switch off by default', async () => {
    renderProfile();

    expect(await lockSwitch()).not.toBeChecked();
    expect(screen.getByText('Ask for your fingerprint or face when the app opens and after a minute away.')).toBeOnTheScreen();
  });

  it('turns the lock on after confirming with biometrics', async () => {
    renderProfile();

    fireEvent(await lockSwitch(), 'valueChange', true);

    await waitFor(async () => expect(await lockSwitch()).toBeChecked());
    expect(biometrics.simplePrompt).toHaveBeenCalledTimes(1);
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'user-1',
      'enabled',
      expect.objectContaining({ service: 'com.calendarapp.biometricLock.user-1' }),
    );
  });

  it('stays off if the confirmation prompt is cancelled', async () => {
    biometrics.simplePrompt.mockResolvedValue({ success: false });
    renderProfile();

    fireEvent(await lockSwitch(), 'valueChange', true);

    await waitFor(() => expect(biometrics.simplePrompt).toHaveBeenCalled());
    expect(await lockSwitch()).not.toBeChecked();
    expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
  });

  it('turns an enabled lock off', async () => {
    Keychain.getGenericPassword.mockResolvedValue({ username: 'user-1', password: 'enabled' });
    renderProfile();
    await waitFor(async () => expect(await lockSwitch()).toBeChecked());

    fireEvent(await lockSwitch(), 'valueChange', false);

    await waitFor(async () => expect(await lockSwitch()).not.toBeChecked());
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'com.calendarapp.biometricLock.user-1',
    });
  });

  it('is disabled with setup instructions when the phone has no biometrics', async () => {
    biometrics.isSensorAvailable.mockResolvedValue({ available: false });
    renderProfile();

    expect(await lockSwitch()).toBeDisabled();
    expect(
      screen.getByText("Set up fingerprint or face unlock in your phone's settings to use this."),
    ).toBeOnTheScreen();
  });

  it('announces an error and stays off when saving fails', async () => {
    Keychain.setGenericPassword.mockRejectedValue(new Error('keystore'));
    renderProfile();

    fireEvent(await lockSwitch(), 'valueChange', true);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't turn on the lock. Please try again.",
    );
    expect(await lockSwitch()).not.toBeChecked();
  });
});
