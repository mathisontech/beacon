import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import type { MainTabParamList, IncidentsStackParamList } from '../../navigation/AppNavigator';
import {
  CollapsibleWidget,
  IncidentStream,
  IncidentClusterSuggestions,
  AlertStream,
  ResourceSummary,
  CommunicationsStream,
  IncidentTriage,
  IncidentRequirementsTable,
} from '../../components/dashboard';
import type {
  IncidentItem,
  IncidentSource,
  IncidentCluster,
  AlertItem,
  ResourceCategory,
  MessagePreview,
  TriageIncident,
} from '../../components/dashboard';
import { DashboardMap } from '../../components/map/DashboardMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

// Mock data
const mockIncidents: IncidentItem[] = [
  {
    id: '1',
    incidentType: 'fire',
    title: 'Structure Fire - 1234 Main St',
    location: '1234 Main St, Downtown',
    timestamp: '2 min ago',
    urgency: 'critical',
    assignmentStatus: 'in_progress',
    source: { type: 'official', groupShorthand: 'BFD', groupColor: '#dc2626', groupName: 'Buffalo Fire Department', role: 'Dispatch' },
    respondingUnits: [
      { id: 'u1', name: 'Engine 7', status: 'on_scene', isMyTeam: true },
      { id: 'u2', name: 'Ladder 3', status: 'on_scene', isMyTeam: true },
      { id: 'u3', name: 'Engine 15', status: 'en_route', eta: '4 min', isBackup: true, agency: 'County Fire', isMyTeam: false },
    ],
    resourceRequests: [
      { type: 'EMS', status: 'dispatched' },
      { type: 'Hazmat', status: 'requested' },
    ],
  },
  {
    id: '2',
    incidentType: 'accident',
    title: 'MVA - Hwy 101 & Oak Ave',
    location: 'Hwy 101 & Oak Ave',
    timestamp: '8 min ago',
    urgency: 'high',
    assignmentStatus: 'in_progress',
    source: { type: 'official', groupShorthand: 'BPD', groupColor: '#2563eb', groupName: 'Buffalo Police Department', role: 'Dispatch' },
    respondingUnits: [
      { id: 'u4', name: 'Rescue 1', status: 'on_scene', isMyTeam: true },
      { id: 'u5', name: 'Medic 5', status: 'on_scene', isMyTeam: true },
      { id: 'u6', name: 'Unit 12', status: 'on_scene', isMyTeam: false, agency: 'State Police' },
    ],
    resourceRequests: [],
  },
  {
    id: '3',
    incidentType: 'medical',
    title: 'Medical - 456 Pine Street',
    location: '456 Pine Street',
    timestamp: '1 min ago',
    urgency: 'medium',
    assignmentStatus: 'unassigned',
    source: { type: 'beacon_auto', groupShorthand: 'BCN', groupColor: '#0097b2', groupName: 'Beacon Automated' },
    respondingUnits: [],
    resourceRequests: [
      { type: 'ALS Unit', status: 'requested' },
    ],
  },
  {
    id: '4',
    incidentType: 'utility',
    title: 'Utility - Power Line Down',
    location: 'Cedar Rd & 5th',
    timestamp: '5 min ago',
    urgency: 'medium',
    assignmentStatus: 'assigned',
    queuePosition: 2,
    queuedForUnit: 'Engine 12',
    source: { type: 'official', groupShorthand: 'BFD', groupColor: '#dc2626', groupName: 'Buffalo Fire Department', role: 'Watch' },
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
    source: { type: 'official', groupShorthand: 'EOC', groupColor: '#7c3aed', groupName: 'County EOC', role: 'Operations' },
    respondingUnits: [
      { id: 'u7', name: 'Rescue 3', status: 'en_route', eta: '6 min', isMyTeam: true },
      { id: 'u8', name: 'Boat 1', status: 'staging', isMyTeam: true },
      { id: 'u9', name: 'Coast Guard', status: 'en_route', eta: '15 min', isBackup: true, agency: 'USCG', isMyTeam: false },
    ],
    resourceRequests: [
      { type: 'Helicopter', status: 'requested' },
    ],
  },
  {
    id: '6',
    incidentType: 'medical',
    title: 'Cardiac - 890 Maple Drive',
    location: '890 Maple Drive',
    timestamp: '3 min ago',
    urgency: 'critical',
    assignmentStatus: 'unassigned',
    source: { type: 'public', groupShorthand: 'CERT', groupColor: '#059669', groupName: 'Community Emergency Response Team', role: 'Admin' },
    respondingUnits: [],
    resourceRequests: [
      { type: 'ALS Unit', status: 'requested' },
      { type: 'First Responders', status: 'requested' },
    ],
  },
  {
    id: '7',
    incidentType: 'other',
    title: 'Welfare Check - 234 Birch Lane',
    location: '234 Birch Lane',
    timestamp: '15 min ago',
    urgency: 'low',
    assignmentStatus: 'assigned',
    queuePosition: 3,
    queuedForUnit: 'Unit 15',
    source: { type: 'public', groupShorthand: 'PUB', groupColor: '#6b7280', groupName: 'Public Report' },
    unreadMessageCount: 0,
    respondingUnits: [],
    resourceRequests: [],
  },
  {
    id: '8',
    incidentType: 'fire',
    title: 'Smoke - 567 Industrial Blvd',
    location: '567 Industrial Blvd',
    timestamp: '7 min ago',
    urgency: 'medium',
    assignmentStatus: 'in_progress',
    source: { type: 'official', groupShorthand: 'EMS', groupColor: '#059669', groupName: 'Emergency Medical Services', role: 'Field' },
    respondingUnits: [
      { id: 'u10', name: 'Engine 12', status: 'en_route', eta: '2 min', isMyTeam: true },
    ],
    resourceRequests: [],
  },
];

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    source: 'nws',
    type: 'warning',
    title: 'Hurricane Warning - Category 2 Expected',
    description: 'Hurricane approaching coastal areas',
    expires: '6:00 PM Today',
    timestamp: '30 min ago',
    severity: 'extreme',
  },
  {
    id: '2',
    source: 'beacon',
    type: 'alert',
    title: 'Flood Risk Elevated - Zones C, D',
    description: 'Low-lying areas at risk',
    timestamp: '1 hr ago',
    severity: 'severe',
  },
  {
    id: '3',
    source: 'nws',
    type: 'watch',
    title: 'Flood Watch',
    description: 'Possible flooding in low areas',
    expires: 'Midnight',
    timestamp: '2 hr ago',
    severity: 'moderate',
  },
];

const mockResources: ResourceCategory[] = [
  { id: '1', name: 'Fire Units', icon: '🚒', available: 8, total: 12, deployed: 4 },
  { id: '2', name: 'Police Units', icon: '🚔', available: 12, total: 15, deployed: 3 },
  { id: '3', name: 'EMS Units', icon: '🚑', available: 5, total: 8, deployed: 3 },
  { id: '4', name: 'ATVs', icon: '🚗', available: 4, total: 4, deployed: 0 },
  { id: '5', name: 'Civilian Groups', icon: '👥', available: 15, total: 20, deployed: 5 },
];

const mockMessages: MessagePreview[] = [
  {
    id: '1',
    senderName: "Mayor's Office",
    senderType: 'stakeholder',
    preview: 'Press conference scheduled for 4pm. Need latest casualty and shelter numbers.',
    timestamp: '2 min',
    unread: true,
  },
  {
    id: '2',
    senderName: 'County EOC',
    senderType: 'stakeholder',
    preview: 'Shelter capacity update: Lincoln High at 80%, need overflow location.',
    timestamp: '15 min',
    unread: true,
  },
  {
    id: '3',
    senderName: 'Red Cross',
    senderType: 'mutual_aid',
    preview: 'Volunteers staged at Community Center. Ready to deploy.',
    timestamp: '1 hr',
    unread: false,
  },
  {
    id: '4',
    senderName: 'Engine 7',
    senderType: 'team',
    preview: 'On scene at Main St. Fire contained, conducting overhaul.',
    timestamp: '2 hr',
    unread: false,
  },
];


// Mock triage incidents for Buffalo Blizzard
const mockTriageIncidents: TriageIncident[] = [
  // CRITICAL - Unreviewed
  {
    id: 'tri-1',
    incidentTypeId: 'cardiac_arrest',
    title: 'Cardiac Arrest - 78 yr male',
    location: '456 Delaware Ave',
    reportedAt: '2:45 PM',
    timeElapsed: '3 min ago',
    source: { type: 'official', name: 'Buffalo EMS', shorthand: 'EMS', color: '#059669' },
    status: 'unreviewed',
    respondingUnits: [],
    notes: 'Bystander CPR in progress',
  },
  // CRITICAL - Under-resourced
  {
    id: 'tri-2',
    incidentTypeId: 'structure_fire',
    title: 'Structure Fire - 1234 Main St',
    location: '1234 Main St, Downtown',
    reportedAt: '2:30 PM',
    timeElapsed: '18 min ago',
    source: { type: 'official', name: 'Buffalo Fire', shorthand: 'BFD', color: '#dc2626' },
    status: 'in_progress',
    respondingUnits: [
      { id: 'ru-1', name: 'Engine 7', type: 'engine', status: 'on_scene', personnel: 4 },
      { id: 'ru-2', name: 'Ladder 3', type: 'ladder', status: 'on_scene', personnel: 3 },
    ],
    notes: 'Need additional engine, ambulance not yet on scene',
  },
  // HIGH - Help far away
  {
    id: 'tri-3',
    incidentTypeId: 'vehicle_entrapment',
    title: 'Vehicle Entrapment - I-90',
    location: 'I-90 Eastbound, Mile Marker 52',
    reportedAt: '2:38 PM',
    timeElapsed: '10 min ago',
    source: { type: 'official', name: 'State Police', shorthand: 'NYSP', color: '#1e40af' },
    status: 'assigned',
    respondingUnits: [
      { id: 'ru-3', name: 'Rescue 1', type: 'rescue', status: 'en_route', eta: '12 min', personnel: 4 },
      { id: 'ru-4', name: 'Medic 12', type: 'ambulance', status: 'en_route', eta: '15 min', personnel: 2 },
    ],
    nearestUnitEta: '12 min',
    notes: 'Heavy snow slowing response',
  },
  // HIGH - Unreviewed
  {
    id: 'tri-4',
    incidentTypeId: 'hypothermia',
    title: 'Hypothermia - Homeless Individual',
    location: 'Under I-190 overpass, Niagara St',
    reportedAt: '2:42 PM',
    timeElapsed: '6 min ago',
    source: { type: 'public', name: 'Public Report', shorthand: 'PUB', color: '#6b7280' },
    status: 'unreviewed',
    respondingUnits: [],
    notes: 'Caller reports person unresponsive',
  },
  // MEDIUM - Under-resourced
  {
    id: 'tri-5',
    incidentTypeId: 'gas_leak',
    title: 'Gas Leak - Residential',
    location: '567 Grant St',
    reportedAt: '2:35 PM',
    timeElapsed: '13 min ago',
    source: { type: 'official', name: 'Buffalo Fire', shorthand: 'BFD', color: '#dc2626' },
    status: 'assigned',
    respondingUnits: [
      { id: 'ru-5', name: 'Power Crew Beta', type: 'utility_crew', status: 'en_route', eta: '8 min', personnel: 3 },
    ],
    nearestUnitEta: '8 min',
    notes: 'Engine unit still needed',
  },
  // MEDIUM - Unreviewed
  {
    id: 'tri-6',
    incidentTypeId: 'stranded_motorist',
    title: 'Stranded Vehicle - Elderly Couple',
    location: 'Elmwood Ave near Forest',
    reportedAt: '2:40 PM',
    timeElapsed: '8 min ago',
    source: { type: 'beacon_auto', name: 'Beacon Auto', shorthand: 'BCN', color: '#0097b2' },
    status: 'unreviewed',
    respondingUnits: [],
    notes: 'Vehicle stuck in snowbank, occupants are 80+ years old',
  },
  // ADEQUATELY STAFFED - Structure Fire (full response)
  {
    id: 'tri-7',
    incidentTypeId: 'vehicle_fire',
    title: 'Vehicle Fire - Parking Garage',
    location: '200 Main Place Mall',
    reportedAt: '2:20 PM',
    timeElapsed: '28 min ago',
    source: { type: 'official', name: 'Buffalo Fire', shorthand: 'BFD', color: '#dc2626' },
    status: 'in_progress',
    respondingUnits: [
      { id: 'ru-6', name: 'Engine 12', type: 'engine', status: 'on_scene', personnel: 4 },
      { id: 'ru-7', name: 'Medic 18', type: 'ambulance', status: 'on_scene', personnel: 2 },
    ],
    notes: 'Fire contained, no injuries',
  },
  // ADEQUATELY STAFFED - Medical
  {
    id: 'tri-8',
    incidentTypeId: 'medical_general',
    title: 'Medical - Fall Injury',
    location: 'Senior Center, 123 Oak St',
    reportedAt: '2:25 PM',
    timeElapsed: '23 min ago',
    source: { type: 'official', name: 'Buffalo EMS', shorthand: 'EMS', color: '#059669' },
    status: 'in_progress',
    respondingUnits: [
      { id: 'ru-8', name: 'Medic 7', type: 'ambulance', status: 'on_scene', personnel: 2 },
    ],
    notes: 'Patient stable, preparing for transport',
  },
  // ADEQUATELY STAFFED - Rescue
  {
    id: 'tri-9',
    incidentTypeId: 'water_rescue',
    title: 'Water Rescue - Flood Zone',
    location: 'River Rd & Marina Dr',
    reportedAt: '2:15 PM',
    timeElapsed: '33 min ago',
    source: { type: 'official', name: 'County EOC', shorthand: 'EOC', color: '#7c3aed' },
    status: 'in_progress',
    respondingUnits: [
      { id: 'ru-9', name: 'Rescue 3', type: 'rescue', status: 'on_scene', personnel: 4 },
      { id: 'ru-10', name: 'Engine 15', type: 'engine', status: 'on_scene', personnel: 4 },
      { id: 'ru-11', name: 'Boat 1', type: 'boat', status: 'on_scene', personnel: 2 },
      { id: 'ru-12', name: 'Medic 15', type: 'ambulance', status: 'on_scene', personnel: 2 },
    ],
    notes: '3 persons rescued, searching for possible 4th',
  },
  // LOW - Adequately staffed
  {
    id: 'tri-10',
    incidentTypeId: 'welfare_check',
    title: 'Welfare Check - No Answer',
    location: '234 Birch Lane',
    reportedAt: '2:10 PM',
    timeElapsed: '38 min ago',
    source: { type: 'public', name: 'Public Report', shorthand: 'PUB', color: '#6b7280' },
    status: 'in_progress',
    respondingUnits: [
      { id: 'ru-13', name: 'Unit 15', type: 'police', status: 'on_scene', personnel: 2 },
    ],
    notes: 'Officers making contact attempt',
  },
];

// Mock cluster suggestions - incidents that may be related
const mockClusters: IncidentCluster[] = [
  // Duplicate type - same exact location, multiple reports
  {
    id: 'cluster-1',
    suggestedTitle: 'Structure Fire - 1234 Main St',
    location: '1234 Main St',
    radius: 'exact match',
    confidence: 'high',
    clusterType: 'duplicate',
    suggestedEventType: 'Structure Fire',
    reportCount: 4,
    firstReported: '2:15 PM',
    mostRecentReport: '2:22 PM',
    incidents: [
      {
        id: 'c1-1',
        incidentType: 'fire',
        title: 'Structure Fire - 1234 Main St',
        location: '1234 Main St',
        timestamp: '2:15 PM',
        urgency: 'critical',
        assignmentStatus: 'in_progress',
        source: { type: 'official', groupShorthand: 'BFD', groupColor: '#dc2626', groupName: 'Buffalo Fire Department', role: 'Dispatch' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c1-2',
        incidentType: 'fire',
        title: 'Fire at 1234 Main',
        location: '1234 Main St',
        timestamp: '2:17 PM',
        urgency: 'high',
        assignmentStatus: 'unassigned',
        source: { type: 'public', groupShorthand: 'PUB', groupColor: '#6b7280', groupName: 'Public Report' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c1-3',
        incidentType: 'fire',
        title: 'Building Fire - Main St',
        location: '1234 Main St',
        timestamp: '2:18 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'public', groupShorthand: 'CERT', groupColor: '#059669', groupName: 'CERT', role: 'Member' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c1-4',
        incidentType: 'fire',
        title: 'Smoke/Fire Detected',
        location: '1234 Main St',
        timestamp: '2:22 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'beacon_auto', groupShorthand: 'BCN', groupColor: '#0097b2', groupName: 'Beacon Automated' },
        respondingUnits: [],
        resourceRequests: [],
      },
    ],
  },
  // Event type - tornado sightings across wide area
  {
    id: 'cluster-2',
    suggestedTitle: 'Tornado Sightings - County Wide',
    location: 'Erie County',
    radius: '15 miles',
    confidence: 'high',
    clusterType: 'event',
    suggestedEventType: 'Severe Weather Event',
    reportCount: 12,
    firstReported: '3:05 PM',
    mostRecentReport: '3:18 PM',
    incidents: [
      {
        id: 'c2-1',
        incidentType: 'other',
        title: 'Tornado Spotted - North County',
        location: 'Route 5 & Sheridan Dr',
        timestamp: '3:05 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'public', groupShorthand: 'PUB', groupColor: '#6b7280', groupName: 'Public Report' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c2-2',
        incidentType: 'other',
        title: 'Funnel Cloud Sighting',
        location: 'Amherst near UB',
        timestamp: '3:08 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'public', groupShorthand: 'PUB', groupColor: '#6b7280', groupName: 'Public Report' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c2-3',
        incidentType: 'other',
        title: 'Tornado Warning - Active Rotation',
        location: 'Erie County',
        timestamp: '3:10 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'beacon_auto', groupShorthand: 'BCN', groupColor: '#0097b2', groupName: 'Beacon Automated' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c2-4',
        incidentType: 'other',
        title: 'Tornado on Ground - Cheektowaga',
        location: 'Cheektowaga',
        timestamp: '3:12 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'official', groupShorthand: 'EOC', groupColor: '#7c3aed', groupName: 'County EOC', role: 'Operations' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c2-5',
        incidentType: 'other',
        title: 'Tornado Damage Reports',
        location: 'Transit Rd corridor',
        timestamp: '3:18 PM',
        urgency: 'critical',
        assignmentStatus: 'unassigned',
        source: { type: 'official', groupShorthand: 'BPD', groupColor: '#2563eb', groupName: 'Buffalo Police Department', role: 'Dispatch' },
        respondingUnits: [],
        resourceRequests: [],
      },
    ],
  },
  // Duplicate type - MVA same location
  {
    id: 'cluster-3',
    suggestedTitle: 'MVA - Hwy 101 & Oak Ave',
    location: 'Hwy 101 & Oak Ave',
    radius: 'exact match',
    confidence: 'medium',
    clusterType: 'duplicate',
    suggestedEventType: 'Motor Vehicle Accident',
    reportCount: 3,
    firstReported: '2:30 PM',
    mostRecentReport: '2:35 PM',
    incidents: [
      {
        id: 'c3-1',
        incidentType: 'accident',
        title: 'MVA - Hwy 101 & Oak Ave',
        location: 'Hwy 101 & Oak Ave',
        timestamp: '2:30 PM',
        urgency: 'high',
        assignmentStatus: 'in_progress',
        source: { type: 'official', groupShorthand: 'BPD', groupColor: '#2563eb', groupName: 'Buffalo Police Department', role: 'Dispatch' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c3-2',
        incidentType: 'accident',
        title: 'Car Crash - 101 & Oak',
        location: 'Hwy 101 & Oak Ave',
        timestamp: '2:32 PM',
        urgency: 'medium',
        assignmentStatus: 'unassigned',
        source: { type: 'public', groupShorthand: 'PUB', groupColor: '#6b7280', groupName: 'Public Report' },
        respondingUnits: [],
        resourceRequests: [],
      },
      {
        id: 'c3-3',
        incidentType: 'medical',
        title: 'Medical - MVA Scene',
        location: 'Hwy 101 & Oak Ave',
        timestamp: '2:35 PM',
        urgency: 'high',
        assignmentStatus: 'unassigned',
        source: { type: 'official', groupShorthand: 'EMS', groupColor: '#059669', groupName: 'Emergency Medical Services', role: 'Field' },
        respondingUnits: [],
        resourceRequests: [],
      },
    ],
  },
];

// Navigation type for Dashboard
type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNavigationProp<IncidentsStackParamList>
>;

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const [activePanel, setActivePanel] = useState<'map' | 'widgets'>(IS_MOBILE ? 'widgets' : 'map');
  const [clusters, setClusters] = useState<IncidentCluster[]>(mockClusters);
  const [showRequirementsManager, setShowRequirementsManager] = useState(false);
  const panX = useRef(new Animated.Value(0)).current;

  // Swipe gesture for mobile
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return IS_MOBILE && Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (IS_MOBILE) {
          panX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (IS_MOBILE) {
          if (gestureState.dx > 50 && activePanel === 'widgets') {
            setActivePanel('map');
          } else if (gestureState.dx < -50 && activePanel === 'map') {
            setActivePanel('widgets');
          }
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleNavigateToMap = () => {
    console.log('Navigate to full map');
  };

  const handleNavigateToResources = () => {
    console.log('Navigate to Resources tab');
  };

  const handleNavigateToCommunications = () => {
    console.log('Navigate to Communications tab');
  };

  const handleCreateEventFromCluster = (cluster: IncidentCluster) => {
    console.log('Create event from cluster:', cluster.id, cluster.suggestedTitle);
    // Would navigate to event creation with pre-filled data from cluster
    // For now, remove the cluster from suggestions
    setClusters(prev => prev.filter(c => c.id !== cluster.id));
  };

  const handleMergeIncidents = (cluster: IncidentCluster) => {
    console.log('Merge incidents from cluster:', cluster.id, cluster.suggestedTitle);
    // Would merge duplicate reports into single incident
    // For now, remove the cluster from suggestions
    setClusters(prev => prev.filter(c => c.id !== cluster.id));
  };

  const handleDismissCluster = (clusterId: string) => {
    console.log('Dismiss cluster:', clusterId);
    setClusters(prev => prev.filter(c => c.id !== clusterId));
  };

  // Mobile swipe indicator
  const renderSwipeIndicator = () => {
    if (!IS_MOBILE) return null;
    return (
      <View style={styles.swipeIndicator}>
        <TouchableOpacity
          style={[styles.swipeDot, activePanel === 'map' && styles.swipeDotActive]}
          onPress={() => setActivePanel('map')}
        />
        <TouchableOpacity
          style={[styles.swipeDot, activePanel === 'widgets' && styles.swipeDotActive]}
          onPress={() => setActivePanel('widgets')}
        />
      </View>
    );
  };

  // Widgets panel content
  const renderWidgets = (variant: 'dark' | 'light' = 'dark') => (
    <ScrollView
      style={styles.widgetsScroll}
      contentContainerStyle={styles.widgetsContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cluster Suggestions - shown when there are potential groupings */}
      {clusters.length > 0 && (
        <IncidentClusterSuggestions
          clusters={clusters}
          onCreateEvent={handleCreateEventFromCluster}
          onMergeIncidents={handleMergeIncidents}
          onDismiss={handleDismissCluster}
          variant={variant}
        />
      )}

      {/* Incidents Widget */}
      <CollapsibleWidget title="Incidents" minHeight={180} variant={variant}>
        <IncidentStream
          incidents={mockIncidents}
          onIncidentPress={(incident) => {
            // Navigate to Incidents tab, then to detail screen
            navigation.navigate('IncidentsTab', {
              screen: 'IncidentDetail',
              params: { incidentId: incident.id },
            } as any);
          }}
        />
      </CollapsibleWidget>

      {/* Alerts Widget */}
      <CollapsibleWidget title="Alerts" minHeight={150} variant={variant}>
        <AlertStream
          alerts={mockAlerts}
          onAlertPress={(alert) => console.log('Alert:', alert.id)}
        />
      </CollapsibleWidget>

      {/* Communications Widget */}
      <CollapsibleWidget title="Communications" minHeight={150} variant={variant}>
        <CommunicationsStream
          messages={mockMessages}
          onMessagePress={(msg) => console.log('Message:', msg.id)}
          onViewAll={handleNavigateToCommunications}
        />
      </CollapsibleWidget>
    </ScrollView>
  );

  // Desktop layout: 3D map as main content with right sidebar
  if (!IS_MOBILE) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

        <View style={styles.desktopLayout}>
          {/* Incidents Sidebar */}
          <View style={styles.widgetSidebar}>
            {/* Incidents Header with Requirements Manager Link */}
            <View style={styles.widgetSidebarHeader}>
              <View>
                <Text style={styles.widgetSidebarTitle}>Incidents</Text>
                <TouchableOpacity onPress={() => setShowRequirementsManager(true)}>
                  <Text style={styles.requirementsManagerLink}>Incident Response Requirements Manager</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.incidentsSection}>
              <IncidentTriage
                incidents={mockTriageIncidents}
                onIncidentPress={(incident) => {
                  navigation.navigate('IncidentsTab', {
                    screen: 'IncidentDetail',
                    params: { incidentId: incident.id },
                  } as any);
                }}
                onAssignUnit={(incident) => console.log('Assign unit to:', incident.id)}
              />
            </View>
          </View>

          {/* Map Panel - Main Content (takes remaining space) */}
          <View style={styles.mapPanel}>
            <DashboardMap
              onExpandPress={handleNavigateToMap}
              markers={[]}
              zones={[]}
            />
          </View>
        </View>

        {/* Requirements Manager Modal */}
        <Modal
          visible={showRequirementsManager}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRequirementsManager(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Incident Response Requirements Manager</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowRequirementsManager(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <IncidentRequirementsTable
                  onUpdateRequirement={(typeId, updates) => {
                    console.log('Updated requirements for:', typeId, updates);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Mobile layout: swipeable panels
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EMS Command</Text>
        <View style={styles.headerStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live</Text>
        </View>
      </View>

      {/* Panel toggle buttons for mobile */}
      <View style={styles.mobileToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, activePanel === 'map' && styles.toggleButtonActive]}
          onPress={() => setActivePanel('map')}
        >
          <Text style={[styles.toggleButtonText, activePanel === 'map' && styles.toggleButtonTextActive]}>
            🗺️ Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, activePanel === 'widgets' && styles.toggleButtonActive]}
          onPress={() => setActivePanel('widgets')}
        >
          <Text style={[styles.toggleButtonText, activePanel === 'widgets' && styles.toggleButtonTextActive]}>
            📊 Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={[styles.mobileContent, { transform: [{ translateX: panX }] }]}
        {...panResponder.panHandlers}
      >
        {activePanel === 'map' ? (
          <View style={styles.mobileMapContainer}>
            <DashboardMap
              onExpandPress={handleNavigateToMap}
              markers={[]}
              zones={[]}
              showLayers={false}
            />
          </View>
        ) : (
          renderWidgets()
        )}
      </Animated.View>

      {renderSwipeIndicator()}
    </SafeAreaView>
  );
};

// Right sidebar colors (whites/grays to match left menu structure)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Desktop layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mapPanel: {
    flex: 1,
  },

  // Widget Sidebar (incidents)
  widgetSidebar: {
    width: 380,
    backgroundColor: sidebarColors.background,
    borderRightWidth: 1,
    borderRightColor: sidebarColors.border,
  },
  incidentsSection: {
    flex: 1,
  },
  requirementsManagerLink: {
    fontSize: 12,
    color: sidebarColors.accent,
    marginTop: 4,
    textDecorationLine: 'underline',
  },

  widgetSidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.borderLight,
    backgroundColor: sidebarColors.card,
  },
  widgetSidebarTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: sidebarColors.text,
    letterSpacing: 0.5,
  },
  widgetSidebarSubtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: sidebarColors.textMuted,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sidebarColors.backgroundHover,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: sidebarColors.cardBorder,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: spacing.xs,
  },
  liveIndicatorText: {
    fontSize: typography.sizes.xs,
    color: '#22c55e',
    fontWeight: typography.weights.semibold,
  },

  widgetsScroll: {
    flex: 1,
  },
  widgetsContent: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // Mobile header
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
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.critical,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.status.critical,
    fontWeight: typography.weights.semibold,
  },

  // Mobile layout
  mobileToggle: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.beacon.primary,
  },
  toggleButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  toggleButtonTextActive: {
    color: colors.white,
  },
  mobileContent: {
    flex: 1,
  },
  mobileMapContainer: {
    flex: 1,
    padding: spacing.md,
  },
  swipeIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  swipeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.tertiary,
  },
  swipeDotActive: {
    backgroundColor: colors.beacon.primary,
  },

  // Requirements Manager Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 900,
    maxHeight: '85%',
    backgroundColor: sidebarColors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: sidebarColors.card,
    borderBottomWidth: 1,
    borderBottomColor: sidebarColors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: sidebarColors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: sidebarColors.backgroundHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: sidebarColors.textSecondary,
    fontWeight: '600' as const,
  },
  modalBody: {
    flex: 1,
  },
});

export default DashboardScreen;
