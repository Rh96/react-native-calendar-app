import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { MonthView } from '../MonthView';
import { DayView } from '../DayView/DayView';
import { EventModal, EventModalTarget } from '../EventModal';
import { Header, TodayButton } from '../shared';
import { ViewToggle } from '../shared/ViewToggle';
import { useTheme } from '../../theme';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCalendar } from '../../hooks/useCalendar';
import { useEvents } from '../../hooks/useEvents';
import { CalendarEvent } from '../../types';
import { nextFullHourOn } from '../../utils/dateHelpers';

interface ModalState {
  visible: boolean;
  // Kept after closing so the modal's content doesn't change during its exit animation.
  target: EventModalTarget;
}

export const CalendarScreen = memo(() => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const calendar = useCalendar();
  const { events, loading, error, retry, addEvent, updateEvent, deleteEvent } = useEvents(user?.uid || null);

  const [modal, setModal] = useState<ModalState>(() => ({
    visible: false,
    target: { mode: 'create', start: new Date() },
  }));

  const handleDateSelect = useCallback((date: Date) => {
    calendar.selectDate(date);
    calendar.setViewMode('day');
  }, [calendar]);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    setModal({ visible: true, target: { mode: 'edit', event } });
  }, []);

  const handleTimeSlotPress = useCallback((date: Date) => {
    setModal({ visible: true, target: { mode: 'create', start: date } });
  }, []);

  // The modal closes straight away instead of waiting for the server: offline,
  // Firestore only confirms a write after reconnecting. The listener shows the
  // change immediately, and if the server rejects it Firestore rolls it back
  // and we tell the user here (ADR-004). The modal closes itself after onSave.
  const handleSaveEvent = useCallback(
    (eventData: Omit<CalendarEvent, 'id'>) => {
      const { target } = modal;
      const write = target.mode === 'edit'
        ? updateEvent(target.event.id, eventData)
        : addEvent(eventData);
      write.catch(() => {
        Alert.alert(
          "Couldn't save event",
          `"${eventData.title}" wasn't saved. Please try again.`
        );
      });
    },
    [modal, updateEvent, addEvent]
  );

  const handleDeleteEvent = useCallback(() => {
    const { target } = modal;
    if (target.mode === 'edit') {
      const { id, title } = target.event;
      deleteEvent(id).catch(() => {
        Alert.alert(
          "Couldn't delete event",
          `"${title}" wasn't deleted. Please try again.`
        );
      });
    }
  }, [modal, deleteEvent]);

  const handleBackToMonth = useCallback(() => {
    calendar.setViewMode('month');
  }, [calendar]);

  const handleAddEvent = useCallback(() => {
    setModal({
      visible: true,
      target: { mode: 'create', start: nextFullHourOn(calendar.selectedDate) },
    });
  }, [calendar.selectedDate]);

  const handleCloseModal = useCallback(() => {
    setModal((current) => ({ ...current, visible: false }));
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
          Check your connection and try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={retry}
          accessibilityRole="button">
          <Text style={[styles.addButtonText, { color: theme.colors.primaryText }]}>
            Retry
          </Text>
        </TouchableOpacity>
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
        />
      )}

      <EventModal
        visible={modal.visible}
        target={modal.target}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={modal.target.mode === 'edit' ? handleDeleteEvent : undefined}
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

