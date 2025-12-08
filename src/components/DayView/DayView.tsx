import React, { useRef, useEffect, useMemo } from 'react';
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
import { layoutEvents, EventLayout } from '../../utils/eventLayout';
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

export const DayView = React.memo<DayViewProps>(({
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

  // Calculate layout for events to handle overlaps
  const eventLayouts = useMemo(() => layoutEvents(dayEvents), [dayEvents]);

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

  const renderEvent = (layout: EventLayout) => {
    const { event, left: leftPercent, width: widthPercent } = layout;
    const top = (calculateEventPosition(event.startDate) * 24 * HOUR_HEIGHT) / 100;
    const height = (calculateEventHeight(event.startDate, event.endDate) * 24 * HOUR_HEIGHT) / 100;

    // Calculate pixel values from percentages
    // eventsLayer has left: 60 (for hour labels) and right: 0
    // Available width is screen width - 60, minus padding (8px total: 4px on each side)
    const availableWidth = width - 60 - 8;
    const leftPixels = (leftPercent / 100) * availableWidth;
    const widthPixels = (widthPercent / 100) * availableWidth;

    return (
      <View
        key={event.id}
        style={[
          styles.eventContainer,
          {
            top,
            height: Math.max(height, 40),
            left: leftPixels,
            width: widthPixels,
          },
        ]}>
        <EventCard event={event} onPress={() => onEventPress(event)} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
      <View
        style={[
          styles.dateNavigation,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderBottomColor: isDark ? '#333333' : '#E0E0E0' },
        ]}>
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
            {eventLayouts.map((layout) => renderEvent(layout))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

DayView.displayName = 'DayView';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
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
    paddingHorizontal: 4,
  },
});



