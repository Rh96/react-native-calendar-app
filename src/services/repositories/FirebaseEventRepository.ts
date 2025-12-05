import { IEventRepository } from '../EventService';
import { CalendarEvent } from '../../types';
import {
  db,
  EVENTS_COLLECTION,
  firestoreToEvent,
  eventToFirestore,
  dateToTimestamp,
} from '../../config/firebase';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

/**
 * Firebase Firestore implementation of IEventRepository
 * Uses real-time listeners to keep a local cache synchronized
 */
export class FirebaseEventRepository implements IEventRepository {
  private eventsCache: CalendarEvent[] = [];
  private unsubscribeListener: (() => void) | null = null;
  private isInitialized = false;
  private onChangeCallbacks: Set<() => void> = new Set();

  /**
   * Initialize the repository and set up real-time listener
   * This must be called before using the repository
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Set up real-time listener
    this.unsubscribeListener = db
      .collection(EVENTS_COLLECTION)
      .onSnapshot(
        (snapshot) => {
          const events: CalendarEvent[] = [];
          snapshot.forEach((doc) => {
            try {
              const event = firestoreToEvent(doc.id, doc.data());
              events.push(event);
            } catch (error) {
              console.error(`Error parsing event ${doc.id}:`, error);
            }
          });
          this.eventsCache = events;
          this.isInitialized = true;
          // Notify all subscribers of the change
          this.onChangeCallbacks.forEach((callback) => callback());
        },
        (error) => {
          console.error('Error listening to events:', error);
          this.isInitialized = true; // Mark as initialized even on error
        }
      );
  }

  /**
   * Clean up the listener when repository is no longer needed
   */
  cleanup(): void {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
    this.onChangeCallbacks.clear();
    this.isInitialized = false;
    this.eventsCache = [];
  }

  /**
   * Subscribe to cache changes
   * Returns unsubscribe function
   */
  subscribe(callback: () => void): () => void {
    this.onChangeCallbacks.add(callback);
    return () => {
      this.onChangeCallbacks.delete(callback);
    };
  }

  /**
   * Get all events from cache (synchronous)
   */
  getAll(): CalendarEvent[] {
    return [...this.eventsCache];
  }

  /**
   * Get event by ID from cache (synchronous)
   */
  getById(id: string): CalendarEvent | undefined {
    return this.eventsCache.find((event) => event.id === id);
  }

  /**
   * Add event to Firestore
   * Interface method - triggers async operation, returns immediately
   * The real-time listener will update the cache with the actual Firestore document
   */
  add(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    // Generate temporary ID for immediate return
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newEvent: CalendarEvent = {
      ...event,
      id: tempId,
    };
    
    // Fire async operation - listener will update cache with real ID
    db.collection(EVENTS_COLLECTION)
      .add(eventToFirestore(event))
      .catch((error) => {
        console.error('Error adding event to Firestore:', error);
      });
    
    return newEvent;
  }

  /**
   * Update event in Firestore
   * Interface method - triggers async operation, returns immediately
   * The real-time listener will update the cache
   */
  update(id: string, updates: Partial<CalendarEvent>): CalendarEvent | undefined {
    const existing = this.eventsCache.find((e) => e.id === id);
    if (!existing) {
      return undefined;
    }

    // Convert Date objects to Timestamps for updates
    const firestoreUpdates: FirebaseFirestoreTypes.UpdateData = {};
    if (updates.title !== undefined) firestoreUpdates.title = updates.title;
    if (updates.color !== undefined) firestoreUpdates.color = updates.color;
    if (updates.description !== undefined) firestoreUpdates.description = updates.description || null;
    if (updates.startDate !== undefined) firestoreUpdates.startDate = dateToTimestamp(updates.startDate);
    if (updates.endDate !== undefined) firestoreUpdates.endDate = dateToTimestamp(updates.endDate);

    // Fire async operation - listener will update cache
    db.collection(EVENTS_COLLECTION)
      .doc(id)
      .update(firestoreUpdates)
      .catch((error) => {
        console.error('Error updating event in Firestore:', error);
      });

    // Return optimistic update
    return { ...existing, ...updates };
  }

  /**
   * Delete event from Firestore
   * Interface method - triggers async operation, returns immediately
   * The real-time listener will update the cache
   */
  delete(id: string): boolean {
    const exists = this.eventsCache.some((e) => e.id === id);
    if (!exists) {
      return false;
    }

    // Fire async operation - listener will update cache
    db.collection(EVENTS_COLLECTION)
      .doc(id)
      .delete()
      .catch((error) => {
        console.error('Error deleting event from Firestore:', error);
      });

    return true;
  }

  /**
   * Get events for a specific date (from cache)
   */
  getByDate(date: Date): CalendarEvent[] {
    return this.eventsCache.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }

  /**
   * Get events for a date range (from cache)
   */
  getByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.eventsCache.filter((event) => {
      const eventStart = event.startDate.getTime();
      const rangeStart = startDate.getTime();
      const rangeEnd = endDate.getTime();
      return eventStart >= rangeStart && eventStart <= rangeEnd;
    });
  }

}

