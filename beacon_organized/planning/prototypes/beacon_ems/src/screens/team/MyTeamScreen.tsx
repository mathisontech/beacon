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
import { ResourceUnitsSidebar } from '../../components/dashboard/ResourceUnitsSidebar';
import type { UnitGroup } from '../../components/dashboard/ResourceUnitsSidebar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

type TeamTab = 'roster' | 'schedule' | 'assignments' | 'zones';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'on_duty' | 'off_duty' | 'on_call' | 'unavailable';
  unit?: string;
  shiftEnd?: string;
  phone?: string;
  certifications?: string[];
}

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  members: string[];
  unit: string;
}

interface Assignment {
  id: string;
  name: string;
  type: 'incident' | 'patrol' | 'standby' | 'special';
  assignedTeam: string[];
  location: string;
  status: 'active' | 'pending' | 'completed';
  startTime: string;
}

interface Zone {
  id: string;
  name: string;
  coverage: 'adequate' | 'low' | 'none';
  assignedUnits: string[];
  priority: 'high' | 'medium' | 'low';
}

// Mock data
const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Martinez', role: 'Captain', status: 'on_duty', unit: 'Engine 7', shiftEnd: '6:00 PM', certifications: ['EMT-P', 'Hazmat'] },
  { id: '2', name: 'Sarah Chen', role: 'Lieutenant', status: 'on_duty', unit: 'Engine 7', shiftEnd: '6:00 PM', certifications: ['EMT-B'] },
  { id: '3', name: 'Mike Johnson', role: 'Firefighter', status: 'on_duty', unit: 'Ladder 3', shiftEnd: '6:00 PM', certifications: ['EMT-B', 'Rescue'] },
  { id: '4', name: 'Emily Davis', role: 'Paramedic', status: 'on_call', unit: 'Medic 5', certifications: ['EMT-P', 'ACLS'] },
  { id: '5', name: 'Robert Wilson', role: 'Firefighter', status: 'off_duty', certifications: ['EMT-B'] },
  { id: '6', name: 'Lisa Thompson', role: 'Engineer', status: 'on_duty', unit: 'Engine 12', shiftEnd: '6:00 PM', certifications: ['EMT-B', 'Driver'] },
  { id: '7', name: 'David Brown', role: 'Firefighter', status: 'unavailable', certifications: ['EMT-B'] },
  { id: '8', name: 'Jennifer Garcia', role: 'Paramedic', status: 'off_duty', certifications: ['EMT-P', 'PALS'] },
];

const mockShifts: Shift[] = [
  { id: '1', date: 'Today', startTime: '6:00 AM', endTime: '6:00 PM', members: ['1', '2', '3', '6'], unit: 'A Shift' },
  { id: '2', date: 'Tomorrow', startTime: '6:00 AM', endTime: '6:00 PM', members: ['4', '5', '7', '8'], unit: 'B Shift' },
];

const mockAssignments: Assignment[] = [
  { id: '1', name: 'Main St Fire Response', type: 'incident', assignedTeam: ['Engine 7', 'Ladder 3'], location: '1234 Main St', status: 'active', startTime: '2:30 PM' },
  { id: '2', name: 'Downtown Patrol', type: 'patrol', assignedTeam: ['Unit 12'], location: 'Zone A', status: 'active', startTime: '8:00 AM' },
  { id: '3', name: 'Event Standby - Stadium', type: 'standby', assignedTeam: ['Medic 5'], location: 'City Stadium', status: 'pending', startTime: '5:00 PM' },
  { id: '4', name: 'Hurricane Shelter Support', type: 'special', assignedTeam: ['ATV-1', 'ATV-2'], location: 'Lincoln High', status: 'active', startTime: '10:00 AM' },
];

const mockZones: Zone[] = [
  { id: '1', name: 'Zone A - Downtown', coverage: 'adequate', assignedUnits: ['Engine 7', 'Unit 12'], priority: 'high' },
  { id: '2', name: 'Zone B - Residential North', coverage: 'low', assignedUnits: ['Ladder 3'], priority: 'medium' },
  { id: '3', name: 'Zone C - Industrial', coverage: 'adequate', assignedUnits: ['Engine 12', 'Hazmat 1'], priority: 'medium' },
  { id: '4', name: 'Zone D - Coastal', coverage: 'none', assignedUnits: [], priority: 'high' },
  { id: '5', name: 'Zone E - Suburbs', coverage: 'low', assignedUnits: ['Medic 5'], priority: 'low' },
];

// Mock resource units for Buffalo Blizzard response
const mockUnitGroups: UnitGroup[] = [
  {
    id: 'atv-groups',
    name: 'All-Terrain Groups',
    icon: '',
    units: [
      {
        id: 'atv-1',
        name: 'All Terrain Group #1',
        type: 'atv',
        status: 'responding',
        currentIncidentId: 'INC-2024-0847',
        currentIncidentTitle: 'Stranded Motorist',
        statusMessage: 'Elmwood Ave & Forest',
        lastUpdate: '2 min ago',
        currentLocation: 'Delaware Park area',
        isMyTeam: true,
        members: [
          { id: 'atv1-1', name: 'Officer Mike Torres', role: 'Lead' },
          { id: 'atv1-2', name: 'Officer Sarah Chen', role: 'Medic' },
          { id: 'atv1-3', name: 'Deputy Jim Walsh' },
        ],
        incidentQueue: [
          { id: 'INC-2024-0832', title: 'Welfare Check', priority: 'high', eta: '25 min' },
          { id: 'INC-2024-0819', title: 'Stranded Motorist', priority: 'medium', eta: '45 min' },
        ],
      },
      {
        id: 'atv-2',
        name: 'All Terrain Group #2',
        type: 'atv',
        status: 'on_scene',
        currentIncidentId: 'INC-2024-0841',
        currentIncidentTitle: 'Medical Emergency',
        statusMessage: '234 Hertel Ave',
        lastUpdate: '5 min ago',
        currentLocation: '234 Hertel Ave',
        isMyTeam: true,
        members: [
          { id: 'atv2-1', name: 'Sgt. Marcus Johnson', role: 'Lead' },
          { id: 'atv2-2', name: 'Officer Lisa Park' },
        ],
        incidentQueue: [],
      },
    ],
  },
  {
    id: 'ambulances',
    name: 'Ambulance Units',
    icon: '',
    units: [
      {
        id: 'amb-1',
        name: 'Medic 7',
        type: 'ambulance',
        status: 'on_scene',
        currentIncidentId: 'INC-2024-0843',
        currentIncidentTitle: 'Hypothermia',
        statusMessage: 'I-190 Overpass, Niagara St',
        lastUpdate: '1 min ago',
        currentLocation: 'I-190 Overpass',
        isMyTeam: true,
        members: [
          { id: 'amb1-1', name: 'Paramedic Jane Smith', role: 'Lead' },
          { id: 'amb1-2', name: 'EMT Robert Kim' },
        ],
        incidentQueue: [
          { id: 'INC-2024-0856', title: 'Chest Pain', priority: 'critical', eta: '20 min' },
        ],
      },
    ],
  },
  {
    id: 'fire-units',
    name: 'Fire Units',
    icon: '',
    units: [
      {
        id: 'fire-1',
        name: 'Engine 7',
        type: 'fire',
        status: 'on_scene',
        currentIncidentId: 'INC-2024-0836',
        currentIncidentTitle: 'Structure Fire',
        statusMessage: '1234 Main St',
        lastUpdate: '3 min ago',
        currentLocation: '1234 Main St',
        isMyTeam: true,
        members: [
          { id: 'fire1-1', name: 'Capt. Bill Rogers', role: 'Captain' },
          { id: 'fire1-2', name: 'FF Mike Chen' },
          { id: 'fire1-3', name: 'FF David Lee' },
          { id: 'fire1-4', name: 'FF Anna Kowalski' },
        ],
        incidentQueue: [],
      },
      {
        id: 'fire-2',
        name: 'Ladder 3',
        type: 'fire',
        status: 'on_scene',
        currentIncidentId: 'INC-2024-0836',
        currentIncidentTitle: 'Structure Fire',
        statusMessage: '1234 Main St',
        lastUpdate: '5 min ago',
        currentLocation: '1234 Main St',
        isMyTeam: true,
        members: [
          { id: 'fire2-1', name: 'Lt. Frank Garcia', role: 'Lieutenant' },
          { id: 'fire2-2', name: 'FF Steve Miller' },
          { id: 'fire2-3', name: 'FF Tony Rizzo' },
        ],
        incidentQueue: [],
      },
    ],
  },
  {
    id: 'civilian-groups',
    name: 'Civilian Volunteer Groups',
    icon: '',
    units: [
      {
        id: 'civ-1',
        name: 'CERT Team Alpha',
        type: 'civilian',
        status: 'on_scene',
        currentIncidentId: 'INC-2024-0805',
        currentIncidentTitle: 'Welfare Check',
        statusMessage: 'Parkside neighborhood',
        lastUpdate: '7 min ago',
        currentLocation: 'Parkside neighborhood',
        isMyTeam: true,
        members: [
          { id: 'civ1-1', name: 'Mary Thompson', role: 'Team Lead' },
          { id: 'civ1-2', name: 'Bob Wilson' },
          { id: 'civ1-3', name: 'Carol Davis' },
          { id: 'civ1-4', name: 'Jim Patterson' },
          { id: 'civ1-5', name: 'Sue Collins' },
        ],
        incidentQueue: [],
      },
    ],
  },
];

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'on_duty': return colors.status.minor;
    case 'on_call': return colors.status.moderate;
    case 'off_duty': return colors.text.muted;
    case 'unavailable': return colors.status.critical;
  }
};

const getCoverageColor = (coverage: Zone['coverage']) => {
  switch (coverage) {
    case 'adequate': return colors.status.minor;
    case 'low': return colors.status.severe;
    case 'none': return colors.status.critical;
  }
};

const getAssignmentTypeColor = (type: Assignment['type']) => {
  switch (type) {
    case 'incident': return colors.status.critical;
    case 'patrol': return colors.status.moderate;
    case 'standby': return colors.status.minor;
    case 'special': return colors.beacon.primary;
  }
};

export const MyTeamScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TeamTab>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const tabs: { key: TeamTab; label: string }[] = [
    { key: 'roster', label: 'Roster' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'zones', label: 'Zone Coverage' },
  ];

  const filteredMembers = mockTeamMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDutyCount = mockTeamMembers.filter((m) => m.status === 'on_duty').length;
  const onCallCount = mockTeamMembers.filter((m) => m.status === 'on_call').length;

  const renderRosterTab = () => (
    <View style={styles.tabContent}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{onDutyCount}</Text>
          <Text style={styles.statLabel}>On Duty</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{onCallCount}</Text>
          <Text style={styles.statLabel}>On Call</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{mockTeamMembers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search team members..."
          placeholderTextColor={colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Member List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[styles.memberItem, selectedMember?.id === member.id && styles.memberItemSelected]}
            onPress={() => setSelectedMember(member)}
          >
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.status) }]} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <View style={styles.memberMeta}>
              <Text style={[styles.memberStatus, { color: getStatusColor(member.status) }]}>
                {member.status.replace('_', ' ').toUpperCase()}
              </Text>
              {member.unit && <Text style={styles.memberUnit}>{member.unit}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Add Member</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Text style={styles.secondaryActionText}>Upload Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTitle}>Current Week</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mockShifts.map((shift) => (
          <View key={shift.id} style={styles.shiftCard}>
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftDate}>{shift.date}</Text>
              <Text style={styles.shiftUnit}>{shift.unit}</Text>
            </View>
            <Text style={styles.shiftTime}>{shift.startTime} - {shift.endTime}</Text>
            <View style={styles.shiftMembers}>
              {shift.members.map((memberId) => {
                const member = mockTeamMembers.find((m) => m.id === memberId);
                return member ? (
                  <View key={memberId} style={styles.shiftMemberChip}>
                    <Text style={styles.shiftMemberName}>{member.name.split(' ')[0]}</Text>
                  </View>
                ) : null;
              })}
            </View>
            <TouchableOpacity style={styles.editShiftButton}>
              <Text style={styles.editShiftText}>Edit Shift</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Create Shift</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Text style={styles.secondaryActionText}>View Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAssignmentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterChipText, styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Pending</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mockAssignments.map((assignment) => (
          <TouchableOpacity key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <View style={[styles.assignmentTypeBadge, { backgroundColor: getAssignmentTypeColor(assignment.type) }]}>
                <Text style={styles.assignmentTypeText}>{assignment.type.toUpperCase()}</Text>
              </View>
              <Text style={styles.assignmentTime}>{assignment.startTime}</Text>
            </View>
            <Text style={styles.assignmentName}>{assignment.name}</Text>
            <Text style={styles.assignmentLocation}>{assignment.location}</Text>
            <View style={styles.assignmentTeam}>
              {assignment.assignedTeam.map((unit, index) => (
                <Text key={index} style={styles.assignmentUnit}>{unit}</Text>
              ))}
            </View>
            <View style={styles.assignmentActions}>
              <TouchableOpacity style={styles.assignmentActionBtn}>
                <Text style={styles.assignmentActionText}>Reassign</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.assignmentActionBtn}>
                <Text style={styles.assignmentActionText}>Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Create Assignment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderZonesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.zoneSummary}>
        <View style={styles.zoneSummaryItem}>
          <View style={[styles.zoneSummaryDot, { backgroundColor: colors.status.minor }]} />
          <Text style={styles.zoneSummaryText}>
            {mockZones.filter((z) => z.coverage === 'adequate').length} Adequate
          </Text>
        </View>
        <View style={styles.zoneSummaryItem}>
          <View style={[styles.zoneSummaryDot, { backgroundColor: colors.status.severe }]} />
          <Text style={styles.zoneSummaryText}>
            {mockZones.filter((z) => z.coverage === 'low').length} Low
          </Text>
        </View>
        <View style={styles.zoneSummaryItem}>
          <View style={[styles.zoneSummaryDot, { backgroundColor: colors.status.critical }]} />
          <Text style={styles.zoneSummaryText}>
            {mockZones.filter((z) => z.coverage === 'none').length} None
          </Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {mockZones.map((zone) => (
          <TouchableOpacity key={zone.id} style={styles.zoneCard}>
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <View style={[styles.coverageBadge, { backgroundColor: getCoverageColor(zone.coverage) }]}>
                <Text style={styles.coverageText}>{zone.coverage.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.zonePriority}>
              <Text style={styles.zonePriorityLabel}>Priority: </Text>
              <Text style={styles.zonePriorityValue}>{zone.priority.charAt(0).toUpperCase() + zone.priority.slice(1)}</Text>
            </View>
            {zone.assignedUnits.length > 0 ? (
              <View style={styles.zoneUnits}>
                <Text style={styles.zoneUnitsLabel}>Assigned: </Text>
                {zone.assignedUnits.map((unit, index) => (
                  <Text key={index} style={styles.zoneUnitChip}>{unit}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.noUnitsText}>No units assigned</Text>
            )}
            <TouchableOpacity style={styles.assignUnitsButton}>
              <Text style={styles.assignUnitsText}>
                {zone.assignedUnits.length > 0 ? 'Manage Units' : 'Assign Units'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Create Zone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryActionButton}>
          <Text style={styles.secondaryActionText}>Auto-Assign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Desktop layout with resource sidebar
  if (!IS_MOBILE) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.desktopLayout}>
          {/* Resource Units Sidebar */}
          <View style={styles.resourceSidebar}>
            <ResourceUnitsSidebar
              groups={mockUnitGroups}
              onUnitPress={(unit) => console.log('Unit pressed:', unit.id)}
              onIncidentPress={(incident) => console.log('Incident pressed:', incident.id)}
            />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
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
            {activeTab === 'roster' && renderRosterTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'assignments' && renderAssignmentsTab()}
            {activeTab === 'zones' && renderZonesTab()}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Mobile layout
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
      {activeTab === 'roster' && renderRosterTab()}
      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'assignments' && renderAssignmentsTab()}
      {activeTab === 'zones' && renderZonesTab()}
    </SafeAreaView>
  );
};

// Light theme colors for resource sidebar
const sidebarColors = {
  background: '#f8f9fa',
  border: '#e5e7eb',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  resourceSidebar: {
    width: 300,
    backgroundColor: sidebarColors.background,
    borderRightWidth: 1,
    borderRightColor: sidebarColors.border,
  },
  mainContent: {
    flex: 1,
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.beacon.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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

  // List
  listContainer: {
    flex: 1,
  },

  // Member Item
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  memberItemSelected: {
    borderColor: colors.beacon.primary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  memberRole: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  memberMeta: {
    alignItems: 'flex-end',
  },
  memberStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  memberUnit: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
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

  // Schedule Tab
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scheduleTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  uploadButton: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  uploadButtonText: {
    color: colors.beacon.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  shiftCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  shiftDate: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  shiftUnit: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  shiftTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  shiftMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  shiftMemberChip: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  shiftMemberName: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  editShiftButton: {
    alignSelf: 'flex-start',
  },
  editShiftText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Assignments Tab
  filterRow: {
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
  assignmentCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  assignmentTypeBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  assignmentTypeText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  assignmentTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  assignmentName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  assignmentLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  assignmentTeam: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  assignmentUnit: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    backgroundColor: colors.beacon.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  assignmentActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.sm,
  },
  assignmentActionBtn: {
    paddingVertical: spacing.xs,
  },
  assignmentActionText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Zones Tab
  zoneSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  zoneSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  zoneSummaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  zoneSummaryText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  zoneCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  zoneName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  coverageBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  coverageText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  zonePriority: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  zonePriorityLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  zonePriorityValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  zoneUnits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  zoneUnitsLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  zoneUnitChip: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    backgroundColor: colors.beacon.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  noUnitsText: {
    fontSize: typography.sizes.sm,
    color: colors.status.critical,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  assignUnitsButton: {
    alignSelf: 'flex-start',
  },
  assignUnitsText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
});

export default MyTeamScreen;
