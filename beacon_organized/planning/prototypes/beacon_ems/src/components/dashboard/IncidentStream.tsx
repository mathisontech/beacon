import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface RespondingUnit {
  id: string;
  name: string;
  status: 'en_route' | 'on_scene' | 'staging' | 'returning';
  eta?: string;
  isBackup?: boolean;
  agency?: string;
  isMyTeam?: boolean;
}

export interface ResourceRequest {
  type: string;
  status: 'requested' | 'dispatched' | 'fulfilled';
  requestedAt?: string;
}

export interface IncidentSource {
  type: 'official' | 'public' | 'beacon_auto';
  groupShorthand: string; // e.g., "BPD", "BFD", "CERT", "BCN"
  groupColor: string; // Hex color set by group admin
  groupName?: string; // Full name e.g., "Buffalo Police Department"
  role?: string; // e.g., "Dispatch", "Watch", "Admin"
}

export interface IncidentItem {
  id: string;
  incidentType: 'fire' | 'medical' | 'accident' | 'hazmat' | 'rescue' | 'utility' | 'weather' | 'other';
  title: string;
  location: string;
  timestamp: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  assignmentStatus: 'unassigned' | 'assigned' | 'in_progress' | 'resolved';
  queuePosition?: number;
  queuedForUnit?: string;
  respondingUnits: RespondingUnit[];
  resourceRequests: ResourceRequest[];
  source: IncidentSource;
  unreadMessageCount?: number;
}

interface IncidentStreamProps {
  incidents: IncidentItem[];
  onIncidentPress?: (incident: IncidentItem) => void;
  onAssignPress?: (incident: IncidentItem) => void;
  maxItems?: number;
  compact?: boolean;
}

const getUrgencyColor = (urgency: IncidentItem['urgency']) => {
  switch (urgency) {
    case 'critical': return colors.status.critical;
    case 'high': return colors.status.severe;
    case 'medium': return colors.status.moderate;
    case 'low': return colors.status.minor;
  }
};

const getIncidentTypeLabel = (type: IncidentItem['incidentType']) => {
  switch (type) {
    case 'fire': return 'FIRE';
    case 'medical': return 'MEDICAL';
    case 'accident': return 'MVA';
    case 'hazmat': return 'HAZMAT';
    case 'rescue': return 'RESCUE';
    case 'utility': return 'UTILITY';
    case 'weather': return 'WEATHER';
    case 'other': return 'OTHER';
  }
};

const getIncidentTypeColor = (type: IncidentItem['incidentType']) => {
  switch (type) {
    case 'fire': return '#dc2626';
    case 'medical': return '#059669';
    case 'accident': return '#d97706';
    case 'hazmat': return '#7c3aed';
    case 'rescue': return '#2563eb';
    case 'utility': return '#ca8a04';
    case 'weather': return '#0891b2';
    case 'other': return '#6b7280';
  }
};

const getSourceLabel = (source: IncidentSource) => {
  if (source.role) {
    return `${source.groupShorthand} - ${source.role}`;
  }
  return source.groupShorthand;
};

const getAssignmentStatusText = (incident: IncidentItem) => {
  if (incident.assignmentStatus === 'unassigned') {
    return 'UNASSIGNED';
  }
  if (incident.queuePosition && incident.queuedForUnit) {
    return `Queue #${incident.queuePosition} for ${incident.queuedForUnit}`;
  }
  if (incident.respondingUnits.length > 0) {
    const onScene = incident.respondingUnits.filter(u => u.status === 'on_scene');
    const enRoute = incident.respondingUnits.filter(u => u.status === 'en_route');
    if (onScene.length > 0) {
      return `${onScene[0].name} On Scene`;
    }
    if (enRoute.length > 0) {
      return `${enRoute[0].name} En Route${enRoute[0].eta ? ` (${enRoute[0].eta})` : ''}`;
    }
  }
  return 'Assigned';
};

const getAssignmentStatusColor = (incident: IncidentItem) => {
  if (incident.assignmentStatus === 'unassigned') {
    return colors.status.critical;
  }
  if (incident.queuePosition) {
    return colors.status.moderate;
  }
  const onScene = incident.respondingUnits.filter(u => u.status === 'on_scene');
  if (onScene.length > 0) {
    return colors.status.minor;
  }
  return colors.status.severe;
};

interface CollapsibleIncidentProps {
  incident: IncidentItem;
  onIncidentPress?: (incident: IncidentItem) => void;
  onAssignPress?: (incident: IncidentItem) => void;
}

const CollapsibleIncident: React.FC<CollapsibleIncidentProps> = ({
  incident,
  onIncidentPress,
  onAssignPress,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const myTeamUnits = incident.respondingUnits.filter(u => u.isMyTeam);
  const otherUnits = incident.respondingUnits.filter(u => !u.isMyTeam);
  const pendingRequests = incident.resourceRequests.filter(r => r.status === 'requested');
  const totalUnits = incident.respondingUnits.length;

  return (
    <View style={styles.incidentCard}>
      {/* Main content - clickable to navigate to incident page */}
      <TouchableOpacity
        style={styles.collapsedContent}
        onPress={() => onIncidentPress?.(incident)}
        activeOpacity={0.7}
      >
        {/* Top Row: Source, Title, Timestamp */}
        <View style={styles.topRow}>
          <View style={[styles.sourceDot, { backgroundColor: incident.source.groupColor }]} />
          <Text style={styles.sourceText}>{incident.source.groupShorthand}</Text>
          <Text style={styles.title} numberOfLines={1}>{incident.title}</Text>
          <Text style={styles.timestamp}>{incident.timestamp}</Text>
        </View>

        {/* Bottom Row: Status badges and location */}
        <View style={styles.bottomRow}>
          <View style={[styles.statusBadge, { backgroundColor: getAssignmentStatusColor(incident) }]}>
            <Text style={styles.statusBadgeText}>{getAssignmentStatusText(incident)}</Text>
          </View>
          {incident.assignmentStatus === 'unassigned' && onAssignPress && (
            <TouchableOpacity
              style={styles.assignButton}
              onPress={(e) => {
                e.stopPropagation();
                onAssignPress(incident);
              }}
            >
              <Text style={styles.assignButtonText}>Assign</Text>
            </TouchableOpacity>
          )}
          {pendingRequests.length > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>
                {pendingRequests.length} Request{pendingRequests.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          <Text style={styles.location} numberOfLines={1}>{incident.location}</Text>
        </View>
      </TouchableOpacity>

      {/* Details Dropdown */}
      {(totalUnits > 0 || pendingRequests.length > 0) && (
        <>
          <TouchableOpacity
            style={styles.detailsDropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.detailsDropdownLabel}>
              Details ({totalUnits} unit{totalUnits !== 1 ? 's' : ''}{pendingRequests.length > 0 ? `, ${pendingRequests.length} request${pendingRequests.length !== 1 ? 's' : ''}` : ''})
            </Text>
            <Text style={styles.detailsDropdownArrow}>
              {dropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.expandedContent}>
              {/* My Team Units */}
              {myTeamUnits.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>My Team ({myTeamUnits.length})</Text>
                  <View style={styles.unitsList}>
                    {myTeamUnits.map((unit) => (
                      <View key={unit.id} style={styles.unitChip}>
                        <View style={[
                          styles.unitStatusDot,
                          { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }
                        ]} />
                        <Text style={styles.unitName}>{unit.name}</Text>
                        <Text style={styles.unitStatusText}>
                          {unit.status === 'en_route' ? `En Route${unit.eta ? ` (${unit.eta})` : ''}` :
                           unit.status === 'on_scene' ? 'On Scene' :
                           unit.status === 'staging' ? 'Staging' : 'Returning'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Other Units */}
              {otherUnits.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Partner Units ({otherUnits.length})</Text>
                  <View style={styles.unitsList}>
                    {otherUnits.map((unit) => (
                      <View key={unit.id} style={[styles.unitChip, styles.partnerUnitChip]}>
                        <View style={[
                          styles.unitStatusDot,
                          { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }
                        ]} />
                        <Text style={styles.unitName}>{unit.name}</Text>
                        {unit.agency && (
                          <Text style={styles.unitAgency}>({unit.agency})</Text>
                        )}
                        <Text style={styles.unitStatusText}>
                          {unit.status === 'en_route' ? `${unit.eta || 'En Route'}` :
                           unit.status === 'on_scene' ? 'On Scene' :
                           unit.status === 'staging' ? 'Staging' : 'Returning'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Resource Requests */}
              {pendingRequests.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, styles.alertLabel]}>Pending Requests ({pendingRequests.length})</Text>
                  <View style={styles.requestsList}>
                    {pendingRequests.map((request, index) => (
                      <View key={index} style={styles.requestChip}>
                        <Text style={styles.requestText}>{request.type}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

export const IncidentStream: React.FC<IncidentStreamProps> = ({
  incidents,
  onIncidentPress,
  onAssignPress,
  maxItems = 10,
  compact = false,
}) => {
  const displayIncidents = incidents.slice(0, maxItems);

  if (displayIncidents.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No active incidents</Text>
      </View>
    );
  }

  // Compact view for widgets
  if (compact) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {displayIncidents.map((incident) => (
          <TouchableOpacity
            key={incident.id}
            style={styles.compactItem}
            onPress={() => onIncidentPress?.(incident)}
            activeOpacity={0.7}
          >
            <View style={[styles.compactSourceDot, { backgroundColor: incident.source.groupColor }]} />
            <Text style={styles.compactSource}>{incident.source.groupShorthand}</Text>
            <Text style={styles.compactTitle} numberOfLines={1}>{incident.title}</Text>
            <Text style={styles.compactTime}>{incident.timestamp}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // Full collapsible view
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {displayIncidents.map((incident) => (
        <CollapsibleIncident
          key={incident.id}
          incident={incident}
          onIncidentPress={onIncidentPress}
          onAssignPress={onAssignPress}
        />
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
  emptyStateText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },

  // Collapsible Incident Card
  incidentCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  collapsedContent: {
    padding: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    width: 36,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  assignButton: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.beacon.primary,
    borderRadius: borderRadius.sm,
  },
  assignButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  pendingBadge: {
    backgroundColor: colors.status.criticalLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  pendingBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.status.critical,
  },

  // Details Dropdown
  detailsDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  detailsDropdownLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  detailsDropdownArrow: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Expanded Content (dropdown)
  expandedContent: {
    padding: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  alertLabel: {
    color: colors.status.critical,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  unitsList: {
    gap: spacing.xs,
  },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  partnerUnitChip: {
    backgroundColor: colors.beacon.primaryLight,
  },
  unitStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  unitName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unitAgency: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontStyle: 'italic',
  },
  unitStatusText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  requestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  requestChip: {
    backgroundColor: colors.status.criticalLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.status.critical,
  },
  requestText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.status.critical,
  },

  // Compact View
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  compactSourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactSource: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    width: 32,
  },
  compactTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  compactTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
});

export default IncidentStream;
