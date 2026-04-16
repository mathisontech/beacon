# C-12: Contact Ordering & Priorities
Priority: P0
Depends on: C-11
Estimated complexity: low

## What to build
Drag-to-reorder interface for emergency contacts. Visual priority ranking (1st, 2nd, 3rd, etc). Save order via API. Real-time UI feedback. Uses existing emergency contacts list.

## Files to create/modify
- lib/contacts/updateContactOrder.ts
- app/api/contacts/emergency/order/route.ts
- Update C-11 component to support drag-drop

## Inputs
- Contact IDs in new order

## Outputs
- emergency_contacts priority field updated
- Order persisted in database

## UI Components
- DraggableContactItem (drag handle, priority number)
- ReorderNotification (showing updates)

## Acceptance criteria
- Drag-drop smooth and responsive
- Priority numbers update in real-time
- Changes save on drop (no manual save button)
- Can reorder unlimited times
- Mobile-friendly drag experience
- Undo available if needed

## Run this AFTER
C-11 complete

## Can run IN PARALLEL with
C-13, C-14, C-15, C-16

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. Drag-to-reorder updates priority numbers in DB
3. Priority numbers remain sequential after reorder (no gaps)
