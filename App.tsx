/**
 * Calendar App
 * Custom Google Calendar-style app with Month and Day views
 *
 * @format
 */

import React, { useState, useCallback, memo } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MonthView } from './src/components/MonthView';
import { DayView } from './src/components/DayView/DayView';
import { EventModal } from './src/components/EventModal';
import { TopBar, TodayButton, ErrorBoundary } from './src/components/shared';
import { ThemeProvider, useTheme } from './src/theme';
import { useCalendar } from './src/hooks/useCalendar';
import { useEvents } from './src/hooks/useEvents';
import { CalendarEvent } from './src/types';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const AppContent = memo(() => {
  const theme = useTheme();
  const calendar = useCalendar();
  const { events, loading, error, addEvent, updateEvent, deleteEvent } = useEvents();

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
      <TopBar
        viewMode={calendar.viewMode}
        onViewModeChange={calendar.setViewMode}
        onAddEvent={handleAddEvent}
      />

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

AppContent.displayName = 'AppContent';

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
});

export default App;
