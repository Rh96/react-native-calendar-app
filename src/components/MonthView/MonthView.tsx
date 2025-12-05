import React, { useMemo, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarEvent } from '../../types';
import { generateCalendarDays, isSameDay } from '../../utils/dateHelpers';
import { CalendarHeader } from './CalendarHeader';
import { WeekdayHeader } from './WeekdayHeader';
import { DayCell } from './DayCell';
import { styles } from './MonthView.styles';

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthView = memo<MonthViewProps>(({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}) => {
  const calendarDays = useMemo(
    () => generateCalendarDays(currentDate, events),
    [currentDate, events]
  );

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <View style={styles.container}>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <WeekdayHeader />
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate);
          return (
            <DayCell
              key={`${day.date.getTime()}-${index}`}
              day={day}
              isSelected={isSelected}
              onPress={handleDateSelect}
            />
          );
        })}
      </View>
    </View>
  );
});

MonthView.displayName = 'MonthView';

