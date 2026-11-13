import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useBiometricLock } from '../../src/hooks/useBiometricLock';
import * as biometricLock from '../../src/services/biometricLock';

jest.mock('../../src/services/biometricLock');
const api = jest.mocked(biometricLock);

const user = { uid: 'user-1' } as FirebaseAuthTypes.User;

type Props = { user: FirebaseAuthTypes.User | null; initializing: boolean };
const renderLock = (initialProps: Props) =>
  renderHook(({ user: u, initializing }: Props) => useBiometricLock(u, initializing), {
    initialProps,
  });

/** Sends an AppState change to every listener the hook registered. */
const moveAppTo = (state: AppStateStatus) =>
  act(async () => {
    jest
      .mocked(AppState.addEventListener)
      .mock.calls.filter(([type]) => type === 'change')
      .forEach(([, handler]) => handler(state));
  });

describe('useBiometricLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.clearLegacyCredentials.mockResolvedValue();
    api.isLockEnabled.mockResolvedValue(false);
    api.isBiometricAvailable.mockResolvedValue(true);
    api.promptBiometric.mockResolvedValue('success');
  });

  it('stays "checking" while Firebase is still restoring the session', () => {
    const { result } = renderLock({ user: null, initializing: true });

    expect(result.current.status).toBe('checking');
    expect(api.isLockEnabled).not.toHaveBeenCalled();
  });

  it('is unlocked when no session was restored, and stays so after a password sign-in', async () => {
    const { result, rerender } = renderLock({ user: null, initializing: false });
    await waitFor(() => expect(result.current.status).toBe('unlocked'));

    api.isLockEnabled.mockResolvedValue(true);
    rerender({ user, initializing: false });

    expect(result.current.status).toBe('unlocked');
    expect(api.isLockEnabled).not.toHaveBeenCalled();
  });

  it('is unlocked for a restored session without the lock enabled', async () => {
    const { result } = renderLock({ user, initializing: false });

    await waitFor(() => expect(result.current.status).toBe('unlocked'));
    expect(api.isLockEnabled).toHaveBeenCalledWith('user-1');
  });

  it('locks a restored session with the lock enabled, and unlocks on success', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    const { result } = renderLock({ user, initializing: false });
    await waitFor(() => expect(result.current.status).toBe('locked'));
    expect(result.current.biometricsAvailable).toBe(true);

    await act(() => result.current.unlock());

    expect(api.promptBiometric).toHaveBeenCalledWith('Unlock Calendar App');
    expect(result.current.status).toBe('unlocked');
  });

  it('stays locked quietly when the prompt is cancelled, with a message on error', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    const { result } = renderLock({ user, initializing: false });
    await waitFor(() => expect(result.current.status).toBe('locked'));

    api.promptBiometric.mockResolvedValueOnce('cancelled');
    await act(() => result.current.unlock());
    expect(result.current.status).toBe('locked');
    expect(result.current.error).toBeNull();

    api.promptBiometric.mockResolvedValueOnce('error');
    await act(() => result.current.unlock());
    expect(result.current.status).toBe('locked');
    expect(result.current.error).toMatch(/Couldn't verify/);
  });

  it('stays locked without prompting when biometrics are no longer available', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    api.isBiometricAvailable.mockResolvedValue(false);
    const { result } = renderLock({ user, initializing: false });
    await waitFor(() => expect(result.current.status).toBe('locked'));

    await act(() => result.current.unlock());

    expect(result.current.biometricsAvailable).toBe(false);
    expect(api.promptBiometric).not.toHaveBeenCalled();
    expect(result.current.status).toBe('locked');
  });

  it('fails closed when the lock setting cannot be read', async () => {
    api.isLockEnabled.mockRejectedValue(new Error('keystore unavailable'));
    const { result } = renderLock({ user, initializing: false });

    await waitFor(() => expect(result.current.status).toBe('locked'));
    expect(result.current.error).toMatch(/Sign in with your password/);
  });

  it('unlocks once the user signs out from the lock screen', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    const { result, rerender } = renderLock({ user, initializing: false });
    await waitFor(() => expect(result.current.status).toBe('locked'));

    rerender({ user: null, initializing: false });

    expect(result.current.status).toBe('unlocked');
  });

  it('cleans up legacy stored credentials once per launch', async () => {
    const { rerender } = renderLock({ user: null, initializing: false });
    rerender({ user, initializing: false });

    await waitFor(() => expect(api.clearLegacyCredentials).toHaveBeenCalledTimes(1));
  });

  describe('after time in the background', () => {
    let now = 0;
    let dateNow: jest.SpyInstance;

    beforeEach(() => {
      now = 1_000_000;
      dateNow = jest.spyOn(Date, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
      dateNow.mockRestore();
    });

    /** A session signed in with a password in this launch (so not locked at startup). */
    const renderSignedIn = async () => {
      const hook = renderLock({ user: null, initializing: false });
      await waitFor(() => expect(hook.result.current.status).toBe('unlocked'));
      hook.rerender({ user, initializing: false });
      return hook;
    };

    const awayFor = async (ms: number) => {
      await moveAppTo('background');
      now += ms;
      await moveAppTo('active');
    };

    it('locks again after more than a minute, even after a password sign-in', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      const { result } = await renderSignedIn();

      await awayFor(60_001);

      expect(result.current.status).toBe('locked');
      expect(result.current.biometricsAvailable).toBe(true);
      expect(result.current.error).toBeNull();
      expect(api.isLockEnabled).toHaveBeenCalledWith('user-1');
    });

    it('stays unlocked when back within a minute', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      const { result } = await renderSignedIn();

      await awayFor(59_000);

      expect(result.current.status).toBe('unlocked');
    });

    it('stays unlocked when the lock is off', async () => {
      const { result } = await renderSignedIn();

      await awayFor(10 * 60_000);

      expect(result.current.status).toBe('unlocked');
    });

    it('ignores "inactive", which the biometric prompt itself can cause', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      const { result } = await renderSignedIn();

      await moveAppTo('inactive');
      now += 10 * 60_000;
      await moveAppTo('active');

      expect(result.current.status).toBe('unlocked');
      expect(api.isLockEnabled).not.toHaveBeenCalled();
    });

    it('fails closed when the setting cannot be read', async () => {
      api.isLockEnabled.mockRejectedValue(new Error('keystore unavailable'));
      const { result } = await renderSignedIn();

      await awayFor(60_001);

      expect(result.current.status).toBe('locked');
      expect(result.current.error).toMatch(/Sign in with your password/);
    });

    it('locks with only the password option when biometrics were removed', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      api.isBiometricAvailable.mockResolvedValue(false);
      const { result } = await renderSignedIn();

      await awayFor(60_001);

      expect(result.current.status).toBe('locked');
      expect(result.current.biometricsAvailable).toBe(false);
    });

    it('does not lock after the user signed out in the meantime', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      const { result, rerender } = await renderSignedIn();

      await moveAppTo('background');
      rerender({ user: null, initializing: false });
      now += 60_001;
      await moveAppTo('active');

      expect(result.current.status).toBe('unlocked');
    });

    it('measures from the first background event, not a repeated one', async () => {
      api.isLockEnabled.mockResolvedValue(true);
      const { result } = await renderSignedIn();

      await moveAppTo('background');
      now += 50_000;
      await moveAppTo('background'); // e.g. screen turned off while away
      now += 10_001;
      await moveAppTo('active');

      expect(result.current.status).toBe('locked');
    });
  });
});
