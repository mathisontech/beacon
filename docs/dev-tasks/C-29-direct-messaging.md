# C-29: Direct Messaging
Priority: P1
Depends on: C-27
Estimated complexity: medium

## What to build
1:1 encrypted messaging between users. Similar to C-28 but with direct_messages table and two-party encryption. List of active conversations. Notification for new DMs. User can block others.

## Files to create/modify
- app/community/messages/direct/page.tsx
- lib/messages/sendDirectMessage.ts
- lib/messages/getConversations.ts
- lib/messages/blockUser.ts
- app/api/messages/direct/route.ts
- database migration (direct_messages table, blocks table)

## Inputs
- Recipient user ID
- Message text

## Outputs
- direct_messages record: sender_id, recipient_id, text, timestamp, encrypted_blob
- Conversation list shows latest message
- Notification sent to recipient

## UI Components
- ConversationList (recent DMs, search)
- DirectMessageThread (similar to C-28 UI)
- UserProfileCard (recipient info in header)
- BlockUserButton
- BlockedUsersList (manage blocked users)

## Acceptance criteria
- Can message any user (unless blocked)
- Encryption uses symmetric key between parties
- Notifications for new messages
- Can block/unblock users
- Block prevents message sending
- Delete message option available
- Conversation list sorts by recency

## Run this AFTER
C-27 complete

## Can run IN PARALLEL with
C-28, C-30, C-31

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/dm creates direct message
3. GET /api/dm/[conversationId] returns thread
