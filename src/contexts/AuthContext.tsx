import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AuthService } from '../services/AuthService';
import { getAuthErrorMessage } from '../utils/authErrors';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  /** True until Firebase reports whether a saved session exists (app startup only). */
  initializing: boolean;
  /** True while sign-in, sign-up or sign-out is in progress. */
  submitting: boolean;
  /** Last auth error, with a user-facing message. */
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authService = new AuthService();

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  // Two flags, not one: the app gate (App.tsx) must only react to startup,
  // otherwise a sign-in attempt swaps the login form for a spinner and its
  // input is lost when it remounts.
  const [initializing, setInitializing] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setInitializing(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  /** Runs an auth action with shared submitting/error handling. */
  const runAuthAction = useCallback(
    async (action: () => Promise<unknown>, fallbackMessage: string) => {
      setError(null);
      setSubmitting(true);
      try {
        await action();
        // The auth state listener updates `user`
      } catch (err) {
        const friendlyError = new Error(getAuthErrorMessage(err, fallbackMessage));
        setError(friendlyError);
        throw friendlyError;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const signIn = useCallback(
    (email: string, password: string) =>
      runAuthAction(() => authService.signIn(email, password), "Couldn't sign in. Please try again."),
    [runAuthAction],
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      runAuthAction(
        () => authService.signUp(email, password),
        "Couldn't create your account. Please try again.",
      ),
    [runAuthAction],
  );

  const signOut = useCallback(
    () => runAuthAction(() => authService.signOut(), "Couldn't sign out. Please try again."),
    [runAuthAction],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoised so consumers only re-render when auth state actually changes.
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      initializing,
      submitting,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [user, initializing, submitting, error, signIn, signUp, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
