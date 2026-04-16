# C-11: Emergency Contact Manager
Priority: P0
Depends on: C-01
Estimated complexity: medium

## What to build
List-based UI to add/remove/edit emergency contacts. Each contact has relationship type (spouse, parent, sibling, friend), location (near/far), and priority order. Drag-to-reorder. Send invites to contacts.

## Files to create/modify
- app/community/contacts/emergency/page.tsx
- lib/contacts/addEmergencyContact.ts
- lib/contacts/reorderContacts.ts
- app/api/contacts/emergency/route.ts
- database migration (emergency_contacts table)

## Inputs
- Contact name
- Phone number (E.164)
- Relationship type (dropdown)
- Location type (near home, far away)
- Priority (draggable)

## Outputs
- emergency_contacts table: user_id, contact_user_id (if registered), phone, relationship, location, priority
- Invite sent to contact email/SMS
- Order stored as priority field

## UI Components
- EmergencyContactList (drag-to-reorder, edit/delete buttons)
- AddContactForm (name, phone, relationship, location)
- ReorderHandle (drag-drop UI)
- InviteStatus (sent/accepted/pending)

## Acceptance criteria
- Can add up to 20 emergency contacts
- Drag-to-reorder saves new order
- Delete confirmation required
- Invites sent via email and SMS
- Can edit contact info anytime
- Phone numbers validated before saving

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-07, C-08, C-09, C-10

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. EmergencyContactList renders
3. POST /api/users/[id]/emergency-contacts creates ordered contact
4. GET returns contacts sorted by priority
5. Exported `EmergencyContact` type importable
