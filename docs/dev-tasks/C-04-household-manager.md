# C-04: Household Manager
Priority: P1
Depends on: C-02
Estimated complexity: medium

## What to build
Form to describe household composition: number of children, elderly members, disabilities, pets. Checkboxes for special needs. Store in user_profiles with serialized data. Display summary and edit capability.

## Files to create/modify
- app/community/profile/household/page.tsx
- lib/profile/updateHousehold.ts
- app/api/profile/household/route.ts
- database migration (update user_profiles schema)

## Inputs
- Children count (0-10)
- Elderly members (yes/no + count)
- Disabilities (checkboxes: mobility, visual, hearing, cognitive, other)
- Pet types (dogs, cats, birds, reptiles, livestock, other)
- Pet count

## Outputs
- user_profiles record updated with household JSON
- Data accessible for group discovery matching

## UI Components
- HouseholdForm (number inputs, checkbox groups)
- PetTypeSelector (multi-select with icons)
- HouseholdSummary (display current household info)

## Acceptance criteria
- Form saves without validation errors
- Household data displayed in profile view
- Used by group discovery to suggest groups
- Can edit household size anytime
- Data normalized and validated before storage

## Run this AFTER
C-02 complete

## Can run IN PARALLEL with
C-05, C-06, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. HouseholdForm renders without crash
3. PUT /api/users/[id]/household saves disabilities, pets, children
4. Data retrievable via GET /api/users/[id]/household
