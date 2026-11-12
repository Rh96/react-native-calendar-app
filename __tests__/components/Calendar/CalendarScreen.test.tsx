import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CalendarScreen } from '../../../src/components/Calendar/CalendarScreen';
import { ThemeProvider } from '../../../src/theme';
import { useEvents } from '../../../src/hooks/useEvents';
import type { CalendarEvent } from '../../../src/types';

jest.mock('../../../src/hooks/useEvents');
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { uid: 'user-1' } }),
}));

// Wednesday 12 Nov 2026, 14:30, so "next full hour" is deterministic.
const NOW = new Date(2026, 10, 12, 14, 30);

const eventOnNov13: CalendarEvent = {
  id: 'evt-1',
  title: 'Dentist',
  startDate: new Date(2026, 10, 13, 10, 0),
  endDate: new Date(2026, 10, 13, 11, 0),
  color: '#4A90E2',
};

const addEvent = jest.fn(() => Promise.resolve('new-id'));
const updateEvent = jest.fn(() => Promise.resolve());
const deleteEvent = jest.fn(() => Promise.resolve());

const renderScreen = () =>
  render(
    <ThemeProvider>
      <CalendarScreen />
    </ThemeProvider>,
  );

describe('CalendarScreen event modal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    jest.clearAllMocks();
    jest.mocked(useEvents).mockReturnValue({
      events: [eventOnNov13],
      loading: false,
      error: null,
      retry: jest.fn(),
      addEvent,
      updateEvent,
      deleteEvent,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps an edited event on its own date after a time slot on another day was tapped', () => {
    renderScreen();

    // Day view for Nov 12: tap the 9 AM slot, then cancel the new-event modal.
    fireEvent.press(screen.getByText('Day'));
    fireEvent.press(screen.getByText('9 AM'));
    fireEvent.press(screen.getByText('Cancel'));

    // Go to Nov 13 and edit the existing event without touching its times.
    fireEvent.press(screen.getByText('›'));
    fireEvent.press(screen.getByText('Dentist'));
    fireEvent.press(screen.getByText('Save'));

    expect(updateEvent).toHaveBeenCalledWith(
      'evt-1',
      expect.objectContaining({
        startDate: new Date(2026, 10, 13, 10, 0),
        endDate: new Date(2026, 10, 13, 11, 0),
      }),
    );
  });

  it('defaults "+ Add Event" to the next full hour on the selected day, not midnight', () => {
    renderScreen();

    // Tapping a day in month view selects that day (at midnight) and opens day view.
    fireEvent.press(screen.getByText('20'));
    fireEvent.press(screen.getByText('+ Add Event'));
    fireEvent.changeText(screen.getByPlaceholderText('Event title'), 'Gym');
    fireEvent.press(screen.getByText('Save'));

    expect(addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Gym',
        startDate: new Date(2026, 10, 20, 15, 0),
        endDate: new Date(2026, 10, 20, 16, 0),
      }),
    );
  });

  it('starts a new event at the tapped time slot', () => {
    renderScreen();

    fireEvent.press(screen.getByText('Day'));
    fireEvent.press(screen.getByText('9 AM'));
    fireEvent.changeText(screen.getByPlaceholderText('Event title'), 'Focus');
    fireEvent.press(screen.getByText('Save'));

    expect(addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date(2026, 10, 12, 9, 0),
        endDate: new Date(2026, 10, 12, 10, 0),
      }),
    );
  });
});
