import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface ActiveEvent {
  id: string;
  title: string;
  severity: 'critical' | 'severe' | 'moderate' | 'minor';
  location: string;
  timeAgo: string;
}

interface ActiveEventsCardProps {
  totalCount: number;
  criticalCount: number;
  mostCriticalEvent?: ActiveEvent;
  onViewAll: () => void;
  onEventPress?: (event: ActiveEvent) => void;
}

const getSeverityColor = (severity: ActiveEvent['severity']) => {
  switch (severity) {
    case 'critical':
      return colors.status.critical;
    case 'severe':
      return colors.status.severe;
    case 'moderate':
      return colors.status.moderate;
    case 'minor':
      return colors.status.minor;
  }
};

const getSeverityLabel = (severity: ActiveEvent['severity']) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

export const ActiveEventsCard: React.FC<ActiveEventsCardProps> = ({
  totalCount,
  criticalCount,
  mostCriticalEvent,
  onViewAll,
  onEventPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Events</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, criticalCount > 0 && styles.criticalValue]}>
            {criticalCount}
          </Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>

      {mostCriticalEvent && (
        <TouchableOpacity
          style={styles.eventCard}
          onPress={() => onEventPress?.(mostCriticalEvent)}
          activeOpacity={0.7}
        >
          <View style={styles.eventHeader}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(mostCriticalEvent.severity) },
              ]}
            >
              <Text style={styles.severityText}>
                {getSeverityLabel(mostCriticalEvent.severity)}
              </Text>
            </View>
            <Text style={styles.eventTime}>{mostCriticalEvent.timeAgo}</Text>
          </View>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {mostCriticalEvent.title}
          </Text>
          <Text style={styles.eventLocation} numberOfLines={1}>
            {mostCriticalEvent.location}
          </Text>
        </TouchableOpacity>
      )}

      {!mostCriticalEvent && totalCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active events</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  viewAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  criticalValue: {
    color: colors.status.critical,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  eventCard: {
    backgroundColor: colors.background.cardElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.critical,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  severityBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  eventTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
});

export default ActiveEventsCard;
