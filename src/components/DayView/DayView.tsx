import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { CalendarEvent } from '../../types';
import {
  formatFullDate,
  generateHours,
  formatHour,
  getEventsForDay,
  calculateEventPosition,
  calculateEventHeight,
} from '../../utils/dateHelpers';
import { EventCard } from '../EventCard/EventCard';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onTimeSlotPress: (date: Date) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onBackToMonth: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  events,
  onEventPress,
  onTimeSlotPress,
  onPrevDay,
  onNextDay,
  onBackToMonth,
}) => {
  const isDark = useColorScheme() === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const dayEvents = getEventsForDay(selectedDate, events);
  const hours = generateHours();

  const HOUR_HEIGHT = 60;

  useEffect(() => {
    // Scroll to 8 AM on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 8 * HOUR_HEIGHT, animated: false });
    }, 100);
  }, [selectedDate]);

  const handleTimeSlotPress = (hour: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, 0, 0, 0);
    onTimeSlotPress(newDate);
  };

  const renderEvent = (event: CalendarEvent) => {
    const top = (calculateEventPosition(event.startDate) * 24 * HOUR_HEIGHT) / 100;
    const height = (calculateEventHeight(event.startDate, event.endDate) * 24 * HOUR_HEIGHT) / 100;

    return (
      <View
        key={event.id}
        style={[
          styles.eventContainer,
          {
            top,
            height: Math.max(height, 40),
          },
        ]}>
        <EventCard event={event} onPress={() => onEventPress(event)} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToMonth}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.backButtonText,
              { color: isDark ? '#4A90E2' : '#4A90E2' },
            ]}>
            ‹ Month
          </Text>
        </TouchableOpacity>

        <View style={styles.dateNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={onPrevDay}
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
              styles.dateText,
              { color: isDark ? '#FFFFFF' : '#000000' },
            ]}>
            {formatFullDate(selectedDate)}
          </Text>

          <TouchableOpacity
            style={styles.navButton}
            onPress={onNextDay}
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
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}>
        <View style={styles.timeline}>
          {hours.map((hour) => (
            <TouchableOpacity
              key={hour}
              style={[
                styles.hourRow,
                { height: HOUR_HEIGHT },
              ]}
              onPress={() => handleTimeSlotPress(hour)}
              activeOpacity={0.7}>
              <View style={styles.hourLabelContainer}>
                <Text
                  style={[
                    styles.hourLabel,
                    { color: isDark ? '#AAAAAA' : '#666666' },
                  ]}>
                  {formatHour(hour)}
                </Text>
              </View>
              <View
                style={[
                  styles.hourLine,
                  { borderColor: isDark ? '#333333' : '#E0E0E0' },
                ]}
              />
            </TouchableOpacity>
          ))}

          {/* Events Layer */}
          <View style={styles.eventsLayer}>
            {dayEvents.map((event) => renderEvent(event))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  timeline: {
    position: 'relative',
    paddingBottom: 100,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabelContainer: {
    width: 60,
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  hourLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  hourLine: {
    flex: 1,
    borderTopWidth: 1,
    marginLeft: 8,
  },
  eventsLayer: {
    position: 'absolute',
    top: 0,
    left: 60,
    right: 0,
    height: 24 * 60, // 24 hours
  },
  eventContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
  },
});

