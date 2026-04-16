# C-03: Phone Number Verification
Priority: P0
Depends on: C-01
Estimated complexity: medium

## What to build
SMS verification flow for phone numbers. Send OTP code via SMS after user enters phone. Verify code, confirm phone ownership, and update verification status in database.

## Files to create/modify
- app/community/profile/verify-phone/page.tsx
- lib/sms/sendOTP.ts
- lib/phone/verifyCode.ts
- app/api/phone/send-otp/route.ts
- app/api/phone/verify-otp/route.ts
- database migration (phone_verifications table)

## Inputs
- Phone number in E.164 format
- OTP code from SMS (6 digits)

## Outputs
- OTP sent via SMS (valid 10 minutes)
- phone_verifications record created
- User marked as phone_verified in users table

## UI Components
- PhoneVerificationForm (phone display, OTP input, timer)
- ResendCodeButton (cooldown counter, rate limiting UI)
- VerificationSuccessMessage

## Acceptance criteria
- OTP sent within 30 seconds
- Code valid for 10 minutes max
- Max 3 attempts per phone per hour
- Resend available after 30s cooldown
- Clear error on invalid/expired code
- Marks phone as verified in profile

## Run this AFTER
C-01 complete

## Can run IN PARALLEL with
C-04, C-05, C-06, C-07, C-08

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. Build succeeds
2. POST /api/auth/verify-phone sends verification code
3. POST /api/auth/confirm-phone with valid code returns 200
4. Phone stored in E.164 format in DB
5. Exported `verifyPhone()` function importable
