# C-30: Status Update System
Priority: P0
Depends on: C-01
Estimated complexity: medium

## What to build
User status broadcast buttons: safe, sheltering, evacuating, needs help. Status visible to emergency contacts and group members (with location privacy rules). Expire after 24 hours or manual clear. Status history stored.

## Files to create/modify
- app/community/status/page.tsx
- lib/status/updateStatus.ts
- lib/status/getGroupStatus.ts
- lib/status/expireStatus.ts
- app/api/status/route.ts
- database migration (user_status table)

## Inputs
- Status enum (safe, sheltering, evacuating, needs_help)
- Optional: location, message

## Outputs
- user_status record: user_id, status, timestamp, group_id, expires_at
- Broadcasts to emergency contacts
- Broadcasts to group members (with privacy filter)
- Notification sent to receivers

## UI Components
- StatusButton (for each status type)
- StatusCard (show current status)
- GroupStatusDashboard (show all member statuses for admin)
- ClearStatusButton

## Acceptance criteria
- 4 status types available
- Status auto-expires after 24 hours
- Emergency contacts notified immediately
- Group members see status in chat
- Location privacy rules enforced in broadcasts
- Can manually clear status
- Status history saved (see C-34)

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
Most tasks

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/users/[id]/status sets current status
3. Status options: safe, sheltering, evacuating, helping, needsHelp
4. Exported `UserStatus` type importable
