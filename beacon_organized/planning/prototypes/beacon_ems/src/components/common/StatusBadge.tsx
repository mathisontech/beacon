import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type StatusType = 'active' | 'inactive' | 'warning' | 'critical' | 'resolved';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  style?: ViewStyle;
}

const statusColors: Record<StatusType, { bg: string; text: string }> = {
  active: { bg: '#28a745', text: '#ffffff' },
  inactive: { bg: '#6c757d', text: '#ffffff' },
  warning: { bg: '#ffc107', text: '#000000' },
  critical: { bg: '#dc3545', text: '#ffffff' },
  resolved: { bg: '#17a2b8', text: '#ffffff' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  style,
}) => {
  const colors = statusColors[status];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{displayLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default StatusBadge;
