import { useState, useCallback, useMemo, useRef } from 'react';
import { CalendarEvent } from '../types';
import { mockEvents } from '../data/mockEvents';
import { EventService, InMemoryEventRepository } from '../services/EventService';

// Create service instance (Dependency Injection)
const createEventService = () => {
  const repository = new InMemoryEventRepository(mockEvents);
  return new EventService(repository);
};

export const useEvents = () => {
  const serviceRef = useRef<EventService>(createEventService());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = serviceRef.current.createEvent(event);
    setEvents(serviceRef.current.getAllEvents());
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    serviceRef.current.updateEvent(id, updates);
    setEvents(serviceRef.current.getAllEvents());
  }, []);

  const deleteEvent = useCallback((id: string) => {
    serviceRef.current.deleteEvent(id);
    setEvents(serviceRef.current.getAllEvents());
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return serviceRef.current.getEventById(id);
    },
    []
  );

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  };
};



