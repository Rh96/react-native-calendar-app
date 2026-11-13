import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { DayView } from '../../../src/components/DayView/DayView';
import { ThemeProvider } from '../../../src/theme';
import type { CalendarEvent } from '../../../src/types';

const event = (id: string, fromHour: number, toHour: number): CalendarEvent => ({
  id,
  title: id,
  startDate: new Date(2026, 10, 12, fromHour, 0),
  endDate: new Date(2026, 10, 12, toHour, 0),
  color: '#4A90E2',
});

const renderDay = (events: CalendarEvent[]) =>
  render(
    <ThemeProvider>
      <DayView
        selectedDate={new Date(2026, 10, 12)}
        events={events}
        onEventPress={jest.fn()}
        onTimeSlotPress={jest.fn()}
        onPrevDay={jest.fn()}
        onNextDay={jest.fn()}
      />
    </ThemeProvider>,
  );

const styleOf = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe('DayView', () => {
  it('places overlapping events side by side using percentages of the events area', () => {
    renderDay([event('a', 9, 11), event('b', 10, 12)]);

    expect(styleOf('event-a')).toMatchObject({ left: '0%', width: '50%' });
    expect(styleOf('event-b')).toMatchObject({ left: '50%', width: '50%' });
  });

  it('positions events vertically at 1 px per minute with a minimum height', () => {
    renderDay([
      event('long', 9, 11),
      { ...event('short', 13, 13), endDate: new Date(2026, 10, 12, 13, 10) },
    ]);

    expect(styleOf('event-long')).toMatchObject({ top: 540, height: 120, width: '100%' });
    expect(styleOf('event-short')).toMatchObject({ top: 780, height: 40 });
  });

  it('draws each event card filling its slot, so its height matches its duration', () => {
    // Jest has no layout engine, so check the style that makes the card
    // stretch to the slot sized above (the bug: it shrank to fit its text).
    renderDay([event('long', 9, 11)]);

    const card = StyleSheet.flatten(screen.getByRole('button', { name: /^long,/ }).props.style);
    expect(card).toMatchObject({ flex: 1 });
    expect(card).not.toHaveProperty('minHeight');
  });

  it('only shows events from the selected day', () => {
    renderDay([event('today', 9, 10), { ...event('tomorrow', 9, 10), startDate: new Date(2026, 10, 13, 9) }]);

    expect(screen.getByTestId('event-today')).toBeOnTheScreen();
    expect(screen.queryByTestId('event-tomorrow')).not.toBeOnTheScreen();
  });
});
