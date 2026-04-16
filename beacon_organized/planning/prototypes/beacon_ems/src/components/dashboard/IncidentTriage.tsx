import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { spacing, typography, borderRadius } from '../../theme/tokens';
import { INCIDENT_TYPES, isResponseAdequate, type IncidentTypeDefinition } from '../../data/incidentTypes';

// Light theme colors
const sidebarColors = {
  background: '#f8f9fa',
  backgroundHover: '#f0f1f2',
  card: '#ffffff',
  cardBorder: '#e5e7eb',
  text: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  accent: '#0097b2',
};

const urgencyColors = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

const statusColors = {
  unreviewed: '#ef4444',
  needs_resources: '#f59e0b',
  help_far: '#8b5cf6',
  adequate: '#22c55e',
  resolved: '#6b7280',
};

export interface RespondingUnit {
  id: string;
  name: string;
  type: string;
  status: 'en_route' | 'on_scene' | 'staging';
  eta?: string;
  personnel: number;
}

export interface TriageIncident {
  id: string;
  incidentTypeId: string;
  title: string;
  location: string;
  reportedAt: string;
  timeElapsed: string;
  source: {
    type: 'official' | 'public' | 'beacon_auto';
    name: string;
    shorthand: string;
    color: string;
  };
  status: 'unreviewed' | 'assigned' | 'in_progress' | 'resolved';
  respondingUnits: RespondingUnit[];
  nearestUnitEta?: string;
  notes?: string;
}

interface IncidentTriageProps {
  incidents: TriageIncident[];
  onIncidentPress?: (incident: TriageIncident) => void;
  onAssignUnit?: (incident: TriageIncident) => void;
}

// Calculate triage status for an incident
const getTriageStatus = (incident: TriageIncident): {
  category: 'needs_attention' | 'adequate';
  reason: string;
  priority: number; // Lower = more urgent
  responseStatus: ReturnType<typeof isResponseAdequate>;
} => {
  const incidentType = INCIDENT_TYPES[incident.incidentTypeId];

  // Calculate current resources
  const onSceneUnits = incident.respondingUnits.filter(u => u.status === 'on_scene');
  const totalPersonnel = onSceneUnits.reduce((sum, u) => sum + u.personnel, 0);
  const vehicleCounts: { type: string; count: number }[] = [];

  onSceneUnits.forEach(unit => {
    const existing = vehicleCounts.find(v => v.type === unit.type);
    if (existing) {
      existing.count++;
    } else {
      vehicleCounts.push({ type: unit.type, count: 1 });
    }
  });

  const responseStatus = isResponseAdequate(
    incident.incidentTypeId,
    totalPersonnel,
    vehicleCounts
  );

  // Determine category and priority
  if (incident.status === 'unreviewed') {
    const basePriority = incidentType?.severity === 'critical' ? 0 :
                         incidentType?.severity === 'high' ? 10 :
                         incidentType?.severity === 'medium' ? 20 : 30;
    return {
      category: 'needs_attention',
      reason: 'Unreviewed',
      priority: basePriority,
      responseStatus,
    };
  }

  if (!responseStatus.adequate && incident.status !== 'resolved') {
    // Check if help is far away
    const enRouteUnits = incident.respondingUnits.filter(u => u.status === 'en_route');
    const hasHelpFar = enRouteUnits.some(u => {
      const etaMinutes = u.eta ? parseInt(u.eta) : 0;
      return etaMinutes > (incidentType?.maxResponseTime || 15);
    });

    const basePriority = incidentType?.severity === 'critical' ? 5 :
                         incidentType?.severity === 'high' ? 15 :
                         incidentType?.severity === 'medium' ? 25 : 35;

    if (hasHelpFar && onSceneUnits.length === 0) {
      return {
        category: 'needs_attention',
        reason: 'Help far away',
        priority: basePriority + 2,
        responseStatus,
      };
    }

    return {
      category: 'needs_attention',
      reason: 'Under-resourced',
      priority: basePriority + 5,
      responseStatus,
    };
  }

  return {
    category: 'adequate',
    reason: 'Adequately staffed',
    priority: 100,
    responseStatus,
  };
};

const IncidentCard: React.FC<{
  incident: TriageIncident;
  triageStatus: ReturnType<typeof getTriageStatus>;
  onPress?: () => void;
  onAssign?: () => void;
}> = ({ incident, triageStatus, onPress, onAssign }) => {
  const [expanded, setExpanded] = useState(false);
  const incidentType = INCIDENT_TYPES[incident.incidentTypeId];
  const urgencyColor = urgencyColors[incidentType?.severity || 'medium'];

  const onSceneCount = incident.respondingUnits.filter(u => u.status === 'on_scene').length;
  const enRouteCount = incident.respondingUnits.filter(u => u.status === 'en_route').length;
  const totalPersonnel = incident.respondingUnits
    .filter(u => u.status === 'on_scene')
    .reduce((sum, u) => sum + u.personnel, 0);

  return (
    <View style={[styles.incidentCard, { borderLeftColor: urgencyColor }]}>
      <TouchableOpacity
        style={styles.incidentHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.incidentHeaderLeft}>
          <View style={styles.incidentTitleRow}>
            <Text style={styles.incidentTitle} numberOfLines={1}>{incident.title}</Text>
            {incident.status === 'unreviewed' && (
              <View style={styles.unreviewedBadge}>
                <Text style={styles.unreviewedBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.incidentLocation}>{incident.location}</Text>
          <View style={styles.incidentMeta}>
            <View style={[styles.sourceBadge, { backgroundColor: incident.source.color }]}>
              <Text style={styles.sourceBadgeText}>{incident.source.shorthand}</Text>
            </View>
            <Text style={styles.incidentTime}>{incident.timeElapsed}</Text>
          </View>
        </View>
        <View style={styles.incidentHeaderRight}>
          {triageStatus.category === 'needs_attention' && (
            <View style={[styles.triageReasonBadge, {
              backgroundColor: incident.status === 'unreviewed' ? statusColors.unreviewed + '20' :
                              triageStatus.reason === 'Help far away' ? statusColors.help_far + '20' :
                              statusColors.needs_resources + '20'
            }]}>
              <Text style={[styles.triageReasonText, {
                color: incident.status === 'unreviewed' ? statusColors.unreviewed :
                       triageStatus.reason === 'Help far away' ? statusColors.help_far :
                       statusColors.needs_resources
              }]}>{triageStatus.reason}</Text>
            </View>
          )}
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Response Summary */}
      <View style={styles.responseSummary}>
        <View style={styles.responseStatItem}>
          <Text style={styles.responseStatNumber}>{onSceneCount}</Text>
          <Text style={styles.responseStatLabel}>On Scene</Text>
        </View>
        <View style={styles.responseStatItem}>
          <Text style={styles.responseStatNumber}>{enRouteCount}</Text>
          <Text style={styles.responseStatLabel}>En Route</Text>
        </View>
        <View style={styles.responseStatItem}>
          <Text style={styles.responseStatNumber}>{totalPersonnel}</Text>
          <Text style={styles.responseStatLabel}>Personnel</Text>
        </View>
        {incident.nearestUnitEta && (
          <View style={styles.responseStatItem}>
            <Text style={[styles.responseStatNumber, { color: sidebarColors.accent }]}>
              {incident.nearestUnitEta}
            </Text>
            <Text style={styles.responseStatLabel}>ETA</Text>
          </View>
        )}
      </View>

      {/* Response Adequacy */}
      {!triageStatus.responseStatus.adequate && (
        <View style={styles.missingResources}>
          <Text style={styles.missingResourcesLabel}>Needed:</Text>
          <Text style={styles.missingResourcesText}>
            {triageStatus.responseStatus.missing.join(', ')}
          </Text>
        </View>
      )}

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedDetails}>
          {/* Standard Response Info */}
          {incidentType && (
            <View style={styles.standardResponseSection}>
              <Text style={styles.sectionLabel}>Standard Response for {incidentType.name}</Text>
              <View style={styles.standardResponseGrid}>
                <View style={styles.standardResponseItem}>
                  <Text style={styles.standardResponseValue}>{incidentType.minPersonnel}</Text>
                  <Text style={styles.standardResponseLabel}>Min Personnel</Text>
                </View>
                <View style={styles.standardResponseItem}>
                  <Text style={styles.standardResponseValue}>{incidentType.maxResponseTime}m</Text>
                  <Text style={styles.standardResponseLabel}>Target Time</Text>
                </View>
              </View>
              <View style={styles.requiredVehicles}>
                {incidentType.standardResponse.map((req, idx) => (
                  <View key={idx} style={styles.requiredVehicleItem}>
                    <Text style={styles.requiredVehicleCount}>{req.minCount}x</Text>
                    <Text style={styles.requiredVehicleType}>{req.vehicleType.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Responding Units */}
          {incident.respondingUnits.length > 0 && (
            <View style={styles.unitsSection}>
              <Text style={styles.sectionLabel}>Responding Units</Text>
              {incident.respondingUnits.map((unit) => (
                <View key={unit.id} style={styles.unitRow}>
                  <View style={[styles.unitStatusDot, {
                    backgroundColor: unit.status === 'on_scene' ? '#22c55e' :
                                    unit.status === 'en_route' ? '#f59e0b' : '#6b7280'
                  }]} />
                  <Text style={styles.unitName}>{unit.name}</Text>
                  <Text style={styles.unitType}>{unit.type}</Text>
                  <Text style={styles.unitPersonnel}>{unit.personnel}p</Text>
                  {unit.eta && <Text style={styles.unitEta}>ETA {unit.eta}</Text>}
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            {triageStatus.category === 'needs_attention' && (
              <TouchableOpacity style={styles.assignButton} onPress={onAssign}>
                <Text style={styles.assignButtonText}>Assign Unit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export const IncidentTriage: React.FC<IncidentTriageProps> = ({
  incidents,
  onIncidentPress,
  onAssignUnit,
}) => {
  // Calculate triage status for all incidents and sort
  const triageData = incidents.map(incident => ({
    incident,
    triageStatus: getTriageStatus(incident),
  }));

  // Split into categories
  const needsAttention = triageData
    .filter(d => d.triageStatus.category === 'needs_attention')
    .sort((a, b) => a.triageStatus.priority - b.triageStatus.priority);

  const adequate = triageData
    .filter(d => d.triageStatus.category === 'adequate')
    .sort((a, b) => a.triageStatus.priority - b.triageStatus.priority);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Needs Attention Section */}
      {needsAttention.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionDot, { backgroundColor: statusColors.unreviewed }]} />
              <Text style={styles.sectionTitle}>Needs Attention</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{needsAttention.length}</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            {needsAttention.map(({ incident, triageStatus }) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                triageStatus={triageStatus}
                onPress={() => onIncidentPress?.(incident)}
                onAssign={() => onAssignUnit?.(incident)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Adequately Staffed Section */}
      {adequate.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionDot, { backgroundColor: statusColors.adequate }]} />
              <Text style={styles.sectionTitle}>Adequately Staffed</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: statusColors.adequate }]}>
              <Text style={styles.sectionBadgeText}>{adequate.length}</Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            {adequate.map(({ incident, triageStatus }) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                triageStatus={triageStatus}
                onPress={() => onIncidentPress?.(incident)}
                onAssign={() => onAssignUnit?.(incident)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {incidents.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active incidents</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Sections
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: sidebarColors.backgroundHover,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: sidebarColors.text,
  },
  sectionBadge: {
    backgroundColor: statusColors.unreviewed,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionContent: {
    padding: spacing.sm,
    gap: spacing.sm,
  },

  // Incident Card
  incidentCard: {
    backgroundColor: sidebarColors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: sidebarColors.cardBorder,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  incidentHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  incidentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: sidebarColors.text,
    flex: 1,
  },
  unreviewedBadge: {
    backgroundColor: statusColors.unreviewed,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unreviewedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  incidentLocation: {
    fontSize: 11,
    color: sidebarColors.textMuted,
  },
  incidentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  incidentTime: {
    fontSize: 10,
    color: sidebarColors.textMuted,
  },
  incidentHeaderRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  triageReasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  triageReasonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 10,
    color: sidebarColors.textMuted,
  },

  // Response Summary
  responseSummary: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.backgroundHover,
  },
  responseStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  responseStatNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: sidebarColors.text,
  },
  responseStatLabel: {
    fontSize: 9,
    color: sidebarColors.textMuted,
  },

  // Missing Resources
  missingResources: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: statusColors.needs_resources + '10',
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
  },
  missingResourcesLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: statusColors.needs_resources,
  },
  missingResourcesText: {
    fontSize: 10,
    color: sidebarColors.textSecondary,
    flex: 1,
  },

  // Expanded Details
  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  standardResponseSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: sidebarColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  standardResponseGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  standardResponseItem: {
    alignItems: 'center',
  },
  standardResponseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: sidebarColors.accent,
  },
  standardResponseLabel: {
    fontSize: 9,
    color: sidebarColors.textMuted,
  },
  requiredVehicles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  requiredVehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: sidebarColors.backgroundHover,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredVehicleCount: {
    fontSize: 10,
    fontWeight: '700',
    color: sidebarColors.accent,
  },
  requiredVehicleType: {
    fontSize: 10,
    color: sidebarColors.textSecondary,
    textTransform: 'capitalize',
  },

  // Units Section
  unitsSection: {
    gap: spacing.xs,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  unitStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unitName: {
    fontSize: 11,
    fontWeight: '600',
    color: sidebarColors.text,
    flex: 1,
  },
  unitType: {
    fontSize: 10,
    color: sidebarColors.textMuted,
  },
  unitPersonnel: {
    fontSize: 10,
    fontWeight: '600',
    color: sidebarColors.textSecondary,
  },
  unitEta: {
    fontSize: 10,
    color: sidebarColors.accent,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: sidebarColors.backgroundHover,
    borderWidth: 1,
    borderColor: sidebarColors.cardBorder,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: sidebarColors.textSecondary,
  },
  assignButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: sidebarColors.accent,
    alignItems: 'center',
  },
  assignButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Empty State
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: sidebarColors.textMuted,
  },
});

export default IncidentTriage;
