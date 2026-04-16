# C-24: Group Channels Manager
Priority: P1
Depends on: C-22
Estimated complexity: medium

## What to build
Per-group channel management. System channels: announcements, emergency, weather, evacuation, resources. Founders/admins create custom channels. Set permissions per channel (public, member-only, mod-only). List channels with unread count.

## Files to create/modify
- app/community/groups/[id]/channels/page.tsx
- lib/groups/createChannel.ts
- lib/groups/updateChannelPermissions.ts
- app/api/groups/[id]/channels/route.ts
- database migration (group_channels table)

## Inputs
- Channel name
- Channel type (system or custom)
- Channel permissions (public, member-only, mod-only)

## Outputs
- group_channels records: group_id, name, type, permissions, created_by
- System channels created on group creation
- Used by C-27 (messaging) to route messages

## UI Components
- ChannelList (with unread badge, pin icon)
- CreateChannelForm (modal, name + permission select)
- ChannelSettingsButton (rename, delete, permissions)
- UnreadBadge (count display)

## Acceptance criteria
- System channels auto-created on group setup
- Founders/admins can create custom channels
- Delete channel requires confirmation
- Permissions enforced in messaging
- Unread count tracked per user per channel
- Can mute individual channels

## Run this AFTER
C-22 complete

## Can run IN PARALLEL with
C-23, C-25, C-26

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/groups/[id]/channels creates channel
3. GET /api/groups/[id]/channels returns list
4. Exported `Channel` type importable
