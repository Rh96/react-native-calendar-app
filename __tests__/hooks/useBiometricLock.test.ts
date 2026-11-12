import { renderHook, act, waitFor } from '@testing-library/react-native';
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
});
