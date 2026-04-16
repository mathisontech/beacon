# C-33: Channel Management UI
Priority: P1
Depends on: C-24
Estimated complexity: low

## What to build
Admin interface for managing group channels. Edit channel name/description, set permissions, delete channels, archive channels. Prevent deletion of system channels (announcements, emergency, etc).

## Files to create/modify
- app/community/groups/[id]/channels/manage/page.tsx
- lib/groups/updateChannel.ts
- lib/groups/deleteChannel.ts
- app/api/groups/[id]/channels/[channelId]/route.ts

## Inputs
- Channel ID
- New name, description, permissions
- Delete request (with confirmation)

## Outputs
- Updated group_channels record
- Audit log of channel changes

## UI Components
- ChannelSettingsForm (name, description, permissions)
- DeleteChannelButton (confirmation modal)
- ArchiveChannelButton (optional)
- PermissionSelector (public/member-only/mod-only)

## Acceptance criteria
- Only founder/admin can edit channels
- System channels cannot be deleted
- Archive channel option available
- Changes apply immediately
- Member notification on channel changes
- Can restore archived channels
- Audit trail of all changes

## Run this AFTER
C-24 complete

## Can run IN PARALLEL with
C-31, C-32, C-34

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. Create/rename/archive channels from UI
3. Permission check prevents non-admin channel creation
