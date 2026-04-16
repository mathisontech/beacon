# C-10: Action History Timeline
Priority: P2
Depends on: C-01
Estimated complexity: low

## What to build
Read-only scrollable timeline of all user actions: registration, profile updates, group joins, messages sent. Fetches from user_events table with filtering/sorting. Shows timestamps and brief descriptions.

## Files to create/modify
- app/community/profile/history/page.tsx
- lib/history/getUserEvents.ts
- app/api/profile/history/route.ts
- database (user_events table already exists)

## Inputs
- None (reads current user's events)
- Optional: date range filter, event type filter

## Outputs
- Paginated list of user events
- Display: timestamp, event type, brief description

## UI Components
- EventTimeline (vertical timeline with entries)
- EventCard (timestamp, icon, description)
- TimelineFilters (date range, event type)

## Acceptance criteria
- Timeline loads with recent events first
- Pagination or infinite scroll for older events
- Icons match event type (registration, join, message, etc)
- Timestamps in local timezone
- Filter by date range works
- No performance issues with 1000+ events

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
Most tasks (non-blocking)

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. EventHistoryTimeline renders with mock data
3. GET /api/users/[id]/history returns paginated events
4. Events sorted by timestamp desc
