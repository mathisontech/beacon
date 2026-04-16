import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

type MissingPersonStatus = 'active' | 'found' | 'resolved' | 'closed';
type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  lastSeenLocation: string;
  lastSeenTime: string;
  reportedAt: string;
  reportedBy: string;
  status: MissingPersonStatus;
  priority: PriorityLevel;
  photo?: string;
  contactInfo?: string;
  notes?: string;
  assignedUnits?: string[];
  searchArea?: string;
}

// Mock data
const mockMissingPersons: MissingPerson[] = [
  {
    id: 'mp-1',
    name: 'Eleanor Thompson',
    age: 78,
    gender: 'Female',
    description: 'White female, gray hair, approximately 5\'4", wearing a blue coat and white sneakers. Has dementia.',
    lastSeenLocation: '456 Delaware Ave, near Parkside',
    lastSeenTime: '2:30 PM Today',
    reportedAt: '3:15 PM Today',
    reportedBy: 'Family Member',
    status: 'active',
    priority: 'critical',
    contactInfo: '(716) 555-0123',
    notes: 'Subject has Alzheimer\'s disease. May be confused and disoriented. Often talks about going to "the old house".',
    assignedUnits: ['CERT Team Alpha', 'ATG #1'],
    searchArea: 'Delaware Park and Parkside neighborhood',
  },
  {
    id: 'mp-2',
    name: 'Marcus Williams',
    age: 16,
    gender: 'Male',
    description: 'Black male, 5\'10", athletic build, black hair, last seen wearing red hoodie and jeans.',
    lastSeenLocation: 'Canisius High School area',
    lastSeenTime: '4:00 PM Yesterday',
    reportedAt: '8:00 PM Yesterday',
    reportedBy: 'School Administration',
    status: 'active',
    priority: 'high',
    contactInfo: '(716) 555-0456',
    notes: 'Left school without notice. Phone is turned off. Known to frequent Elmwood Village area.',
    assignedUnits: ['Unit 15'],
    searchArea: 'Elmwood Village, Delaware District',
  },
  {
    id: 'mp-3',
    name: 'Sarah Chen',
    age: 34,
    gender: 'Female',
    description: 'Asian female, 5\'6", long black hair, wearing winter jacket.',
    lastSeenLocation: 'Hertel Ave shopping district',
    lastSeenTime: '11:00 AM Yesterday',
    reportedAt: '6:00 PM Yesterday',
    reportedBy: 'Spouse',
    status: 'found',
    priority: 'medium',
    notes: 'Located at friend\'s house. No foul play suspected.',
  },
  {
    id: 'mp-4',
    name: 'Robert Miller',
    age: 65,
    gender: 'Male',
    description: 'White male, bald, 6\'1", wearing brown jacket and khaki pants.',
    lastSeenLocation: 'ECMC Hospital area',
    lastSeenTime: '9:00 AM Today',
    reportedAt: '11:30 AM Today',
    reportedBy: 'Hospital Staff',
    status: 'active',
    priority: 'high',
    contactInfo: '(716) 555-0789',
    notes: 'Patient left hospital against medical advice. Has diabetes and may need medication.',
    assignedUnits: ['Medic 7'],
    searchArea: 'Grider St corridor, Broadway-Fillmore',
  },
];

const statusColors: Record<MissingPersonStatus, string> = {
  active: '#ef4444',
  found: '#22c55e',
  resolved: '#3b82f6',
  closed: '#6b7280',
};

const priorityColors: Record<PriorityLevel, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

const getStatusLabel = (status: MissingPersonStatus) => {
  switch (status) {
    case 'active': return 'ACTIVE SEARCH';
    case 'found': return 'FOUND';
    case 'resolved': return 'RESOLVED';
    case 'closed': return 'CLOSED';
  }
};

export const MissingPersonsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MissingPersonStatus | 'all'>('all');
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);

  const filteredPersons = mockMissingPersons.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || person.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const activeCount = mockMissingPersons.filter(p => p.status === 'active').length;
  const foundCount = mockMissingPersons.filter(p => p.status === 'found').length;

  const renderPersonCard = (person: MissingPerson) => (
    <TouchableOpacity
      key={person.id}
      style={[
        styles.personCard,
        selectedPerson?.id === person.id && styles.personCardSelected,
      ]}
      onPress={() => setSelectedPerson(person)}
    >
      <View style={styles.personCardHeader}>
        <View style={styles.personCardLeft}>
          <View style={styles.personAvatar}>
            <Text style={styles.personAvatarText}>
              {person.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personDetails}>
              {person.age} yrs • {person.gender}
            </Text>
          </View>
        </View>
        <View style={styles.personCardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[person.status] }]}>
            <Text style={styles.statusBadgeText}>{getStatusLabel(person.status)}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[person.priority] }]}>
            <Text style={styles.priorityBadgeText}>{person.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.personCardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Seen:</Text>
          <Text style={styles.infoValue}>{person.lastSeenLocation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time:</Text>
          <Text style={styles.infoValue}>{person.lastSeenTime}</Text>
        </View>
        {person.assignedUnits && person.assignedUnits.length > 0 && (
          <View style={styles.assignedUnits}>
            {person.assignedUnits.map((unit, index) => (
              <View key={index} style={styles.assignedUnitChip}>
                <Text style={styles.assignedUnitText}>{unit}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailPanel = () => {
    if (!selectedPerson) {
      return (
        <View style={styles.detailPanelEmpty}>
          <Text style={styles.detailPanelEmptyText}>Select a person to view details</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.detailPanel} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <View style={styles.detailAvatar}>
            <Text style={styles.detailAvatarText}>
              {selectedPerson.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.detailHeaderInfo}>
            <Text style={styles.detailName}>{selectedPerson.name}</Text>
            <Text style={styles.detailSubtext}>
              {selectedPerson.age} years old • {selectedPerson.gender}
            </Text>
          </View>
          <View style={[styles.statusBadgeLarge, { backgroundColor: statusColors[selectedPerson.status] }]}>
            <Text style={styles.statusBadgeLargeText}>{getStatusLabel(selectedPerson.status)}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Description</Text>
          <Text style={styles.detailDescription}>{selectedPerson.description}</Text>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Last Known Location</Text>
          <View style={styles.detailInfoBlock}>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Location:</Text>
              <Text style={styles.detailInfoValue}>{selectedPerson.lastSeenLocation}</Text>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Time:</Text>
              <Text style={styles.detailInfoValue}>{selectedPerson.lastSeenTime}</Text>
            </View>
            {selectedPerson.searchArea && (
              <View style={styles.detailInfoRow}>
                <Text style={styles.detailInfoLabel}>Search Area:</Text>
                <Text style={styles.detailInfoValue}>{selectedPerson.searchArea}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>Report Information</Text>
          <View style={styles.detailInfoBlock}>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Reported At:</Text>
              <Text style={styles.detailInfoValue}>{selectedPerson.reportedAt}</Text>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Reported By:</Text>
              <Text style={styles.detailInfoValue}>{selectedPerson.reportedBy}</Text>
            </View>
            {selectedPerson.contactInfo && (
              <View style={styles.detailInfoRow}>
                <Text style={styles.detailInfoLabel}>Contact:</Text>
                <Text style={styles.detailInfoValue}>{selectedPerson.contactInfo}</Text>
              </View>
            )}
          </View>
        </View>

        {selectedPerson.notes && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Notes</Text>
            <Text style={styles.detailNotes}>{selectedPerson.notes}</Text>
          </View>
        )}

        {selectedPerson.assignedUnits && selectedPerson.assignedUnits.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Assigned Units</Text>
            <View style={styles.assignedUnitsDetail}>
              {selectedPerson.assignedUnits.map((unit, index) => (
                <View key={index} style={styles.assignedUnitChipLarge}>
                  <Text style={styles.assignedUnitTextLarge}>{unit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.detailActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Assign Unit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Text style={styles.actionButtonSecondaryText}>Update Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Text style={styles.actionButtonSecondaryText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active Searches</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{foundCount}</Text>
          <Text style={styles.statLabel}>Found Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockMissingPersons.length}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or location..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          {(['all', 'active', 'found', 'resolved', 'closed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Person List */}
        <View style={IS_MOBILE ? styles.listContainerMobile : styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Missing Persons ({filteredPersons.length})</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Report</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.personsList} showsVerticalScrollIndicator={false}>
            {filteredPersons.map(renderPersonCard)}
          </ScrollView>
        </View>

        {/* Detail Panel - Desktop only */}
        {!IS_MOBILE && (
          <View style={styles.detailContainer}>
            {renderDetailPanel()}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.card,
  },
  searchInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.beacon.primary,
    borderColor: colors.beacon.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  listContainer: {
    width: 420,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  listContainerMobile: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.card,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  personsList: {
    flex: 1,
    padding: spacing.sm,
  },
  personCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  personCardSelected: {
    borderColor: colors.beacon.primary,
    borderWidth: 2,
  },
  personCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  personCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.beacon.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personAvatarText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  personDetails: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  personCardRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  personCardBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.tertiary,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.text.muted,
    width: 70,
  },
  infoValue: {
    fontSize: 11,
    color: colors.text.secondary,
    flex: 1,
  },
  assignedUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  assignedUnitChip: {
    backgroundColor: colors.beacon.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  assignedUnitText: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: colors.beacon.primary,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  detailPanelEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  detailPanelEmptyText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  detailPanel: {
    flex: 1,
    padding: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.beacon.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailAvatarText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  detailHeaderInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  detailSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statusBadgeLarge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  statusBadgeLargeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  detailInfoBlock: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  detailInfoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  detailInfoLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text.muted,
    width: 100,
  },
  detailInfoValue: {
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  detailNotes: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 20,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontStyle: 'italic',
  },
  assignedUnitsDetail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  assignedUnitChipLarge: {
    backgroundColor: colors.beacon.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  assignedUnitTextLarge: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.beacon.primary,
  },
  detailActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.lg,
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
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },
});

export default MissingPersonsScreen;
