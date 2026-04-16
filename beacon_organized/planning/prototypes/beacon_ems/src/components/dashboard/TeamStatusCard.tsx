import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows, touchTargets } from '../../theme/tokens';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  location?: string;
  lastSeen?: string;
}

interface TeamStatusCardProps {
  members: TeamMember[];
  onlineCount: number;
  totalCount: number;
  onViewAll: () => void;
  onMemberPress?: (member: TeamMember) => void;
}

const getStatusColor = (status: TeamMember['status']) => {
  switch (status) {
    case 'online':
      return colors.status.online;
    case 'busy':
      return colors.status.busy;
    case 'offline':
      return colors.status.offline;
  }
};

const getStatusLabel = (status: TeamMember['status']) => {
  switch (status) {
    case 'online':
      return 'Available';
    case 'busy':
      return 'On Call';
    case 'offline':
      return 'Offline';
  }
};

export const TeamStatusCard: React.FC<TeamStatusCardProps> = ({
  members,
  onlineCount,
  totalCount,
  onViewAll,
  onMemberPress,
}) => {
  const displayMembers = members.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Team Status</Text>
          <Text style={styles.subtitle}>
            {onlineCount} of {totalCount} online
          </Text>
        </View>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.membersList}>
        {displayMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberRow}
            onPress={() => onMemberPress?.(member)}
            activeOpacity={0.7}
          >
            <View style={styles.memberInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(member.status) },
                  ]}
                />
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text style={styles.memberRole} numberOfLines={1}>
                  {member.role}
                </Text>
              </View>
            </View>
            <View style={styles.memberStatus}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(member.status) },
                ]}
              >
                {getStatusLabel(member.status)}
              </Text>
              {member.location && (
                <Text style={styles.locationText} numberOfLines={1}>
                  {member.location}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {members.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No team members</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  viewAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
  membersList: {
    gap: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: touchTargets.minimum,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beacon.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  memberRole: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  memberStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  locationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
    maxWidth: 100,
  },
  emptyState: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
});

export default TeamStatusCard;
