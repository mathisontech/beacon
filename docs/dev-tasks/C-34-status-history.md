# C-34: Status History Feed
Priority: P1
Depends on: C-30
Estimated complexity: low

## What to build
Read-only feed showing all status updates from user and their emergency contacts. Reverse-chronological order. Shows status type, timestamp, location (if shared). Filter by contact or timeframe.

## Files to create/modify
- app/community/status/history/page.tsx
- lib/status/getStatusHistory.ts
- app/api/status/history/route.ts

## Inputs
- User ID (optional filter for specific contact)
- Date range filter (last 7 days, 30 days, all)

## Outputs
- Paginated status history
- Each entry: user, status, timestamp, location (if permitted)

## UI Components
- StatusHistoryFeed (scrollable list)
- StatusHistoryCard (status + timestamp + location)
- ContactFilter (dropdown to filter by contact)
- DateRangeSelector (7d/30d/all)

## Acceptance criteria
- Shows all status updates from contacts
- Respects location privacy settings
- Paginated or infinite scroll
- Sortable by date (newest first)
- Can filter by contact
- Timestamps in local timezone
- Location only shown if contact shared it

## Run this AFTER
C-30 complete

## Can run IN PARALLEL with
C-31, C-32, C-33

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. GET /api/users/[id]/status-history returns timeline
3. Entries sorted by timestamp desc
