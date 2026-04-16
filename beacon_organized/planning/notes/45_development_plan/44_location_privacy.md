# Location Sharing & Privacy Module

Fine-grained location sharing controls supporting four modes (off, group-only, EMS-only, public) with granularity levels (exact, neighborhood-block, neighborhood, city). Includes emergency override, privacy audit trail, location retention policies, and anonymization.

---

## 1. Module Metadata

**Team:** Privacy & Security

**Parent Module:** Beacon Core Platform

**Sub-Modules:** Granularity Controls, Emergency Override, Audit Trail, Data Retention

**Goal:** Enable location-based coordination while protecting user privacy through user-controlled sharing modes, granularity levels, and comprehensive audit trails.

**Mission Alignment:** Saves lives through coordinated location sharing during emergencies while respecting privacy expectations; builds user trust in Beacon.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| User location | Device GPS | JSON | Periodic | `{lat, lon, accuracy, timestamp}` |
| Location share mode | User setting | JSON | On-change | `{user_id, mode, granularity, duration}` |
| Location share per-group | User setting | JSON | On-change | `{user_id, group_id, granularity, enabled}` |
| EMS emergency request | EMS system | JSON | On-emergency | `{ems_agency_id, user_id, incident_id, reasoning}` |
| EMS location acceptance | User action | JSON | On-request | `{request_id, accepted, timestamp}` |
| Location access request | External service | JSON | On-request | `{accessor_id, user_id, purpose, context}` |
| Mesh location relay | Mesh network | JSON | Real-time | `{location_blob, relay_path, timestamp}` |
| **Output: User location** | Authorized recipient | JSON encrypted | On-request | `{lat, lon, accuracy, timestamp}` (granularity-applied) |
| **Output: Granular location** | Authorized recipient | JSON | On-request | `{grid_id, approximate_location}` |
| **Output: Audit trail** | User dashboard | JSON | On-request | `{accessor_id, access_time, context, result}` |
| **Output: Location history** | User export | JSON | On-request | `{location_events, timestamp_range, anonymized}` |

**Output Consumers:** Authorized groups, EMS during emergencies, public (approximate only), users viewing own audit trail.

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `setLocationShareMode()` | User selects overall sharing mode | User ID, mode (off/group/ems/public) | Mode saved, effective immediately | p95 < 500ms | User DB, Location DB | Backward compatible |
| `setLocationGranularity()` | User selects precision level per recipient | User ID, recipient/group, granularity | Granularity saved | p95 < 500ms | User DB | Options validated |
| `getLocationForGroup()` | Retrieve user location at group's granularity | Requester ID, user ID, group ID | Location at granularity, encrypted | p95 < 500ms | Location DB, encryption | Access logged |
| `roundLocationToGranule()` | Apply granularity grid to coordinates | Coordinates, granularity level | Granular location (grid center) | p95 < 100ms | Geohash lib | Multiple granularity levels |
| `encryptLocationForGroup()` | Encrypt location with group public key | Location, group_id | Encrypted blob | p95 < 100ms | Crypto lib | AEAD cipher |
| `decryptLocationInGroup()` | User decrypts group-shared location | Encrypted blob, user_id | Decrypted coordinates | p95 < 100ms | Crypto lib, local key | Key stored locally only |
| `requestLocationEMS()` | EMS requests location during emergency | EMS agency ID, user ID, incident ID, reasoning | Location request pushed to user | p95 < 2s | Push notification | Reasoning captured |
| `acceptLocationRequest()` | User grants EMS access to location | Request ID, user ID | Location provided to EMS, expiry set | p95 < 500ms | Location DB, EMS access | 30-minute auto-expiry |
| `denyLocationRequest()` | User refuses EMS location access | Request ID, user ID | Request denied, logged | p95 < 500ms | Audit log | No re-request within 1 hour |
| `overrideLocationMode()` | EMS claims emergency; auto-request location | EMS agency ID, user ID, incident evidence | Location auto-shared 30min if EMS verified | p95 < 1s | Auth system, EMS verify | Requires incident evidence |
| `applyEmergencyOverride()` | System forces location share when life-threatening | Event ID, user ID, override_reason | Exact location shared to EMS | p95 < 500ms | Alert system | Only during Level 5 alert |
| `auditLocationAccess()` | Log who accessed user's location and when | Accessor ID, user ID, context, timestamp | Audit entry created | p95 < 200ms | Audit log DB | Every access logged |
| `viewLocationAuditTrail()` | User reviews location access history | User ID, date_range | Sorted audit entries | p95 < 1s | Audit log DB | Last 6 months visible |
| `revokeHistoricalLocationAccess()` | User retroactively blocks past access | User ID, accessor_id, date_range | Historical records marked revoked | p95 < 500ms | Audit log DB | Cannot undo |
| `retainLocationData()` | Store location based on context + policy | User ID, location, context (group/ems/public) | Location stored with retention metadata | p95 < 500ms | Location DB | Context determines TTL |
| `deleteLocationHistory()` | Purge all location records for user | User ID | Deletion queued, scheduled | p95 < 500ms | Location DB | Cleanup within 24 hours |
| `deleteLocationByAge()` | Auto-delete aged location records per policy | Batch job | Deleted records count | Batch daily | Location DB | Automated enforcement |
| `anonymizeEventLocationData()` | Strip user ID from event-specific location | Event ID, location_records | Anonymized location data | p95 < 1s | Location DB | User ID irretrievable |
| `aggregateAnonLocations()` | Combine anonymized locations for statistics | Event ID, location_count | Aggregate statistics | p95 < 2s | Location DB | Privacy-preserving counts |
| `meshLocationRelay()` | Offline user broadcasts location via mesh | User ID, location, relay_range | Mesh node receives, relays | p95 < 500ms | Mesh network | 4-hop max range |
| `relayMeshLocationToServer()` | Mesh node forwards location when connected | Location blob, relay_path | Server location created | p95 < 1s | Mesh network, Location DB | Deduplicate rebroadcasts |
| `cacheLocationOffline()` | Store recent locations locally for offline use | User ID, locations[] | Cache updated | p95 < 500ms | Local storage | Last 24 hours |
| `syncLocationCacheOnline()` | Push cached locations to server | User ID | Sync completed | p95 < 1s | Location DB, Mesh | Merge strategy applied |
| `validateLocationAccuracy()` | Check GPS accuracy metadata | Location object | Accuracy assessment | p95 < 100ms | GPS lib | Alert if poor accuracy |
| `interpolateLocationHistory()` | Fill gaps in location timeline (movement inference) | User ID, date_range | Interpolated positions | p95 < 2s | Location DB | Epsilon-differential privacy |
| `addLocationNoiseForPrivacy()` | Apply differential privacy noise to locations | Locations[], epsilon | Noisy locations | p95 < 100ms | Crypto lib | Epsilon configurable |
| `requestDataExport()` | User requests location history export | User ID, format, date_range | Export queued | p95 < 500ms | Location DB, S3 | CSV or JSON |
| `generateLocationExport()` | Create downloadable location archive | User ID, export_id | CSV/JSON file created, signed URL | p95 < 5s | Location DB, S3 | GDPR-compliant format |
| `trackLocationBatteryDrain()` | Monitor location tracking impact on battery | User ID, tracking_frequency | Battery drain estimate | p95 < 200ms | Device metrics | Display to user |
| `adaptLocationFrequency()` | Auto-adjust tracking frequency based on battery | User ID, battery_percent | Update frequency adjusted | p95 < 500ms | Device metrics | Alert if <20% battery |
| `validateLocationRequest()` | Verify requesting service has permission | Requester ID, user ID, context | Authorized/denied | p95 < 100ms | Permission DB | Cache hits 99%+ |
| `logLocationAccessDenial()` | Record rejected location access attempts | Requester ID, user ID, reason | Denial logged | p95 < 200ms | Audit log DB | Security monitoring |
| `enableLocationSharing()` | User opts-in to location sharing (first time) | User ID | Sharing enabled, legal notice shown | p95 < 500ms | User DB | Must accept terms |
| `disableLocationSharing()` | User opts-out completely (all modes off) | User ID | Sharing disabled, all modes off | p95 < 500ms | Location DB | No location sent anywhere |

**Key Algorithms:** Granularity rounding uses geohash bucketing. Emergency override uses OAuth-style scoped access tokens. Privacy noise uses Laplace mechanism (epsilon-differential privacy). Location interpolation uses linear regression with privacy bounds.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, PostGIS, Redis, Elasticsearch, S3

### PostgreSQL + PostGIS

```sql
CREATE TABLE location_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  overall_share_mode VARCHAR(50),
  overall_granularity VARCHAR(50),
  location_sharing_enabled BOOLEAN DEFAULT FALSE,
  legal_notice_accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE group_location_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  granularity VARCHAR(50),
  enabled BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

CREATE TABLE location_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  accuracy_m INT,
  granularity_level VARCHAR(50),
  context VARCHAR(50),
  encrypted_location_blob BYTEA,
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_location_events_user_time ON location_events (user_id, timestamp DESC);
CREATE INDEX idx_location_events_timestamp ON location_events (timestamp DESC);
```

### TimescaleDB

```sql
CREATE TABLE user_locations_timeseries (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id BIGINT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  accuracy_m INT,
  context VARCHAR(50),
  granularity_level VARCHAR(50)
);

SELECT create_hypertable('user_locations_timeseries', 'time', if_not_exists => TRUE);
CREATE INDEX idx_locations_user_time ON user_locations_timeseries (user_id, time DESC);
```

### PostgreSQL (Audit)

```sql
CREATE TABLE location_access_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  accessor_id BIGINT,
  accessor_type VARCHAR(50),
  access_type VARCHAR(50),
  context VARCHAR(100),
  location_granularity VARCHAR(50),
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_audit_user_time ON location_access_audit (user_id, accessed_at DESC);
```

### PostgreSQL (Emergency Requests)

```sql
CREATE TABLE ems_location_requests (
  id BIGSERIAL PRIMARY KEY,
  ems_agency_id BIGINT NOT NULL REFERENCES ems_clients(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  incident_id BIGINT,
  incident_address VARCHAR(500),
  incident_type VARCHAR(100),
  reasoning TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  user_response VARCHAR(20),
  responded_at TIMESTAMP WITH TIME ZONE,
  location_shared_at TIMESTAMP WITH TIME ZONE,
  location_shared_until TIMESTAMP WITH TIME ZONE,
  access_count INT DEFAULT 0
);

CREATE INDEX idx_ems_requests_user ON ems_location_requests (user_id);
CREATE INDEX idx_ems_requests_expires ON ems_location_requests (expires_at);
```

### Redis

```
Key patterns:
  user:[user_id]:location_settings → {share_mode, granularity}
  user:[user_id]:current_location → {lat, lon, timestamp, accuracy}
  ems:[agency_id]:location_requests:[user_id] → {request_id, expires_at}
  location_access_cache:[accessor_id]:[user_id] → {authorized, expires_at}

TTL: Settings 24h, Current location 5min, EMS requests per expires_at, Access cache 1h
```

### S3

```
Bucket: beacon-location-exports
Prefix: /user/{user_id}/exports/{export_id}/
Retention: 30 days (then auto-delete)
Access: Signed URLs, user-only download
```

**Data Size Estimate:** 50M users, avg 1 location update per minute = 50M events/minute = 72GB/day = 2.16TB/month.

**Archival Strategy:** Location history deleted per policy: 30 days for events, 72 hours for group-only, 30 days post-event for emergency, anonymized indefinitely for aggregate stats.

---

## 5. UI Components

**Screens:**
- Privacy settings (location sharing, granularity levels per group)
- Legal notice + acceptance (terms, data retention, government access)
- Location sharing toggle (on/off switch per mode)
- EMS location request prompt (accept/deny with reasoning shown)
- Emergency override confirmation (automatic location share, notification)
- Location audit trail (who accessed, when, for what)
- Data export request (format, date range)
- Battery drain warning (location tracking impact)

**Buttons/Controls:**
- "Enable Location Sharing": Teal #0097B2 toggle, with legal link
- "Accept Location Request": Green, emergency prompt
- "Deny Location Request": Red, emergency prompt
- "View Audit Trail": Navy #0B0F2A, privacy settings
- "Request Data Export": Gray, data section
- "Revoke Access": Red, audit trail row
- "Reduce Tracking Frequency": Orange, battery settings

**Map Layers:**
- User location: Blue dot at granularity level (approx, neighborhood, exact based on setting)
- Group member locations: Gray dots at group's granularity (if location sharing enabled)
- Anonymized heat map: Red gradient showing general evacuation flow (no individuals visible)

**Notifications/Alerts:**
- Location request: Push + in-app prompt, "EMS requests your location for emergency at [address]. Accept? Yes / No. (10 seconds)"
- Location shared: In-app, "Your location shared with EMS for 30 minutes"
- Location access denied: In-app, "EMS could not access your location"
- Audit trail update: In-app badge, "2 people accessed your location"
- Battery warning: In-app banner, "High-frequency location tracking. Battery will drain 25% per 8 hours"

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A for primary, red for emergency, teal #0097B2 for enable.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-location-api | Node.js/Express | `npm run build && npm run test` | Backend team |
| beacon-location-ui | React Native | `npm run build:ios && npm run build:android` | Mobile team |
| beacon-privacy-engine | Go/gRPC + differential privacy lib | `go build ./...` | Privacy team |
| beacon-audit-service | Elasticsearch + Logstash | `docker compose up` | Security team |

**Deployment:** Docker on Kubernetes. Separate cluster for location data (privacy isolation).

**CI/CD:** GitHub Actions with OWASP scanning. Manual approval for privacy-critical changes.

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Design, privacy threat model, legal review
2. **Months 2-3:** Location storage, granularity rounding, basic audit
3. **Months 3-4:** Sharing modes, EMS emergency requests, privacy UI
4. **Months 4-5:** Differential privacy, data export, legal notices
5. **Month 5+:** Beta with privacy auditor, production rollout

**Build Phases:**
- Phase 1: Location storage, granularity, basic sharing modes (2 months)
- Phase 2: Emergency requests, audit trail, EMS integration (2 months)
- Phase 3: Differential privacy, data export, legal notices (1.5 months)

**Test Coverage Targets:** 95% unit (privacy-critical), 80% integration. Priority: encryption, access control, audit logging.

**Deployment Strategy:** Blue-green. Canary 1% → 10% → 50% → 100%.

**Monitoring Metrics:** Location request acceptance rate 70%+, audit trail completeness 99.9%+, data export success rate 99%+.

**Improvement Research:** User feedback on granularity levels (too coarse/fine?), audit trail comprehension, privacy confidence survey.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:** CCPA (user control, deletion rights), GDPR (legitimate interest, data minimization), Good Samaritan (EMS liability protection).

**PII Handled:** User location (precise coordinates), location history, emergency contact location.

**Encryption:**
- In-transit: TLS 1.3
- At-rest: AES-256-GCM for location events, encrypted blobs for group shares
- Keys: Per-user key for group decryption, HSM for server keys

**Audit Trail:** Every location access logged: who, when, why, context. User can view + revoke. Retained 6 months.

**Data Retention:**
- Group-only sharing: 72 hours on server
- EMS emergency: Incident duration + 30 days
- Public/team: Real-time only, no history
- Aggregate stats: Indefinite (anonymized)
- User deletion: All location purged within 30 days

**Third-Party Integrations:** None for location data (all internal). EMS agencies must sign DPA for emergency access.

---

## 9. Mesh/Offline

**Offline-First Features:**
- Cache recent location (last 24 hours) on device
- Offline users can broadcast location via mesh (4-hop range)
- Mesh relay unencrypted (local mesh only)
- Location resolution/granularity applied on-device

**Sync Strategy:** CRDT for location settings, Last-Write-Wins for audit trail.

**Cache Size:** 24 hours of location data ~500MB. Granular settings ~1MB.

**Priority Queue:** Location settings → location events → audit logs.

**Compression:** Location: lat/lon as fixed-point integers (20 bytes vs 32). Gzip for metadata.

---

## 10. Update Protocols

**Update Frequency:** Bug fixes same-day. Feature releases weekly. Major updates monthly.

**Rollout Strategy:** Staged with privacy auditor approval: 1% → 10% → 50% → 100%.

**Rollback Plan:** Automatic rollback if encryption fails, audit trail gaps detected, or unauthorized access.

**User Notification:** In-app banner for privacy settings changes. Email for data retention policy changes.

**Testing Before Release:** Staging with privacy auditor, penetration testing for encryption.

---

## 11. Cross-Module Dependencies

**Consumes:**
- Account & Auth (43): User identity, permission validation
- Public Users (40): Location source (GPS from mobile)
- EMS Clients (42): Emergency requests, incident data
- Group module (41): Group membership, granularity settings
- Encryption library: Crypto operations
- Messaging system: Audit log delivery

**Provides:**
- All authenticated clients: Location data at appropriate granularity
- EMS Admin: User location during emergencies
- Groups: Encrypted location to group members
- Audit trail: Privacy dashboard for users

**Critical Path:** Account & Auth must ship first. Encryption library dependency.

**Teams to Consult:**
- Legal team: CCPA, GDPR, Good Samaritan liability
- Privacy team: Differential privacy, data minimization
- Security team: Encryption, key management
- Compliance team: Audit log requirements

**Potential Conflicts:** Location precision + privacy (granularity trade-off). Emergency override + consent (life-safety vs privacy). Data export + fraud (social engineering risk).

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (location API, privacy engine): $20K
- Database (TimescaleDB, location sharding): $30K
- Encryption/HSM: $10K
- S3 (data exports): $5K
- Elasticsearch (audit logs): $10K
- Total: ~$75K/month

**Personnel (Monthly):**
- Team lead (1): $15K
- Backend engineers (2): $30K
- Privacy engineer (1): $20K
- Security engineer (1): $20K
- Legal (contract, 0.5 FTE): $10K
- Total: ~$95K/month

**Optimization Ideas:**
- Compress location history (reduce DB 50%)
- Batch audit log writes (reduce I/O 30%)
- Cache granularity calculations (reduce CPU 40%)

---

## 13. Agent Monitor Team

**5 Agents:**

1. **Quality Agent:** API latency, encryption errors, audit gaps
   - Alert: Location API latency p95 >1s
   - Alert: Encryption failure rate >0.01%
   - Alert: Audit log gaps detected

2. **Research Agent:** User behavior, sharing adoption, privacy expectations
   - Alert: Location sharing adoption <50%
   - Alert: Granularity misconfiguration detected
   - Alert: User audit trail requests >100%/month (high concern)

3. **Business Agent:** Cost per user, data export usage, compliance adherence
   - Alert: Cost per user-month >$0.10
   - Alert: Data export request volume spike
   - Alert: GDPR deletion request SLA miss

4. **Compliance Agent:** Unauthorized access, audit trail integrity, legal compliance
   - Alert: Unauthorized location access detected
   - Alert: Audit trail tampering suspected
   - Alert: CCPA data retention violation

5. **Lead Agent:** Orchestrates other 4, escalates patterns
   - Escalates: Potential privacy breach
   - Escalates: Legal compliance failure
   - Escalates: 3+ agents alert simultaneously

**Reporting:** Each agent reports to module owner + privacy lead.

---

## 14. Validation Practices

**Accuracy Targets:**
- Granularity rounding: 100% correctness (wrong granule = privacy leak)
- Audit trail completeness: 99.9% (all access logged)
- Encryption: 100% coverage (no plaintext location ever sent)
- EMS request timeout: 100% enforcement (30 minutes exact)

**Loss Weighting:**
- False negative audit (unmissed unauthorized access): 1000x cost
- False positive audit (false alarm): 1x cost
- Encryption failure (data leak): 10000x cost
- Granularity violation (coarse instead of granular): 100x cost

**A/B Testing:**
- Granularity UI: measure comprehension, selection accuracy
- Emergency override default: measure acceptance vs override fatigue
- Data export format: measure usability (CSV vs JSON)

**Drift Detection:**
- Unauthorized access attempts: daily analysis
- Granularity setting compliance: weekly sampling
- Encryption failure rate: continuous monitoring
- Audit trail lag: daily monitoring

**Validation Data:** User privacy surveys, CCPA-GDPR audit samples, penetration test results.

---

## 15. Data Science Considerations

**Model Selection:** Location interpolation uses Kalman filter for smooth prediction. Differential privacy uses Laplace mechanism (epsilon configurable). Granularity selection uses user preference + context.

**Training Data:**
- Location interpolation: 1M user trajectories with ground truth
- Differential privacy: Theoretical models + empirical validation
- Granularity preference: User survey + usage patterns

**Retraining Schedule:** Interpolation model quarterly. Differential privacy epsilon values reviewed monthly.

**Benchmarks:** Location prediction baseline 80% accuracy within 100m, target 90%. Privacy guarantee: epsilon <0.1 (strong privacy, acceptable utility).

**Failure Cases:** Interpolation fails on stationary users (home). Differential privacy utility low at strict epsilon. Granularity too coarse for accurate dispatch.

**Explainability:** Show user their granularity choice ("Sharing at neighborhood level"). Explain EMS request reasoning ("Police emergency at your reported location").

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Backend: Node.js/Express + Go/gRPC
- Database: PostgreSQL + PostGIS, TimescaleDB
- Encryption: libsodium (NaCl)
- Differential privacy: Go differential privacy library
- Audit: Elasticsearch

**External Dependencies:**
- express ^4.18
- libsodium ^1.0
- differential-privacy ^0.2
- Security scanning: npm audit, libfuzzer

**CI/CD Pipeline:**
- Lint: ESLint, Go fmt
- Tests: Jest, go test (95%+ coverage)
- Security: OWASP ZAP, libfuzzer for encryption
- Performance: Load test 100K location events/sec
- Deployment: Manual approval for encryption changes

**Technical Debt:**
- Refactor location interpolation (currently monolithic)
- Add encryption key rotation automation
- Implement audit log streaming (currently batch)

**SLA & Runbooks:**
- Availability: 99.9%
- Location request response: p95 <2s
- Encryption latency: p95 <100ms
- Audit trail completeness: 99.9%
- Incident response: <1 hour for privacy breach
- Oncall runbook: Check K8s, check encryption, alert privacy lead

**Scalability:** Target 50M users, 50M location events/minute peak. Bottleneck: TimescaleDB write throughput. Mitigation: sharding by user_id, batch inserts, async processing.

---

## Notes

- Location data is one of most sensitive PII; treat with extreme care
- Granularity levels are privacy-critical; off-by-one error = privacy leak
- EMS emergency override must be logged exhaustively (potential legal defense)
- Differential privacy epsilon values tuned for balance between utility + privacy
- Audit trail cannot be modified (append-only log)
- User must always be able to view who accessed their location + revoke retroactively
- Group location encryption must use group public key (not server key)
- Data export must be GDPR-compliant (machine-readable, portable format)
- Location caching on device is on-device, never transmitted without user consent
- Consider legal implications of location data during criminal investigations
