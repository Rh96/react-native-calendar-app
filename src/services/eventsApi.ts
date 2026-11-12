import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { CalendarEvent } from '../types';

/**
 * Events API — the only module that talks to Firestore about events (ADR-002).
 *
 * Reads arrive through a real-time listener; writes return Promises that
 * resolve when the server confirms them. Firestore applies writes to its local
 * cache immediately, so the listener already reflects a change before the
 * Promise resolves; callers don't need their own optimistic updates.
 */

export const EVENTS_COLLECTION = 'events';

export type NewEvent = Omit<CalendarEvent, 'id'>;
export type EventUpdate = Partial<NewEvent>;

const eventsCollection = () => firestore().collection(EVENTS_COLLECTION);

const isTimestamp = (value: unknown): value is FirebaseFirestoreTypes.Timestamp =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { toDate?: unknown }).toDate === 'function';

/**
 * Convert a Firestore document to a CalendarEvent.
 * Returns null for documents missing required fields, so one malformed
 * document can't break (or invent dates for) the whole calendar.
 */
export const toCalendarEvent = (
  id: string,
  data: FirebaseFirestoreTypes.DocumentData,
): CalendarEvent | null => {
  if (
    typeof data.title !== 'string' ||
    typeof data.color !== 'string' ||
    !isTimestamp(data.startDate) ||
    !isTimestamp(data.endDate)
  ) {
    return null;
  }

  return {
    id,
    title: data.title,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
    color: data.color,
    description: typeof data.description === 'string' ? data.description : undefined,
  };
};

/**
 * Convert event fields to Firestore data. Only fields present in `event` are
 * included, so the same function serves create (all fields) and update (some).
 */
export const toFirestoreData = (
  event: EventUpdate,
): FirebaseFirestoreTypes.DocumentData => {
  const data: FirebaseFirestoreTypes.DocumentData = {};
  if (event.title !== undefined) {
    data.title = event.title;
  }
  if (event.color !== undefined) {
    data.color = event.color;
  }
  if (event.startDate !== undefined) {
    data.startDate = firestore.Timestamp.fromDate(event.startDate);
  }
  if (event.endDate !== undefined) {
    data.endDate = firestore.Timestamp.fromDate(event.endDate);
  }
  if ('description' in event) {
    data.description = event.description || null;
  }
  return data;
};

/**
 * Listen to all events owned by `userId`.
 * Firestore stops a listener after an error; subscribe again to retry.
 * @returns unsubscribe function
 */
export const subscribeToEvents = (
  userId: string,
  onData: (events: CalendarEvent[]) => void,
  onError: (error: Error) => void,
): (() => void) =>
  eventsCollection()
    .where('userId', '==', userId)
    .onSnapshot(
      (snapshot) => {
        const events = snapshot.docs
          .map((doc) => toCalendarEvent(doc.id, doc.data()))
          .filter((event): event is CalendarEvent => event !== null);
        onData(events);
      },
      onError,
    );

/** Create an event owned by `userId`. Resolves with the new document ID. */
export const createEvent = async (userId: string, event: NewEvent): Promise<string> => {
  const ref = await eventsCollection().add({
    ...toFirestoreData(event),
    description: event.description || null, // always store the field, even when empty
    userId,
  });
  return ref.id;
};

export const updateEvent = async (id: string, updates: EventUpdate): Promise<void> => {
  await eventsCollection().doc(id).update(toFirestoreData(updates));
};

export const deleteEvent = async (id: string): Promise<void> => {
  await eventsCollection().doc(id).delete();
};
