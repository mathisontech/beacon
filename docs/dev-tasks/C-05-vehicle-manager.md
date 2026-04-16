# C-05: Vehicle Manager + Spec Lookup
Priority: P1
Depends on: C-02
Estimated complexity: high

## What to build
Vehicle management UI with add/edit/delete capability. Make/model autocomplete triggers DB lookup of dimensions (length, width, height, clearance), 4WD, seats. Store vehicle specs linked to user and household.

## Files to create/modify
- app/community/profile/vehicles/page.tsx
- lib/vehicles/addVehicle.ts
- lib/vehicles/lookupSpecs.ts
- app/api/vehicles/specs/route.ts
- app/api/profile/vehicles/route.ts
- database migration (vehicles table, vehicle_specs lookup table)

## Inputs
- Make (text autocomplete)
- Model (dependent dropdown on make)
- Year (4-digit year)

## Outputs
- Vehicle record with: make, model, year, length_cm, width_cm, height_cm, clearance_cm, seats, four_wd, snow_tires
- Vehicle linked to user_id and household_id
- Used for evacuation routing (clearance checks)

## UI Components
- VehicleForm (make/model dropdowns with autocomplete)
- VehicleList (display all user vehicles with edit/delete)
- VehicleSpecsDisplay (show auto-filled dimensions)
- VehicleAdder (modal or inline form)

## Acceptance criteria
- Make/model autocomplete from vehicle DB
- Specs auto-fill after model selection
- Can add multiple vehicles per user
- Edit and delete existing vehicles
- Dimensions accurate within 2% of reality
- Empty household option if no vehicles

## Run this AFTER
C-02 complete

## Can run IN PARALLEL with
C-04, C-06, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. VehicleManager component renders
3. POST /api/vehicles creates vehicle record with dimensions
4. Make/model lookup returns spec data
5. GET /api/users/[id]/vehicles returns array
