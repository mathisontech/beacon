import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, touchTargets } from '../../theme/tokens';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsPanelProps {
  onDeclareEvent: () => void;
  onViewMap: () => void;
  onCheckStatuses: () => void;
  onMoreActions?: () => void;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onDeclareEvent,
  onViewMap,
  onCheckStatuses,
  onMoreActions,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'declare',
      label: 'Declare\nEvent',
      icon: '!',
      color: colors.status.critical,
      onPress: onDeclareEvent,
    },
    {
      id: 'map',
      label: 'View\nMap',
      icon: 'M',
      color: colors.beacon.primary,
      onPress: onViewMap,
    },
    {
      id: 'status',
      label: 'Check\nStatuses',
      icon: 'S',
      color: colors.status.moderate,
      onPress: onCheckStatuses,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { borderColor: action.color }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Text style={styles.iconText}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: touchTargets.large + 40,
  },
  iconContainer: {
    width: touchTargets.large,
    height: touchTargets.large,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.4,
  },
});

export default QuickActionsPanel;
