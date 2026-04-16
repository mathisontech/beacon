# C-26: Evacuation Convoy Auto-Groups
Priority: P2
Depends on: C-17, C-21
Estimated complexity: high

## What to build
Auto-generate evacuation convoy groups during emergencies. Group by evacuation zone, route, and vehicle capacity. Track vehicle count, passenger capacity, driver/passenger roles. Read-only groups with time-limited membership.

## Files to create/modify
- lib/evacuation/createConvoy.ts
- lib/evacuation/assignToConvoy.ts
- lib/evacuation/trackCapacity.ts
- app/api/evacuation/convoys/route.ts
- database migration (evacuation_convoys table with references to groups)

## Inputs
- Evacuation zone ID (from emergency system)
- Member locations and vehicle info (from C-02, C-05)

## Outputs
- Convoy group created with type=evacuation_convoy
- Members auto-assigned to convoys
- Driver/passenger roles assigned
- Capacity tracking enabled

## UI Components
- ConvoyCard (driver info, vehicle, capacity, status)
- ConvoyMap (location of vehicles in convoy)
- CapacityIndicator (passengers / seats)
- DriverControls (ready status, routing)

## Acceptance criteria
- Convoys created automatically on emergency trigger
- Members assigned based on location proximity
- Vehicle capacity calculated from C-05 data
- Driver role assigned to vehicle owner
- Routes optimized for evacuation
- Real-time location tracking enabled
- Convoy groups expire 24 hours after emergency end

## Run this AFTER
C-17, C-21 complete

## Can run IN PARALLEL with
C-18, C-19, C-20, C-23, C-24, C-25

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. Auto-group creation from evacuation trigger works
3. Convoy groups have time-limited status
