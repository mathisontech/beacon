# C-19: Group Creation Flow
Priority: P0
Depends on: C-17
Estimated complexity: high

## What to build
Multi-step wizard for creating a new group. Step 1: select type. Step 2: draw boundary (map with polygon editor). Step 3: enter name and description. Step 4: set privacy tier and initial policies. Review and submit.

## Files to create/modify
- app/community/groups/create/page.tsx
- lib/groups/validateBoundary.ts
- Update C-17 CRUD to use validation

## Inputs
- Group type selection
- Map boundary (GeoJSON polygon)
- Name, description
- Privacy tier (open/invite-only/restricted)

## Outputs
- New group created via C-17 API
- Creator set as founder
- Redirect to group page

## UI Components
- GroupTypeSelector (4 types with descriptions)
- MapBoundaryEditor (draw polygon, validate)
- GroupDetailsForm (name, description, privacy)
- CreationReviewStep (summary before submit)
- LoadingIndicator (creation in progress)

## Acceptance criteria
- Wizard guides through all required steps
- Map editor intuitive to draw boundaries
- Boundary validates (valid polygon, reasonable size)
- Can go back and edit previous steps
- Submit creates group and founders role
- Success page shows group link/code
- Error handling for invalid data

## Run this AFTER
C-17 complete

## Can run IN PARALLEL with
C-20, C-21

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. GroupCreator component renders type selector + boundary input
3. Valid GeoJSON geometry accepted
4. Invalid geometry rejected with error
