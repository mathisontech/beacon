# C-21: Membership State Machine
Priority: P0
Depends on: C-17
Estimated complexity: high

## What to build
Membership state machine: invited → pending → member (or follower). Handle join via invite code, group discovery, and direct requests. Track membership status and transitions. Implement role-based access from C-22.

## Files to create/modify
- lib/groups/joinGroup.ts
- lib/groups/sendJoinRequest.ts
- lib/groups/respondToRequest.ts
- app/api/groups/[id]/members/route.ts
- app/api/groups/[id]/join/route.ts
- database migration (group_members table with status enum)

## Inputs
- Group ID and invite code (optional)
- User ID to add
- Join request response (accept/reject)

## Outputs
- group_members record: group_id, user_id, role (member/follower), location_share_mode, joined_at, status
- Status transitions logged
- Role assigned based on join type and group settings

## UI Components
- JoinGroupButton (trigger join or request)
- PendingRequestNotification
- JoinRequestModal (invite code entry for private groups)
- MemberListWithStatus (show member status)

## Acceptance criteria
- Join via code: immediate member status
- Join via discovery: pending if invite-only
- Join requests: notification to admins
- Status transitions logged with timestamp
- Can leave group anytime
- State machine prevents invalid transitions
- Followers vs members distinction clear

## Run this AFTER
C-17 complete

## Can run IN PARALLEL with
C-19, C-20

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. States: invited → pending → member (or follower → member)
3. POST /api/groups/[id]/join creates pending membership
4. PUT /api/groups/[id]/members/[uid]/approve transitions to member
5. Exported `MembershipState`, `MemberRole` types importable
