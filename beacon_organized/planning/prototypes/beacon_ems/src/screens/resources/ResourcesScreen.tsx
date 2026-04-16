import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

type ResourceTab = 'all' | 'mutual_aid' | 'off_duty' | 'civilian';

interface Resource {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'deployed' | 'unavailable' | 'standby';
  location?: string;
  personnel?: number;
  certifications?: string[];
}

interface MutualAidAgreement {
  id: string;
  organization: string;
  type: string;
  availableUnits: number;
  status: 'active' | 'pending' | 'expired';
  lastActivated?: string;
}

// Mock data
const mockResources: Resource[] = [
  { id: '1', name: 'Engine 7', type: 'Fire', status: 'available', location: 'Station 4', personnel: 4 },
  { id: '2', name: 'Engine 12', type: 'Fire', status: 'deployed', location: 'Main St Fire', personnel: 4 },
  { id: '3', name: 'Ladder 3', type: 'Fire', status: 'available', location: 'Station 2', personnel: 3 },
  { id: '4', name: 'Rescue 1', type: 'Fire', status: 'deployed', location: 'Hwy 101 MVA', personnel: 2 },
  { id: '5', name: 'Unit 12', type: 'Police', status: 'deployed', location: 'Main St Fire', personnel: 2 },
  { id: '6', name: 'Unit 15', type: 'Police', status: 'available', location: 'Patrol Zone A', personnel: 2 },
  { id: '7', name: 'Medic 5', type: 'EMS', status: 'deployed', location: 'Hwy 101 MVA', personnel: 2 },
  { id: '8', name: 'Medic 8', type: 'EMS', status: 'available', location: 'Station 3', personnel: 2 },
  { id: '9', name: 'ATV-1', type: 'Utility', status: 'available', location: 'Base', personnel: 1 },
  { id: '10', name: 'ATV-2', type: 'Utility', status: 'standby', location: 'Base', personnel: 1 },
];

const mockMutualAid: MutualAidAgreement[] = [
  { id: '1', organization: 'County Fire Department', type: 'Fire', availableUnits: 12, status: 'active' },
  { id: '2', organization: 'State Police', type: 'Police', availableUnits: 20, status: 'active' },
  { id: '3', organization: 'National Guard', type: 'Military', availableUnits: 50, status: 'pending' },
  { id: '4', organization: 'Regional EMS', type: 'EMS', availableUnits: 8, status: 'active' },
];

const getStatusColor = (status: Resource['status']) => {
  switch (status) {
    case 'available': return colors.status.minor;
    case 'deployed': return colors.status.severe;
    case 'unavailable': return colors.status.critical;
    case 'standby': return colors.status.moderate;
  }
};

export const ResourcesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResourceTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const tabs: { key: ResourceTab; label: string }[] = [
    { key: 'all', label: 'All Resources' },
    { key: 'mutual_aid', label: 'Mutual Aid' },
    { key: 'off_duty', label: 'Off-Duty' },
    { key: 'civilian', label: 'Civilian Groups' },
  ];

  const filteredResources = mockResources.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderResourceItem = (resource: Resource) => (
    <TouchableOpacity
      key={resource.id}
      style={[styles.resourceItem, selectedResource?.id === resource.id && styles.resourceItemSelected]}
      onPress={() => setSelectedResource(resource)}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(resource.status) }]} />
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceName}>{resource.name}</Text>
        <Text style={styles.resourceType}>{resource.type}</Text>
      </View>
      <View style={styles.resourceMeta}>
        <Text style={[styles.resourceStatus, { color: getStatusColor(resource.status) }]}>
          {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
        </Text>
        {resource.location && (
          <Text style={styles.resourceLocation}>{resource.location}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMutualAidItem = (agreement: MutualAidAgreement) => (
    <TouchableOpacity key={agreement.id} style={styles.mutualAidItem}>
      <View style={styles.mutualAidHeader}>
        <Text style={styles.mutualAidOrg}>{agreement.organization}</Text>
        <View style={[styles.statusBadge, agreement.status === 'active' ? styles.statusActive : styles.statusPending]}>
          <Text style={styles.statusBadgeText}>{agreement.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.mutualAidDetails}>
        <Text style={styles.mutualAidType}>{agreement.type}</Text>
        <Text style={styles.mutualAidUnits}>{agreement.availableUnits} units available</Text>
      </View>
      <View style={styles.mutualAidActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Request Resources</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDetailPanel = () => {
    if (!selectedResource) {
      return (
        <View style={styles.detailPlaceholder}>
          <Text style={styles.detailPlaceholderText}>Select a resource to view details</Text>
        </View>
      );
    }

    return (
      <View style={styles.detailPanel}>
        <Text style={styles.detailTitle}>{selectedResource.name}</Text>
        <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedResource.status) }]}>
          <Text style={styles.detailStatusText}>{selectedResource.status.toUpperCase()}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{selectedResource.type}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{selectedResource.location || 'Unknown'}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Personnel</Text>
          <Text style={styles.detailValue}>{selectedResource.personnel || 0}</Text>
        </View>

        <View style={styles.detailActions}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Deploy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Track</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      <View style={styles.content}>
        {/* Resource List */}
        <View style={styles.listPanel}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView style={styles.resourceList} showsVerticalScrollIndicator={false}>
            {activeTab === 'mutual_aid' ? (
              mockMutualAid.map(renderMutualAidItem)
            ) : (
              filteredResources.map(renderResourceItem)
            )}
          </ScrollView>
        </View>

        {/* Detail Panel */}
        <View style={styles.detailPanelContainer}>
          {renderDetailPanel()}
        </View>
      </View>
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  listPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  resourceList: {
    flex: 1,
    padding: spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resourceItemSelected: {
    borderWidth: 1,
    borderColor: colors.beacon.primary,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  resourceType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  resourceMeta: {
    alignItems: 'flex-end',
  },
  resourceStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  resourceLocation: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  mutualAidItem: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mutualAidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mutualAidOrg: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusActive: {
    backgroundColor: colors.status.minor,
  },
  statusPending: {
    backgroundColor: colors.status.severe,
  },
  statusBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  mutualAidDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mutualAidType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  mutualAidUnits: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  mutualAidActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  detailPanelContainer: {
    flex: 1,
    padding: spacing.md,
  },
  detailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailPlaceholderText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
  detailPanel: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  detailTitle: {
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
    color: colors.white,
    fontSize: typography.sizes.xs,
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
  detailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

export default ResourcesScreen;
