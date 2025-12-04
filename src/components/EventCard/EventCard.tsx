import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { CalendarEvent } from '../../types';
import { formatTime } from '../../utils/dateHelpers';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
  style?: any;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  style,
}) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: event.color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
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
    padding: 8,
    borderRadius: 6,
    marginVertical: 2,
    minHeight: 50,
    justifyContent: 'center',
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

