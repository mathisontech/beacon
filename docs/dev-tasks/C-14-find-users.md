# C-14: Find Beacon Users
Priority: P1
Depends on: C-03
Estimated complexity: medium

## What to build
Search interface to find other Beacon users by phone number. Display search results with profile photos and names. Add buttons to add as emergency contact or connect. Rate-limited queries.

## Files to create/modify
- app/community/contacts/find/page.tsx
- lib/contacts/findUsers.ts
- app/api/contacts/search/route.ts

## Inputs
- Phone number (E.164 format)

## Outputs
- List of matching users with: id, name, phone, photo_url, verification_status
- Rate-limited to 10 searches per minute per user

## UI Components
- UserSearchForm (phone input with formatting)
- UserSearchResults (profile cards with add buttons)
- AddContactButton (quick-add to emergency contacts)
- NoResultsMessage (not registered or no match)

## Acceptance criteria
- Search by phone number returns matches
- Results show photo, name, verification badge
- Can add directly to emergency contacts
- Rate limiting prevents abuse
- "Not found" message clear when no matches
- Privacy: only phone-verified users can search

## Run this AFTER
C-03 complete

## Can run IN PARALLEL with
C-13, C-15, C-16

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. GET /api/users/search?phone=X returns matching users
3. No results returns empty array (not error)
