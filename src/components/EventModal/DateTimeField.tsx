import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme';
import { formatDateOnly, formatFullDate, formatTimeOnly } from '../../utils/dateHelpers';

interface DateTimeFieldProps {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  /**
   * The picked value, as the native picker returns it. The caller decides which
   * part to use (the date part in date mode, hours and minutes in time mode).
   */
  onChange: (picked: Date) => void;
}

/** A labelled button showing a date or time; pressing it opens the native picker. */
export const DateTimeField = memo<DateTimeFieldProps>(
  ({ label, mode, value, onChange }) => {
    const theme = useTheme();
    const [showPicker, setShowPicker] = useState(false);

    const shown = mode === 'date' ? formatDateOnly(value) : formatTimeOnly(value);
    // Screen readers get the unabbreviated date ("Saturday, November 14, 2026")
    const spoken = mode === 'date' ? formatFullDate(value) : formatTimeOnly(value);

    const handleChange = (event: DateTimePickerEvent, picked?: Date) => {
      // Android shows a dialog that closes on OK or Cancel; iOS stays inline
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
      // Android also calls onChange on Cancel ('dismissed'), with the old value
      if (event.type === 'set' && picked) {
        onChange(picked);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.surfaceSecondary },
          ]}
          onPress={() => setShowPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${spoken}`}
          accessibilityHint={`Opens a ${mode} picker`}>
          <Text style={[styles.valueText, { color: theme.colors.text }]}>
            {shown}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={value}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
          />
        )}
      </View>
    );
  }
);

DateTimeField.displayName = 'DateTimeField';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
