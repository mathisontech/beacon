# C-07: Sensor Settings Panel
Priority: P2
Depends on: C-02
Estimated complexity: medium

## What to build
Per-sensor consent toggles with descriptions. Options: barometric pressure sharing, GPS location triggers, accelerometer (fall detection). Each toggle requires legal release acknowledgment. Store permission bitmap in sensor_consents table.

## Files to create/modify
- app/community/profile/sensors/page.tsx
- lib/sensors/updateConsents.ts
- app/api/profile/sensors/route.ts
- database migration (sensor_consents table)

## Inputs
- Barometer toggle + legal release
- GPS trigger toggle + legal release
- Accelerometer toggle + legal release

## Outputs
- sensor_consents table: user_id, sensor_type, enabled, legal_release_id, granted_at
- Permission bitmap for mesh/app logic
- Audit log of consent changes

## UI Components
- SensorToggle (switch with description)
- LegalReleaseModal (scrollable text, accept checkbox)
- SensorDescription (what data is collected, why)
- ConsentAuditLog (history of changes)

## Acceptance criteria
- Each sensor toggleable independently
- Legal release modal mandatory before enabling
- Consent recorded with timestamp
- Can revoke consent anytime
- Audit trail of all changes
- Clear explanation of each sensor

## Run this AFTER
C-02 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. SensorSettingsPanel renders with toggle states
3. PUT /api/users/[id]/sensors updates consent records
4. Each sensor type has independent toggle
