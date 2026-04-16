# Risk Monitoring Module Documentation

## 1. Module Metadata

**Team:** Risk Monitoring & Conditions Management

**Parent Module:** Beacon Emergency Management Platform

**Sub-Modules:**
- Official Conditions Manager
- Risk Tracking & Escalation
- Polling & Caching Controller
- Threshold Management

**Goal:** Track hazard risk over time, adjust model sensitivity and polling cadence based on evidence, determine thresholds for pre-emptive data caching, and drive all downstream alerts and evacuation decisions.

**Mission Alignment:** Continuous hazard awareness enables early intervention and life-saving decision-making. By monitoring conditions and escalating response in real-time, Risk Monitoring prevents disasters from becoming catastrophic.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| **NWS Watches/Warnings** | NWS IPAWS/CAP XML | CAP Alert | Real-time (2-min poll) | `{areaDesc, hazard_type, severity, urgency, onset, expires, headline, instructions}` |
| **NOAA Hurricane Tracks** | NOAA NHC ATCF | GeoJSON | Every 6 hours | `{track_points: [{lat, lon, time, category, wind_mph}], forecast_cone}` |
| **USGS ShakeAlert** | USGS Earthquake Early Warning | Binary protobuf | Real-time (earthquake) | `{epicenter: {lat, lon}, magnitude, depth, confidence, pga_values}` |
| **NIFC Fire Perimeters** | NIFC/InciWeb | GeoJSON polygons | Daily + real-time updates | `{perimeter: Polygon, fire_name, acres, last_updated, percent_contained}` |
| **EPA Air Quality** | AirNow API | JSON | Hourly | `{location, aqi, pm25, pm10, o3, no2, so2, co, breakpoints}` |
| **Tsunami Advisories** | NOAA Tsunami Warning Center | CAP + GeoJSON | Real-time (event) | `{threat_zone: Polygon, wave_heights, arrival_times, confidence}` |
| **Local Data Feeds** | Fire dispatch, police, utility outages | JSON webhook | Real-time (event-driven) | `{location, hazard_type, timestamp, source, confidence}` |
| **Hazard Model Predictions** | Internal hazard models (14 modules) | GeoJSON + metadata | Real-time to batch | `{hazard_extent: Polygon, confidence: 0-1, magnitude, evolution_forecast}` |
| **Mesh Network Reports** | Beacon app users (offline/online) | JSON | Continuous | `{user_id, timestamp, location, hazard_observations, battery_state}` |
| **Sensor Data** | Phone accelerometers, seismic networks | Time-series | Continuous | `{event_type, magnitude, timestamp, reliability_score}` |
| **Risk Baseline** | Historical analysis per jurisdiction | JSON config | Quarterly | `{jurisdiction_id, hazard_profiles: [{type, seasonal_baseline, sensitivity}]}` |
| **System State** | Beacon backends (all modules) | JSON | Real-time | `{active_events, deployment_status, resource_availability}` |

**Output Consumers:**
- Event Declaration Engine (determines auto/manual triggers)
- Evacuation Manager (routing & shelter decisions)
- Notifications System (alert escalation & delivery)
- Agentic Planners (resource allocation)
- Hazard Models (feedback loop for retraining)
- Public Users & EMS Clients (dashboards, situational awareness)
- World Model (state synthesis)

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `ingestExternalConditions()` | Parse CAP/ATOM feeds from NWS, NOAA, USGS, NIFC; validate schemas | Raw feeds (XML/JSON) | Structured condition objects | <30 sec | Data Pipeline | Feed parsing accuracy 99.9%, no malformed alerts lost |
| `reconcileConflicts()` | Merge overlapping/contradictory alerts from multiple sources; assign confidence | Multiple alert objects | Single authoritative condition object | <60 sec | ingestExternalConditions | No alert loss, conflict resolution prioritizes safety |
| `maintainCurrentState()` | Update real-time conditions state (PostgreSQL + Redis); track onset/expiry | Reconciled conditions | Active condition registry | <5 sec | PostgreSQL, Redis | State freshness p95 < 2 min, no stale data in queries |
| `evaluateRiskLevel()` | Assign risk score (0-100) per jurisdiction/hazard based on multiple factors | Current conditions, historical baselines | Risk score + confidence | <15 sec | Risk baselines, hazard models | Risk score correlates with actual outcomes (r² > 0.8) |
| `escalatePollingCadence()` | Increase data fetch frequency as risk rises; coordinate with backend capacity | Risk level changes | New polling config | <2 sec | System capacity monitor | Polling scales smoothly, no cascading overloads |
| `determineCacheThresholds()` | Calculate what data to pre-fetch given active hazards, bandwidth, battery | Risk levels, device state | Cache strategy JSON | <10 sec | Device telemetry, network state | Cache hit rate > 85% when needed, minimal storage bloat |
| `validateAgainstSensors()` | Cross-check external data against user-reported hazards (mesh network, phone sensors) | Mesh reports, sensor data | Validation confidence score | <20 sec | Mesh network, sensor data | Detects false sources (bot networks, erratic reporters) |
| `assignConfidence()` | Weight multiple data sources; compute Bayesian confidence in current conditions | All ingested data sources | Confidence 0-1 per condition | <30 sec | Source credibility matrix | Confidence calibration ±5% vs. real outcomes |
| `detectAnomalies()` | Flag unusual patterns (rapid escalation, contradictions, sensor errors) | Current state, historical patterns | Anomaly alerts with severity | <15 sec | Time-series analysis, thresholds | False positive rate < 5%, detects 90% of real anomalies |
| `publishConditionUpdate()` | Broadcast current conditions to all downstream systems (NATS pub/sub) | Validated, confidence-weighted conditions | NATS event + notifications | <5 sec | NATS broker | 100% delivery to subscribed systems, no message loss |
| `manageTriggerThresholds()` | Store & update per-hazard/jurisdiction thresholds that trigger auto-declaration | Configuration from EMS | Threshold registry (Redis/PostgreSQL) | <2 sec | Config service, authorization | Thresholds persist across restarts, audit-logged |
| `feedbackToModels()` | Return actual observed conditions back to hazard models for retraining | Real outcomes post-event | Training data + metadata | Batch (hourly) | Event archive, hazard models | Model feedback improves accuracy; drift detection < 5% F1 drop |

**Key Algorithms:**
- **Bayesian Confidence Fusion:** Each data source has credibility weights. New observations update beliefs via Bayes rule. Sources that consistently mismatch reality lose weight over time.
- **Risk Score Calculation:** Multi-factor weighted sum: `risk = 0.3 * external_condition_severity + 0.3 * local_reports_density + 0.2 * hazard_model_confidence + 0.15 * anomaly_score + 0.05 * seasonal_baseline`.
- **Polling Cadence Adaptation:** Exponential backoff inversed. Risk > 80 → poll every 30 sec. Risk 50-80 → 2 min. Risk < 50 → 15 min. Respects backend rate limits (max 1000 req/sec global).
- **Cache Prediction:** For active hazard type H in jurisdiction J, pre-cache all map tiles (1km resolution) covering hazard extent + 10km buffer. Satellite imagery for past 48 hours. Road network within evacuation zone. Tile prioritization by population density.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL + PostGIS, TimescaleDB, Redis, NATS, S3

### PostgreSQL + PostGIS

#### `current_conditions` Table
Primary authoritative source for what is happening right now.

```sql
CREATE TABLE current_conditions (
  id BIGSERIAL PRIMARY KEY,
  jurisdiction_id UUID NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,  -- 'wildfire', 'flood', 'earthquake', etc.
  source VARCHAR(100) NOT NULL,       -- 'NWS', 'NOAA', 'USGS', 'local', 'model'
  severity SMALLINT DEFAULT 0,        -- 0-100 scale
  confidence NUMERIC(3,2) DEFAULT 1.0,-- 0.0-1.0
  onset TIMESTAMP WITH TIME ZONE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE,
  extent GEOMETRY(Polygon, 4326) NOT NULL,  -- Affected area
  headline TEXT,
  description TEXT,
  instructions TEXT,
  raw_data JSONB,                     -- Original data from source
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE  -- When condition cleared
);

CREATE INDEX idx_current_conditions_jurisdiction_hazard
  ON current_conditions(jurisdiction_id, hazard_type);
CREATE INDEX idx_current_conditions_extent
  ON current_conditions USING GIST(extent);
CREATE INDEX idx_current_conditions_expires
  ON current_conditions(expires);
```

#### `condition_reconciliation_log` Table
Tracks merging of conflicting alerts; audit trail for decision-making.

```sql
CREATE TABLE condition_reconciliation_log (
  id BIGSERIAL PRIMARY KEY,
  jurisdiction_id UUID NOT NULL,
  hazard_type VARCHAR(50),
  source_conditions JSONB,  -- Array of incoming conditions
  merged_condition_id BIGINT REFERENCES current_conditions(id),
  conflict_type VARCHAR(100),  -- 'overlap', 'contradiction', 'duplicate'
  resolution_method VARCHAR(100),  -- 'union', 'intersection', 'weighted_average'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reconciliation_jurisdiction
  ON condition_reconciliation_log(jurisdiction_id);
```

#### `risk_scores` Table
Historical record of risk escalation over time per jurisdiction/hazard.

```sql
CREATE TABLE risk_scores (
  id BIGSERIAL PRIMARY KEY,
  jurisdiction_id UUID NOT NULL,
  hazard_type VARCHAR(50),
  risk_score SMALLINT,  -- 0-100
  confidence NUMERIC(3,2),
  factors JSONB,  -- {external_severity: 45, local_reports: 30, model_confidence: 60, anomaly_score: 5}
  polling_cadence_ms BIGINT,  -- Milliseconds between data fetches
  cache_strategy JSONB,  -- {tiles_extent: Polygon, imagery_days: 48, road_network: true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_scores_jurisdiction_hazard_time
  ON risk_scores(jurisdiction_id, hazard_type, created_at DESC);
```

#### `trigger_thresholds` Table
Stores per-jurisdiction, per-hazard thresholds that auto-declare events.

```sql
CREATE TABLE trigger_thresholds (
  id BIGSERIAL PRIMARY KEY,
  jurisdiction_id UUID NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,
  risk_score_threshold SMALLINT,  -- Risk level that auto-triggers
  confidence_threshold NUMERIC(3,2),  -- Min confidence required
  external_condition_required BOOLEAN,  -- Must have external source (not just model)
  lead_time_seconds BIGINT,  -- How much advance notice before declared event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,  -- EMS admin who set this
  notes TEXT
);

CREATE INDEX idx_thresholds_jurisdiction_hazard
  ON trigger_thresholds(jurisdiction_id, hazard_type);
```

#### `source_credibility` Table
Tracks how accurate each external source has been; used for weighting in Bayesian fusion.

```sql
CREATE TABLE source_credibility (
  id BIGSERIAL PRIMARY KEY,
  source_name VARCHAR(100),  -- 'NWS', 'USGS', specific fire dispatch, etc.
  hazard_type VARCHAR(50),
  accuracy_score NUMERIC(4,3),  -- 0.0-1.0; updated monthly
  false_positive_rate NUMERIC(4,3),
  false_negative_rate NUMERIC(4,3),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sample_size BIGINT  -- Number of comparisons in calculation
);

CREATE INDEX idx_source_credibility_hazard
  ON source_credibility(hazard_type);
```

### TimescaleDB (Time-Series)

#### `hazard_observations` Hypertable
Real-time sensor readings, local reports, and model predictions over time.

```sql
CREATE TABLE hazard_observations (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  jurisdiction_id UUID NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,
  source VARCHAR(100),  -- 'mesh_report', 'sensor', 'model', 'external'
  location GEOMETRY(Point, 4326),
  magnitude NUMERIC(5,2),  -- Fire intensity, water depth, earthquake magnitude, wind speed, etc.
  confidence NUMERIC(3,2),
  metadata JSONB,  -- {user_id, device_model, report_text, image_urls}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT create_hypertable('hazard_observations', 'time', if_not_exists => TRUE);
SELECT add_compression_policy('hazard_observations', INTERVAL '7 days', if_not_exists => TRUE);

CREATE INDEX idx_observations_jurisdiction_hazard_time
  ON hazard_observations(jurisdiction_id, hazard_type, time DESC);
CREATE INDEX idx_observations_location
  ON hazard_observations USING GIST(location);
```

#### `polling_events` Hypertable
Log of all fetch operations, cadence changes, success/failure rates.

```sql
CREATE TABLE polling_events (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  source_name VARCHAR(100),
  status VARCHAR(20),  -- 'success', 'timeout', 'error', 'skipped'
  duration_ms INT,
  records_fetched INT,
  error_message TEXT,
  next_poll_due TIMESTAMP WITH TIME ZONE,
  current_cadence_ms BIGINT
);

SELECT create_hypertable('polling_events', 'time', if_not_exists => TRUE);
SELECT add_compression_policy('polling_events', INTERVAL '30 days', if_not_exists => TRUE);
```

### Redis

Cache and real-time state for rapid queries during emergencies.

```
Key patterns:

condition:{jurisdiction_id}:{hazard_type}
  -> JSON: current condition object (5-min TTL)

risk_score:{jurisdiction_id}
  -> INT: aggregate risk 0-100 (1-min TTL)

polling_state:{source_name}
  -> JSON: {next_due: timestamp, cadence_ms: int, failure_count: int} (persistent)

cache_queue:{jurisdiction_id}
  -> LIST of {tile_id, priority, deadline} (persistent, consumed by tile download service)

source_credibility_cache
  -> HASH: {source_name -> accuracy_score} (30-day TTL, refreshed daily)
```

**Eviction Policy:** LRU; condition data has higher priority than cached credibility scores.

### NATS Streams

```
Subject: conditions.jurisdiction.{jurisdiction_id}
  Payload: {id, hazard_type, risk_score, confidence, extent, timestamp}
  Retention: 48 hours (rolling window)
  Consumers: Event Declaration Engine, Evacuation Manager, Notifications System, Dashboard

Subject: polling.cadence_change
  Payload: {source, old_cadence_ms, new_cadence_ms, reason, timestamp}
  Retention: 7 days
  Consumers: Monitoring dashboard, capacity planner

Subject: cache.prefetch_request
  Payload: {jurisdiction_id, hazard_type, extent, priority, deadline}
  Retention: 24 hours
  Consumers: Tile generation, satellite imagery downloader, road network cache service
```

### S3

```
Bucket: beacon-{environment}

Prefix structure:
  /conditions/{jurisdiction_id}/{date}/
    - hourly_state.json (snapshot of all conditions at hour boundary)
    - raw_feeds/{source_name}/{timestamp}.xml (original NWS/NOAA/USGS data)

  /analytics/{year}/{month}/
    - risk_escalation_summary.json (monthly aggregates)
    - accuracy_report.json (source credibility updates)

Retention:
  - Raw feeds: 1 year (audit trail)
  - Hourly snapshots: 7 years (regulatory requirement)
  - Aggregates: Indefinite (historical benchmarking)

Access: Private; accessed via signed URLs from application
```

**Data Size Estimate:**
- ~100 active conditions at any time nationally (50 jurisdictions, ~2 conditions each average)
- ~500 observations/day per jurisdiction during non-event
- ~100K observations/day per jurisdiction during major event (active Beacon usage)
- **PostgreSQL:** ~500MB/month (1M users, 10 events history)
- **TimescaleDB:** ~1GB/month (sensor data, observations)
- **S3:** ~50GB/year (raw feeds + daily snapshots)

**Archival Strategy:**
- Hot (current month): PostgreSQL, Redis, NATS
- Warm (1-7 years): PostgreSQL cold storage + S3 standard
- Archive (>7 years): S3 Glacier, compliance hold

---

## 5. UI Components

**Screens (for Risk Monitoring Admin Dashboard):**
1. Conditions Overview - Map-based view of all active conditions nationally
2. Jurisdiction Risk Dashboard - Per-jurisdiction risk level, condition details, escalation history
3. Threshold Management - Configure auto-trigger thresholds per hazard/jurisdiction
4. Polling Configuration - Adjust source polling cadence, view feed health
5. Condition Reconciliation - Review merged/conflicting alerts, manual override interface
6. Source Credibility Monitor - View accuracy scores per source, adjust weights
7. Cache Strategy Viewer - See pre-fetched data coverage, tile refresh status

**Buttons/Controls:**
- **Acknowledge Condition:** Mark a condition as reviewed by EMS. Color: Teal #0097B2. Action: Sets acknowledgment timestamp, sends to Decision Engine.
- **Escalate Risk:** Manual override to increase polling cadence or trigger cache prefetch. Color: Orange/warning. Action: Creates audit log entry.
- **Suppress Alert:** EMS can suppress a published alert if deemed false alarm. Color: Red/caution. Action: Logs reason, prevents re-publication for 24h.
- **Adjust Threshold:** Button to edit trigger thresholds. Color: Teal. Action: Opens modal with jurisdiction/hazard selector.
- **Force Reconciliation:** Re-run conflict resolution on selected conditions. Color: Navy #0B0F2A. Action: Async task.
- **Refresh External Feeds:** Manually trigger fetch from NWS/NOAA/USGS (outside normal cadence). Color: Teal. Action: Override cadence timer.

**Map Layers:**
- **Condition Extents:** Polygons per condition (red for severe, yellow for moderate, green for watch). Z-order: 400. Update: Real-time (< 30 sec).
- **Risk Heat Map:** Opacity/color intensity based on jurisdiction risk score (0-100). Z-order: 300. Update: Continuous (1-min).
- **Polling Source Coverage:** Overlay showing which sources are actively reporting in each jurisdiction. Z-order: 350. Update: Real-time.
- **Cache Coverage:** Shaded zones showing what tiles are pre-fetched. Z-order: 280. Update: 5-min.

**Notifications/Alerts:**
- **Condition Anomaly Alert:** Trigger when KL-divergence > threshold or contradiction detected. Channel: In-app banner + Slack to team. Template: "Unusual [hazard] signal in [jurisdiction]. Confidence: [X]%. [Details]."
- **Source Failure Alert:** Trigger when source hasn't reported in >2× normal cadence. Channel: Slack ops team. Template: "[Source] offline for [duration]. Last report: [time]. Fallback to [alternative]."
- **Risk Escalation:** Published to dashboard; if risk > 70, all stakeholders notified. Channel: Email + in-app. Template: "[Jurisdiction] risk level now [X]. [Condition details]."

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A / teal #0097B2, high contrast mode support.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-risk-monitoring-backend | Node.js / Express, TypeScript | `npm run build && docker build` | Risk team |
| beacon-conditions-ingestion | Python 3.11, FastAPI | `make build-image` | Data pipeline team |
| beacon-admin-dashboard | React 18, TypeScript, Tailwind | `npm run build` | Frontend team |

**Deployment:**
- Backend: Kubernetes (EKS) + RDS (PostgreSQL) + ElastiCache (Redis) + NATS cluster.
- Ingestion: Lambda (scheduled) + EventBridge (event-driven triggers) for external feed polling.
- Dashboard: Static React deployment to CloudFront + S3.

**CI/CD:**
- GitHub Actions: Lint, unit tests, integration tests (PostgreSQL test container), security scanning (Snyk), performance benchmarks, canary deployment (10% traffic for 5 min, then 100%).

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Requirements finalized, data schema design, external feed integration (NWS, USGS, NOAA). Risk scoring algorithm design. Threshold framework.
2. **Months 2-3:** Core ingestion service (CAP parsing, data validation). Reconciliation logic. Redis caching layer. Risk calculation engine.
3. **Months 3-4:** Polling cadence adaptation. Cache prediction algorithms. Sensor anomaly detection. Dashboard UI components.
4. **Months 4-5:** Integration with Event Declaration Engine, Evacuation Manager, Notifications System. A/B testing on threshold tuning.
5. **Month 5+:** Beta deployment in 5 jurisdictions. Feedback loop to hazard models. Production rollout.

**Build Phases:**
- **Phase 1 (MVP):** Ingest NWS/NOAA/USGS feeds. Basic risk scoring. Manual threshold configuration. Event Declaration triggering. Dashboard for EMS admins.
- **Phase 2:** Sensor anomaly detection. Polling cadence adaptation. Cache strategy optimization. Conflict reconciliation (automated vs. manual).
- **Phase 3:** Advanced Bayesian source fusion. Predictive risk forecasting. Model feedback integration. Multi-hazard cascading logic.

**Test Coverage Targets:**
- Unit tests: 90% coverage (risk scoring, reconciliation, parsing logic).
- Integration tests: 80% coverage (database operations, NATS pub/sub, external feed mocking).
- E2E tests: 60% coverage (full condition ingestion → event declaration flow, dashboard UX).
- Load testing: Simulate 1000 concurrent condition updates; latency p95 < 500ms.

**Deployment Strategy:** Blue-green. Maintain two full environments; switch traffic atomically. Rollback in < 1 minute.

**Monitoring Metrics (KPIs):**
- **Latency:** Condition ingestion to first NATS publish: p95 < 30 sec; p99 < 60 sec.
- **Availability:** 99.95% (max 22 min/month downtime).
- **Error Rate:** < 0.1% of incoming conditions malformed or lost.
- **Accuracy:** Risk score correlation with actual outcomes (r² > 0.8); confidence calibration within ±5%.
- **Throughput:** Support 1000 condition updates/min nationally; scale linearly to 10K during multi-state events.

**Improvement Research:**
- A/B test risk scoring algorithms (linear vs. Bayesian vs. ensemble).
- User feedback: Do EMS admins understand risk thresholds? Usability study quarterly.
- Model retraining impact: Does historical feedback improve hazard model F1? Measure monthly.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:**
- CCPA: Location data is PII; users can request deletion (implement within 30 days).
- Good Samaritan: Platform operates in support role; not liable for EMS decisions made using Beacon data (with proper disclaimers).
- FedRAMP: If deployed to government agencies, must meet FedRAMP Moderate baseline (likely required).
- CMMC Level 2: If handling DoD contractor data, must achieve cybersecurity maturity model.

**PII Handled:**
- User locations (yes, from mesh reports) — anonymized after 90 days post-event.
- EMS admin identities (yes, for authorization and audit logs) — retained 7 years.
- Public reports (optional; users can report hazards) — anonymized.

**Encryption:**
- In-transit: TLS 1.3 (all API calls, NATS, database connections).
- At-rest: AES-256-GCM (PostgreSQL, S3, Redis snapshots).
- Keys: AWS KMS; rotated annually. Key escrow for compliance audit.

**Audit Trail:**
- What: All condition state changes, threshold modifications, source credibility updates, reconciliation decisions.
- Retention: 7 years (compliance requirement).
- Access: Only authorized investigators (legal team, compliance officer) via signed request to CloudTrail.
- Searchable: Full-text index on NATS events + PostgreSQL audit log.

**Data Retention:**
- Current conditions: Until resolved or 30 days, whichever first (then archived to S3).
- User location reports: 90 days post-event (then anonymized).
- External feeds: 1 year (audit trail).
- Risk scores & reconciliation logs: 7 years.

**Third-Party Integrations:**
- NWS/NOAA/USGS: Public APIs (no DPA required; .gov data is public domain).
- NIFC fire data: Public domain.
- EPA AirNow: Public API.
- Twilio (SMS for alerts): Standard DPA covers SMS delivery only; Beacon handles encryption.

---

## 9. Mesh/Offline

**Offline-First Features:**
- Cached conditions: Beacon app stores last 48 hours of condition snapshots locally (compressed). If offline, app displays cached state with age indicator ("Last update: 30 min ago").
- Risk scoring: Runs locally on cached data using compressed model (device model runs <50MB).
- Hazard observations: User can report hazards offline; report queued for sync (stored in local SQLite).

**Sync Strategy:**
- **Conflict resolution:** If user's local timestamp > server timestamp, keep local (most recent wins).
- **Ordering:** Mesh network ensures FIFO delivery of condition updates to offline users.
- **Retry logic:** Queue persisted in local storage. Syncs on first connectivity (WiFi preferred over LTE). Exponential backoff (30 sec, 1 min, 5 min, 15 min max).

**Cache Size:** ~50MB per device (1 week of conditions + hazard models).

**Priority Queue:** On connectivity:
1. Conditions/risk scores (real-time awareness).
2. User's own hazard reports (crowdsourced data).
3. Hazard model updates (new forecasts).
4. Dashboard analytics (lowest priority).

**Compression:**
- Conditions: Protocol Buffer format (.pbf); typical 200 bytes/condition vs. 2KB JSON.
- Hazard models: Quantized neural nets (INT8) reduce size 4×.
- Target compression ratio: 10:1 (JSON to compressed).

---

## 10. Update Protocols

**Update Frequency:**
- External feeds (NWS/NOAA/USGS): Polling cadence 30 sec to 15 min based on risk level.
- Hazard model predictions: Real-time to hourly (depends on hazard type).
- Risk scores: Continuous (updated on each new observation).
- Source credibility: Daily (batch process).
- Trigger thresholds: On-demand (EMS admin configuration).

**Rollout Strategy:**
- New condition ingestion logic: Canary deploy to 5% of instances (traffic-weighted) for 5 min. If error rate stays < 0.1%, proceed to 50% over 1 min, then 100% over 1 min.
- Risk scoring algorithm changes: A/B test on 20% of jurisdictions for 2 weeks before rollout.
- Database schema changes: Zero-downtime migration using shadow tables + dual-write for 24h window.

**Rollback Plan:**
- < 1 hour old: Traffic switch in < 30 sec (load balancer).
- 1-24h old: Database point-in-time recovery to pre-change (< 5 min).
- > 24h old: Full restore from daily snapshot (< 15 min, manual).

**User Notification:**
- EMS admins: In-app notification when thresholds change, new sources added, or accuracy metrics shift.
- Public users: No notification for backend updates. If map layers change, note in release notes.

**Testing Before Release:**
- Staging env: Run full integration test (real external feeds replayed via VCR cassettes; production database cloned).
- A/B duration: 2+ weeks if algorithm changes; >= 1 week for UI/dashboard changes.
- Metrics to validate: Latency SLAs, error rates, accuracy (risk score vs. actual outcomes), user engagement (EMS acknowledgment rate).

---

## 11. Cross-Module Dependencies

**Consumes:**
- **Hazard Models (14 modules):** Fire spread, flood inundation, earthquake shaking, etc. Provides risk layer input to scoring algorithm.
- **Data Pipeline:** Raw external feeds (tier 1); cleaned sensor data (tier 2).
- **Event Declaration Engine:** Consumes condition updates; triggers event if risk > threshold.
- **World Model:** Reads current state to synthesize global situation.
- **Authorization Service:** Validates EMS admin identity for threshold modifications.
- **Notification System:** Alert escalation rules.

**Provides:**
- **Event Declaration Engine:** Current conditions object, confidence scores, risk levels, auto-trigger recommendations.
- **Evacuation Manager:** Real-time hazard extent, severity, evolution forecast.
- **Agentic Planners:** Situation awareness; risk trends over time.
- **Dashboard (all users):** Condition layers, risk scores, polling health.
- **Hazard Models:** Historical validation data; feedback loop on model accuracy.
- **Mesh Network:** Condition snapshots for offline caching.

**Critical Path:**
1. **Data Pipeline (tier 1)** must be complete (basic feed ingestion).
2. **PostgreSQL schema** must be designed and deployed.
3. **NATS broker** must be operational (pub/sub backbone).
4. **Risk scoring algorithm** must be finalized (data science review).
5. **Then** Risk Monitoring can be built and tested.
6. **After** Risk Monitoring is stable, Event Declaration Engine can depend on it.

**Teams to Consult:**
- **Data Pipeline Team:** Feed formats, validation rules, schema design.
- **Data Science Team:** Risk scoring formula, Bayesian fusion, anomaly detection thresholds.
- **Event Declaration Team:** Trigger threshold logic, confidence requirements.
- **Frontend Team:** Dashboard components, map layer integration.
- **Hazard Models Team:** Model prediction format, confidence calibration.
- **Operations/SRE:** Database capacity, NATS scaling, monitoring setup.

**Potential Conflicts:**
- **Schema conflicts:** Risk Monitoring needs fine-grained timestamps (seconds); Event Declaration may cache at minute level. Resolve: Design schema for seconds; aggregate at higher levels as needed.
- **Polling overload:** Multiple sources polling external APIs (NOAA, USGS, NWS) could trigger rate limits. Resolve: Centralized polling queue with deduplication.
- **Model retraining feedback:** Hazard Models may need conditions data for retraining; Risk Monitoring must archive properly for export. Resolve: Daily batch export of condition snapshots to S3 with schema versioning.

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- PostgreSQL RDS (TimescaleDB + PostGIS): ~$3K (800GB, Multi-AZ, provisioned IOPS).
- Redis ElastiCache: ~$200 (6-node cluster, 16GB).
- NATS managed service: ~$300.
- Lambda (feed polling, reconciliation): ~$50 (estimated 10M invocations/month).
- S3 storage (conditions archive, raw feeds): ~$200 (5GB/month ingestion, 500GB total).
- CloudFront (dashboard delivery): ~$30 (low traffic in admin tier).
- Data transfer (inter-region replication): ~$100.
- **Subtotal: ~$3.88K/month**

**Personnel (Monthly):**
- 1 Tech Lead (Risk Monitoring): $15K.
- 2 Backend Engineers: $12K each = $24K.
- 1 Data Scientist (risk scoring, anomaly detection): $12K.
- 1 QA/Test Engineer: $8K.
- 20% DevOps support (shared): $2K.
- **Subtotal: ~$61K/month**

**Optimization Ideas:**
- RDS: Use GP3 storage instead of provisioned IOPS if IOPS utilization < 70% (save ~$500/month).
- Redis: Consolidate with other modules' caches if separate clusters (save ~$100/month).
- Lambda: Pre-warm containers or migrate heavy polling to ECS for sustained use (save ~$30/month, add $500/month ECS; net if high volume).
- S3: Transition raw feeds to Glacier after 30 days (save ~$100/month).

**Total Monthly Cost (MVP): ~$65K (infra + personnel).**

---

## 13. Agent Monitor Team

See `02_agent_monitor_template.md` for full agent framework. Five autonomous agents monitor Risk Monitoring continuously:

### 1. Quality Agent
- **Monitors:** Code quality, test coverage, latency SLAs, error rates.
- **Metrics:**
  - Latency p95 < 500ms (ingestion to publish).
  - Test coverage >= 90% (unit), >= 80% (integration).
  - Error rate < 0.1% (malformed/lost conditions).
  - Deployment success rate > 99% (canary + rollback).
- **Actions:** Flag PRs with < 80% test coverage. Alert on p95 latency breaches. Recommend refactoring if code complexity (cyclomatic > 10 per function).
- **Escalation:** If error rate > 1% for 5 min, page on-call engineer.

### 2. Research Agent
- **Monitors:** Data quality, model drift, accuracy vs. real outcomes.
- **Metrics:**
  - Risk score calibration: actual outcome within ±10% of predicted risk 80% of time.
  - Source credibility: accuracy scores updated monthly; no source weights stale > 3 months.
  - False alert rate: < 5% of published conditions have no actual hazard.
  - Lead time: Risk escalated >= 15 min before event impact (measured post-event).
- **Actions:** Run monthly accuracy audit comparing risk scores to observed outcomes. Flag sources with accuracy < 70%. Recommend model retraining if drift detected.
- **Escalation:** If F1 score drops > 5% month-over-month, initiate root cause analysis.

### 3. Business Agent
- **Monitors:** Usage metrics, cost, user satisfaction.
- **Metrics:**
  - Condition ingestion volume: >= 50 conditions/day (healthy system).
  - EMS acknowledgment rate: >= 80% (engagement).
  - Threshold adjustment frequency: >= 1 per jurisdiction/month (active management).
  - Cost per condition: <= $50 (infra + personnel ratio).
  - Dashboard uptime: >= 99.5%.
- **Actions:** Weekly dashboard report to management (volume, cost, engagement). Flag underutilized sources (< 1 condition/day) for deprecation.
- **Escalation:** If cost per condition > $100, escalate cost optimization to infra team.

### 4. Compliance Agent
- **Monitors:** Security, privacy, legal compliance, audit trails.
- **Metrics:**
  - All PII encryption: 100% (in-transit TLS, at-rest AES).
  - Audit log completeness: 100% of threshold changes, reconciliations logged.
  - Data retention compliance: No user location data > 90 days post-event.
  - Access control: Only authorized users can view/modify thresholds (RBAC enforced).
  - Encryption key rotation: Annually (no key > 1 year old).
- **Actions:** Quarterly security audit (penetration test, encryption scan). Annual compliance report (CCPA, FedRAMP).
- **Escalation:** If unencrypted data detected in logs, page security team immediately.

### 5. Lead Agent
- **Orchestrates:** Other 4 agents; escalates to human.
- **Actions:**
  - Daily standup: Digest reports from all 4 agents; flag top 3 issues.
  - Weekly review: Module owner + lead agent meet to discuss trends, roadmap adjustments.
  - Monthly escalation: If any metric fails baseline > 2 months, escalate to VP of Engineering.
  - Emergency response: If error rate > 5%, auto-page on-call; initiate incident response.

**Reporting Flow:**
- Each agent → module owner (via Slack).
- Each agent → head agent in concern area (Quality → Engineering Lead, Research → Data Lead, Business → Product Lead, Compliance → Legal/Security Lead).
- Lead agent → weekly all-hands report.

---

## 14. Validation Practices

**Accuracy Targets (from 39_module_validation):**
- **Risk Score Calibration:** Expected accuracy within ±10% of predicted risk. Measure: (Actual Outcome - Predicted Risk) should be normally distributed with σ ≤ 10%.
- **Confidence Calibration:** If system says 80% confidence, actual outcome should occur ~80% of the time. Measure: Brier Score < 0.1.
- **Lead Time:** Risk escalated >= 15 min before event impact (varies by hazard; wildfire >= 4h, flood >= 2h, earthquake ~0 sec).
- **False Alert Rate:** < 5% (conditions published but no actual hazard materialized).
- **Source Accuracy:** Each source weighted by historical accuracy (credibility score >= 0.7 to be used in risk calculation).

**Loss Weighting (from 39_module_validation):**
- **False Negative Cost:** Missing a condition risks lives. Wildfire FN = 1000x cost (fire spreads exponentially, time-sensitive). Flood FN = 500x. Earthquake FN = 100x (USGS catches most). Severe Weather FN = 200x.
- **False Positive Cost:** False alarm erodes user trust, causes EMS fatigue. All FP = 1x weight (low relative cost).
- **Loss Function:** `Loss = Σ(FN_weight × FN_loss) + Σ(FP_weight × FP_loss)`. Threshold tuning minimizes weighted loss, not F1 score.

**A/B Testing:**
1. **Risk Scoring Algorithm:** Current (linear weighted sum) vs. New (Bayesian ensemble). Test duration: 4 weeks on 20% of jurisdictions. Success metric: Risk score calibration (Brier Score improvement >= 5%).
2. **Anomaly Detection Threshold:** Current (KL-divergence > 0.1) vs. New (> 0.15). Test: 2 weeks on 10% of sources. Success metric: False positive rate stays < 5%, true positive rate >= 90%.
3. **Polling Cadence Adaptation:** Current (exponential decay) vs. New (predictive based on seasonal pattern). Test: 8 weeks on 5 jurisdictions. Success metric: Conditions published with >= 15 min lead time (vs. current ~10 min).

**Drift Detection:**
- **Input Drift:** Monthly comparison of incoming condition distributions (magnitude, confidence, source mix) vs. training baseline. Method: Kolmogorov-Smirnov test; flag if p < 0.05.
- **Output Drift:** Track published risk scores over time. If rolling 30-day average confidence drops > 15%, flag.
- **Performance Drift:** Weekly F1 score (precision/recall of published conditions). Alert if drops > 5% compared to 12-month baseline.
- **Response:** Investigate root cause (sensor failure, data quality issue, seasonal shift). Retrain if confirmed; temporarily relax thresholds if investigation ongoing.

**Validation Data:**
- **Source:** 500+ past events (2020-2025) with ground truth (USGS confirmed fires, flood gauges, earthquake catalogs, NWS verified reports).
- **Size:** ~1000 observations per hazard type.
- **Refresh Frequency:** Quarterly (add new events, remove old data > 5 years).
- **Stratification:** Split by season, geography, hazard intensity (ensure balanced test set).

---

## 15. Data Science Considerations

**Model Selection:**
- **Risk Score:** Linear weighted sum (interpretable, explainable to EMS) vs. gradient boosting (XGBoost; higher accuracy but black-box).
  - Decision: Start with linear for MVP (explainability > 5% accuracy gain). Migrate to ensemble post-launch if needed.
- **Confidence Fusion:** Bayesian approach (probabilistic, handles uncertainty well) vs. simple average (fast, less robust).
  - Decision: Bayesian (required for calibration; slow is acceptable given non-real-time nature).
- **Anomaly Detection:** Isolation Forest vs. Autoencoders vs. Statistical (KL-divergence, Mahalanobis distance).
  - Decision: Statistical for MVP (no training data needed, interpretable). Upgrade to Isolation Forest if false positive rate > 10%.

**Training Data:**
- **Source:** USGS, NWS, NOAA, NIFC historical databases (all public domain or shared by partners).
- **Size:** 500 past events, ~1000 observations per hazard type, 5-year lookback.
- **Features:** External condition severity (0-100), local reports density (0-10, reports/km²), hazard model confidence (0-1), anomaly score (0-1), seasonal baseline (0-1).
- **Label:** Ground truth outcome (confirmed fire/flood/earthquake/severe weather vs. false alarm).

**Retraining Schedule:**
- Monthly: Add new events from past month to training set.
- Quarterly: Full model retraining (including hyperparameter tuning).
- Annually: Benchmark against published baselines to track improvement.

**Benchmarks:**
- Baseline (published literature): Risk score F1 = 82% (flood models), 87% (wildfire).
- Current Beacon (MVP): Target >= 84% F1 (flood), >= 89% (wildfire).
- Improvement trajectory: +2% F1 per major release (Q1, Q2, etc.).

**Failure Cases:**
- **Simultaneous hazards (cascading):** Risk from earthquake may trigger flood (dam failure). Mitigated by coordinator agent monitoring cascade patterns.
- **Seasonal shift:** Winter storm model underperforms in spring/summer. Mitigated by stratified training (seasonal models) and drift detection.
- **New hazard type:** Risk Monitoring ingests a new external source (e.g., volcano) not in training data. Mitigated by starting with low confidence weight (0.1) and gradually increasing as accuracy proven.
- **Sparse data regions:** Rural areas have few user reports. Mitigated by weighting external sources (NWS, NOAA) higher in low-population regions.

**Explainability:**
- Risk Score: Dashboard shows breakdown: `risk = (0.3 × NWS_severity=60) + (0.3 × reports_density=20) + (0.2 × model_confidence=70) + ... = 62%`. EMS admin can see why risk is high.
- Confidence: Display credibility weights: `[NWS: 0.95, USGS: 0.92, local: 0.70]`. EMS understands which sources are most trusted.
- Anomaly: Flag with reasoning: "Fire reports 10x normal density in [county]; possible sensor malfunction or unrealistic user behavior."

---

## 16. Software Engineering Considerations

**Technology Stack:**
- **Backend:** Node.js 18+ / Express.js (HTTP API), TypeScript (type safety).
- **Data Storage:** PostgreSQL 15+ with PostGIS 3.3+ (spatial queries), TimescaleDB (time-series), Redis (caching), NATS (pub/sub).
- **Ingestion:** Python 3.11 / FastAPI (parallel feed polling, data validation).
- **Dashboard:** React 18 / TypeScript, Tailwind CSS, Mapbox GL (geospatial rendering).
- **Infrastructure:** Kubernetes (EKS), Helm (package management), Docker (containerization).

**External Dependencies:**
- **Version Pinning:** All npm packages pinned to exact version (e.g., `express: "4.18.2"`); reviewed monthly for security updates.
- **Security Scanning:** Snyk integration in CI/CD; blocks PRs with critical vulnerabilities. OWASP dependency check weekly.
- **Compatibility:** Node.js 18+ only (EOL dates tracked; upgrade annually). PostgreSQL >= 15 (new features, performance).

**CI/CD Pipeline:**
- **Lint/Format:** ESLint + Prettier (on every commit). Auto-fix non-breaking violations.
- **Unit Tests:** Jest (75%+ coverage target). Run on every PR; block if coverage drops.
- **Integration Tests:** Docker Compose with PostgreSQL test container. Run on main branch; 20-min timeout.
- **Security Scanning:** Snyk (npm deps), OWASP dependency-check (CVE scan), TruffleHog (secret detection).
- **Performance Benchmarks:** Measure ingestion latency, risk calculation speed. Store in database; alert if p95 latency > 500ms.
- **Deployment Automation:** GitHub Actions canary deploy (5% traffic, 5 min). If error rate stays < 0.1%, proceed to 50% (1 min) then 100% (1 min).

**Technical Debt:**
- **Known Issues:**
  - Risk scoring is synchronous; during high-volume events (1000 conditions/min), latency spikes to 5 sec. Mitigate: Async scoring + background job queue (Sprint N+2).
  - Reconciliation logic is greedy (picks first match); edge cases exist (overlapping, contradictory alerts). Mitigate: Redesign as graph optimization problem (Sprint N+3).
- **Refactoring Priorities:**
  1. Extract risk scoring to separate service (microservice decoupling).
  2. Implement caching layer for source credibility (reduce database hits).
  3. Replace custom anomaly detection with open-source library (Alibi Detect, if evaluation positive).

**SLA & Runbooks:**
- **Availability Target:** 99.95% (22 min downtime/month allowed).
- **Latency Target:** Condition ingestion to first publication: p95 < 500ms, p99 < 1 sec.
- **Error Rate Target:** < 0.1% of conditions malformed or lost.
- **Oncall Runbook (github.com/beacon/runbooks):**
  - P1: Error rate > 1% for 5 min → Page on-call; check logs for feed parsing errors.
  - P2: Latency p95 > 1 sec for 10 min → Page on-call; check RDS query performance.
  - P3: Source offline > 2× cadence → Page on-call; assess impact (usually minor; fallback to model predictions).

**Scalability:**
- **Current:** 1000 conditions/min globally. Database: PostgreSQL 800GB RDS (r6i.3xlarge).
- **Expected Growth:** 10K conditions/min during multi-state events (10× scaling).
- **Bottleneck:** PostgreSQL INSERT throughput. Mitigation: Batch inserts (100 conditions per transaction), connection pooling (PgBouncer), sharding if > 100K conditions/min (unlikely in next 3 years).
- **Horizontal Scaling:** Stateless API servers (no state in-memory); horizontal scale via load balancer. Database vertical scaling (larger instance type) sufficient for projected growth.

---

## 17. Employee Interface Needs (Admin/EMS)

**Risk Dashboard (for EMS Admins):**
- **Real-time risk heat map:** Jurisdiction-level risk color-coded (green < 30, yellow 30-70, red > 70).
- **Active conditions list:** Table with columns: Hazard Type | Jurisdiction | Severity | Confidence | Onset Time | Status (Active/Monitoring/Resolved).
- **Risk trend graph:** Last 7 days of risk score per jurisdiction; highlight escalations.
- **Source health:** Bar chart showing which sources are actively reporting vs. offline.
- **Threshold dashboard:** Links to configure per-jurisdiction/hazard thresholds.

**Threshold Configuration UI:**
- **Modal form:** Select jurisdiction + hazard type. Input fields:
  - `Risk Score Threshold` (0-100): Risk level that auto-triggers event.
  - `Confidence Threshold` (0-1): Min confidence required.
  - `Lead Time (seconds)`: How much advance notice before declaring.
  - `Require External Source?` (toggle): If yes, don't trigger on model prediction alone.
  - `Notes` (text): Why this threshold (for audit trail).
- **Preset templates:** "Aggressive" (low thresholds, early warning), "Conservative" (high thresholds, proven hazards only).
- **Save & audit log:** Displays who changed it, when, and previous value.

**Forecast Visualization:**
- **Risk evolution graph:** Projected risk over next 24h (if trend continues). Show confidence band (±10%).
- **Condition extent map:** Current hazard polygon + 15-min/1h/6h forecasts (lighter opacity for future).
- **Alert timeline:** When auto-alerts will trigger if risk follows forecast (e.g., "If trend continues, risk > 70 at 2:30 PM; auto-event declared").

**Database Schemas (for EMS use):**
- **Conditions table (SELECT):** `id, jurisdiction_id, hazard_type, risk_score, confidence, extent, onset, expires, headline, instructions`.
- **Risk scores table (SELECT):** `jurisdiction_id, hazard_type, risk_score, confidence, factors, polling_cadence_ms, created_at` (time-series).
- **Thresholds table (SELECT/INSERT/UPDATE):** `jurisdiction_id, hazard_type, risk_score_threshold, confidence_threshold, lead_time_seconds, created_by, created_at, updated_at`.
- **Source health (SELECT):** `source_name, last_report, next_due, status (online/offline), records_fetched, error_message` (real-time).

**API Endpoints (for admin integrations):**
- `GET /api/v1/conditions?jurisdiction_id={id}&hazard_type={type}&status={active|all}` → List conditions.
- `GET /api/v1/risk-scores/{jurisdiction_id}?window=24h` → Risk history (time-series).
- `PUT /api/v1/thresholds/{jurisdiction_id}/{hazard_type}` → Update threshold.
- `GET /api/v1/sources/health` → Source status + credibility scores.
- `POST /api/v1/conditions/{id}/acknowledge` → Mark condition reviewed by EMS.
- `POST /api/v1/conditions/{id}/suppress?reason={text}` → Suppress false alarm.

---

## 18. Notes on Risk Monitoring Architecture

**Critical Success Factors:**
1. **Early Detection:** Risk escalated 15+ min before impact (wildfire 4h, flood 2h) enables evacuation.
2. **Trust:** Risk scores must be calibrated (Brier Score < 0.1). False alarms destroy credibility.
3. **Source Redundancy:** If NWS offline, fallback to USGS + local reports. No single point of failure.
4. **Responsiveness:** Condition ingestion to alert delivery < 30 sec. Delays cost lives.
5. **Explainability:** EMS admin must understand why risk is high (show factor breakdown). Black-box models erode trust.

**Design Principles:**
- **Privacy-First:** Minimize PII collection. Anonymize location data 90 days post-event. Encrypt at rest + in transit.
- **Offline-First:** Cached conditions allow app to function without internet; sync when connectivity returns.
- **Fail-Safe:** If external feeds unavailable, rely on hazard model predictions + user reports. System degrades gracefully.
- **Audit Trail:** Every decision (threshold change, reconciliation, suppression) logged for post-event review and legal defensibility.

**Open Questions for Further Development:**
1. How to handle conflicting predictions (e.g., NWS says tornado watch, radar suggests no rotation)? → Implement graph-based optimization to resolve conflicts.
2. Should polling cadence adapt based on time-of-day (fewer resources at night)? → Maybe; trade off early detection for cost savings during low-risk hours.
3. How to validate risk scores in regions with sparse data? → Use synthetic scenarios from digital twins; compare model predictions to simulation outcomes.
4. Can we predict cascade events (earthquake → flood → wildfire)? → Yes; build coordinator agent monitoring all hazards simultaneously.

**References:**
- Hazard Framework: `/beacon/planning/notes/02_hazard_models/00_hazard_framework/hazard_model_framework.md`
- Event Protocols: `/beacon/planning/notes/37_event_protocols/event_protocols_overview.md`
- Validation: `/beacon/planning/notes/39_module_validation/module_validation.md`
- Data Storage: `/beacon/planning/notes/36_data_storage/data_storage.md`
- Module Template: `/beacon/planning/notes/45_development_plan/01_module_template.md`
- Agent Monitor Template: `/beacon/planning/notes/45_development_plan/02_agent_monitor_template.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Status:** Ready for Development Team Review

