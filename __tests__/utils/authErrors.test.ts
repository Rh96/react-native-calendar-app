import { getAuthErrorMessage } from '../../src/utils/authErrors';

const withCode = (code: string) => Object.assign(new Error(`[${code}] raw`), { code });

describe('getAuthErrorMessage', () => {
  it.each(['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'])(
    'uses one message for %s so it does not reveal which emails exist',
    (code) => {
      expect(getAuthErrorMessage(withCode(code), 'fallback')).toBe('Incorrect email or password.');
    },
  );

  it('maps known codes to actionable messages', () => {
    expect(getAuthErrorMessage(withCode('auth/email-already-in-use'), 'fallback')).toBe(
      'An account with this email already exists.',
    );
    expect(getAuthErrorMessage(withCode('auth/network-request-failed'), 'fallback')).toBe(
      'No connection. Check your internet and try again.',
    );
  });

  it('falls back for unknown codes, errors without a code, and non-errors', () => {
    expect(getAuthErrorMessage(withCode('auth/something-new'), 'fallback')).toBe('fallback');
    expect(getAuthErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
    expect(getAuthErrorMessage('boom', 'fallback')).toBe('fallback');
    expect(getAuthErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
