import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { formatMonthYear } from '../../utils/dateHelpers';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader = memo<CalendarHeaderProps>(
  ({ currentDate, onPrevMonth, onNextMonth }) => {
    const theme = useTheme();

    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={onPrevMonth}
          activeOpacity={0.7}>
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={[styles.monthYearText, { color: theme.colors.text }]}>
          {formatMonthYear(currentDate)}
        </Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onNextMonth}
          activeOpacity={0.7}>
          <Text style={[styles.navButtonText, { color: theme.colors.text }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

CalendarHeader.displayName = 'CalendarHeader';

const styles = StyleSheet.create({
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
});




