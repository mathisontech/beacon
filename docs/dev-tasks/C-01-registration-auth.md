# C-01: Registration & Auth Flow
Priority: P0
Depends on: none
Estimated complexity: high

## What to build
Core authentication system with email registration, password reset, and email verification. Implement signup form with validation, forgot-password email flow, and account recovery. Store hashed passwords securely.

## Files to create/modify
- app/community/profile/registration/page.tsx
- lib/auth/register.ts
- lib/auth/passwordReset.ts
- app/api/auth/register/route.ts
- app/api/auth/reset-password/route.ts
- database migrations (users table, verification_codes table)

## Inputs
- Email, password, confirm password
- Password reset token (from email link)

## Outputs
- User record in database with hashed password
- Verification code sent via email
- Session token created on successful login

## UI Components
- RegistrationForm (email input, password strength meter, terms checkbox)
- ForgotPasswordForm (email entry, token validation)
- ResetPasswordForm (new password input)
- VerificationPrompt (resend code button)

## Acceptance criteria
- User can register with valid email/password
- Password hashed with bcrypt or similar
- Email verification link sent within 2 minutes
- Forgot password sends secure reset token
- Invalid email/weak password shows clear errors
- Rate limiting on registration endpoints

## Run this AFTER
Can run immediately

## Can run IN PARALLEL with
None - this is foundational

## Checkpoint Tests
Before marking complete, verify ALL pass:

1. `npm run build` succeeds with no type errors in auth files
2. POST /api/auth/register with valid email returns 201 + user record
3. POST /api/auth/register with duplicate email returns 409
4. POST /api/auth/reset-password with valid token returns 200
5. Exported types `User`, `AuthSession` importable from lib/auth
