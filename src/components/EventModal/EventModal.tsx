import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { CalendarEvent } from '../../types';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
  event?: CalendarEvent;
  initialDate?: Date;
}

const COLORS = [
  '#4A90E2',
  '#F5A623',
  '#7B61FF',
  '#50C878',
  '#E74C3C',
  '#3498DB',
  '#E91E63',
  '#9C27B0',
];

export const EventModal: React.FC<EventModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
}) => {
  const isDark = useColorScheme() === 'dark';
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSelectedColor(event.color);
      setStartDate(event.startDate);
      setEndDate(event.endDate);
    } else if (initialDate) {
      const start = new Date(initialDate);
      const end = new Date(initialDate);
      end.setHours(end.getHours() + 1);
      setStartDate(start);
      setEndDate(end);
    }
  }, [event, initialDate, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    onSave({
      title: title.trim(),
      startDate,
      endDate,
      color: selectedColor,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setSelectedColor(COLORS[0]);
    onClose();
  };

  const handleDeletePress = () => {
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
  };

  const adjustTime = (
    date: Date,
    isStart: boolean,
    amount: number
  ) => {
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + amount);
    if (isStart) {
      setStartDate(newDate);
      if (newDate >= endDate) {
        const newEnd = new Date(newDate);
        newEnd.setHours(newEnd.getHours() + 1);
        setEndDate(newEnd);
      }
    } else {
      setEndDate(newDate);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
            { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.headerText,
                  { color: isDark ? '#FFFFFF' : '#000000' },
                ]}>
                {event ? 'Edit Event' : 'New Event'}
              </Text>
            </View>

            {/* Title Input */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#AAAAAA' : '#666666' },
                ]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5',
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Event title"
                placeholderTextColor={isDark ? '#666666' : '#999999'}
              />
            </View>

            {/* Start Time */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#AAAAAA' : '#666666' },
                ]}>
                Start Time
              </Text>
              <View style={styles.timeContainer}>
                <Text
                  style={[
                    styles.timeText,
                    { color: isDark ? '#FFFFFF' : '#000000' },
                  ]}>
                  {formatDateTime(startDate)}
                </Text>
                <View style={styles.timeButtons}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(startDate, true, -15)}>
                    <Text style={styles.timeButtonText}>-15m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(startDate, true, 15)}>
                    <Text style={styles.timeButtonText}>+15m</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* End Time */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#AAAAAA' : '#666666' },
                ]}>
                End Time
              </Text>
              <View style={styles.timeContainer}>
                <Text
                  style={[
                    styles.timeText,
                    { color: isDark ? '#FFFFFF' : '#000000' },
                  ]}>
                  {formatDateTime(endDate)}
                </Text>
                <View style={styles.timeButtons}>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(endDate, false, -15)}>
                    <Text style={styles.timeButtonText}>-15m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => adjustTime(endDate, false, 15)}>
                    <Text style={styles.timeButtonText}>+15m</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Color Picker */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#AAAAAA' : '#666666' },
                ]}>
                Color
              </Text>
              <View style={styles.colorContainer}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

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
                    { color: isDark ? '#FFFFFF' : '#000000' },
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
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    marginRight: 'auto',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

