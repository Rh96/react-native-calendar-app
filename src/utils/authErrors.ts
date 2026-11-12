/**
 * Maps Firebase Auth error codes to messages a user can act on.
 *
 * Wrong password and unknown email deliberately share one message, so the
 * login form doesn't reveal which emails have accounts.
 */
const INCORRECT_CREDENTIALS = 'Incorrect email or password.';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': INCORRECT_CREDENTIALS,
  'auth/wrong-password': INCORRECT_CREDENTIALS,
  'auth/user-not-found': INCORRECT_CREDENTIALS,
  'auth/invalid-email': "That email address doesn't look right.",
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/user-disabled': 'This account has been disabled.',
};

const getErrorCode = (error: unknown): string | undefined => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
};

/** A user-facing message for `error`, or `fallback` for unknown errors. */
export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  const code = getErrorCode(error);
  return (code && AUTH_ERROR_MESSAGES[code]) || fallback;
};
