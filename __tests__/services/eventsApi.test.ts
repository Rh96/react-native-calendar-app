import firestore from '@react-native-firebase/firestore';
import {
  toCalendarEvent,
  toFirestoreData,
  createEvent,
} from '../../src/services/eventsApi';

// Uses the automatic mock in __mocks__/@react-native-firebase/firestore.ts
const Timestamp = firestore.Timestamp;

describe('eventsApi mappers', () => {
  const start = new Date(2026, 10, 12, 9, 0);
  const end = new Date(2026, 10, 12, 10, 0);

  it('converts a valid Firestore document to a CalendarEvent', () => {
    const event = toCalendarEvent('doc-1', {
      userId: 'user-1',
      title: 'Standup',
      startDate: Timestamp.fromDate(start),
      endDate: Timestamp.fromDate(end),
      color: '#4A90E2',
      description: null,
    });

    expect(event).toEqual({
      id: 'doc-1',
      title: 'Standup',
      startDate: start,
      endDate: end,
      color: '#4A90E2',
      description: undefined,
    });
  });

  it('returns null for documents missing required fields instead of inventing dates', () => {
    expect(
      toCalendarEvent('doc-2', { title: 'No dates', color: '#4A90E2' }),
    ).toBeNull();
  });

  it('only includes the fields that were provided', () => {
    expect(toFirestoreData({ title: 'Renamed' })).toEqual({ title: 'Renamed' });
  });

  it('stores an empty description as null', () => {
    expect(toFirestoreData({ description: '' })).toEqual({ description: null });
  });
});

describe('createEvent', () => {
  it('stamps the event with the owner userId and returns the new id', async () => {
    const id = await createEvent('user-1', {
      title: 'Standup',
      startDate: new Date(2026, 10, 12, 9, 0),
      endDate: new Date(2026, 10, 12, 10, 0),
      color: '#4A90E2',
    });

    const collection = jest.mocked(firestore().collection).mock.results.at(-1)?.value;
    expect(id).toBe('mock-doc-id');
    expect(collection.add).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', title: 'Standup', description: null }),
    );
  });
});
