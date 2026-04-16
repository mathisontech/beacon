# C-08: Privacy & Location Settings
Priority: P0
Depends on: C-02
Estimated complexity: medium

## What to build
Location sharing granularity controls: full precision, block-level, neighborhood, hidden. Default mode selector. Per-context overrides (emergency = always full, public = always hidden). Legal release required. Store in location_settings table.

## Files to create/modify
- app/community/profile/privacy/page.tsx
- lib/privacy/updateLocationSettings.ts
- app/api/profile/privacy/route.ts
- database migration (location_settings table)

## Inputs
- Default location mode (full, block, neighborhood, hidden)
- Context-specific overrides (emergency, public, group)
- Legal release acceptance

## Outputs
- location_settings record: user_id, default_mode, default_granularity, mesh_relay_enabled
- Mode enforced in all location queries
- Emergency override available via C-30

## UI Components
- LocationModeSelector (radio buttons with descriptions)
- ContextOverrideTable (context → mode matrix)
- LegalReleaseAcceptance
- LocationPreviewMap (show what others see)

## Acceptance criteria
- Default mode saved and enforced
- Context-specific overrides work correctly
- Emergency mode override available
- Map preview shows actual shared precision
- Can change settings anytime
- Legal release signed before enabling sharing

## Run this AFTER
C-02 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-07

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. PrivacySettingsPanel renders all 4 modes (off, group-only, ems-only, public)
3. PUT /api/users/[id]/location-settings persists mode + granularity
4. Exported `LocationMode` and `Granularity` types importable
