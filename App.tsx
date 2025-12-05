/**
 * Calendar App
 * Custom Google Calendar-style app with Month and Day views
 *
 * @format
 */

import React, { useState, useCallback, memo } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
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
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

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
});

export default App;
