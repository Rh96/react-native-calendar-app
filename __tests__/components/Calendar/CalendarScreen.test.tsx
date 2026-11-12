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

// Thursday 12 Nov 2026, 14:30, so "next full hour" is deterministic.
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
    fireEvent.press(screen.getByRole('button', { name: 'Day' }));
    fireEvent.press(screen.getByRole('button', { name: 'Create event at 9 AM' }));
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    // Go to Nov 13 and edit the existing event without touching its times.
    fireEvent.press(screen.getByRole('button', { name: 'Next day' }));
    fireEvent.press(screen.getByRole('button', { name: /^Dentist,/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

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
    fireEvent.press(screen.getByRole('button', { name: 'Friday, November 20, 2026' }));
    fireEvent.press(screen.getByRole('button', { name: 'Add event' }));
    fireEvent.changeText(screen.getByLabelText('Event title'), 'Gym');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Gym',
        startDate: new Date(2026, 10, 20, 15, 0),
        endDate: new Date(2026, 10, 20, 16, 0),
      }),
    );
  });

  it('shows the selected day’s month after paging days into the next month', () => {
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Day' }));
    // 12 Nov → 1 Dec
    for (let i = 0; i < 19; i++) {
      fireEvent.press(screen.getByRole('button', { name: 'Next day' }));
    }
    expect(screen.getByRole('header', { name: 'Tuesday, December 1, 2026' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getByRole('header', { name: 'December 2026' })).toBeOnTheScreen();
  });

  it('shows the next month after tapping one of its greyed-out days', () => {
    renderScreen();

    // Nov 2026 grid ends with 1–12 Dec, shown greyed out
    fireEvent.press(screen.getByRole('button', { name: 'Saturday, December 5, 2026' }));
    expect(screen.getByRole('header', { name: 'Saturday, December 5, 2026' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getByRole('header', { name: 'December 2026' })).toBeOnTheScreen();
  });

  it('returns to today from the toolbar Today button', () => {
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Day' }));
    fireEvent.press(screen.getByRole('button', { name: 'Next day' }));
    fireEvent.press(screen.getByRole('button', { name: 'Next day' }));
    expect(screen.getByRole('header', { name: 'Saturday, November 14, 2026' })).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByRole('header', { name: 'Thursday, November 12, 2026' })).toBeOnTheScreen();
  });

  it('starts a new event at the tapped time slot', () => {
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Day' }));
    fireEvent.press(screen.getByRole('button', { name: 'Create event at 9 AM' }));
    fireEvent.changeText(screen.getByLabelText('Event title'), 'Focus');
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(addEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date(2026, 10, 12, 9, 0),
        endDate: new Date(2026, 10, 12, 10, 0),
      }),
    );
  });

  describe('accessibility', () => {
    it('labels month navigation and day cells with date, today, event count and selection', () => {
      renderScreen();

      expect(screen.getByRole('header', { name: 'November 2026' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Previous month' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Next month' })).toBeOnTheScreen();

      const today = screen.getByRole('button', { name: 'Thursday, November 12, 2026, today' });
      expect(today).toBeSelected();
      expect(
        screen.getByRole('button', { name: 'Friday, November 13, 2026, 1 event' }),
      ).not.toBeSelected();
    });

    it('marks the active view and labels day navigation, back button and events', () => {
      renderScreen();

      expect(screen.getByRole('button', { name: 'Month' })).toBeSelected();
      fireEvent.press(screen.getByRole('button', { name: 'Day' }));
      expect(screen.getByRole('button', { name: 'Day' })).toBeSelected();

      expect(screen.getByRole('button', { name: 'Previous day' })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Back to month view' })).toBeOnTheScreen();

      fireEvent.press(screen.getByRole('button', { name: 'Next day' }));
      // formatTime may use a narrow no-break space before AM/PM, hence \s
      expect(
        screen.getByRole('button', { name: /^Dentist, 10:00\sAM to 11:00\sAM$/ }),
      ).toBeOnTheScreen();
    });

    it('exposes the event form as labelled fields and a colour radio group', () => {
      renderScreen();
      fireEvent.press(screen.getByRole('button', { name: 'Add event' }));

      expect(screen.getByRole('header', { name: 'New Event' })).toBeOnTheScreen();
      expect(screen.getByLabelText('Event title')).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: /^Start Time, 3:00\sPM$/ })).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: /^End Time, 4:00\sPM$/ })).toBeOnTheScreen();

      expect(screen.getAllByRole('radio')).toHaveLength(8);
      expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();

      fireEvent.press(screen.getByRole('radio', { name: 'Teal' }));
      expect(screen.getByRole('radio', { name: 'Teal' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Blue' })).not.toBeChecked();
    });
  });
});
