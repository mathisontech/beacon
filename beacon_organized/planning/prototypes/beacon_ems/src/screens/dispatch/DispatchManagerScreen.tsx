import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

// Types
interface DispatchableUnit {
  id: string;
  name: string;
  type: 'engine' | 'ladder' | 'rescue' | 'medic' | 'police' | 'atv';
  status: 'available' | 'en_route' | 'on_scene' | 'returning' | 'out_of_service';
  currentIncident?: string;
  eta?: string;
  location?: string;
}

interface PendingDispatch {
  id: string;
  incidentTitle: string;
  incidentType: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  requestedUnits: string[];
  timestamp: string;
  location: string;
}

// Mock data
const mockUnits: DispatchableUnit[] = [
  { id: '1', name: 'Engine 7', type: 'engine', status: 'available', location: 'Station 7' },
  { id: '2', name: 'Engine 12', type: 'engine', status: 'on_scene', currentIncident: 'Structure Fire - Main St', location: '1234 Main St' },
  { id: '3', name: 'Ladder 3', type: 'ladder', status: 'available', location: 'Station 3' },
  { id: '4', name: 'Rescue 1', type: 'rescue', status: 'en_route', currentIncident: 'MVA - Hwy 101', eta: '4 min' },
  { id: '5', name: 'Medic 5', type: 'medic', status: 'available', location: 'Station 5' },
  { id: '6', name: 'Medic 8', type: 'medic', status: 'on_scene', currentIncident: 'Medical Emergency - Pine St', location: '456 Pine St' },
  { id: '7', name: 'Unit 12', type: 'police', status: 'available', location: 'Patrol Zone A' },
  { id: '8', name: 'Unit 15', type: 'police', status: 'returning', currentIncident: 'Traffic Control', eta: '8 min' },
  { id: '9', name: 'ATV-1', type: 'atv', status: 'available', location: 'Station 1' },
  { id: '10', name: 'ATV-2', type: 'atv', status: 'out_of_service', location: 'Maintenance' },
];

const mockPendingDispatches: PendingDispatch[] = [
  {
    id: '1',
    incidentTitle: 'Medical Emergency',
    incidentType: 'medical',
    urgency: 'high',
    requestedUnits: ['ALS Unit'],
    timestamp: '1 min ago',
    location: '789 Oak Avenue',
  },
  {
    id: '2',
    incidentTitle: 'Gas Leak Report',
    incidentType: 'utility',
    urgency: 'medium',
    requestedUnits: ['Engine', 'Hazmat'],
    timestamp: '3 min ago',
    location: '321 Elm Street',
  },
  {
    id: '3',
    incidentTitle: 'Water Rescue',
    incidentType: 'rescue',
    urgency: 'critical',
    requestedUnits: ['Rescue', 'Boat', 'Medic'],
    timestamp: '5 min ago',
    location: 'River Rd & Marina Dr',
  },
];

// Components
const UnitCard: React.FC<{ unit: DispatchableUnit; onDispatch: () => void }> = ({ unit, onDispatch }) => {
  const getStatusColor = () => {
    switch (unit.status) {
      case 'available': return colors.status.online;
      case 'en_route': return colors.status.warning;
      case 'on_scene': return colors.status.busy;
      case 'returning': return colors.status.info;
      case 'out_of_service': return colors.text.muted;
      default: return colors.text.muted;
    }
  };

  const getStatusLabel = () => {
    switch (unit.status) {
      case 'available': return 'Available';
      case 'en_route': return `En Route${unit.eta ? ` (${unit.eta})` : ''}`;
      case 'on_scene': return 'On Scene';
      case 'returning': return `Returning${unit.eta ? ` (${unit.eta})` : ''}`;
      case 'out_of_service': return 'Out of Service';
      default: return unit.status;
    }
  };

  const getTypeIcon = () => {
    switch (unit.type) {
      case 'engine': return '🚒';
      case 'ladder': return '🚒';
      case 'rescue': return '🚑';
      case 'medic': return '🚑';
      case 'police': return '🚔';
      case 'atv': return '🚗';
      default: return '🚐';
    }
  };

  return (
    <View style={styles.unitCard}>
      <View style={styles.unitHeader}>
        <View style={styles.unitInfo}>
          <Text style={styles.unitIcon}>{getTypeIcon()}</Text>
          <View>
            <Text style={styles.unitName}>{unit.name}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusLabel, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
            </View>
          </View>
        </View>
        {unit.status === 'available' && (
          <TouchableOpacity style={styles.dispatchButton} onPress={onDispatch}>
            <Text style={styles.dispatchButtonText}>Dispatch</Text>
          </TouchableOpacity>
        )}
      </View>
      {unit.currentIncident && (
        <Text style={styles.currentIncident}>{unit.currentIncident}</Text>
      )}
      <Text style={styles.unitLocation}>{unit.location}</Text>
    </View>
  );
};

const PendingDispatchCard: React.FC<{ dispatch: PendingDispatch; onAssign: () => void }> = ({ dispatch, onAssign }) => {
  const getUrgencyColor = () => {
    switch (dispatch.urgency) {
      case 'critical': return colors.status.critical;
      case 'high': return colors.status.warning;
      case 'medium': return colors.status.info;
      case 'low': return colors.status.online;
      default: return colors.text.muted;
    }
  };

  return (
    <View style={[styles.pendingCard, { borderLeftColor: getUrgencyColor() }]}>
      <View style={styles.pendingHeader}>
        <View>
          <View style={styles.urgencyRow}>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor() }]}>
              <Text style={styles.urgencyText}>{dispatch.urgency.toUpperCase()}</Text>
            </View>
            <Text style={styles.pendingTimestamp}>{dispatch.timestamp}</Text>
          </View>
          <Text style={styles.pendingTitle}>{dispatch.incidentTitle}</Text>
          <Text style={styles.pendingLocation}>{dispatch.location}</Text>
        </View>
      </View>
      <View style={styles.requestedUnits}>
        <Text style={styles.requestedLabel}>Requested:</Text>
        <View style={styles.requestedTags}>
          {dispatch.requestedUnits.map((unit, index) => (
            <View key={index} style={styles.requestedTag}>
              <Text style={styles.requestedTagText}>{unit}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.assignButton} onPress={onAssign}>
        <Text style={styles.assignButtonText}>Assign Units</Text>
      </TouchableOpacity>
    </View>
  );
};

export const DispatchManagerScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'units'>('pending');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const availableUnits = mockUnits.filter(u => u.status === 'available');
  const busyUnits = mockUnits.filter(u => u.status !== 'available' && u.status !== 'out_of_service');
  const outOfServiceUnits = mockUnits.filter(u => u.status === 'out_of_service');

  const filteredUnits = filterStatus
    ? mockUnits.filter(u => u.status === filterStatus)
    : mockUnits;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dispatch Manager</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mockPendingDispatches.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{availableUnits.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'pending' && styles.tabButtonTextActive]}>
            Pending Dispatches ({mockPendingDispatches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'units' && styles.tabButtonActive]}
          onPress={() => setActiveTab('units')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'units' && styles.tabButtonTextActive]}>
            All Units ({mockUnits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'pending' ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {mockPendingDispatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyTitle}>No Pending Dispatches</Text>
              <Text style={styles.emptySubtitle}>All incidents have been assigned</Text>
            </View>
          ) : (
            mockPendingDispatches.map((dispatch) => (
              <PendingDispatchCard
                key={dispatch.id}
                dispatch={dispatch}
                onAssign={() => console.log('Assign units to:', dispatch.id)}
              />
            ))
          )}
        </ScrollView>
      ) : (
        <>
          {/* Unit Filter */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, !filterStatus && styles.filterChipActive]}
                onPress={() => setFilterStatus(null)}
              >
                <Text style={[styles.filterChipText, !filterStatus && styles.filterChipTextActive]}>
                  All ({mockUnits.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'available' && styles.filterChipActive]}
                onPress={() => setFilterStatus('available')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'available' && styles.filterChipTextActive]}>
                  Available ({availableUnits.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'en_route' && styles.filterChipActive]}
                onPress={() => setFilterStatus('en_route')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'en_route' && styles.filterChipTextActive]}>
                  En Route
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'on_scene' && styles.filterChipActive]}
                onPress={() => setFilterStatus('on_scene')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'on_scene' && styles.filterChipTextActive]}>
                  On Scene
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'out_of_service' && styles.filterChipActive]}
                onPress={() => setFilterStatus('out_of_service')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'out_of_service' && styles.filterChipTextActive]}>
                  Out of Service ({outOfServiceUnits.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {filteredUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onDispatch={() => console.log('Dispatch:', unit.id)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
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
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.beacon.primary,
  },
  tabButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  tabButtonTextActive: {
    color: colors.white,
  },

  // Filter Bar
  filterBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.beacon.primaryLight,
    borderColor: colors.beacon.primary,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.beacon.primary,
    fontWeight: typography.weights.semibold,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // Unit Card
  unitCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  unitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unitIcon: {
    fontSize: 24,
  },
  unitName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  currentIncident: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  unitLocation: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  dispatchButton: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  dispatchButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },

  // Pending Dispatch Card
  pendingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderLeftWidth: 4,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  urgencyBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  pendingTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  pendingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  pendingLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  requestedUnits: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  requestedLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  requestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  requestedTag: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  requestedTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  assignButton: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  assignButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    color: colors.status.online,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
});

export default DispatchManagerScreen;
