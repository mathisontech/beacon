# C-16: Contact Invite Flow
Priority: P1
Depends on: C-11
Estimated complexity: low

## What to build
Send invites to non-Beacon contacts via SMS and email. Generate shareable invite link with unique code. Track invite status (sent, opened, registered). Display invite code in contacts UI.

## Files to create/modify
- lib/invites/generateCode.ts
- lib/invites/sendInvite.ts
- app/api/invites/send/route.ts
- app/api/invites/status/route.ts
- Update C-11 to show invite status
- database migration (contact_invites table)

## Inputs
- Contact phone/email
- Invite message (optional custom text)

## Outputs
- contact_invites record: inviter_id, phone, email, invite_code, status, created_at, expires_at
- SMS/email sent with invite link
- Unique invite code (12-char alphanumeric)
- Invite link valid for 30 days

## UI Components
- InviteButton (in contact list)
- InviteModal (phone/email entry, custom message)
- InviteStatusBadge (sent/opened/registered)
- ShareInviteLink (copy to clipboard)

## Acceptance criteria
- Invite code generated (12-char unique)
- SMS and email sent within 1 minute
- Status updated when link clicked
- Status shows when contact registers
- Invites expire after 30 days
- Can resend invites

## Run this AFTER
C-11 complete

## Can run IN PARALLEL with
C-13, C-14, C-15

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/contacts/invite generates invite code
3. Invite code is 12-char alphanumeric
4. Expired invites return 410
