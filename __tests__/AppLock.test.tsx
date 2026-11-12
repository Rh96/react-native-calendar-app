/**
 * Biometric lock flows through the real App (ADR-003).
 * Only the native modules are mocked (see __tests__/setup.ts).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import App from '../App';
import {
  setMockCurrentUser,
  clearMockCurrentUser,
} from '../__mocks__/@react-native-firebase/auth';

const Keychain = jest.requireMock('react-native-keychain');
const biometrics = jest.requireMock('react-native-biometrics').mockInstance;

const restoredUser = { uid: 'test-user-id', email: 'test@example.com' };

/** Lock flag stored for these uids only. */
const lockEnabledFor = (...uids: string[]) =>
  Keychain.getGenericPassword.mockImplementation(({ service }: { service: string }) =>
    Promise.resolve(
      uids.some((uid) => service === `com.calendarapp.biometricLock.${uid}`)
        ? { username: 'x', password: 'enabled' }
        : false,
    ),
  );

describe('App biometric lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lockEnabledFor(); // nobody
    biometrics.isSensorAvailable.mockResolvedValue({ available: true });
    biometrics.simplePrompt.mockResolvedValue({ success: false });
  });

  afterEach(() => {
    clearMockCurrentUser();
  });

  it('opens the calendar after a successful biometric prompt', async () => {
    setMockCurrentUser(restoredUser);
    lockEnabledFor('test-user-id');
    biometrics.simplePrompt.mockResolvedValue({ success: true });

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Add event' })).toBeOnTheScreen();
    expect(biometrics.simplePrompt).toHaveBeenCalledTimes(1);
  });

  it('stays locked when the prompt is cancelled, and can retry', async () => {
    setMockCurrentUser(restoredUser);
    lockEnabledFor('test-user-id');

    render(<App />);

    expect(await screen.findByRole('header', { name: 'Calendar locked' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Add event' })).not.toBeOnTheScreen();

    biometrics.simplePrompt.mockResolvedValueOnce({ success: true });
    fireEvent.press(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByRole('button', { name: 'Add event' })).toBeOnTheScreen();
  });

  it('"Use password" signs out to the login screen', async () => {
    setMockCurrentUser(restoredUser);
    lockEnabledFor('test-user-id');

    render(<App />);
    fireEvent.press(await screen.findByRole('button', { name: 'Use password' }));

    expect(await screen.findByLabelText('Email')).toBeOnTheScreen();
  });

  it('offers only "Use password" when biometrics are no longer available', async () => {
    setMockCurrentUser(restoredUser);
    lockEnabledFor('test-user-id');
    biometrics.isSensorAvailable.mockResolvedValue({ available: false });

    render(<App />);

    expect(await screen.findByRole('header', { name: 'Calendar locked' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Unlock' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Use password' })).toBeOnTheScreen();
    expect(biometrics.simplePrompt).not.toHaveBeenCalled();
  });

  it("does not lock a user because of another user's setting on the same device", async () => {
    setMockCurrentUser(restoredUser);
    lockEnabledFor('someone-else');

    render(<App />);

    expect(await screen.findByRole('button', { name: 'Add event' })).toBeOnTheScreen();
    expect(biometrics.simplePrompt).not.toHaveBeenCalled();
  });

  it('never locks after signing in with a password in this launch', async () => {
    lockEnabledFor('test-user-id');

    render(<App />);
    fireEvent.changeText(await screen.findByLabelText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret1');
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('button', { name: 'Add event' })).toBeOnTheScreen();
    expect(biometrics.simplePrompt).not.toHaveBeenCalled();
  });
});
