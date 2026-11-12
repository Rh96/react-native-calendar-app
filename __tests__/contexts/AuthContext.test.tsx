import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuthContext } from '../../src/contexts/AuthContext';
import {
  setMockCurrentUser,
  clearMockCurrentUser,
  setMockSignInError,
} from '../../__mocks__/@react-native-firebase/auth';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  afterEach(() => {
    clearMockCurrentUser();
    setMockSignInError(null);
  });

  it('should throw error when useAuthContext is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow('useAuthContext must be used within an AuthProvider');

    spy.mockRestore();
  });

  it('finishes initializing with the restored session user', () => {
    setMockCurrentUser({ uid: 'user-1', email: 'me@example.com' });

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current.initializing).toBe(false);
    expect(result.current.submitting).toBe(false);
    expect(result.current.user?.uid).toBe('user-1');
  });

  it('turns a failed sign-in into a user-facing error without re-entering initializing', async () => {
    setMockSignInError(
      Object.assign(new Error('[auth/invalid-credential] raw'), { code: 'auth/invalid-credential' }),
    );
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await act(async () => {
      await expect(result.current.signIn('me@example.com', 'wrong')).rejects.toThrow(
        'Incorrect email or password.',
      );
    });

    expect(result.current.error?.message).toBe('Incorrect email or password.');
    expect(result.current.submitting).toBe(false);
    expect(result.current.initializing).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('signs in and out through the auth state listener', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await act(() => result.current.signIn('me@example.com', 'secret1'));
    expect(result.current.user?.email).toBe('me@example.com');

    await act(() => result.current.signOut());
    expect(result.current.user).toBeNull();
    expect(result.current.submitting).toBe(false);
  });
});
