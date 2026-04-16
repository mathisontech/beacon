# C-20: Invite Code System
Priority: P0
Depends on: C-17
Estimated complexity: medium

## What to build
Generate unique invite codes (12-char alphanumeric) for groups. Track usage: single-use or multi-use. Codes expire after 30 days. Admin can generate new codes anytime. UI to share code and track usage.

## Files to create/modify
- lib/groups/generateInviteCode.ts
- lib/groups/validateInviteCode.ts
- app/api/groups/[id]/invites/route.ts
- app/api/invites/validate/route.ts
- database migration (group_invites table)

## Inputs
- Group ID
- Code generation request (multi-use or single-use)

## Outputs
- group_invites record: group_id, code, created_by, expires_at, used_by (array), used_at
- Shareable URL with code: /groups/join?code=ABC123XYZ123
- Usage statistics (how many people joined with this code)

## UI Components
- InviteCodeDisplay (copy button, QR code)
- GenerateNewCodeButton
- CodeUsageStats (joined count, expiry countdown)
- ShareInviteLink (SMS/email/social copy)

## Acceptance criteria
- Codes generated unique and random
- Single-use: only one person per code
- Multi-use: unlimited joins per code
- Codes expire after 30 days automatically
- Can generate new codes anytime
- Usage history tracked
- URL sharing works (pre-fills code)

## Run this AFTER
C-17 complete

## Can run IN PARALLEL with
C-19, C-21

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/groups/[id]/invite generates 12-char code
3. Code expires after 30 days
4. Used code cannot be reused (single-use)
