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
import { formatDateOnly } from '../../utils/dateHelpers';
import { EVENT_COLORS } from '../../constants/colors';
import { APP_CONFIG } from '../../constants/config';
import { ColorPicker } from './ColorPicker';
import { TimePicker } from './TimePicker';
import { styles } from './EventModal.styles';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
  event?: CalendarEvent;
  initialDate?: Date;
}

export const EventModal = memo<EventModalProps>(({
  visible,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
}) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(EVENT_COLORS[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSelectedColor(event.color);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
    } else if (initialDate) {
      // Reset form fields for new event
      setTitle('');
      setSelectedColor(EVENT_COLORS[0]);
      const start = new Date(initialDate);
      // Use the hour from initialDate (set by time slot press), not current hour
      const initialHour = initialDate.getHours();
      start.setHours(initialHour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS);
      setStartDate(start);
      setEndDate(end);
    } else {
      // Reset to defaults when modal closes
      const now = new Date();
      const start = new Date(now);
      start.setHours(now.getHours() + 1, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS);
      setStartDate(start);
      setEndDate(end);
    }
  }, [event, initialDate, visible]);

  const handleSave = useCallback(() => {
    // Combine the date from initialDate/event with the selected times
    const baseDate = initialDate || (event ? event.startDate : new Date());
    
    const finalStartDate = new Date(baseDate);
    finalStartDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

    const finalEndDate = new Date(baseDate);
    finalEndDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
      color: selectedColor,
    };

    const validation = validateEvent(eventData);
    if (!validation.isValid) {
      Alert.alert('Error', validation.error || 'Invalid event data');
      return;
    }

    onSave(eventData);
    handleClose();
  }, [title, startDate, endDate, selectedColor, initialDate, event, onSave]);

  const handleClose = useCallback(() => {
    setTitle('');
    setSelectedColor(EVENT_COLORS[0]);
    onClose();
  }, [onClose]);

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
            handleClose();
          },
        },
      ]
    );
  }, [onDelete, handleClose]);

  const handleStartTimeChange = useCallback((date: Date) => {
    // Preserve the date part from initialDate or event
    const baseDate = initialDate || (event ? event.startDate : new Date());
    const newStart = new Date(baseDate);
    newStart.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setStartDate(newStart);
    
    // Adjust end time if needed
    const currentEnd = new Date(endDate);
    if (newStart >= currentEnd) {
      const newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS);
      setEndDate(newEnd);
    }
  }, [endDate, initialDate, event]);

  const handleEndTimeChange = useCallback((date: Date) => {
    // Preserve the date part from initialDate or event
    const baseDate = initialDate || (event ? event.startDate : new Date());
    const newEnd = new Date(baseDate);
    newEnd.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setEndDate(newEnd);
    
    // Adjust start time if needed
    const currentStart = new Date(startDate);
    if (newEnd <= currentStart) {
      const newStart = new Date(newEnd);
      newStart.setHours(newStart.getHours() - APP_CONFIG.DEFAULT_EVENT_DURATION_HOURS);
      setStartDate(newStart);
    }
  }, [startDate, initialDate, event]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.surface },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerText, { color: theme.colors.text }]}>
                {event ? 'Edit Event' : 'New Event'}
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
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>

            {/* Date Display - Read Only */}
            {(initialDate || event) && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                  Date
                </Text>
                <View
                  style={[
                    styles.dateDisplay,
                    { backgroundColor: theme.colors.surfaceSecondary },
                  ]}>
                  <Text style={[styles.dateDisplayText, { color: theme.colors.text }]}>
                    {formatDateOnly(initialDate || startDate)}
                  </Text>
                </View>
              </View>
            )}

            {/* Start Time */}
            <TimePicker
              label="Start Time"
              value={startDate}
              onChange={handleStartTimeChange}
            />

            {/* End Time */}
            <TimePicker
              label="End Time"
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
              {event && onDelete && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeletePress}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}>
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
                onPress={handleSave}>
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

