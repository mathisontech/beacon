# C-18: Group Discovery & Suggestions
Priority: P0
Depends on: C-17, C-02
Estimated complexity: high

## What to build
Algorithmic group suggestion engine. Score = (1/distance) × (1/area_covered) × relevance_weight. Filter by user household (children → school groups), equipment (skills → specialty groups), location (neighborhood groups), fire district (evacuation groups).

## Files to create/modify
- lib/groups/discoverGroups.ts
- lib/groups/rankSuggestions.ts
- app/api/groups/discover/route.ts

## Inputs
- User location
- User household data (children, elderly, pets, skills)
- User equipment/professional roles

## Outputs
- Ranked list of suggested groups (max 20)
- Each result includes: group info, relevance reason, join button

## UI Components
- GroupSuggestionsList (ranked by relevance)
- GroupSuggestionCard (group info, reason for suggestion)
- JoinGroupButton

## Acceptance criteria
- Distance-based ranking working correctly
- Household matching (children + school groups)
- Equipment/skills matching for specialty groups
- Neighborhood groups visible when 10+ members
- Relevance explanation clear to user
- Performance: results within 1 second

## Run this AFTER
C-17, C-02 complete

## Can run IN PARALLEL with
C-19, C-20, C-21

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. GET /api/groups/discover?lat=X&lng=Y returns ranked suggestions
3. Results sorted by (1/distance * 1/area)
4. Neighborhood groups rank above city groups
