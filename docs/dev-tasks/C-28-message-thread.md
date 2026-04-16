# C-28: Group Message Thread UI
Priority: P0
Depends on: C-27
Estimated complexity: high

## What to build
Chat UI for group channels. Real-time message display with sender info (name, photo), timestamps, read receipts. Auto-scroll to newest. Input form for typing. Infinite scroll for older messages. Connection status indicator.

## Files to create/modify
- app/community/groups/[id]/channels/[channelId]/page.tsx
- lib/messages/fetchMessages.ts
- lib/messages/subscribeToMessages.ts
- lib/realtime/messageSocket.ts
- app/api/groups/[id]/channels/[channelId]/messages/route.ts

## Inputs
- Group ID, channel ID
- Incoming WebSocket messages

## Outputs
- Message list with pagination (50 per page)
- Real-time updates via WebSocket
- Read receipts sent on view

## UI Components
- MessageThread (scrollable list)
- MessageItem (sender info, timestamp, text, reactions)
- MessageInput (text area, send button, typing indicator)
- ReadReceipts (checkmark for sent, read)
- ConnectionStatus (online/offline indicator)
- LoadingMore (infinite scroll)

## Acceptance criteria
- Messages load in reverse chronological order
- Real-time messages appear instantly
- Infinite scroll for older messages
- Read receipts work correctly
- Typing indicator shows who's typing
- Connection status visible
- Works offline with queue (see C-32)
- Reactions support (emoji react)

## Run this AFTER
C-27 complete

## Can run IN PARALLEL with
C-29, C-30, C-31

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. MessageThread renders messages with timestamps and sender
3. New message appears in thread after POST
4. Scroll-to-bottom on new message
