import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { MonthView } from '../MonthView';
import { DayView } from '../DayView/DayView';
import { EventModal } from '../EventModal';
import { Header, TodayButton } from '../shared';
import { ViewToggle } from '../shared/ViewToggle';
import { useTheme } from '../../theme';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useEvents } from '../../hooks/useEvents';
import { CalendarEvent } from '../../types';

export const CalendarScreen = memo(() => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const calendar = useCalendar();
  const { events, loading, error, addEvent, updateEvent, deleteEvent } = useEvents(user?.uid || null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>();

  const handleDateSelect = useCallback((date: Date) => {
    calendar.selectDate(date);
    calendar.setViewMode('day');
  }, [calendar]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  const handleTimeSlotPress = useCallback((date: Date) => {
    setModalInitialDate(date);
    setSelectedEvent(undefined);
    setModalVisible(true);
  }, []);

  const handleSaveEvent = useCallback(
    (eventData: Omit<CalendarEvent, 'id'>) => {
      if (selectedEvent) {
        updateEvent(selectedEvent.id, eventData);
      } else {
        addEvent(eventData);
      }
      setModalVisible(false);
    },
    [selectedEvent, updateEvent, addEvent]
  );

  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setModalVisible(false);
    }
  }, [selectedEvent, deleteEvent]);

  const handleBackToMonth = useCallback(() => {
    calendar.setViewMode('month');
  }, [calendar]);

  const handleAddEvent = useCallback(() => {
    setSelectedEvent(undefined);
    setModalInitialDate(calendar.selectedDate);
    setModalVisible(true);
  }, [calendar]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleBackPress = useCallback(() => {
    if (calendar.viewMode === 'day') {
      handleBackToMonth();
    }
  }, [calendar.viewMode, handleBackToMonth]);

  // Show loading indicator while initializing
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading events...
        </Text>
      </View>
    );
  }

  // Show error message if initialization failed
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Error loading events
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.colors.text }]}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        showBackButton={calendar.viewMode === 'day'}
        onBackPress={handleBackPress}
      />

      {/* View Toggle and Add Event Button */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <ViewToggle viewMode={calendar.viewMode} onModeChange={calendar.setViewMode} />
        <View style={styles.toolbarRight}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddEvent}>
            <Text style={[styles.addButtonText, { color: theme.colors.primaryText }]}>
              + Add Event
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <EventModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        event={selectedEvent}
        initialDate={modalInitialDate}
      />

      <TodayButton onPress={calendar.goToToday} />
    </View>
  );
});

CalendarScreen.displayName = 'CalendarScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

