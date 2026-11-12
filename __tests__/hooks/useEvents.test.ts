import { renderHook, act } from '@testing-library/react-native';
import { useEvents } from '../../src/hooks/useEvents';
import * as eventsApi from '../../src/services/eventsApi';
import type { NewEvent } from '../../src/services/eventsApi';
import type { CalendarEvent } from '../../src/types';

jest.mock('../../src/services/eventsApi');

const mockedApi = jest.mocked(eventsApi);

const newEvent: NewEvent = {
  title: 'Standup',
  startDate: new Date(2026, 10, 12, 9, 0),
  endDate: new Date(2026, 10, 12, 9, 15),
  color: '#4A90E2',
};

const sampleEvent: CalendarEvent = { id: 'event-1', ...newEvent };

/** Captures the callbacks useEvents passes to subscribeToEvents. */
const captureListener = () => {
  const listener = {
    onData: (_events: CalendarEvent[]) => {},
    onError: (_error: Error) => {},
    unsubscribe: jest.fn(),
  };
  mockedApi.subscribeToEvents.mockImplementation((_userId, onData, onError) => {
    listener.onData = onData;
    listener.onError = onError;
    return listener.unsubscribe;
  });
  return listener;
};

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not subscribe and is not loading when signed out', () => {
    const { result } = renderHook(() => useEvents(null));

    expect(mockedApi.subscribeToEvents).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([]);
  });

  it('stays loading until the first snapshot arrives', () => {
    const listener = captureListener();
    const { result } = renderHook(() => useEvents('user-1'));

    expect(mockedApi.subscribeToEvents).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
      expect.any(Function),
    );
    expect(result.current.loading).toBe(true);

    act(() => listener.onData([sampleEvent]));

    expect(result.current.loading).toBe(false);
    expect(result.current.events).toEqual([sampleEvent]);
  });

  it('exposes listener errors and resubscribes on retry', () => {
    const listener = captureListener();
    const { result } = renderHook(() => useEvents('user-1'));

    act(() => listener.onError(new Error('permission-denied')));

    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toBe('permission-denied');

    act(() => result.current.retry());

    expect(mockedApi.subscribeToEvents).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('unsubscribes on unmount and when the user changes', () => {
    const listener = captureListener();
    const { rerender, unmount } = renderHook(
      ({ userId }: { userId: string | null }) => useEvents(userId),
      { initialProps: { userId: 'user-1' } },
    );

    rerender({ userId: 'user-2' });
    expect(listener.unsubscribe).toHaveBeenCalledTimes(1);
    expect(mockedApi.subscribeToEvents).toHaveBeenLastCalledWith(
      'user-2',
      expect.any(Function),
      expect.any(Function),
    );

    unmount();
    expect(listener.unsubscribe).toHaveBeenCalledTimes(2);
  });

  it('creates events for the signed-in user', async () => {
    captureListener();
    mockedApi.createEvent.mockResolvedValue('new-id');
    const { result } = renderHook(() => useEvents('user-1'));

    await expect(result.current.addEvent(newEvent)).resolves.toBe('new-id');
    expect(mockedApi.createEvent).toHaveBeenCalledWith('user-1', newEvent);
  });

  it('rejects writes that fail without turning them into a load error', async () => {
    captureListener();
    mockedApi.updateEvent.mockRejectedValue(new Error('permission-denied'));
    mockedApi.deleteEvent.mockRejectedValue(new Error('unavailable'));
    const { result } = renderHook(() => useEvents('user-1'));

    await expect(result.current.updateEvent('event-1', { title: 'x' })).rejects.toThrow(
      'permission-denied',
    );
    await expect(result.current.deleteEvent('event-1')).rejects.toThrow('unavailable');
    expect(result.current.error).toBeNull();
  });

  it('rejects creating an event while signed out', async () => {
    const { result } = renderHook(() => useEvents(null));

    await expect(result.current.addEvent(newEvent)).rejects.toThrow('signed out');
    expect(mockedApi.createEvent).not.toHaveBeenCalled();
  });
});
