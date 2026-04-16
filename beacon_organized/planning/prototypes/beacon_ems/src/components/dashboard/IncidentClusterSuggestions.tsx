import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import type { IncidentItem } from './IncidentStream';

export interface IncidentCluster {
  id: string;
  suggestedTitle: string;
  location: string;
  radius: string; // e.g., "0.2 miles"
  incidents: IncidentItem[];
  confidence: 'high' | 'medium' | 'low';
  clusterType: 'duplicate' | 'event'; // 'duplicate' = same location, 'event' = related across area
  suggestedEventType?: string;
  reportCount: number;
  firstReported: string;
  mostRecentReport: string;
}

// Light theme colors for right sidebar
const lightTheme = {
  background: '#ffffff',
  backgroundSecondary: '#f8f9fa',
  border: '#e5e7eb',
  borderWarning: '#f59e0b',
  text: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
};

interface IncidentClusterSuggestionsProps {
  clusters: IncidentCluster[];
  onCreateEvent: (cluster: IncidentCluster) => void;
  onMergeIncidents: (cluster: IncidentCluster) => void;
  onDismiss: (clusterId: string) => void;
  variant?: 'dark' | 'light';
}

const ClusterCard: React.FC<{
  cluster: IncidentCluster;
  onAction: () => void;
  onDismiss: () => void;
}> = ({ cluster, onAction, onDismiss }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get unique sources from incidents
  const uniqueSources = [...new Set(cluster.incidents.map(i => i.source.groupShorthand))];

  const isDuplicate = cluster.clusterType === 'duplicate';
  const actionLabel = isDuplicate ? 'Merge Incidents' : 'Create Event';

  return (
    <View style={styles.clusterCard}>
      {/* Top Row: Title and time range */}
      <View style={styles.clusterTopRow}>
        <Text style={styles.clusterTitle} numberOfLines={1}>{cluster.suggestedTitle}</Text>
        <Text style={styles.clusterTime}>{cluster.firstReported} - {cluster.mostRecentReport}</Text>
      </View>

      {/* Bottom Row: Location and source tags */}
      <View style={styles.clusterBottomRow}>
        <Text style={styles.clusterLocation} numberOfLines={1}>
          {cluster.location} {!isDuplicate && `(${cluster.radius})`}
        </Text>
        <View style={styles.sourceTagsList}>
          {uniqueSources.map((source, index) => {
            const incident = cluster.incidents.find(i => i.source.groupShorthand === source);
            return (
              <View
                key={index}
                style={[styles.sourceTag, { backgroundColor: incident?.source.groupColor || colors.text.muted }]}
              >
                <Text style={styles.sourceTagText}>{source}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Reports Dropdown */}
      <TouchableOpacity
        style={styles.reportsDropdown}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.reportsDropdownLabel}>
          Reports ({cluster.reportCount})
        </Text>
        <Text style={styles.reportsDropdownArrow}>
          {dropdownOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.incidentList}>
          {cluster.incidents.map((incident) => (
            <View key={incident.id} style={styles.incidentListItem}>
              <View style={[styles.incidentSourceDot, { backgroundColor: incident.source.groupColor }]} />
              <Text style={styles.incidentListSource}>{incident.source.groupShorthand}</Text>
              <Text style={styles.incidentListTitle} numberOfLines={1}>{incident.title}</Text>
              <Text style={styles.incidentListTime}>{incident.timestamp}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.keepSeparateButton} onPress={onDismiss}>
          <Text style={styles.keepSeparateButtonText}>Keep Separate</Text>
        </TouchableOpacity>
        {isDuplicate ? (
          <TouchableOpacity onPress={onAction} style={styles.actionButtonWrapper}>
            <LinearGradient
              colors={['#0097b2', '#007a94']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>{actionLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButtonEvent} onPress={onAction}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const IncidentClusterSuggestions: React.FC<IncidentClusterSuggestionsProps> = ({
  clusters,
  onCreateEvent,
  onMergeIncidents,
  onDismiss,
  variant = 'dark',
}) => {
  if (clusters.length === 0) {
    return null;
  }

  const isLight = variant === 'light';
  const duplicateClusters = clusters.filter(c => c.clusterType === 'duplicate');
  const eventClusters = clusters.filter(c => c.clusterType === 'event');

  return (
    <View style={[
      styles.container,
      isLight && {
        backgroundColor: lightTheme.background,
        borderColor: lightTheme.borderWarning,
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[
            styles.headerTitle,
            isLight && { color: lightTheme.text }
          ]}>Suggested Groupings</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{clusters.length}</Text>
        </View>
      </View>

      <Text style={[
        styles.headerSubtitle,
        isLight && { color: lightTheme.textMuted }
      ]}>
        Review and merge duplicate reports or create events from related incidents
      </Text>

      <ScrollView style={styles.clusterList} showsVerticalScrollIndicator={false}>
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            onAction={() =>
              cluster.clusterType === 'duplicate'
                ? onMergeIncidents(cluster)
                : onCreateEvent(cluster)
            }
            onDismiss={() => onDismiss(cluster.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  headerBadge: {
    backgroundColor: colors.status.warning,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  headerBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  clusterList: {
    maxHeight: 400,
  },

  // Cluster Card
  clusterCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  clusterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  clusterTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  clusterTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  clusterBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  clusterLocation: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  sourceTagsList: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sourceTag: {
    paddingVertical: 1,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },

  // Reports Dropdown
  reportsDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  reportsDropdownLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  reportsDropdownArrow: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Incident List (dropdown content)
  incidentList: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -spacing.sm,
  },
  incidentListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  incidentSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  incidentListSource: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    width: 36,
  },
  incidentListTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  incidentListTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  keepSeparateButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  keepSeparateButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  actionButtonWrapper: {
    flex: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  actionButtonEvent: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.beacon.primary,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});

export default IncidentClusterSuggestions;
