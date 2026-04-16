import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface MessagePreview {
  id: string;
  senderName: string;
  senderType: 'stakeholder' | 'team' | 'mutual_aid' | 'system';
  preview: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
}

interface CommunicationsStreamProps {
  messages: MessagePreview[];
  onMessagePress?: (message: MessagePreview) => void;
  onViewAll?: () => void;
  maxItems?: number;
}

export const CommunicationsStream: React.FC<CommunicationsStreamProps> = ({
  messages,
  onMessagePress,
  onViewAll,
  maxItems = 5,
}) => {
  const displayMessages = messages.slice(0, maxItems);

  if (displayMessages.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No messages</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {displayMessages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[styles.messageItem, message.unread && styles.messageUnread]}
            onPress={() => onMessagePress?.(message)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{message.senderName.charAt(0)}</Text>
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.senderName, message.unread && styles.textUnread]} numberOfLines={1}>
                  {message.senderName}
                </Text>
                <Text style={styles.timestamp}>{message.timestamp}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {message.preview}
              </Text>
            </View>
            {message.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {onViewAll && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All Messages →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  messageUnread: {
    backgroundColor: colors.background.cardElevated,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 16,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  textUnread: {
    fontWeight: typography.weights.bold,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  preview: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: typography.sizes.xs * 1.4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.beacon.primary,
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
  },
  viewAllButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    color: colors.beacon.primary,
    fontWeight: typography.weights.medium,
  },
});

export default CommunicationsStream;
