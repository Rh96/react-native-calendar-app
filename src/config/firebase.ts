import firestore from '@react-native-firebase/firestore';
import { CalendarEvent } from '../types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Firebase Firestore instance
 * @react-native-firebase/app handles initialization automatically
 */
export const db = firestore();

/**
 * Collection name for calendar events
 */
export const EVENTS_COLLECTION = 'events';

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export const timestampToDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | Date | null | undefined
): Date => {
  if (!timestamp) {
    return new Date();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return timestamp.toDate();
};

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export const dateToTimestamp = (
  date: Date
): FirebaseFirestoreTypes.Timestamp => {
  return firestore.Timestamp.fromDate(date);
};

/**
 * Convert Firestore document data to CalendarEvent
 */
export const firestoreToEvent = (
  docId: string,
  data: FirebaseFirestoreTypes.DocumentData
): CalendarEvent => {
  return {
    id: docId,
    title: data.title || '',
    startDate: timestampToDate(data.startDate),
    endDate: timestampToDate(data.endDate),
    color: data.color || '#4A90E2',
    description: data.description,
  };
};

/**
 * Convert CalendarEvent to Firestore document data
 */
export const eventToFirestore = (
  event: Omit<CalendarEvent, 'id'>
): FirebaseFirestoreTypes.DocumentData => {
  return {
    title: event.title,
    startDate: dateToTimestamp(event.startDate),
    endDate: dateToTimestamp(event.endDate),
    color: event.color,
    description: event.description || null,
  };
};

