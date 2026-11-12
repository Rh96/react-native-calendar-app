import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '../types';
import * as eventsApi from '../services/eventsApi';
import type { NewEvent, EventUpdate } from '../services/eventsApi';

/**
 * Real-time events for one user.
 *
 * - `loading` stays true until the first snapshot arrives.
 * - `error` is a *load* error (the listener failed); call `retry()` to resubscribe.
 * - Write functions return Promises that reject on failure. Write errors are
 *   the caller's to show; they don't replace the calendar with an error screen.
 */
export const useEvents = (userId: string | null) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(userId !== null);
  const [error, setError] = useState<Error | null>(null);
  // Bumping this re-runs the effect, which creates a fresh listener.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    return eventsApi.subscribeToEvents(
      userId,
      (next) => {
        setEvents(next);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, [userId, attempt]);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  const addEvent = useCallback(
    (event: NewEvent): Promise<string> => {
      if (!userId) {
        return Promise.reject(new Error('Cannot create an event while signed out'));
      }
      return eventsApi.createEvent(userId, event);
    },
    [userId],
  );

  const updateEvent = useCallback(
    (id: string, updates: EventUpdate): Promise<void> => eventsApi.updateEvent(id, updates),
    [],
  );

  const deleteEvent = useCallback(
    (id: string): Promise<void> => eventsApi.deleteEvent(id),
    [],
  );

  return {
    events,
    loading,
    error,
    retry,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
