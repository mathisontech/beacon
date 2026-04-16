# Beacon System Development Plan — Sorted by Domain

Each section below represents a standalone development domain. Within each domain, items are ordered from foundational (build first) to dependent (build later). Cross-domain dependencies are noted inline.

---

## 1. Base Map

The foundation everything else renders on. Server-side build by Beacon employees, delivered to users as 1km tiles.

### Atlas Pipeline
- Multi-source fusion engine: LiDAR (3DEP), satellite (Sentinel-2, NAIP), street-view (Mapillary), OSM, DEM (Copernicus)
- Source priority hierarchy per attribute (resolution wins, recency tiebreaker)
- Processing stages: ingestion, georeferencing, resampling, fusion, validation, tiling
- PMTiles format generation with CDN delivery (CloudFront/S3)
- Incremental update pipeline (delta tiles — only changed tiles rebuilt)
- Tile precaching for at-risk users based on hazard proximity
- Data quality score per tile (flag below 60 for human review)
- Throughput target: 10K tiles/hr

### Data Ingestion
- Real-time feeds: USGS Earthquake (1-2 min), NWS Alerts (30-60 sec), NEXRAD (5 min), MRMS (2 min), GOES (5-15 min), USGS Water (15 min), NOAA CO-OPS (6 min), FIRMS (3 hr), SPC outlooks
- Static sources: LANDFIRE (biennial), SSURGO/SoilGrids, Census/ACS, FEMA NFHL, NHD Plus, EPA facilities, NBI bridges, OSM (weekly)
- Feed health monitoring, schema change detection, freshness tracking
- Source priority rules when data conflicts arise

### Update Protocols
- Official source release calendar tracking (LANDFIRE biennial, Census decennial, SSURGO periodic)
- Post-event resurvey triggers: satellite tasking for post-event imagery, LiDAR resurvey for terrain changes (landslide, lava flow, flood scour)
- Staged rollout for source updates (test region first, then full deployment)
- Version history per source with downstream notification

### CV/ML Map Processing
- Building detection (Mask R-CNN), road extraction (D-LinkNet), land cover classification (U-Net)
- Vegetation density from NDVI + LiDAR, tree species from street-view, fuel loading estimation
- Structure material classification, height estimation, soft story detection
- Barrier classification (fence material, wall, guardrail, boulder), gate/lock detection
- Power line routing, fire hydrant identification, sign reading
- Change detection (Siamese network) for temporal updates
- Burn scar mapping, snow cover extent

### Street-Level Perception
- LiDAR-to-street-level reprojection system
- Phone camera change detection (RAFT optical flow) against LiDAR priors
- Privacy pipeline: face and license plate blurring (mandatory, never bypassed)
- Post-event damage assessment, damage severity scoring (0-4)
- Synthetic training data for data-sparse regions
- On-device inference: TFLite/CoreML, MobileNetV3

### Map Layers (12 categories)
- Terrain/elevation: DEM derivatives (slope, aspect, drainage, traversability)
- Roads/transportation: road network, width, surface type, clearance
- Structures/buildings: footprints, materials, purpose, occupancy estimates
- Hazard risk: per-hazard risk overlays (flammability, flood zone, seismic)
- Explosive/hazardous: pipeline routes, chemical facilities, gas stations
- Jurisdictions: city/county/state boundaries, fire districts, school districts
- Utilities/infrastructure: power grid, water systems, cell towers, dams, bridges
- Population: census blocks, time-of-day population models per building type
- Imagery: satellite and aerial base imagery
- User-reported: condition reports, sightings, blockage marks
- Event/active: real-time hazard perimeters, evacuation zones, destruction assessment
- Hydrology: streams, watersheds, flood plains, coastal bathymetry

### Data Storage (base map specific)
- PostgreSQL + PostGIS for geospatial feature data
- S3/CloudFront for PMTiles delivery with 1-hour dynamic cache TTL
- GDAL, PDAL for raster/point cloud processing

**Depends on:** Nothing (foundation layer)
**Consumed by:** Every other domain

---

## 2. Hazard Manager

Each hazard developed independently with a standardized 12-module framework. Physics-based models on server, DL surrogates compressed for on-phone offline use.

### Hazard Framework (shared)
- Standardized 12-module structure per hazard: detection, risk assessment, spread/evolution modeling, alerting, shelter/evacuation layers, resource overlays
- DL-ification pipeline: physics model → DL surrogate → quantize/prune/distill → TFLite/CoreML deployment
- DL-ification tiers: Tier 1 (wildfire/flood/tsunami/smoke — highest complexity), Tier 2 (earthquake/avalanche/surge/landslide), Tier 3 (already fast, no surrogate needed)
- Asymmetric loss framework: false negatives weighted 10-1000x depending on hazard severity
- Per-module F1 targets, A/B testing during real events, drift detection
- Digital twin simulation: 100+ past events replayed with candidate models

### Atmospheric & Wind Cluster
- **Tornado:** MDA mesocyclone detection, tornado vortex signature, debris signature, path prediction, shelter rating per building
- **Hurricane:** NHC track ingestion, SLOSH surge modeling, Holland wind profile, compound flooding (surge + rainfall), evacuation timing
- **Winter storm:** Sperry-Piltz ice accretion, wind chill, road surface temperature, snow drift, plowed area tracking
- **Dust storm:** Haboob detection, PM10 visibility modeling

### Fire Cluster
- **Wildfire spread:** Rothermel physics engine, FARSITE perimeter expansion, FlamMap crowning, spot fire generation, ember transport, server-side real-time updates (60-sec push cycle)
- **Fire/smoke CV:** Shared model for fire camera feeds + user photos (day/night/all lighting), ALERTWildfire/HPWREN training data, synthetic smoke augmentation, veracity scoring
- **Arson detection:** No power lines + no lightning + no camping + crossover point proximity + upwind = high arson risk. Flag only — never auto-notifies law enforcement. Requires module lead + legal review before action.
- **Wildland/residential transition:** Burn-together group algorithm, structure-to-structure fire spread in dense developments
- **Lethality & air quality:** Heat/smoke/oxygen lethality, HYSPLIT smoke dispersion, PM2.5 fields, AirNow integration
- **Extreme heat:** WBGT model, urban heat islands

### Hydrological Cluster
- **Flood:** HEC-RAS 2D hydraulics, NWM integration, HAND method, flash flood guidance, FEMA NFHL overlay, GloFAS forecasts, Sentinel-1 SAR flood extent, SWOT altimetry
- **Tsunami:** MOST/ComMIT propagation, DART buoy anomaly detection, physics-informed neural operators, coastal elevation transects, run-up modeling, ETA calculation
- **Dam failure:** Froehlich breach equations, NID data, downstream inundation mapping
- **Rip current:** beach-specific modeling from wave/wind/tide conditions

### Geological Cluster
- **Earthquake:** ShakeAlert EEW integration, GMPE/ShakeMap, ETAS aftershock forecasting, building vulnerability scoring
- **Liquefaction:** Zhu model, zone mapping
- **Sinkhole:** Karst susceptibility mapping
- **Avalanche:** SNOWPACK model, RAMMS runout simulation, burial survival curves
- **Landslide:** Newmark displacement, post-fire debris flow risk
- **Volcano:** LAHARZ lahar modeling, Ash3d dispersion, InSAR deformation monitoring

### Special Hazards
- **Hazmat:** ALOHA/CAMEO dispersion, ERG distances
- **Drought:** PDSI, SPI drought indices
- **Pandemic:** SEIR models, wastewater surveillance
- **Amber Alert:** NCMEC integration, kill-switch photo collection
- **Backcountry:** Multi-hazard overlay for remote areas
- **Power grid:** Cascade modeling from infrastructure failure
- **Infrastructure failure:** Bridge rating (NBI), cascading failure analysis

### QA & Validation
- Daily model output monitoring, anomaly flagging, geographic extent validation
- 10% random sampling of all model outputs
- Post-event AAR within 7 days (auto-drafted by agent, human-reviewed)
- Benchmark datasets with annual updates and baseline accuracies

**Depends on:** Base Map (terrain, structures, infrastructure layers)
**Consumed by:** Notifications, Routing, Public Users, Clients

---

## 3. Mesh Networking & Offline Operations

Peer-to-peer communication when cell towers go down. Activates automatically.

### Mesh Protocol
- BLE + Wi-Fi Direct peer-to-peer networking
- Intelligent routing across 100+ hops
- Delta encoding for map tile updates over mesh
- Group representation instead of individual data points to reduce bandwidth
- Standardized messages prioritized over custom messages

### Traffic Prioritization
- Priority 1: EMS traffic (always highest)
- Priority 2: Help requests
- Priority 3: Status updates, tags
- Priority 4: General user data

### Compression & Bandwidth
- Delta encoding for map tiles (only differences transmitted)
- DL-compressed hazard model outputs
- Simplified map download for offline use (reduced layers, lower resolution)

### Partnerships
- Ring doorbell network: relay nodes (5M devices), street-level imagery, post-event damage assessment
- Starlink satellite backbone: rural mesh backhaul, emergency priority uplink, 99.5% SLA, $100K/month

### Mesh Security
- ECDSA P-384 message signing
- 256-bit nonce with sliding window (5-min TTL) for replay prevention
- Certificate pinning for peer authentication
- MITM prevention, spoofing detection

### Offline Mode
- Cached tiles for user's area
- Simplified hazard spread model running locally (DL surrogate)
- Location relay for offline users through mesh
- Alert caching and sync on reconnect

### Battery Management
- Battery-aware mesh participation (reduced when <20%)
- Power consumption profiling per feature combination
- Emergency-mode drain target: <5%/hr

**Depends on:** Base Map (tiles for caching), Hazard Manager (compressed model outputs)
**Consumed by:** Public Users, Groups, Clients, Notifications

---

## 4. Notifications & Alerts

Multi-channel alert delivery system. Operates both online and over mesh.

### Alert Levels (5-tier)
- Level 1 — Informational: no repeat, dismiss to clear
- Level 2 — Advisory: 1-hour repeat delay
- Level 3 — Watch: 10-min repeat
- Level 4 — Warning: 2-min repeat
- Level 5 — Emergency: 30-sec repeat

### Delivery Channels
- Push notifications: APNs (iOS), FCM (Android)
- SMS fallback via Twilio (compressed ~100-120 chars)
- Automated phone calls for Level 5
- Mesh broadcast to 10-mile radius (offline users)
- IPAWS/WEA/CAP integration with NWS feeds (2-min update cycle)

### Alert Content
- Hazard-specific templates (wildfire, tornado, wind, flood, winter storm, utilities, hazmat)
- Agent drafts alert text from template + model output within 30 sec of trigger
- Module lead approves all alerts (15-min SLA)
- Alerts affecting >50K people require CTO co-sign

### Delivery Logic
- Acknowledgment from user pauses repeat for that user, continues for others
- Max 20 push/hour per user (except Level 5)
- Escalation chain if no acknowledgment
- Delivery rate tracking, auto-escalate if failure >5%

**Depends on:** Hazard Manager (triggers), Mesh Networking (offline delivery)
**Consumed by:** Public Users, Groups, Clients

---

## 5. Evacuation & Routing

Route calculation engine for individual and mass evacuation, including indoor and low-visibility scenarios.

### Core Routing Engine
- OSRM-based with multi-objective optimization: time + safety + congestion
- Vehicle-specific routing: turn radius, clearance, surface type, 2WD vs. 4WD
- Dynamic re-routing as hazard perimeters change
- Exit route bandwidth optimization (distribute users across routes to prevent bottleneck)

### Route Types
- Standard evacuation to safe zones
- Low-visibility guidance (smoke, blizzard) with UWB indoor navigation
- Indoor evacuation with floor plan overlay
- Convoy routing for group evacuations (pre-assigned roles, departure/arrival tracking)

### Safe Zone Modeling
- Predicted safe zones based on hazard spread models
- Recent burn areas marked as safe (wildfire)
- Smoke survival advice, lethality assessment per route segment
- Shelter locations with capacity, accessibility, and pet policy data

### Route Impassability
- User marks blockage on map, propagated to all users via mesh
- Automatic re-routing around marked blockages
- Bridge/road condition integration from infrastructure layers
- Guidance for extreme situations: u-turns, k-turns, driving backward

### Danger Rating
- "If you leave in X minutes, danger = HIGH/MEDIUM/LOW"
- Projection updates as hazard perimeter changes
- Route danger scoring per segment

**Depends on:** Base Map (road network, terrain), Hazard Manager (spread predictions, safe zones), Mesh Networking (blockage propagation)
**Consumed by:** Public Users, Groups, Clients

---

## 6. Public Users

Core public-facing experience. The foundation that EMS/client features are layered on top of.

### Core Experience
- Map with active hazard overlays, risk layers, and evacuation routes
- Status system: safe, evacuating, sheltering, stuck, needs help
- Incident/condition reporting: flame sighting (with photo + GPS), blockage, flooding, damage
- Fire sighting integration loop: user reports → CV veracity scoring → server re-runs spread model → updated perimeter pushed within 60 sec

### Emergency Features
- "I'm stuck" button (blizzard, flood, earthquake)
- Shelter-in-place tracking with power/heat status reporting
- Go bag guidance based on household profile and active hazards
- Charging station locations during power outages
- Radiation event: building protection ratings, Geiger counter integration

### Animal Rescue
- Mark animal location (GPS + photo)
- Verified neighbor coordination for rescue
- Animal shelter capacity tracking

### Social Features
- Stories (community updates during events)
- Contacts management, trusted neighbor system
- Status sharing with configurable privacy

### Vehicle Manager
- NHTSA vPIC API auto-lookup from make/model/year
- User profile: snow tires, 4WD, tow hitch, clearance, passenger capacity
- Special vehicle types (RV, trailer, motorcycle) with routing constraints
- EMS resource tracking for fleet vehicles

### Normal Weather
- NWS API integration: 7-day forecast, current conditions, hourly updates
- Watch/Warning/Advisory state machine
- Weather simulator for scenario planning
- Severe weather threshold detection (wind, precipitation, lightning, radar)

### Ski Resort Module
- Run mapping from georeferenced trail maps
- Real-time condition heatmap (snow quality, ice, moguls, crowding)
- Avalanche danger rating (1-5) by aspect/elevation
- Backcountry gate monitoring and avalanche advisory

**Depends on:** Base Map, Hazard Manager, Routing, Notifications
**Consumed by:** Groups, Clients (EMS builds on public user foundation)

---

## 7. Public Groups

Community coordination layer built on top of public user features.

### Group Types
- **Neighborhood groups:** 50-500 households, geographic clusters, founder admin, location sharing toggle
- **Parent-community groups:** School enrollment-verified, principal has child location access during events (special designation required)
- **Burn-together groups:** AI-calculated by wind/fuel/insurance tier for wildfire coordination
- **Evacuation convoy groups:** Temporary, event-based, pre-assigned roles (lead car, sweep car), departure/arrival tracking

### Location Sharing Within Groups
- 4 modes: off, group-only, EMS-only, public (neighborhood-granule only)
- 4 granularity levels: exact (±50m), block (±200m), neighborhood (±500m), city (±5km)
- E2E encryption for group sharing (ECDH + AES-256)
- 72-hour history retention for group data
- Privacy audit trail and retroactive revocation

### Group Features
- Shared condition reporting within group boundary
- Group-wide alerts and check-in requests
- Resource pooling (who has generators, trucks, medical supplies)

**Depends on:** Public Users, Location Sharing, Mesh Networking (offline group communication)
**Consumed by:** Clients (EMS groups extend public groups)

---

## 8. Clients (EMS / Emergency Management)

EMS accounts are special group types built on public user functionality with admin tools, dispatch, and resource management layered on.

### EMS Admin Dashboard
- Zone drawing tools (rapid polygon creation under stress)
- Event declaration: automatic thresholds + manual override (15-min human override window)
- Dispatch layer integration with 911 call display
- Resource tracking dashboard: personnel, vehicles, equipment, mutual aid
- Aggregated high-risk layer: cross-hazard risk aggregation for prioritizing response
- Bottleneck visualization for evacuation routes

### Help Manager (6 categories)
- Category 1: Transport/welfare checks (rides, elderly checks)
- Category 2: Evacuation status confirmation (did this household actually leave?)
- Category 3: Condition reporting (road conditions, structural damage)
- Category 4: Resource lending (generators, trucks, medical supplies)
- Category 5: Responder needs assistance (EMS approval required)
- Category 6: Suspect/missing person photo assistance (kill-switch enabled, EMS + legal approval required)

### Dispatch
- Only dispatch-designated members can mark on dispatch layer
- Call management and resource coordination
- Hospital bed availability and patient triage
- Transport status tracking
- Surge detection and automated queue management

### Event Management
- ICS Form integration (201, 202, 205)
- Cascading event detection and conflict resolution
- Data recording to immutable S3 logs with AES-256 encryption
- After-action reporting framework (auto-draft within 24 hr, human review within 7 days)

### Mutual Aid
- Secure backup codes for non-Beacon EMS units
- Cross-agency resource sharing
- Mutual aid request/response workflow

### Contacts/Stakeholder Database
- Pre-populated: landowners, bus companies, school principals, nursing homes, daycares, hospitals, utilities, tow companies, port authorities
- Advance outreach capability during high-risk periods
- Linked to property lines and jurisdictions

### EMS Onboarding & Training
- 3 subscription tiers: Lite ($2K/mo), Standard ($5K/mo), Premium ($10K/mo)
- Initial training: 4-hour operations
- Role-specific modules: dispatch (2 hr), incident commander (3 hr), field ops (1 hr)
- Quarterly refresher webinars, 80% passing for certification, annual recertification

**Depends on:** Public Users, Groups, Routing, Notifications, Hazard Manager, Base Map
**Consumed by:** Nothing (top of the user hierarchy)

---

## 9. Accounts, Auth & Permissions

Cross-cutting system for identity, verification, and access control.

### Account Types
- Beacon Super Admin: atlas access, user management, event records
- Beacon Employee: server-side build, pipeline management, model training
- Client Admin: account setup, invite links for EMS personnel
- EMS Admin / Team Member / Dispatch: tiered access per role
- Special Designations: 12 types (see below)
- Public User: self-managed profile with optional trusted neighbor system

### Authentication
- Face ID verification for high-trust actions
- Background check integration for special designations
- Sex offender registry check
- Invite code system for special accounts (verified per role type)
- JWT auth with RS256, 15-min token expiry, continuous re-auth

### Special Designations (12 types)
- School principal, utility rep, plower, tornado tracker, storm chaser, fire spotter, fire chief, EMS director, ambulance/EMS, state emergency rep, federal emergency rep, hospital rep, state politician, ski patrol
- Each has specific data access, alert authority, dispatch authority, and map marking capabilities
- Permissions matrix across 8 dimensions: location access, alert authority, dispatch, mutual aid, data export, map marking, event declaration, resource management
- All special accounts have direct connection to Beacon founder for real-time support

### Legal & Permissions
- Sensor legal releases (35+ drafted)
- Terms of service, privacy policy, data consent
- Use-at-Your-Own-Risk banner (sticky, dismissal required)
- Kill-switch for sensitive features (arson photos, Amber Alert assistance)

**Depends on:** Nothing (cross-cutting)
**Consumed by:** Every domain

---

## 10. Location Sharing & Privacy

Standalone privacy system governing all location data across the platform.

### Sharing Modes
- Off: no location tracking
- Group-only: E2E encrypted, configurable granularity
- EMS-only: emergency request-based with 10-sec user notification before override
- Public: neighborhood-granule only (±500m)

### Granularity Levels
- Exact: ±50m
- Block: ±200m
- Neighborhood: ±500m
- City: ±5km

### Adaptive Frequency
- Normal: 30-min updates
- Advisory: 10-min updates
- Warning/Emergency: 2-min updates
- Battery <20%: 60-min updates regardless of alert level

### Retention
- Group data: 72 hours
- EMS data: 30 days
- Event-specific data: 6 months
- Privacy audit trail with retroactive revocation capability

**Depends on:** Accounts (identity), Mesh Networking (offline relay)
**Consumed by:** Public Users, Groups, Clients

---

## 11. Modeling & Simulation

Server-side intelligence layer for scenario planning, model training, and predictive analysis.

### DL Surrogates
- Physics model → deep learning surrogate → compress → deploy on-phone
- Tier 1 candidates: wildfire (Rothermel), flood (HEC-RAS), tsunami (MOST), smoke (HYSPLIT)
- Tier 2: earthquake (ShakeMap), avalanche (RAMMS), surge (SLOSH), landslide (Newmark)
- Tier 3: already fast enough (no surrogate needed)

### Simulators
- Mass evacuation simulator with dynamic congestion modeling
- Disaster simulation (fire spread, flood, tsunami) for EMS scenario planning
- Weather simulator for threshold analysis

### Sensor Fusion
- Real-time barometric pressure from phone sensors
- Storm chaser image triangulation against radar
- Traffic stuck detection from GPS movement patterns
- Population time-of-day models per building type

### Beacon World Model
- Goal-directed engine trained on base map + hazard data + historical outcomes
- Pack hierarchy logic: dependents > immediate family > extended > wider community
- Dependency graph: children, elderly, disabled, pets
- Obligation-bounded risk: parents obligated to children (high), neighbors (low)
- Temporary pack formation: strangers in crisis form packs, system coordinates
- Asymmetric loss: one preventable death dominates 100 safe evacuations

**Depends on:** Base Map, Hazard Manager, historical event data
**Consumed by:** Hazard Manager (model improvements), Routing (scenario planning), Clients (EMS scenario planning)

---

## 12. Cybersecurity & Compliance

Security architecture and regulatory compliance across the entire platform.

### Encryption
- At rest: AES-256-GCM
- In transit: TLS 1.3
- Mesh E2E: ECDH P-256 pairing + AES-256 + HMAC-SHA256

### Zero Trust
- RS256 JWT with 15-min expiry
- Device posture checks: OS version, patch level, screen lock
- Continuous auth, attribute-based access control

### Compliance
- CMMC Level 2 (110 NIST SP 800-171 practices, 3-year certification)
- FedRAMP path (JAB or agency-sponsored)
- SOC 2 Type II (annual audit with Big 4)
- CCPA, state privacy laws, GDPR (international expansion)

### Incident Response
- 15-min executive notification
- 60-min containment
- 4-hour customer communication
- Legal counsel notified within 1 hour of breach

### Penetration Testing
- Quarterly automated scanning
- Semi-annual internal pen testing
- Annual external pen testing

**Depends on:** Nothing (cross-cutting)
**Consumed by:** Every domain

---

## 13. UI/UX & Design System

Visual language and interaction patterns shared across all user-facing surfaces.

### Brand Colors
- Primary: Navy #0B0F2A
- Secondary: Teal #0097B2
- Hazard-specific: Wildfire #FF4500, Flood #1976D2, Earthquake #FF8F00, Tornado #7B1FA2

### Typography
- Headings/body: Inter
- Technical/data: JetBrains Mono (or IBM Plex Mono)
- Emergency mode: 18px+ body, 24px+ headings

### Emergency Mode
- Enlarged controls: 56px+ buttons
- High contrast: navy/white only
- Haptic amplification
- Reduced visual complexity

### Map Layer Selector
- Top-right dropdown, relevance-sorted per active hazard
- Starred layers persist at top
- Sublayer expansion for compound layers
- Validated-model-only rule: no unvalidated model output on user map
- Road conditions always pinned

### Vehicle Icons
- Type-specific: ambulance, firetruck, police, helper, supply
- Occupant count badges (color-coded)
- Declutter rules: hazard layers always visible, POI visibility by zoom, road simplification if hazard opacity >60%

### Accessibility
- WCAG 2.2 AA compliance (4.5:1 contrast minimum)
- 44x44px minimum touch targets
- All icons labeled, color + shape for encoding

**Depends on:** Nothing (cross-cutting)
**Consumed by:** Every user-facing domain

---

## 14. System Updates & Deployment

How code, models, and data reach users.

### App Updates
- Expo EAS: JavaScript hot reload (2-5MB, 1-4 hr staging → production rollout)
- Native binary: quarterly via App Store/Play Store (or on critical security patches)
- Force updates for CVSS ≥7.0 (no defer, app non-functional without update)
- Scheduled updates: deferrable 7 days, then increasingly persistent

### Model Updates
- ML models versioned independently, OTA delivery monthly
- Can run multiple versions simultaneously for A/B testing
- Auto-rollback if model failure rate >1%

### Tile Updates
- Hash-based delta delivery (only changed tiles)
- 70% compression with zstd
- User's area updated first, then expanding radius

### Rollback
- Automatic if crash rate >10% within 1 hour
- Manual rollback requires 2-admin approval
- 30-day version history maintained
- Block all deploys during active events unless critical

**Depends on:** Nothing (cross-cutting infrastructure)
**Consumed by:** Every domain

---

## 15. Agentic Architecture

Multi-agent system for automated operations across all domains.

### Per-Module Agent Teams
- Monitor Agent (Haiku): continuous data feed monitoring
- Analysis Agent (Opus): pattern recognition, anomaly detection
- Recommendation Agent (Opus): action proposals
- Validation Agent (Haiku): output verification

### Infrastructure
- LangGraph for state management, streaming, conditional branching
- Kubernetes: per-module containers, EKS cluster
- Cost: ~$250/month steady state, ~$331/month during active events (10x multiplier)
- 6 CPU / 5.5GB RAM per module steady state

### Human-in-Loop
- Escalation for evacuation orders
- High-confidence alert approval (>85% confidence still requires human sign-off)
- Disputed outputs go to module lead
- Research agent: nightly performance analysis, bias detection, retraining proposals

**Depends on:** All domains (agents operate across every system)
**Consumed by:** Operations, monitoring, reporting

---

## 16. Partnerships & Revenue

External relationships and business model.

### Technology Partnerships
- Ring: 5M doorbells as relay nodes + street imagery ($6M/year, offset by $12M premium revenue)
- Starlink: satellite mesh backbone for rural ($100K/month, 99.5% SLA)
- ALERTWildfire / HPWREN: fire camera network access

### Academic Partnerships ($1.1M/year)
- UC Berkeley: AI safety and goal alignment
- Stanford: ML systems optimization
- UCLA: computer vision benchmarks
- UC San Diego: compute and simulation

### FEMA Training Integration
- 32-hour certification: 4hr ops, 8hr hazard analysis, 16hr evacuation planning, 4hr mesh/offline
- Target: 10K trained personnel/year

### EMS Revenue
- Lite: $2K/month (dispatch, beds, mutual aid)
- Standard: $5K/month (GPS, queue, surge detection)
- Premium: $10K/month (unlimited units, AI dispatch)
- Target: 500 agencies by 2030 ($30M/year)

### Revenue Trajectory
- Year 1: $30M
- Year 3: $55M
- Year 5: $75M+ (state contracts + EMS + licensing + premium)

**Depends on:** Working product across all domains
**Consumed by:** Business operations, funding

---

## Domain Dependency Map

```
Base Map ─────────────────────────────────────────────────┐
    │                                                     │
    ├──→ Hazard Manager ──→ Notifications ──→ Public Users │
    │         │                    │              │        │
    │         └──→ Routing ────────┘              │        │
    │                │                            │        │
    │                └─────────────→ Groups ───→ Clients   │
    │                                                     │
    ├──→ Mesh Networking (offline layer across all) ──────┤
    │                                                     │
    ├──→ Accounts/Auth (cross-cutting) ───────────────────┤
    ├──→ Location/Privacy (cross-cutting) ────────────────┤
    ├──→ Cybersecurity (cross-cutting) ───────────────────┤
    ├──→ UI/Design System (cross-cutting) ────────────────┤
    ├──→ System Updates (cross-cutting) ──────────────────┤
    └──→ Agentic Architecture (cross-cutting) ────────────┘
```

**Build order:** Base Map → Hazard Manager → Routing → Notifications → Public Users → Groups → Clients. Cross-cutting systems (Accounts, Security, UI, Updates, Mesh) develop in parallel throughout.

---
