import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { spacing, typography, borderRadius } from '../../theme/tokens';

// Light theme colors matching the widget sidebar
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

// Status colors
const statusColors = {
  available: '#22c55e',
  responding: '#f59e0b',
  on_scene: '#3b82f6',
  returning: '#8b5cf6',
  offline: '#6b7280',
  emergency: '#ef4444',
};

export interface QueuedIncident {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  eta?: string;
}

export interface UnitMember {
  id: string;
  name: string;
  role?: string;
}

export interface ResourceUnit {
  id: string;
  name: string;
  type: 'atv' | 'utility' | 'ambulance' | 'fire' | 'civilian' | 'patrol';
  status: 'available' | 'responding' | 'on_scene' | 'returning' | 'offline' | 'emergency';
  statusMessage: string;
  currentIncidentId?: string; // Links to active incident database
  currentIncidentTitle?: string; // Incident title for display
  lastUpdate: string;
  members: UnitMember[];
  currentLocation?: string;
  incidentQueue: QueuedIncident[];
  isMyTeam?: boolean; // True if unit is directly under admin's command
}

export interface UnitGroup {
  id: string;
  name: string;
  icon: string;
  units: ResourceUnit[];
  expanded?: boolean;
}

interface ResourceUnitsSidebarProps {
  groups: UnitGroup[];
  onUnitPress?: (unit: ResourceUnit) => void;
  onIncidentPress?: (incident: QueuedIncident) => void;
}

const getStatusColor = (status: ResourceUnit['status']) => {
  return statusColors[status] || statusColors.offline;
};

const getPriorityColor = (priority: QueuedIncident['priority']) => {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#6b7280';
    default: return '#6b7280';
  }
};

const UnitCard: React.FC<{
  unit: ResourceUnit;
  onPress?: () => void;
  onIncidentPress?: (incident: QueuedIncident) => void;
}> = ({ unit, onPress, onIncidentPress }) => {
  const [expanded, setExpanded] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(true); // Queue visible by default
  const statusColor = getStatusColor(unit.status);

  return (
    <View style={styles.unitCard}>
      <TouchableOpacity
        style={styles.unitCardHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.unitCardLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <View style={styles.unitInfo}>
            <Text style={styles.unitName}>{unit.name}</Text>
            <View style={styles.unitResourceIcons}>
              <View style={styles.unitResourceItem}>
                <Text style={styles.unitResourceIcon}>👤</Text>
                <Text style={styles.unitResourceCount}>{unit.members.length}</Text>
              </View>
              <View style={styles.unitResourceItem}>
                <Text style={styles.unitResourceIcon}>{vehicleIcons[unit.type] || '🚗'}</Text>
                <Text style={styles.unitResourceCount}>1</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.unitCardRight}>
          {unit.incidentQueue.length > 0 && (
            <View style={styles.queueBadge}>
              <Text style={styles.queueBadgeText}>{unit.incidentQueue.length}</Text>
            </View>
          )}
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Status Message */}
      <View style={styles.statusMessageContainer}>
        <Text style={styles.statusLabel}>{unit.status.replace('_', ' ').toUpperCase()}</Text>
        {unit.currentIncidentTitle ? (
          <>
            <Text style={styles.incidentTitle}>{unit.currentIncidentTitle}</Text>
            {unit.statusMessage && (
              <Text style={styles.statusMessage}>{unit.statusMessage}</Text>
            )}
          </>
        ) : (
          <Text style={styles.statusMessage}>{unit.statusMessage}</Text>
        )}
        <Text style={styles.lastUpdate}>{unit.lastUpdate}</Text>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.unitDetails}>
          {/* Current Location */}
          {unit.currentLocation && (
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Location:</Text>
              <Text style={styles.locationValue}>{unit.currentLocation}</Text>
            </View>
          )}

          {/* Members */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionLabel}>Team Members</Text>
            {unit.members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.memberDot} />
                <Text style={styles.memberName}>{member.name}</Text>
                {member.role && <Text style={styles.memberRole}>{member.role}</Text>}
              </View>
            ))}
          </View>

          {/* Incident Queue */}
          {unit.incidentQueue.length > 0 && (
            <View style={styles.queueSection}>
              <Text style={styles.sectionLabel}>Incident Queue ({unit.incidentQueue.length})</Text>
              {unit.incidentQueue.map((incident, index) => (
                <TouchableOpacity
                  key={incident.id}
                  style={styles.queuedIncident}
                  onPress={() => onIncidentPress?.(incident)}
                >
                  <View style={styles.queuePosition}>
                    <Text style={styles.queuePositionText}>{index + 1}</Text>
                  </View>
                  <View style={styles.queuedIncidentInfo}>
                    <Text style={styles.queuedIncidentTitle} numberOfLines={1}>
                      {incident.title}
                    </Text>
                    {incident.eta && (
                      <Text style={styles.queuedIncidentEta}>ETA: {incident.eta}</Text>
                    )}
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(incident.priority) }]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Queue shown outside expanded section - visible by default */}
      {!expanded && unit.incidentQueue.length > 0 && (
        <View style={styles.queueSectionOutside}>
          <TouchableOpacity
            style={styles.queueHeaderCollapsible}
            onPress={() => setQueueExpanded(!queueExpanded)}
          >
            <Text style={styles.queueLabel}>Queue ({unit.incidentQueue.length})</Text>
            <Text style={styles.queueExpandIcon}>{queueExpanded ? '−' : '+'}</Text>
          </TouchableOpacity>
          {queueExpanded && unit.incidentQueue.map((incident, index) => (
            <TouchableOpacity
              key={incident.id}
              style={styles.queuedIncidentCompact}
              onPress={() => onIncidentPress?.(incident)}
            >
              <View style={styles.queuePosition}>
                <Text style={styles.queuePositionText}>{index + 1}</Text>
              </View>
              <View style={styles.queuedIncidentInfo}>
                <Text style={styles.queuedIncidentTitle} numberOfLines={1}>
                  {incident.title}
                </Text>
                {incident.eta && (
                  <Text style={styles.queuedIncidentEta}>ETA: {incident.eta}</Text>
                )}
              </View>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(incident.priority) }]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Vehicle type icons
const vehicleIcons: Record<string, string> = {
  atv: '🚙',
  utility: '🚐',
  ambulance: '🚑',
  fire: '🚒',
  civilian: '🚗',
  patrol: '🚔',
};

const GroupSection: React.FC<{
  group: UnitGroup;
  onUnitPress?: (unit: ResourceUnit) => void;
  onIncidentPress?: (incident: QueuedIncident) => void;
}> = ({ group, onUnitPress, onIncidentPress }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.groupSection}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeaderLeft}>
          <Text style={styles.groupName}>{group.name}</Text>
        </View>
        <View style={styles.groupHeaderRight}>
          <Text style={styles.groupUnitCount}>{group.units.length}</Text>
          <Text style={styles.groupExpandIcon}>{expanded ? '−' : '+'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.groupUnits}>
          {group.units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onPress={() => onUnitPress?.(unit)}
              onIncidentPress={onIncidentPress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const ResourceUnitsSidebar: React.FC<ResourceUnitsSidebarProps> = ({
  groups,
  onUnitPress,
  onIncidentPress,
}) => {
  const [viewMode, setViewMode] = useState<'my_teams' | 'all'>('my_teams');

  // Filter groups based on view mode
  const filteredGroups = viewMode === 'my_teams'
    ? groups.map(group => ({
        ...group,
        units: group.units.filter(unit => unit.isMyTeam),
      })).filter(group => group.units.length > 0)
    : groups;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resources</Text>
      </View>

      {/* View Mode Tabs */}
      <View style={styles.viewTabs}>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === 'my_teams' && styles.viewTabActive]}
          onPress={() => setViewMode('my_teams')}
        >
          <Text style={[styles.viewTabText, viewMode === 'my_teams' && styles.viewTabTextActive]}>
            My Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewTab, viewMode === 'all' && styles.viewTabActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.viewTabText, viewMode === 'all' && styles.viewTabTextActive]}>
            All Units
          </Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <ScrollView
        style={styles.groupsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              onUnitPress={onUnitPress}
              onIncidentPress={onIncidentPress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No teams assigned to you</Text>
          </View>
        )}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.available }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.responding }]} />
          <Text style={styles.legendText}>Responding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.on_scene }]} />
          <Text style={styles.legendText}>On Scene</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: sidebarColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: sidebarColors.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: sidebarColors.textMuted,
    marginTop: 2,
  },

  // View Mode Tabs
  viewTabs: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.card,
  },
  viewTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: sidebarColors.backgroundHover,
    alignItems: 'center',
  },
  viewTabActive: {
    backgroundColor: sidebarColors.accent,
  },
  viewTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: sidebarColors.textSecondary,
  },
  viewTabTextActive: {
    color: '#ffffff',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: sidebarColors.textMuted,
  },

  // Groups List
  groupsList: {
    flex: 1,
  },
  groupSection: {
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.borderLight,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: sidebarColors.card,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupName: {
    fontSize: 13,
    fontWeight: '600',
    color: sidebarColors.text,
  },
  groupUnitCount: {
    fontSize: 12,
    fontWeight: '600',
    color: sidebarColors.textMuted,
    backgroundColor: sidebarColors.backgroundHover,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  groupExpandIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: sidebarColors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  groupUnits: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },

  // Unit Card
  unitCard: {
    backgroundColor: sidebarColors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: sidebarColors.cardBorder,
    overflow: 'hidden',
  },
  unitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  unitCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    fontSize: 13,
    fontWeight: '600',
    color: sidebarColors.text,
  },
  unitResourceIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  unitResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  unitResourceIcon: {
    fontSize: 11,
  },
  unitResourceCount: {
    fontSize: 10,
    fontWeight: '600',
    color: sidebarColors.textMuted,
  },
  unitCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  queueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  expandIcon: {
    fontSize: 10,
    color: sidebarColors.textMuted,
  },

  // Status Message
  statusMessageContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.backgroundHover,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: sidebarColors.accent,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  incidentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: sidebarColors.text,
    marginTop: 2,
  },
  statusMessage: {
    fontSize: 11,
    color: sidebarColors.textSecondary,
    marginTop: 2,
  },
  lastUpdate: {
    fontSize: 10,
    color: sidebarColors.textMuted,
    marginTop: 2,
  },

  // Unit Details (expanded)
  unitDetails: {
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: sidebarColors.textMuted,
  },
  locationValue: {
    fontSize: 11,
    color: sidebarColors.text,
    flex: 1,
  },
  membersSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: sidebarColors.textMuted,
    marginBottom: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
  },
  memberDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: sidebarColors.textMuted,
  },
  memberName: {
    fontSize: 11,
    color: sidebarColors.text,
  },
  memberRole: {
    fontSize: 10,
    color: sidebarColors.textMuted,
    marginLeft: 'auto',
  },

  // Incident Queue
  queueSection: {
    gap: spacing.xs,
  },
  queueSectionOutside: {
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.backgroundHover,
  },
  queueHeaderCollapsible: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  queueLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: sidebarColors.accent,
    letterSpacing: 0.5,
  },
  queueExpandIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: sidebarColors.textMuted,
  },
  queuedIncident: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: sidebarColors.backgroundHover,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  queuedIncidentCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
  },
  queuePosition: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: sidebarColors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queuePositionText: {
    fontSize: 10,
    fontWeight: '700',
    color: sidebarColors.textSecondary,
  },
  queuedIncidentInfo: {
    flex: 1,
  },
  queuedIncidentTitle: {
    fontSize: 11,
    color: sidebarColors.text,
  },
  queuedIncidentEta: {
    fontSize: 9,
    color: sidebarColors.textMuted,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.card,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: sidebarColors.textMuted,
  },
});

export default ResourceUnitsSidebar;
