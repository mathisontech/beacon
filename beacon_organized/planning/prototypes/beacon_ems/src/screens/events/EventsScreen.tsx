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
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type EventTab = 'active' | 'monitoring' | 'archived';

interface EventIncident {
  id: string;
  title: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'contained' | 'resolved';
}

interface AffectedArea {
  id: string;
  name: string;
  type: 'zone' | 'neighborhood' | 'district' | 'county';
  population?: number;
  evacuationStatus?: 'none' | 'voluntary' | 'mandatory' | 'complete';
}

interface RegionalEvent {
  id: string;
  name: string;
  type: 'hurricane' | 'wildfire' | 'flood' | 'earthquake' | 'tornado' | 'winter_storm' | 'civil_emergency' | 'hazmat' | 'mass_casualty' | 'other';
  severity: 'catastrophic' | 'major' | 'moderate' | 'minor';
  status: 'active' | 'monitoring' | 'recovery' | 'closed';
  startDate: string;
  endDate?: string;
  description: string;
  incidentCount: number;
  incidents: EventIncident[];
  affectedAreas: AffectedArea[];
  evacuationCount?: number;
  shelterCount?: number;
  resourcesDeployed: number;
  partnersInvolved: string[];
  lastUpdate: string;
}

// Mock data
const mockEvents: RegionalEvent[] = [
  {
    id: 'evt-1',
    name: 'Hurricane Maria',
    type: 'hurricane',
    severity: 'major',
    status: 'active',
    startDate: '2024-01-15 06:00',
    description: 'Category 2 hurricane making landfall. Widespread flooding expected in coastal and low-lying areas. Multiple evacuations in progress.',
    incidentCount: 47,
    incidents: [
      { id: 'i1', title: 'Structure Fire - 1234 Main St', urgency: 'critical', status: 'active' },
      { id: 'i2', title: 'Water Rescue - Flood Zone C', urgency: 'critical', status: 'active' },
      { id: 'i3', title: 'MVA with Injuries - Hwy 101', urgency: 'high', status: 'active' },
      { id: 'i4', title: 'Power Line Down - Cedar Rd', urgency: 'medium', status: 'contained' },
    ],
    affectedAreas: [
      { id: 'a1', name: 'Coastal Zone A', type: 'zone', population: 15000, evacuationStatus: 'mandatory' },
      { id: 'a2', name: 'Flood Zone C', type: 'zone', population: 8500, evacuationStatus: 'mandatory' },
      { id: 'a3', name: 'Flood Zone D', type: 'zone', population: 12000, evacuationStatus: 'voluntary' },
      { id: 'a4', name: 'Downtown District', type: 'district', population: 25000, evacuationStatus: 'none' },
    ],
    evacuationCount: 23500,
    shelterCount: 4,
    resourcesDeployed: 156,
    partnersInvolved: ['County Fire', 'State Police', 'National Guard', 'Red Cross', 'FEMA', 'Coast Guard'],
    lastUpdate: '5 min ago',
  },
  {
    id: 'evt-2',
    name: 'Industrial Chemical Spill',
    type: 'hazmat',
    severity: 'moderate',
    status: 'active',
    startDate: '2024-01-16 14:30',
    description: 'Chemical release at industrial facility. Shelter-in-place order for 1-mile radius. Hazmat teams on scene.',
    incidentCount: 8,
    incidents: [
      { id: 'i5', title: 'Hazmat Response - Industrial Park', urgency: 'critical', status: 'active' },
      { id: 'i6', title: 'Medical - Chemical Exposure x3', urgency: 'high', status: 'active' },
    ],
    affectedAreas: [
      { id: 'a5', name: 'Industrial Park', type: 'zone', population: 500, evacuationStatus: 'mandatory' },
      { id: 'a6', name: 'Riverside Neighborhood', type: 'neighborhood', population: 3200, evacuationStatus: 'voluntary' },
    ],
    evacuationCount: 500,
    shelterCount: 1,
    resourcesDeployed: 34,
    partnersInvolved: ['Regional Hazmat', 'EPA', 'County Health'],
    lastUpdate: '12 min ago',
  },
  {
    id: 'evt-3',
    name: 'Tropical Storm Watch',
    type: 'hurricane',
    severity: 'minor',
    status: 'monitoring',
    startDate: '2024-01-18 00:00',
    description: 'Tropical storm developing offshore. Expected to reach area in 48-72 hours. Monitoring conditions.',
    incidentCount: 0,
    incidents: [],
    affectedAreas: [
      { id: 'a7', name: 'Entire County', type: 'county', population: 250000, evacuationStatus: 'none' },
    ],
    resourcesDeployed: 0,
    partnersInvolved: ['NWS', 'County EOC'],
    lastUpdate: '1 hr ago',
  },
  {
    id: 'evt-4',
    name: 'Winter Storm December',
    type: 'winter_storm',
    severity: 'moderate',
    status: 'closed',
    startDate: '2023-12-20 18:00',
    endDate: '2023-12-22 12:00',
    description: 'Major winter storm with 18 inches of snow. All roads cleared, power restored.',
    incidentCount: 23,
    incidents: [],
    affectedAreas: [],
    evacuationCount: 0,
    shelterCount: 2,
    resourcesDeployed: 0,
    partnersInvolved: ['DOT', 'Power Company', 'Red Cross'],
    lastUpdate: '4 weeks ago',
  },
];

const getEventTypeIcon = (type: RegionalEvent['type']) => {
  switch (type) {
    case 'hurricane': return '🌀';
    case 'wildfire': return '🔥';
    case 'flood': return '🌊';
    case 'earthquake': return '🌋';
    case 'tornado': return '🌪️';
    case 'winter_storm': return '❄️';
    case 'civil_emergency': return '⚠️';
    case 'hazmat': return '☣️';
    case 'mass_casualty': return '🚨';
    case 'other': return '📋';
  }
};

const getEventTypeLabel = (type: RegionalEvent['type']) => {
  switch (type) {
    case 'hurricane': return 'Hurricane';
    case 'wildfire': return 'Wildfire';
    case 'flood': return 'Flood';
    case 'earthquake': return 'Earthquake';
    case 'tornado': return 'Tornado';
    case 'winter_storm': return 'Winter Storm';
    case 'civil_emergency': return 'Civil Emergency';
    case 'hazmat': return 'Hazmat';
    case 'mass_casualty': return 'Mass Casualty';
    case 'other': return 'Other';
  }
};

const getSeverityColor = (severity: RegionalEvent['severity']) => {
  switch (severity) {
    case 'catastrophic': return colors.status.critical;
    case 'major': return colors.status.severe;
    case 'moderate': return colors.status.moderate;
    case 'minor': return colors.status.minor;
  }
};

const getStatusColor = (status: RegionalEvent['status']) => {
  switch (status) {
    case 'active': return colors.status.critical;
    case 'monitoring': return colors.status.moderate;
    case 'recovery': return colors.status.severe;
    case 'closed': return colors.status.minor;
  }
};

const getEvacuationStatusColor = (status: AffectedArea['evacuationStatus']) => {
  switch (status) {
    case 'mandatory': return colors.status.critical;
    case 'voluntary': return colors.status.severe;
    case 'complete': return colors.status.minor;
    default: return colors.text.muted;
  }
};

export const EventsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EventTab>('active');
  const [selectedEvent, setSelectedEvent] = useState<RegionalEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const tabs: { key: EventTab; label: string; count?: number }[] = [
    { key: 'active', label: 'Active', count: mockEvents.filter(e => e.status === 'active').length },
    { key: 'monitoring', label: 'Monitoring', count: mockEvents.filter(e => e.status === 'monitoring').length },
    { key: 'archived', label: 'Archived', count: mockEvents.filter(e => e.status === 'closed' || e.status === 'recovery').length },
  ];

  const filteredEvents = mockEvents.filter(event => {
    if (activeTab === 'active') return event.status === 'active';
    if (activeTab === 'monitoring') return event.status === 'monitoring';
    if (activeTab === 'archived') return event.status === 'closed' || event.status === 'recovery';
    return true;
  });

  const handleEventPress = (event: RegionalEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const renderEventCard = (event: RegionalEvent) => {
    const criticalIncidents = event.incidents.filter(i => i.urgency === 'critical').length;
    const mandatoryEvacAreas = event.affectedAreas.filter(a => a.evacuationStatus === 'mandatory').length;

    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => handleEventPress(event)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
            <View>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventType}>{getEventTypeLabel(event.type)}</Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) }]}>
              <Text style={styles.severityText}>{event.severity.toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
              <Text style={styles.statusText}>{event.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.incidentCount}</Text>
            <Text style={styles.statLabel}>Incidents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.affectedAreas.length}</Text>
            <Text style={styles.statLabel}>Areas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.resourcesDeployed}</Text>
            <Text style={styles.statLabel}>Resources</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{event.partnersInvolved.length}</Text>
            <Text style={styles.statLabel}>Partners</Text>
          </View>
        </View>

        {/* Alerts */}
        {(criticalIncidents > 0 || mandatoryEvacAreas > 0) && (
          <View style={styles.alertsRow}>
            {criticalIncidents > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertText}>{criticalIncidents} Critical Incidents</Text>
              </View>
            )}
            {mandatoryEvacAreas > 0 && (
              <View style={[styles.alertBadge, styles.evacBadge]}>
                <Text style={styles.alertText}>{mandatoryEvacAreas} Mandatory Evac Zones</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.startDate}>Started: {event.startDate}</Text>
          <Text style={styles.lastUpdate}>Updated {event.lastUpdate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedEvent) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.modalBackText}>← Back</Text>
            </TouchableOpacity>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedEvent.status) }]}>
              <Text style={styles.statusText}>{selectedEvent.status.toUpperCase()}</Text>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Event Title */}
            <View style={styles.modalTitleSection}>
              <Text style={styles.modalIcon}>{getEventTypeIcon(selectedEvent.type)}</Text>
              <View>
                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                <View style={styles.modalTitleMeta}>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(selectedEvent.severity) }]}>
                    <Text style={styles.severityText}>{selectedEvent.severity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.modalTypeText}>{getEventTypeLabel(selectedEvent.type)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Description</Text>
              <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Overview</Text>
              <View style={styles.quickStatsGrid}>
                <View style={styles.quickStatCard}>
                  <Text style={styles.quickStatValue}>{selectedEvent.incidentCount}</Text>
                  <Text style={styles.quickStatLabel}>Total Incidents</Text>
                </View>
                <View style={styles.quickStatCard}>
                  <Text style={styles.quickStatValue}>{selectedEvent.resourcesDeployed}</Text>
                  <Text style={styles.quickStatLabel}>Resources Deployed</Text>
                </View>
                {selectedEvent.evacuationCount !== undefined && (
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatValue}>{selectedEvent.evacuationCount.toLocaleString()}</Text>
                    <Text style={styles.quickStatLabel}>People Evacuated</Text>
                  </View>
                )}
                {selectedEvent.shelterCount !== undefined && (
                  <View style={styles.quickStatCard}>
                    <Text style={styles.quickStatValue}>{selectedEvent.shelterCount}</Text>
                    <Text style={styles.quickStatLabel}>Shelters Open</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Affected Areas */}
            {selectedEvent.affectedAreas.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Affected Areas</Text>
                {selectedEvent.affectedAreas.map((area) => (
                  <View key={area.id} style={styles.areaItem}>
                    <View style={styles.areaInfo}>
                      <Text style={styles.areaName}>{area.name}</Text>
                      <Text style={styles.areaMeta}>
                        {area.type.charAt(0).toUpperCase() + area.type.slice(1)}
                        {area.population && ` • ${area.population.toLocaleString()} residents`}
                      </Text>
                    </View>
                    {area.evacuationStatus && area.evacuationStatus !== 'none' && (
                      <View style={[styles.evacStatusBadge, { backgroundColor: getEvacuationStatusColor(area.evacuationStatus) }]}>
                        <Text style={styles.evacStatusText}>
                          {area.evacuationStatus === 'mandatory' ? 'MANDATORY EVAC' :
                           area.evacuationStatus === 'voluntary' ? 'VOLUNTARY EVAC' :
                           'EVAC COMPLETE'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Active Incidents */}
            {selectedEvent.incidents.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Active Incidents ({selectedEvent.incidents.length})</Text>
                {selectedEvent.incidents.map((incident) => (
                  <View key={incident.id} style={styles.incidentItem}>
                    <View style={[styles.urgencyDot, {
                      backgroundColor: incident.urgency === 'critical' ? colors.status.critical :
                                       incident.urgency === 'high' ? colors.status.severe :
                                       incident.urgency === 'medium' ? colors.status.moderate :
                                       colors.status.minor
                    }]} />
                    <Text style={styles.incidentTitle}>{incident.title}</Text>
                    <Text style={[styles.incidentStatus, {
                      color: incident.status === 'active' ? colors.status.critical :
                             incident.status === 'contained' ? colors.status.severe :
                             colors.status.minor
                    }]}>
                      {incident.status.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Partners */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Partners Involved</Text>
              <View style={styles.partnersGrid}>
                {selectedEvent.partnersInvolved.map((partner, index) => (
                  <View key={index} style={styles.partnerChip}>
                    <Text style={styles.partnerText}>{partner}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Timeline</Text>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <Text style={styles.timelineText}>Event started: {selectedEvent.startDate}</Text>
              </View>
              {selectedEvent.endDate && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotEnd]} />
                  <Text style={styles.timelineText}>Event ended: {selectedEvent.endDate}</Text>
                </View>
              )}
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotUpdate]} />
                <Text style={styles.timelineText}>Last update: {selectedEvent.lastUpdate}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {selectedEvent.status === 'active' && (
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View All Incidents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
                <Text style={[styles.actionButtonText, styles.primaryActionText]}>Open Command Center</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
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
      </View>

      {/* Events List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'active' ? '✓' : activeTab === 'monitoring' ? '👁️' : '📁'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'No active events' :
               activeTab === 'monitoring' ? 'No events being monitored' :
               'No archived events'}
            </Text>
          </View>
        ) : (
          filteredEvents.map(renderEventCard)
        )}
      </ScrollView>

      {renderDetailModal()}
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
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.beacon.primary,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.beacon.primary,
    fontWeight: typography.weights.semibold,
  },
  tabBadge: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  tabBadgeActive: {
    backgroundColor: colors.beacon.primary,
  },
  tabBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },

  // Event Card
  eventCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  eventIcon: {
    fontSize: 32,
  },
  eventName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  eventType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  eventDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  alertsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  alertBadge: {
    backgroundColor: colors.status.criticalLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.status.critical,
  },
  evacBadge: {
    backgroundColor: colors.status.severeLight,
    borderColor: colors.status.severe,
  },
  alertText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.status.critical,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
  },
  startDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  lastUpdate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  modalBackText: {
    fontSize: typography.sizes.md,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalTitleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalTypeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  modalSection: {
    marginBottom: spacing.xl,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  quickStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  areaInfo: {
    flex: 1,
  },
  areaName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  areaMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  evacStatusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  evacStatusText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  incidentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  incidentTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  incidentStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  partnerChip: {
    backgroundColor: colors.beacon.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  partnerText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.beacon.primary,
  },
  timelineDotEnd: {
    backgroundColor: colors.status.minor,
  },
  timelineDotUpdate: {
    backgroundColor: colors.status.moderate,
  },
  timelineText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  primaryActionButton: {
    backgroundColor: colors.beacon.primary,
    borderColor: colors.beacon.primary,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  primaryActionText: {
    color: colors.white,
  },
});

export default EventsScreen;
