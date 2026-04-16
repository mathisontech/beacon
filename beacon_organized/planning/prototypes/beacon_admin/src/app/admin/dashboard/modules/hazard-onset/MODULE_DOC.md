# Hazard Onset Response Module Documentation

## Module Overview

The Hazard Onset Response module orchestrates the complete system response during the first minutes after a hazard is triggered. It bridges detection (hazard models firing) to actionable emergency management, ensuring every affected user receives survival-critical information and EMS has situational awareness.

**Mission:** From trigger fired to every affected user has what they need to survive.

---

## 1. Module Metadata

**Team:** Hazard Response Engineers + Integration Lead

**Parent Module:** Emergency Orchestration System

**Sub-Modules:**
- Onset Response Manager
- Data & Polling Protocols
- User Status & Requests
- Cache & Guidance Protocols

**Goal:** Execute coordinated system activation within 30 seconds of hazard trigger confirmation.

**Mission Alignment:** Saves lives by eliminating the lag between hazard detection and user action.

**Owner:** Module Lead (Hazard Response), contact: [oncall-hazard@beacon]

---

## 2. Inputs/Outputs

### Data Flow

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| **Hazard Trigger Signal** | Hazard Models (wildfire/flood/quake/etc.) | JSON (NATS) | Event-driven | `{hazard_type: "wildfire", lat: 37.8, lng: -120.5, confidence: 0.92, magnitude: 100_acres}` |
| **Trigger Validation** | Validation Agent | JSON | <5 min after trigger | `{valid: true, confidence: 0.92, reasoning: "satellite_hotspot + 3_reports"}` |
| **Location Data** | Location Sharing Module | JSON | Real-time during event | `{user_id: "u123", lat: 37.85, granularity: "exact", timestamp: "2026-03-25T14:23:45Z"}` |
| **Hazard Model Output** | Each hazard module | GeoJSON | Continuous updates | `{geometry: {type: "Polygon", coordinates: [...]}, properties: {confidence: 0.92, danger_zone: "orange"}}` |
| **Herd Location Estimates** | Location Inference Engine | GeoJSON Polygon | Batch (every 30s) | `{area_id: "zip_37823", user_count: 425, est_location: Point(37.82,-120.5)}` |
| **Sensor Data (auto-trigger)** | Mobile clients via mesh | JSON | Real-time | `{user_id: "u456", event: "car_crash", lat: 37.81, lng: -120.48, timestamp: "2026-03-25T14:23:47Z"}` |

**Output Consumers:**

| Consumer | Data Type | Purpose | Frequency |
|----------|-----------|---------|-----------|
| **Notifications & Alerts Module** | Alert payloads + geofence | Send SMS/push/mesh to affected users | <30 sec |
| **User Interface** | GeoJSON + status updates | Show hazard on map, status prompts | Real-time |
| **EMS Admin Dashboard** | Situation report + map overlay | Provide situation overview + population estimate | Real-time |
| **Evacuation Routing** | Danger zone geometry + population | Route users away from hazard | Real-time |
| **Cache & Guidance** | Hazard type + location + confidence | Pre-load hazard-specific guidance + shelters | <5 sec |
| **Data Storage** | Event record + audit log | Record all decisions for post-event analysis | Async |
| **Mesh Network** | Compressed alert bundle | Offline delivery for no-service users | <5 min relay |

---

## 3. Function Breakdown

### Core Functions

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `initiate_hazard_trigger()` | Start onset cascade on hazard model signal | Hazard trigger JSON | Event ID + trigger_acknowledged | <50ms | NATS, validation agent | Trigger received within 5ms of model publish |
| `validate_trigger()` | Cross-reference trigger against multiple data sources | Trigger JSON + hazard model output | Validation decision (valid/invalid) + confidence | <4 min | Satellite API, NWS, ground reports | Confidence score correlates with ground truth |
| `compute_initial_danger_zone()` | Calculate affected area using hazard model + terrain | Hazard extent GeoJSON + base map | Danger zone polygon + population estimate | <2 sec | Hazard models, base map, PostGIS | Zone encompasses 95%+ of affected users (validate post-event) |
| `estimate_herd_locations()` | Determine where users are when GPS unavailable | ZIP/cell tower data + last-known locations | Herd polygon per area ID + confidence | <3 sec | Location module, herd inference model | Herd estimates within 500m of ground truth |
| `send_initial_notifications()` | Push alert to EMS + affected users | Danger zone + user location data | Delivery log per user + channel | <30 sec (users), <2 sec (EMS) | Notifications module, NATS | >95% push delivery within SLA |
| `issue_status_requests()` | Send conditional status/condition prompts to users | User location + hazard type | Status prompt queued per user | <45 sec | User status module, geofencing | Prompt reaches 85%+ of affected users |
| `activate_hazard_protocols()` | Adjust polling, caching, guidance per hazard type | Hazard type + confidence + location | Protocol activation record | <5 sec | Data protocols, cache module | Each protocol activates within SLA |
| `generate_ems_overview()` | Create situation report for EMS dashboard | Danger zone + population + status responses | Overview JSON (map overlay + metrics) | <60 sec | EMS integration, aggregation | Shows population, responder accessibility, resource gaps |
| `handle_cascade_scenarios()` | Detect multi-hazard chains (e.g., earthquake → landslide) | Primary hazard trigger + secondary hazard detection | Cascade event record | <10 sec | Coordinator agent, secondary hazard modules | Cascade detected and secondary module activated |

**Key Algorithms:**

1. **Danger Zone Computation:** Uses hazard model's predicted extent + confidence contours. For wildfire: wind direction, fuel moisture, terrain slope. For flood: elevation model, upstream flow. For quake: ShakeMaps (USGS). For tornado: path probability cone. If confidence <65%, expand zone by safety factor. If confidence >85%, tighten zone to reduce unnecessary evacuation.

2. **Herd Location Inference:** When individual GPS unavailable (offline mesh, privacy mode), estimate population concentration from: (a) cell tower associations, (b) last-known location + movement patterns, (c) Beacon signup density per ZIP. Output: centroid + confidence radius per area. Uses Bayesian update as new data arrives.

3. **Priority Queue for Notifications:** EMS alerts sent first (critical path), then users within 5km of hazard perimeter (highest risk), then users in secondary zones. During mesh overload, standardized messages prioritized over custom messages.

4. **Cascading Event Detection:** Coordinator agent monitors all module outputs. If earthquake triggers landslide threshold, flood module auto-activates. If wildfire meets air quality thresholds, severe weather module alerted. Multi-hazard merges zones (union, not intersection).

---

## 4. Databases & Tables

### PostgreSQL + PostGIS

```sql
-- Main event record
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'wildfire', 'flood', 'earthquake', 'tornado', etc.
  jurisdiction_id BIGINT NOT NULL REFERENCES jurisdictions(id),
  hazard_extent GEOMETRY(Polygon, 4326) NOT NULL,
  danger_zone GEOMETRY(Polygon, 4326),
  trigger_source VARCHAR(100), -- 'usgs_earthquake', 'nws_tornado_warning', 'ground_report', 'auto_sensor'
  trigger_confidence DECIMAL(3,2),
  validation_status VARCHAR(20), -- 'pending', 'valid', 'invalid', 'ambiguous'
  affected_population_estimate BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Audit trail for all decisions
CREATE TABLE event_audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  action VARCHAR(100), -- 'trigger_received', 'validation_passed', 'alert_sent', 'override_applied'
  user_id BIGINT REFERENCES users(id),
  agent_id VARCHAR(100), -- For agent-initiated actions
  data_snapshot JSONB, -- Full state at time of action
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Herd location estimates (aggregate user locations)
CREATE TABLE herd_location_estimates (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  area_id VARCHAR(50), -- ZIP code or cell tower sector
  user_count BIGINT,
  estimated_location GEOMETRY(Point, 4326),
  confidence_radius_meters FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User status requests issued during event
CREATE TABLE user_status_requests (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  request_type VARCHAR(50), -- 'safe_status', 'condition_report', 'ring_consent'
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_value VARCHAR(100), -- 'safe', 'need_help', 'severe', etc.
  follow_up_needed BOOLEAN
);

-- Initial notifications sent during onset
CREATE TABLE onset_notifications (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  recipient_id BIGINT NOT NULL REFERENCES users(id),
  channel VARCHAR(20), -- 'push', 'sms', 'mesh', 'ems_direct'
  alert_type VARCHAR(50), -- 'evacuation_order', 'shelter_in_place', 'status_request'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- Cascade event tracking
CREATE TABLE cascade_events (
  id BIGSERIAL PRIMARY KEY,
  primary_event_id BIGINT NOT NULL REFERENCES events(id),
  secondary_event_id BIGINT NOT NULL REFERENCES events(id),
  cascade_type VARCHAR(50), -- 'earthquake_to_landslide', 'wildfire_to_air_quality', etc.
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  merged_zone GEOMETRY(Polygon, 4326)
);

-- Protocol activation records
CREATE TABLE protocol_activations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id),
  hazard_type VARCHAR(50),
  protocol_name VARCHAR(100), -- 'data_polling_increase', 'evacuation_guidance_preload', etc.
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB -- Protocol-specific config (polling frequency, cache size, etc.)
);

CREATE INDEX idx_events_jurisdiction ON events(jurisdiction_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_published_at ON events(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_events_hazard_extent ON events USING GIST(hazard_extent);
CREATE INDEX idx_herd_estimates_event ON herd_location_estimates(event_id);
CREATE INDEX idx_user_status_requests_event_user ON user_status_requests(event_id, user_id);
CREATE INDEX idx_onset_notifications_event ON onset_notifications(event_id);
CREATE INDEX idx_audit_log_event ON event_audit_log(event_id);
```

### TimescaleDB (Time-Series)

```sql
-- Hazard observation history (for model input validation)
CREATE TABLE hazard_observations (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_id BIGINT NOT NULL,
  hazard_type VARCHAR(50),
  location GEOMETRY(Point, 4326),
  magnitude FLOAT,
  confidence DECIMAL(3,2),
  source VARCHAR(100) -- 'usgs', 'nws', 'user_report', 'sensor'
);

SELECT create_hypertable('hazard_observations', 'time', if_not_exists => TRUE);
CREATE INDEX idx_hazard_obs_event_time ON hazard_observations (event_id, time DESC);

-- EMS notification acknowledgment timeline
CREATE TABLE ems_ack_timeline (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_id BIGINT NOT NULL,
  ems_agency_id BIGINT NOT NULL,
  status VARCHAR(20), -- 'notified', 'acknowledged', 'escalated'
  responder_count BIGINT
);

SELECT create_hypertable('ems_ack_timeline', 'time', if_not_exists => TRUE);
CREATE INDEX idx_ems_ack_event ON ems_ack_timeline (event_id, time DESC);
```

### Redis

Cache for real-time state during onset window (5-30 minutes):

```
Key Patterns:
- onset:{event_id}:validation_status → '{"valid": true, "confidence": 0.92}'
- onset:{event_id}:danger_zone → GeoJSON string (Polygon)
- onset:{event_id}:affected_users → Set of user IDs
- onset:{event_id}:herd_estimates → JSON (area_id → count)
- onset:{event_id}:ems_notified → Set of agency IDs
- onset:{event_id}:notification_queue → List of {user_id, channel, alert_type}

TTL: 1 hour (auto-cleanup after event window closes)
```

### NATS Streams

```
Subject: hazard.onset.{hazard_type}
  - Published by: Hazard models, validation agent
  - Consumed by: Onset Response Manager
  - Retention: 7 days (audit trail)
  - Schema: Trigger JSON + confidence + source

Subject: ems.alert.critical
  - Published by: Onset Response Manager
  - Consumed by: EMS dashboards, dispatch
  - Retention: 24 hours

Subject: user.status.requested
  - Published by: Onset Response Manager
  - Consumed by: User interface, analytics
  - Retention: 7 days

Subject: event.cascade.detected
  - Published by: Coordinator agent
  - Consumed by: Secondary hazard modules
  - Retention: 7 days
```

### S3

```
Bucket: beacon-prod
Prefix: /onset-response/{event_id}/

Files:
- /metadata.json → Event record snapshot at trigger
- /danger_zone.geojson → Computed danger zone
- /audit_log.jsonl → Audit trail (append-only)
- /notifications_sent.jsonl → Log of every notification
- /herd_estimates.jsonl → Herd location snapshots

Retention: 7 years (regulatory requirement)
Access: Private (signed URLs for authorized investigators)
```

**Data Size Estimate:**
- Per event: ~10MB average (hazard extent, audit log, notifications)
- Per year: ~365 events × 10MB = 3.65GB (conservative estimate for 1 region)
- Scale to national deployment: 50+ regions × 3.65GB = 180GB/year

**Archival Strategy:**
- Days 0-7: Hot storage (S3 Standard, daily snapshots)
- Days 7-90: Warm storage (S3 Intelligent-Tiering)
- 90+ days: Cold storage (S3 Glacier Deep Archive)
- Purge: 7 years post-event (compliance requirement)

---

## 5. UI Components

### EMS Admin Dashboard (Onset Response View)

**Screens:**

1. **Hazard Alert Trigger Screen**
   - Map display with hazard extent (colored polygon: orange for wildfire, blue for flood, yellow for quake, red for tornado)
   - Population estimate overlay ("12,500 estimated affected users")
   - Confidence badge ("92% confidence")
   - Two action buttons: "VALIDATE & PUBLISH ALERT" (green) | "SUPPRESS (Document Reason)" (red)
   - Validation reasoning display (satellite imagery, NWS data, ground reports)

2. **Real-Time Status Dashboard**
   - Live hazard extent animation (updates every 5-30 seconds)
   - User response heatmap (green = safe/responding, yellow = no response, red = need help)
   - EMS team locations + vehicle markers
   - Resource request panel (helicopters needed, evacuation shelters at capacity)
   - Timeline of events (trigger → validation → alert sent → first response → current time)
   - Mesh network status (% coverage, # offline users being tracked via mesh)

3. **User Status & Condition Panel**
   - Count of status requests sent vs. responded
   - Breakdown: "Safe" vs. "Need Help" vs. "Severe" vs. "No Response"
   - Geographic heatmap of condition reports (red = high injury area)
   - Filter by: user group, location, response type

4. **Cascade Event Monitor**
   - If multi-hazard detected, show secondary hazard merge interface
   - Union of danger zones highlighted
   - New resources requested by secondary module

**Buttons/Controls:**
- "SEND STATUS REQUEST TO [ZONE]" (blue): Geofence selector → issue status requests to affected users
- "REQUEST RING DOORBELL ACCESS" (purple): Opt-in to security camera footage from affected buildings
- "ACTIVATE EVACUATION GUIDANCE" (orange): Pre-load evacuation routes + shelter locations on user devices
- "MARK ZONE CLEAR" (green): EMS confirms area is evacuated/safe
- "REQUEST BACKUP SUPPORT" (red): Escalate to state/federal resources
- "OVERRIDE VALIDATION" (dark red): Module lead suppresses auto-trigger (with mandatory documentation)

**Map Layers:**
- Hazard extent: Polygon with gradient (intense color near source, fading toward edge)
- Danger zone: Dashed outline, semi-transparent overlay
- User concentration: Heatmap (density estimate from location data)
- EMS assets: Truck icons (color by type: fire=red, ambulance=white, police=blue)
- Evacuation routes: Green arrows, showing direction + capacity
- Shelters: Green shelter icons, showing current capacity %
- Offline users (mesh-tracked): Gray circles (less precise location)

**Notifications/Alerts:**
- Toast: "Hazard trigger received. Validating..." (auto-dismiss in 5 sec)
- Modal: "Validation failed. Reason: [insufficient data | conflicting reports]" (requires action)
- Banner: "Multi-hazard cascade detected. Secondary event published." (yellow)
- Critical: "Validation timed out. Default to manual review." (red, blocks alert publish)

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A / teal #0097B2, high-contrast emergency mode

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| `beacon-backend/services/onset-response` | Node.js + TypeScript | `npm run build`, Docker multi-stage | Backend Lead |
| `beacon-backend/services/validation-agent` | Python + FastAPI | `docker build`, GPU-optional | ML Engineer |
| `beacon-backend/services/coordinator-agent` | Python + Claude (agentic) | `docker build`, NATS integration | AI Systems Lead |
| `beacon-frontend/admin/hazard-onset` | React + TypeScript + Mapbox GL | `npm run build`, Vite | Frontend Lead |
| `beacon-mobile/location-inference` | Kotlin (Android) + Swift (iOS) | `gradle build`, Xcode | Mobile Lead |

**Deployment:**
- Backend services: Docker containers on ECS (Fargate)
- Validation agent: GPU instance (p3.2xlarge) for real-time model inference
- Frontend: CloudFront + S3 (static assets)
- Real-time: NATS server cluster on EKS

**CI/CD:**
- GitHub Actions workflows:
  - PR: lint (ESLint/flake8), unit tests, security scan (Snyk)
  - Merge to main: integration tests, end-to-end tests (Playwright), load tests
  - Release: blue-green deployment to staging, 2-hour canary on prod (1% traffic), then full rollout
  - Rollback: Automatic if error rate >1% or p95 latency >2sec

---

## 7. Lifecycle

### Milestones

1. **Months 1-2 (Months -5 to -4 from launch):** Requirements, design review with EMS stakeholders, validation agent model selection
2. **Months 2-3 (Months -4 to -3):** Core orchestration engine, initial integration with hazard models, validation agent training
3. **Months 3-4 (Months -3 to -2):** Notification delivery integration, EMS dashboard, user status request system, mesh relay
4. **Months 4-5 (Months -2 to -1):** Beta deployment (1 region, 100K users), simulation testing, stress testing
5. **Month 5+ (Month 0+):** Production rollout, monitoring, post-event review cycle

### Build Phases

**Phase 1 (MVP - Single Hazard):**
- Onset Response Manager (core orchestration)
- Single hazard type trigger (wildfire, chosen for high event frequency)
- Basic danger zone computation
- EMS notification only (no user notifications)
- Validation agent: rule-based (confidence thresholds + data source checks)

**Phase 2 (Multi-Hazard + User Notifications):**
- Support all hazard types (flood, quake, tornado, etc.)
- User push notifications + SMS fallback
- Status request system (are you safe?)
- Herd location estimation
- ML-based validation agent (replaces rules)
- Cascade event detection

**Phase 3 (Advanced Protocols + Offline)**
- Data polling protocol adjustment per hazard
- Cache & guidance pre-loading
- Mesh network relay for offline users
- Ring doorbell consent system
- A/B testing framework for notification content
- Advanced situation report with population+resource models

### Test Coverage Targets

- Unit tests: 85% coverage (critical functions 100%)
  - Orchestration logic, danger zone computation, herd inference
- Integration tests: 70% coverage
  - End-to-end trigger → notification delivery
  - Cascade detection across modules
  - EMS dashboard updates in real-time
- E2E tests: Key user journeys
  - Hazard trigger → EMS receives alert → user gets notification → status request
  - Multi-hazard cascade → secondary module activates
- Simulation tests: 10+ historical events replayed
  - Model outputs compare against ground truth (actual hazard extent)
  - Timing compliance (SLAs met)
  - No regressions in accuracy

### Deployment Strategy

- **Blue-green:** Two identical production environments. Traffic switched instantly on success.
- **Rollout phases:** 5% traffic day 1, 25% day 2, 100% day 3.
- **Automatic rollback:** If error rate >1% or alerting thresholds breached, revert to previous version.
- **Canary duration:** 2 hours minimum before full rollout.

### Monitoring Metrics (KPIs)

**Latency:**
- p50: <200ms (user location ingestion to notification queued)
- p95: <500ms
- p99: <1.5s
- SLA: 95% of alerts delivered within 30 seconds of trigger validation

**Accuracy:**
- Danger zone recall: >95% (captures 95%+ of affected users)
- Danger zone precision: >80% (minimal false positive evacuations)
- Herd location error: <500m (validated post-event)
- Cascade detection: 100% (catch all multi-hazard scenarios)

**Reliability:**
- Uptime: 99.99% (max 52 minutes downtime/year)
- Alert delivery success: >99% (push + SMS fallback)
- Data corruption: 0 (immutable audit log)

**Cost:**
- Per-trigger: <$1 (compute, storage, third-party APIs)
- Infrastructure: <$10K/month (on-demand scaling)

**User Engagement:**
- Alert acknowledgment rate: >70% (within 10 minutes)
- Status request response rate: >60%
- Help request auto-generation accuracy: >90%

### Improvement Research

- A/B tests:
  - Alert wording: "Leave now" vs. "Evacuate immediately" → measure response time
  - Notification channel: Push-only vs. push+SMS → measure delivery + acknowledgment
  - Geofence precision: 1km vs. 5km safety buffer → measure unnecessary evacuation
- User feedback: Monthly surveys to EMS + affected public (post-event)
- Model retraining: Monthly validation agent retraining on new ground truth data
- Performance analysis: Monthly p95 latency reviews, quarterly capacity planning

---

## 8. Legal/Privacy/Security

### Applicable Regulations

- **FEMA Integration:** Compiles with ICS/NIMS for incident command interoperability
- **Good Samaritan:** Protection from liability for emergency notifications sent in good faith
- **HIPAA (if medical data involved):** Encryption, audit trails, access control
- **CCPA:** Users can request deletion of location history
- **FCC 47 CFR § 64.1200:** SMS delivery requirements
- **State Regulations:** Varies by jurisdiction (California AB 32, etc.)

### PII Handled

| Data Type | Handled? | Usage | Retention |
|-----------|----------|-------|-----------|
| User ID | Yes | Event association, status tracking | Event duration + 30 days |
| Location (precise) | Yes | Danger zone computation, EMS routing | Event + 30 days (then anonymize) |
| Location (granular) | Yes | Herd estimates, mapping | Event duration |
| Phone | Yes | SMS delivery | Lookup only, not stored |
| Name | No | N/A | N/A |
| Health data | No (unless volunteered) | N/A | N/A |

### Encryption

- **In-transit:** TLS 1.3 (all API calls, NATS streams)
- **At-rest:** AES-256-GCM for sensitive audit logs, location history
- **Key management:** AWS KMS (customer-managed keys, annual rotation)
- **Mesh encryption:** Location over mesh is unencrypted (local mesh only), but relay nodes discard after forwarding

### Audit Trail

**Logged Events:**
- Trigger received: timestamp, source, hazard type, location
- Validation passed/failed: confidence score, reasoning, data sources checked
- Alert sent: user_id, channel, message content, delivery status
- User action: status responses, help requests, acknowledgments
- EMS action: validation override, resource request, zone markings
- Cascade detection: secondary hazard type, merged zone

**Retention:** 7 years in immutable S3 (object lock)

**Access Control:**
- Beacon employees: Authorized investigators only (legal, auditors)
- Third parties: Signed URLs with expiration (7-day max)
- User access: Users can request their own location history via GDPR/CCPA portal

**Full-Text Search:** Elasticsearch index for audit trail (queryable by user, event, action type)

### Data Retention

| Data | Duration | Reason | Purge Method |
|------|----------|--------|--------------|
| Event metadata | 7 years | Regulatory (FEMA) | Automated job |
| Audit trail | 7 years | Legal hold | Automated job |
| Location history | 6 months (event) + 1 year (aggregate stats) | Analytics, after-action report | Automated anonymization job |
| User status responses | 2 years | Historical analysis, cascade patterns | Automated deletion |
| Notification logs | 1 year | Delivery debugging | Automated deletion |
| Herd estimates | Event duration + 30 days | Population analysis | Automated deletion |

### Third-Party Integrations

| Service | Data Shared | DPA Signed? | Purpose |
|---------|-------------|------------|---------|
| USGS (earthquake data) | None (we call them) | N/A | Trigger validation |
| NWS (tornado/flood) | None (we call them) | N/A | Trigger validation |
| Twilio (SMS) | Phone + alert text | Yes | SMS delivery |
| Firebase Cloud Messaging | User IDs, alert payload | Yes (Google) | Push delivery (Android) |
| Apple Push Notification | User tokens, alert payload | Yes (Apple) | Push delivery (iOS) |
| NATS (our infrastructure) | All real-time data | N/A (internal) | Event streaming |

---

## 9. Mesh/Offline

### Offline-First Features

1. **Hazard Alert Caching:** User device caches last-received hazard extent + danger zone (GeoJSON, ~200KB per event). When offline, user can still see where hazard is.

2. **Offline Navigation:** User can view pre-cached evacuation routes + shelter locations without internet. Routes pre-computed during "normal" operation.

3. **Mesh Location Relay:** When offline, user can broadcast their location to nearby mesh nodes. Nodes relay to broader mesh → server when any node connects.

4. **Status Request Queuing:** If offline when status request arrives via mesh, phone queues response. Sends on reconnection.

5. **Condition Report Upload:** User can photograph damage/fire/flooding while offline, queued for upload on reconnection.

### Sync Strategy

**Conflict Resolution:**
- If user claims "safe" but EMS marks area as "danger zone," take union (user could move). Data merged with latest timestamp winning.
- If location sync conflicts (user uploaded old location), server accepts newer location, discards old.

**Ordering:**
- Priority 1: Status requests (confirm safety)
- Priority 2: Help requests (alert EMS to people needing assistance)
- Priority 3: Condition reports (inform model)
- Priority 4: Location updates
- Mesh relays messages in this order when bandwidth constrained.

**Retry Logic:**
- Failed sync: Retry exponential backoff (5s, 10s, 30s, 2m, 5m) up to 7 days
- Long-term offline: After 7 days, old data auto-discarded (user has moved or received help)

### Cache Size

- Basemap tiles (1km coverage area): ~50MB (pre-downloaded during signup)
- Hazard extent + danger zone: ~1MB per event (caches last 3 events)
- Evacuation routes (1km radius): ~10MB (pre-computed)
- Shelters + POIs (1km radius): ~2MB
- **Total estimated cache:** ~65MB per user

### Priority Queue

When mesh comes online:
1. Recent status requests (within last 30 minutes)
2. Help requests (urgent)
3. Location updates (most recent only, discard older)
4. Condition reports (photos, documents)
5. Acknowledgments (alerts received)

### Compression

- **Format:** MessagePack for structured data, gzip for text
- **Target ratio:** 10:1 compression (1MB → 100KB over mesh)
- **Specific:** Hazard extent Polygon → Delta-encoded coordinates + run-length compression

---

## 10. Update Protocols

### Update Frequency

**Code deployments:** Blue-green strategy, every 2 weeks (or on-demand for critical fixes)

**Hazard model updates:** Continuous retraining (weekly minimum for wildfire, monthly for others)

**Danger zone updates during active event:** Every 5-30 seconds (as new data arrives)

**User notifications:** Real-time, no batching (critical path)

### Rollout Strategy

1. **Staging environment:** Deploy to 1 non-production region first, run 24 hours of integration tests
2. **Canary phase:** Roll out to 5% of production traffic for 2 hours
3. **Monitor:** Error rate, latency p95, alert delivery success rate
4. **Decision:**
   - If green (no issues): Expand to 25% for 4 hours
   - If issues detected: Automatic rollback, post-incident review
5. **Full deployment:** Roll out to 100% once all phases pass

### Rollback Plan

1. **Automatic rollback triggered by:** Error rate >1%, p95 latency >2sec, alert delivery <95%
2. **Rollback procedure:** Kill new version, route traffic back to previous version (instant)
3. **Notification:** Slack alert to on-call engineer, post-mortem within 24 hours

### User Notification

- **Code changes:** Transparent to users (unless UX change), no notification needed
- **New feature availability:** In-app banner notification (dismissible)
- **Deprecated features:** Email + in-app warning (1 month notice)
- **Maintenance window:** SMS to affected EMS agencies (24-hour notice)

### Testing Before Release

- **Staging environment:** 24-hour integration test (simulate 100K concurrent users, 10 simultaneous events)
- **Canary A/B test:** Compare old vs. new alert wording, measure acknowledgment rate
- **Load test:** Simulate 100 events/hour peak traffic (5x normal)
- **Metrics to validate:** Alert delivery >99%, p95 latency <500ms, error rate <0.1%

---

## 11. Cross-Module Dependencies

### Consumes

| Module | Data/Service | Why | Frequency |
|--------|--------------|-----|-----------|
| **Hazard Models (all types)** | Trigger signals, hazard extent GeoJSON | Core input for onset | Event-driven |
| **Location Sharing** | User locations (exact or granular) | Danger zone intersection | Real-time batch |
| **Notifications & Alerts** | Delivery API, template rendering | Send alerts to users | <30 sec |
| **User Status Module** | Status request API, response tracking | Collect user condition data | <45 sec |
| **Mesh Networking** | Offline relay service | Deliver to offline users | <5 min |
| **Cache & Guidance Module** | Pre-load API, cache config | Trigger cache updates | <5 sec |
| **Validation Agent** | Decision endpoint | Validate trigger | <4 min |
| **Base Map** | Terrain + building data (PostGIS) | For danger zone routing | Real-time lookup |
| **Evacuation Routing** | Route API | Get escape routes | <2 sec |
| **Data Storage** | PostgreSQL, TimescaleDB, S3 | Persist event records | Async |

### Provides

| Module | Data/Service | Why | Frequency |
|--------|--------------|-----|-----------|
| **Event Management** | Event ID + metadata | Enable event tracking | <5 sec |
| **EMS Dashboards** | Situation report, real-time updates | Show EMS situation overview | Real-time |
| **User Interfaces** | Alert prompts, status requests | Guide user actions | Real-time |
| **Evacuation Routing** | Danger zone geometry | Route users away from hazard | Real-time |
| **Cascade Detection** | Secondary hazard alerts | Trigger secondary modules | <10 sec |
| **Analytics & Reporting** | Event records, audit logs | Historical analysis | Batch (daily) |

### Critical Path

Modules that **must** exist before Hazard Onset can ship:
1. Hazard Models (at least 1 type, preferably wildfire)
2. Location Sharing (to determine who is affected)
3. Notifications & Alerts (to deliver alerts)
4. Validation Agent (to reduce false alarms)
5. Data Storage (PostgreSQL + S3, for audit trail)
6. Base Map (PostGIS, for danger zone computation)

Optional but highly recommended before production:
- User Status Module (collect condition data)
- Mesh Networking (support offline users)
- Cache & Guidance Module (pre-load guidance)

### Teams to Consult

| Team | Reason | Timing |
|------|--------|--------|
| **Hazard Models** | Trigger spec, confidence thresholds, update frequency | Early design phase |
| **EMS Leadership** | Dashboard requirements, notification preferences, override rules | Requirements gathering |
| **UX/Design** | Dashboard layout, button placement, alert wording | Design review |
| **Legal/Compliance** | Data retention, audit trail, liability, FCC rules | Before any data collection |
| **Infrastructure/DevOps** | Database sizing, NATS cluster, Docker orchestration, monitoring | Architecture design |
| **Security** | Encryption, audit logging, access control, penetration testing | Before production |
| **Data Science** | Validation agent model, herd estimation algorithm, cascade detection | Algorithm design |
| **Product/Analytics** | KPIs, success metrics, user research, A/B test framework | Ongoing |

### Potential Conflicts

1. **Location granularity vs. privacy:** Users may resist granular location sharing, limiting danger zone accuracy. Mitigation: Explain EMS benefit, offer coarser granularities, enforce time-limited sharing.

2. **Validation speed vs. accuracy:** Validation agent must decide in <4 minutes but validation accuracy improves with more data. Mitigation: Default to "valid" if unsure (safety-first), allow human override.

3. **Hazard type priority:** Different regions have different prevalent hazards. Mitigation: Configurable per jurisdiction, sensible defaults (California=wildfire, Iowa=tornado, etc.).

4. **Mesh bandwidth vs. alert delivery:** During mesh overload, alert delivery may degrade. Mitigation: Prioritize alerts over other traffic, use standardized messages (more compressible).

5. **Data retention vs. privacy:** 7-year retention may concern privacy advocates. Mitigation: Anonymize location history after 1 year, maintain only aggregate statistics.

---

## 12. Cost Tracking

### Infrastructure (Monthly, 1M users at peak)

| Component | Cost | Justification |
|-----------|------|----------------|
| **ECS (Fargate) - Onset Response Manager** | $1,500 | 4 × 2-CPU instances, 24/7 (event-triggered auto-scaling to 16×) |
| **RDS Multi-AZ - PostgreSQL** | $2,000 | 2TB database (500GB active, 1.5TB history), automated failover |
| **TimescaleDB Cloud** | $200 | Time-series data (hazard observations, timeline events) |
| **Redis ElastiCache** | $150 | Session state, real-time caching (6-node cluster) |
| **S3 Storage** | $500 | Audit logs, event records, backups (50TB/month cumulative) |
| **CloudFront CDN** | $100 | Tile delivery for map layers |
| **NATS Cluster (EKS)** | $300 | Pub/sub infrastructure, event streaming |
| **Validation Agent GPU (p3.2xlarge)** | $1,000 | Model inference, 8 hours/day during peak season |
| **Data Transfer (inter-region)** | $300 | Replication, backups, cross-AZ redundancy |
| **Monitoring (DataDog/CloudWatch)** | $200 | Logging, metrics, alerting, on-call management |
| **Backups & Disaster Recovery** | $150 | S3 cross-region replication, snapshots |
| **TOTAL** | **~$6,400/month** | Scale-down in off-season (no events) to ~$2,000/month |

### Personnel (Monthly, typical team)

| Role | Hours/Month | Cost (@100/hour) | Notes |
|------|-------------|------------------|-------|
| **Module Lead** | 160 | $16,000 | Full-time oversight, stakeholder management |
| **Backend Engineers (2)** | 320 | $32,000 | Orchestration engine, integrations |
| **ML Engineer** | 160 | $16,000 | Validation agent, cascade detection |
| **Frontend Engineer** | 120 | $12,000 | EMS dashboard, UI updates |
| **QA Engineer** | 160 | $16,000 | Testing, simulation, monitoring |
| **DevOps Engineer** | 80 | $8,000 | Infrastructure, CI/CD, on-call |
| **TOTAL** | **1,200** | **$120,000/month** | Scales down in off-season |

### Optimization Ideas

1. **Validation Agent:** Use rule-based system for 80% of cases (free), ML model for ambiguous cases only (saves GPU compute)
2. **Database:** Partition old event records to colder storage automatically (S3 Glacier) instead of warm PostgreSQL
3. **Mesh Compression:** Implement delta encoding for hazard extent updates (10x compression, less bandwidth)
4. **Batching:** Batch user status requests (send to 10K at once every 10 sec) instead of individual push notifications
5. **Caching:** Cache danger zones in Redis, reuse for similar events (wildfire season patterns repeat)
6. **Spot Instances:** Use AWS Spot for validation agent inference (50% cost reduction, 2-min interruption tolerance acceptable during onset window)

---

## 13. Agent Monitor Team

See `45_development_plan/02_agent_monitor_template.md` for detailed structure.

### Five Specialized Agents

**1. Quality Agent:** Code, tests, latency, errors
- Monitors: Unit test coverage (target 85%), integration test pass rate, p95 latency, error rate
- Alert conditions: Coverage <80%, p95 >500ms, error rate >0.1%
- Reports to: Module Lead + Engineering Lead

**2. Research Agent:** Data quality, model drift, accuracy
- Monitors: Hazard model trigger accuracy (false positive/negative rate), validation agent confidence calibration, cascade detection recall
- Alert conditions: Validation accuracy <90%, cascade detection <100%, model drift detected
- Reports to: Module Lead + ML Lead

**3. Business Agent:** Usage metrics, cost, user satisfaction
- Monitors: Alert delivery rate, user acknowledgment rate, cost per event, EMS feedback surveys
- Alert conditions: Delivery <99%, acknowledgment <70%, cost/event >$2, EMS satisfaction <80%
- Reports to: Module Lead + Product Lead

**4. Compliance Agent:** Legal, privacy, security audits
- Monitors: Audit trail integrity, data retention compliance, encryption status, access logs
- Alert conditions: Audit log corruption, data not deleted on schedule, unauthorized access attempts, failed encryption
- Reports to: Module Lead + Compliance Officer

**5. Lead Agent:** Orchestrates other 4, escalates to human
- Aggregates alerts from all 4 agents
- Triages by severity (critical → immediate page, warning → daily digest)
- Escalates to humans when multiple agents report issues simultaneously
- Reports to: Module Lead, CTO (critical), weekly to leadership

**Reporting Structure:**
- Each agent publishes findings to NATS stream: `agent.{agent_type}.alert`
- Module Lead receives aggregate report daily (8am)
- Escalations (critical) trigger page-on-call engineer within 5 minutes
- Monthly retrospective: team reviews agent trends, adjusts thresholds

---

## 14. Validation Practices

### Accuracy Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Danger zone recall** | >95% | Must capture 95%+ of users who need to evacuate |
| **Danger zone precision** | >80% | Minimize unnecessary evacuations (public fatigue) |
| **Herd location accuracy** | <500m error | Good enough for geofencing + routing |
| **Cascade detection** | 100% (zero missed) | Multi-hazard events are life-critical |
| **Validation latency** | <4 minutes | EMS needs decision before 5-minute escalation |
| **False positive rate** | <5% (1 per 20 events) | Avoid alert fatigue, maintain public trust |
| **Alert delivery** | >99% | Ensure users receive critical information |

### Loss Weighting

In model training, weight losses to reflect real-world consequences:

| Error Type | Cost | Explanation |
|------------|------|-------------|
| **False negative (missed hazard)** | 1000× | Someone dies in unwarned area → catastrophic |
| **False positive (unnecessary evacuation)** | 1× | Public inconvenience, lost trust |
| **Herd estimate error (500m vs. 1km)** | 10× | Bad routing leads to gridlock, some unaware users |
| **Cascade missed** | 500× | Secondary hazard kills people → major incident |

Model training uses weighted loss: `Loss = FN_count × 1000 + FP_count × 1 + cascade_miss × 500`

### A/B Testing

| Test | Hypothesis | Duration | Success Metric |
|------|-----------|----------|-----------------|
| **Alert wording: "Leave now" vs. "Evacuate immediately"** | Stronger language drives faster response | 2 weeks, 100K users | Response time <5min for "Evacuate" group |
| **Notification channel: Push only vs. Push+SMS** | SMS fallback improves delivery | 1 month, 50K users | Acknowledgment rate >75% for both-channel group |
| **Geofence size: 1km vs. 5km buffer** | Larger buffer improves safety but increases unnecessary evacuation | 2 weeks, 20K users | Measure unnecessary evacuation %, user feedback |
| **Status request prompt: "Are you safe?" vs. detailed form** | Simpler prompt → higher response rate | 1 week, 30K users | Response rate >70% for simple prompt |

### Drift Detection

| Metric | How Monitored | Alert Threshold |
|--------|---------------|-----------------|
| **Validation accuracy** | Compare predictions to ground truth (post-event) | Accuracy <85% |
| **Hazard extent recall** | % of actual affected buildings in predicted zone | Recall <90% |
| **EMS response times** | Track from alert sent to first resource deployed | Slower than baseline by >20% |
| **User acknowledgment rates** | % of users who acknowledged alert | Drop >10% month-over-month |
| **Cascade detection** | Track missed cascading events | >1 missed in rolling 30-day window |

Automated checks run daily; alerts published to `agent.research.alert` NATS stream.

### Validation Data

- **Source:** Historical events (USGS, NWS, CAL FIRE, prior Beacon events) + controlled simulations
- **Size:** 100+ events (wildfire, flood, quake, tornado) with ground truth extent
- **Refresh:** Monthly (add new events from past month)
- **Splits:** 70% training, 15% validation, 15% test

---

## 15. Data Science Considerations

### Model Selection

**Validation Agent:** Ensemble of rule-based + ML:
- **Rule-based (80% of cases):** If USGS earthquake >4.0 magnitude, always valid. If NWS tornado warning issued, always valid. Fast, deterministic.
- **ML model (20% of cases):** For ambiguous triggers (user reports, sensor data), use gradient-boosted decision tree (XGBoost). Lightweight, interpretable, real-time inference.
- **Why this approach:** Rule-based handles obvious cases quickly (<100ms), ML handles edge cases with nuance, ensemble avoids model brittleness.

**Hazard Extent Prediction:** Physics-based simulation + deep learning surrogate:
- **Physics:** Wind model (Farsite for wildfire), shallow-water model (for flood), ground motion model (USGS ShakeMaps for quake)
- **DL surrogate:** CNN trained to approximate physics simulation 100× faster. Used when <5min compute budget available.
- **Why:** Physics gives ground truth for model training, DL gives speed for production.

### Training Data

| Data Type | Source | Size | Refresh |
|-----------|--------|------|---------|
| **Hazard observations** | USGS, NWS, CAL FIRE, Beacon events | 100+ events | Monthly |
| **Validation labels** | Ground truth from post-event analysis | Event extent from satellite imagery | Manual, monthly |
| **User reports** | Beacon community (photos, condition reports) | ~10K reports per large event | Real-time collection |
| **Sensor readings** | Phone accelerometers (earthquake), barometers (pressure), motion (movement patterns) | Continuous from opted-in users | Real-time |

### Retraining Schedule

- **Validation agent:** Weekly (new ground truth from past week's events)
- **Cascade detection:** Bi-weekly (patterns emerging slowly)
- **Herd estimation:** Monthly (seasonal population shifts)
- **Hazard extent (per type):** Monthly (seasonal variations: wildfire season, flood season)
- **Emergency pipeline:** New model deployed to staging Monday, canary Wed, production Fri (3-day validation window)

### Benchmarks

| Model | Metric | Baseline | Current | Target |
|-------|--------|----------|---------|--------|
| **Validation Agent** | Accuracy | 92% (rule-based) | 96% (ensemble) | 98% |
| **Danger Zone (Wildfire)** | Recall | 87% | 93% | 95%+ |
| **Cascade Detection** | F1 Score | 0.82 | 0.95 | 0.99 |
| **Herd Estimation** | MAE (distance) | 800m | 450m | <300m |
| **Alert Delivery** | Uptime | 99.8% | 99.95% | 99.99% |

### Failure Cases

| Scenario | Known Limitation | Mitigation |
|----------|------------------|-----------|
| **Wildfire in urban canyon (tall buildings)** | Wind model struggles with complex geometry | Manual override by EMS, expand safety buffer |
| **Earthquake during cell outage** | Can't query ground reports | Default to USGS magnitude + ShakeMaps (deterministic) |
| **Flood in unmapped river** | Elevation model may be outdated | Check satellite imagery for standing water |
| **Tornado in data gap area** | No nearby ground truth (sparse sensors) | Use NWS radar signature, expand zone conservatively |
| **Cascade with delayed onset** | Secondary hazard may start 1-2 hours later (e.g., dam failure after earthquake) | Monitor model continuously for 24 hours post-trigger |

### Explainability

For each hazard prediction, output JSON with reasoning:

```json
{
  "hazard_type": "wildfire",
  "confidence": 0.92,
  "reasoning": [
    "USGS reports confirmed fire 100+ acres (strong signal)",
    "Sentinel-2 satellite hotspot detected (supporting signal)",
    "5 ground reports of active flames within 5km (corroboration)",
    "Wind direction aligns with fire spread model (physical consistency)"
  ],
  "input_data": {
    "usgs_confirmed_acres": 150,
    "satellite_hotspot_count": 3,
    "ground_reports": 5,
    "confidence_after_each_input": [0.70, 0.82, 0.88, 0.92]
  },
  "uncertainty": "Confidence may drop if fire reaches urban area (model trained on wildland fires primarily)"
}
```

EMS dashboard displays confidence + reasoning; users see simplified version ("Wildfire confirmed by 5 sources").

---

## 16. Software Engineering Considerations

### Technology Stack

**Backend:**
- Runtime: Node.js 20+ (or Python 3.11+ for ML agent)
- Language: TypeScript (for type safety, critical system)
- Framework: Express.js or Fastify (minimal, fast)
- Database: PostgreSQL 15, TimescaleDB, Redis
- Message broker: NATS
- HTTP client: axios or node-fetch
- Validation: joi or zod (schema validation)
- Logging: Winston (structured JSON logs → CloudWatch)
- Monitoring: Datadog or New Relic (APM + alerting)

**Frontend (EMS Dashboard):**
- Framework: React 18+
- Language: TypeScript
- Styling: Tailwind CSS (quick iteration, brand colors)
- Map library: Mapbox GL JS (vector tiles, good performance)
- State management: Redux Toolkit (predictable event replay)
- Testing: Vitest (unit), Playwright (e2e)
- Build: Vite (fast bundling)

**Mobile (Herd Inference, Mesh):**
- Android: Kotlin + Jetpack Compose
- iOS: Swift + SwiftUI
- Location: Core Location (iOS), FusedLocationProviderClient (Android)
- Mesh: Custom BLE + WiFi mesh implementation
- Build: Gradle (Android), Xcode (iOS)

### External Dependencies (Version Pinning)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.2.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "nats": "^2.20.0",
    "axios": "^1.6.0",
    "joi": "^17.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "typescript": "^5.2.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.52.0"
  }
}
```

All dependencies scanned weekly with `npm audit`, Snyk integration in CI/CD.

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# On PR: lint, unit tests, security scan
name: PR Checks
on: pull_request
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

# On merge to main: integration tests, docker build, deploy to staging
name: Merge to Main
on:
  push:
    branches: [main]
jobs:
  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run test:integration
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: beacon-hazard-onset:${{ github.sha }}
  deploy-staging:
    needs: [integration-test, docker-build]
    runs-on: ubuntu-latest
    steps:
      - run: aws ecs update-service --cluster staging --service onset-response --force-new-deployment

# On release tag: load tests, canary deploy to prod
name: Release
on:
  push:
    tags: [v*]
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:load (k6 load test: 100 events/hour, 100K concurrent users)
  canary-deploy:
    needs: load-test
    runs-on: ubuntu-latest
    steps:
      - run: aws ecs update-service --cluster prod --service onset-response --desired-count 1 (1 out of 16 instances, 5% traffic)
      - run: sleep 7200 && aws cloudwatch get-metric-statistics (monitor error rate, latency for 2 hours)
      - if: error_rate < 0.001 && p95_latency < 500ms
        run: aws ecs update-service --cluster prod --service onset-response --desired-count 16 (full deployment)
      - if: error_rate > 0.001 || p95_latency > 500ms
        run: aws ecs update-service --cluster prod --service onset-response --desired-count 0 && gh issue create -t "Canary failed"
```

### Technical Debt

**Known Issues (Priority):**
1. **Herd location inference:** Currently rule-based (ZIP code + cell tower). Should implement Bayesian update with user movement models (Medium priority, 2-week effort)
2. **Cascade detection:** Hard-coded thresholds per hazard pair. Should learn from historical patterns (Low priority, depends on data accumulation)
3. **Alert deduplication:** String matching on hazard description. Should use semantic similarity (Low priority, current approach works for 95% of cases)
4. **EMS override UI:** Complex modal dialog, users report 3-click flow too slow under stress. Should simplify to 1-click (High priority, UX pain point)

**Refactoring Priorities:**
- Extract orchestration state machine to separate module (currently inline, hard to test)
- Separate validation logic from trigger handling (currently coupled)
- Move NATS schema definitions to shared library (currently duplicated across services)

### SLA & Runbooks

| Metric | Target | Oncall Runbook |
|--------|--------|-----------------|
| **Availability** | 99.99% (52 min downtime/year) | If down: Check RDS failover status → ECS task logs → NATS connectivity |
| **Latency (p95)** | <500ms trigger to alert queued | If slow: Check RDS connection pool exhaustion → NATS throughput → compute utilization |
| **Error rate** | <0.1% | If elevated: Check external API dependencies (USGS, NWS) → validation model inference errors |
| **Alert delivery** | >99% | If delivery low: Check FCM/APNs status → SMS fallback working → mesh relay latency |

**Oncall Escalation:** If issue unresolved in 15 min, page the Module Lead.

### Scalability

**Expected Growth:**
- Year 1: 1M users (western US)
- Year 2: 10M users (multi-region)
- Year 5: 100M+ users (nationwide + international)

**Bottlenecks & Mitigations:**

| Bottleneck | Symptom | Mitigation |
|-----------|---------|-----------|
| **Database write throughput** | p95 latency >1s during multi-event | Partition event tables by region, write to multiple shards |
| **NATS throughput** | Message lag >5 sec | Add more NATS cluster nodes, implement connection pooling |
| **Validation agent inference** | Waiting for model output | Async inference queue, return provisional confidence while model runs |
| **Alert delivery** | Push queued >30 sec | Batch notifications (max 1000/sec), SMS fallback if FCM saturated |
| **Herd estimation** | Lookup latency >2 sec | Pre-compute ZIP code centroids, cache in Redis |
| **Geographic queries** | PostGIS index scan slow on large tables | Partition by region, use smaller bounding boxes, tile-based querying |

**Load test targets:**
- 1000 concurrent trigger requests/second (peak: multi-state event)
- 100K user location updates/minute
- 10M notification deliveries/minute (SMS batch size 1000)
- 100K condition reports/second (peak)
- Database query: <500ms p95 on 10B location history rows

**Capacity planning:** Quarterly review of peak metrics vs. thresholds; 30-day lead time for infrastructure scaling.

---

## 17. Consideration Framework (7 Categories, All Dimensions)

This module was designed with explicit consideration of seven decision categories across multiple sub-dimensions:

### 1. Accuracy & Reliability

**Data Accuracy:**
- Danger zone computation: Multi-source input (hazard model + terrain + satellite imagery) ensures high precision
- Herd estimation: Bayesian approach combines GPS, cell tower, and historical patterns → <500m error target
- Cascade detection: 100% recall target (zero missed multi-hazard events) through continuous monitoring

**System Reliability:**
- 99.99% uptime SLA with multi-AZ RDS failover + cross-region replica
- Immutable audit trail in S3 prevents data loss
- Circuit breaker pattern for external API calls (USGS, NWS) prevents cascading failures

**Validation & Monitoring:**
- Real-time accuracy monitoring (daily post-event comparison to ground truth)
- Automated drift detection on model confidence calibration
- A/B testing framework for validating algorithm changes

### 2. Latency & Performance

**Speed Targets:**
- Trigger → validation decision: <4 minutes (allows EMS escalation before 5-min window)
- Validation → alert sent: <30 seconds (users need to know immediately)
- Herd estimation: <3 seconds (enables real-time geofencing)
- Cascade detection: <10 seconds (secondary module activated quickly)

**Optimization Strategies:**
- Async validation (return provisional confidence while model finalizes)
- Redis caching of danger zones + herd estimates
- Message prioritization on NATS (alerts before other traffic)
- Blue-green deployment (zero-downtime updates)

**Scalability:**
- Horizontal auto-scaling (add ECS tasks for computational bottlenecks)
- Database sharding by region (avoid single-database bottleneck)
- Batch processing of notifications (1000 users/sec target)

### 3. Cost Efficiency

**Infrastructure Costs:** ~$6.4K/month for 1M users (scales down to ~$2K/month off-season)

**Cost Optimization:**
- Use rule-based validation for 80% of cases (no ML compute)
- Spot instances for GPU inference (50% savings with 2-min interruption tolerance acceptable)
- S3 Intelligent-Tiering for automatic cold storage transition
- Batch alerts to reduce push notification throughput

**Resource Allocation:**
- Personnel: Lean core team (7 FTE) + contractor support during event season
- Infrastructure: Predictable spike during fire/flood/tornado season; scale down between seasons

### 4. Accessibility & Usability

**EMS Admin Dashboard:**
- Clear visual hierarchy (hazard map first, then validation reason, then action buttons)
- Color-coded alerts (green=safe, yellow=warning, red=danger) per WCAG AA standards
- Minimal clicks to critical actions (2-3 clicks max for override, alert send)
- Keyboard navigation support for accessibility

**User Experience:**
- Push + SMS fallback ensures 99%+ reach (no single-channel dependency)
- Geofence-based status requests (only affected users prompted, reduces noise)
- Pre-loaded evacuation routes + shelters eliminate lookup latency
- Offline-capable features for no-service scenarios

**Multi-Language Support:**
- Alert templates translated to Spanish, Mandarin, Vietnamese (regional needs)
- UI components support RTL languages (future-proof design)

### 5. Security & Privacy

**Data Protection:**
- AES-256-GCM encryption for sensitive audit logs + location history
- TLS 1.3 for all API communication
- AWS KMS for key management (annual rotation)
- Immutable S3 object lock prevents unauthorized deletion

**Privacy Controls:**
- Location granularity choice (exact, block, neighborhood, city)
- EMS location request requires user acceptance (10-sec popup)
- Location history deleted after 1 year (except anonymized statistics)
- Audit trail tracks all access (user can review in privacy dashboard)

**Compliance:**
- FEMA/NIMS alignment for incident command interoperability
- Good Samaritan liability protection for notifications sent in good faith
- CCPA data deletion requests honored within 30 days
- No PII in public dashboards (EMS sees aggregated data only)

### 6. Resilience & Disaster Recovery

**Single-Point-of-Failure Mitigations:**
- Multi-AZ RDS (automatic failover, <2 min RTO)
- Cross-region S3 replication (if entire region fails)
- NATS cluster with 3+ nodes (quorum-based, survives 1 node failure)
- Multiple alert delivery channels (push → SMS → mesh → local siren)

**Offline Operation:**
- Hazard extent cached on mobile devices (users see offline map)
- Mesh network enables offline location sharing + status requests
- Local routing computation for evacuation (no internet required)
- Status request queuing for offline users (sync when online)

**Graceful Degradation:**
- If validation agent down: Default to "valid" (safety-first)
- If NATS down: Single-machine queue as fallback (delays alerts but preserves order)
- If RDS down: Read-only replica, manual intervention required
- If mesh down: Fallback to SMS delivery (slower but still reaches offline users)

### 7. Stakeholder Alignment & Governance

**EMS Agencies:**
- Customizable alert templates per jurisdiction
- Manual override capabilities for ambiguous triggers
- Real-time situation reports with population + resource estimates
- Geofence tools for targeted user requests

**Public Users:**
- Transparent explanation of how data is used (privacy dashboard)
- Ability to adjust location granularity per group (family, neighbors, public)
- Choice of alert channels (push, SMS, mesh preferred)
- Post-event feedback surveys to improve future alerts

**Regulators & Auditors:**
- Immutable audit trail for legal review
- Anonymized post-event reports for FEMA
- Compliance with state emergency management standards
- Regular third-party security audits

**Beacon Leadership:**
- KPI dashboards (accuracy, cost, user engagement)
- Monthly agent monitor reports (quality, research, business, compliance)
- Quarterly strategic reviews (model improvements, feature roadmap)
- Annual post-event retrospectives (lessons learned, recommendations)

---

## 18. Development Blocks & Independence

### Block 1: Core Orchestration Engine (2-3 weeks)

**Deliverable:** Basic trigger → alert flow for one hazard type (wildfire)

**Functions:**
- `initiate_hazard_trigger()`
- `compute_initial_danger_zone()`
- `send_initial_notifications()` to EMS only

**Tests:** Unit tests for orchestration logic, integration test with mock hazard model

**Dependencies:** None (can use mock data)

**Acceptance Criteria:** From hazard trigger JSON to EMS alert SMS in <30 seconds

---

### Block 2: Validation Agent (2 weeks)

**Deliverable:** Trigger validation decision with confidence score

**Functions:**
- Rule-based validation for obvious cases (USGS earthquake >4.0, NWS tornado warning)
- XGBoost model for ambiguous cases (training data preparation included)

**Tests:** Unit tests on validation logic, accuracy test against historical events (target 90%+)

**Dependencies:** Block 1 (orchestration engine to call validator)

**Acceptance Criteria:** Validation completes within 4 minutes with >90% accuracy on test set

---

### Block 3: Herd Location Estimation (2-3 weeks)

**Deliverable:** Estimate user locations when individual GPS unavailable

**Functions:**
- `estimate_herd_locations()` using ZIP code + cell tower + last-known locations

**Tests:** Unit tests for location inference logic, error analysis (target <500m error)

**Dependencies:** Block 1 (orchestration calls herd estimator)

**Acceptance Criteria:** Herd estimates within 500m of ground truth in 80%+ of test cases

---

### Block 4: Cascade Detection (2 weeks)

**Deliverable:** Detect multi-hazard scenarios (e.g., earthquake → landslide)

**Functions:**
- Coordinator agent monitors all module outputs for trigger combinations
- Automated activation of secondary hazard modules

**Tests:** Simulation tests with synthetic cascade scenarios, historical event replay

**Dependencies:** Block 1 + Block 2 (needs multiple hazard triggers + validation)

**Acceptance Criteria:** 100% detection rate on test scenarios (zero missed cascades)

---

### Block 5: EMS Dashboard (2-3 weeks)

**Deliverable:** Dashboard showing hazard map + situation report + action buttons

**Components:**
- Map display with hazard extent + danger zone
- Validation reason + confidence
- Population estimate heatmap
- Action buttons: Validate, Override, Send Status Request, Mark Clear

**Tests:** UI component tests (React), E2E test of hazard display workflow

**Dependencies:** Block 1 + Block 2 (needs event data + validation status)

**Acceptance Criteria:** Dashboard updates in <1 second when hazard extent changes, all EMS actions tested

---

### Block 6: User Status & Condition Requests (2 weeks)

**Deliverable:** Issue status requests to affected users + collect responses

**Functions:**
- `issue_status_requests()` with geofencing
- Response aggregation (safe, need help, severe)
- Auto-escalation to help request if needed

**Tests:** Unit tests for request logic, geofencing accuracy, E2E test of request → response flow

**Dependencies:** Block 1 + user location data (requires Location Sharing module)

**Acceptance Criteria:** Status requests reach 85%+ of affected users, response rate >60%

---

### Block 7: Cache & Guidance Preloading (2 weeks)

**Deliverable:** Pre-load hazard-specific guidance + shelters on user devices

**Functions:**
- `activate_hazard_protocols()` based on hazard type
- Cache trigger: shelters near hazard (wildfire), high-ground refuges (flood), collapse shelters (quake)

**Tests:** Cache size validation (target <100MB), load time tests (target <5 sec)

**Dependencies:** Block 1 (orchestration triggers cache activation)

**Acceptance Criteria:** Guidance loads on user device within 5 seconds of alert, shelter list accurate

---

### Block 8: Mesh Network Integration (3 weeks)

**Deliverable:** Deliver alerts to offline users via mesh relay

**Functions:**
- Alert queuing for offline users
- Mesh relay with TTL + priority ordering
- Sync on reconnection

**Tests:** Mesh simulation with packet loss + latency, offline user delivery tests

**Dependencies:** Block 1 + Mesh Networking module (requires mesh service)

**Acceptance Criteria:** Offline users receive alerts within 5 minutes of mesh relay, >95% delivery

---

### Block 9: Event Recording & Audit Trail (1-2 weeks)

**Deliverable:** Immutable audit trail for all decisions + data retention policies

**Functions:**
- Log every decision (trigger validation, alert sent, override applied)
- Ensure immutability in S3 object lock
- Implement retention policies (7-year keep, annual purge)

**Tests:** Audit log integrity tests, data retention automation tests

**Dependencies:** Block 1 (orchestration logs decisions)

**Acceptance Criteria:** 100% of decisions logged, log integrity verified, retention automated

---

### Block 10: Advanced Features (Remaining Time)

**Options (prioritized):**
1. Ring doorbell consent system (liability reduction)
2. Advanced situation report with population + resource models
3. A/B testing framework for alert content optimization
4. Geographic clustering for efficient notification batching
5. Machine learning model retraining pipeline

---

## Final Notes

This module represents the critical lifeline between hazard detection and user action. Every decision (validation, alert timing, user targeting) has been weighted toward saving lives. The combination of physics-based models, ML validation, human override capabilities, and multi-channel delivery ensures that even in failure scenarios, users receive actionable information.

The 7-category consideration framework ensures this module:
- **Accurately** identifies hazards + affected users (95%+ recall)
- **Quickly** processes triggers + delivers alerts (<30 sec SLA)
- **Affordably** operates at scale ($6K/month for 1M users)
- **Accessibly** serves diverse user types (EMS, public, offline)
- **Securely** protects location + decision data (encryption, audit trail)
- **Reliably** degrades gracefully under failures (mesh backup, SMS fallback)
- **Fairly** aligns with EMS needs + public trust (transparent validation, override capability)

Teams developing this module should emphasize end-to-end testing with realistic hazard scenarios (historical event replay) and post-event validation (ground truth comparison) to continuously improve accuracy and timeliness.

