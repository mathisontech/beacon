# C-25: Group Analytics Dashboard
Priority: P2
Depends on: C-17
Estimated complexity: medium

## What to build
Dashboard for group founders/admins showing membership trends, activity heatmaps, message volume by channel, engagement metrics. Time-based filtering (7d, 30d, all time).

## Files to create/modify
- app/community/groups/[id]/analytics/page.tsx
- lib/groups/getAnalytics.ts
- app/api/groups/[id]/analytics/route.ts

## Inputs
- Group ID
- Time range filter (7d, 30d, all time)

## Outputs
- Analytics object: member_count_trend, message_volume_by_channel, active_users, location_heatmap
- Charts/visualizations

## UI Components
- MemberCountChart (line chart)
- MessageVolumeChart (bar chart by channel)
- ActiveUsersMetric (count + trend)
- LocationHeatmap (shows where members are)
- TimeRangeSelector (7d/30d/all)

## Acceptance criteria
- Charts load within 2 seconds
- Data updated daily (near-real-time acceptable)
- Only founder/admin can view
- Trends show growth/decline clearly
- Heatmap respects location sharing settings
- Can export analytics as CSV

## Run this AFTER
C-17 complete

## Can run IN PARALLEL with
C-18, C-19, C-20, C-21

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. GET /api/groups/[id]/analytics returns member count + activity
