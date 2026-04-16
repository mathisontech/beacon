import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface ResourceCategory {
  id: string;
  name: string;
  icon: string;
  available: number;
  total: number;
  deployed: number;
}

interface ResourceSummaryProps {
  categories: ResourceCategory[];
  onCategoryPress?: (category: ResourceCategory) => void;
  onViewAll?: () => void;
}

const getAvailabilityColor = (available: number, total: number) => {
  const ratio = available / total;
  if (ratio > 0.5) return colors.status.minor;
  if (ratio > 0.25) return colors.status.severe;
  return colors.status.critical;
};

export const ResourceSummary: React.FC<ResourceSummaryProps> = ({
  categories,
  onCategoryPress,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryRow}
          onPress={() => onCategoryPress?.(category)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
          <View style={styles.categoryStats}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: getAvailabilityColor(category.available, category.total) }
              ]}>
                {category.available}
              </Text>
              <Text style={styles.statLabel}>avail</Text>
            </View>
            <Text style={styles.statDivider}>/</Text>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{category.total}</Text>
              <Text style={styles.statLabel}>total</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(category.available / category.total) * 100}%`,
                  backgroundColor: getAvailabilityColor(category.available, category.total),
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      ))}

      {onViewAll && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All Resources →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryRow: {
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  statDivider: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
    marginHorizontal: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  viewAllButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
});

export default ResourceSummary;
