import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLockSetting } from '../../src/hooks/useLockSetting';
import * as biometricLock from '../../src/services/biometricLock';

jest.mock('../../src/services/biometricLock');
const api = jest.mocked(biometricLock);

const renderSetting = async (uid: string | null = 'user-1') => {
  const hook = renderHook(() => useLockSetting(uid));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
};

describe('useLockSetting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.isLockEnabled.mockResolvedValue(false);
    api.isBiometricAvailable.mockResolvedValue(true);
    api.promptBiometric.mockResolvedValue('success');
    api.setLockEnabled.mockResolvedValue();
  });

  it('loads the current setting and sensor availability for the user', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    const { result } = await renderSetting();

    expect(api.isLockEnabled).toHaveBeenCalledWith('user-1');
    expect(result.current).toMatchObject({ enabled: true, available: true, canToggle: true });
  });

  it('turns on only after a successful biometric prompt', async () => {
    const { result } = await renderSetting();

    await act(() => result.current.setLock(true));

    expect(api.promptBiometric).toHaveBeenCalledWith('Confirm to turn on biometric lock');
    expect(api.setLockEnabled).toHaveBeenCalledWith('user-1', true);
    expect(result.current.enabled).toBe(true);
  });

  it('stays off when the prompt is cancelled, with a message only on error', async () => {
    const { result } = await renderSetting();

    api.promptBiometric.mockResolvedValueOnce('cancelled');
    await act(() => result.current.setLock(true));
    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toBeNull();

    api.promptBiometric.mockResolvedValueOnce('error');
    await act(() => result.current.setLock(true));
    expect(result.current.enabled).toBe(false);
    expect(result.current.error).toMatch(/still off/);

    expect(api.setLockEnabled).not.toHaveBeenCalled();
  });

  it('turns off without a prompt', async () => {
    api.isLockEnabled.mockResolvedValue(true);
    const { result } = await renderSetting();

    await act(() => result.current.setLock(false));

    expect(api.promptBiometric).not.toHaveBeenCalled();
    expect(api.setLockEnabled).toHaveBeenCalledWith('user-1', false);
    expect(result.current.enabled).toBe(false);
  });

  it('keeps the previous value and reports when saving fails', async () => {
    api.setLockEnabled.mockRejectedValue(new Error('keystore'));
    const { result } = await renderSetting();

    await act(() => result.current.setLock(true));

    expect(result.current.enabled).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toMatch(/Couldn't turn on/);
  });

  it('cannot be turned on without biometrics, but can still be turned off', async () => {
    api.isBiometricAvailable.mockResolvedValue(false);
    const off = await renderSetting();
    expect(off.result.current.canToggle).toBe(false);

    api.isLockEnabled.mockResolvedValue(true);
    const on = await renderSetting();
    expect(on.result.current.canToggle).toBe(true);
  });

  it('reports a load failure instead of showing a wrong value', async () => {
    api.isLockEnabled.mockRejectedValue(new Error('keystore'));
    const { result } = await renderSetting();

    expect(result.current.error).toBe("Couldn't load your lock setting.");
  });
});
