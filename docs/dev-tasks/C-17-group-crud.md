# C-17: Group Data Model & CRUD
Priority: P0
Depends on: C-01
Estimated complexity: high

## What to build
Core group entity with create, read, update, delete operations. Support 4 types: neighborhood, parent-community, burn-together, evacuation convoy. Store geometry (GeoJSON), privacy tier, metadata. Implement ownership and founder role.

## Files to create/modify
- lib/groups/createGroup.ts
- lib/groups/updateGroup.ts
- lib/groups/deleteGroup.ts
- lib/groups/getGroup.ts
- app/api/groups/route.ts
- app/api/groups/[id]/route.ts
- database migration (groups table with proper indexes)

## Inputs
- Group type (neighborhood, parent-community, burn-together, evacuation)
- Name, description
- Geometry (GeoJSON polygon for boundaries)
- Privacy tier (open, invite-only, restricted)

## Outputs
- groups table: id, type, name, description, geometry, privacy_tier, created_by, created_at, status
- Creator automatically becomes founder
- Group ID used by all downstream features

## UI Components
- GroupForm (type selector, name, description, boundary drawer)
- GroupCard (summary display)
- GroupList (filterable, searchable)

## Acceptance criteria
- CRUD operations working for all group types
- Geometry validation (valid GeoJSON)
- Founder role assigned to creator
- Unique names per location (type dependent)
- Soft delete supported (status = deleted)
- Indexes on type, created_by, geometry for performance

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
None - foundational for groups

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/groups creates group, returns id
3. GET /api/groups/[id] returns group with geometry
4. DELETE /api/groups/[id] soft-deletes (status=deleted)
5. Exported `Group`, `GroupType` types importable
6. Creator automatically has founder role in group_members
