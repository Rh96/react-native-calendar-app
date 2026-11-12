/**
 * @format
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons/static';
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
    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Sign up for an account' })).toBeOnTheScreen();
  });

  it('labels the registration form', async () => {
    render(<App />);
    fireEvent.press(await screen.findByRole('link', { name: 'Sign up for an account' }));

    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
    expect(screen.getByLabelText('Confirm password')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Sign in to an existing account' })).toBeOnTheScreen();
  });

  it('shows the calendar when a user is signed in', async () => {
    setMockCurrentUser({ uid: 'test-user-id', email: 'test@example.com' });

    render(<App />);

    expect(await screen.findByText('+ Add Event')).toBeOnTheScreen();
    expect(screen.queryByText('Welcome To Calendar App')).not.toBeOnTheScreen();
  });

  it('shows real tab icons and no Back button on the Profile tab', async () => {
    setMockCurrentUser({ uid: 'test-user-id', email: 'test@example.com' });
    render(<App />);
    await screen.findByText('+ Add Event');

    const iconNames = screen.UNSAFE_getAllByType(MaterialDesignIcons).map((icon) => icon.props.name);
    // Bottom tabs render each tab's focused and unfocused icon and cross-fade between them
    expect(iconNames.sort()).toEqual([
      'account-circle',
      'account-circle-outline',
      'calendar-month',
      'calendar-month-outline',
    ]);

    fireEvent.press(screen.getByText('Profile', { exact: true }));

    expect(await screen.findByRole('button', { name: 'Log out' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Back/ })).not.toBeOnTheScreen();
  });

  it('keeps the typed email and shows a friendly message when sign-in fails', async () => {
    setMockSignInError(
      firebaseAuthError(
        'auth/invalid-credential',
        'The supplied auth credential is incorrect, malformed or has expired.',
      ),
    );
    render(<App />);

    fireEvent.changeText(await screen.findByLabelText('Email'), 'me@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'wrong-password');
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    // Announced to screen readers as an alert
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('me@example.com');
  });
});
