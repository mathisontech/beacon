# Beacon Module Manager — Taxonomy & Consideration Framework

## Module Groups

---

### 1. Base Map

**Base Map Manager**
Terrain, elevation, land cover, structures, roads, utilities, population density. Includes LiDAR ingestion, satellite imagery processing, OSM sync, CV/ML pipelines (building detection, road extraction, fuel loading classification). Tile delivery, caching for user saved locations, update cadence.

**Event-Triggered Base Map Update Manager**
Protocols for accelerating map refresh during active events: satellite pass prioritization, drone imagery ingestion, field report integration, damage footprint overlays. Ensures the map reflects ground truth as fast as possible when conditions are changing.

**User-Requested Map Adjustment Manager**
Construction and demolition reporting, user-reported inaccuracies, verification workflow before map commits, feedback to data source owners. Maintains map quality through crowdsourced correction without opening the map to unverified edits.

**User-Created Map Layers Manager**
Private and non-private layers authored by users or EMS: designated evacuation zones, utility zones, gate managers, restricted access areas, neighborhood-defined safe zones. Layer permissions (owner, group, agency, public), versioning, and conflict resolution with base map data.

**Automated Sensor-Driven Map Attributes**
Two streams: (1) traversability inference from aggregated device movement — where people actually travel tells us what's actually passable, filling gaps in official road data; (2) building attribute inference from sensor data — occupancy patterns, structural response signatures, utility connectivity. Both update the base map continuously without human curation.

---

### 2. Condition Monitoring & Situation Data

*Data ingestion and visualization for external, non-user sensor sources. This layer tells us what the world looks like before any risk assessment happens.*

**Official Situation Data Manager**
Ingestion, normalization, and quality control for all external sensor feeds: USGS stream gauges, NOAA weather stations, RAWS fire weather, seismic networks, GOES/VIIRS satellite hotspots, air quality monitors, DART buoys. Handles polling intervals, schema drift, outage detection, and backfill. Feeds are never passed raw to downstream modules — this layer owns normalization and confidence tagging.

---

### 3. Risk Monitoring

*How we track risk over time, adjust model sensitivity and polling cadence accordingly, and determine thresholds for storing conditions data in advance of confirmed impact. This layer watches for the world to shift from normal to concerning.*

**Official Conditions Manager**
Integrates authoritative forecasts and warnings: NWS watches/warnings/advisories, NOAA hurricane tracks, USGS ShakeAlert, NIFC fire perimeters, EPA air quality indices, tsunami advisories. Parses CAP/ATOM feeds, reconciles conflicting sources, maintains current-conditions state. Drives polling rate escalation and pre-emptive data caching for the sensor layer above.

---

### 4. Event Trigger Types

*When risk turns into reality. This layer defines and manages all the ways a hazard event can be declared, ensuring nothing is missed and nothing fires falsely.*

**Automatic Sensor-Based Hazard Detection Manager**
Real-time anomaly detection across sensor streams: satellite hotspot clustering for new ignitions, rapid stream gauge rise for flash floods, seismic P-wave triggers, wind shear signatures for tornado genesis, PM2.5 spike detection. Runs detection algorithms, manages alert thresholds, feeds into hazard models. Includes doorbell network auto-detection (Ring integration for visual confirmation of fire/smoke/flooding). Automatic user device-driven triggers (e.g., seismic signature detected across device accelerometers during an earthquake).

Trigger source taxonomy managed by this module:
- Automated sensor anomaly detection (above)
- User device-driven detection (accelerometer, barometric, audio)
- User sighting-based triggers (crowdsourced fire/flood/damage reports reaching confidence threshold)
- EMS-declared event (agency manually declares via admin interface)
- Official source declaration (NWS emergency, USGS ShakeAlert broadcast, NOAA tsunami warning)

---

### 5. Hazard Onset Response

*What Beacon does in the first minutes after a hazard is triggered. This is the most time-critical module in the system — its job is to go from "trigger fired" to "every affected user has what they need to survive" as fast as possible.*

**Hazard Onset Response Manager**
Orchestrates the immediate system response at trigger time:

- Adjust data storage and sensor polling protocols for the confirmed hazard type
- Determine where users are, using herd location estimates where individual GPS is unavailable or stale
- Compute initial danger zone estimate using hazard models and each user's relative position and risk profile
- Send notifications to affected users and appropriate EMS contacts
- Issue user status requests: confirm safe / need help, prompt to report conditions, request consent for EMS to access Ring doorbell footage for situation assessment
- Surface situation overview to EMS user interface including population model estimate (time-of-day + herd location data)
- Execute hazard-specific device and cache protocols: cache forecast data and map tiles, begin broadcasting user location to authorized parties, increase phone sensor polling rate, pre-load known shelters / safe zones / government-issued meeting points at full resolution. For tsunami: immediately trigger high-ground guidance. For wildfire: pre-cache evacuation routes. For earthquake: cache shelter-in-place guidance and aftershock probability.
- Collect initial user status responses and determine whether EMS notification or nearby peer help request should be auto-generated

---

### 6. Event Management

*The sustained operational layer once a hazard is confirmed and declared. These modules run continuously for the duration of an event.*

**Event Manager**
Lifecycle of a declared emergency: creation (automatic threshold triggers + manual EMS declaration), classification (type, severity, geographic bounds), escalation/de-escalation, multi-event coordination, timeline logging, ICS form generation (201, 202, 205). The backbone that activates and deactivates all other event-time modules.

**User Sighting & Condition Reporting Manager**
Crowdsourced data from public users and special designations: fire sightings (CV-verified), road blockage reports, flood line observations, structure damage, hazmat spills. Ingestion validation, triangulation from multiple reporters, confidence scoring, spam/false-report filtering, and feedback loop to hazard models.

**Beacon Hazard Models Manager**
The core modeling engine. Physics-based models (Rothermel, HEC-RAS, MOST, ShakeAlert GMPEs) and their DL surrogates. Per-hazard 12-module framework: detection, risk assessment, spread/evolution, alerting thresholds. Model versioning, validation against historical events, accuracy tracking, on-device deployment (TFLite/CoreML).

**User Danger Manager**
Synthesizes all hazard data into per-user threat assessment. Location-based danger-over-time projection ("if you stay, danger in 30/60/90 min is..."), location overview summarizer, compound hazard stacking (fire + smoke + road closure), personal risk factors (mobility, vehicle type, dependents). Drives the core user decision: stay, shelter, or evacuate.

**User Location Determination Manager**
Multi-source position fix: GPS, WiFi, cell triangulation, BLE mesh relay, UWB indoor positioning. Handles GPS-denied environments (smoke, canyon, indoor), location smoothing, battery-efficient polling, accuracy confidence intervals. Drives every location-dependent feature in the system.

---

### 7. Navigation & Terrain

*Modules governing movement, routes, and physical traversability.*

**Passable Terrain Manager**
Real-time road/trail status: open, impaired, closed, destroyed. Fuses official DOT feeds, user blockage reports, hazard model outputs (fire perimeter intersection, flood inundation zones), and sensor data. Vehicle-specific passability (2WD vs 4WD, clearance, turn radius). Propagates impassability to routing engine.

**Evacuation Manager**
Route calculation and guidance. Multi-objective optimization (time + safety + congestion), dynamic re-routing, exit bandwidth modeling, convoy coordination, low-visibility guidance. Danger rating projection per route option. Integration with passable terrain and real-time hazard data. Shelter destination selection.

---

### 8. Event Operations

*Modules for managing declared incidents and coordinated response.*

**Teams Manager**
All organized response units: EMS teams, special designation groups, mutual aid units. Sub-areas: team creation/composition, role assignment, team task allocation, shift scheduling, backup requesting and mutual aid coordination (secure handoff codes for non-Beacon units), field communication channels, real-time team location tracking. Account-type-specific functions (dispatch operations differ from field team operations).

**Resource & Dispatch Manager**
Tracking and allocation of physical assets: personnel, vehicles, equipment, supplies, shelters. 911 call integration, dispatch queue, resource accessibility modeling ("can unit A reach location B under current conditions"), mutual aid inventory, logistics coordination.

---

### 9. People & Community

*Modules centered on individual users, groups, and community coordination.*

**Public User Account Manager**
Account lifecycle: registration, profile management, ID verification (face match, background checks, sex offender registry), contact manager, vehicle manager (NHTSA vPIC lookup). Notification and alert preferences, location sharing settings (4 modes x 4 granularity levels), next-of-kin designation, dependent linking.

**Groups Manager**
All group types: neighborhood groups (geographic clustering), parent-community groups (enrollment-verified, principal access during events), burn-together groups (AI-calculated by wind/fuel/insurance tier), evacuation convoy groups (temporary, role-assigned). Group creation, membership, privacy controls, E2E encrypted communication.

**People Helping People Manager**
Peer-to-peer mutual aid, including EMS-initiated requests for public assistance or status reporting. Shelter sharing, vehicle sharing, supply lending, physical assistance offers. The 6-category help system: transport, evacuation confirmation, condition reporting, resource lending, responder assistance, suspect/concern photos. Matching, verification, safety protocols.

**Animal Rescue Manager**
Pet and livestock tracking during events: lost/found reporting, species/breed/photo matching, shelter capacity, volunteer coordination, veterinary resource locations, reunification workflows.

---

### 10. Communications & Alerts

*Modules for getting information to people.*

**Notifications & Alerts Manager**
5-tier alert system (Informational through Emergency). Multi-channel delivery: push (APNs/FCM), SMS (Twilio), automated calls, mesh broadcast, IPAWS/WEA/CAP integration. Agent-drafted alert text, approval workflows (module lead 15-min SLA, CTO co-sign for >50K recipients), rate limiting (max 20 push/hr except Level 5), acknowledgment tracking.

**Mesh Network Manager**
BeaconMesh: BLE + WiFi Direct peer-to-peer relay, 100+ hops. Traffic prioritization (EMS first, help requests second, status third), delta encoding for map tiles, group representation compression. Partnership relay infrastructure (Ring doorbells, Starlink backbone). 5-min security sliding window, ECDSA signing.

---

### 11. Post-Operations

*Modules that activate after the acute phase.*

**Post-Event Manager**
Damage assessment (LiDAR-to-camera reprojection, Ring doorbell street-level perception), recovery resource mapping, insurance documentation support, infrastructure restoration tracking (utility reps), community status rollup, lessons-learned data capture, model validation against actual outcomes.

---

## Consideration Framework

Each module should be evaluated across these dimensions, grouped by who typically owns the answer.

### A. Product & Strategy
*Owned by product leadership. Answers "should we build this and when."*

**A1. Functionality Scope** — What exactly does this module do? What are its inputs, outputs, and core workflows? What does v1 look like vs. the full vision?

**A2. Competitive Advantage** — Does this module create defensible differentiation? Is it table-stakes (must-have to compete), a differentiator (better than alternatives), or a category-creator (nobody else does this)?

**A3. Prominence & Timing** — How prominently should this be featured? Is it always-on, event-activated, or admin-only? At what build phase does it ship (MVP, Beta, V1, V2)?

**A4. Account Access Matrix** — Which account types can access this module and at what permission level? Public users, EMS admins, EMS team members, dispatch, special designations, Beacon employees? Read-only vs. full control?

**A5. Activation Conditions** — When is this module active? Always? Only during declared events? Only for specific hazard types? Only in certain subscription tiers?

**A6. Future Viability** — How does this module hold up under changing conditions? Climate change intensifying hazards, international expansion, new sensor technologies, evolving regulations, competitor moves?

### B. Technical Architecture
*Owned by engineering leads. Answers "how do we build and maintain this."*

**B1. Technical Feasibility & Constraints** — What's hard about building this? Known technical risks, unsolved problems, dependency on external APIs/services that could change, hardware requirements, latency budgets.

**B2. Database Design** — What data does this module own? Schema design, relationships to other modules' data, read/write patterns, indexing strategy. PostgreSQL/PostGIS vs. TimescaleDB vs. Redis allocation.

**B3. Codebase Architecture** — Where does this live in the codebase? API boundaries, shared libraries, mobile vs. server vs. edge split. How is it tested? What's the deployment unit?

**B4. Data Storage & Retention** — How much data does this generate? Retention policies (real-time vs. archival), storage tier allocation (hot/warm/cold), compliance-driven retention requirements. Cloudflare R2 vs. PostgreSQL vs. TimescaleDB.

**B5. API & Integration Points** — What external services does this depend on? What internal modules does it consume from or produce for? API contracts, data format standards, versioning strategy.

### C. Reliability & Performance
*Owned by infrastructure/SRE. Answers "does this work when it matters most."*

**C1. Resilience & Failover** — What happens when dependencies fail? Graceful degradation strategy, fallback behavior, redundancy requirements. What's the blast radius if this module itself fails?

**C2. Performance Benchmarks** — Target latencies, throughput requirements, resource budgets. Load testing protocols, performance regression detection.

**C3. Scalability Requirements** — User count targets per build phase (10K → 50K → 100K → 1M DAU). Data volume growth projections. Horizontal vs. vertical scaling strategy.

**C4. Offline & Mesh Capability** — What functionality must work without internet? Cached data requirements, on-device model capabilities, mesh relay priority. Battery impact.

**C5. Real-Time Requirements** — What data must be live vs. near-real-time vs. batch? WebSocket vs. polling vs. push. Update frequency under normal conditions vs. during active events.

### D. Security, Legal & Compliance
*Owned by security and legal. Answers "are we protected."*

**D1. Cybersecurity Requirements** — Attack surface analysis, authentication/authorization model, data encryption (transit + rest), input validation, rate limiting. Specific threats to this module (e.g., spoofed fire sightings, mesh message injection).

**D2. Legal & Regulatory Compliance** — Applicable regulations: HIPAA (health data), COPPA (children), CCPA/state privacy laws, FCC (alerts), FEMA standards, state emergency management law. Liability exposure if this module produces wrong output.

**D3. Privacy & Data Sensitivity** — What PII does this module handle? Location data sensitivity classification, E2E encryption requirements, data minimization opportunities, user consent model, right-to-deletion compliance.

**D4. Government Compliance** — CMMC Level 2 (110 practices), FedRAMP path implications, SOC 2 Type II requirements specific to this module. What changes when selling to government agencies?

### E. Mesh & Network
*Owned by network/infrastructure. Answers "how does this travel."*

**E1. Mesh Traffic Management** — What data from this module travels over BeaconMesh? Priority level (1–5), payload size optimization, delta encoding applicability, bandwidth budget under constrained mesh conditions.

**E2. Network Partition Behavior** — How does this module behave during network splits? Conflict resolution when partitions heal, data consistency model (eventual vs. strong), merge strategy.

### F. Risk & Quality
*Owned by cross-functional leadership. Answers "what could go wrong."*

**F1. Risk Management Analysis** — Failure modes and consequences ranked by severity. What happens if this module produces wrong output? (A wrong evacuation route can kill people. A wrong badge color is cosmetic.) Mitigation strategies, monitoring, circuit breakers.

**F2. Safety Criticality Rating** — How directly does this module affect life safety? Critical (evacuation routing, danger assessment), High (hazard detection, alerts), Medium (team coordination, resource tracking), Low (post-event documentation, analytics). Determines testing rigor and release process.

### G. Organizational
*Owned by the person running this module. Answers "who builds and runs this."*

**G1. Module Ownership Profile** — What kind of lead does this need? Domain expertise required (GIS, atmospheric science, emergency management, ML/AI, networking, security). Ideal background, team size estimate.

**G2. Inter-Module Dependencies** — What does this module consume from others? What do others consume from it? Dependency graph position: foundational (many depend on it) or leaf (depends on many, few depend on it)? Breaking change impact radius.

**G3. Cross-Team Coordination** — Which other module teams does this team interact with most? Shared data contracts, integration testing requirements, release coordination needs.

**G4. External Partnerships** — Does this module depend on or benefit from external partnerships (Ring, Starlink, USGS, NWS, FEMA, universities)? Partnership health monitoring, contingency if partnership ends.

**G5. Training & Documentation** — What does the team need to know that isn't obvious? Domain-specific training requirements, runbook needs, on-call considerations. What does an EMS user need to understand about this module?
