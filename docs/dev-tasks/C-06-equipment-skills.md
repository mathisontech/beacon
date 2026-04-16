# C-06: Equipment & Skills Form
Priority: P1
Depends on: C-02
Estimated complexity: medium

## What to build
Form to declare available equipment and certifications. Checkboxes for equipment types (tractor, plow, boat, pump, generator). Free text for other. Checkbox for retired professional roles (EMS, fire, police). Store as array in database.

## Files to create/modify
- app/community/profile/equipment-skills/page.tsx
- lib/profile/updateEquipment.ts
- app/api/profile/equipment/route.ts
- database migration (update user_profiles or equipment table)

## Inputs
- Equipment checkboxes (tractor, plow, boat, pump, generator, other)
- Custom equipment description
- Professional roles (retired EMS, retired fire, retired police)

## Outputs
- user_profiles or equipment table updated with array of equipment types
- Used by group matching to suggest specialized groups
- Available to group leaders for resource planning

## UI Components
- EquipmentCheckboxes (predefined list with icons)
- CustomEquipmentInput (free text for "other")
- ProfessionalRoleCheckboxes
- EquipmentSummary (pill display of selected items)

## Acceptance criteria
- Checkboxes save without refresh
- Custom text validated and stored
- Data used in group discovery ranking
- Can edit equipment anytime
- Professional status influences group visibility
- Summary displays equipment clearly

## Run this AFTER
C-02 complete

## Can run IN PARALLEL with
C-04, C-05, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/users/[id]/equipment saves equipment list
3. GET returns saved equipment
4. Skills array stored correctly
