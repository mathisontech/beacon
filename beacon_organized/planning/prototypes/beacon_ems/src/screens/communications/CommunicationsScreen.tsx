import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

type ConversationTab = 'all' | 'stakeholders' | 'teams' | 'mutual_aid';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  type: 'stakeholder' | 'team' | 'mutual_aid' | 'system';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: "Mayor's Office",
    type: 'stakeholder',
    lastMessage: 'Press conference scheduled for 4pm. Need latest casualty and shelter numbers.',
    lastMessageTime: '2 min',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'County EOC',
    type: 'stakeholder',
    lastMessage: 'Shelter capacity update: Lincoln High at 80%, need overflow location.',
    lastMessageTime: '15 min',
    unreadCount: 1,
  },
  {
    id: '3',
    name: 'Red Cross',
    type: 'mutual_aid',
    lastMessage: 'Volunteers staged at Community Center. Ready to deploy.',
    lastMessageTime: '1 hr',
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'Engine 7',
    type: 'team',
    lastMessage: 'On scene at Main St. Fire contained, conducting overhaul.',
    lastMessageTime: '2 hr',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'State EOC',
    type: 'stakeholder',
    lastMessage: 'Resource request received. National Guard deployment approved.',
    lastMessageTime: '3 hr',
    unreadCount: 0,
  },
  {
    id: '6',
    name: 'Rescue 3',
    type: 'team',
    lastMessage: 'MVA cleared. Returning to station.',
    lastMessageTime: '4 hr',
    unreadCount: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'Good afternoon. What is the current situation update?',
    timestamp: '3:30 PM',
    isOwn: false,
  },
  {
    id: '2',
    senderId: 'self',
    senderName: 'EMS Command',
    content: 'We have 3 active incidents related to the hurricane. Structure fire on Main St is 70% contained. MVA on Hwy 101 has been cleared.',
    timestamp: '3:35 PM',
    isOwn: true,
  },
  {
    id: '3',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'What about shelter status?',
    timestamp: '3:40 PM',
    isOwn: false,
  },
  {
    id: '4',
    senderId: 'self',
    senderName: 'EMS Command',
    content: '3 shelters open. Lincoln High at 80% capacity (340 evacuees), Community Center at 45% (120 evacuees), Riverside Church at 30% (85 evacuees). Total 545 evacuees housed.',
    timestamp: '3:42 PM',
    isOwn: true,
  },
  {
    id: '5',
    senderId: 'mayor',
    senderName: "Mayor's Office",
    content: 'Press conference scheduled for 4pm. Need latest casualty and shelter numbers.',
    timestamp: '3:45 PM',
    isOwn: false,
  },
];

const getTypeIcon = (type: Conversation['type']) => {
  switch (type) {
    case 'stakeholder': return '🏛️';
    case 'team': return '👥';
    case 'mutual_aid': return '🤝';
    case 'system': return '⚙️';
  }
};

export const CommunicationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConversationTab>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs: { key: ConversationTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'stakeholders', label: 'Stakeholders' },
    { key: 'teams', label: 'Field Teams' },
    { key: 'mutual_aid', label: 'Mutual Aid' },
  ];

  const filteredConversations = activeTab === 'all'
    ? mockConversations
    : mockConversations.filter((c) => {
        if (activeTab === 'stakeholders') return c.type === 'stakeholder';
        if (activeTab === 'teams') return c.type === 'team';
        if (activeTab === 'mutual_aid') return c.type === 'mutual_aid';
        return true;
      });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(Date.now()),
      senderId: 'self',
      senderName: 'EMS Command',
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderConversationItem = (conversation: Conversation) => (
    <TouchableOpacity
      key={conversation.id}
      style={[
        styles.conversationItem,
        selectedConversation?.id === conversation.id && styles.conversationItemSelected,
      ]}
      onPress={() => setSelectedConversation(conversation)}
    >
      <View style={styles.conversationAvatar}>
        <Text style={styles.avatarText}>{getTypeIcon(conversation.type)}</Text>
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, conversation.unreadCount > 0 && styles.textBold]} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={styles.conversationTime}>{conversation.lastMessageTime}</Text>
        </View>
        <Text style={[styles.conversationPreview, conversation.unreadCount > 0 && styles.textBold]} numberOfLines={2}>
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[styles.messageContainer, message.isOwn && styles.messageContainerOwn]}
    >
      <View style={[styles.messageBubble, message.isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
        {!message.isOwn && (
          <Text style={styles.messageSender}>{message.senderName}</Text>
        )}
        <Text style={[styles.messageText, message.isOwn && styles.messageTextOwn]}>
          {message.content}
        </Text>
        <Text style={[styles.messageTime, message.isOwn && styles.messageTimeOwn]}>
          {message.timestamp}
        </Text>
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
        <TouchableOpacity style={styles.newMessageButton}>
          <Text style={styles.newMessageButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Conversations List */}
        <View style={styles.conversationsList}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredConversations.map(renderConversationItem)}
          </ScrollView>
        </View>

        {/* Chat View */}
        <View style={styles.chatView}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View style={styles.chatHeaderInfo}>
                  <Text style={styles.chatHeaderIcon}>{getTypeIcon(selectedConversation.type)}</Text>
                  <View>
                    <Text style={styles.chatHeaderName}>{selectedConversation.name}</Text>
                    <Text style={styles.chatHeaderType}>{selectedConversation.type}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.chatHeaderAction}>
                  <Text style={styles.chatHeaderActionText}>•••</Text>
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map(renderMessage)}
              </ScrollView>

              {/* Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.text.muted}
                  value={messageInput}
                  onChangeText={setMessageInput}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !messageInput.trim() && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Text style={styles.sendButtonText}>➤</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Select a conversation</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    flex: 1,
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
  newMessageButton: {
    backgroundColor: colors.beacon.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  newMessageButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationsList: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: colors.border.default,
  },
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
  conversationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  textBold: {
    fontWeight: typography.weights.bold,
  },
  conversationTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  conversationPreview: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.4,
  },
  unreadBadge: {
    backgroundColor: colors.beacon.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  unreadText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  chatView: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  chatHeaderName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  chatHeaderType: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  chatHeaderAction: {
    padding: spacing.sm,
  },
  chatHeaderActionText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  messageContainerOwn: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  messageBubbleOther: {
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageBubbleOwn: {
    backgroundColor: colors.beacon.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  messageSender: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.beacon.primary,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: typography.sizes.md * 1.5,
  },
  messageTextOwn: {
    color: colors.white,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    maxHeight: 100,
    marginRight: spacing.sm,
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
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
    color: colors.white,
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
});

export default CommunicationsScreen;
