/**
 * @format
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import App from '../App';
import {
  setMockCurrentUser,
  clearMockCurrentUser,
  setMockSignInError,
} from '../__mocks__/@react-native-firebase/auth';

/** Shape of errors thrown by @react-native-firebase/auth. */
const firebaseAuthError = (code: string, message: string) =>
  Object.assign(new Error(`[${code}] ${message}`), { code });

describe('App', () => {
  afterEach(() => {
    clearMockCurrentUser();
    setMockSignInError(null);
  });

  it('shows the login screen when no user is signed in', async () => {
    render(<App />);

    expect(
      await screen.findByText('Welcome To Calendar App'),
    ).toBeOnTheScreen();
  });

  it('shows the calendar when a user is signed in', async () => {
    setMockCurrentUser({ uid: 'test-user-id', email: 'test@example.com' });

    render(<App />);

    expect(await screen.findByText('+ Add Event')).toBeOnTheScreen();
    expect(screen.queryByText('Welcome To Calendar App')).not.toBeOnTheScreen();
  });

  it('keeps the typed email and shows a friendly message when sign-in fails', async () => {
    setMockSignInError(
      firebaseAuthError(
        'auth/invalid-credential',
        'The supplied auth credential is incorrect, malformed or has expired.',
      ),
    );
    render(<App />);

    fireEvent.changeText(await screen.findByPlaceholderText('Enter your email'), 'me@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'wrong-password');
    fireEvent.press(screen.getByText('Sign In'));

    expect(await screen.findByText('Incorrect email or password.')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Enter your email')).toHaveDisplayValue('me@example.com');
  });
});
