import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { CalendarEvent } from '../../types';
import { useTheme } from '../../theme';
import { validateEvent } from '../../utils/validation';
import { addHours, atTimeOn, moveToDay } from '../../utils/dateHelpers';
import { EVENT_COLORS } from '../../constants/colors';
import { APP_CONFIG } from '../../constants/config';
import { ColorPicker } from './ColorPicker';
import { DateTimeField } from './DateTimeField';
import { styles } from './EventModal.styles';

/**
 * What the modal is doing. A single discriminated union instead of two optional
 * props (`event?` + `initialDate?`), so "editing X but dated from Y" can't be
 * expressed at all. That combination was the cause of events moving days.
 */
export type EventModalTarget =
  | { mode: 'create'; start: Date }
  | { mode: 'edit'; event: CalendarEvent };

interface EventModalProps {
  visible: boolean;
  target: EventModalTarget;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
}

export const EventModal = memo<EventModalProps>(({
  visible,
  target,
  onClose,
  onSave,
  onDelete,
}) => {
  const theme = useTheme();
  const isEdit = target.mode === 'edit';
  const initialStart = target.mode === 'edit' ? target.event.startDate : target.start;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(EVENT_COLORS[0]);
  // The event's day is startDate's date. It changes only through the date
  // field, never because another day was tapped in the calendar.
  const [startDate, setStartDate] = useState(() => new Date(initialStart));
  const [endDate, setEndDate] = useState(() => new Date(initialStart));

  // Re-initialise the form every time the modal opens.
  useEffect(() => {
    if (!visible) {
      return;
    }
    if (target.mode === 'edit') {
      setTitle(target.event.title);
      setDescription(target.event.description ?? '');
      setSelectedColor(target.event.color);
      setStartDate(new Date(target.event.startDate));
      setEndDate(new Date(target.event.endDate));
    } else {
      setTitle('');
      setDescription('');
      setSelectedColor(EVENT_COLORS[0]);
      setStartDate(new Date(target.start));
      setEndDate(addHours(target.start, APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS));
    }
  }, [target, visible]);

  const handleSave = useCallback(() => {
    const eventData: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      // Always sent, even empty: eventsApi only writes keys that are present,
      // so leaving it out would keep an old description the user cleared.
      description: description.trim(),
      startDate,
      endDate,
      color: selectedColor,
    };

    const validation = validateEvent(eventData);
    if (!validation.isValid) {
      Alert.alert('Error', validation.error || 'Invalid event data');
      return;
    }

    onSave(eventData);
    onClose();
  }, [title, description, startDate, endDate, selectedColor, onSave, onClose]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ]
    );
  }, [onDelete, onClose]);

  const handleDateChange = useCallback((picked: Date) => {
    const moved = moveToDay(startDate, endDate, picked);
    setStartDate(moved.start);
    setEndDate(moved.end);
  }, [startDate, endDate]);

  const handleStartTimeChange = useCallback((time: Date) => {
    const newStart = atTimeOn(startDate, time);
    setStartDate(newStart);

    // Keep the event at least the default duration long if start passes end
    if (newStart >= endDate) {
      setEndDate(addHours(newStart, APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS));
    }
  }, [startDate, endDate]);

  const handleEndTimeChange = useCallback((time: Date) => {
    const newEnd = atTimeOn(startDate, time);
    setEndDate(newEnd);

    if (newEnd <= startDate) {
      setStartDate(addHours(newEnd, -APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS));
    }
  }, [startDate]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.surface },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[styles.headerText, { color: theme.colors.text }]}
                accessibilityRole="header">
                {isEdit ? 'Edit Event' : 'New Event'}
              </Text>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.text,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Event title"
                accessibilityLabel="Event title"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.text,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional"
                multiline
                maxLength={APP_CONFIG.MAX_EVENT_DESCRIPTION_LENGTH}
                accessibilityLabel="Event description"
                accessibilityHint={`Optional, up to ${APP_CONFIG.MAX_EVENT_DESCRIPTION_LENGTH} characters`}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            <DateTimeField
              label="Date"
              mode="date"
              value={startDate}
              onChange={handleDateChange}
            />

            <DateTimeField
              label="Start Time"
              mode="time"
              value={startDate}
              onChange={handleStartTimeChange}
            />

            <DateTimeField
              label="End Time"
              mode="time"
              value={endDate}
              onChange={handleEndTimeChange}
            />

            {/* Color Picker */}
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
            />

            {/* Buttons */}
            <View style={styles.buttons}>
              {isEdit && onDelete && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeletePress}
                  accessibilityRole="button">
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: theme.colors.text },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                accessibilityRole="button">
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

EventModal.displayName = 'EventModal';
