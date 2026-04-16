# Accounts & Authentication Module

Multi-tier account system supporting 6 primary account types (Beacon Employee, EMS Admin, EMS Team Member, Dispatch, Special Designations, Public User) with fine-grained permissions. Includes invite code system, ID verification, special designations, and session management.

---

## 1. Module Metadata

**Team:** Identity & Access

**Parent Module:** Beacon Core Platform

**Sub-Modules:** Special Designations, Invite Code System, ID Verification, Session Management, Permission Engine

**Goal:** Provide secure multi-tier account system with granular permissions per role and account type.

**Mission Alignment:** Protects safety by ensuring right people have right access; enables rapid onboarding of emergency personnel and verified volunteers.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| User signup | Public | JSON | On-demand | `{email, phone, password_hash, account_type}` |
| Invite code | EMS admin | JSON | On-generate | `{code, designation_type, recipient_email, expires}` |
| ID verification | User | Image + data | On-demand | `{photo, id_number, address, dob}` |
| Background check | Third-party | JSON | On-verify | `{user_id, cleared, offense_list, date}` |
| Session token | Auth | JWT | On-login | `{user_id, account_type, permissions, expires}` |
| Account deletion request | User | JSON | On-request | `{user_id, reason, data_export_requested}` |
| **Output: Auth token** | Mobile/web | JWT | On-login | `{access_token, refresh_token, expires_in}` |
| **Output: Permissions** | Services | JSON | On-request | `{account_type, designations, capability_list}` |
| **Output: User profile** | Mobile/web | JSON | On-request | `{name, location, vehicle, emergency_contacts}` |
| **Output: Designation verified** | EMS/app | JSON | On-verify | `{designation_type, verified_at, authority_level}` |

**Output Consumers:** All authenticated clients, EMS admin, services requiring auth, permission engine.

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `createAccount()` | Register new public user | Email, phone, password | Account ID, verification email | p95 < 1s | Email service, User DB | Email uniqueness validated |
| `loginUser()` | Authenticate user with password | Email/phone, password | Auth token + refresh token | p95 < 500ms | User DB, Auth service | Account lockout after 5 failures |
| `refreshAuthToken()` | Extend session using refresh token | Refresh token | New auth token | p95 < 200ms | Auth service | Refresh token validated, rotated |
| `logoutUser()` | Invalidate session | Auth token | Confirmation | p95 < 500ms | Session DB | Token blacklisted |
| `verifyEmail()` | Confirm email ownership | Email, verification code | Email verified status | p95 < 500ms | Email service, User DB | Code single-use, 24h expiration |
| `resetPassword()` | Initiate password recovery | Email | Recovery email sent | p95 < 500ms | Email service, User DB | Rate limit 3 per day |
| `changePassword()` | User changes password | Old password, new password | Confirmation | p95 < 500ms | User DB | Old password verified, new password validated |
| `generateInviteCode()` | Create invite for special designation | Designation type, recipient email | Invite code + link | p95 < 500ms | Auth system | 12-char alphanumeric, single-use |
| `validateInviteCode()` | Check if invite code valid + unused | Invite code | Code validity status | p95 < 200ms | Auth DB | Code format, expiration, duplicate check |
| `redeemInviteCode()` | User uses invite to get designation | User ID, invite code, designation_type | Designation assigned, designation verification started | p95 < 1s | Auth system, User DB | Code consumed atomically |
| `initiateIDVerification()` | Start identity document verification | Photo, ID number, address, DOB | Verification ID, selfie prompt | p95 < 500ms | User DB | Age 18+ confirmed |
| `submitIDPhoto()` | User uploads government ID photo | Verification ID, ID photo | Liveness check initiated | p95 < 1s | CV/ML, S3 | Image quality checked |
| `completeLivenessCheck()` | Confirm user is real person, not spoofed | Verification ID, selfie video | Liveness score | p95 < 5s | CV/ML | Spoof detection 95%+ accuracy |
| `matchIDDocument()` | Compare submitted ID to reference | Verification ID, face from photo+liveness | Match confidence score | p95 < 5s | CV/ML | Match accuracy 98%+ |
| `verifyAddressMatch()` | Confirm address on ID matches account | Verification ID, address claim | Address verified status | p95 < 500ms | Address DB, USPS API | Database lookup 99%+ coverage |
| `requestBackgroundCheck()` | Initiate third-party background check | User ID, clearance_type | Background check ID, status | p95 < 1s | Background check vendor | No cost if user not verified |
| `receiveBackgroundCheckResult()` | Consume background check response | Check ID, result | User profile updated with vetting status | p95 < 1s | Background check webhook | Result integrity verified |
| `assignSpecialDesignation()` | Grant user a special role (school principal, etc.) | User ID, designation_type, issuer_id | Designation record created | p95 < 500ms | User DB, Designation DB | Audit logged |
| `revokeSpecialDesignation()` | Remove designation from user | User ID, designation_type, issuer_id, reason | Designation deactivated | p95 < 500ms | Designation DB | Previous actions logged but not deleted |
| `getPermissions()` | Retrieve user's capability list | User ID, context | Permission list | p95 < 200ms | Permission cache (Redis) | Cache hits 95%+ |
| `checkPermission()` | Validate if user can perform action | User ID, action, resource_id | Allowed/denied | p95 < 100ms | Permission cache | Cache hits 99%+ |
| `updateUserProfile()` | User modifies profile info | User ID, profile_updates | Updated profile | p95 < 500ms | User DB | Changes logged to audit trail |
| `setEmergencyContacts()` | Register emergency contact list | User ID, contacts[] | Contacts saved | p95 < 500ms | Contact DB | Maximum 5 contacts |
| `inviteEmergencyContact()` | Send Beacon invite to emergency contact | User ID, contact_email | Invite sent | p95 < 500ms | Email service, User DB | Duplicate invite check |
| `acceptEmergencyContactInvite()` | Contact joins Beacon via invite link | Invite token, email | Account created, relationship recorded | p95 < 1s | User DB, Contact DB | Relationship verified automatically |
| `manageDataExport()` | User requests all personal data | User ID | Data export queued | p95 < 500ms | User DB, S3 | GDPR-compliant format |
| `deleteAccount()` | Permanent user account removal | User ID, password confirmation | Account soft-deleted, data cleanup scheduled | p95 < 1s | User DB | Cleanup job runs within 30 days |
| `auditAccountAccess()` | Review who accessed your account/data | User ID, date_range | Access log | p95 < 2s | Audit log DB | All access events logged |
| `validateMultiFactorAuth()` | Verify second auth factor (SMS/TOTP) | User ID, MFA code | MFA verified status | p95 < 500ms | MFA service | Code single-use, 6-digit |
| `enableBiometric()` | Register fingerprint/face for local auth | User ID, biometric_type | Biometric registered locally | p95 < 500ms | Local device storage | Never transmitted to server |
| `getDesignationDetails()` | Retrieve designation authority + permissions | Designation ID | Designation metadata | p95 < 200ms | Designation cache | Cache hits 99%+ |
| `listUserDesignations()` | Show all designations for user | User ID | Designation list | p95 < 200ms | User DB | Includes revoked (archive only) |
| `validateDesignationChain()` | Verify issuer authority to grant designation | Issuer ID, designation_type | Valid/invalid | p95 < 500ms | Designation DB | Hierarchy enforced |
| `rotateInviteCodes()` | Regenerate old codes to prevent enumeration | Client ID | Old codes invalidated, audit logged | Batch daily | Auth DB | Security measure, monthly rotation |
| `syncPermissionsToMesh()` | Push user permissions to local device | User ID, device_id | Permissions cached locally | p95 < 500ms | Mesh network, Local cache | Sync integrity checked |
| `validateAccountTypeUpgrade()` | Check if user eligible for different account tier | User ID, new_type | Eligibility status + requirements | p95 < 500ms | User DB, Verification DB | Business rules enforced |

**Key Algorithms:** Permission checking uses cached lookup + inheritance. ID verification uses deep learning for liveness + face matching. Background check uses fuzzy matching against sex offender registry.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, Redis, S3, Auth0/Okta (optional third-party)

### PostgreSQL

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  account_type VARCHAR(50),
  name VARCHAR(500),
  home_location GEOMETRY(Point, 4326),
  profile_photo_ref VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verification_status VARCHAR(20),
  id_verified_at TIMESTAMP WITH TIME ZONE,
  background_check_status VARCHAR(20),
  background_check_date TIMESTAMP WITH TIME ZONE,
  account_status VARCHAR(20),
  last_login TIMESTAMP WITH TIME ZONE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_method VARCHAR(50)
);

CREATE TABLE user_passwords (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invalidated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE,
  refresh_token_hash VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE invite_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  recipient_email VARCHAR(255),
  designation_type VARCHAR(50),
  redeemed_by BIGINT REFERENCES users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE special_designations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designation_type VARCHAR(50) NOT NULL,
  issued_by BIGINT REFERENCES users(id),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  authority_level INT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by BIGINT REFERENCES users(id),
  verification_method VARCHAR(50),
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by BIGINT REFERENCES users(id),
  revoked_reason TEXT,
  UNIQUE(user_id, designation_type)
);

CREATE TABLE id_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  id_number VARCHAR(50),
  id_type VARCHAR(50),
  id_photo_ref VARCHAR(500),
  id_photo_verified BOOLEAN,
  selfie_ref VARCHAR(500),
  liveness_score DECIMAL,
  face_match_score DECIMAL,
  address_claim VARCHAR(500),
  address_verified BOOLEAN,
  dob DATE,
  age_verified BOOLEAN,
  submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20)
);

CREATE TABLE background_checks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  clearance_type VARCHAR(50),
  vendor_id VARCHAR(100),
  vendor_check_id VARCHAR(100),
  requested_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_status VARCHAR(20),
  offenses TEXT,
  sex_offender_match BOOLEAN,
  clearance_expires TIMESTAMP WITH TIME ZONE
);

CREATE TABLE emergency_contacts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  relationship VARCHAR(50),
  invited_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  contact_user_id BIGINT REFERENCES users(id),
  is_primary BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE account_audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  event_type VARCHAR(100),
  actor_id BIGINT REFERENCES users(id),
  details JSONB,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE data_exports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  export_url VARCHAR(500),
  expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20)
);

CREATE TABLE permissions (
  id BIGSERIAL PRIMARY KEY,
  account_type VARCHAR(50),
  designation_type VARCHAR(50),
  permission_name VARCHAR(100),
  resource_type VARCHAR(100),
  action VARCHAR(50),
  authority_level INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_recipient ON invite_codes(recipient_email);
CREATE INDEX idx_designations_user ON special_designations(user_id);
CREATE INDEX idx_designations_type ON special_designations(designation_type);
CREATE INDEX idx_id_verifications_user ON id_verifications(user_id);
CREATE INDEX idx_background_checks_user ON background_checks(user_id);
CREATE INDEX idx_audit_log_user ON account_audit_log(user_id);
```

### Redis

```
Key patterns:
  user:[user_id]:permissions → {permission_list_json}
  user:[user_id]:designations → {designation_list_json}
  session:[token_hash] → {user_id, expires_at}
  mfa_challenge:[user_id]:[nonce] → {code, expires_at}

TTL: Permissions 24h, Sessions per token expiry, MFA challenge 5 minutes
```

### S3

```
Bucket: beacon-id-verification
Prefix: /id_photos/{user_id}/{submission_id}/
Prefix: /selfies/{user_id}/{submission_id}/
Retention: 1 year (legal hold), then deleted
Access: Signed URLs, user cannot download, only admin can review
```

**Data Size Estimate:** 50M+ public users, 5K EMS agencies, 100K special designations. User table ~500GB, session table ~50GB (rolling window).

**Archival Strategy:** Soft-delete accounts (retain for 90 days, then permanent delete). Archive designation history 2 years. Delete ID verification photos after 1 year.

---

## 5. UI Components

**Screens:**
- Login (email/phone + password or SSO)
- Signup (account type selection, basic info)
- MFA verification (SMS/TOTP code entry)
- ID verification (government ID photo + selfie)
- Emergency contacts (add, invite)
- Account settings (password, MFA, email, phone)
- Special designation verification (code entry, credential submission)
- Data export request
- Account deletion confirmation
- Session management (active devices, logout all)

**Buttons/Controls:**
- "Sign Up": Teal #0097B2, main screen
- "Log In": Navy #0B0F2A, login screen
- "Verify Identity": Orange, ID verification flow
- "Enable MFA": Green, security settings
- "Invite Emergency Contact": Teal #0097B2, contacts screen
- "Request Data Export": Gray, privacy settings
- "Delete Account": Red, dangerous action
- "Accept Designation": Green, invite code flow

**Notifications/Alerts:**
- Email verification: Email + in-app, "Verify your email to activate account"
- MFA prompt: In-app, "Enter verification code"
- ID verification rejected: In-app, "Photo quality too low, retake"
- Background check cleared: Push + email, "Verified! Ready to help in emergencies"
- Session timeout: In-app banner, "Session expires in 5 minutes"

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A for primary, teal #0097B2 for verify, red for danger.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-auth-api | Node.js/Express | `npm run build && npm run test` | Auth team |
| beacon-auth-ui | React Native | `npm run build:ios && npm run build:android` | Mobile team |
| beacon-id-verification | Python/FastAPI + OpenCV | `pip install -r requirements.txt && pytest` | ML team |
| beacon-permissions-engine | Go/gRPC | `go build ./...` | Security team |

**Deployment:** Docker on Kubernetes. Separate cluster from EMS/public for auth isolation.

**CI/CD:** GitHub Actions with security scanning. Secrets rotation quarterly.

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Design, API contracts, basic auth
2. **Months 2-3:** ID verification, MFA, session management
3. **Months 3-4:** Special designations, background checks, permissions
4. **Months 4-5:** Emergency contacts, account management, data export
5. **Month 5+:** Beta testing, production rollout

**Build Phases:**
- Phase 1: Login/signup, email verification, basic session mgmt (1.5 months)
- Phase 2: ID verification, MFA, background checks (2 months)
- Phase 3: Special designations, permissions engine, emergency contacts (2 months)

**Test Coverage Targets:** 95% unit, 85% integration (security-critical). Priority: auth flow, ID verification accuracy, permission checks.

**Deployment Strategy:** Blue-green. Canary 1% → 10% → 50% → 100%.

**Monitoring Metrics:** Login latency p95 <500ms, MFA delivery <10s, ID verification time <5min, permission check p95 <100ms.

**Improvement Research:** User friction in signup (drop-off analysis), ID verification success rates (photo quality issues), special designation adoption.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:** CCPA (data export, deletion), GDPR (EU users), SOC 2 (general security), CMMC L2 (government accounts), FTC (background checks).

**PII Handled:** Email, phone, password, name, address, DOB, government ID number, biometric (liveness), background check results, emergency contacts.

**Encryption:**
- In-transit: TLS 1.3
- At-rest: AES-256-GCM for passwords (bcrypt), ID photos (encrypted in S3)
- Keys: AWS KMS with HSM

**Audit Trail:** All authentication events, designation changes, ID verification attempts, permission checks logged. Retained 2 years.

**Data Retention:** User sessions 30 days. ID verification photos 1 year. Background checks 5 years (legal hold). Emergency contact invites 1 year.

**Third-Party Integrations:** Background check vendor (fuzzy match to sex offender registry), USPS address verification, SMS provider (Twilio for MFA).

---

## 9. Mesh/Offline

**Offline-First Features:**
- Local biometric auth (fingerprint/face) using cached permissions
- Cached permissions allow actions without server connectivity
- ID verification cannot proceed offline (requires server)

**Sync Strategy:** Permissions synced on reconnect using timestamp-based merging.

**Cache Size:** User profile 1MB, permissions 500KB = ~2MB per user.

**Priority Queue:** Permissions → session refresh → audit log.

**Compression:** Gzip for permission JSON.

---

## 10. Update Protocols

**Update Frequency:** Bug fixes same-day. Feature releases weekly. Major updates monthly.

**Rollout Strategy:** Staged per account type: internal → EMS accounts → public users.

**Rollback Plan:** Automatic rollback if error rate >0.01%, any auth failure >0.1%.

**User Notification:** In-app banner for security updates, mandatory for MFA/password changes.

**Testing Before Release:** Staging with real background check vendor, tabletop exercise with EMS.

---

## 11. Cross-Module Dependencies

**Consumes:**
- Email service: Verification codes, password reset
- SMS service: MFA, 911 alerts
- Background check vendor: Clearance results
- USPS API: Address verification
- Government ID DB: Special designation verification

**Provides:**
- All authenticated clients: Auth tokens, permissions
- Permission engine: User capabilities per resource
- EMS Admin: User verification status, designation authority
- Public Users: Account management, emergency contacts

**Critical Path:** Must ship before all other modules (fundamental dependency).

**Teams to Consult:**
- Legal team: CCPA, GDPR, background check compliance
- Security team: Auth architecture, key management
- Privacy team: Data handling, third-party integrations
- Compliance team: Audit log requirements

**Potential Conflicts:** ID verification + privacy (facial recognition). Background checks + fairness (expungement records). Emergency contacts + consent.

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (API, verification workers): $30K
- Database (PostgreSQL, replication, backups): $15K
- Redis cache: $5K
- S3 (ID photos, exports): $10K
- Third-party services: SMS ($5K), background checks ($5K), address verification ($2K)
- Total: ~$72K/month

**Personnel (Monthly):**
- Team lead (1): $15K
- Backend engineers (3): $45K
- ML engineer (1): $20K
- Security engineer (1): $20K
- QA (1): $10K
- Total: ~$110K/month

**Optimization Ideas:**
- Batch background checks (reduce vendor cost 20%)
- Cache address verifications (reduce USPS calls 30%)
- Local MFA on device (reduce SMS cost 40%)

---

## 13. Agent Monitor Team

**5 Agents:**

1. **Quality Agent:** Code, tests, login latency, auth errors
   - Alert: Login latency p95 >1s
   - Alert: Auth error rate >0.1%
   - Alert: Test coverage <95%

2. **Research Agent:** ID verification accuracy, false positive fraud detection
   - Alert: ID verification failure rate >10%
   - Alert: Face match accuracy <97%
   - Alert: Liveness detection FN rate >1%

3. **Business Agent:** Account growth, signup funnel, MFA adoption
   - Alert: Signup completion rate <70%
   - Alert: Cost per verified user >$5
   - Alert: MFA adoption <30%

4. **Compliance Agent:** Security incidents, unauthorized access, data breaches
   - Alert: Unauthorized password reset attempted
   - Alert: Brute force attack detected
   - Alert: Permission bypass exploit attempted

5. **Lead Agent:** Orchestrates other 4, escalates patterns
   - Escalates: Security incident
   - Escalates: Data breach suspected
   - Escalates: 3+ agents alert simultaneously

**Reporting:** Each agent reports to module owner + domain head.

---

## 14. Validation Practices

**Accuracy Targets:**
- ID verification: 99% correct (FN cost high: false rejection of valid ID)
- Face matching: 98% accuracy
- Liveness detection: 99% sensitivity (prevent spoofing)
- Background check matching: 95% accuracy (false positives block legitimate users)

**Loss Weighting:**
- False negative ID (reject valid): 100x cost
- False positive ID (accept fraudulent): 1000x cost
- False negative liveness: 10x cost
- False positive liveness: 1x cost

**A/B Testing:**
- ID photo requirements: measure success rate vs user friction
- MFA method: compare SMS vs TOTP adoption
- Signup flow: test account type clarity

**Drift Detection:**
- ID verification success rate: daily monitoring
- Face match accuracy: weekly validation on test set
- Liveness detection: continuous monitoring
- Background check false positive rate: monthly analysis

**Validation Data:** Real government IDs (sanitized), liveness video library, background check results from vendor.

---

## 15. Data Science Considerations

**Model Selection:** ID verification uses transfer learning (ResNet50) for face recognition, OpenCV for liveness. Background check uses fuzzy string matching against registry.

**Training Data:**
- Face recognition: 1M face pairs (public + proprietary datasets)
- Liveness: 50K videos (spoofing attacks + genuine)
- Background matching: 100K historical records with ground truth

**Retraining Schedule:** Face recognition quarterly (new spoofing techniques). Liveness monthly.

**Benchmarks:** Face recognition baseline 95%, target 98%. Liveness baseline 95%, target 99%.

**Failure Cases:** ID verification fails on poor photo quality, aging faces, makeup. Liveness fails on deepfakes, video replay. Background matching fails on name variations, common names.

**Explainability:** Show user why ID rejected ("Face not clearly visible"). Show fuzzy match threshold on background check.

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Backend: Node.js/Express + Python/FastAPI for ML
- Mobile: React Native
- Database: PostgreSQL
- Cache: Redis
- ML: TensorFlow, OpenCV

**External Dependencies:**
- express ^4.18 (pinned minor)
- tensorflow ^2.10
- opencv-python ^4.6
- Security scanning: npm audit, bandit (Python)

**CI/CD Pipeline:**
- Lint: ESLint, black (Python)
- Tests: Jest, pytest (95% coverage minimum)
- Security: OWASP ZAP, static code analysis, secrets scanning
- Performance: Load test 1000 concurrent logins
- Deployment: Separate security-hardened cluster, manual approval for prod

**Technical Debt:**
- Refactor ID verification pipeline (currently monolithic)
- Add comprehensive MFA documentation
- Implement audit log streaming (currently batch)

**SLA & Runbooks:**
- Availability: 99.99% (auth must be always-on)
- Login: p95 <500ms
- Error rate: <0.01%
- Incident response: <15 minutes for security issues
- Oncall runbook: Check K8s, check database, contact auth vendor if needed

**Scalability:** Target 50M users, 100K login requests/second during major event. Bottleneck: Database connection pool. Mitigation: connection pooling, read replicas, caching.

---

## Notes

- Never log passwords (even hashed)
- Session tokens must be short-lived (1 hour), refresh tokens longer (30 days)
- ID verification photos must never leave encrypted storage without explicit user consent
- Background check integration must handle false positives gracefully (human review process)
- MFA can be SMS or TOTP; SMS preferred for general users, TOTP for high-security accounts
- Special designation verification varies by type; school principal different from fire chief
- Account deletion is permanent; require password confirmation + email confirmation
- All third-party vendors must sign DPA (Data Processing Agreement)
