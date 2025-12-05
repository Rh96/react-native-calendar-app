import { CalendarEvent } from '../types';

/**
 * Layout information for an event
 */
export interface EventLayout {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
  left: number;
  width: number;
}

/**
 * Check if two events overlap in time
 */
export const eventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = event1.startDate.getTime();
  const end1 = event1.endDate.getTime();
  const start2 = event2.startDate.getTime();
  const end2 = event2.endDate.getTime();

  // Events overlap if one starts before the other ends
  return start1 < end2 && start2 < end1;
};

/**
 * Detect all overlapping event groups
 * Returns an array of arrays, where each inner array contains overlapping events
 */
export const detectOverlapGroups = (events: CalendarEvent[]): CalendarEvent[][] => {
  if (events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  const groups: CalendarEvent[][] = [];

  for (const event of sortedEvents) {
    let addedToGroup = false;

    // Try to add to an existing group
    for (const group of groups) {
      // Check if this event overlaps with any event in the group
      const overlapsWithGroup = group.some((groupEvent) => eventsOverlap(event, groupEvent));

      if (overlapsWithGroup) {
        group.push(event);
        addedToGroup = true;
        break;
      }
    }

    // If not added to any group, create a new group
    if (!addedToGroup) {
      groups.push([event]);
    }
  }

  return groups;
};

/**
 * Assign events to columns within an overlap group
 * Uses a greedy algorithm to minimize the number of columns
 */
const assignColumns = (events: CalendarEvent[]): Map<CalendarEvent, number> => {
  const columnMap = new Map<CalendarEvent, number>();
  const columns: CalendarEvent[][] = [];

  // Sort events by start time, then by end time
  const sortedEvents = [...events].sort((a, b) => {
    const startDiff = a.startDate.getTime() - b.startDate.getTime();
    if (startDiff !== 0) return startDiff;
    return a.endDate.getTime() - b.endDate.getTime();
  });

  for (const event of sortedEvents) {
    let assigned = false;

    // Try to find a column where this event doesn't overlap with existing events
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const columnEvents = columns[colIndex];
      const overlaps = columnEvents.some((colEvent) => eventsOverlap(event, colEvent));

      if (!overlaps) {
        columnEvents.push(event);
        columnMap.set(event, colIndex);
        assigned = true;
        break;
      }
    }

    // If no suitable column found, create a new one
    if (!assigned) {
      const newColumnIndex = columns.length;
      columns.push([event]);
      columnMap.set(event, newColumnIndex);
    }
  }

  return columnMap;
};

/**
 * Calculate layout for events in a day view
 * Returns layout information for each event including column assignment, width, and left offset
 */
export const layoutEvents = (events: CalendarEvent[]): EventLayout[] => {
  if (events.length === 0) return [];

  // Detect overlap groups
  const overlapGroups = detectOverlapGroups(events);

  const layouts: EventLayout[] = [];

  for (const group of overlapGroups) {
    // Assign columns within this group
    const columnMap = assignColumns(group);
    const totalColumns = Math.max(...Array.from(columnMap.values())) + 1;

    // Calculate layout for each event in the group
    for (const event of group) {
      const column = columnMap.get(event) ?? 0;
      const width = 100 / totalColumns; // Percentage width
      const left = (column * width); // Percentage left offset

      layouts.push({
        event,
        column,
        totalColumns,
        left,
        width,
      });
    }
  }

  return layouts;
};

