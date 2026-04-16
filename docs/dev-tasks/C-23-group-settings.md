# C-23: Group Settings & Policies
Priority: P1
Depends on: C-22
Estimated complexity: medium

## What to build
Settings panel for group founders/admins. Set location sharing defaults, event protocols, moderation policies, welcome message. Store policies in group_policies table as key-value pairs.

## Files to create/modify
- app/community/groups/[id]/settings/page.tsx
- lib/groups/updatePolicy.ts
- app/api/groups/[id]/policies/route.ts
- database migration (group_policies table)

## Inputs
- Default location sharing mode (full, block, neighborhood, hidden)
- Event protocols (auto-generate channels on emergency)
- Moderation mode (anyone, members-only, admin-only)
- Welcome message

## Outputs
- group_policies records: group_id, key, value (JSON serialized)
- Policies enforced in group actions
- Members see policies on join

## UI Components
- SettingsPanel (tabbed: general, location, moderation, event)
- PolicyToggle (on/off with description)
- PolicySelect (dropdown for mode selection)
- SaveChangesButton (with success feedback)

## Acceptance criteria
- Only founder/admin can modify settings
- Settings persist and apply immediately
- Location sharing policy enforced in all queries
- Moderation policy controls who can chat
- Event protocols trigger auto-channels
- Settings visible to all members (read-only)

## Run this AFTER
C-22 complete

## Can run IN PARALLEL with
C-24, C-25, C-26

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. PUT /api/groups/[id]/settings updates policies
3. Only admin+ can update settings (permission check)
