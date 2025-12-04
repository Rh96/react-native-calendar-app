import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { CalendarEvent } from '../../types';
import {
  generateCalendarDays,
  formatMonthYear,
  isSameDay,
} from '../../utils/dateHelpers';

interface MonthViewProps {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}) => {
  const isDark = useColorScheme() === 'dark';
  const calendarDays = generateCalendarDays(currentDate, events);

  const renderDay = (day: any, index: number) => {
    const isSelected = isSameDay(day.date, selectedDate);
    const hasEvents = day.events.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={styles.dayCell}
        onPress={() => onDateSelect(day.date)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.dayContent,
            isSelected && styles.selectedDay,
            day.isToday && !isSelected && styles.todayDay,
          ]}>
          <Text
            style={[
              styles.dayText,
              !day.isCurrentMonth && styles.otherMonthDay,
              isSelected && styles.selectedDayText,
              day.isToday && !isSelected && styles.todayDayText,
              !isSelected && { color: isDark ? '#FFFFFF' : '#000000' },
            ]}>
            {day.date.getDate()}
          </Text>
        </View>
        {hasEvents && (
          <View style={styles.eventIndicator}>
            {day.events.slice(0, 3).map((event: CalendarEvent) => (
              <View
                key={event.id}
                style={[
                  styles.eventDot,
                  { backgroundColor: event.color },
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Month/Year and Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={onPrevMonth}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.navButtonText,
              { color: isDark ? '#FFFFFF' : '#000000' },
            ]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.monthYearText,
            { color: isDark ? '#FFFFFF' : '#000000' },
          ]}>
          {formatMonthYear(currentDate)}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onNextMonth}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.navButtonText,
              { color: isDark ? '#FFFFFF' : '#000000' },
            ]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                { color: isDark ? '#AAAAAA' : '#666666' },
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => renderDay(day, index))}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const cellSize = (width - 40) / 7;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 32,
    fontWeight: '300',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayCell: {
    width: cellSize,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    paddingTop: 8,
  },
  dayContent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dayText: {
    fontSize: 14,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  selectedDay: {
    backgroundColor: '#4A90E2',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 16,
  },
  todayDayText: {
    fontWeight: '600',
  },
  eventIndicator: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

