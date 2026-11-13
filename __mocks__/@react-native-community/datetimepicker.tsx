/**
 * Mock for @react-native-community/datetimepicker
 *
 * The real picker is a native view (iOS) or a native dialog (Android), and
 * neither exists in Jest. This renders a plain element with testID
 * `date-picker` / `time-picker` that receives the same `onChange(event, date)`
 * the native picker calls, so a test "answers" the picker with:
 *
 *   fireEvent(screen.getByTestId('date-picker'), 'change', event, date)
 */
import { createElement } from 'react';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface MockPickerProps {
  value: Date;
  mode?: 'date' | 'time';
  onChange?: (event: DateTimePickerEvent, date?: Date) => void;
}

const DateTimePicker = ({ mode = 'date', value, onChange }: MockPickerProps) =>
  createElement('DateTimePicker', { testID: `${mode}-picker`, mode, value, onChange });

export default DateTimePicker;
