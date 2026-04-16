import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import type { IncidentsStackParamList } from '../../navigation/AppNavigator';

type IncidentDetailNavigationProp = StackNavigationProp<IncidentsStackParamList, 'IncidentDetail'>;
type IncidentDetailRouteProp = RouteProp<IncidentsStackParamList, 'IncidentDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

// Types
export interface IncidentSource {
  type: 'dispatch' | 'team_member' | 'public' | 'beacon_auto' | 'mutual_aid';
  name?: string;
  timestamp: string;
}

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
  id: string;
  type: string;
  status: 'requested' | 'dispatched' | 'fulfilled' | 'cancelled';
  requestedAt: string;
  requestedBy?: string;
  fulfilledBy?: string;
}

export interface StatusUpdate {
  id: string;
  status: string;
  updatedBy: string;
  timestamp: string;
  note?: string;
}

export interface IncidentMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'dispatch' | 'unit' | 'mutual_aid' | 'command' | 'public';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface IncidentDetail {
  id: string;
  incidentType: 'fire' | 'medical' | 'accident' | 'hazmat' | 'rescue' | 'utility' | 'weather' | 'other';
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  timestamp: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  assignmentStatus: 'unassigned' | 'assigned' | 'in_progress' | 'resolved';
  source: IncidentSource;
  respondingUnits: RespondingUnit[];
  resourceRequests: ResourceRequest[];
  statusUpdates: StatusUpdate[];
  messages: IncidentMessage[];
  unreadMessageCount: number;
}

interface IncidentDetailScreenProps {
  onAssignUnit?: (incidentId: string, unitId: string) => void;
  onRemoveUnit?: (incidentId: string, unitId: string) => void;
  onRequestResource?: (incidentId: string, resourceType: string) => void;
  onUpdateStatus?: (incidentId: string, status: string, note?: string) => void;
  onSendMessage?: (incidentId: string, message: string) => void;
}

// Mock data for demonstration
const mockIncident: IncidentDetail = {
  id: '1',
  incidentType: 'fire',
  title: 'Structure Fire - 1234 Main St',
  description: 'Two-story residential structure with fire on the second floor. Reports of occupants still inside.',
  location: {
    address: '1234 Main St, Downtown',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  timestamp: '2 min ago',
  urgency: 'critical',
  assignmentStatus: 'in_progress',
  source: {
    type: 'dispatch',
    name: 'Central Dispatch',
    timestamp: '14:32:15',
  },
  respondingUnits: [
    { id: 'u1', name: 'Engine 7', status: 'on_scene', isMyTeam: true },
    { id: 'u2', name: 'Ladder 3', status: 'on_scene', isMyTeam: true },
    { id: 'u3', name: 'Engine 15', status: 'en_route', eta: '4 min', isBackup: true, agency: 'County Fire', isMyTeam: false },
    { id: 'u4', name: 'Medic 5', status: 'staging', isMyTeam: true },
  ],
  resourceRequests: [
    { id: 'r1', type: 'EMS', status: 'dispatched', requestedAt: '14:33:00', requestedBy: 'Engine 7' },
    { id: 'r2', type: 'Hazmat', status: 'requested', requestedAt: '14:35:00', requestedBy: 'Ladder 3' },
    { id: 'r3', type: 'Utility Company', status: 'requested', requestedAt: '14:36:00', requestedBy: 'Command' },
  ],
  statusUpdates: [
    { id: 's1', status: 'Incident Created', updatedBy: 'Central Dispatch', timestamp: '14:32:15' },
    { id: 's2', status: 'Units Dispatched', updatedBy: 'Central Dispatch', timestamp: '14:32:45' },
    { id: 's3', status: 'Engine 7 En Route', updatedBy: 'Engine 7', timestamp: '14:33:00' },
    { id: 's4', status: 'Engine 7 On Scene', updatedBy: 'Engine 7', timestamp: '14:38:00', note: 'Heavy smoke visible' },
    { id: 's5', status: 'Fire Attack Initiated', updatedBy: 'Engine 7', timestamp: '14:40:00' },
    { id: 's6', status: 'Search & Rescue in Progress', updatedBy: 'Ladder 3', timestamp: '14:42:00' },
  ],
  messages: [
    { id: 'm1', senderId: 'dispatch', senderName: 'Central Dispatch', senderType: 'dispatch', message: 'Structure fire reported at 1234 Main St. Engine 7 and Ladder 3 dispatched.', timestamp: '14:32:45', isRead: true },
    { id: 'm2', senderId: 'u1', senderName: 'Engine 7', senderType: 'unit', message: 'En route to scene. ETA 5 minutes.', timestamp: '14:33:00', isRead: true },
    { id: 'm3', senderId: 'u1', senderName: 'Engine 7', senderType: 'unit', message: 'On scene. Heavy smoke showing from second floor. Establishing command.', timestamp: '14:38:00', isRead: true },
    { id: 'm4', senderId: 'u1', senderName: 'Engine 7', senderType: 'unit', message: 'Requesting EMS to scene. Reports of possible injuries.', timestamp: '14:39:00', isRead: true },
    { id: 'm5', senderId: 'u2', senderName: 'Ladder 3', senderType: 'unit', message: 'On scene. Beginning primary search.', timestamp: '14:40:00', isRead: true },
    { id: 'm6', senderId: 'u3', senderName: 'County Fire Engine 15', senderType: 'mutual_aid', message: 'Responding as backup. ETA 4 minutes.', timestamp: '14:41:00', isRead: false },
    { id: 'm7', senderId: 'command', senderName: 'Battalion Chief', senderType: 'command', message: 'Copy all. Requesting hazmat standby - unknown materials in garage.', timestamp: '14:42:00', isRead: false },
  ],
  unreadMessageCount: 2,
};

// Available units for assignment
const availableUnits = [
  { id: 'av1', name: 'Engine 12', status: 'available', isMyTeam: true },
  { id: 'av2', name: 'Rescue 2', status: 'available', isMyTeam: true },
  { id: 'av3', name: 'Medic 8', status: 'available', isMyTeam: true },
  { id: 'av4', name: 'Engine 20', status: 'available', isMyTeam: false, agency: 'County Fire' },
  { id: 'av5', name: 'Hazmat 1', status: 'available', isMyTeam: false, agency: 'Regional' },
];

const resourceTypes = [
  'EMS', 'Hazmat', 'Water Rescue', 'Technical Rescue', 'K-9',
  'Helicopter', 'Police', 'Utility Company', 'Tow Truck', 'Coroner'
];

const getUrgencyColor = (urgency: IncidentDetail['urgency']) => {
  switch (urgency) {
    case 'critical': return colors.status.critical;
    case 'high': return colors.status.severe;
    case 'medium': return colors.status.moderate;
    case 'low': return colors.status.minor;
  }
};

const getIncidentTypeColor = (type: IncidentDetail['incidentType']) => {
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
  switch (source.type) {
    case 'dispatch': return 'Dispatch Assignment';
    case 'team_member': return `Reported by ${source.name || 'Team Member'}`;
    case 'public': return 'Public Report';
    case 'beacon_auto': return 'Beacon Auto-Generated';
    case 'mutual_aid': return `Mutual Aid: ${source.name || 'Partner Agency'}`;
  }
};

const getMessageTypeColor = (type: IncidentMessage['senderType']) => {
  switch (type) {
    case 'dispatch': return colors.beacon.primary;
    case 'unit': return colors.status.minor;
    case 'mutual_aid': return colors.status.moderate;
    case 'command': return colors.status.severe;
    case 'public': return colors.status.offline;
  }
};

export const IncidentDetailScreen: React.FC<IncidentDetailScreenProps> = ({
  onAssignUnit,
  onRemoveUnit,
  onRequestResource,
  onUpdateStatus,
  onSendMessage,
}) => {
  const navigation = useNavigation<IncidentDetailNavigationProp>();
  const route = useRoute<IncidentDetailRouteProp>();
  const { incidentId } = route.params || {};

  // In a real app, you would fetch the incident by ID
  // For now, use the mock incident
  const incident = mockIncident;
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'status' | 'resources'>('overview');
  const [messageText, setMessageText] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const myTeamUnits = incident.respondingUnits.filter(u => u.isMyTeam);
  const otherUnits = incident.respondingUnits.filter(u => !u.isMyTeam);
  const pendingRequests = incident.resourceRequests.filter(r => r.status === 'requested');

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage?.(incident.id, messageText);
      setMessageText('');
    }
  };

  const handleAssignUnit = (unitId: string) => {
    onAssignUnit?.(incident.id, unitId);
    setShowAssignModal(false);
  };

  const handleRequestResource = (resourceType: string) => {
    onRequestResource?.(incident.id, resourceType);
    setShowRequestModal(false);
  };

  const handleUpdateStatus = () => {
    if (selectedStatus) {
      onUpdateStatus?.(incident.id, selectedStatus, statusNote);
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusNote('');
    }
  };

  // Mini Map Component
  const renderMiniMap = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapCoordinates}>
          {incident.location.coordinates.lat.toFixed(4)}, {incident.location.coordinates.lng.toFixed(4)}
        </Text>
        <View style={styles.mapMarker}>
          <View style={[styles.markerDot, { backgroundColor: getIncidentTypeColor(incident.incidentType) }]} />
        </View>
      </View>
      <TouchableOpacity style={styles.expandMapButton}>
        <Text style={styles.expandMapText}>Open in Full Map</Text>
      </TouchableOpacity>
    </View>
  );

  // Header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <View style={styles.headerBadges}>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(incident.urgency) }]}>
            <Text style={styles.badgeText}>{incident.urgency.toUpperCase()}</Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: getIncidentTypeColor(incident.incidentType) }]}>
            <Text style={styles.badgeText}>{incident.incidentType.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>{incident.title}</Text>
        <Text style={styles.headerLocation}>{incident.location.address}</Text>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceLabel}>{getSourceLabel(incident.source)}</Text>
          <Text style={styles.sourceTime}>{incident.source.timestamp}</Text>
        </View>
      </View>
    </View>
  );

  // Tab Bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {(['overview', 'messages', 'status', 'resources'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab === 'messages' && incident.unreadMessageCount > 0
              ? `Messages (${incident.unreadMessageCount})`
              : tab.charAt(0).toUpperCase() + tab.slice(1)
            }
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Overview Tab
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Map */}
      {renderMiniMap()}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{incident.description}</Text>
      </View>

      {/* My Team Units */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Team ({myTeamUnits.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAssignModal(true)}>
            <Text style={styles.addButtonText}>+ Assign</Text>
          </TouchableOpacity>
        </View>
        {myTeamUnits.length === 0 ? (
          <Text style={styles.emptyText}>No units assigned from your team</Text>
        ) : (
          myTeamUnits.map((unit) => (
            <View key={unit.id} style={styles.unitRow}>
              <View style={styles.unitInfo}>
                <View style={[styles.statusDot, { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }]} />
                <Text style={styles.unitName}>{unit.name}</Text>
                <Text style={styles.unitStatus}>
                  {unit.status === 'en_route' ? `En Route${unit.eta ? ` (${unit.eta})` : ''}` :
                   unit.status === 'on_scene' ? 'On Scene' :
                   unit.status === 'staging' ? 'Staging' : 'Returning'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveUnit?.(incident.id, unit.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Other Units */}
      {otherUnits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Units ({otherUnits.length})</Text>
          {otherUnits.map((unit) => (
            <View key={unit.id} style={[styles.unitRow, styles.partnerUnitRow]}>
              <View style={styles.unitInfo}>
                <View style={[styles.statusDot, { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }]} />
                <Text style={styles.unitName}>{unit.name}</Text>
                {unit.agency && <Text style={styles.agencyBadge}>{unit.agency}</Text>}
                <Text style={styles.unitStatus}>
                  {unit.status === 'en_route' ? `En Route${unit.eta ? ` (${unit.eta})` : ''}` :
                   unit.status === 'on_scene' ? 'On Scene' :
                   unit.status === 'staging' ? 'Staging' : 'Returning'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Resource Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resource Requests</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowRequestModal(true)}>
            <Text style={styles.addButtonText}>+ Request</Text>
          </TouchableOpacity>
        </View>
        {incident.resourceRequests.length === 0 ? (
          <Text style={styles.emptyText}>No resource requests</Text>
        ) : (
          incident.resourceRequests.map((request) => (
            <View key={request.id} style={styles.requestRow}>
              <View style={styles.requestInfo}>
                <Text style={styles.requestType}>{request.type}</Text>
                <Text style={styles.requestMeta}>
                  Requested by {request.requestedBy} at {request.requestedAt}
                </Text>
              </View>
              <View style={[
                styles.requestStatusBadge,
                { backgroundColor:
                  request.status === 'fulfilled' ? colors.status.minorLight :
                  request.status === 'dispatched' ? colors.status.severeLight :
                  request.status === 'cancelled' ? colors.background.tertiary :
                  colors.status.criticalLight
                }
              ]}>
                <Text style={[
                  styles.requestStatusText,
                  { color:
                    request.status === 'fulfilled' ? colors.status.minor :
                    request.status === 'dispatched' ? colors.status.severe :
                    request.status === 'cancelled' ? colors.text.muted :
                    colors.status.critical
                  }
                ]}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  // Messages Tab
  const renderMessagesTab = () => (
    <KeyboardAvoidingView
      style={styles.messagesContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {incident.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageItem,
              !msg.isRead && styles.messageUnread
            ]}
          >
            <View style={styles.messageHeader}>
              <View style={[styles.senderBadge, { backgroundColor: getMessageTypeColor(msg.senderType) }]}>
                <Text style={styles.senderBadgeText}>
                  {msg.senderType === 'dispatch' ? 'DISPATCH' :
                   msg.senderType === 'command' ? 'COMMAND' :
                   msg.senderType === 'mutual_aid' ? 'MUTUAL AID' :
                   msg.senderType === 'public' ? 'PUBLIC' : 'UNIT'}
                </Text>
              </View>
              <Text style={styles.senderName}>{msg.senderName}</Text>
              <Text style={styles.messageTime}>{msg.timestamp}</Text>
            </View>
            <Text style={styles.messageText}>{msg.message}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.text.muted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // Status Tab
  const renderStatusTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowStatusModal(true)}>
            <Text style={styles.addButtonText}>+ Update</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.timeline}>
          {incident.statusUpdates.map((update, index) => (
            <View key={update.id} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <View style={[
                  styles.timelineDotInner,
                  index === incident.statusUpdates.length - 1 && styles.timelineDotCurrent
                ]} />
              </View>
              {index < incident.statusUpdates.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{update.status}</Text>
                <Text style={styles.timelineMeta}>
                  {update.updatedBy} - {update.timestamp}
                </Text>
                {update.note && (
                  <Text style={styles.timelineNote}>{update.note}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // Resources Tab
  const renderResourcesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Assigned Units */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Units</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAssignModal(true)}>
            <Text style={styles.addButtonText}>+ Assign</Text>
          </TouchableOpacity>
        </View>

        {/* My Team */}
        <Text style={styles.subSectionTitle}>My Team</Text>
        {myTeamUnits.length === 0 ? (
          <Text style={styles.emptyText}>No units from your team</Text>
        ) : (
          myTeamUnits.map((unit) => (
            <View key={unit.id} style={styles.resourceUnitCard}>
              <View style={styles.resourceUnitHeader}>
                <View style={[styles.statusDot, { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }]} />
                <Text style={styles.resourceUnitName}>{unit.name}</Text>
              </View>
              <View style={styles.resourceUnitActions}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {unit.status === 'en_route' ? `En Route${unit.eta ? ` (${unit.eta})` : ''}` :
                     unit.status === 'on_scene' ? 'On Scene' :
                     unit.status === 'staging' ? 'Staging' : 'Returning'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeUnitButton}
                  onPress={() => onRemoveUnit?.(incident.id, unit.id)}
                >
                  <Text style={styles.removeUnitText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Partner Units */}
        {otherUnits.length > 0 && (
          <>
            <Text style={[styles.subSectionTitle, { marginTop: spacing.lg }]}>Partner Units</Text>
            {otherUnits.map((unit) => (
              <View key={unit.id} style={[styles.resourceUnitCard, styles.partnerCard]}>
                <View style={styles.resourceUnitHeader}>
                  <View style={[styles.statusDot, { backgroundColor: unit.status === 'on_scene' ? colors.status.minor : colors.status.severe }]} />
                  <Text style={styles.resourceUnitName}>{unit.name}</Text>
                  {unit.agency && (
                    <View style={styles.agencyPill}>
                      <Text style={styles.agencyPillText}>{unit.agency}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {unit.status === 'en_route' ? `En Route${unit.eta ? ` (${unit.eta})` : ''}` :
                     unit.status === 'on_scene' ? 'On Scene' :
                     unit.status === 'staging' ? 'Staging' : 'Returning'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Resource Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resource Requests</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowRequestModal(true)}>
            <Text style={styles.addButtonText}>+ Request</Text>
          </TouchableOpacity>
        </View>

        {/* Pending */}
        {pendingRequests.length > 0 && (
          <>
            <Text style={styles.subSectionTitle}>Pending</Text>
            {pendingRequests.map((request) => (
              <View key={request.id} style={[styles.requestCard, styles.requestPending]}>
                <View style={styles.requestCardHeader}>
                  <Text style={styles.requestCardType}>{request.type}</Text>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>REQUESTED</Text>
                  </View>
                </View>
                <Text style={styles.requestCardMeta}>
                  Requested by {request.requestedBy} at {request.requestedAt}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* All Requests */}
        <Text style={[styles.subSectionTitle, pendingRequests.length > 0 && { marginTop: spacing.lg }]}>All Requests</Text>
        {incident.resourceRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestCardHeader}>
              <Text style={styles.requestCardType}>{request.type}</Text>
              <View style={[
                styles.requestStatusPill,
                { backgroundColor:
                  request.status === 'fulfilled' ? colors.status.minorLight :
                  request.status === 'dispatched' ? colors.status.severeLight :
                  request.status === 'cancelled' ? colors.background.tertiary :
                  colors.status.criticalLight
                }
              ]}>
                <Text style={[
                  styles.requestStatusPillText,
                  { color:
                    request.status === 'fulfilled' ? colors.status.minor :
                    request.status === 'dispatched' ? colors.status.severe :
                    request.status === 'cancelled' ? colors.text.muted :
                    colors.status.critical
                  }
                ]}>
                  {request.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.requestCardMeta}>
              {request.requestedBy} - {request.requestedAt}
              {request.fulfilledBy && ` | Fulfilled by ${request.fulfilledBy}`}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // Assign Unit Modal
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
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalSectionTitle}>Available Units</Text>
            {availableUnits.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={styles.modalUnitItem}
                onPress={() => handleAssignUnit(unit.id)}
              >
                <View style={styles.modalUnitInfo}>
                  <Text style={styles.modalUnitName}>{unit.name}</Text>
                  {unit.agency && (
                    <Text style={styles.modalUnitAgency}>{unit.agency}</Text>
                  )}
                </View>
                <Text style={[
                  styles.modalUnitTeam,
                  { color: unit.isMyTeam ? colors.beacon.primary : colors.text.secondary }
                ]}>
                  {unit.isMyTeam ? 'My Team' : 'Partner'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Request Resource Modal
  const renderRequestModal = () => (
    <Modal
      visible={showRequestModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRequestModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Resource</Text>
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalSectionTitle}>Resource Types</Text>
            {resourceTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.modalResourceItem}
                onPress={() => handleRequestResource(type)}
              >
                <Text style={styles.modalResourceName}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Status Update Modal
  const renderStatusModal = () => (
    <Modal
      visible={showStatusModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowStatusModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalSectionTitle}>Quick Status</Text>
            {['Fire Contained', 'Fire Under Control', 'Fire Out', 'Search Complete', 'All Clear', 'Incident Resolved'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus === status && styles.statusOptionSelected
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.statusOptionText,
                  selectedStatus === status && styles.statusOptionTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.modalSectionTitle, { marginTop: spacing.lg }]}>Note (Optional)</Text>
            <TextInput
              style={styles.statusNoteInput}
              placeholder="Add details..."
              placeholderTextColor={colors.text.muted}
              value={statusNote}
              onChangeText={setStatusNote}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitButton, !selectedStatus && styles.submitButtonDisabled]}
              onPress={handleUpdateStatus}
              disabled={!selectedStatus}
            >
              <Text style={styles.submitButtonText}>Submit Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabBar()}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'messages' && renderMessagesTab()}
      {activeTab === 'status' && renderStatusTab()}
      {activeTab === 'resources' && renderResourcesTab()}
      {renderAssignModal()}
      {renderRequestModal()}
      {renderStatusModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Header
  header: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    color: colors.beacon.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  headerInfo: {},
  headerBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  urgencyBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerLocation: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourceLabel: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  sourceTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
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
    fontWeight: typography.weights.semibold,
  },

  // Tab Content
  tabContent: {
    flex: 1,
    padding: spacing.lg,
  },

  // Map
  mapContainer: {
    marginBottom: spacing.lg,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholderText: {
    fontSize: typography.sizes.lg,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  mapCoordinates: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  mapMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.white,
  },
  expandMapButton: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.beacon.primaryLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  expandMapText: {
    color: colors.beacon.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  subSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  addButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.beacon.primary,
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: 22,
  },

  // Units
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  partnerUnitRow: {
    backgroundColor: colors.beacon.primaryLight,
    borderColor: colors.beacon.primary,
  },
  unitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unitName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  unitStatus: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  agencyBadge: {
    fontSize: typography.sizes.xs,
    color: colors.beacon.primary,
    fontStyle: 'italic',
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.status.criticalLight,
    borderRadius: borderRadius.sm,
  },
  removeButtonText: {
    color: colors.status.critical,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },

  // Resource Requests
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  requestMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  requestStatusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  requestStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
  },
  messageItem: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  messageUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.beacon.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  senderBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  senderBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  senderName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: 20,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.beacon.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },

  // Timeline
  timeline: {
    paddingLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: spacing.lg,
  },
  timelineDot: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border.dark,
  },
  timelineDotCurrent: {
    backgroundColor: colors.beacon.primary,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 20,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border.default,
  },
  timelineContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  timelineStatus: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  timelineMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  timelineNote: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },

  // Resources Tab
  resourceUnitCard: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  partnerCard: {
    backgroundColor: colors.beacon.primaryLight,
    borderColor: colors.beacon.primary,
  },
  resourceUnitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resourceUnitName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  resourceUnitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  agencyPill: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  agencyPillText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  removeUnitButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.status.criticalLight,
    borderRadius: borderRadius.md,
  },
  removeUnitText: {
    color: colors.status.critical,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  requestCard: {
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  requestPending: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.critical,
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requestCardType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  requestCardMeta: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  pendingBadge: {
    backgroundColor: colors.status.criticalLight,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  pendingBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.status.critical,
  },
  requestStatusPill: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  requestStatusPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalClose: {
    color: colors.beacon.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  modalUnitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalUnitInfo: {},
  modalUnitName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalUnitAgency: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  modalUnitTeam: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  modalResourceItem: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalResourceName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  statusOption: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: colors.beacon.primary,
    backgroundColor: colors.beacon.primaryLight,
  },
  statusOptionText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  statusOptionTextSelected: {
    color: colors.beacon.primary,
  },
  statusNoteInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.beacon.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

export default IncidentDetailScreen;
