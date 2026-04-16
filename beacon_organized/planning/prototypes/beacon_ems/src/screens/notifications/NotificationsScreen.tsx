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
interface Notification {
  id: string;
  type: 'alert' | 'assignment' | 'message' | 'status' | 'system' | 'weather' | 'resource';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionable?: boolean;
  relatedId?: string;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'weather',
    title: 'Hurricane Warning Issued',
    description: 'NWS has issued a hurricane warning for coastal areas. Category 2 expected within 12 hours.',
    timestamp: '2 min ago',
    read: false,
    priority: 'critical',
    actionable: true,
  },
  {
    id: '2',
    type: 'assignment',
    title: 'New Incident Assignment',
    description: 'Engine 7 assigned to Structure Fire at 1234 Main St. Respond immediately.',
    timestamp: '5 min ago',
    read: false,
    priority: 'critical',
    actionable: true,
    relatedId: 'incident-1',
  },
  {
    id: '3',
    type: 'resource',
    title: 'Mutual Aid Request',
    description: 'County Fire requesting additional engine support for brush fire on Hillside Rd.',
    timestamp: '15 min ago',
    read: false,
    priority: 'high',
    actionable: true,
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message from Mayor\'s Office',
    description: 'Press conference scheduled for 4pm. Requesting latest status update.',
    timestamp: '30 min ago',
    read: false,
    priority: 'medium',
    relatedId: 'msg-1',
  },
  {
    id: '5',
    type: 'status',
    title: 'Unit Status Change',
    description: 'Medic 5 changed status to Available. Returning to Station 5.',
    timestamp: '45 min ago',
    read: true,
    priority: 'low',
  },
  {
    id: '6',
    type: 'alert',
    title: 'Flood Watch Extended',
    description: 'Flood watch extended until midnight for zones C and D.',
    timestamp: '1 hr ago',
    read: true,
    priority: 'medium',
  },
  {
    id: '7',
    type: 'system',
    title: 'System Update',
    description: 'Radio channel 5 experiencing intermittent issues. Use backup channel 7.',
    timestamp: '2 hr ago',
    read: true,
    priority: 'medium',
  },
  {
    id: '8',
    type: 'assignment',
    title: 'Incident Resolved',
    description: 'MVA at Hwy 101 & Oak Ave has been resolved. All units cleared.',
    timestamp: '3 hr ago',
    read: true,
    priority: 'low',
    relatedId: 'incident-2',
  },
  {
    id: '9',
    type: 'resource',
    title: 'Resource Deployed',
    description: 'Red Cross volunteers deployed to Lincoln High School shelter.',
    timestamp: '4 hr ago',
    read: true,
    priority: 'low',
  },
];

// Components
const NotificationCard: React.FC<{
  notification: Notification;
  onPress: () => void;
  onMarkRead: () => void;
}> = ({ notification, onPress, onMarkRead }) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'weather': return '🌀';
      case 'assignment': return '🚨';
      case 'message': return '💬';
      case 'status': return '📊';
      case 'system': return '⚙️';
      case 'alert': return '⚠️';
      case 'resource': return '🚑';
      default: return '📋';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical': return colors.status.critical;
      case 'high': return colors.status.warning;
      case 'medium': return colors.status.info;
      case 'low': return colors.text.muted;
      default: return colors.text.muted;
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'weather': return 'Weather';
      case 'assignment': return 'Assignment';
      case 'message': return 'Message';
      case 'status': return 'Status';
      case 'system': return 'System';
      case 'alert': return 'Alert';
      case 'resource': return 'Resource';
      default: return 'Notification';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard,
        { borderLeftColor: getPriorityColor() },
      ]}
      onPress={onPress}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationMeta}>
          <Text style={styles.notificationIcon}>{getTypeIcon()}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.typeBadgeText}>{getTypeLabel()}</Text>
          </View>
          <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
        </View>
        {!notification.read && (
          <TouchableOpacity style={styles.markReadButton} onPress={onMarkRead}>
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
        {notification.title}
      </Text>
      <Text style={styles.notificationDescription}>{notification.description}</Text>
      {notification.actionable && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
          {notification.type === 'resource' && (
            <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
              <Text style={styles.primaryActionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications
    .filter(n => !filterType || n.type === filterType)
    .filter(n => !showUnreadOnly || !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllRead}>
              <Text style={styles.headerButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
            <Text style={styles.headerButtonText}>Clear Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, !filterType && styles.filterChipActive]}
            onPress={() => setFilterType(null)}
          >
            <Text style={[styles.filterChipText, !filterType && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'weather' && styles.filterChipActive]}
            onPress={() => setFilterType('weather')}
          >
            <Text style={[styles.filterChipText, filterType === 'weather' && styles.filterChipTextActive]}>Weather</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'assignment' && styles.filterChipActive]}
            onPress={() => setFilterType('assignment')}
          >
            <Text style={[styles.filterChipText, filterType === 'assignment' && styles.filterChipTextActive]}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'alert' && styles.filterChipActive]}
            onPress={() => setFilterType('alert')}
          >
            <Text style={[styles.filterChipText, filterType === 'alert' && styles.filterChipTextActive]}>Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'resource' && styles.filterChipActive]}
            onPress={() => setFilterType('resource')}
          >
            <Text style={[styles.filterChipText, filterType === 'resource' && styles.filterChipTextActive]}>Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'system' && styles.filterChipActive]}
            onPress={() => setFilterType('system')}
          >
            <Text style={[styles.filterChipText, filterType === 'system' && styles.filterChipTextActive]}>System</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={[styles.unreadToggle, showUnreadOnly && styles.unreadToggleActive]}
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <Text style={[styles.unreadToggleText, showUnreadOnly && styles.unreadToggleTextActive]}>
            Unread Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              {showUnreadOnly ? 'No unread notifications' : 'You\'re all caught up!'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => console.log('View notification:', notification.id)}
              onMarkRead={() => handleMarkRead(notification.id)}
            />
          ))
        )}
      </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.status.critical,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  unreadBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  filterScroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.beacon.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  unreadToggle: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  unreadToggleActive: {
    backgroundColor: colors.beacon.primaryLight,
    borderColor: colors.beacon.primary,
  },
  unreadToggleText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  unreadToggleTextActive: {
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

  // Notification Card
  notificationCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderLeftWidth: 4,
  },
  unreadCard: {
    backgroundColor: colors.background.secondary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationIcon: {
    fontSize: 16,
  },
  typeBadge: {
    paddingVertical: 1,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  notificationTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  markReadButton: {
    padding: spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.beacon.primary,
  },
  notificationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: typography.weights.semibold,
  },
  notificationDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  primaryActionButton: {
    backgroundColor: colors.beacon.primary,
    borderColor: colors.beacon.primary,
  },
  primaryActionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
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
    textAlign: 'center',
  },
});

export default NotificationsScreen;
