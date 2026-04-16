# C-22: Role & Permission Engine
Priority: P0
Depends on: C-21
Estimated complexity: high

## What to build
Role-based permission matrix: founder, admin, moderator, member, follower. Each role has specific capabilities (delete group, set policies, remove members, etc). Check permissions on all group actions. Support role transfers and assignments.

## Files to create/modify
- lib/groups/checkPermission.ts
- lib/groups/assignRole.ts
- lib/groups/transferFounder.ts
- app/api/groups/[id]/members/[userId]/role/route.ts
- lib/groups/PERMISSIONS_MATRIX.ts (define all permissions)

## Inputs
- User ID, group ID, action name
- Role assignment (from founder/admin to user)

## Outputs
- Permission check returns true/false
- Role assignment creates audit log entry
- Unauthorized actions return 403

## UI Components
- PermissionChecker (used by all group UI)
- RoleAssignmentDialog (founder assigns roles)
- PermissionExplanation (tooltips on restricted actions)

## Acceptance criteria
- All 15+ permissions working correctly
- Founder can delete group, transfer ownership
- Admins can set policies, assign roles
- Mods can remove members, pin messages
- Members can send messages, update location
- Followers can view broadcasts
- Role transfer updates founder immediately
- Audit trail of all role changes

## Run this AFTER
C-21 complete

## Can run IN PARALLEL with
C-23, C-24

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. Role hierarchy enforced: founder > admin > mod > member > follower
3. Admin cannot remove founder
4. Mod cannot change policies
5. `checkPermission(userId, groupId, action)` function exported and working
