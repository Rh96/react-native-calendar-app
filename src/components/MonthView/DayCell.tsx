import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarEvent, CalendarDay } from '../../types';
import { useTheme } from '../../theme';
import { CALENDAR_DAY_SIZE, CALENDAR_DAY_BORDER_RADIUS, CALENDAR_CELL_SIZE } from '../../constants/dimensions';
import { APP_CONFIG } from '../../constants/config';

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;
  onPress: (date: Date) => void;
}

export const DayCell = memo<DayCellProps>(({ day, isSelected, onPress }) => {
  const theme = useTheme();
  const hasEvents = day.events.length > 0;

  const handlePress = () => {
    onPress(day.date);
  };

  const getTextStyle = () => {
    if (isSelected) {
      return [styles.dayText, { color: theme.colors.selectedText }];
    }
    
    return [
      styles.dayText,
      {
        color: theme.colors.text,
        opacity: !day.isCurrentMonth && !day.isToday ? 0.3 : 1,
      },
      day.isToday && { fontWeight: theme.fontWeight.semibold },
    ];
  };

  const getDayContentStyle = () => {
    const baseStyle = [
      styles.dayContent,
      {
        width: CALENDAR_DAY_SIZE,
        height: CALENDAR_DAY_SIZE,
        borderRadius: CALENDAR_DAY_BORDER_RADIUS,
      },
    ];

    if (isSelected) {
      return [
        ...baseStyle,
        {
          backgroundColor: theme.colors.selected,
        },
      ];
    }

    if (day.isToday && !isSelected) {
      return [
        ...baseStyle,
        {
          borderWidth: 2,
          borderColor: theme.colors.today,
          borderRadius: CALENDAR_DAY_BORDER_RADIUS,
        },
      ];
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={styles.dayCell}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={getDayContentStyle()}>
        <Text style={getTextStyle()}>{day.date.getDate()}</Text>
      </View>
      {hasEvents && (
        <View style={styles.eventIndicator}>
          {day.events.slice(0, APP_CONFIG.MAX_EVENT_DOTS_PER_DAY).map((event: CalendarEvent) => (
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
});

DayCell.displayName = 'DayCell';

const styles = StyleSheet.create({
  dayCell: {
    width: CALENDAR_CELL_SIZE,
    height: CALENDAR_CELL_SIZE,
    alignItems: 'center',
    paddingTop: 8,
  },
  dayContent: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dayText: {
    fontSize: 14,
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

