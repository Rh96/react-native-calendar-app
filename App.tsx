/**
 * Calendar App
 * Custom Google Calendar-style app with Month and Day views
 *
 * @format
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { MonthView } from './src/components/MonthView/MonthView';
import { DayView } from './src/components/DayView/DayView';
import { EventModal } from './src/components/EventModal/EventModal';
import { useCalendar } from './src/hooks/useCalendar';
import { useEvents } from './src/hooks/useEvents';
import { CalendarEvent } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  
  const calendar = useCalendar();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();

  const handleDateSelect = (date: Date) => {
    calendar.selectDate(date);
    calendar.setViewMode('day');
  };

  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleTimeSlotPress = (date: Date) => {
    setModalInitialDate(date);
    setSelectedEvent(undefined);
    setModalVisible(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    setModalVisible(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setModalVisible(false);
    }
  };

  const handleBackToMonth = () => {
    calendar.setViewMode('month');
  };

  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setModalInitialDate(calendar.selectedDate);
    setModalVisible(true);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
      ]}>
      {/* Header with View Toggle and Add Button */}
      <View
        style={[
          styles.topBar,
          { 
            paddingTop: safeAreaInsets.top,
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderBottomColor: isDark ? '#333333' : '#E0E0E0',
          },
        ]}>
        <View style={[
          styles.viewToggle,
          { backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5' }
        ]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              calendar.viewMode === 'month' && styles.toggleButtonActive,
            ]}
            onPress={() => calendar.setViewMode('month')}>
            <Text
              style={[
                styles.toggleButtonText,
                { color: isDark ? '#FFFFFF' : '#000000' },
                calendar.viewMode === 'month' && styles.toggleButtonTextActive,
              ]}>
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              calendar.viewMode === 'day' && styles.toggleButtonActive,
            ]}
            onPress={() => calendar.setViewMode('day')}>
            <Text
              style={[
                styles.toggleButtonText,
                { color: isDark ? '#FFFFFF' : '#000000' },
                calendar.viewMode === 'day' && styles.toggleButtonTextActive,
              ]}>
              Day
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddEvent}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Views */}
      {calendar.viewMode === 'month' ? (
        <MonthView
          currentDate={calendar.currentDate}
          selectedDate={calendar.selectedDate}
          events={events}
          onDateSelect={handleDateSelect}
          onPrevMonth={calendar.goToPrevMonth}
          onNextMonth={calendar.goToNextMonth}
        />
      ) : (
        <DayView
          selectedDate={calendar.selectedDate}
          events={events}
          onEventPress={handleEventPress}
          onTimeSlotPress={handleTimeSlotPress}
          onPrevDay={calendar.goToPrevDay}
          onNextDay={calendar.goToNextDay}
          onBackToMonth={handleBackToMonth}
        />
      )}

      {/* Event Modal */}
      <EventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={modalInitialDate}
      />

      {/* Today Button */}
      <TouchableOpacity
        style={[
          styles.todayButton,
          { bottom: safeAreaInsets.bottom + 20 },
        ]}
        onPress={calendar.goToToday}>
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  todayButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;
