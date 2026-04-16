import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

// Mock calendar events
const mockEvents = [
  {
    id: '1',
    title: 'Shift Change Briefing',
    time: '07:00 AM',
    duration: '30 min',
    type: 'meeting',
    location: 'Station 7 - Conference Room',
  },
  {
    id: '2',
    title: 'Equipment Maintenance Check',
    time: '09:00 AM',
    duration: '2 hrs',
    type: 'task',
    location: 'Vehicle Bay',
  },
  {
    id: '3',
    title: 'Multi-Agency Coordination Call',
    time: '11:00 AM',
    duration: '1 hr',
    type: 'meeting',
    location: 'Virtual - Zoom',
  },
  {
    id: '4',
    title: 'Training: Cold Weather Response',
    time: '02:00 PM',
    duration: '3 hrs',
    type: 'training',
    location: 'Training Center',
  },
  {
    id: '5',
    title: 'Resource Inventory Review',
    time: '05:00 PM',
    duration: '1 hr',
    type: 'task',
    location: 'Station 7',
  },
];

const upcomingShifts = [
  { id: '1', date: 'Tomorrow', shift: 'Day Shift', time: '07:00 AM - 07:00 PM', team: 'Alpha Team' },
  { id: '2', date: 'Dec 26', shift: 'Night Shift', time: '07:00 PM - 07:00 AM', team: 'Alpha Team' },
  { id: '3', date: 'Dec 28', shift: 'Day Shift', time: '07:00 AM - 07:00 PM', team: 'Alpha Team' },
  { id: '4', date: 'Dec 30', shift: 'Day Shift', time: '07:00 AM - 07:00 PM', team: 'Alpha Team' },
];

const eventTypeColors: Record<string, string> = {
  meeting: '#3b82f6',
  task: '#22c55e',
  training: '#f59e0b',
  emergency: '#ef4444',
};

export const CalendarScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  // Generate calendar days for the current week
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.viewToggle}>
            {(['day', 'week', 'month'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.viewToggleButton, viewMode === mode && styles.viewToggleButtonActive]}
                onPress={() => setViewMode(mode)}
              >
                <Text style={[styles.viewToggleText, viewMode === mode && styles.viewToggleTextActive]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Month/Year Display */}
        <View style={styles.monthDisplay}>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Week View */}
        <View style={styles.weekContainer}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isToday(day) && styles.dayCellToday,
                isSelected(day) && styles.dayCellSelected,
              ]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayName, isSelected(day) && styles.dayNameSelected]}>
                {dayNames[index]}
              </Text>
              <Text style={[
                styles.dayNumber,
                isToday(day) && styles.dayNumberToday,
                isSelected(day) && styles.dayNumberSelected,
              ]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.eventsList}>
            {mockEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={[styles.eventIndicator, { backgroundColor: eventTypeColors[event.type] }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventDuration}>{event.duration}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Shifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Shifts</Text>
          <View style={styles.shiftsList}>
            {upcomingShifts.map((shift) => (
              <View key={shift.id} style={styles.shiftCard}>
                <View style={styles.shiftDate}>
                  <Text style={styles.shiftDateText}>{shift.date}</Text>
                </View>
                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftName}>{shift.shift}</Text>
                  <Text style={styles.shiftTime}>{shift.time}</Text>
                  <Text style={styles.shiftTeam}>{shift.team}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Event Types</Text>
          <View style={styles.legendItems}>
            {Object.entries(eventTypeColors).map(([type, color]) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  viewToggleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  viewToggleButtonActive: {
    backgroundColor: colors.beacon.primary,
  },
  viewToggleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  viewToggleTextActive: {
    color: colors.white,
  },
  monthDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  monthText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.beacon.primary,
  },
  dayCellSelected: {
    backgroundColor: colors.beacon.primary,
  },
  dayName: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dayNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  dayNumberToday: {
    color: colors.beacon.primary,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  eventsList: {
    gap: spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  eventIndicator: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  eventTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  eventTime: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  eventDuration: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  eventLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  shiftsList: {
    gap: spacing.sm,
  },
  shiftCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  shiftDate: {
    width: 80,
    backgroundColor: colors.beacon.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  shiftDateText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },
  shiftInfo: {
    flex: 1,
    padding: spacing.md,
  },
  shiftName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  shiftTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  shiftTeam: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  legend: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  legendTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});

export default CalendarScreen;
