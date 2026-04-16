import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import type { IncidentsStackParamList } from '../../navigation/AppNavigator';

type IncidentTab = 'active' | 'queue' | 'events' | 'archive';
type IncidentsNavigationProp = StackNavigationProp<IncidentsStackParamList, 'IncidentsList'>;

interface RespondingUnit {
  id: string;
  name: string;
  status: 'en_route' | 'on_scene' | 'staging' | 'returning';
  eta?: string;
  isBackup?: boolean;
  agency?: string;
}

interface ResourceRequest {
  type: string;
  status: 'requested' | 'dispatched' | 'fulfilled';
  requestedAt?: string;
}

interface Incident {
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
  eventId?: string;
}

interface AvailableUnit {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'busy' | 'returning';
  eta?: string;
  currentQueueSize: number;
}

interface DeclaredEvent {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'closed';
  incidentCount: number;
}

// Mock data
const mockIncidents: Incident[] = [
  {
    id: '1',
    incidentType: 'fire',
    title: 'Structure Fire - 1234 Main St',
    location: '1234 Main St, Downtown',
    timestamp: '2 min ago',
    urgency: 'critical',
    assignmentStatus: 'in_progress',
    eventId: 'evt-1',
    respondingUnits: [
      { id: 'u1', name: 'Engine 7', status: 'on_scene' },
      { id: 'u2', name: 'Ladder 3', status: 'on_scene' },
      { id: 'u3', name: 'Engine 15', status: 'en_route', eta: '4 min', isBackup: true, agency: 'County Fire' },
    ],
    resourceRequests: [
      { type: 'EMS', status: 'dispatched' },
      { type: 'Hazmat', status: 'requested' },
    ],
  },
  {
    id: '2',
    incidentType: 'accident',
    title: 'MVA with Injuries',
    location: 'Hwy 101 & Oak Ave',
    timestamp: '8 min ago',
    urgency: 'high',
    assignmentStatus: 'in_progress',
    eventId: 'evt-1',
    respondingUnits: [
      { id: 'u4', name: 'Rescue 1', status: 'on_scene' },
      { id: 'u5', name: 'Medic 5', status: 'on_scene' },
      { id: 'u6', name: 'Unit 12', status: 'on_scene' },
    ],
    resourceRequests: [],
  },
  {
    id: '3',
    incidentType: 'medical',
    title: 'Medical Emergency - Cardiac',
    location: '456 Pine Street',
    timestamp: '1 min ago',
    urgency: 'critical',
    assignmentStatus: 'unassigned',
    respondingUnits: [],
    resourceRequests: [
      { type: 'ALS Unit', status: 'requested' },
    ],
  },
  {
    id: '4',
    incidentType: 'utility',
    title: 'Power Line Down',
    location: 'Cedar Rd & 5th',
    timestamp: '5 min ago',
    urgency: 'medium',
    assignmentStatus: 'assigned',
    queuePosition: 2,
    queuedForUnit: 'Engine 12',
    eventId: 'evt-1',
    respondingUnits: [],
    resourceRequests: [
      { type: 'Power Company', status: 'requested' },
    ],
  },
  {
    id: '5',
    incidentType: 'rescue',
    title: 'Water Rescue - Flood Zone C',
    location: 'River Rd & Marina Dr',
    timestamp: '12 min ago',
    urgency: 'critical',
    assignmentStatus: 'in_progress',
    eventId: 'evt-1',
    respondingUnits: [
      { id: 'u7', name: 'Rescue 3', status: 'en_route', eta: '6 min' },
      { id: 'u8', name: 'Boat 1', status: 'staging' },
    ],
    resourceRequests: [
      { type: 'Helicopter', status: 'requested' },
      { type: 'Coast Guard', status: 'dispatched' },
    ],
  },
  {
    id: '6',
    incidentType: 'medical',
    title: 'Breathing Difficulty',
    location: '789 Oak Ave, Apt 3B',
    timestamp: '3 min ago',
    urgency: 'high',
    assignmentStatus: 'assigned',
    queuePosition: 1,
    queuedForUnit: 'Medic 8',
    respondingUnits: [],
    resourceRequests: [],
  },
  {
    id: '7',
    incidentType: 'weather',
    title: 'Tree Down Blocking Road',
    location: 'Elm St & 3rd Ave',
    timestamp: '15 min ago',
    urgency: 'low',
    assignmentStatus: 'assigned',
    queuePosition: 3,
    queuedForUnit: 'Engine 12',
    eventId: 'evt-1',
    respondingUnits: [],
    resourceRequests: [],
  },
];

const mockAvailableUnits: AvailableUnit[] = [
  { id: 'a1', name: 'Engine 7', type: 'Fire', status: 'busy', currentQueueSize: 0 },
  { id: 'a2', name: 'Engine 12', type: 'Fire', status: 'busy', currentQueueSize: 2 },
  { id: 'a3', name: 'Ladder 3', type: 'Fire', status: 'busy', currentQueueSize: 0 },
  { id: 'a4', name: 'Rescue 1', type: 'Fire', status: 'busy', currentQueueSize: 0 },
  { id: 'a5', name: 'Medic 5', type: 'EMS', status: 'busy', currentQueueSize: 0 },
  { id: 'a6', name: 'Medic 8', type: 'EMS', status: 'returning', eta: '5 min', currentQueueSize: 1 },
  { id: 'a7', name: 'Unit 12', type: 'Police', status: 'busy', currentQueueSize: 0 },
  { id: 'a8', name: 'Unit 15', type: 'Police', status: 'available', currentQueueSize: 0 },
  { id: 'a9', name: 'ATV-1', type: 'Utility', status: 'available', currentQueueSize: 0 },
  { id: 'a10', name: 'ATV-2', type: 'Utility', status: 'available', currentQueueSize: 0 },
];

const mockEvents: DeclaredEvent[] = [
  { id: 'evt-1', name: 'Hurricane Maria', type: 'Hurricane', startDate: '2024-01-15', status: 'active', incidentCount: 47 },
  { id: 'evt-2', name: 'Winter Storm Dec 2023', type: 'Winter Storm', startDate: '2023-12-20', endDate: '2023-12-22', status: 'closed', incidentCount: 23 },
];

const getUrgencyColor = (urgency: Incident['urgency']) => {
  switch (urgency) {
    case 'critical': return colors.status.critical;
    case 'high': return colors.status.severe;
    case 'medium': return colors.status.moderate;
    case 'low': return colors.status.minor;
  }
};

const getIncidentTypeLabel = (type: Incident['incidentType']) => {
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

const getIncidentTypeColor = (type: Incident['incidentType']) => {
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

const getUnitStatusColor = (status: AvailableUnit['status']) => {
  switch (status) {
    case 'available': return colors.status.minor;
    case 'returning': return colors.status.moderate;
    case 'busy': return colors.status.severe;
  }
};

export const IncidentsScreen: React.FC = () => {
  const navigation = useNavigation<IncidentsNavigationProp>();
  const [activeTab, setActiveTab] = useState<IncidentTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [incidentToAssign, setIncidentToAssign] = useState<Incident | null>(null);

  const handleIncidentPress = (incident: Incident) => {
    navigation.navigate('IncidentDetail', { incidentId: incident.id });
  };

  const tabs: { key: IncidentTab; label: string; count?: number }[] = [
    { key: 'active', label: 'Active', count: mockIncidents.filter(i => i.assignmentStatus === 'in_progress').length },
    { key: 'queue', label: 'Queue', count: mockIncidents.filter(i => i.assignmentStatus === 'unassigned' || i.queuePosition).length },
    { key: 'events', label: 'Events', count: mockEvents.filter(e => e.status === 'active').length },
    { key: 'archive', label: 'Archive' },
  ];

  const activeIncidents = mockIncidents.filter(i => i.assignmentStatus === 'in_progress');
  const queuedIncidents = mockIncidents.filter(i => i.assignmentStatus === 'unassigned' || i.queuePosition);
  const unassignedCount = mockIncidents.filter(i => i.assignmentStatus === 'unassigned').length;

  const handleAssign = (incident: Incident) => {
    setIncidentToAssign(incident);
    setShowAssignModal(true);
  };

  const handleUnitSelect = (unit: AvailableUnit) => {
    console.log(`Assigning ${incidentToAssign?.title} to ${unit.name}`);
    setShowAssignModal(false);
    setIncidentToAssign(null);
  };

  const renderIncidentCard = (incident: Incident, showDetails: boolean = false) => {
    const pendingRequests = incident.resourceRequests.filter(r => r.status === 'requested');

    return (
      <TouchableOpacity
        key={incident.id}
        style={[styles.incidentCard, selectedIncident?.id === incident.id && styles.incidentCardSelected]}
        onPress={() => handleIncidentPress(incident)}
        onLongPress={() => setSelectedIncident(incident)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(incident.urgency) }]}>
              <Text style={styles.urgencyText}>{incident.urgency.toUpperCase()}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: getIncidentTypeColor(incident.incidentType) }]}>
              <Text style={styles.typeBadgeText}>{getIncidentTypeLabel(incident.incidentType)}</Text>
            </View>
          </View>
          <Text style={styles.cardTimestamp}>{incident.timestamp}</Text>
        </View>

        {/* Title & Location */}
        <Text style={styles.cardTitle}>{incident.title}</Text>
        <Text style={styles.cardLocation}>{incident.location}</Text>

        {/* Assignment Status */}
        <View style={styles.assignmentSection}>
          {incident.assignmentStatus === 'unassigned' ? (
            <View style={styles.unassignedRow}>
              <View style={[styles.statusBadge, { backgroundColor: colors.status.critical }]}>
                <Text style={styles.statusBadgeText}>UNASSIGNED</Text>
              </View>
              <TouchableOpacity style={styles.assignBtn} onPress={() => handleAssign(incident)}>
                <Text style={styles.assignBtnText}>Assign Unit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.claimBtn}>
                <Text style={styles.claimBtnText}>Claim</Text>
              </TouchableOpacity>
            </View>
          ) : incident.queuePosition ? (
            <View style={styles.queueRow}>
              <View style={[styles.statusBadge, { backgroundColor: colors.status.moderate }]}>
                <Text style={styles.statusBadgeText}>
                  Queue: #{incident.queuePosition} for {incident.queuedForUnit}
                </Text>
              </View>
              <TouchableOpacity style={styles.reassignBtn}>
                <Text style={styles.reassignBtnText}>Reassign</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Responding Units */}
        {incident.respondingUnits.length > 0 && (
          <View style={styles.respondingSection}>
            <Text style={styles.sectionLabel}>Responding:</Text>
            {incident.respondingUnits.map((unit) => (
              <View key={unit.id} style={[styles.unitRow, unit.isBackup && styles.unitRowBackup]}>
                <View style={[
                  styles.unitStatusDot,
                  { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }
                ]} />
                <Text style={styles.unitName}>{unit.name}</Text>
                <Text style={styles.unitStatus}>
                  {unit.status === 'on_scene' ? 'On Scene' :
                   unit.status === 'en_route' ? (unit.eta ? `En Route (${unit.eta})` : 'En Route') :
                   unit.status === 'staging' ? 'Staging' : 'Returning'}
                </Text>
                {unit.isBackup && unit.agency && (
                  <Text style={styles.unitAgency}>({unit.agency})</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Resource Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.needsLabel}>Needs:</Text>
            {pendingRequests.map((req, idx) => (
              <TouchableOpacity key={idx} style={styles.requestChip}>
                <Text style={styles.requestText}>{req.type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addRequestBtn}>
              <Text style={styles.addRequestText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAssignModal = () => (
    <Modal
      visible={showAssignModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAssignModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assign Unit</Text>
            <TouchableOpacity onPress={() => setShowAssignModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {incidentToAssign && (
            <View style={styles.modalIncidentInfo}>
              <View style={[styles.typeBadge, { backgroundColor: getIncidentTypeColor(incidentToAssign.incidentType) }]}>
                <Text style={styles.typeBadgeText}>{getIncidentTypeLabel(incidentToAssign.incidentType)}</Text>
              </View>
              <Text style={styles.modalIncidentTitle}>{incidentToAssign.title}</Text>
              <Text style={styles.modalIncidentLocation}>{incidentToAssign.location}</Text>
            </View>
          )}

          <Text style={styles.modalSectionTitle}>Available Units</Text>
          <ScrollView style={styles.unitsList}>
            {mockAvailableUnits.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={styles.unitSelectRow}
                onPress={() => handleUnitSelect(unit)}
              >
                <View style={[styles.unitSelectDot, { backgroundColor: getUnitStatusColor(unit.status) }]} />
                <View style={styles.unitSelectInfo}>
                  <Text style={styles.unitSelectName}>{unit.name}</Text>
                  <Text style={styles.unitSelectType}>{unit.type}</Text>
                </View>
                <View style={styles.unitSelectMeta}>
                  <Text style={[styles.unitSelectStatus, { color: getUnitStatusColor(unit.status) }]}>
                    {unit.status === 'available' ? 'Available' :
                     unit.status === 'returning' ? `Returning (${unit.eta})` : 'Busy'}
                  </Text>
                  {unit.currentQueueSize > 0 && (
                    <Text style={styles.unitQueueSize}>{unit.currentQueueSize} in queue</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.unitSelectBtn}>
                  <Text style={styles.unitSelectBtnText}>
                    {unit.status === 'available' ? 'Assign' : 'Queue'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.requestBackupBtn}>
              <Text style={styles.requestBackupText}>Request Backup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderActiveTab = () => (
    <ScrollView style={styles.incidentsList} showsVerticalScrollIndicator={false}>
      {activeIncidents.map((incident) => renderIncidentCard(incident))}
    </ScrollView>
  );

  const renderQueueTab = () => (
    <View style={styles.queueContainer}>
      {/* Unassigned Section */}
      <View style={styles.queueSection}>
        <View style={styles.queueSectionHeader}>
          <Text style={styles.queueSectionTitle}>Unassigned</Text>
          <View style={styles.queueCountBadge}>
            <Text style={styles.queueCountText}>{unassignedCount}</Text>
          </View>
        </View>
        <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
          {queuedIncidents
            .filter(i => i.assignmentStatus === 'unassigned')
            .sort((a, b) => {
              const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            })
            .map((incident) => renderIncidentCard(incident))}
        </ScrollView>
      </View>

      {/* Queued Section */}
      <View style={styles.queueSection}>
        <View style={styles.queueSectionHeader}>
          <Text style={styles.queueSectionTitle}>Queued for Units</Text>
        </View>
        <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
          {queuedIncidents
            .filter(i => i.queuePosition)
            .sort((a, b) => (a.queuePosition || 99) - (b.queuePosition || 99))
            .map((incident) => renderIncidentCard(incident))}
        </ScrollView>
      </View>
    </View>
  );

  const renderEventsTab = () => (
    <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
      <Text style={styles.eventsSubtitle}>Active Events</Text>
      {mockEvents.filter(e => e.status === 'active').map((event) => (
        <TouchableOpacity key={event.id} style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={styles.eventStatusBadge}>
              <Text style={styles.eventStatusText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.eventType}>{event.type}</Text>
          <Text style={styles.eventDate}>Started: {event.startDate}</Text>
          <View style={styles.eventStats}>
            <Text style={styles.eventIncidentCount}>{event.incidentCount} incidents</Text>
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity style={styles.eventActionBtn}>
              <Text style={styles.eventActionText}>View Incidents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventActionBtn}>
              <Text style={styles.eventActionText}>Timeline</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.eventsSubtitle, { marginTop: spacing.lg }]}>Past Events</Text>
      {mockEvents.filter(e => e.status === 'closed').map((event) => (
        <TouchableOpacity key={event.id} style={[styles.eventCard, styles.eventCardClosed]}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={[styles.eventStatusBadge, styles.eventStatusClosed]}>
              <Text style={styles.eventStatusText}>CLOSED</Text>
            </View>
          </View>
          <Text style={styles.eventType}>{event.type}</Text>
          <Text style={styles.eventDate}>{event.startDate} - {event.endDate}</Text>
          <Text style={styles.eventIncidentCount}>{event.incidentCount} incidents</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.newIncidentBtn}>
          <Text style={styles.newIncidentText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search incidents..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'active' && renderActiveTab()}
        {activeTab === 'queue' && renderQueueTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'archive' && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Archive coming soon</Text>
          </View>
        )}
      </View>

      {/* Assign Modal */}
      {renderAssignModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.beacon.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  tabTextActive: {
    color: colors.beacon.primary,
  },
  tabBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  tabBadgeActive: {
    backgroundColor: colors.beacon.primary,
  },
  tabBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  newIncidentBtn: {
    backgroundColor: colors.status.critical,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  newIncidentText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  searchBar: {
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  content: {
    flex: 1,
  },
  incidentsList: {
    flex: 1,
    padding: spacing.md,
  },

  // Incident Card
  incidentCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  incidentCardSelected: {
    borderColor: colors.beacon.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  urgencyBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  urgencyText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  cardTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  // Assignment Section
  assignmentSection: {
    marginBottom: spacing.sm,
  },
  unassignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  assignBtn: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  assignBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  claimBtn: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  claimBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  reassignBtn: {
    paddingVertical: spacing.xs,
  },
  reassignBtnText: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Responding Section
  respondingSection: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  unitRowBackup: {
    backgroundColor: colors.beacon.primaryLight,
  },
  unitStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  unitName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unitStatus: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
  },
  unitAgency: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontStyle: 'italic',
  },

  // Requests Section
  requestsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  needsLabel: {
    fontSize: typography.sizes.xs,
    color: colors.status.critical,
    fontWeight: typography.weights.semibold,
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
  addRequestBtn: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  addRequestText: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Queue Tab
  queueContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  queueSection: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  queueSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  queueSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  queueCountBadge: {
    backgroundColor: colors.status.critical,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  queueCountText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  queueList: {
    flex: 1,
  },

  // Events Tab
  eventsList: {
    flex: 1,
    padding: spacing.md,
  },
  eventsSubtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  eventCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  eventCardClosed: {
    opacity: 0.7,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  eventStatusBadge: {
    backgroundColor: colors.status.critical,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  eventStatusClosed: {
    backgroundColor: colors.text.muted,
  },
  eventStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  eventType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  eventDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  eventStats: {
    marginTop: spacing.sm,
  },
  eventIncidentCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  eventActionBtn: {
    paddingVertical: spacing.xs,
  },
  eventActionText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: 20,
    color: colors.text.muted,
    padding: spacing.sm,
  },
  modalIncidentInfo: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalIncidentTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  modalIncidentLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  unitsList: {
    maxHeight: 300,
  },
  unitSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  unitSelectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  unitSelectInfo: {
    flex: 1,
  },
  unitSelectName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unitSelectType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  unitSelectMeta: {
    alignItems: 'flex-end',
    marginRight: spacing.md,
  },
  unitSelectStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  unitQueueSize: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  unitSelectBtn: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  unitSelectBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  modalActions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  requestBackupBtn: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  requestBackupText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },

  // Placeholder
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
});

export default IncidentsScreen;
