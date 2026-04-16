# Event Triggers Module — Complete Development Documentation

## 1. Module Metadata

**Team:** Event Triggers Architecture & Hazard Detection

**Parent Module:** Beacon Emergency Management Platform

**Sub-Modules:**
1. Sensor Detection (automatic_sensor_based_hazard_detection)
2. Device-Driven Triggers (device_driven_triggers)
3. User Sighting-Based Triggers (user_sighting_based_triggers)
4. EMS Declaration (ems_declaration)
5. Official Source Declaration (official_source_declaration)

**Goal:** Detect and declare emergency events through 5 trigger sources, converting risk into actionable emergencies.

**Mission Alignment:** Recognize hazards at the moment they occur, trigger coordinated emergency response, and minimize response delay between detection and declaration.

**Owner:** Hazard Detection Lead (contact team lead for assignment)

---

## 2. Overview & Context

Event Triggers is Beacon's hazard detection layer — the point where potential risk becomes declared reality. The module continuously monitors 5 independent trigger sources and routes confident detections through validation, approval, and publication to EMS and public users.

When a hazard is detected:
1. Trigger fires (automatic sensor, device, sighting, EMS manual, or official source)
2. Analysis agent validates detection against multiple data sources
3. Module lead approves for publication (or suppresses if false alarm)
4. Event declared, all dependent modules activated (notifications, evacuation routing, map layers)
5. Immutable audit log created for post-event analysis and regulatory reporting

All trigger types feed into the Event Declaration pipeline (37_event_protocols). Timing is critical: minutes matter in evacuation. The module is designed for speed, confidence, and human oversight.

---

## 3. Trigger Source Types

### 3.1 Automatic Sensor-Based Hazard Detection

Real-time feeds from government sources, commercial satellite data, and IoT networks.

**Government Sources:**
- USGS Earthquake (magnitude, depth, location) — 1-2 min latency
- USGS Water Resources (stream gauge readings) — 15 min latency
- NWS Alerts (tornado watch/warning, flood watch/warning) — 30-60 sec latency
- NOAA NEXRAD Radar (rotation signatures, precipitation) — 5 min latency
- NWS MRMS (severe weather) — 2 min latency
- NOAA GOES Satellite (fire hotspots, cloud-top temps) — 5-15 min latency
- SPC Storm Prediction Center (outlooks, mesocyclone detection) — 30 min to 3 days

**Satellite & Remote Sensing:**
- Sentinel-2 (wildfire hotspot clustering, flood extent) — 3-5 day revisit
- FIRMS (MODIS hotspots) — 3-4 hour latency
- Sentinel-1 SAR (flood water detection) — 6-12 day revisit

**IoT & Private Networks:**
- Ring doorbell network (visual fire confirmation) — 30-60 sec latency if user subscribes
- Environmental sensor networks (air quality PM2.5, CO) — real-time with device coverage
- Stream gauge networks (private, citizen-deployed) — variable latency

**Detection Algorithms per Hazard:**

| Hazard | Sensor Type | Algorithm | Confidence Threshold | Publication Threshold |
|--------|-------------|-----------|----------------------|----------------------|
| Wildfire | FIRMS hotspots | Clustering (3+ hotspots within 1km) + burned-area check | >60% | >70% + affected area >50 people |
| Flood | Stream gauge | 90th percentile exceedance, rate of rise (dh/dt) | >65% | >65% + affected area >30 people |
| Earthquake | USGS ShakeAlert | P-wave arrival + ground motion estimate | 100% (authoritative) | USGS confirmed, mag >3.5 |
| Tornado | NWS/Radar | Mesocyclone detection, velocity couplet (±30 kt) | >80% (NWS issued) | NWS warning issued |
| Tsunami | DART buoys | Amplitude anomaly detection, coastal model | >70% | Physics-based run-up >1m |
| Landslide | Post-earthquake + rainfall | Newmark displacement, slope stability | >65% | High hazard zone + slope >30° |
| Hurricane/Typhoon | NHC track | Automated track ingestion from NHC | 100% (authoritative) | Cat >1 or NHC warning issued |
| Air Quality | EPA/AirNow | PM2.5 >150 μg/m³ (unhealthy) | >75% | >75% + affected area >100 people |
| Wind | NEXRAD/GOES | Max sustained wind >50 mph derived | >70% | >70% + duration expectation |
| Extreme Heat | Temperature models | WBGT >35°C (very high risk) | >60% | >60% + duration >4 hours |

**Ring Doorbell Integration:**
- Visual fire confirmation for areas with Ring coverage (suburban/urban)
- User can opt into "emergency analytics" to allow auto-analysis of doorbell video during declared events
- Confidence boost if Ring detects fire AND satellite confirms hotspot
- Privacy: all video processed on-device; only binary (fire/no-fire) sent to Beacon servers

---

### 3.2 Device-Driven Triggers

Continuous sensor streams from user devices (phones, watches, wearables).

**Sensor Types:**
- Accelerometer (earthquake, building collapse, vehicle crash impact)
- Barometric pressure (tornado/hurricane, rapid pressure drop)
- Audio signatures (explosion, siren, glass breaking)
- Gyroscope (falling, tumbling motion)
- Light sensor (sudden darkness from explosion/debris)

**Detection Thresholds:**

| Event | Sensor | Trigger Condition | Signal to Noise | User Confirmation |
|-------|--------|------------------|-----------------|-------------------|
| Earthquake (P-wave) | Accelerometer | a > 0.3g, frequency 1-4 Hz | <30 sec signal | Not required (network auto-confirms) |
| Tornado (pressure) | Barometer | ΔP < -5 mb in <5 min | Low (atmospheric variability) | SOS button strongly suggested |
| Explosion | Audio + Accel | Combined: >120 dB + a > 1g | High | SOS button strongly suggested |
| Building collapse | Accel + audio | Sustained vibration + low-freq rumble | Medium | Not required (impact signature clear) |
| Vehicle crash | Accel + gyro | a > 2g + flip detection | Medium | Optional (crash detection obvious) |

**Device Network Requirements:**
- Always-on accelerometer monitoring (low power: 10 Hz sampling, bandpass 1-10 Hz)
- Barometer monitored continuously (1 Hz sampling)
- Audio classification running on-device (TFLite model, <50 MB, confidence >85%)
- Requires device OS support (iOS 14+, Android 8+)

**Data Handling:**
- Device detections sent to Beacon only if confidence >threshold
- Aggregation: If >5 devices detect same event within 1km, radius auto-triggers event
- Privacy: Device sensor data NOT stored; only event triggers + aggregated counts sent
- Opt-in: Users can disable device triggers in preferences (default: enabled)

---

### 3.3 User Sighting-Based Triggers

Crowdsourced hazard reports from public users.

**Sighting Types:**

| Hazard | Report Type | Threshold | Verification | Confidence Calculation |
|--------|-------------|-----------|--------------|----------------------|
| Wildfire | Photo + location + narrative | 3 independent reports within 5km | Satellite hotspot check, false-positive filter | Base 40% per report; +20% if photo clear; +25% if satellite confirms |
| Flood | Photo + water level + narrative | 3 reports within 2km | Stream gauge check, elevation validation | Base 35% per report; +20% if photo clear; +30% if gauge confirms |
| Tornado | Photo + location + narrative | 2 reports within 2km | Radar rotation check, spotter verification | Base 45% per report; +35% if verified spotter (trained); +25% if radar confirms |
| Damage/Collapse | Photo + location + severity | 2 reports within 2km | Satellite change detection, structural engineer if >5 buildings | Base 50% per report; +25% if satellite change detected |
| Landslide | Photo + location + narrative | 2 reports within 3km | Elevation check, post-earthquake timing | Base 30% per report; +40% if post-earthquake; +25% if road closure matches |

**Sighting Collection UI:**
- 1-tap sighting report (hazard type, location auto-filled, brief text optional)
- Photo upload (optional, but +20% confidence if provided)
- Narrative (280 char max, focus on observable facts: "flames visible 1 mile south")
- User verification status shown (verified spotter, emergency responder, public user)

**False-Positive Mitigation:**
- Linguistic filter removes non-hazard keywords (campfire, controlled burn, steam)
- Temporal filter: Reports >4 hours old auto-downweight (information entropy)
- User reputation tracking (spotter accuracy over time)
- Automated contradiction detection: If sighting contradicts satellite or official source, confidence reduced by 50%
- Manual review flag: >10 sightings same area in <1 hour → auto-review by analysis agent

**Confidence Floor:**
- Single sighting = max 40% confidence (not sufficient for automatic event)
- 2-3 sightings = 60-75% confidence (triggers analysis agent review)
- 4+ sightings = >75% confidence (triggers preliminary alert to EMS, still needs module lead approval)

---

### 3.4 EMS Declaration

Manual event declaration by emergency management personnel.

**Initiators:**
- EMS Admin (EA): Full event creation, override auto-suppression
- EMS Team Member (ET): Can report condition but requires EA approval to declare
- Dispatch (DI): Can request event but requires EA approval
- Module Lead (BE): Can force suppress auto-triggered events (with 24-hr audit trail)

**Declaration Workflow:**
1. EMS opens "Declare Event" form (available 24/7)
2. Selects hazard type (wildfire, flood, earthquake, tornado, etc.)
3. Draws affected area polygon or enters coordinates
4. Provides narrative (optional, max 500 char: "Confirmed structure fire, multi-building complex, heavy smoke visible")
5. Attaches evidence (optional: photos, 911 call, SAR data)
6. System auto-estimates affected population + evacuation zone
7. Module lead notified; event goes live after approval (or immediately if override flag used)
8. Immutable audit log created with timestamp, declarer ID, justification

**Escalation on Suppression:**
- If EMS declares event and module lead suppresses within 15 minutes, CTO is notified
- CTO can override suppression if it appears to hide legitimate hazard
- If CTO overrides, declarer receives notification + module lead placed on alert

---

### 3.5 Official Source Declaration

Automated ingestion and routing of government-issued emergency information.

**Official Sources:**

| Source | Protocol | Data Format | Update Frequency | Trust Level |
|--------|----------|-------------|------------------|-------------|
| USGS ShakeAlert | Real-time API | JSON (magnitude, depth, location, ground motion) | <5 sec from earthquake | Authoritative |
| NWS | IPAWS / CAP XML | CAP v1.2 (polygon, severity, urgency, onset/expires, headline, instruction) | 2-30 min (varies by alert type) | Authoritative |
| NOAA NWS | Marine product feed | ATCF format (hurricane track, intensity, forecast) | 3-6 hourly | Authoritative |
| EPA AirNow | REST API | JSON (AQI, pollutant, station location) | 1 hour latency | Authoritative |
| USGS Water Resources | WATERDATA API | JSON (stream gauge reading, flow rate, stage) | 15 min latency | Authoritative |

**CAP XML Parsing (NWS):**
```xml
<alert>
  <identifier>USDC20240315T1430Z-W44120</identifier>
  <areaDesc>King County, WA</areaDesc>
  <severity>Extreme</severity>
  <urgency>Immediate</urgency>
  <event>Tornado Warning</event>
  <effective>2024-03-15T14:30:00Z</effective>
  <expires>2024-03-15T15:30:00Z</expires>
  <instruction>Seek shelter immediately in interior room on lowest floor</instruction>
  <area>
    <polygon>47.12,-122.34 47.14,-122.36 47.13,-122.38</polygon>
  </area>
</alert>
```

**Automatic Publication:**
- NWS Tornado Warning → immediate publication (no approval needed, USGS authority)
- NWS Tornado Watch → published as Level 3 (Watch) alert, no event declaration yet
- NWS Flood Warning → published + event auto-declared if threshold met
- USGS Earthquake M>4.0 → immediate publication as Level 5 (Emergency) if affecting US
- EPA AirNow AQI >150 → published as Level 3 (Advisory), event declared if >100K people affected

**Deduplication & Conflict Resolution:**
- Alert matched by (areaDesc, severity, hazard_type, onset_time)
- If incoming alert matches existing: update only if (severity increased OR area expanded)
- If multiple sources conflict (NWS tornado + radar shows not developing): analysis agent flags, human review
- Winner: Official government source always takes precedence over satellite/sensor data for publication

---

## 4. Event Declaration Pipeline

### 4.1 Trigger → Detection

```
Trigger Source (any of 5)
    ↓
Real-time ingest (<30 sec latency)
    ↓
Schema validation (format, geometry, timestamp)
    ↓
Automatic confidence calculation
    ↓
Meets confidence threshold?
    ├─ NO → archive, no action
    └─ YES → pass to analysis agent
```

### 4.2 Analysis & Validation

**Analysis Agent (Claude Opus):**
- Receives trigger data + confidence score
- Cross-references 3+ independent data sources (satellite, sensor, sighting, official)
- Checks for contradictions (false-positive flags)
- Estimates affected population, evacuation zones
- Confidence re-calculated: confidence_final = weighted_avg(sensor_conf, satellite_conf, sighting_conf, official_conf)
- Timeline: <5 min from trigger to validation output

**Validation Checks:**

| Check | Data Source | Logic |
|-------|-------------|-------|
| Satellite hotspot | Sentinel-2 or FIRMS | If wildfire: require visible hotspot in past 2 hours OR recent radar signature |
| Stream gauge | USGS WaterData | If flood: require gauge >80th percentile in past 1 hour |
| Radar signature | NEXRAD, MRMS | If tornado: require velocity couplet OR rotation signature in past 30 min |
| Recent earthquake | USGS | If landslide: require M>3.5 earthquake in past 7 days OR extreme rainfall in past 2 days |
| Population impact | Census + base map | Estimate affected population; flag if <10 people (likely false alarm) |
| Geographic bounds | Base map + hazard model | Ensure trigger location within plausible hazard zone for that hazard type |

**Confidence Re-weighting:**
```
confidence_final =
  0.4 * confidence_sensor +
  0.3 * confidence_satellite +
  0.2 * confidence_sighting +
  0.1 * confidence_official
```

If any single source confidence = 0 (contradiction):
```
confidence_final *= 0.5 (flag for manual review)
```

### 4.3 Module Lead Approval

**Approval Workflow:**

| Event Confidence | Auto-Publish? | Module Lead Timeline | Action |
|-----------------|--------------|---------------------|--------|
| >90% + official source | YES | 15 min to override | Event published; module lead can suppress |
| 70-90% + satellite confirm | CONDITIONAL | 5 min | Module lead must actively approve |
| 50-70% + mixed signals | NO | 5 min | Module lead decides (approve/reject/more info) |
| <50% + contradictions | NO | Manual review | Marked for human analysis; low priority |

**Module Lead Interface:**
- Dashboard shows pending approvals ranked by confidence + affected population
- 1-click approve, suppress, or request more data
- Suppress reason codes: false alarm, duplicate, jurisdiction dispute, data error, insufficient confidence
- SLA: 5 min response time during active emergencies, 15 min during normal ops
- If no response within SLA: auto-publish if confidence >75%, else escalate to CTO

### 4.4 Event Publication

**Publication Triggers:**
- Automatic: Confidence >90% + official source + no module lead override
- Manual: Module lead approves
- Forced: CTO override of suppression

**Upon Publication:**
1. Event created in database (immutable, write-once)
2. Event ID assigned (UUID, permanent)
3. All dependent modules notified via NATS pub/sub:
   - Notifications module: prepare alerts per hazard type
   - Evacuation routing: activate routes, estimate time-to-impact
   - Map layers: activate hazard-specific layers (fire extent, flood zone, etc.)
   - EMS client: send event to EMS admin dashboard + SMS alerts
   - Public users: push notifications (Level 3+)
4. Audit log entry: timestamp, trigger source, analysis confidence, publication reason
5. Event status set to ACTIVE (remains active until manually closed)

---

## 5. Consideration Framework (7 Categories)

### 5.1 Detection Accuracy

**False Negative Risk:** Undetected hazard proceeds unannounced
- Consequence: People evacuate too late or not at all; casualties increase
- Mitigation: Multiple trigger sources (if one fails, others catch it)
- Target: <2% false negative rate per hazard type

**False Positive Risk:** Non-hazard declared as event
- Consequence: Unnecessary evacuations, public distrust, resource waste
- Mitigation: Multi-source validation, confidence threshold >65%
- Target: <5% false positive rate (1 in 20 alerts is false alarm)

**Edge Cases:**
- Sensor malfunction (barometer stuck at low pressure) → blacklist device, rely on other sources
- Old data re-ingested (sighting from 4 hours ago reaches system now) → temporal weighting downranks old reports
- Regional solar storms (GPS disruption) → validate positions against mesh network, cell tower triangulation
- Cascading false positives (one false sighting spawns 5 copycats) → momentum dampening (after 3rd sighting, add 10-min cooldown before accepting new reports)

---

### 5.2 Latency & Response Time

**Critical Path:**
```
Hazard occurs (T=0)
  ↓
Sensor detects, transmits (T=+0-5 sec)
  ↓
Beacon receives, validates schema (T=+5-10 sec)
  ↓
Confidence calculation (T=+10-30 sec)
  ↓
Analysis agent review (T=+30-300 sec, ~5 min)
  ↓
Module lead approval (T=+300-600 sec, ~10 min)
  ↓
Publication, notification dispatch (T=+600-660 sec, ~11 min)
  ↓
User receives alert (T=+660-720 sec, ~12 min from hazard onset)
```

**SLA Targets:**
- Sensor → Beacon ingestion: <10 sec
- Confidence calculation: <30 sec
- Analysis agent decision: <5 min
- Module lead approval: <15 min
- Notification delivery: <2 min from publication

**P95 Latency Target:** Event publication within 15 min of hazard onset

---

### 5.3 Data Governance & Privacy

**Data Collected During Trigger:**
- Sighting report text (optional narrative)
- Sighting photo (optional, stored encrypted)
- User device sensor data (only if confidence threshold met, not stored long-term)
- Official source feeds (USGS, NWS — public data)
- Ring doorbell signal (binary fire/no-fire only, video not stored)
- GPS location of reporter (only with user consent in geofenced area)

**PII Handling:**
- Sighting reporter identity HIDDEN from event data (replaced with anonymous ID)
- User location from sighting: only area polygon shown, not individual coordinates
- 911 caller location: shown only to EMS (not public or other Beacon users unless EMS shares)
- Device sensor data: destroyed after confidence calculation (not archived)

**Retention Policy:**
- Event record: 7 years (regulatory requirement)
- Detailed trigger logs (all sensor inputs, sightings): 90 days
- Sighting photos: 7 years if published, 30 days if not published
- Device sensor time-series: 1 day (real-time only, then discarded)

**User Consent:**
- Upon app install: "Beacon may collect device sensor data (accelerometer, barometer) to detect emergencies. You can disable this anytime in Settings."
- Upon sighting report: "Your report may be attributed to you or anonymized depending on public vs. EMS visibility. Opt-in for public credit."
- Upon emergency event: "Your location during this event may be shared with EMS for rescue coordination. See privacy controls for opt-out options."

---

### 5.4 System Resilience

**Single Point of Failure Mitigation:**

| Component | Failure Mode | Fallback |
|-----------|--------------|----------|
| NATS message bus | Offline | Queue events in Redis, replay on reconnect |
| Database (PostgreSQL) | Replica lag | Accept reads from secondary, write via primary |
| Analysis agent | Slow/unresponsive | Escalate confidence check to rule-based heuristic (if 3+ sightings, auto-approve) |
| Module lead approval | All leads unavailable | Auto-publish if confidence >80% (emergency override) |
| Notification service (FCM/APNs) | Delivery failure | Fallback to SMS, then mesh broadcast |
| Sensor feed (e.g., USGS API) | Down for 1 hour | Use cached data + sighting reports only |

**Redundancy:**
- 2 independent PostgreSQL nodes (leader-follower)
- 3 NATS jetstream nodes (quorum-based)
- 2 analysis agent instances (Claude Opus + fallback heuristic)
- 3 module lead approval paths (primary contact, secondary contact, CTO override)

---

### 5.5 Integration with Hazard Models

**Trigger → Hazard Model Communication:**

```
Event declared
  ↓
NATS pub: "events.declared"
  {event_id, hazard_type, location, confidence, affected_area}
  ↓
Hazard module (wildfire, flood, etc.) subscribes
  ↓
Initializes spread model with event parameters
  ↓
Publishes predictions: "hazard.{type}.forecast"
  {perimeter, time_to_impact, affected_area, confidence}
  ↓
Event Triggers module consumes forecast
  ↓
Updates map layers, evacuation routes, notifications
```

**Feedback Loop (Post-Event):**
- After event closes, hazard model performance logged
- Accuracy metrics: did model predict extent correctly? Did lead time save lives?
- Bias detection: did model systematically under/over-predict for certain regions?
- Retraining triggers: if model accuracy <80% for past 5 events, flag for retraining

---

### 5.6 Regulatory Compliance

**Requirements Met:**

| Regulation | Requirement | Implementation |
|------------|-------------|-----------------|
| FEMA / ICS-201 | Event briefing export (incident name, start time, affected area, resources) | API endpoint `/api/v1/events/{id}/ics-export` returns GeoJSON + ICS metadata |
| Good Samaritan Law | Sighting reporters protected from liability | Legal agreement presented before publish, flag on report |
| FCC IPAWS | NWS alert integration + WEA delivery tracking | CAP XML parsing, WEA delivery status logged, SMS fallback |
| CCPA / GDPR | User location data minimization + deletion on request | After 90 days, PII fields deleted; user can request immediate deletion |
| ADA Compliance | Alerts accessible to deaf/blind users | SMS (text-based), visual + auditory alerts, web reader compatible |
| HIPAA (if health data) | Sighting health narratives encrypted + access controlled | Encrypted in transit (TLS 1.3) + at-rest (AES-256), access log kept |

---

### 5.7 Change Management & Testing

**Deployment Strategy:**

| Change Type | Rollout | Testing |
|-------------|---------|---------|
| Confidence threshold adjustment | Canary: 1% traffic for 48 hr | A/B test: compare false positive rate before/after |
| New sensor source (e.g., new hotspot detection) | Staged: 25% → 50% → 100% over 1 week | Backtest on 100 past events, must achieve 90% recall |
| UI/UX for module lead approval | Blue-green: new UI on parallel cluster | Usability test with 3 module leads, <30 sec approval time |
| Official source feed new format | Dual ingestion: old + new format simultaneously | Log both, compare, verify zero data loss |
| Analysis agent version update | Canary: 5% traffic, human review all decisions | All high-confidence (>80%) events reviewed by human for 1 week |

---

## 6. Independent Development Blocks

### Block 1: Trigger Ingestion Pipeline

**Scope:** Receive and validate data from all 5 trigger sources.

**Deliverables:**
- REST/gRPC endpoints for sensor feeds (USGS, NWS, NOAA)
- Webhook handlers for CAP XML (NWS IPAWS)
- Device SDK for accelerometer/barometer/audio streaming
- Sighting report API (`POST /api/v1/sightings`)
- EMS manual declaration form + API (`POST /api/v1/events`)
- NATS publishers for each trigger type

**Dependencies:**
- Base map data (for geometry validation)
- User accounts (for sighting attribution)
- NATS message broker

**Effort:** 4-6 weeks

---

### Block 2: Confidence Scoring Engine

**Scope:** Calculate event confidence from trigger data.

**Deliverables:**
- Confidence calculation per hazard type (wildfire, flood, tornado, etc.)
- Multi-source weighting logic
- Contradiction detection (if source A says no event, source B says yes)
- False-positive filter (linguistic, temporal, geographic)
- Confidence persistence (store historical confidence for audit trail)

**Dependencies:**
- Satellite data access (Sentinel-2, FIRMS)
- Sensor data schema
- Base map (population, hazard zones)

**Effort:** 3-4 weeks

---

### Block 3: Analysis Agent Integration

**Scope:** Claude Opus decision-making agent for validation.

**Deliverables:**
- Prompt engineering for hazard-specific analysis
- Real-time API calls to Claude Opus (with fallback heuristics)
- Caching of analysis results (avoid duplicate API calls)
- Reasoning transparency (explain to module lead why agent approved/rejected)
- Integration with external data APIs (weather, hazard models, population data)

**Dependencies:**
- Claude Opus API access + budget allocation
- Trigger ingestion pipeline
- External data sources (weather, USGS, EPA)

**Effort:** 2-3 weeks

---

### Block 4: Module Lead Approval UI

**Scope:** Dashboard for human decision-making.

**Deliverables:**
- Approval queue ranked by confidence + affected population
- Rich event preview (map, photos, sighting timeline, analysis reasoning)
- Approve/reject/request-more-info buttons
- SLA timer + escalation alert if no response
- Suppression reason codes + audit log view
- Mobile-friendly design (approval can happen on-the-go)

**Dependencies:**
- Event model + database
- Trigger ingestion pipeline
- Analysis agent output

**Effort:** 2-3 weeks

---

### Block 5: Event Publication & Notification Dispatch

**Scope:** Create event record, activate dependent modules.

**Deliverables:**
- Event creation (immutable write-once record)
- NATS pub/sub event publication (notify hazard models, notifications, routing, map layers)
- ICS/NIMS export endpoints
- Event status management (ACTIVE → CLOSED)
- Audit log creation (comprehensive event history)

**Dependencies:**
- PostgreSQL + PostGIS
- NATS message broker
- Dependent modules (notifications, routing, maps)

**Effort:** 2-3 weeks

---

### Block 6: Configuration & Threshold Tuning UI

**Scope:** Employee interface for adjusting detection parameters.

**Deliverables:**
- Threshold editor per hazard (e.g., wildfire confidence floor from 65% → 70%)
- Sensor blacklist/whitelist UI (disable faulty devices)
- False-positive filter tuning (temporal decay, momentum dampening)
- A/B test launcher (test new threshold on X% of traffic)
- Confidence weighting adjuster (if satellite data is unreliable in region, reduce weight)
- Rate-limit configuration (max sightings per area per hour)

**Dependencies:**
- Confidence scoring engine
- Admin authentication

**Effort:** 2 weeks

---

### Block 7: Trigger Audit & False-Positive Review System

**Scope:** Post-event analysis and quality improvement.

**Deliverables:**
- Trigger audit log viewer (timeline of all decisions for past event)
- False-positive analysis tool (which triggers were incorrect, why)
- Accuracy metrics dashboard (precision, recall, F1 per hazard)
- Retraining data export (prepare dataset for model improvement)
- Comparative analysis (how did confidence scoring perform vs. module lead decision?)

**Dependencies:**
- Event database + audit log
- Hazard model performance data
- Statistical analysis tools

**Effort:** 2-3 weeks

---

## 7. Employee Interface & Admin Dashboard Modules

### 7.1 Detection Algorithm Configuration UI

**Path:** `/admin/dashboard/modules/event-triggers/sensor-detection/config`

**Features:**
- Per-hazard confidence threshold slider (wildfire 50-90%, flood 40-80%, etc.)
- Sensor source enable/disable toggles (USGS, FIRMS, Ring, device sensors)
- Weighting adjustment sliders (how much to trust satellite vs. sighting vs. sensor)
- Geographic exception rules (e.g., "in Nevada, reduce sighting confidence by 20%")
- Test threshold button: simulate past 100 events with new thresholds, show accuracy impact
- Rollback history: revert to previous config with 1 click

**User Roles:**
- Beacon Employee (BE): Full read/write
- Module Lead: Read-only, can request change

**Data Persistence:**
- Store in `trigger_config` PostgreSQL table (versioned)
- Automatic backup before any change
- Audit log: who changed what, when, why

---

### 7.2 Threshold Tuning Dashboard

**Path:** `/admin/dashboard/modules/event-triggers/tuning`

**Features:**
- Live metrics dashboard: false positive rate (24h), false negative rate (7d), average confidence score
- Hazard-specific metrics: wildfire false positives (past 7d, count + list), flood missed events (count), tornado lead time (avg minutes from trigger to publication)
- Alert thresholds: if false positive rate >7%, panel turns red + notification sent to module lead
- Trend charts: false positive rate over past 30 days, confidence score distribution per trigger source
- Suggested tuning: "Wildfire sightings generating 8 false alarms per day. Consider raising threshold from 65% → 72%."
- A/B test launcher: "Test new flood threshold (70%) on 25% of users for 48 hours" → before/after stats

**User Roles:**
- Beacon Employee (BE): Full read/write
- Module Lead: Read-only + comment on suggestions

---

### 7.3 False-Positive Review & Feedback Loop

**Path:** `/admin/dashboard/modules/event-triggers/false-positive-review`

**Features:**
- Timeline of recent false positives (past 30 days, sortable by hazard type)
- Each false positive shows: trigger source, confidence score, sightings count, analysis reasoning, why it was published
- Feedback field: "This was a controlled burn, not wildfire. Add keyword filter: 'prescribed burn'."
- Feedback submission auto-creates issue in model improvement backlog
- Metrics: how many false positives traced to same root cause? (e.g., "Ring doorbell false positives due to sunset reflection" — 5 instances)
- Machine learning feedback loop: feed corrected labels back to linguistic filter + confidence model

---

### 7.4 Trigger Audit Log Viewer

**Path:** `/admin/dashboard/modules/event-triggers/audit-logs`

**Features:**
- Search by event ID, date range, hazard type, trigger source
- Timeline view: event trigger → confidence calculation → analysis → approval decision → publication
- Detailed view per trigger:
  - Raw sensor data (USGS reading, satellite coordinates, sighting text, etc.)
  - Intermediate confidence scores (satellite conf: 75%, sighting conf: 60%, final: 68%)
  - Analysis agent reasoning (text explanation of decision)
  - Module lead approval (timestamp, approver, reason if suppressed)
  - Post-event validation (did hazard actually occur as predicted?)
- Export options: CSV (data analyst), JSON (integration), PDF (regulatory report)

---

### 7.5 Detection Performance Metrics & Validation

**Path:** `/admin/dashboard/modules/event-triggers/performance`

**Features:**
- Metrics per hazard type (past 30 days):
  - True Positive Rate (events detected that actually occurred) — target >95%
  - False Positive Rate (non-events declared as events) — target <5%
  - F1 Score (harmonic mean of precision + recall) — target >0.90
  - Lead Time (minutes from hazard onset to publication) — target <15 min, median
  - Detection latency (sensor → approval) — target <10 min, p95
- Comparison view: this month vs. last month, this region vs. statewide
- Accuracy by trigger source: which trigger type (sensor vs. sighting) is most accurate?
- Breakdown by false positive root cause:
  - Sensor malfunction (10%)
  - Linguistic confusion (controlled burn vs. wildfire) (35%)
  - Stale data re-ingested (5%)
  - Other (50%)

---

### 7.6 Ring Doorbell Integration Management

**Path:** `/admin/dashboard/modules/event-triggers/ring-integration`

**Features:**
- Ring network coverage heatmap (which neighborhoods have doorbell coverage)
- Video analytics model version + accuracy (fire detection: 94% accuracy on test set)
- Opt-in rate by region (what % of Ring owners enrolled in Beacon analytics)
- Recent fire detections from Ring (past 7 days, timestamp + location + confidence + whether published as event)
- Privacy audit: verify no raw video stored on Beacon servers (only binary fire/no-fire sent)
- Rate limiting: if Ring detections > 5/day in one area, investigate potential sensor malfunction

---

### 7.7 Official Source Feed Health

**Path:** `/admin/dashboard/modules/event-triggers/official-sources`

**Features:**
- Status per official source: USGS (green = healthy), NWS (green), NOAA (yellow = 30-min latency), EPA (green)
- Feed latency charts (X-axis: time, Y-axis: minutes from event occurrence to data arrival)
- Alert ingestion volume: NWS alerts (past 24h: 156 alerts), USGS earthquakes (5), NOAA NHC updates (12)
- Parsing errors log: if CAP XML malformed, log error + auto-escalate to Beacon team
- Duplicate detection: if same NWS alert received multiple times, log as audit (prevents double-publication)
- Scheduled maintenance calendar: "USGS API maintenance window Thu 2-4am UTC — expected 30-min data gap"

---

### 7.8 Device Sensor Network Health

**Path:** `/admin/dashboard/modules/event-triggers/device-sensors`

**Features:**
- Active device count (phones currently streaming accelerometer/barometer/audio)
- Sensor malfunction detection: if barometer consistently reads <900 mb (impossible), flag device + disable
- Geographic coverage heatmap: where are devices concentrated? (identify blind spots)
- Sensor type breakdown: X accelerometers, Y barometers, Z audio classifiers
- Model performance per sensor type: audio model (93% accuracy on explosion detection), accelerometer model (97% on earthquake P-wave)
- User opt-out rate tracking (if >5% of users disable device sensors, investigate privacy concern)

---

### 7.9 Sighting Report Quality Metrics

**Path:** `/admin/dashboard/modules/event-triggers/sightings`

**Features:**
- Sighting volume (past 24h: 1,247 reports, avg 52/hour)
- Report quality breakdown: photos attached (45%), narrative provided (78%), verified user (12%)
- User reputation dashboard: top spotters (verified accuracy >90%), flagged reporters (accuracy <50%, auto-downweight)
- Contradiction analysis: sightings claiming NO fire where satellite shows hotspot (contradiction rate: 3.2%)
- Temporal patterns: sighting velocity (time from event occurrence to first report) — median 12 minutes
- Geographic bias: which regions over/under-report? (adjust confidence per region accordingly)

---

## 8. Database Schemas

### 8.1 Core Event Table

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,

  -- Event metadata
  hazard_type VARCHAR(50) NOT NULL, -- 'wildfire', 'flood', 'tornado', etc.
  jurisdiction_id UUID, -- FIPS code or local jurisdiction ID

  -- Trigger source
  trigger_source VARCHAR(50) NOT NULL, -- 'sensor', 'device', 'sighting', 'ems_declaration', 'official'
  trigger_id UUID, -- foreign key to specific trigger record

  -- Event location
  centroid GEOMETRY(Point, 4326),
  affected_area GEOMETRY(Polygon, 4326), -- evacuation zone or hazard extent
  affected_population_estimate INT,

  -- Confidence & approval
  initial_confidence DECIMAL(3,2), -- 0.00-1.00
  final_confidence DECIMAL(3,2),
  approved_by_module_lead UUID,
  approval_timestamp TIMESTAMP WITH TIME ZONE,
  suppression_reason VARCHAR(100), -- if suppressed
  suppressed_at TIMESTAMP WITH TIME ZONE,

  -- Event status
  status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLOSED', 'CANCELED'

  -- Audit trail
  analysis_agent_reasoning TEXT,
  created_by_account_id UUID,
  last_updated_by UUID,

  INDEX idx_events_hazard_type ON events(hazard_type),
  INDEX idx_events_jurisdiction ON events(jurisdiction_id),
  INDEX idx_events_created_at ON events(created_at DESC),
  INDEX idx_events_status ON events(status),
  SPATIAL INDEX idx_events_geom ON events(affected_area)
);
```

---

### 8.2 Trigger Records (per source type)

```sql
-- Sensor-based triggers
CREATE TABLE sensor_triggers (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  trigger_time TIMESTAMP WITH TIME ZONE NOT NULL,
  source_feed VARCHAR(50) NOT NULL, -- 'USGS', 'FIRMS', 'NWS', 'NOAA', etc.

  -- Sensor data (varies by source)
  magnitude DECIMAL(3,1), -- for earthquakes
  depth_km DECIMAL(5,2),
  stream_gauge_reading DECIMAL(6,2), -- for floods
  pm25_concentration DECIMAL(6,1), -- for air quality

  -- Confidence
  raw_confidence DECIMAL(3,2),

  INDEX idx_sensor_triggers_event ON sensor_triggers(event_id),
  INDEX idx_sensor_triggers_source ON sensor_triggers(source_feed)
);

-- Device triggers
CREATE TABLE device_triggers (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  trigger_time TIMESTAMP WITH TIME ZONE NOT NULL,
  device_id VARCHAR(100), -- anonymized device ID

  sensor_type VARCHAR(50), -- 'accelerometer', 'barometer', 'audio'
  signal_value DECIMAL(8,3), -- acceleration (g), pressure (mb), or dB

  confidence DECIMAL(3,2),

  INDEX idx_device_triggers_event ON device_triggers(event_id),
  INDEX idx_device_triggers_time ON device_triggers(trigger_time DESC)
);

-- Sighting triggers
CREATE TABLE sighting_triggers (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  sighting_time TIMESTAMP WITH TIME ZONE NOT NULL,

  reporter_id UUID, -- anonymized in public view
  sighting_location GEOMETRY(Point, 4326),

  sighting_text TEXT, -- narrative, max 280 chars
  photo_url VARCHAR(500), -- encrypted URL if exists
  photo_confidence DECIMAL(3,2), -- confidence that photo shows hazard

  user_status VARCHAR(50), -- 'public_user', 'verified_spotter', 'ems_responder'

  confidence DECIMAL(3,2),

  INDEX idx_sightings_event ON sighting_triggers(event_id),
  INDEX idx_sightings_reporter ON sighting_triggers(reporter_id),
  INDEX idx_sightings_time ON sighting_triggers(sighting_time DESC)
);

-- EMS manual declarations
CREATE TABLE ems_declarations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  declaration_time TIMESTAMP WITH TIME ZONE NOT NULL,

  declared_by_ems_id UUID NOT NULL,
  narrative TEXT, -- max 500 chars
  evidence_urls TEXT[], -- photos/documents array

  override_auto_suppression BOOLEAN DEFAULT FALSE,

  INDEX idx_ems_decl_event ON ems_declarations(event_id),
  INDEX idx_ems_decl_declarant ON ems_declarations(declared_by_ems_id)
);

-- Official source declarations (USGS, NWS, etc.)
CREATE TABLE official_declarations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),

  source VARCHAR(50) NOT NULL, -- 'USGS_ShakeAlert', 'NWS_CAP', 'NOAA_NHC', etc.
  source_id VARCHAR(200), -- original alert ID from source

  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  authority_confidence DECIMAL(3,2), -- always 1.0 for official sources

  raw_data JSONB, -- CAP XML parsed as JSON, USGS API response, etc.

  INDEX idx_official_decl_event ON official_declarations(event_id),
  INDEX idx_official_decl_source ON official_declarations(source)
);
```

---

### 8.3 Audit & Approval Log

```sql
CREATE TABLE event_audit_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  event_id UUID REFERENCES events(id),

  action VARCHAR(100) NOT NULL, -- 'trigger_detected', 'confidence_calculated', 'analysis_complete', 'approved', 'suppressed', 'published'
  actor_id UUID, -- who took the action (module lead, agent, system)
  actor_type VARCHAR(50), -- 'ems_admin', 'module_lead', 'system', 'analysis_agent'

  previous_value JSONB, -- state before action (for confidence change, etc.)
  new_value JSONB, -- state after action

  notes TEXT, -- reason for action (e.g., suppression reason)

  INDEX idx_audit_log_event ON event_audit_log(event_id),
  INDEX idx_audit_log_created_at ON event_audit_log(created_at DESC),
  INDEX idx_audit_log_action ON event_audit_log(action)
);

-- Immutable append-only log (for compliance)
CREATE TABLE event_audit_log_immutable (
  LIKE event_audit_log INCLUDING ALL
) TABLESPACE archive;
-- Copy rows to immutable table after event closes
```

---

### 8.4 Trigger Configuration Table

```sql
CREATE TABLE trigger_config (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  hazard_type VARCHAR(50) NOT NULL,
  config_version INT DEFAULT 1,

  -- Confidence thresholds
  auto_publish_confidence_floor DECIMAL(3,2) DEFAULT 0.70,
  module_lead_approval_required_confidence DECIMAL(3,2) DEFAULT 0.65,
  analysis_review_required_confidence DECIMAL(3,2) DEFAULT 0.50,

  -- Source weighting (sum = 1.0)
  weight_sensor DECIMAL(3,2) DEFAULT 0.40,
  weight_satellite DECIMAL(3,2) DEFAULT 0.30,
  weight_sighting DECIMAL(3,2) DEFAULT 0.20,
  weight_official DECIMAL(3,2) DEFAULT 0.10,

  -- False positive filtering
  sighting_momentum_dampening BOOLEAN DEFAULT TRUE,
  min_sightings_for_auto_publish INT DEFAULT 4,
  temporal_decay_enabled BOOLEAN DEFAULT TRUE,
  temporal_decay_hours INT DEFAULT 4,

  -- Geographic exceptions
  regional_adjustments JSONB, -- {'region': 'Nevada', 'confidence_adjustment': -0.05}

  enabled BOOLEAN DEFAULT TRUE,
  modified_by UUID,
  modification_reason VARCHAR(200),

  UNIQUE(hazard_type, config_version),
  INDEX idx_config_hazard ON trigger_config(hazard_type),
  INDEX idx_config_enabled ON trigger_config(enabled)
);
```

---

### 8.5 TimescaleDB Time-Series (Performance Metrics)

```sql
CREATE TABLE trigger_metrics (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,

  -- Counts
  total_triggers INT,
  auto_published INT,
  module_lead_approved INT,
  module_lead_rejected INT,
  false_positives INT,
  false_negatives INT,

  -- Latencies (milliseconds)
  trigger_to_publication_ms INT,
  analysis_agent_latency_ms INT,
  module_lead_approval_latency_ms INT,

  -- Confidence stats
  avg_confidence DECIMAL(3,2),
  median_confidence DECIMAL(3,2),
  min_confidence DECIMAL(3,2),
  max_confidence DECIMAL(3,2),

  metadata JSONB
);

SELECT create_hypertable('trigger_metrics', 'time', if_not_exists => TRUE);
CREATE INDEX idx_trigger_metrics_hazard_time ON trigger_metrics (hazard_type, time DESC);
```

---

## 9. API Endpoints

### 9.1 Trigger Ingestion

```
POST /api/v1/triggers/sensor
Body: {
  source: "USGS" | "FIRMS" | "NWS" | "NOAA" | "EPA",
  hazard_type: "wildfire" | "flood" | "tornado" | etc.,
  confidence: 0.65,
  data: { ... source-specific data ... }
}
Response: { trigger_id, event_id (if auto-published), confidence }
```

```
POST /api/v1/triggers/device
Body: {
  device_id: "anonymized_device_uuid",
  sensor_type: "accelerometer" | "barometer" | "audio",
  signal_value: 0.45,
  latitude, longitude,
  confidence: 0.73
}
Response: { trigger_id, event_id (if threshold met), aggregation_count }
```

```
POST /api/v1/sightings
Body: {
  hazard_type: "wildfire",
  location: { lat, lon },
  narrative: "Flames visible 1 mile south",
  photo_base64: (optional),
  user_verification_status: "verified_spotter" | "public_user"
}
Response: { sighting_id, confidence_contributed, event_created (if threshold met) }
```

```
POST /api/v1/events/declare
Auth: EMS Admin required
Body: {
  hazard_type: "wildfire",
  area_polygon: [ [lat, lon], ... ],
  narrative: "Confirmed structure fire, multi-building complex",
  evidence_urls: [ ... ],
  override_suppression: false
}
Response: { event_id, status, affected_population_estimate }
```

### 9.2 Module Lead Approval

```
GET /api/v1/approvals/pending
Auth: Module lead required
Response: [
  {
    event_id,
    hazard_type,
    confidence,
    trigger_source,
    affected_population,
    location,
    analysis_reasoning,
    created_at
  }
]

POST /api/v1/approvals/{event_id}/approve
Auth: Module lead required
Response: { event_id, status: "PUBLISHED", notification_sent_count }

POST /api/v1/approvals/{event_id}/suppress
Auth: Module lead required
Body: { reason: "false_alarm" | "duplicate" | "data_error", notes: "..." }
Response: { event_id, status: "SUPPRESSED", escalated_to_cto: bool }
```

### 9.3 Event Query & Audit

```
GET /api/v1/events/{event_id}
Response: {
  id, hazard_type, status, created_at, closed_at,
  affected_area, affected_population,
  trigger_source, trigger_data,
  confidence_history: [ { time, confidence, reason } ],
  approvals: [ { timestamp, approver_id, action } ],
  audit_log: [ ... ]
}

GET /api/v1/events/{event_id}/audit-log
Response: [
  { timestamp, action, actor, previous_state, new_state, notes }
]

GET /api/v1/events/{event_id}/ics-export
Response: GeoJSON + ICS-201 metadata
```

### 9.4 Configuration & Tuning

```
GET /api/v1/config/triggers/{hazard_type}
Auth: Beacon Employee
Response: { confidence_floor, weights, exceptions, ... }

PUT /api/v1/config/triggers/{hazard_type}
Auth: Beacon Employee
Body: { confidence_floor: 0.72, ... }
Response: { config_id, version, applied_at }

POST /api/v1/config/test-threshold
Auth: Beacon Employee
Body: {
  hazard_type: "wildfire",
  new_confidence_floor: 0.75,
  backtest_days: 30
}
Response: {
  current_metrics: { fp_rate, fn_rate, f1 },
  projected_metrics_with_new_threshold: { fp_rate, fn_rate, f1 },
  recommendation: "increase" | "decrease" | "keep"
}
```

### 9.5 Performance Metrics & Audit

```
GET /api/v1/metrics/performance?hazard_type=wildfire&days=30
Response: {
  true_positive_rate: 0.96,
  false_positive_rate: 0.04,
  f1_score: 0.94,
  lead_time_median_minutes: 13,
  by_trigger_source: { sensor: {...}, sighting: {...} }
}

GET /api/v1/false-positives?hazard_type=wildfire&days=7
Response: [
  {
    event_id, trigger_time, reason_actual: "controlled_burn",
    trigger_source, confidence,
    feedback_submitted: bool
  }
]

POST /api/v1/false-positives/{event_id}/feedback
Auth: Any employee
Body: { reason: "controlled_burn", description: "..." }
Response: { feedback_id, improvement_ticket_created: bool }
```

---

## 10. Key Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Message Queue | NATS JetStream | Reliable at-least-once delivery, geographically scalable, low latency (<50ms) |
| Database (Operational) | PostgreSQL + PostGIS | Geospatial queries, ACID compliance, JSON support for flexible schemas |
| Database (Time-Series) | TimescaleDB | Event metrics + performance tracking, built on PostgreSQL, native time-series compression |
| Cache | Redis | Fast confidence score storage, session state, rate-limiting counters |
| Analysis Agent | Claude Opus | Advanced reasoning, pattern recognition across multiple data sources, explainability |
| Storage (Logs) | S3 with Object Lock | Immutable audit trail, 7-year retention, encryption at rest (AES-256) |
| Sensor Ingestion | Device SDKs (iOS CoreMotion, Android SensorManager) | Native platform support, low power, always-on capability |
| Official Source Integration | REST APIs + webhooks | Real-time CAP XML parsing for NWS, USGS API polling, NOAA feed ingestion |
| Notification Delivery | FCM + APNs + SMS | Multi-channel redundancy, high deliverability (95%+), mesh fallback |
| Geospatial Processing | GDAL + PDAL | Standard tools for raster/vector/point cloud data; used in hazard models |

---

## 11. Deployment & Monitoring

### 11.1 CI/CD Pipeline

```
1. Code commit → GitHub
2. Pre-commit hooks: linting, security scan (dependency check, SAST)
3. Build: Docker image (Python/Node backend, optimized image size <500MB)
4. Unit tests: pytest (coverage >90%)
5. Integration tests: Postgres in Docker, local NATS, local Redis
6. Staging deploy: k8s cluster, same config as production
7. Smoke tests: create test event, verify approval queue, check notification delivery
8. Manual approval by module lead (2 hours before production deployment)
9. Production deploy: blue-green, 100% traffic switch after 30-min validation
10. Post-deploy monitoring: error rate, latency p95, trigger ingestion volume
```

### 11.2 Monitoring & Alerts

**Key Metrics (5-min polling):**
- Trigger ingestion rate (events/min per source)
- Confidence calculation latency (p95, p99)
- Analysis agent latency (p95, p99)
- Module lead approval SLA compliance (% approvals <15 min)
- False positive rate (24-hour rolling)
- Publication success rate (% events published without API errors)

**Alert Thresholds:**
- Error rate >1% → immediate escalation to on-call engineer
- Approval SLA miss >10% → notify module lead group
- False positive rate >7% → notify team lead + suggest threshold adjustment
- Sensor feed latency >2 hours → escalate to data partnerships team
- NATS message loss → critical alert, potential data loss investigation

### 11.3 Scalability

**Expected Growth:**
- Year 1: 500 EMS agencies active, 50M public users
- Year 2: 1500 EMS agencies, 150M public users
- Year 5: 3000+ EMS agencies, 500M+ public users

**Scaling Strategy:**
- Database: horizontal sharding by geography (US regions: West, Central, East)
- NATS: cluster with 5+ nodes, partition by hazard type
- Analysis agent: queue with auto-scaling (scale up as queue depth exceeds 100 requests)
- Notification service: batch delivery (1000s of events/sec via FCM, SMS via Twilio)

---

## 12. Post-Event Validation & Improvement

### 12.1 Accuracy Measurement

**Post-Event Audit (within 48 hours):**
1. Retrieve ground-truth data: satellite imagery, government agency damage assessments
2. Compare predicted hazard extent vs. actual extent
3. Calculate metrics: IoU (intersection over union), lead time accuracy, affected population estimate error
4. Identify failure modes: model under-predicted in this region, sightings contradicted each other, etc.

**Retraining Trigger:**
- If accuracy drops >5% in any region, flag for model retraining
- If same failure mode occurs in 2+ consecutive events, immediate retraining
- Nightly batch: collect past 30 events, check if performance degraded

---

## 13. Appendix: Configuration Defaults

### 13.1 Confidence Thresholds (per hazard)

| Hazard | Auto-Publish Floor | Module Lead Review | Analysis Review |
|--------|-------------------|-------------------|-----------------|
| Wildfire | 0.75 | 0.65 | 0.50 |
| Flood | 0.70 | 0.60 | 0.45 |
| Tornado | 0.80 | 0.70 | 0.55 |
| Earthquake | 1.00 (official only) | 1.00 | 1.00 |
| Tsunami | 0.75 | 0.65 | 0.50 |
| Landslide | 0.68 | 0.58 | 0.45 |
| Hurricane | 1.00 (NHC track) | 1.00 | 1.00 |

### 13.2 Source Weights (default)

```
confidence_final =
  0.40 * confidence_sensor +
  0.30 * confidence_satellite +
  0.20 * confidence_sighting +
  0.10 * confidence_official
```

Regional adjustments (example):
- California wildfire region: sensor 0.35, satellite 0.40 (better coverage)
- Midwest tornado: sensor 0.50, radar 0.25, sighting 0.20, official 0.05
- Florida hurricane: official 0.50, satellite 0.30, sensor 0.15, sighting 0.05

---

## 14. Conclusion

Event Triggers is the critical bridge between hazard detection and emergency response. The module must balance speed (minutes matter), accuracy (false positives erode trust), and oversight (no autonomous declarations without human review).

The 5 trigger sources provide redundancy: if satellites fail, sensors + sightings catch the hazard. If sightings are noisy, official sources + satellite data validate. The analysis agent provides explainable reasoning. Module leads maintain human control.

By following this design, Beacon can declare events within ~12 minutes of hazard onset with <5% false positive rate and >95% true positive rate — enabling coordinated response when every minute counts.

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Owner:** Event Triggers Module Lead
**Next Review:** 2026-06-25
