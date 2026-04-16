# C-13: Phone Contact Import
Priority: P1
Depends on: C-03
Estimated complexity: medium

## What to build
Request phone contacts permission, scan local contacts, match against Beacon users via phone lookup. Display matched users with profile info and invite status. Allow bulk import of emergency contacts.

## Files to create/modify
- app/community/contacts/import/page.tsx
- lib/contacts/importPhoneContacts.ts
- lib/contacts/matchUsers.ts
- app/api/contacts/import/route.ts

## Inputs
- Phone contacts from device (requires permission request)
- User confirmation to import selected contacts

## Outputs
- Contact matches linked to user_id if found
- Unmatched contacts marked as "not registered"
- Invites sent to unregistered contacts

## UI Components
- PermissionRequest (Contacts API access)
- ContactImportList (match status, profile preview)
- SelectAllCheckbox (bulk import)
- MatchConfirmation (summary before import)

## Acceptance criteria
- iOS/Android permission request working
- Phone number normalization matches registered users
- Shows matched user profiles with location
- Can select subset of contacts to import
- Sends invites to non-registered contacts
- Shows "already imported" for existing contacts

## Run this AFTER
C-03 complete

## Can run IN PARALLEL with
C-14, C-15, C-16

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. PhoneContactImporter parses contact array input
3. Matching logic finds existing users by normalized phone
