# Public User Features Module

Core evacuation, safety, and community features for all users. Includes map view, hazard reporting, help requests, shelter finding, vehicle management, weather interface, and ski resort integration.

---

## 1. Module Metadata

**Team:** Public User Experience

**Parent Module:** Beacon Core Platform

**Sub-Modules:** Vehicle Manager (16), Normal Weather (19), Ski Resort Module (18)

**Goal:** Enable users to access safety information, report hazards, request help, and execute safe evacuations.

**Mission Alignment:** Saves lives by providing critical real-time information, enabling peer-to-peer assistance, and facilitating coordinated evacuations.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| User location | Device GPS | JSON | 30s-2min | `{lat, lon, accuracy, timestamp}` |
| Hazard reports | Public users | JSON | Real-time | `{type, location, photo_ref, confidence}` |
| EMS/NWS alerts | Alert system | CAP/JSON | On-alert | `{hazard_type, zone, severity_level, expires}` |
| Weather data | NWS API | JSON | Hourly | `{temp, wind, precip, forecast_grid}` |
| Vehicle specs | Vehicle DB | JSON | On-select | `{make, model, year, length, width, 4wd}` |
| Ski conditions | Ski patrol | JSON | Daily | `{run_id, status, avalanche_risk, conditions}` |
| Help requests | User action | JSON | Real-time | `{location, category, urgency, contact_pref}` |
| **Output: Map view** | Mobile app | GeoJSON/PNG tiles | Real-time | `{hazards, shelters, routes, users_nearby}` |
| **Output: Alerts** | Mobile app | Push/in-app | Real-time | `{alert_level, message, action_required}` |
| **Output: Evacuation routes** | Mobile app | GeoJSON | On-demand | `{route_id, path, estimated_time, capacity}` |
| **Output: Help broadcasts** | Nearby users | JSON | Real-time | `{request_id, seeker_location, seeker_profile, timeout}` |

**Output Consumers:** Mobile app, EMS admin, responders, neighboring users in help-request range.

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `renderMapView()` | Display base map, hazards, shelters, routes | User location, zoom level | PNG tiles + vector layers | p95 < 500ms | Atlas, Hazard Models | 60fps at 4x zoom |
| `fetchHazardAlerts()` | Retrieve active alerts for user area | User location, alert type | Array of alerts | p95 < 2s | Alert system, NWS | Coverage 99% of zones |
| `reportFlamesSighting()` | Submit flame/hazard report with photo | GPS, photo, user ID | Report ID, CV score | p95 < 1s | CV/ML, Contacts | Photo upload <30MB |
| `verifyFlameSighting()` | Cross-reference report with neighboring reports | Report location, timestamp | Confidence score, consensus | p95 < 10s | CV/ML, User DB | FN rate <5% for fires |
| `sendSOSRequest()` | Broadcast help request to nearby users | Location, category, contact | Request ID, responder queue | p95 < 2s | Mesh/cellular, User DB | Delivery 99.5% |
| `findNearestShelter()` | Locate available shelter locations | User location, capacity needs | Sorted shelter list | p95 < 500ms | Shelter DB, Contacts | Distance accuracy ±100m |
| `calculateEvacRoute()` | Compute safe evacuation path | User location, destination | Route geometry, ETA, hazards | p95 < 5s | Hazard Models, Road DB | Route passable 95%+ |
| `reportAnimalRescue()` | Register animal needing rescue | Home location, animal type, access info | Rescue ID, responder alert | p95 < 1s | Contacts, Mesh | Visibility 5km radius |
| `acceptRescueOffer()` | Confirm animal rescue assistance | Rescue ID, responder ID | Shared location trigger | p95 < 500ms | Location sharing | Auto-share 4 hours |
| `contributeToFund()` | Submit donation for relief | Fund ID, amount | Transaction ID, receipt | p95 < 2s | Payment processor | PCI compliance 100% |
| `setVehicle()` | Register user's vehicle | Make, model, year, 4WD, chains | Vehicle profile | p95 < 500ms | Vehicle DB | Lookup accuracy 99% |
| `updateVehicleSpecsList()` | Fetch updated specs for make/model | Vehicle record | Specs JSON | Batch daily | NHTSA vPIC API | Completeness 98% |
| `calculateSafeRoute()` | Route considering 2WD vs 4WD roads | Vehicle type, hazards | Route with road type | p95 < 5s | Hazard Models, Road DB | Passability 90%+ |
| `viewWeatherForecast()` | Display 7-day forecast for location | User location | 7 days x 24 hours | p95 < 500ms | NWS API, Cache | Accuracy vs actual ±3F |
| `simulateWeather()` | Model hazard behavior under user-selected conditions | Weather params, fuel type | Fire/flood/avalanche map | p95 < 10s | Hazard Models | RMSE <10% |
| `requestEmergencyMode()` | Simplify map to critical info only | User location, hazard type | Stripped map + essential layers | p95 < 500ms | Hazard Models | Load <1s on slow conn |
| `markSafeStatus()` | Confirm self as safe or need help | User ID, status | Status broadcast to contacts | p95 < 500ms | Contacts DB, Mesh | 99.9% delivery |
| `requestLocalHelp()` | Ask nearby users for specific task | Task type, location, urgency | Help request broadcast | p95 < 2s | User DB, Mesh | Coverage 99% populated |
| `respondToHelpRequest()` | Volunteer to assist someone | Request ID, capabilities | Match confirmation | p95 < 500ms | Contacts, Mesh | Reply rate >50% |
| `viewSkiRunConditions()` | Show run status, avalanche risk, crowding | Ski area, run | Status, conditions heatmap | p95 < 500ms | Ski DB, Hazard Models | Update frequency 1/day |
| `reportSkiConditions()` | Submit feedback after descending run | Run ID, ratings | Aggregated conditions | p95 < 500ms | Ski DB | Data quality 90%+ |
| `requestSkiPatrolHelp()` | Alert ski patrol to incident | Location on mountain, incident type | Patrol dispatch | p95 < 2s | Dispatch, Ski patrol | Response time <10min |
| `queryNearestCharging()` | Find phone charging stations | User location, charger type | Station list with distance | p95 < 500ms | POI DB, Map | Coverage 95% urban |
| `logGeigerReading()` | Submit radiation measurement | Location, reading, device type | Reading recorded | p95 < 1s | Radiation DB, Mesh | Data validation 100% |
| `contributeStory()` | Submit "people helping people" narrative | Text, photos, user_id | Story moderation queue | p95 < 1s | Moderation system | Review <24h SLA |
| `viewPeopleMaps()` | See nearby users and emergency contacts | User location, privacy settings | Contact locations at set granularity | p95 < 500ms | Contact DB, Location sharing | Privacy compliance 100% |
| `saveLocation()` | Store frequently-used address | Address, label | Saved location record | p95 < 500ms | User DB | Autocomplete accuracy 95% |
| `navigateTo()` | Start turn-by-turn navigation | Destination, route type | Navigation UI | p95 < 2s | Map tiles, Hazard Models | ETA accuracy ±15% |
| `detectImpassablRoute()` | Identify blocked or dangerous roads | User location, road ID | Impassable flag, alternatives | p95 < 5s | Hazard Models, Road DB | FP rate <2% |
| `propagateRoadBlockage()` | Broadcast road closure via mesh | Location, blockage reason | Mesh broadcast | p95 < 1s | Mesh network | Delivery 95%+ |
| `suggestBackupRoute()` | Offer alternative evacuation paths | Current location, primary route blocked | Ordered route alternatives | p95 < 3s | Road DB, Hazard Models | Passability 85%+ |
| `countEvacuationCapacity()` | Calculate exit route bandwidth vs demand | Zone geometry, road widths | Capacity per route, queue time | p95 < 10s | Road DB, Population grid | Accuracy ±20% |
| `routeByLeastCongestion()` | Suggest route with fewest predicted users | User location, destination, hazard | Route balancing | p95 < 5s | Hazard Models, Road DB | Time saved >10% vs primary |
| `enableEmergencyMode()` | Activate simplified interface during event | Event ID, severity | Stripped map with critical layers | p95 < 1s | App state | UX load <500ms |

**Key Algorithms:** Evacuation routing uses Dijkstra with dynamic hazard cost, vehicle-specific constraints, and capacity balancing. Shelter matching uses geospatial indexing (R-tree). Hazard visualization uses client-side vector rasterization (WebGL). Help request broadcast uses mesh flooding with TTL.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, PostGIS, TimescaleDB, Redis, NATS, S3

### PostgreSQL + PostGIS

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone_number VARCHAR(20),
  default_vehicle_id BIGINT REFERENCES vehicles(id),
  emergency_contacts JSONB,
  disability_status VARCHAR(100),
  children_count INT,
  animals_count INT,
  trusted_neighbors BIGINT[],
  location_share_granularity VARCHAR(20)
);

CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) NOT NULL,
  is_default BOOLEAN,
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  length_cm INT,
  width_cm INT,
  height_cm INT,
  curb_weight_kg INT,
  turn_radius_m DECIMAL,
  undercarriage_clearance_cm INT,
  drivetrain VARCHAR(20),
  passenger_capacity INT,
  has_snow_tires BOOLEAN,
  has_chains BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hazard_reports (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id BIGINT REFERENCES users(id) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  photo_ref VARCHAR(500),
  cv_confidence DECIMAL,
  verified_count INT DEFAULT 0,
  disputed_count INT DEFAULT 0,
  status VARCHAR(20),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE shelters (
  id BIGSERIAL PRIMARY KEY,
  location GEOMETRY(Point, 4326) NOT NULL,
  name VARCHAR(500),
  capacity_base INT,
  capacity_current INT,
  wheelchair_accessible BOOLEAN,
  pet_friendly BOOLEAN,
  medical_capability VARCHAR(100),
  owner_contact_id BIGINT,
  opening_status VARCHAR(20),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE help_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id BIGINT REFERENCES users(id) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  category VARCHAR(50),
  urgency VARCHAR(20),
  description TEXT,
  contact_preference VARCHAR(50),
  responder_ids BIGINT[],
  status VARCHAR(20),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE animal_rescues (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id BIGINT REFERENCES users(id) NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  animal_type VARCHAR(50),
  animal_count INT,
  access_instructions TEXT,
  hide_a_key_location TEXT,
  responder_id BIGINT,
  rescue_status VARCHAR(20),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  grid_x INT,
  grid_y INT,
  forecast_url VARCHAR(500),
  last_fetched TIMESTAMP WITH TIME ZONE,
  forecast_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ski_runs (
  id BIGSERIAL PRIMARY KEY,
  ski_area_id BIGINT REFERENCES ski_areas(id),
  name VARCHAR(200),
  difficulty VARCHAR(20),
  geometry GEOMETRY(Polygon, 4326),
  groomed_status VARCHAR(20),
  width_m INT,
  vertical_drop_m INT,
  average_grade DECIMAL,
  aspect VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ski_conditions (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES ski_runs(id) NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE,
  reporter_id BIGINT,
  snow_quality INT,
  ice_patches INT,
  moguls INT,
  visibility INT,
  crowding INT,
  aggregated_condition DECIMAL
);

CREATE TABLE stories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id BIGINT REFERENCES users(id) NOT NULL,
  title VARCHAR(500),
  content TEXT,
  photo_refs VARCHAR(500)[],
  status VARCHAR(20),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by BIGINT
);

CREATE INDEX idx_hazard_reports_location ON hazard_reports USING GIST(location);
CREATE INDEX idx_hazard_reports_created ON hazard_reports(created_at DESC);
CREATE INDEX idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX idx_help_requests_location ON help_requests USING GIST(location);
CREATE INDEX idx_animal_rescues_location ON animal_rescues USING GIST(location);
CREATE INDEX idx_ski_runs_area ON ski_runs(ski_area_id);
```

### TimescaleDB

```sql
CREATE TABLE user_locations (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id BIGINT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  accuracy_m INT,
  context VARCHAR(50)
);
SELECT create_hypertable('user_locations', 'time', if_not_exists => TRUE);
CREATE INDEX idx_user_locations_user_time ON user_locations (user_id, time DESC);
```

### Redis

```
Key patterns:
  user:[user_id]:location → {lat, lon, timestamp}
  user:[user_id]:vehicle → {make, model, year}
  hazard:[report_id]:status → verified_count, disputed_count
  shelter:[shelter_id]:capacity → current_occupancy
  help_request:[request_id]:responders → [user_ids]

TTL: Location 5 minutes, Shelter capacity 10 minutes, Help requests 4 hours
```

### NATS Streams

```
Subject: public_users.hazards.reported
Subject: public_users.hazards.verified
Subject: public_users.help.requested
Subject: public_users.help.responded
Subject: public_users.animals.rescue_offered
Subject: public_users.routes.recalculated
Subject: public_users.map.updated
Retention: 7 days, 1GB
```

### S3

```
Bucket: beacon-public-users
Prefix: /reports/{report_id}/ → {photo.jpg, metadata.json}
Prefix: /stories/{story_id}/ → {photos/}
Retention: 2 years for reports (legal), 90 days for intermediate assets
Access: Signed URLs for user download
```

**Data Size Estimate:** 500M+ hazard reports/month, 10M help requests/month, 50M user location events/day = ~100GB/month.

**Archival Strategy:** Location data deleted after event + 30 days. Hazard reports kept 2 years. Help request metadata kept 6 months.

---

## 5. UI Components

**Screens:**
- Map view (main)
- Hazard reporting modal
- Evacuation routing detail
- Shelter finder list
- Help request broadcast
- Weather forecast 7-day
- Ski resort run conditions
- Animal rescue form
- Safe status check-in
- Emergency mode (simplified)
- Settings (location sharing, vehicle, contacts)

**Buttons/Controls:**
- "Report Flame": Red, top-right map
- "SOS / Get Help": Red circle, bottom-right
- "Mark Safe": Green, prominent in alert phase
- "Find Shelter": Teal #0097B2, main map
- "Start Navigation": Teal #0097B2, evacuation route
- "Request Help": Orange, help modal
- "Offer Rescue": Teal #0097B2, animal rescue
- "Share Location": Navy #0B0F2A toggle, settings

**Map Layers:**
- Base map: Terrain, roads, buildings
- Hazard layer: Fire perimeter (orange), flood extent (blue), avalanche zones (red), tornado path (purple), z-order 100, update 1min
- Shelter layer: Hospital + emergency icons (green), z-order 80, update 10min
- Evacuation route: Polyline (green for clear, yellow for caution, red for dangerous), z-order 90, update 5s
- User location: Dot (blue for self, gray for others), z-order 50, update 30s
- Help requests: Exclamation markers (orange), z-order 95, update real-time
- Traffic/bottleneck: Heatmap (red = congested), z-order 85, update 2min
- Ski area boundary: Light purple polygon, z-order 20
- Run conditions: Color-coded heatmap (green/yellow/red), z-order 75, update 1/day

**Notifications/Alerts:**
- Hazard alert: Push + in-app banner, "Wildfire nearby: evacuation recommended"
- Help request match: Push, "User nearby needs help with [task]"
- Rescue offer: In-app, "Rescuer accepting animal at [address]"
- Route recalculated: In-app, "Primary route blocked, using alternate"
- Shelter capacity: In-app, "Shelter reaching capacity, considering next nearest"
- Location request denied: In-app, "Responder unable to reach your location, try routing around"

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A for primary actions, teal #0097B2 for help/evacuation, red for danger states.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-mobile-app | React Native / iOS Swift | `npm run build:ios && npm run build:android` | Mobile team |
| beacon-map-renderer | Mapbox GL JS + WebGL | `npm run build` | Maps team |
| beacon-public-api | Node.js / Express | `npm run build && npm run test` | Backend team |
| beacon-vehicle-db | Python / FastAPI | `pip install -r requirements.txt && pytest` | Data team |
| beacon-hazard-router | Go / gRPC | `go build ./...` | Routing team |

**Deployment:** Docker containers on Kubernetes. ECS for API scaling. CloudFront CDN for static map tiles.

**CI/CD:** GitHub Actions. Lint on PR, unit tests on commit, integration tests on merge to main, canary deploy to staging, 10% roll-out to production.

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Design finalized, API contracts, mobile UX mockups
2. **Months 2-4:** Core map, hazard reporting, help request backend
3. **Months 4-5:** Routing integration, shelter finder, vehicle manager
4. **Months 5-6:** Weather & ski integration, UI polish
5. **Month 6+:** Beta in 3 pilot cities, production rollout

**Build Phases:**
- Phase 1: Map view, hazard reports, basic alerts (2 months)
- Phase 2: Evacuation routing, shelters, help requests (2 months)
- Phase 3: Weather, vehicle mgmt, ski resort, stories (2 months)

**Test Coverage Targets:** 85% unit, 60% integration, 30% e2e. Priority: routing accuracy, hazard detection, location sharing privacy.

**Deployment Strategy:** Canary 10% → 50% → 100%. Rollback if error rate >0.5%.

**Monitoring Metrics:** Map load p95 < 500ms, route calculation p95 < 5s, help request response time median 2min, hazard report accuracy 95%+.

**Improvement Research:** User feedback on evacuation routes (post-event surveys), A/B test notification urgency levels, analyze help request acceptance patterns by category.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:** CCPA (location data), Good Samaritan (volunteer help), ADA (shelter accessibility), Child safety (parental contact info).

**PII Handled:** Name, location, phone, email, emergency contacts, vehicle details, disability status, health notes.

**Encryption:**
- In-transit: TLS 1.3
- At-rest: AES-256-GCM for location data, photo data
- Keys: AWS KMS

**Audit Trail:** All help requests, location shares, and shelter access logged. Retained 6 months. User can view audit in privacy dashboard.

**Data Retention:** Location 30 days post-event, hazard reports 2 years, help requests 6 months, animal rescues 1 year.

**Third-Party Integrations:** NWS API (read-only, no data sharing), NHTSA vPIC (vehicle specs), Mapbox (tiles, map rendering), Stripe (donations).

---

## 9. Mesh/Offline

**Offline-First Features:**
- View cached map, hazards, shelters (last 6 hours)
- Report hazards locally, sync when connected
- View evacuation routes from last received alert
- Receive help requests via mesh flooding
- Broadcast SOS via mesh flooding (4-hop range ~500m)

**Sync Strategy:** CRDT for help requests (last-write-wins on responder list). Location syncs only when connectivity returns (not real-time, but capture on reconnect).

**Cache Size:** Map tiles 500MB (priority: user location + 10km radius), forecasts 50MB, routes 100MB, hazard layer 200MB = ~1GB target.

**Priority Queue:** Location reports → hazard reports → help requests → shelter updates → stories.

**Compression:** GeoJSON simplified to 4 decimals, WEBP for photos, gzip for JSON.

---

## 10. Update Protocols

**Update Frequency:** Continuous deployment for bug fixes, weekly feature releases, monthly major updates.

**Rollout Strategy:** Staged 2% → 10% → 50% → 100%. Monitor error rate, crash rate, battery drain.

**Rollback Plan:** Automatic rollback if error rate >1%, crash rate >0.1%, or user-reported safety issue.

**User Notification:** In-app banner for major updates. Automatic background update for patches. Opt-in beta for experimental features.

**Testing Before Release:** Staging env with 1000 real users, A/B test on 5% production, 48h observation period before full rollout.

---

## 11. Cross-Module Dependencies

**Consumes:**
- Vehicle Manager (16): Vehicle specs, user vehicle profiles
- Normal Weather (19): Forecasts, alerts, simulator
- Ski Resort Module (18): Run conditions, avalanche risk
- Account & Auth (43): User profiles, verification
- Hazard Models: Fire spread, flood risk, avalanche
- Location Sharing (44): Granularity controls, privacy settings
- Notification system: Alert delivery, channels

**Provides:**
- EMS Admin (42): Hazard reports, help requests, population density
- Vehicle Manager: Vehicle selection feedback
- Hazard Models: User-reported conditions, ground truth
- Stories system: User narratives for social feed

**Critical Path:** Account & Auth, Location Sharing, Vehicle Manager must ship first.

**Teams to Consult:**
- EMS team (42): Help request integration, alert integration
- Maps team: Tile rendering, layer management
- Safety team: Liability, volunteer vetting
- Privacy team: Location data handling, CCPA

**Potential Conflicts:** Help requests + liability (who's responsible?). Location data + privacy expectations. Hazard reports + misinformation.

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (API servers, workers): $50K
- Database (PostgreSQL, TimescaleDB, sharding): $20K
- Cache (Redis, session state): $5K
- Storage (S3, location history): $15K
- CDN (map tiles, photos): $25K
- Third-party APIs (NWS, Mapbox, vehicle DB): $10K
- Total: ~$125K/month

**Personnel (Monthly):**
- Team lead (1): $15K
- Backend engineers (4): $60K
- Mobile engineers (2): $30K
- QA/data analyst (1): $10K
- Total: ~$115K/month

**Optimization Ideas:**
- Implement tile-level caching (reduce CDN hits 30%)
- Use local vehicle spec cache (reduce API calls 50%)
- Compress location history (reduce DB storage 40%)

---

## 13. Agent Monitor Team

**5 Agents:**

1. **Quality Agent:** Monitors code, tests, latency, crash rate
   - Alert: Route calculation latency p95 >10s
   - Alert: Test coverage drops below 80%
   - Alert: Crash rate >0.1% for 30 minutes

2. **Research Agent:** Monitors hazard report accuracy, forecast drift, condition reporting quality
   - Alert: Hazard detection FN rate >5%
   - Alert: User feedback on route accuracy <3/5 stars
   - Alert: Weather forecast RMSE >5F

3. **Business Agent:** Monitors usage metrics, cost, user satisfaction
   - Alert: Cost per active user >$2
   - Alert: Help request response time >5 minutes
   - Alert: Shelter availability below 50% in any zone

4. **Compliance Agent:** Monitors privacy, security, legal compliance
   - Alert: Unauthorized location access detected
   - Alert: Good Samaritan liability incident reported
   - Alert: Help request matching policy violation detected

5. **Lead Agent:** Orchestrates other 4, escalates patterns to human lead
   - Escalates: 3+ agents alert simultaneously
   - Escalates: Potential safety incident
   - Escalates: User privacy complaint

**Reporting:** Each agent reports to module owner + domain head (quality → eng lead, research → data lead, business → product lead, compliance → legal lead).

---

## 14. Validation Practices

**Accuracy Targets:**
- Hazard detection: 95% sensitivity, 98% specificity (FN worse than FP)
- Evacuation route: 90% passable (user can actually traverse)
- Shelter match: 100% correctness (wrong shelter = safety issue)
- Weather forecast interpolation: RMSE <3F for temperature

**Loss Weighting:**
- False negative hazard: 1000x cost (missed fire = deaths)
- False positive hazard: 1x cost (unnecessary evacuation = inconvenience)
- Wrong shelter match: 100x cost (sent to wrong location = safety issue)

**A/B Testing:**
- Route suggestion (primary vs alternate): measure adoption, user feedback on safety
- Help request urgency levels: measure response rate by level
- Location sharing granularity defaults: measure privacy comfort vs coordination effectiveness

**Drift Detection:**
- Hazard detection accuracy: weekly validation against ground truth
- Route passability: daily user feedback, incident reports
- Weather forecast: compare NWS forecast to actual observations

**Validation Data:** Ground truth hazards (CAL FIRE, USGS), historical routes (post-event analysis), user feedback surveys (weekly 100 users).

---

## 15. Data Science Considerations

**Model Selection:** Hazard detection uses ensemble of CV (fire detection), sensor fusion (wind + fuel + temperature), and user reports (weighted by reporter credibility). Evacuation routing uses Dijkstra with learned hazard costs.

**Training Data:**
- Hazard detection: 50K labeled fire images (CAL FIRE + historical), 10K flood events (USGS), 5K avalanche observations
- Route quality: 1000 historical evacuation routes with user feedback
- Condition reporting: 100K user submissions with photo + report

**Retraining Schedule:** Hazard models monthly (new season data). Route model quarterly. User feedback incorporated weekly.

**Benchmarks:** Hazard detection baseline 85% accuracy (YOLO-based), target 95%. Route ranking baseline 70% user preference, target 85%.

**Failure Cases:** Hazard detection struggles with obscured fire (smoke, night), floods with no clear boundary, avalanche under deep snow. Handled with conservative thresholds + user override.

**Explainability:** Show hazard confidence score + source (CV, sensor, user). Show route ranking rationale (shortest, safest, least congested).

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Mobile: React Native (cross-platform), native modules for location/camera
- Backend: Node.js/Express for API, Go for routing engine, Python for data pipeline
- Maps: Mapbox GL JS, WebGL for custom rendering
- Database: PostgreSQL + PostGIS, TimescaleDB, Redis
- Messaging: NATS, gRPC for inter-service

**External Dependencies:**
- mapbox-gl ^2.15 (pinned minor version)
- react-native ^0.72
- express ^4.18
- Security scanning: npm audit, dependabot on all repos

**CI/CD Pipeline:**
- Lint: ESLint, Prettier, Go fmt
- Tests: Jest (unit), integration tests on staging DB, e2e on real devices
- Security: OWASP dependency check, code scanning (CodeQL)
- Performance: Load test on 10K concurrent users, memory profiling
- Deployment: Docker image build, push to ECR, K8s rollout with 10% canary

**Technical Debt:**
- Refactor old VectorTile rendering code (high CPU usage)
- Decouple help-request module from user-profile module
- Add comprehensive API documentation

**SLA & Runbooks:**
- Availability: 99.5% (1 hour downtime/month acceptable during disaster)
- Latency: p95 <500ms for map load, p95 <5s for routes
- Error rate: <0.1% 5xx errors
- Oncall runbook: Check K8s pod status, review error logs, contact map provider if CDN down

**Scalability:** Expected 1M concurrent users during major disaster. Bottleneck: Routing engine (currently 5s for 1000 requests). Mitigation: Route caching, geographic sharding, async computation.

---

## Notes

- Keep hazard report thresholds conservative (favor false alarms over misses)
- All location data treated as sensitive; apply CCPA controls
- Volunteer safety paramount: background checks, liability waiver, kill switch on help coordination
- Ski resort module can be gated behind regional toggle
- Vehicle specs auto-lookup reduces friction; fallback to silhouette gallery for unknowns
