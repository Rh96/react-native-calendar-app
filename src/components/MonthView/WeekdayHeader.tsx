import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { WEEKDAYS } from '../../constants/config';
import { CALENDAR_CELL_SIZE } from '../../constants/dimensions';

export const WeekdayHeader = memo(() => {
  const theme = useTheme();

  return (
    <View style={styles.weekdayHeader}>
      {WEEKDAYS.map((day) => (
        <View key={day} style={styles.weekdayCell}>
          <Text style={[styles.weekdayText, { color: theme.colors.textSecondary }]}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
});

WeekdayHeader.displayName = 'WeekdayHeader';

const styles = StyleSheet.create({
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayCell: {
    width: CALENDAR_CELL_SIZE,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
});



