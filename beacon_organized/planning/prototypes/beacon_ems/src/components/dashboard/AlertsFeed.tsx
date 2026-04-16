import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, touchTargets } from '../../theme/tokens';

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source: string;
  isRead: boolean;
}

interface AlertsFeedProps {
  alerts: Alert[];
  onViewAll: () => void;
  onAlertPress?: (alert: Alert) => void;
  onDismiss?: (alertId: string) => void;
}

const getAlertColor = (type: Alert['type']) => {
  switch (type) {
    case 'critical':
      return colors.status.critical;
    case 'warning':
      return colors.status.severe;
    case 'info':
      return colors.status.moderate;
    case 'success':
      return colors.status.minor;
  }
};

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'critical':
      return '!';
    case 'warning':
      return '!';
    case 'info':
      return 'i';
    case 'success':
      return '✓';
  }
};

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  onViewAll,
  onAlertPress,
  onDismiss,
}) => {
  const displayAlerts = alerts.slice(0, 5);

  const renderAlert = ({ item }: { item: Alert }) => (
    <TouchableOpacity
      style={[styles.alertItem, !item.isRead && styles.alertUnread]}
      onPress={() => onAlertPress?.(item)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.alertIcon, { backgroundColor: getAlertColor(item.type) }]}
      >
        <Text style={styles.alertIconText}>{getAlertIcon(item.type)}</Text>
      </View>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.alertTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.alertMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.alertSource}>{item.source}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Alerts</Text>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {displayAlerts.length > 0 ? (
        <View style={styles.alertsList}>
          {displayAlerts.map((alert) => (
            <React.Fragment key={alert.id}>
              {renderAlert({ item: alert })}
            </React.Fragment>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recent alerts</Text>
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
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.cardElevated,
    borderRadius: borderRadius.md,
    minHeight: touchTargets.minimum,
  },
  alertUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.beacon.primary,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertIconText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  alertTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  alertMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
    marginBottom: spacing.xs,
  },
  alertSource: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
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

export default AlertsFeed;
