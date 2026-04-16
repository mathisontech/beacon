# Post-Operations Module Documentation

## Module Overview

**Module Name:** Post-Event Manager
**Module ID:** post-ops
**Parent System:** Beacon Emergency Disaster Management Platform
**Activation:** Post-acute phase (T+24 hours after event closure)
**Primary Owner:** Operations Lead + Infrastructure Specialist
**Team Size:** 3-5 engineers + 1 product manager

The Post-Event Manager activates after the acute emergency phase concludes. This module orchestrates damage assessment, recovery resource coordination, insurance documentation, infrastructure restoration tracking, community status aggregation, and model validation against actual outcomes. It transforms raw post-disaster data into actionable intelligence for recovery planning and system improvement.

---

## 1. Functionality Scope

### 1.1 Core Features (MVP)

**1.1.1 Damage Assessment Engine**
- LiDAR-to-camera reprojection: Align pre-event LiDAR scans with post-event visible-spectrum imagery to compute change detection
- Structure-level damage classification: Automated scoring from 0 (none) to 5 (destroyed) using computer vision
- Ring doorbell street-level perception: Aggregate video feeds from participating doorbell cameras for granular street-level condition analysis
- Before/after satellite comparison: Sentinel-2 multispectral change detection for broad-area mapping
- Damage footprint vectorization: Convert raster damage output to GeoJSON polygons with severity attributes

**1.1.2 Recovery Resource Mapping**
- Shelter availability tracking: Real-time census of open shelters, capacity, special needs accommodation
- Supply distribution locations: Map active food, water, medical, and equipment distribution points
- Volunteer crew tracking: Geolocation and task assignment for recovery teams (cleanup, debris removal, tarping)
- Utility restoration crews: Track electrical, water, gas utility repair teams and estimated restoration time per area
- Building permit fast-track: Expedited permitting for recovery construction (rebuild, temporary structures)

**1.1.3 Insurance Documentation Generator**
- Damage report export: Generate PDF with photos, severity scores, coordinates, timestamp
- FEMA Individual Assistance (IA) forms: Pre-populate damage assessment data into standard forms
- Adjuster collaboration: Shared web portal for insurance adjusters to annotate damage assessments
- Loss estimate summary: Aggregate damage estimates by structure class (residential, commercial, industrial)

**1.1.4 Infrastructure Restoration Tracking**
- Utility crew coordination: Central dashboard showing electrical, water, gas repair progress by district
- ETA monitoring: Real-time restoration timelines (e.g., "95% power by Day 5")
- Road/bridge status: Mark critical transportation corridors as open, impaired, or closed
- Resource request queue: Utilities can request additional personnel, equipment, material from central coordinator

**1.1.5 Community Status Rollup**
- Population recovery metrics: % of population with power, water, cellular service (rolling 6-hour windows)
- Business resumption tracking: % of businesses reopened (categorized: essential, commercial, office)
- Displacement census: Count of displaced residents in shelters, with family, temporary housing
- Psychological recovery survey: Opt-in community mood/trauma assessment (anonymized)

**1.1.6 Lessons-Learned Data Capture**
- User feedback collection: Structured survey on evacuation effectiveness, alert timing, app usability
- EMS hotspot analysis: Where did response resources get stuck, where were they needed most
- Model accuracy logging: Compare predicted hazard extent to actual impact footprint
- Incident timeline reconstruction: Auto-generated chronicle of event progression from sensor/alert/user data

**1.1.7 Model Validation Framework**
- Prediction vs. outcome comparison: Wildfire extent vs. burn scar, flood extent vs. water observation
- Lead time analysis: How much warning did model provide before impact
- False positive/negative audit: Every missed or spurious alert logged with root cause
- Confidence calibration: Actual outcome rate vs. model confidence score percentiles

### 1.2 Extended Features (V2+)

- AI-driven recovery planning recommendations (resource allocation optimization)
- Historical resilience scoring (compare community recovery speed to similar jurisdictions)
- Rapid shelter-in-place assessment for aftershock events
- Public-private partnership resource matching (donated equipment, volunteer labor)
- Drone-based damage surveying coordination (dispatch, flight planning, data ingestion)

---

## 2. Independent Development Blocks

### Block A: Damage Assessment Pipeline
**Dependencies:** Base Map (LiDAR tiles), Event Manager (event boundaries)
**Deliverable:** Automated damage classification (GeoJSON output)
**Effort:** 6-8 weeks
**Key Skills:** Computer vision, geospatial image processing, cloud infrastructure

Files/Components:
- `damage-assessment/lidar-reprojection.ts` — LiDAR-to-camera alignment
- `damage-assessment/cv-classifier.ts` — CNN-based damage scoring (TFLite model)
- `damage-assessment/change-detection.ts` — Satellite time-series analysis
- `damage-assessment/footprint-vectorizer.ts` — Raster → GeoJSON conversion
- `damage-assessment/doorbell-aggregator.ts` — Ring API integration, frame extraction

### Block B: Recovery Resource Coordination
**Dependencies:** Base Map (POI layer), Teams Manager (team tracking)
**Deliverable:** Real-time resource location + ETA dashboard
**Effort:** 4-6 weeks
**Key Skills:** Real-time geolocation, logistics optimization, WebSocket infrastructure

Files/Components:
- `recovery-resources/shelter-manager.ts` — Capacity tracking, needs assessment
- `recovery-resources/utility-crew-tracker.ts` — Integration with utility dispatch systems
- `recovery-resources/supply-distribution.ts` — Map and ETA for food/water/medical centers
- `recovery-resources/volunteer-coordination.ts` — Task assignment, progress tracking
- `recovery-resources/resource-request-queue.ts` — Priority-based allocation

### Block C: Insurance Documentation
**Dependencies:** Damage Assessment (damage polygons), Event Manager (event metadata)
**Deliverable:** PDF export + FEMA form population
**Effort:** 3-4 weeks
**Key Skills:** PDF generation, form processing, compliance (FEMA standards)

Files/Components:
- `insurance/damage-report-generator.ts` — PDF with photos + coordinates
- `insurance/fema-form-mapper.ts` — IA form field population
- `insurance/adjuster-portal.ts` — Web UI for annotation + collaboration
- `insurance/loss-estimate.ts` — Aggregate damage by structure class

### Block D: Infrastructure & Utility Restoration
**Dependencies:** Base Map (utility layer), Passable Terrain Manager (road status)
**Deliverable:** Utility status dashboard, restoration timeline tracker
**Effort:** 5-7 weeks
**Key Skills:** Utility SCADA integration, ETA prediction, emergency coordination

Files/Components:
- `infrastructure/utility-status-dashboard.ts` — Real-time power/water/gas metrics
- `infrastructure/restoration-timeline.ts` — ETA aggregation by district
- `infrastructure/road-bridge-status.ts` — Network connectivity monitoring
- `infrastructure/resource-coordination.ts` — Cross-utility request queue
- `infrastructure/repair-contractor-management.ts` — Task dispatch, sign-off

### Block E: Community Recovery Metrics
**Dependencies:** User Location Manager (population density), Public Users (surveys)
**Deliverable:** Rollup dashboard with 6-hour refresh
**Effort:** 4-5 weeks
**Key Skills:** Data aggregation, privacy-preserving analytics, real-time dashboarding

Files/Components:
- `community-metrics/population-recovery.ts` — Service availability rollup
- `community-metrics/business-resumption.ts` — % reopened by category
- `community-metrics/displacement-census.ts` — Shelter occupancy + timeline
- `community-metrics/psychological-survey.ts` — Opt-in mood tracking

### Block F: Lessons Learned & Model Validation
**Dependencies:** All hazard models, Event Manager (event timeline)
**Deliverable:** Validation report, feedback dataset for retraining
**Effort:** 6-8 weeks
**Key Skills:** ML model evaluation, statistical analysis, data pipeline engineering

Files/Components:
- `validation/prediction-outcome-compare.ts` — Accuracy metrics per hazard
- `validation/lead-time-analyzer.ts` — Warning time vs. impact onset
- `validation/confidence-calibration.ts` — Actual outcome vs. predicted confidence
- `validation/user-feedback-collector.ts` — Survey ingestion + analysis
- `validation/lessons-learned-report.ts` — Narrative + data export

---

## 3. Consideration Framework (7 Categories × All Dimensions)

### A. Product & Strategy

**A1. Functionality Scope**
- V1: Damage assessment (automated), recovery resource map, basic lessons-learned collection
- V2: Insurance integration, utility coordination, community metrics dashboard
- V3: AI-driven recovery planning, historical resilience scoring, public-private matching

**A2. Competitive Advantage**
- Differentiator: Integrated damage assessment (LiDAR + visible + doorbell) = street-level accuracy
- Differentiator: Real-time utility restoration tracking (proprietary SCADA integration)
- Table-stakes: Model validation framework (required for credibility)

**A3. Prominence & Timing**
- Event-activated: Appears on dashboard only after event closed (T+24h)
- EMS-only: Initially restricted to emergency services (MVP)
- Public-facing V2: Damage maps, recovery resources visible to residents

**A4. Account Access Matrix**
- BE (Enterprise): Full access, custom integrations
- EA (Authority): Damage assessment, utility coordination, reports
- ET (Team): Real-time team tracking + task assignment only
- DI (Dedicated): Recovery resource map (read-only)
- SD/PU: Public damage map + community metrics (V2+)

**A5. Activation Conditions**
- Trigger: Event Manager declares event "closed" (no new hazard evolution)
- Duration: Active for 30 days post-closure (then archived)
- Hazard scope: All hazard types activate module equally
- Manual override: Module lead can activate early for analysis

**A6. Future Viability**
- Climate change: More frequent multi-hazard events → emphasis on cascade recovery
- International: Non-US jurisdictions may lack FEMA form requirements (parameterize)
- Technology: Drone imagery + LiDAR will become cheaper/faster → automate more
- Regulation: Post-disaster accountability increasing → prioritize audit trails

### B. Technical Architecture

**B1. Technical Feasibility & Constraints**
- Hard problems: LiDAR-camera registration (requires known GCP, weather-dependent), Ring API access (privacy negotiation), utility SCADA security (air-gapped systems)
- Risk: Doorbell imagery availability (3-5% of addresses); fallback to satellite-only
- Latency budget: Damage maps should refresh every 4 hours; infrastructure ETAs every 15 min
- Hardware: GPU required for real-time image classification (AWS EC2 p3 instance)

**B2. Database Design**

Schema (PostgreSQL + PostGIS):
```sql
TABLE events_post_ops (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  closed_at TIMESTAMP,
  damage_extent GEOMETRY(POLYGON),
  recovery_target_date DATE
);

TABLE damage_assessments (
  id UUID PRIMARY KEY,
  event_id UUID,
  location GEOMETRY(POINT),
  damage_score INT (0-5),
  confidence FLOAT (0-1),
  source VARCHAR (lidar | camera | doorbell | satellite),
  timestamp TIMESTAMP,
  imagery_url TEXT
);

TABLE infrastructure_status (
  id UUID PRIMARY KEY,
  event_id UUID,
  utility_type VARCHAR (power | water | gas),
  district VARCHAR,
  status VARCHAR (operational | impaired | offline),
  pct_restored FLOAT,
  eta_restoration TIMESTAMP,
  updated_at TIMESTAMP
);

TABLE recovery_resources (
  id UUID PRIMARY KEY,
  event_id UUID,
  resource_type VARCHAR (shelter | supply | crew | permit),
  location GEOMETRY(POINT),
  capacity INT,
  available INT,
  details JSONB
);

TABLE validation_metrics (
  id UUID PRIMARY KEY,
  event_id UUID,
  hazard_type VARCHAR,
  predicted_extent GEOMETRY,
  actual_extent GEOMETRY,
  precision FLOAT,
  recall FLOAT,
  lead_time_minutes INT,
  confidence_calibration FLOAT
);
```

Indexes:
- `damage_assessments (event_id, timestamp)` - damage query by time
- `infrastructure_status (event_id, utility_type)` - utility status queries
- `recovery_resources (event_id, resource_type, location)` - spatial joins for allocation

**B3. Codebase Architecture**

Directory structure:
```
/post-ops/
  /damage-assessment/
    lidar-reprojection.ts
    cv-classifier.ts
    change-detection.ts
    footprint-vectorizer.ts
    doorbell-aggregator.ts
  /recovery-resources/
    shelter-manager.ts
    utility-crew-tracker.ts
    supply-distribution.ts
    volunteer-coordination.ts
  /insurance/
    damage-report-generator.ts
    fema-form-mapper.ts
    adjuster-portal.ts
  /infrastructure/
    utility-status-dashboard.ts
    restoration-timeline.ts
    resource-coordination.ts
  /validation/
    prediction-outcome-compare.ts
    lead-time-analyzer.ts
    confidence-calibration.ts
  /shared/
    types.ts (interfaces)
    utils.ts (common functions)
    db.ts (database queries)
```

API boundaries:
- `/api/v1/events/{eventId}/damage-assessment` → Damage polygons + scores
- `/api/v1/events/{eventId}/recovery-resources` → Real-time resource locations
- `/api/v1/events/{eventId}/infrastructure-status` → Utility restoration ETAs
- `/api/v1/events/{eventId}/validation-report` → Lessons-learned + metrics

Testing:
- Unit: Damage classifier (mock images + ground truth)
- Integration: End-to-end damage map generation
- E2E: Admin dashboard displays metrics, exports PDF

**B4. Data Storage & Retention**

Hot storage (PostgreSQL): 30 days post-event
Warm storage (TimescaleDB): 90 days (compressed)
Cold storage (S3/Glacier): 7 years (audit trail)

Data volumes:
- Damage assessments: 10K-100K polygons per event (50-500 MB)
- Imagery: 1 GB/day (satellite + doorbell feeds)
- Infrastructure telemetry: 1 KB/message, 100 messages/min = 1.5 GB/month
- Validation metrics: 1 KB per metric, 100K metrics/event = 100 MB

Retention:
- Damage assessments: 10 years (regulatory + benchmarking)
- Infrastructure telemetry: 90 days post-event
- Imagery: 2 years (re-analysis capability)
- Validation metrics: 10 years (model improvement)

**B5. API & Integration Points**

Internal dependencies:
- Event Manager: Event closure timestamp, event geometry
- Base Map: LiDAR tiles, utility POI layer
- Hazard Models: Predicted extent (compare to actual)
- User Location Manager: Population density for impact estimates
- Notifications: Alert residents of damage map availability

External integrations:
- Ring API: Doorbell video access (OAuth, rate limit 100 req/min)
- USGS: Satellite imagery (Landsat/Sentinel-2 STAC API)
- Utility SCADA: Power/water/gas status (proprietary, vary by utility)
- FEMA: IA form schema, submission portal
- Insurance industry APIs: Loss estimate databases

API versioning: Semver (v1.0, v1.1, v2.0)
Contract enforcement: OpenAPI 3.0 specs, automated breaking-change detection

---

### C. Reliability & Performance

**C1. Resilience & Failover**

Single points of failure & mitigation:
- LiDAR source unavailable: Fallback to satellite-only (60% accuracy vs. 95%)
- Ring API down: Cache previous 7 days of doorbell imagery
- Utility SCADA disconnected: Use EMS manual reports + historical ETA patterns
- Classifier GPU overload: Queue requests, prioritize critical areas (hospitals, shelters)

Graceful degradation:
- Loss of doorbell: Show satellite + LiDAR damage map (less detail)
- Loss of utility SCADA: Show EMS crew location estimates (lower confidence)
- Loss of Ring API: Fall back to crowd-sourced damage photos

Circuit breakers:
- If damage classifier confidence <50%, flag for manual review (don't auto-publish)
- If utility ETA misses by >2x, reduce confidence weight in next prediction
- If doorbell imagery stale (>12h), reduce weighting vs. satellite

Redundancy:
- 2 GPU instances (active-passive failover for classifier)
- Read replicas for damage/infrastructure databases
- CloudFront CDN for imagery (geo-replicated, fallback domain)

**C2. Performance Benchmarks**

Target latencies:
- Damage map refresh: <4 hours from new satellite pass
- Infrastructure ETA update: <15 minutes
- Damage PDF export: <60 seconds
- Community metrics rollup: <5 minutes (computed every 6 hours)

Throughput:
- Damage classifier: 100 structures/hour (real-time)
- Recovery resource updates: 1000 locations/min
- Infrastructure status: 500 utilities/min

Resource budgets:
- GPU instance: $500/month (shared across modules)
- Database queries: <100ms p99 for damage lookups
- API response times: <500ms p95

**C3. Scalability Requirements**

User count targets:
- MVP (10K users): 1 GPU instance, 100 concurrent dashboard viewers
- Beta (100K): 2 GPU instances, 1K concurrent
- Launch (1M): 10 GPU instances, 10K concurrent

Data volume scaling:
- Event count: 10/year → 50/year → 200/year
- Damage polygons per event: 5K → 50K → 500K
- Imagery storage: 1 TB/event → scale to 500 TB/year by Year 3

Horizontal scaling:
- Damage classifier: Replicate across GPU instances, load-balance by geography
- Database: Partitions by event_id, shard by geography if >10M records
- API servers: Autoscale to 5-50 instances during peak hours

**C4. Offline & Mesh Capability**

What works offline:
- View cached damage maps (refresh every 4h, pre-cache 5 recent events)
- Read recovery resources (fetch every 8h)
- Collect user feedback (queue for upload on reconnect)

What requires internet:
- Real-time infrastructure ETAs
- PDF damage report generation
- FEMA form submission

Mesh priority: Low (post-ops not time-critical); defer to higher priority modules
Battery impact: Minimal (reads only, no mesh broadcasting)

**C5. Real-Time Requirements**

Update frequency:
- Damage assessments: Every 4 hours (batch satellite pass)
- Infrastructure status: Every 15 minutes (utility SCADA polling)
- Community metrics: Every 6 hours (aggregate + anonymize)
- Recovery resources: Every 1 hour (from Teams Manager)

Data transport:
- Polling: Infrastructure status (stateless, easier to replicate)
- Batch: Damage maps (high volume, background job)
- Push: Resource updates (WebSocket to admin dashboard)

---

### D. Security, Legal & Compliance

**D1. Cybersecurity Requirements**

Attack surface:
- Image classification model poisoning: Malicious satellite imagery → false damage scores
- Mitigation: Validate imagery source, compare to historical baselines
- SCADA injection: Spoofed utility status messages
- Mitigation: Authenticate via TLS + certificate pinning, rate limit status updates
- Doorbell privacy: Ensure Ring API access authenticated, no recording outside consent
- Mitigation: OAuth token with scoped permissions, audit access logs

Authentication:
- Admin dashboard: OAuth via Beacon account + 2FA
- Utility SCADA: Certificate pinning + mTLS
- Ring API: OAuth token refresh every 1 hour
- User exports: Signed URLs (1-hour expiry)

Input validation:
- Geospatial coordinates: Validate within event bounds (±10km buffer)
- Damage scores: 0-5 only, reject NaN
- Infrastructure ETA: Timestamp must be future (within 30 days)
- Free-text fields: Max 5000 chars, HTML escape

Rate limiting:
- Damage API: 100 req/min per user
- Export API: 10 req/hour per user (PDF generation expensive)
- SCADA polling: 1 req/min per utility (provider limit)

**D2. Legal & Regulatory Compliance**

Applicable regulations:
- HIPAA: If shelter occupancy includes medical needs → de-identify
- CCPA/CPRA: Location data in damage assessments covered → offer deletion
- FCC: No override of emergency alerts system
- FEMA: Individual Assistance form accuracy requirements
- State building codes: Damage classification must match ATC-20 rapid assessment standard

Liability exposure:
- Damage assessment accuracy: If score wrong, FEMA IA payments delayed
- Mitigation: Adjuster manual review required before form submission, disclaimer in report
- Utility restoration ETA: If overestimate causes resident harm (medical), liability risk
- Mitigation: Publish confidence intervals, never guarantee ETA, require EMS acknowledgment

Insurance requirements:
- E&O policy: $2-5M coverage for damage assessment errors
- General liability: $1M for platform operations

**D3. Privacy & Data Sensitivity**

PII in damage assessments:
- Addresses: Necessary for damage mapping
- Owners: Not collected (GIS parcel data only)
- Photos: Doorbell imagery contains human subjects → consent required

Data sensitivity classification:
- Damage extent (GeoJSON): Unclassified (public in V2)
- Damage photos: Sensitive (EMS only in V1, residents can opt-in to sharing)
- Shelter occupancy: Sensitive (EMS only, not disclosed publicly)
- Psychological survey: Sensitive (anonymized, aggregate only)

Encryption:
- Transit: TLS 1.3 for all APIs
- Rest: AES-256-GCM for damage photos in S3
- Database: AWS RDS encryption enabled

User consent:
- Doorbell access: Explicit opt-in per event (not automatic)
- Damage photo sharing: Opt-in for public visibility
- Recovery resource location: Volunteers can hide specific address, show sector only
- Psychological survey: Completely optional, data not linked to account

Right-to-deletion:
- Users can request removal from damage assessments (geospatial, not identity-based)
- Photos: Deleted within 30 days of request
- Survey data: Anonymized immediately after event closed

**D4. Government Compliance**

CMMC Level 2 (110 practices):
- Access control: Role-based (EA, EMS, public)
- Audit logging: All damage assessment changes logged
- Incident response: Malformed SCADA messages logged, threshold alerts
- Supplier management: Ring/USGS partnerships documented

FedRAMP path:
- Identify data flows with federal agencies (FEMA IA data flow)
- Classify as "government data" (trigger encryption, audit requirements)
- Provisional authorization pathway: 6-12 month process if federal agency customer

SOC 2 Type II:
- Security: Access control, encryption, logging
- Availability: 99.5% uptime SLA during active events
- Confidentiality: Data minimization, purpose limitation
- Integrity: Immutable audit logs, change control

---

### E. Mesh & Network

**E1. Mesh Traffic Management**

Data from post-ops over mesh:
- Community metrics rollup: 10 KB (population service status)
- Damage map updates: 50 KB (compressed GeoJSON)
- Recovery resource list: 5 KB (shelter + supply locations)

Priority: Low (3 out of 5) — post-ops is not time-critical
Payload optimization: PNG tiles instead of GeoJSON where possible (50% size reduction)
Delta encoding: Damage maps only transmit changed polygons (80% reduction over full refresh)

Bandwidth budget:
- Normal operation: <100 KB/hour (low priority, batched)
- Active recovery (7 days): <1 MB/day (refresh every 4h)

**E2. Network Partition Behavior**

During partition:
- Damage maps: Serve stale cached version (timestamp clearly marked)
- Infrastructure ETAs: Not available (too volatile)
- Community metrics: Show last-known state, mark as stale
- Recovery resources: Show cached list, note staleness

Conflict resolution (on partition heal):
- Damage assessments: Server-authoritative (replace local cache)
- Infrastructure status: Server-authoritative (SCADA is source of truth)
- Recovery resources: Merge by timestamp (newer wins)

Data consistency: Eventual consistency (repair/recovery is not split-second critical)

---

### F. Risk & Quality

**F1. Risk Management Analysis**

Critical failure modes:

| Failure | Consequence | Severity | Mitigation |
|---------|-------------|----------|-----------|
| Damage score inflated | FEMA IA fraud, wasted resources | High | Manual adjuster review, confidence thresholds |
| Damage score deflated | Under-recovery resources, slow rebuild | Medium | Satellite verification, community feedback |
| Utility ETA misses badly | Residents make wrong decisions, harm | High | Confidence intervals, manual EMS override |
| Infrastructure outages cascaded | Incorrect assumptions, rescue delays | Medium | Cross-check utility data, flag anomalies |
| Privacy breach of doorbell footage | Legal liability, user trust loss | High | Encrypt at rest, audit access, deletion policy |
| Model validation skipped | Improvements missed, repeated errors | Medium | Automated validation pipeline, mandatory report |

Mitigation strategies:
- Always require human review for high-impact decisions (FEMA form submission)
- Publish confidence intervals, not point estimates
- Audit trail for all changes (who, when, why)
- Regular security testing (penetration test annually)

**F2. Safety Criticality Rating**

Post-event operations are **Medium** criticality:
- Not directly life-safety (event is over, not ongoing hazard)
- But impacts recovery quality (slower recovery = prolonged suffering)
- Damages allocation (wrong damage score → wrong aid distribution)
- Infrastructure coordination (if wrong, delays in utility restoration)

Consequence of wrong output: Delayed recovery, resource misallocation, not loss of life
Testing rigor: Intermediate (not as strict as live hazard detection, but comprehensive)
Release process: Change control board review for FEMA form changes; standard deployment otherwise

---

### G. Organizational

**G1. Module Ownership Profile**

Module lead should have:
- Domain: GIS + emergency management (understand FEMA processes, field operations)
- Tech: Full-stack (Python backend for ML, TypeScript frontend)
- Soft skills: Liason with insurance industry, utility companies, FEMA partners
- Team: 3-5 engineers (1 ML engineer, 2 full-stack, 1 DevOps)

Ideal background:
- Prior experience: Disaster recovery operations, property assessment, utility coordination
- Education: BS Geography/GIS + bootcamp or MS in relevant field
- Domain expertise: FEMA ICS, building damage classification (ATC-20), utility operations

**G2. Inter-Module Dependencies**

Consumes from:
- Event Manager: Event boundaries, closed_at timestamp
- Base Map: LiDAR tiles, satellite imagery, utility layer POI
- Hazard Models: Predicted extents (for validation)
- User Location Manager: Population density (impact estimates)
- Notifications: Alert channel for damage map availability (V2)

Produces for:
- Agentic Planners: Actual impact data (for model retraining)
- Hazard Models: Validation metrics (accuracy feedback)
- Teams Manager: Recovery resource assignments
- Resource & Dispatch: Recovery team scheduling

Dependency graph position: **Leaf node** (depends on many, few depend on it) → low blast radius if broken

**G3. Cross-Team Coordination**

Strongest partnerships:
- **Base Map team:** LiDAR tile delivery, satellite imagery integration
- **Hazard Models team:** Validation data exchange (predicted vs. actual)
- **Event Manager team:** Event closure coordination, data privacy gates
- **Agentic Planners team:** Model retraining data pipelines

Integration points:
- Weekly syncs during post-event window (first 30 days)
- Shared Slack channel for damage assessment questions
- Monthly validation review (model accuracy vs. actual outcomes)

**G4. External Partnerships**

Ring Inc.:
- Partnership health: Essential for doorbell imagery
- Contingency: Pre-negotiate API terms, fallback to satellite-only
- Commercial: Ring may charge API access fees (budget $50K/year)

FEMA:
- Partnership health: Critical for Individual Assistance integration
- Regulatory: IA form schema changes annually
- Data sharing: MOU required for location data sharing

Insurance industry:
- Partnership health: Multiple insurers (State Farm, Allstate, etc.)
- Participation: Adjuster portal may be whiteboard feature initially
- Revenue: Potential data licensing (anonymized damage maps)

Utility companies:
- Partnership health: Local utilities vary (some cooperative, some protective of SCADA)
- Security: Require mTLS + certificate pinning
- Cost: Likely free (utilities benefit from coordination)

USGS/NOAA:
- Partnership health: Public data (no agreement needed)
- API stability: Rely on open STAC APIs
- Cost: Free

**G5. Training & Documentation**

Team needs:
- Damage classification methodology (ATC-20 rapid assessment)
- FEMA IA form requirements and evolution
- LiDAR reprojection techniques (geospatial transformation)
- Utility SCADA protocol basics (power/water/gas system status)
- Privacy-preserving analytics (differential privacy techniques)

EMS user documentation:
- Damage map interpretation (confidence scoring, not authoritative)
- Recovery resource dashboard (capacity planning, volunteer coordination)
- Infrastructure ETA tracking (update frequency, confidence intervals)
- Lessons-learned report (how to interpret validation metrics)

Runbooks:
- Damage map generation (manual triggers, error handling)
- FEMA form export (validation, submission, rejection handling)
- Utility status aggregation (SCADA polling, failure scenarios)
- Recovery resource allocation (manual override procedures)

---

## 4. Detailed Development Blocks (Per-Block Deep Dive)

### Block A: Damage Assessment Pipeline

**Purpose:** Automated detection and classification of structural damage from multi-modal imagery.

**Key Components:**

1. **LiDAR-to-Camera Reprojection** (`lidar-reprojection.ts`)
   - Input: Pre-event LiDAR point cloud (las/laz format), post-event RGB images (georeferenced)
   - Process: 3D-to-2D projection using camera calibration matrix + RPC (rational polynomial coefficients)
   - Output: Aligned LiDAR depth map + RGB image (same resolution)
   - Challenge: Seasonal vegetation change confounds depth comparison
   - Solution: Use intensity channel (NIR) to filter vegetation, focus on structural elements

2. **Computer Vision Damage Classifier** (`cv-classifier.ts`)
   - Model: EfficientNet-B3 (pretrained ImageNet, fine-tuned on damage dataset)
   - Training data: 10K manually labeled images (FEMA rapid assessment teams)
   - Classes: 0=none, 1=minor, 2=moderate, 3=major, 4=destroyed (5-class)
   - Input: 256x256 RGB patches from aligned LiDAR-camera data
   - Output: Damage score (0-5) + confidence (0-1)
   - Inference: 100 structures/hour on single GPU (p3.2xlarge)
   - Optimization: Quantization to INT8 (TFLite) for edge deployment

3. **Satellite Change Detection** (`change-detection.ts`)
   - Data: Sentinel-2 multispectral (11 bands, 10m resolution)
   - Algorithm: Normalized Difference Vegetation Index (NDVI) change, red-edge absorption
   - Comparison: Pre-event baseline vs. T+2 days, T+7 days imagery
   - Output: Raster damage extent (0-100% confidence per pixel)
   - Limitation: 10m pixel size too coarse for house-level; good for neighborhoods
   - Use case: Broad area coverage when doorbell/LiDAR unavailable

4. **Damage Footprint Vectorizer** (`footprint-vectorizer.ts`)
   - Input: Raster damage extent (32-bit float, confidence per pixel)
   - Algorithm: Threshold at 50% confidence, morphological closing (fill small holes), simplify via Visvalingam-Whyatt
   - Output: GeoJSON FeatureCollection (damage polygons + scores)
   - Attributes per polygon: centroid, avg_confidence, source (lidar|satellite|doorbell), timestamp
   - Simplification: Reduce vertices 90% (500 → 50 vertices) for performance

5. **Ring Doorbell Integration** (`doorbell-aggregator.ts`)
   - API: Ring Protect API (OAuth2, scoped permissions)
   - Data: Video frames from T-24h to T+72h (before/during/after)
   - Access: Explicit opt-in per event (user authorizes in app)
   - Processing: Extract key frames (1 frame/min), geo-tag by doorbell location
   - Output: Time-series street-level observations (GeoJSON with image URLs)
   - Privacy: Store only encrypted video URLs, delete after 30 days
   - Fallback: If API unavailable, use cached 7-day feed

**Database Schema:**
```sql
TABLE damage_assessments (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  geometry GEOMETRY(POLYGON, 4326),
  damage_score INT CHECK(damage_score BETWEEN 0 AND 5),
  confidence FLOAT CHECK(confidence BETWEEN 0 AND 1),
  source VARCHAR(50), -- 'lidar','satellite','doorbell','hybrid'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  imagery_urls TEXT[], -- S3 paths for source images
  model_version VARCHAR(50), -- Track model version for validation
  INDEX (event_id, created_at),
  INDEX (geometry) USING GIST
);

TABLE damage_source_metadata (
  assessment_id UUID REFERENCES damage_assessments(id),
  source_type VARCHAR(50),
  confidence_breakdown JSONB, -- {'lidar': 0.9, 'satellite': 0.7, 'doorbell': 0.85}
  fusion_method VARCHAR(50) -- 'max','mean','weighted'
);
```

**API Endpoints:**
- `POST /api/v1/events/{eventId}/damage-assessment/trigger` — Start pipeline
- `GET /api/v1/events/{eventId}/damage-assessment/status` — Pipeline progress
- `GET /api/v1/events/{eventId}/damage-assessment` — Retrieve damage polygons + scores
- `POST /api/v1/damage-assessment/{assessmentId}/verify` — Adjuster confirmation

**Testing Strategy:**
- Unit: Mock LiDAR-camera alignment, verify rotation/scale
- Integration: End-to-end with 10K test image patches, compare to human labels (Cohen's kappa ≥0.8)
- Regression: Monthly validation on historical events (track F1 score trend)

---

### Block B: Recovery Resource Coordination

**Purpose:** Real-time geolocation and allocation of recovery assets (shelters, supplies, crews).

**Key Components:**

1. **Shelter Management** (`shelter-manager.ts`)
   - Data sources: FEMA shelter list (pre-event), real-time occupancy (from shelter operators)
   - Attributes: Capacity, current occupancy, special needs (accessibility, pets, language), address
   - Update frequency: Every 30 minutes (shelter operators submit counts)
   - Availability logic: Show available capacity (capacity - occupancy)
   - Needs assessment: Shelter can report critical shortages (cots, food, medical)

2. **Utility Crew Tracking** (`utility-crew-tracker.ts`)
   - Integration: Utility dispatch systems (API integration varies by utility)
   - Data: Crew location (GPS from vehicle), assigned task, completion status
   - Update frequency: Every 5 minutes during active restoration
   - ETA logic: Historical repair time + current queue length
   - Coordination: Central coordinator receives crew status, allocates new tasks

3. **Supply Distribution** (`supply-distribution.ts`)
   - POI types: Food banks, water distribution, medical supplies, equipment caches
   - Attributes: Location, hours, inventory levels (food portions, water bottles, medical)
   - Update frequency: Hourly (from distribution operators)
   - ETA: Queue time estimate based on current visitor count

4. **Volunteer Coordination** (`volunteer-coordination.ts`)
   - Source: "People Helping People" module (volunteers register)
   - Task types: Debris removal, tarping, mucking (water damage cleanup), chainsaw work
   - Assignment logic: Match volunteer skills/equipment to task needs, minimize travel
   - Status tracking: In-progress, completed, issues reported
   - Feedback: Volunteer can report task completion, photos of work done

5. **Resource Request Queue** (`resource-request-queue.ts`)
   - Requestor: EMS coordinator, utility chief, shelter manager
   - Request types: Personnel, vehicles, equipment, supplies
   - Priority: Critical (medical/safety), high (infrastructure), normal (comfort)
   - Fulfillment: Manual coordination (not automated matching)
   - Status: Pending, assigned, in-transit, delivered

**Database Schema:**
```sql
TABLE recovery_resources (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  resource_type VARCHAR(50), -- 'shelter','supply','crew','volunteer','equipment'
  location GEOMETRY(POINT, 4326),
  status VARCHAR(50), -- 'operational','impaired','offline','full'
  capacity INT,
  available INT,
  last_updated TIMESTAMP DEFAULT NOW(),
  operator_contact_id UUID, -- Reference to operator user
  details JSONB, -- Flexible per resource type
  INDEX (event_id, resource_type, location USING GIST)
);

TABLE resource_requests (
  id UUID PRIMARY KEY,
  event_id UUID,
  requester_id UUID,
  resource_type VARCHAR(50),
  quantity INT,
  priority VARCHAR(50),
  requested_at TIMESTAMP,
  fulfillment_status VARCHAR(50),
  assigned_resource_id UUID REFERENCES recovery_resources(id),
  completed_at TIMESTAMP
);
```

**API Endpoints:**
- `GET /api/v1/events/{eventId}/recovery-resources` — Real-time resource map
- `POST /api/v1/recovery-resources/{resourceId}/update-status` — Operator updates
- `POST /api/v1/resource-requests` — Coordinator submits request
- `PATCH /api/v1/resource-requests/{requestId}/assign` — Assign to resource

**Real-Time Updates:**
- WebSocket channel: `/ws/events/{eventId}/recovery-resources`
- Messages: Resource status changes (location, occupancy, availability)
- Latency: <5 seconds

---

### Block C: Insurance Documentation

**Purpose:** Generate damage reports and pre-populate FEMA Individual Assistance forms.

**Key Components:**

1. **Damage Report Generator** (`damage-report-generator.ts`)
   - Template: PDF with branded header (Beacon logo), FEMA disclaimer
   - Sections: Executive summary, damage map (PNG), property list, photos
   - Data: Pull from damage_assessments table (scores + imagery URLs)
   - Signature block: Space for EMS/adjuster sign-off
   - Export: Single PDF (10-50 pages depending on event size)
   - Library: PDFKit (Node.js) or wkhtmltopdf (command-line wrapper)

2. **FEMA Form Mapper** (`fema-form-mapper.ts`)
   - Form standard: FEMA IA form (currently IA-203, may change annually)
   - Field mapping: damage_score → damage_extent_code, location → property_address
   - Validation: Ensure all required fields populated, flag missing data
   - Output: JSON representation of form (ready for submission API)
   - Versioning: Track form schema changes (forms update yearly)

3. **Adjuster Portal** (`adjuster-portal.ts`)
   - Web UI: List of damaged properties, sortable/filterable
   - Annotation: Adjuster can view damage photo, confirm/adjust score, add notes
   - Collaboration: Multiple adjusters on same event; changes tracked
   - Workflow: Property awaiting adjuster → under review → approved → ready for FEMA submission
   - Access: Adjuster logs in via insurance company SSO (SAML)

4. **Loss Estimate Summary** (`loss-estimate.ts`)
   - Aggregation: Sum damage by structure class (residential, commercial, industrial, agricultural)
   - Valuation: Use county assessor median values × damage% to estimate loss
   - Output: Summary table (class, count, avg_damage, total_estimate_loss)
   - Accuracy: ±50% (depends on damage score accuracy + valuation database)
   - Use case: EMS/municipality can request FEMA IA threshold assessment

**Database Schema:**
```sql
TABLE fema_form_exports (
  id UUID PRIMARY KEY,
  event_id UUID,
  form_type VARCHAR(50), -- 'IA-203','DR-4567' (disaster response number)
  created_at TIMESTAMP,
  created_by_id UUID,
  form_data JSONB, -- Full form in JSON representation
  status VARCHAR(50), -- 'draft','ready_for_submission','submitted','approved'
  submission_id VARCHAR(100), -- FEMA-assigned submission ID
  pdf_url TEXT -- S3 path to generated PDF
);

TABLE damage_adjustments (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES damage_assessments(id),
  adjusted_by_id UUID,
  original_score INT,
  adjusted_score INT,
  reason TEXT,
  timestamp TIMESTAMP,
  INDEX (assessment_id, timestamp)
);
```

**API Endpoints:**
- `GET /api/v1/events/{eventId}/damage-report` → PDF download
- `POST /api/v1/fema-forms/generate` → Create form from assessments
- `PATCH /api/v1/fema-forms/{formId}/adjust` → Adjuster updates score
- `POST /api/v1/fema-forms/{formId}/submit` → Send to FEMA

**Access Control:**
- Damage report: EMS only (until public V2)
- Form mapping: EMS lead only
- Adjuster portal: Insurance adjusters (via SAML federation)
- Loss estimate: EMS + municipality officials

---

### Block D: Infrastructure & Utility Restoration

**Purpose:** Track utility restoration progress and coordinate recovery infrastructure.

**Key Components:**

1. **Utility Status Dashboard** (`utility-status-dashboard.ts`)
   - Feeds: Power (utility SCADA), water (SCADA), gas (SCADA)
   - Metrics: % of service area with power/water/gas, outage clusters
   - Update frequency: Power/gas every 5 min, water every 15 min
   - Visualization: Choropleth map (districts colored by service %), timeline graph
   - Drill-down: Click district → show affected customers, estimated restoration time

2. **Restoration Timeline** (`restoration-timeline.ts`)
   - Input: ETA from utility crews (e.g., "95% power restored by Day 5, 100% by Day 7")
   - Tracking: Monitor actual progress vs. ETA
   - Adjustment: Utilities update ETA if work delayed/accelerated
   - Confidence: ETA confidence interval (±12 hours at T+2 days)
   - Output: Timeline Gantt chart (power → water → gas restoration phases)

3. **Road/Bridge Status** (`road-bridge-status.ts`)
   - Data: Integration with Passable Terrain Manager
   - Updates: Mark critical corridors as open, impaired, closed
   - Impact: Shows traffic detours, affects evacuation route recommendations for future events
   - Repair timeline: Show when bridge/road repairs expected
   - Coordination: EMS can request traffic detour signs installed

4. **Resource Coordination Hub** (`resource-coordination.ts`)
   - Request queue: Utilities submit resource requests (personnel, equipment, supplies)
   - Visibility: All utilities see other utilities' requests (prevent over-allocation)
   - Allocation: Central coordinator matches requests to available resources
   - Priority: Critical (medical facility without water) > high (infrastructure) > normal
   - Mutual aid: Can request support from neighboring jurisdictions/utilities

5. **Repair Contractor Management** (`repair-contractor-management.ts`)
   - Database: Pre-registered contractors (road, bridge, electrical, water, gas specialists)
   - Activation: EMS activates contractors for specific task (road closure, bridge repair)
   - Progress: Contractor submits daily progress reports (% complete, crew count)
   - Sign-off: Project engineer inspects, signs off completion
   - Payment: Invoice processed after sign-off (municipal or state reimbursement)

**Database Schema:**
```sql
TABLE utility_status (
  id UUID PRIMARY KEY,
  event_id UUID,
  utility_type VARCHAR(50), -- 'power','water','gas'
  jurisdiction VARCHAR(100),
  pct_operational FLOAT CHECK(pct_operational BETWEEN 0 AND 100),
  customer_count INT,
  affected_count INT,
  last_update TIMESTAMP,
  updated_by_id UUID,
  INDEX (event_id, utility_type, last_update DESC)
);

TABLE restoration_timeline (
  id UUID PRIMARY KEY,
  utility_status_id UUID REFERENCES utility_status(id),
  phase INT, -- 1=partial (50%), 2=major (90%), 3=complete (100%)
  eta TIMESTAMP,
  confidence_interval_hours INT,
  updated_at TIMESTAMP,
  notes TEXT
);

TABLE infrastructure_repairs (
  id UUID PRIMARY KEY,
  event_id UUID,
  infrastructure_type VARCHAR(50), -- 'road','bridge','utility'
  location GEOMETRY(POINT, 4326),
  estimated_completion TIMESTAMP,
  contractor_id UUID,
  status VARCHAR(50), -- 'planning','in_progress','testing','complete'
  pct_complete FLOAT,
  daily_reports JSONB[], -- Array of {date, pct_complete, crew_count, notes}
  engineer_sign_off_date TIMESTAMP,
  cost_estimate INT,
  actual_cost INT,
  INDEX (event_id, status)
);
```

**API Endpoints:**
- `GET /api/v1/events/{eventId}/utility-status` — Real-time service percentages
- `PATCH /api/v1/utility-status/{statusId}` — Utility updates status
- `GET /api/v1/events/{eventId}/restoration-timeline` — ETA projections
- `POST /api/v1/resource-requests` — Utility requests resources
- `POST /api/v1/infrastructure-repairs` — EMS activates contractor

**Real-Time Updates:**
- WebSocket: `/ws/events/{eventId}/utility-status`
- Push notification: When restoration milestone reached (50%, 75%, 90%, 100%)

---

### Block E: Community Recovery Metrics

**Purpose:** Aggregate anonymized recovery status for public/EMS awareness.

**Key Components:**

1. **Population Recovery Tracker** (`population-recovery.ts`)
   - Data source: Utility telemetry (% with power/water/gas)
   - Calculation: Weighted by population served (urban areas weighted more)
   - Update frequency: Every 6 hours
   - Output: "87% of population has power, 92% have water, 78% have gas" (T+3 days post-event)
   - History: Store snapshots every 6h for timeline visualization

2. **Business Resumption** (`business-resumption.ts`)
   - Data: Manual reports from business owners (opt-in survey)
   - Classification: Essential (grocery, pharmacy, fuel), commercial (retail), office
   - Tracking: % of each category reopened by day post-event
   - Output: "45% essential, 20% commercial, 5% office resumed (T+7 days)"
   - Confidence: Based on survey response rate (mark as provisional if <20% responses)

3. **Displacement Census** (`displacement-census.ts`)
   - Data: Shelter occupancy reports (from shelter managers)
   - Calculation: Sum occupancy across all shelters, compare to estimated displaced
   - Output: "8,500 people in shelters (peak), declining to 2,000 by Day 14"
   - Segmentation: Show by shelter type (emergency, community, hotel)
   - Family reunification: Percent of people reunified with families

4. **Psychological Recovery Survey** (`psychological-survey.ts`)
   - Method: Optional in-app survey (5 Likert questions, takes 2 min)
   - Questions: Safety concern, stress level, support access, food/water security, housing
   - Sampling: 2-3% of population (incentivize with donation matching)
   - Output: Anonymized aggregate (no individual-level data retained)
   - Use: Inform community mental health resource deployment

**Database Schema:**
```sql
TABLE community_metrics (
  id UUID PRIMARY KEY,
  event_id UUID,
  metric_timestamp TIMESTAMP,
  metric_type VARCHAR(50), -- 'power_pct','water_pct','gas_pct','business_reopened','displaced'
  value FLOAT,
  confidence FLOAT, -- If calculated from sample, confidence <1.0
  source VARCHAR(50), -- 'utility_scada','survey','shelter_report','manual'
  notes TEXT,
  INDEX (event_id, metric_type, metric_timestamp DESC)
);

TABLE psychological_survey_responses (
  id UUID PRIMARY KEY,
  event_id UUID,
  respondent_id UUID, -- Hashed, no real identity retained
  survey_timestamp TIMESTAMP,
  q1_safety_concern INT, -- 1-5 Likert scale
  q2_stress INT,
  q3_support_access INT,
  q4_food_water_security INT,
  q5_housing INT,
  INDEX (event_id, survey_timestamp)
);
```

**API Endpoints:**
- `GET /api/v1/events/{eventId}/community-metrics` — Current + historical
- `POST /api/v1/psychological-survey` — User submits optional survey
- `GET /api/v1/events/{eventId}/displacement-census` — Shelter status summary

**Public Visibility (V2+):**
- Dashboard showing trends: Power/water/gas restoration curve
- Business reopening: % resumed by category + time since event
- Displacement trend: People in shelters declining over time
- (Psychological metrics: aggregate only, no individual data)

---

### Block F: Lessons Learned & Model Validation

**Purpose:** Compare model predictions to actual outcomes; generate improvement data.

**Key Components:**

1. **Prediction vs. Outcome Comparison** (`prediction-outcome-compare.ts`)
   - Comparison data:
     - Wildfire: Predicted extent vs. burned area scar (USGS BARC)
     - Flood: Predicted inundation vs. observed water extent (satellite SAR)
     - Earthquake: Predicted shaking intensity vs. reported damage + ShakeCast
     - Tornado: Predicted track vs. actual damage swath
   - Metrics: Precision (false alarms), recall (missed areas), F1 (harmonic)
   - Target accuracies (from validation.md): Wildfire 87% F1, Flood 82%, Earthquake 95%

2. **Lead Time Analysis** (`lead-time-analyzer.ts`)
   - Definition: Minutes between hazard alert and actual impact onset
   - Calculation: Alert time - impact time (from witness reports, sensor data)
   - Stratify by: Hazard type, geog region, population density
   - Output: Histogram + percentiles (e.g., "Wildfire: median 47 min lead time")
   - Use case: Validate evacuation time assumptions

3. **Confidence Calibration** (`confidence-calibration.ts`)
   - Definition: Actual outcome rate at different confidence levels
   - Expected: 80% confident alerts should have 80% positive outcome rate
   - Calculation: Bin alerts by confidence (0-20%, 20-40%, ..., 80-100%), compute outcome%
   - Output: Calibration curve (predicted vs. actual)
   - Action: If miscalibrated, retrain model with different threshold

4. **User Feedback Collection** (`user-feedback-collector.ts`)
   - Surveys distributed: Post-event (T+7 days)
   - Questions:
     - Evacuation: Did you receive alert? Did you evacuate? Was timing adequate?
     - App usability: Easy to understand map? Routes helpful? Notifications clear?
     - Safety: Did you feel safe following Beacon recommendations?
   - Response rate target: 10-20% (incentivize with donation matching)
   - Output: Aggregate feedback report (NPS, satisfaction by question)

5. **Lessons-Learned Report** (`lessons-learned-report.ts`)
   - Components:
     - Event timeline: T0 trigger, escalations, key decisions
     - Model performance: Accuracy metrics vs. targets
     - Operational challenges: Where did response get stuck, why
     - False alerts: Any spurious predictions, root cause
     - Recommendations: Model tuning, procedure changes, training needs
   - Author: Module lead (with input from EMS, data scientists)
   - Distribution: Internal only (FEMA upon request)

**Database Schema:**
```sql
TABLE validation_metrics (
  id UUID PRIMARY KEY,
  event_id UUID,
  hazard_type VARCHAR(50),
  metric_type VARCHAR(50), -- 'precision','recall','f1','lead_time','calibration'
  value FLOAT,
  details JSONB, -- Flexible per metric (e.g., binned confidence for calibration)
  computed_at TIMESTAMP,
  INDEX (event_id, hazard_type, metric_type)
);

TABLE lessons_learned_report (
  id UUID PRIMARY KEY,
  event_id UUID,
  created_by_id UUID,
  created_at TIMESTAMP,
  title VARCHAR(200),
  summary TEXT,
  challenges TEXT,
  recommendations TEXT,
  attachments JSONB, -- [{'name': 'metrics.csv', 'url': 's3://...'}]
  status VARCHAR(50), -- 'draft','final','archived'
  INDEX (event_id, created_at DESC)
);

TABLE user_feedback (
  id UUID PRIMARY KEY,
  event_id UUID,
  respondent_id UUID, -- Hashed
  survey_timestamp TIMESTAMP,
  q_received_alert BOOLEAN,
  q_evacuated BOOLEAN,
  q_timing_adequate BOOLEAN,
  q_app_easy BOOLEAN,
  q_felt_safe BOOLEAN,
  nps_score INT, -- -100 to +100
  free_text TEXT,
  INDEX (event_id, survey_timestamp)
);
```

**API Endpoints:**
- `GET /api/v1/events/{eventId}/validation-report` — Full metrics report
- `GET /api/v1/events/{eventId}/lessons-learned` — Narrative report
- `POST /api/v1/user-feedback` — Submit post-event survey
- `GET /api/v1/events/{eventId}/user-feedback-summary` — Aggregate responses

**Report Distribution:**
- Internal: Module lead, Agentic Planners (for model retraining)
- External: FEMA (if requested for policy analysis)
- Public (anonymized): Trends only (no event-specific details)

---

## 5. Employee Interface Needs

### 5.1 EMS Admin Dashboard (`/admin/dashboard/modules/post-ops`)

**Views:**
1. **Damage Assessment Map**
   - Interactive map (mapbox-gl) showing damage polygons (color-coded 0-5 score)
   - Filter: By source (LiDAR, satellite, doorbell), by confidence, by damage level
   - Drill-down: Click polygon → view source images, confidence breakdown
   - Actions: Approve/reject assessment, request adjuster review
   - Export: PDF damage report, GeoJSON for external sharing

2. **Recovery Resources Dashboard**
   - Two-column layout: Resource list (left), map (right)
   - Resource types: Shelters, supply points, volunteer crews, contractors
   - Metrics: Shelter occupancy %, supply inventory, crew location, repair progress
   - Filters: Resource type, status (operational/impaired/offline), needs (critical supply shortage)
   - Actions: Update status, request additional resources, assign volunteers

3. **Infrastructure Status Board**
   - Timeline: Horizontal chart showing power/water/gas restoration over time
   - Current state: % operational for each utility, by district
   - ETAs: Next milestone (90%, 100%) with confidence intervals
   - Crews: Active repair crews on map, assigned tasks
   - Requests: Pending resource requests (prioritized list)
   - Actions: Approve resource request, coordinate mutual aid

4. **FEMA Form Management**
   - Form list: All damage properties awaiting form submission
   - Status: Draft, ready for submission, submitted, approved
   - Adjuster view: Flagged for damage score adjustment
   - Export: Batch submit to FEMA (validate first)
   - Download: PDF damage report for each property

5. **Community Recovery Metrics**
   - KPI dashboard: Power %, water %, gas %, shelter occupancy, business reopened %
   - Trend graph: Stacked area chart showing 6h snapshots
   - Comparison: "Recovery on track vs. similar events" benchmark
   - Drill-down: Click metric → underlying data (utility reports, shelter counts)

6. **Lessons Learned & Validation**
   - Report: Auto-generated (T+30 days post-event)
   - Sections: Event timeline, model accuracy (table), operational challenges (text), recommendations
   - Approval: Module lead reviews, signs off
   - Export: PDF for FEMA submission

### 5.2 Role-Based Access Control

| Role | Damage Assess | Recovery Res | Infrastructure | FEMA Form | Metrics | Lessons Learned |
|------|---|---|---|---|---|---|
| EMS Lead | Full | Full | Full | Full (approver) | Full | Full |
| EMS Staff | Read-only | Update resource status | Read-only | View only | Read-only | Read-only |
| Insurance Adjuster | Review + adjust score | Read-only | Read-only | Full (form fill) | Read-only | None |
| Utility Chief | Read damage | Read | Full (own utility) | None | Read | Read-only |
| Data Analyst | Read | Read | Read | None | Full | Full |
| Module Lead | Full | Full | Full | Full | Full | Full (author) |

### 5.3 Recommended UI Components

**Damage Assessment Map:**
- Library: Mapbox GL JS (geospatial performance)
- Controls: Slider for damage score filter (0-5), checkbox for source type, opacity slider
- Legend: Color ramp (green=0, yellow=1-2, orange=3-4, red=5)
- Tooltip: Hover polygon → show score, confidence, source, imagery
- Click action: View source images in modal, approve/reject button

**Recovery Resources Heatmap:**
- Show shelter occupancy as circles (size = capacity, color = % full)
- Show supply points as markers (icon = resource type)
- Show crews as animated icons moving toward task location
- Time-range slider: Show historical positions (replay resource movement)

**Infrastructure Timeline:**
- Stacked bar chart: Power/water/gas % recovered on Y axis, days post-event on X
- Milestone markers: Alert when 50%, 90%, 100% reached
- Annotations: EMS can add notes (e.g., "Storm damaged transformer on Main St")

**FEMA Form Builder:**
- Multi-step form: Property location → damage assessment → form fields
- Auto-fill: Pull location, damage score, owner contact from database
- Validation: Check required fields, flag inconsistencies
- Preview: Show completed form PDF before submission
- Batch action: Select multiple forms, submit all at once

**Community Metrics Dashboard:**
- KPI cards: Large number + trend arrow (↑/↓) for power/water/gas/occupancy/%
- Sparkline: Tiny 7-day trend chart within each card
- Table: Detailed metrics (shelter name, current occupancy, capacity, address)
- Export: Download metrics history as CSV

### 5.4 Key Workflows

**Workflow 1: Damage Assessment Review & FEMA Submission**
1. EMS lead opens Damage Assessment Map
2. Filters: Show low-confidence assessments (<70%)
3. Reviews each: Looks at source images, compares to satellite/doorbell
4. Actions: Approves assessment or requests adjuster review
5. Once approved: Automatically populates FEMA IA form
6. EMS lead navigates to FEMA Form Management
7. Review form: Verify all fields, approve
8. Batch submit: Select 50 properties, click "Submit to FEMA"
9. Confirmation: System shows submission receipt + tracking ID

**Workflow 2: Recovery Resource Allocation**
1. EMS staff opens Recovery Resources Dashboard
2. Sees shelter occupancy: Shelter A at 85%, Shelter B at 40%
3. Sees pending request: "Need 100 cots and 50 blankets"
4. Can see available: "Red Cross warehouse has 200 cots available"
5. Actions: Requests delivery (creates task for volunteer coordinator)
6. Updates: Watches resource movement on map as delivery happens
7. Completion: Volunteer crew updates task completion, cots delivered to Shelter A

**Workflow 3: Infrastructure Restoration Coordination**
1. EMS lead opens Infrastructure Status Board
2. Current state: 67% power, 95% water, 31% gas
3. Notices: Water is ahead of schedule, gas behind
4. Clicks gas restoration: Shows crews on map, current repair locations
5. Sees pending request: "Need 20 workers for line excavation"
6. Actions: Approves request, coordinator assigns workers from emergency labor pool
7. Follows up: 6 hours later, gas % increases to 38%, ETA updated

**Workflow 4: Model Validation & Retraining Decision**
1. T+30 days post-event, module lead generates Lessons Learned report
2. System auto-calculates: Wildfire model predicted 95K acres, actual burn 91K acres
3. Precision 89% (good), Recall 87% (target was 90%)
4. Lead time: Median 42 minutes (target 4+ hours) — good warning
5. Confidence calibration: Model said 85% confident, actual outcome rate 82% (calibrated)
6. False alerts: 3 predicted fires that didn't ignite (0.3% false alarm rate, target <1%)
7. Conclusion: Model performing within spec, proceed with current version
8. Report approved, submitted to FEMA for policy analysis

---

## 6. Database Schema & Detailed Design

(See schemas embedded in each development block above — this section serves as index)

Key tables:
- `events_post_ops` — Event metadata for post-ops phase
- `damage_assessments` — Damage polygons + scores
- `infrastructure_status` — Utility restoration progress
- `recovery_resources` — Shelters, supplies, crews
- `validation_metrics` — Model accuracy + lead time
- `lessons_learned_report` — Post-event review narrative
- `fema_form_exports` — Generated forms for submission

All tables include `event_id` for event filtering and `created_at`/`updated_at` for audit.
Key indexes on: (event_id, timestamp), (event_id, status), (geometry USING GIST) for spatial queries.

---

## 7. API Endpoints (RESTful Contract)

### Damage Assessment
```
POST /api/v1/events/{eventId}/damage-assessment/trigger
GET /api/v1/events/{eventId}/damage-assessment
GET /api/v1/events/{eventId}/damage-assessment/status
PATCH /api/v1/damage-assessments/{assessmentId}/verify
GET /api/v1/events/{eventId}/damage-report (PDF)
```

### Recovery Resources
```
GET /api/v1/events/{eventId}/recovery-resources
PATCH /api/v1/recovery-resources/{resourceId}/update
POST /api/v1/resource-requests
PATCH /api/v1/resource-requests/{requestId}/assign
```

### Infrastructure
```
GET /api/v1/events/{eventId}/utility-status
PATCH /api/v1/utility-status/{statusId}
GET /api/v1/events/{eventId}/restoration-timeline
POST /api/v1/infrastructure-repairs
```

### FEMA Forms
```
POST /api/v1/fema-forms/generate
GET /api/v1/fema-forms/{formId}
PATCH /api/v1/fema-forms/{formId}/adjust
POST /api/v1/fema-forms/{formId}/submit
```

### Community Metrics
```
GET /api/v1/events/{eventId}/community-metrics
POST /api/v1/psychological-survey
GET /api/v1/events/{eventId}/displacement-census
```

### Validation & Lessons Learned
```
GET /api/v1/events/{eventId}/validation-report
GET /api/v1/events/{eventId}/lessons-learned
POST /api/v1/user-feedback
GET /api/v1/events/{eventId}/user-feedback-summary
```

All endpoints require OAuth2 token + role-based permission check.
Error responses: 400 (validation), 401 (auth), 403 (permission), 404 (not found), 500 (server error)
Rate limits: 100 req/min per user per endpoint

---

## 8. Implementation Timeline & Effort

**Total Effort:** 6-8 months (3-5 FTE engineers)

| Phase | Duration | Blocks | Deliverables |
|-------|----------|--------|--------------|
| Month 1-2 | Foundation | A (infra) | LiDAR reprojection, CV classifier training setup |
| Month 2-3 | MVP | A, C, F | Damage assessment, FEMA forms, validation baseline |
| Month 3-4 | Operations | B, D | Recovery resources, infrastructure tracking |
| Month 4-5 | Integration | E | Community metrics dashboard |
| Month 5-6 | Polish | All | UI refinement, documentation, testing |
| Month 6-8 | Hardening | All | Security audit, load testing, FEMA compliance |

---

## 9. Success Metrics

- Damage assessment accuracy: >87% F1 (vs. manual adjuster review)
- FEMA form error rate: <1% (forms accepted on first submission)
- Recovery resource utilization: >70% of allocated resources reach intended destination
- Model validation complete: <30 days after event closed
- EMS user satisfaction: >4/5 on usability survey
- Cost savings: Demonstrate >$50M in faster resource allocation efficiency per event

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| LiDAR unavailable (clouds, cost) | Fallback to satellite-only (lower accuracy) | Medium | Pre-cache LiDAR, budget for new acquisition |
| Ring API access denied (privacy concern) | Lose doorbell street-level view | Medium | Negotiate partnership, pre-build satellite-fallback |
| Utility SCADA security blocks API | Can't track real-time restoration | Low | Work with utilities pre-event, certify mTLS |
| Damage classifier overfits to training region | Poor accuracy in new geographies | Medium | Validate on 3+ diverse regions during training |
| FEMA form schema changes mid-year | Forms break on new event | Low | Monitor FEMA updates, CI/CD automated testing |
| Volume surge (1M properties to assess) | System overload, delays | Low | Pre-provision GPU capacity, auto-scale |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Owner:** Post-Operations Module Lead
**Status:** Ready for Development
