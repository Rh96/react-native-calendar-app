import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { EventService } from '../services/EventService';
import { FirebaseEventRepository } from '../services/repositories/FirebaseEventRepository';

// Create service instance (Dependency Injection)
const createEventService = () => {
  const repository = new FirebaseEventRepository();
  return new EventService(repository);
};

export const useEvents = () => {
  const serviceRef = useRef<EventService>(createEventService());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Firebase repository and set up real-time listener
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initializeService = async () => {
      try {
        setLoading(true);
        setError(null);
        await serviceRef.current.initialize();
        
        // Initial load from cache
        if (isMounted) {
          setEvents(serviceRef.current.getAllEvents());
          setLoading(false);
        }

        // Subscribe to repository changes
        const repository = (serviceRef.current as any).repository;
        if (repository && typeof repository.subscribe === 'function') {
          unsubscribe = repository.subscribe(() => {
            if (isMounted) {
              setEvents(serviceRef.current.getAllEvents());
            }
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize events'));
          setLoading(false);
        }
      }
    };

    initializeService();

    // Cleanup
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      serviceRef.current.cleanup();
    };
  }, []);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent = serviceRef.current.createEvent(event);
      // Optimistically update UI - real-time listener will sync
      setEvents(serviceRef.current.getAllEvents());
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add event'));
      throw err;
    }
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updated = serviceRef.current.updateEvent(id, updates);
      // Optimistically update UI - real-time listener will sync
      setEvents(serviceRef.current.getAllEvents());
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update event'));
      throw err;
    }
  }, []);

  const deleteEvent = useCallback((id: string) => {
    try {
      const success = serviceRef.current.deleteEvent(id);
      // Optimistically update UI - real-time listener will sync
      setEvents(serviceRef.current.getAllEvents());
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete event'));
      throw err;
    }
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return serviceRef.current.getEventById(id);
    },
    []
  );

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  };
};



