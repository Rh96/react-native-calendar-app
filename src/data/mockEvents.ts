import { CalendarEvent } from '../types';

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    startDate: new Date(2025, 11, 5, 10, 0), // Dec 5, 2025, 10:00 AM
    endDate: new Date(2025, 11, 5, 11, 0),
    color: '#4A90E2',
    description: 'Weekly team sync',
  },
  {
    id: '2',
    title: 'Lunch Break',
    startDate: new Date(2025, 11, 5, 12, 0),
    endDate: new Date(2025, 11, 5, 13, 0),
    color: '#F5A623',
    description: 'Lunch with colleagues',
  },
  {
    id: '3',
    title: 'Project Review',
    startDate: new Date(2025, 11, 5, 14, 0),
    endDate: new Date(2025, 11, 5, 15, 30),
    color: '#7B61FF',
    description: 'Q4 project review',
  },
  {
    id: '4',
    title: 'Gym Session',
    startDate: new Date(2025, 11, 6, 18, 0),
    endDate: new Date(2025, 11, 6, 19, 30),
    color: '#50C878',
    description: 'Evening workout',
  },
  {
    id: '5',
    title: 'Client Call',
    startDate: new Date(2025, 11, 8, 9, 0),
    endDate: new Date(2025, 11, 8, 10, 0),
    color: '#E74C3C',
    description: 'Discuss requirements',
  },
  {
    id: '6',
    title: 'Code Review',
    startDate: new Date(2025, 11, 10, 15, 0),
    endDate: new Date(2025, 11, 10, 16, 0),
    color: '#3498DB',
    description: 'Review pull requests',
  },
];





