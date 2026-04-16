import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

// Types
interface Conversation {
  id: string;
  name: string;
  type: 'team' | 'stakeholder' | 'mutual_aid' | 'dispatch' | 'group';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
  status?: 'online' | 'busy' | 'offline';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: "Mayor's Office",
    type: 'stakeholder',
    lastMessage: 'Press conference scheduled for 4pm. Need latest casualty and shelter numbers.',
    timestamp: '2 min',
    unreadCount: 2,
    status: 'online',
  },
  {
    id: '2',
    name: 'County EOC',
    type: 'stakeholder',
    lastMessage: 'Shelter capacity update: Lincoln High at 80%, need overflow location.',
    timestamp: '15 min',
    unreadCount: 1,
    status: 'online',
  },
  {
    id: '3',
    name: 'Red Cross - Local Chapter',
    type: 'mutual_aid',
    lastMessage: 'Volunteers staged at Community Center. Ready to deploy.',
    timestamp: '1 hr',
    unreadCount: 0,
    status: 'online',
  },
  {
    id: '4',
    name: 'Engine 7',
    type: 'team',
    lastMessage: 'On scene at Main St. Fire contained, conducting overhaul.',
    timestamp: '2 hr',
    unreadCount: 0,
    status: 'busy',
  },
  {
    id: '5',
    name: 'Central Dispatch',
    type: 'dispatch',
    lastMessage: 'New incident: Medical emergency at 789 Oak Ave. ALS requested.',
    timestamp: '3 hr',
    unreadCount: 0,
    status: 'online',
  },
  {
    id: '6',
    name: 'Hurricane Response Team',
    type: 'group',
    lastMessage: 'Chief: All units check in for accountability.',
    timestamp: '4 hr',
    unreadCount: 3,
    status: 'online',
  },
  {
    id: '7',
    name: 'State Police - Region 5',
    type: 'mutual_aid',
    lastMessage: 'Traffic control established on Hwy 101.',
    timestamp: '5 hr',
    unreadCount: 0,
    status: 'offline',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'Good afternoon, Chief. We have a press conference scheduled for 4pm.',
    timestamp: '2:15 PM',
    isOwn: false,
    status: 'read',
  },
  {
    id: '2',
    senderId: 'me',
    senderName: 'You',
    content: 'Understood. I will have the latest numbers ready.',
    timestamp: '2:18 PM',
    isOwn: true,
    status: 'read',
  },
  {
    id: '3',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'We need casualty counts, shelter capacity, and resource deployment status.',
    timestamp: '2:20 PM',
    isOwn: false,
    status: 'read',
  },
  {
    id: '4',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'Also, any updates on the flood zones would be helpful for the public advisory.',
    timestamp: '2:21 PM',
    isOwn: false,
    status: 'delivered',
  },
];

// Components
const ConversationItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onPress: () => void;
}> = ({ conversation, isSelected, onPress }) => {
  const getTypeColor = () => {
    switch (conversation.type) {
      case 'team': return colors.status.info;
      case 'stakeholder': return colors.status.warning;
      case 'mutual_aid': return colors.status.online;
      case 'dispatch': return colors.status.critical;
      case 'group': return colors.beacon.primary;
      default: return colors.text.muted;
    }
  };

  const getTypeLabel = () => {
    switch (conversation.type) {
      case 'team': return 'Team';
      case 'stakeholder': return 'Stakeholder';
      case 'mutual_aid': return 'Mutual Aid';
      case 'dispatch': return 'Dispatch';
      case 'group': return 'Group';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (conversation.status) {
      case 'online': return colors.status.online;
      case 'busy': return colors.status.warning;
      case 'offline': return colors.text.muted;
      default: return colors.text.muted;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.conversationItem, isSelected && styles.conversationItemSelected]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { borderColor: getTypeColor() }]}>
          <Text style={styles.avatarText}>{conversation.name.charAt(0)}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>{conversation.name}</Text>
          <Text style={styles.conversationTimestamp}>{conversation.timestamp}</Text>
        </View>
        <View style={styles.conversationMeta}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeBadgeText}>{getTypeLabel()}</Text>
          </View>
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>{conversation.lastMessage}</Text>
      </View>
      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
  <View style={[styles.messageBubble, message.isOwn ? styles.ownMessage : styles.otherMessage]}>
    {!message.isOwn && (
      <Text style={styles.senderName}>{message.senderName}</Text>
    )}
    <Text style={[styles.messageContent, message.isOwn && styles.ownMessageText]}>
      {message.content}
    </Text>
    <View style={styles.messageFooter}>
      <Text style={[styles.messageTimestamp, message.isOwn && styles.ownTimestamp]}>
        {message.timestamp}
      </Text>
      {message.isOwn && (
        <Text style={styles.messageStatus}>
          {message.status === 'read' ? '✓✓' : '✓'}
        </Text>
      )}
    </View>
  </View>
);

export const MessagesScreen: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    IS_MOBILE ? null : mockConversations[0]
  );
  const [filterType, setFilterType] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const filteredConversations = filterType
    ? mockConversations.filter(c => c.type === filterType)
    : mockConversations;

  const unreadTotal = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const renderConversationList = () => (
    <View style={[styles.conversationList, !IS_MOBILE && styles.conversationListDesktop]}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Messages</Text>
        {unreadTotal > 0 && (
          <View style={styles.totalUnread}>
            <Text style={styles.totalUnreadText}>{unreadTotal}</Text>
          </View>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, !filterType && styles.filterChipActive]}
          onPress={() => setFilterType(null)}
        >
          <Text style={[styles.filterChipText, !filterType && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'team' && styles.filterChipActive]}
          onPress={() => setFilterType('team')}
        >
          <Text style={[styles.filterChipText, filterType === 'team' && styles.filterChipTextActive]}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'stakeholder' && styles.filterChipActive]}
          onPress={() => setFilterType('stakeholder')}
        >
          <Text style={[styles.filterChipText, filterType === 'stakeholder' && styles.filterChipTextActive]}>Stakeholders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'mutual_aid' && styles.filterChipActive]}
          onPress={() => setFilterType('mutual_aid')}
        >
          <Text style={[styles.filterChipText, filterType === 'mutual_aid' && styles.filterChipTextActive]}>Mutual Aid</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'dispatch' && styles.filterChipActive]}
          onPress={() => setFilterType('dispatch')}
        >
          <Text style={[styles.filterChipText, filterType === 'dispatch' && styles.filterChipTextActive]}>Dispatch</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.conversationScroll}>
        {filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation?.id === conversation.id}
            onPress={() => setSelectedConversation(conversation)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderChatView = () => (
    <View style={styles.chatView}>
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            {IS_MOBILE && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedConversation(null)}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            )}
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{selectedConversation.name}</Text>
              <Text style={styles.chatHeaderStatus}>
                {selectedConversation.status === 'online' ? 'Online' :
                 selectedConversation.status === 'busy' ? 'Busy' : 'Offline'}
              </Text>
            </View>
            <TouchableOpacity style={styles.chatHeaderAction}>
              <Text style={styles.chatHeaderActionText}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messagesScroll} contentContainerStyle={styles.messagesContent}>
            {mockMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.text.muted}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !messageInput.trim() && styles.sendButtonDisabled]}
              disabled={!messageInput.trim()}
            >
              <Text style={styles.sendButtonText}>→</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.noChatSelected}>
          <Text style={styles.noChatIcon}>💬</Text>
          <Text style={styles.noChatTitle}>Select a conversation</Text>
          <Text style={styles.noChatSubtitle}>Choose from your messages to start chatting</Text>
        </View>
      )}
    </View>
  );

  // Mobile: Show either list or chat
  if (IS_MOBILE) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
        {selectedConversation ? renderChatView() : renderConversationList()}
      </SafeAreaView>
    );
  }

  // Desktop: Side by side
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <View style={styles.desktopLayout}>
        {renderConversationList()}
        {renderChatView()}
      </View>
    </SafeAreaView>
  );
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

  // Conversation List
  conversationList: {
    flex: 1,
  },
  conversationListDesktop: {
    maxWidth: 350,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  listTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalUnread: {
    backgroundColor: colors.status.critical,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  totalUnreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
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
  conversationScroll: {
    flex: 1,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  conversationItemSelected: {
    backgroundColor: colors.background.card,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  conversationTimestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginLeft: spacing.sm,
  },
  conversationMeta: {
    flexDirection: 'row',
    marginTop: 2,
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
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: colors.status.critical,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },

  // Chat View
  chatView: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  chatHeaderStatus: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  chatHeaderAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderActionText: {
    fontSize: 20,
    color: colors.text.primary,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Message Bubble
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.beacon.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginBottom: 2,
  },
  messageContent: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  messageTimestamp: {
    fontSize: 10,
    color: colors.text.muted,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageStatus: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.sm,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.beacon.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  sendButtonText: {
    fontSize: 20,
    color: colors.white,
  },

  // No Chat Selected
  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noChatIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  noChatTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  noChatSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
});

export default MessagesScreen;
