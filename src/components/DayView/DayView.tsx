import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CalendarEvent } from '../../types';
import {
  formatFullDate,
  generateHours,
  formatHour,
  getEventsForDay,
} from '../../utils/dateHelpers';
import { layoutEvents, EventLayout } from '../../utils/eventLayout';
import { useTheme } from '../../theme';
import { EventCard } from '../EventCard/EventCard';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onTimeSlotPress: (date: Date) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

const HOUR_HEIGHT = 60;
const PX_PER_MINUTE = HOUR_HEIGHT / 60; // = 1
const DAY_HEIGHT = 24 * HOUR_HEIGHT;
const HOUR_LABEL_WIDTH = 60;
const MIN_EVENT_HEIGHT = 40; // keeps short events tappable
const INITIAL_SCROLL_HOUR = 8;
const HOURS = generateHours();

const minutesSinceMidnight = (date: Date) => date.getHours() * 60 + date.getMinutes();
const durationInMinutes = (start: Date, end: Date) => (end.getTime() - start.getTime()) / 60_000;

export const DayView = React.memo<DayViewProps>(({
  selectedDate,
  events,
  onEventPress,
  onTimeSlotPress,
  onPrevDay,
  onNextDay,
}) => {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const dayEvents = useMemo(
    () => getEventsForDay(selectedDate, events),
    [selectedDate, events],
  );
  // Columns for overlapping events
  const eventLayouts = useMemo(() => layoutEvents(dayEvents), [dayEvents]);

  useEffect(() => {
    // Scroll to 8 AM whenever the day changes. Deferred so the ScrollView has
    // laid out its content first.
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: INITIAL_SCROLL_HOUR * HOUR_HEIGHT, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  const handleTimeSlotPress = (hour: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, 0, 0, 0);
    onTimeSlotPress(newDate);
  };

  const renderEvent = ({ event, left, width }: EventLayout) => {
    const top = minutesSinceMidnight(event.startDate) * PX_PER_MINUTE;
    const height = durationInMinutes(event.startDate, event.endDate) * PX_PER_MINUTE;

    return (
      <View
        key={event.id}
        testID={`event-${event.id}`}
        style={[
          styles.eventContainer,
          {
            top,
            height: Math.max(height, MIN_EVENT_HEIGHT),
            // Percentages of the events layer, not pixels from the screen
            // width, so rotation and split screen need no recalculation.
            left: `${left}%`,
            width: `${width}%`,
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
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={onPrevDay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous day">
          <Text style={[styles.navButtonText, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.dateText, { color: colors.text }]} accessibilityRole="header">
          {formatFullDate(selectedDate)}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onNextDay}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next day">
          <Text style={[styles.navButtonText, { color: colors.text }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}>
        <View style={styles.timeline}>
          {HOURS.map((hour) => (
            <TouchableOpacity
              key={hour}
              style={styles.hourRow}
              onPress={() => handleTimeSlotPress(hour)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Create event at ${formatHour(hour)}`}>
              <View style={styles.hourLabelContainer}>
                <Text style={[styles.hourLabel, { color: colors.textSecondary }]}>
                  {formatHour(hour)}
                </Text>
              </View>
              <View style={[styles.hourLine, { borderColor: colors.border }]} />
            </TouchableOpacity>
          ))}

          {/* Events Layer */}
          <View style={styles.eventsLayer}>
            {eventLayouts.map(renderEvent)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

DayView.displayName = 'DayView';

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
    height: HOUR_HEIGHT,
  },
  hourLabelContainer: {
    width: HOUR_LABEL_WIDTH,
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
    left: HOUR_LABEL_WIDTH,
    right: 0,
    height: DAY_HEIGHT,
  },
  eventContainer: {
    position: 'absolute',
    // Inner padding = 8 px gap between side-by-side events
    paddingHorizontal: 4,
  },
});
