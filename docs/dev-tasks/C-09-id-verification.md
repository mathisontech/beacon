# C-09: ID Verification Flow
Priority: P1
Depends on: C-02, C-03
Estimated complexity: high

## What to build
Multi-step ID verification: selfie capture, ID photo upload, address match validation, background check integration. Store photos and verification status. Display trust score to user.

## Files to create/modify
- app/community/profile/id-verification/page.tsx
- lib/verification/capturePhoto.ts
- lib/verification/addressMatch.ts
- lib/verification/backgroundCheck.ts
- app/api/verification/face/route.ts
- app/api/verification/address/route.ts
- app/api/verification/background/route.ts
- database migration (id_verifications table)

## Inputs
- Selfie (JPEG/PNG via camera)
- ID photo (upload)
- Home address (text, normalized)

## Outputs
- id_verifications record: user_id, face_photo_url, id_photo_url, address_match, background_check_status, verified_at
- Trust score calculated
- Verification badge displayed in profile

## UI Components
- SelfieCapture (camera access, retake option)
- IdPhotoUpload (drag-drop or picker)
- AddressForm (autocomplete, manual entry)
- VerificationStatusDisplay (pending/verified/rejected)
- TrustScoreIndicator

## Acceptance criteria
- Selfie captured and stored securely
- ID photo validated for quality
- Address validated against USPS/Google
- Background check integration working
- Status updated within 2 minutes
- Verification badge displays correctly
- Photos encrypted at rest

## Run this AFTER
C-02, C-03 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/verify/upload accepts face + ID images
3. Verification record created with pending status
4. Address match check returns boolean
