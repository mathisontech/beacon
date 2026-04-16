import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type PartnerTab = 'agencies' | 'map_sharing' | 'resources' | 'communications';

interface Agency {
  id: string;
  name: string;
  type: 'fire' | 'police' | 'ems' | 'utility' | 'government' | 'ngo' | 'military';
  jurisdiction: string;
  status: 'active' | 'standby' | 'unavailable';
  contactName: string;
  contactPhone: string;
  availableResources: number;
  lastContact?: string;
}

interface MapSharingSettings {
  agencyId: string;
  agencyName: string;
  shareOurIncidents: boolean;
  shareOurResources: boolean;
  shareOurHazards: boolean;
  receiveTheirIncidents: boolean;
  receiveTheirResources: boolean;
  receiveTheirHazards: boolean;
}

interface SharedResource {
  id: string;
  name: string;
  type: string;
  ownerAgency: string;
  status: 'available' | 'deployed' | 'requested' | 'en_route';
  location?: string;
  eta?: string;
}

interface AgencyMessage {
  id: string;
  agencyName: string;
  agencyType: Agency['type'];
  subject: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  priority: 'urgent' | 'normal' | 'low';
}

// Mock data
const mockAgencies: Agency[] = [
  { id: '1', name: 'County Fire Department', type: 'fire', jurisdiction: 'County', status: 'active', contactName: 'Chief Williams', contactPhone: '555-0101', availableResources: 12, lastContact: '10 min ago' },
  { id: '2', name: 'State Police', type: 'police', jurisdiction: 'State', status: 'active', contactName: 'Captain Rodriguez', contactPhone: '555-0102', availableResources: 20, lastContact: '5 min ago' },
  { id: '3', name: 'Regional EMS', type: 'ems', jurisdiction: 'Regional', status: 'active', contactName: 'Director Chen', contactPhone: '555-0103', availableResources: 8, lastContact: '30 min ago' },
  { id: '4', name: 'National Guard', type: 'military', jurisdiction: 'State', status: 'standby', contactName: 'Col. Thompson', contactPhone: '555-0104', availableResources: 50, lastContact: '2 hr ago' },
  { id: '5', name: 'Power Company', type: 'utility', jurisdiction: 'Regional', status: 'active', contactName: 'Ops Manager Davis', contactPhone: '555-0105', availableResources: 15, lastContact: '1 hr ago' },
  { id: '6', name: 'Red Cross', type: 'ngo', jurisdiction: 'National', status: 'active', contactName: 'Coordinator Smith', contactPhone: '555-0106', availableResources: 30, lastContact: '45 min ago' },
  { id: '7', name: "Mayor's Office", type: 'government', jurisdiction: 'City', status: 'active', contactName: 'Emergency Mgr Johnson', contactPhone: '555-0107', availableResources: 0, lastContact: '15 min ago' },
  { id: '8', name: 'County EOC', type: 'government', jurisdiction: 'County', status: 'active', contactName: 'Director Lee', contactPhone: '555-0108', availableResources: 5, lastContact: '20 min ago' },
];

const mockMapSharing: MapSharingSettings[] = [
  { agencyId: '1', agencyName: 'County Fire Department', shareOurIncidents: true, shareOurResources: true, shareOurHazards: true, receiveTheirIncidents: true, receiveTheirResources: true, receiveTheirHazards: true },
  { agencyId: '2', agencyName: 'State Police', shareOurIncidents: true, shareOurResources: false, shareOurHazards: true, receiveTheirIncidents: true, receiveTheirResources: true, receiveTheirHazards: false },
  { agencyId: '3', agencyName: 'Regional EMS', shareOurIncidents: true, shareOurResources: true, shareOurHazards: true, receiveTheirIncidents: true, receiveTheirResources: true, receiveTheirHazards: true },
  { agencyId: '5', agencyName: 'Power Company', shareOurIncidents: false, shareOurResources: false, shareOurHazards: true, receiveTheirIncidents: false, receiveTheirResources: false, receiveTheirHazards: true },
];

const mockSharedResources: SharedResource[] = [
  { id: '1', name: 'Engine 15', type: 'Fire', ownerAgency: 'County Fire Department', status: 'en_route', eta: '12 min' },
  { id: '2', name: 'Unit 45', type: 'Police', ownerAgency: 'State Police', status: 'available', location: 'Staging Area A' },
  { id: '3', name: 'Medic 12', type: 'EMS', ownerAgency: 'Regional EMS', status: 'deployed', location: 'Main St Incident' },
  { id: '4', name: 'Utility Crew 3', type: 'Utility', ownerAgency: 'Power Company', status: 'requested' },
  { id: '5', name: 'Shelter Team Alpha', type: 'NGO', ownerAgency: 'Red Cross', status: 'available', location: 'Community Center' },
  { id: '6', name: 'Humvee Unit 2', type: 'Military', ownerAgency: 'National Guard', status: 'available', location: 'Armory' },
];

const mockAgencyMessages: AgencyMessage[] = [
  { id: '1', agencyName: "Mayor's Office", agencyType: 'government', subject: 'Press Conference Update', preview: 'Need latest casualty and shelter numbers for 4pm press conference.', timestamp: '5 min', unread: true, priority: 'urgent' },
  { id: '2', agencyName: 'County Fire Department', agencyType: 'fire', subject: 'Resource Request', preview: 'Requesting 2 additional engines for Main St fire.', timestamp: '15 min', unread: true, priority: 'urgent' },
  { id: '3', agencyName: 'Red Cross', agencyType: 'ngo', subject: 'Shelter Status', preview: 'Lincoln High at 80% capacity. Opening overflow at Riverside Church.', timestamp: '30 min', unread: false, priority: 'normal' },
  { id: '4', agencyName: 'State Police', agencyType: 'police', subject: 'Road Closure Update', preview: 'Highway 101 southbound closed at mile marker 45.', timestamp: '1 hr', unread: false, priority: 'normal' },
  { id: '5', agencyName: 'Power Company', agencyType: 'utility', subject: 'Restoration ETA', preview: 'Zone B power restoration estimated 6pm. Zone C by 9pm.', timestamp: '2 hr', unread: false, priority: 'low' },
];

const getAgencyTypeColor = (type: Agency['type']) => {
  switch (type) {
    case 'fire': return '#dc2626';
    case 'police': return '#2563eb';
    case 'ems': return '#059669';
    case 'utility': return '#d97706';
    case 'government': return '#7c3aed';
    case 'ngo': return '#db2777';
    case 'military': return '#4b5563';
  }
};

const getAgencyTypeLabel = (type: Agency['type']) => {
  switch (type) {
    case 'fire': return 'FIRE';
    case 'police': return 'POLICE';
    case 'ems': return 'EMS';
    case 'utility': return 'UTILITY';
    case 'government': return 'GOV';
    case 'ngo': return 'NGO';
    case 'military': return 'MIL';
  }
};

const getStatusColor = (status: Agency['status'] | SharedResource['status']) => {
  switch (status) {
    case 'active':
    case 'available': return colors.status.minor;
    case 'standby':
    case 'requested': return colors.status.moderate;
    case 'deployed':
    case 'en_route': return colors.status.severe;
    case 'unavailable': return colors.status.critical;
    default: return colors.text.muted;
  }
};

export const PartnerAgenciesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>('agencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [mapSharingSettings, setMapSharingSettings] = useState(mockMapSharing);

  const tabs: { key: PartnerTab; label: string }[] = [
    { key: 'agencies', label: 'Partner Agencies' },
    { key: 'map_sharing', label: 'Map Sharing' },
    { key: 'resources', label: 'Shared Resources' },
    { key: 'communications', label: 'Agency Comms' },
  ];

  const filteredAgencies = mockAgencies.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMapSetting = (agencyId: string, setting: keyof MapSharingSettings) => {
    setMapSharingSettings((prev) =>
      prev.map((s) =>
        s.agencyId === agencyId
          ? { ...s, [setting]: !s[setting as keyof typeof s] }
          : s
      )
    );
  };

  const renderAgenciesTab = () => (
    <View style={styles.tabContent}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search agencies..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.splitView}>
        {/* Agency List */}
        <ScrollView style={styles.listPanel} showsVerticalScrollIndicator={false}>
          {filteredAgencies.map((agency) => (
            <TouchableOpacity
              key={agency.id}
              style={[styles.agencyItem, selectedAgency?.id === agency.id && styles.agencyItemSelected]}
              onPress={() => setSelectedAgency(agency)}
            >
              <View style={[styles.agencyTypeBadge, { backgroundColor: getAgencyTypeColor(agency.type) }]}>
                <Text style={styles.agencyTypeText}>{getAgencyTypeLabel(agency.type)}</Text>
              </View>
              <View style={styles.agencyInfo}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                <Text style={styles.agencyJurisdiction}>{agency.jurisdiction}</Text>
              </View>
              <View style={styles.agencyMeta}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(agency.status) }]} />
                <Text style={styles.agencyResources}>{agency.availableResources} units</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Agency Detail */}
        <View style={styles.detailPanel}>
          {selectedAgency ? (
            <View style={styles.agencyDetail}>
              <View style={[styles.detailTypeBadge, { backgroundColor: getAgencyTypeColor(selectedAgency.type) }]}>
                <Text style={styles.detailTypeText}>{getAgencyTypeLabel(selectedAgency.type)}</Text>
              </View>
              <Text style={styles.detailName}>{selectedAgency.name}</Text>
              <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedAgency.status) }]}>
                <Text style={styles.detailStatusText}>{selectedAgency.status.toUpperCase()}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Jurisdiction</Text>
                <Text style={styles.detailValue}>{selectedAgency.jurisdiction}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Primary Contact</Text>
                <Text style={styles.detailValue}>{selectedAgency.contactName}</Text>
                <Text style={styles.detailSubValue}>{selectedAgency.contactPhone}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Available Resources</Text>
                <Text style={styles.detailValue}>{selectedAgency.availableResources} units</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Last Contact</Text>
                <Text style={styles.detailValue}>{selectedAgency.lastContact}</Text>
              </View>

              <View style={styles.detailActions}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Request Resources</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Select an agency to view details</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderMapSharingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.mapSharingHeader}>
        <Text style={styles.mapSharingTitle}>Control what data you share with partner agencies</Text>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mapSharingSettings.map((setting) => (
          <View key={setting.agencyId} style={styles.mapSharingCard}>
            <Text style={styles.mapSharingAgency}>{setting.agencyName}</Text>

            <View style={styles.sharingSection}>
              <Text style={styles.sharingSectionTitle}>We Share With Them</Text>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Incidents</Text>
                <Switch
                  value={setting.shareOurIncidents}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'shareOurIncidents')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.shareOurIncidents ? colors.beacon.primary : colors.text.muted}
                />
              </View>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Resources</Text>
                <Switch
                  value={setting.shareOurResources}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'shareOurResources')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.shareOurResources ? colors.beacon.primary : colors.text.muted}
                />
              </View>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Hazards</Text>
                <Switch
                  value={setting.shareOurHazards}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'shareOurHazards')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.shareOurHazards ? colors.beacon.primary : colors.text.muted}
                />
              </View>
            </View>

            <View style={styles.sharingSection}>
              <Text style={styles.sharingSectionTitle}>We Receive From Them</Text>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Incidents</Text>
                <Switch
                  value={setting.receiveTheirIncidents}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'receiveTheirIncidents')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.receiveTheirIncidents ? colors.beacon.primary : colors.text.muted}
                />
              </View>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Resources</Text>
                <Switch
                  value={setting.receiveTheirResources}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'receiveTheirResources')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.receiveTheirResources ? colors.beacon.primary : colors.text.muted}
                />
              </View>
              <View style={styles.sharingRow}>
                <Text style={styles.sharingLabel}>Hazards</Text>
                <Switch
                  value={setting.receiveTheirHazards}
                  onValueChange={() => toggleMapSetting(setting.agencyId, 'receiveTheirHazards')}
                  trackColor={{ false: colors.background.tertiary, true: colors.beacon.primaryLight }}
                  thumbColor={setting.receiveTheirHazards ? colors.beacon.primary : colors.text.muted}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Add Agency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResourcesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.resourceFilters}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Available</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>En Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Requested</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mockSharedResources.map((resource) => (
          <TouchableOpacity key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              <View style={[styles.resourceStatusBadge, { backgroundColor: getStatusColor(resource.status) }]}>
                <Text style={styles.resourceStatusText}>{resource.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.resourceType}>{resource.type}</Text>
            <Text style={styles.resourceOwner}>From: {resource.ownerAgency}</Text>
            {resource.location && (
              <Text style={styles.resourceLocation}>Location: {resource.location}</Text>
            )}
            {resource.eta && (
              <Text style={styles.resourceEta}>ETA: {resource.eta}</Text>
            )}
            <View style={styles.resourceActions}>
              {resource.status === 'available' && (
                <TouchableOpacity style={styles.resourceActionBtn}>
                  <Text style={styles.resourceActionText}>Request</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.resourceActionBtn}>
                <Text style={styles.resourceActionText}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resourceActionBtn}>
                <Text style={styles.resourceActionText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Request Resources</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Text style={styles.secondaryActionText}>Share Our Resources</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommunicationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.commFilters}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Urgent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Unread</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mockAgencyMessages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[styles.messageCard, message.unread && styles.messageCardUnread]}
          >
            <View style={styles.messageHeader}>
              <View style={[styles.messageTypeBadge, { backgroundColor: getAgencyTypeColor(message.agencyType) }]}>
                <Text style={styles.messageTypeText}>{getAgencyTypeLabel(message.agencyType)}</Text>
              </View>
              <Text style={styles.messageAgency}>{message.agencyName}</Text>
              {message.priority === 'urgent' && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
              <Text style={styles.messageTime}>{message.timestamp}</Text>
            </View>
            <Text style={[styles.messageSubject, message.unread && styles.textBold]}>{message.subject}</Text>
            <Text style={styles.messagePreview} numberOfLines={2}>{message.preview}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ New Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Text style={styles.secondaryActionText}>Broadcast Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {activeTab === 'agencies' && renderAgenciesTab()}
      {activeTab === 'map_sharing' && renderMapSharingTab()}
      {activeTab === 'resources' && renderResourcesTab()}
      {activeTab === 'communications' && renderCommunicationsTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
  },
  tab: {
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
  tabContent: {
    flex: 1,
    padding: spacing.md,
  },

  // Search
  searchContainer: {
    marginBottom: spacing.md,
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

  // Split View
  splitView: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  listPanel: {
    flex: 1,
  },
  detailPanel: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  // Agency Item
  agencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  agencyItemSelected: {
    borderColor: colors.beacon.primary,
  },
  agencyTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  agencyTypeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  agencyJurisdiction: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  agencyMeta: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  agencyResources: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Agency Detail
  agencyDetail: {
    padding: spacing.lg,
  },
  detailTypeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  detailTypeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  detailName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  detailStatusText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  detailSubValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },

  // Buttons
  primaryButton: {
    flex: 1,
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  // List Container
  listContainer: {
    flex: 1,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  secondaryActionText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  // Map Sharing Tab
  mapSharingHeader: {
    marginBottom: spacing.md,
  },
  mapSharingTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  mapSharingCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  mapSharingAgency: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sharingSection: {
    marginBottom: spacing.md,
  },
  sharingSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  sharingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  sharingLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },

  // Resources Tab
  resourceFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.beacon.primary,
    borderColor: colors.beacon.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  resourceCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resourceName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  resourceStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  resourceStatusText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  resourceType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  resourceOwner: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  resourceLocation: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    marginBottom: 2,
  },
  resourceEta: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.status.severe,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  resourceActionBtn: {
    paddingVertical: spacing.xs,
  },
  resourceActionText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Communications Tab
  commFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  messageCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  messageCardUnread: {
    backgroundColor: colors.background.cardElevated,
    borderColor: colors.beacon.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  messageTypeBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  messageTypeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  messageAgency: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: colors.status.critical,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  urgentText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  messageSubject: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  textBold: {
    fontWeight: typography.weights.bold,
  },
  messagePreview: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.4,
  },
});

export default PartnerAgenciesScreen;
