import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface AlertItem {
  id: string;
  source: 'nws' | 'beacon' | 'system';
  type: 'warning' | 'watch' | 'advisory' | 'alert';
  title: string;
  description: string;
  expires?: string;
  timestamp: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
}

interface AlertStreamProps {
  alerts: AlertItem[];
  onAlertPress?: (alert: AlertItem) => void;
  maxItems?: number;
}

const getSourceLabel = (source: AlertItem['source']) => {
  switch (source) {
    case 'nws': return 'NWS';
    case 'beacon': return 'BEACON';
    case 'system': return 'SYSTEM';
    default: return '';
  }
};

const getSeverityColor = (severity: AlertItem['severity']) => {
  switch (severity) {
    case 'extreme': return colors.status.critical;
    case 'severe': return colors.status.severe;
    case 'moderate': return colors.status.moderate;
    case 'minor': return colors.status.minor;
  }
};

export const AlertStream: React.FC<AlertStreamProps> = ({
  alerts,
  onAlertPress,
  maxItems = 10,
}) => {
  const displayAlerts = alerts.slice(0, maxItems);

  if (displayAlerts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No active alerts</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {displayAlerts.map((alert) => (
        <TouchableOpacity
          key={alert.id}
          style={styles.alertItem}
          onPress={() => onAlertPress?.(alert)}
          activeOpacity={0.7}
        >
          <View style={styles.alertHeader}>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceLabel}>{getSourceLabel(alert.source)}</Text>
            </View>
            <Text style={[styles.typeTag, { backgroundColor: getSeverityColor(alert.severity) }]}>
              {alert.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.alertTitle} numberOfLines={2}>{alert.title}</Text>
          {alert.expires && (
            <Text style={styles.expiresText}>Expires: {alert.expires}</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
  alertItem: {
    backgroundColor: colors.background.cardElevated,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  typeTag: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  alertTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  expiresText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});

export default AlertStream;
