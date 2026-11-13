import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CalendarEvent } from '../../types';
import { formatTime } from '../../utils/dateHelpers';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  style,
}) => {
  const timeRange = `${formatTime(event.startDate)} to ${formatTime(event.endDate)}`;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: event.color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${timeRange}`}
      accessibilityHint="Opens the event to edit">
      <Text style={styles.title} numberOfLines={1}>
        {event.title}
      </Text>
      <Text style={styles.time}>
        {formatTime(event.startDate)} - {formatTime(event.endDate)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Fill the time slot DayView sizes and positions (its MIN_EVENT_HEIGHT is
    // the only minimum). Without this the card shrinks to fit its text, so a
    // 2-hour event looked like a 50-minute one.
    flex: 1,
    overflow: 'hidden', // short events cut off their text instead of spilling
    padding: 8,
    borderRadius: 6,
    marginVertical: 2,
    justifyContent: 'flex-start', // title at the start time, like calendar apps
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    color: '#FFFFFF',
    fontSize: 11,
    opacity: 0.9,
  },
});






