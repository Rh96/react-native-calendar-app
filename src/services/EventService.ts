import { CalendarEvent } from '../types';

/**
 * Interface for event repository
 * Follows Dependency Inversion Principle - components depend on abstraction
 */
export interface IEventRepository {
  getAll(): CalendarEvent[];
  getById(id: string): CalendarEvent | undefined;
  add(event: Omit<CalendarEvent, 'id'>): CalendarEvent;
  update(id: string, updates: Partial<CalendarEvent>): CalendarEvent | undefined;
  delete(id: string): boolean;
  getByDate(date: Date): CalendarEvent[];
  getByDateRange(startDate: Date, endDate: Date): CalendarEvent[];
}

/**
 * In-memory event repository implementation
 * Can be easily swapped with a database-backed implementation
 */
export class InMemoryEventRepository implements IEventRepository {
  private events: CalendarEvent[] = [];

  constructor(initialEvents: CalendarEvent[] = []) {
    this.events = [...initialEvents];
  }

  getAll(): CalendarEvent[] {
    return [...this.events];
  }

  getById(id: string): CalendarEvent | undefined {
    return this.events.find((event) => event.id === id);
  }

  add(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: this.generateId(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  update(id: string, updates: Partial<CalendarEvent>): CalendarEvent | undefined {
    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) {
      return undefined;
    }
    this.events[index] = { ...this.events[index], ...updates };
    return this.events[index];
  }

  delete(id: string): boolean {
    const index = this.events.findIndex((event) => event.id === id);
    if (index === -1) {
      return false;
    }
    this.events.splice(index, 1);
    return true;
  }

  getByDate(date: Date): CalendarEvent[] {
    return this.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }

  getByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.events.filter((event) => {
      const eventStart = event.startDate.getTime();
      const rangeStart = startDate.getTime();
      const rangeEnd = endDate.getTime();
      return eventStart >= rangeStart && eventStart <= rangeEnd;
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Event Service - Business logic layer
 * Provides high-level operations on events
 */
export class EventService {
  constructor(private repository: IEventRepository) {}

  getAllEvents(): CalendarEvent[] {
    return this.repository.getAll();
  }

  getEventById(id: string): CalendarEvent | undefined {
    return this.repository.getById(id);
  }

  createEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    return this.repository.add(event);
  }

  updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | undefined {
    return this.repository.update(id, updates);
  }

  deleteEvent(id: string): boolean {
    return this.repository.delete(id);
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.repository.getByDate(date);
  }

  getEventsForDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.repository.getByDateRange(startDate, endDate);
  }
}



