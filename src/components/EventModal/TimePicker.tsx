import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme';
import { formatTimeOnly } from '../../utils/dateHelpers';

interface TimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  onValidationError?: (error: string) => void;
}

export const TimePicker = memo<TimePickerProps>(
  ({ label, value, onChange, onValidationError }) => {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    const handlePress = () => {
      setShowPicker(true);
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      
      if (selectedDate) {
        const newDate = new Date(value);
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        onChange(newDate);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <TouchableOpacity
          style={[
            styles.timeButton,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
          onPress={handlePress}>
          <Text style={[styles.timeText, { color: theme.colors.text }]}>
            {formatTimeOnly(value)}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={value}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>
    );
  }
);

TimePicker.displayName = 'TimePicker';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
});



