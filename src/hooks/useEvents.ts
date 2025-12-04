import { useState, useCallback } from 'react';
import { CalendarEvent } from '../types';
import { mockEvents } from '../data/mockEvents';

export const useEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const getEventById = useCallback(
    (id: string) => {
      return events.find((event) => event.id === id);
    },
    [events]
  );

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  };
};

