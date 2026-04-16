# C-02: Basic Info Form
Priority: P0
Depends on: C-01
Estimated complexity: medium

## What to build
Profile form for name, display photo, and phone number. Photo upload with thumbnail generation. Phone number normalization to E.164 format. Update/edit capability with preview.

## Files to create/modify
- app/community/profile/basic-info/page.tsx
- lib/profile/updateBasicInfo.ts
- lib/storage/uploadPhoto.ts
- app/api/profile/basic-info/route.ts
- database migration (user_profiles table)

## Inputs
- Full name (required)
- Phone number (E.164 format normalized)
- Photo file (JPEG/PNG, max 5MB)

## Outputs
- user_profiles record with name, phone
- Photo stored in cloud storage, thumbnail URL in database
- Updated user record

## UI Components
- BasicInfoForm (name input, phone input with formatting)
- PhotoUploader (drag-drop, file picker, crop preview)
- PhoneNumberInput (E.164 formatter with country code selector)

## Acceptance criteria
- Phone number auto-formats to E.164 on input
- Photo uploads and generates thumbnail within 30s
- Can edit existing info without re-upload
- Validation shows before submission
- Phone number verified with code from C-03 later
- Photo displays in profile and contacts

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. BasicInfoForm renders without crash (import test)
3. PUT /api/users/[id]/profile with name+photo returns 200
4. user_profiles table has row after update
5. Exports `UserProfile` type importable from lib/users
