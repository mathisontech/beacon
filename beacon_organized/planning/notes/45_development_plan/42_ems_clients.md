# EMS Client Administration Module

Emergency management systems for EMS/government agencies. Provides admin dashboard for zone drawing, event declaration, resource management, dispatch coordination, help request triage, mutual aid, team management, and stakeholder database.

---

## 1. Module Metadata

**Team:** EMS Operations

**Parent Module:** Beacon Core Platform

**Sub-Modules:** Dispatch Layer, Resource Manager, Team Management, Contacts Database, Event Declaration

**Goal:** Enable EMS agencies to coordinate emergency response, manage resources, and direct public assistance at scale.

**Mission Alignment:** Saves lives by coordinating professional response, distributing resources efficiently, and mobilizing public volunteer capacity.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| Zone drawing | EMS admin | GeoJSON polygon | On-demand | `{zone_id, name, type, geometry}` |
| Event declaration | EMS admin | JSON | On-event | `{event_id, hazard_type, severity_level, zones}` |
| Help requests | Public users | JSON | Real-time | `{request_id, location, category, urgency}` |
| Resource status | EMS teams | JSON | Real-time | `{vehicle_id, status, location, occupancy}` |
| 911 calls | 911 system | CAP/JSON | Real-time | `{call_id, location, incident_type}` |
| Team on-duty | EMS staff | JSON | On-shift | `{user_id, role, start_time, units}` |
| Mutual aid requests | Neighboring agencies | JSON | On-request | `{request_id, resource_type, quantity, deadline}` |
| **Output: Admin map** | Admin dashboard | GeoJSON/tiles | Real-time | `{zones, resources, requests, 911 calls}` |
| **Output: Dispatch layer** | Dispatch staff | GeoJSON | Real-time | `{routes, incidents, unit locations}` |
| **Output: Help broadcasts** | EMS/volunteers | JSON | On-request | `{category, location, details, responder_count}` |
| **Output: Resource report** | Management | JSON | Periodic | `{available, deployed, en_route, out_of_service}` |
| **Output: Evacuation orders** | Public/media | CAP/JSON | On-declare | `{zone, instruction, shelter_list, ETA}` |

**Output Consumers:** EMS admins, dispatch, field teams, public users, neighboring agencies, media/public affairs.

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `drawZone()` | Create operational zone via polygon drawing | Admin ID, polygon coords | Zone ID, geometry | p95 < 2s | User auth | Multi-polygon support |
| `createEvent()` | Declare emergency event with hazard + zones | Event type, hazard, zones | Event ID, alert broadcast | p95 < 1s | Alert system | Timezone handling correct |
| `assignZonesToTeams()` | Map zones to specific EMS units/divisions | Zone IDs, team IDs | Assignment records | p95 < 500ms | Team DB | No duplicate assignments |
| `viewResourceStatus()` | Real-time inventory of vehicles, personnel, equipment | EMS admin ID | Resource dashboard | p95 < 500ms | Resource DB | Update frequency 1min |
| `deployResource()` | Send unit to location | Unit ID, destination, priority | Dispatch confirmation | p95 < 500ms | Dispatch system | ETA calculated |
| `updateResourceLocation()` | Receive GPS update from mobile unit | Unit ID, location, status | Location stored, broadcast | p95 < 500ms | GPS receiver, Mesh | Message queue deduplicated |
| `trackResourceStatus()` | Monitor unit status (available, in-transit, on-scene, returning) | Unit ID | Current status | p95 < 500ms | Resource DB | State machine validated |
| `createHelpRequest()` | Public user creates help request; EMS sees structured form | Location, category, description | Help request ID, triage queue | p95 < 2s | Public users, Location | Category taxonomy validated |
| `triageHelpRequest()` | Admin assigns priority and responder category | Request ID, category, priority | Triage result | p95 < 500ms | Help request DB | EMS/volunteer split calculated |
| `assignHelpResponder()` | Dispatch volunteer or staff to help request | Request ID, responder ID | Assignment alert | p95 < 500ms | User DB, Mesh | Push notification sent |
| `trackHelpCompletion()` | Mark help request fulfilled, record outcome | Request ID, status, notes | Completion logged | p95 < 500ms | Help request DB | Audit trail updated |
| `publishDispatchLayer()` | Make routes/incident info visible to EMS field teams | Event ID, layer config | Layer broadcast | p95 < 500ms | Dispatch system | Vector tile format |
| `confirmEvacRoute()` | EMS team verifies evacuation route as passable | Route ID, confirming_unit_id | Route status updated | p95 < 500ms | Route DB | Confirmation timestamp logged |
| `reportRouteLocked()` | Team marks route as blocked/hazardous | Route ID, blockage_reason, location | Route flagged, alternatives suggested | p95 < 1s | Route DB, Hazard models | Propagated to public users |
| `queryCanReachLocation()` | Model: can any resource reach location given conditions? | Location, time_limit_minutes | Feasibility: reachable/unreachable/timeout | p95 < 10s | Road DB, Resource DB | Test against historical events |
| `getWelfareCheckPriority()` | Score welfare checks for dispatch prioritization | Area, demographics, vulnerability | Sorted priority list | p95 < 5s | Population DB, Hazard models | Bias audit quarterly |
| `dispatchPublicWelfareCheck()` | Request nearby volunteers to check on address | Address, household_id | Broadcast to volunteers | p95 < 2s | Contacts DB, Public users | Volunteer response tracked |
| `requestMutualAid()` | Reach out to neighboring agencies for resources | Resource type, quantity, deadline | Mutual aid request ID, response list | p95 < 2s | Mutual aid DB | Cross-jurisdiction visibility |
| `generateMutualAidCode()` | Create temporary access code for non-Beacon units | Resource type, duration | 12-char code, secret link | p95 < 500ms | Auth system | Code single-use, time-limited |
| `validateMutualAidCode()` | Partner agency enters code, gains temporary EMS view | Code, agency_id | Access granted, permission level | p95 < 500ms | Auth system | Code consumed on use |
| `viewTeamSchedule()` | Admin sees on-duty staff and shift assignments | EMS admin ID | Team roster, availability | p95 < 500ms | Team DB | Overtime flagged |
| `callUpOffDuty()` | EMS initiates call-up notification to off-duty staff | Activation ID, unit_type | Notification broadcast | p95 < 500ms | Staff contact DB | Response tracking |
| `manageBackup()` | Admin designates backup incident commander + responsibilities | Event ID, primary_id, backup_id | Succession plan recorded | p95 < 500ms | Team DB | Automatic escalation on disconnect |
| `fetchNextOfKin()` | During emergency, retrieve next-of-kin contacts for at-risk users | Zone ID | Contact list (hashed IDs visible to EMS only) | p95 < 2s | Contact DB | HIPAA-compliant access |
| `displayEvacuationStatus()` | Real-time tracking of zone evacuation progress | Event ID, zone ID | Member count departed/in-transit/sheltered | p95 < 1s | Location DB, Group DB | Update every 30s |
| `requestStructureDamageConfirmation()` | Ask volunteers to verify if building destroyed | Address, parcel_id | Survey broadcast to nearby users | p95 < 1s | Contacts DB, Mesh | Photo verification optional |
| `aggregateConditionReports()` | Combine user-submitted road/weather/hazard reports | Zone ID, report_type | Real-time condition heatmap | p95 < 5s | Reports DB | Clustering by type |
| `requestPhotosArea()` | Ask users at location to submit photos for damage assessment | Zone geometry, description | Photo request broadcast | p95 < 1s | Public users, Mesh | Photos geotagged automatically |
| `viewAllTieredVehicles()` | Display all response vehicles (ambulance, fire, police, ATV) on map | EMS admin ID | Vehicle layer with symbols | p95 < 500ms | Vehicle DB, Location | Icons by type/status |
| `assignMeetingPoint()` | Designate rendezvous location for teams | Location, teams, purpose | Meeting point broadcast | p95 < 500ms | Contacts DB, Messaging | GPS coordinates + photos |
| `markStagingArea()` | Declare safe holding area for resources/personnel pre-deployment | Location, capacity | Staging area marked on map | p95 < 500ms | Resource DB | Capacity auto-calculated from area |
| `blockRoadAccess()` | Reserve roads for EMS traffic only | Road ID, zone | Road blocked to public, alternative routes suggested | p95 < 1s | Route DB | Time-limited blocking |
| `enableEventOnlyMode()` | Switch EMS system to incident-focused interface | Event ID | Simplified dashboard, critical info only | p95 < 500ms | Event system | Customizable by EMS role |
| `onboardClientAccount()` | Set up new EMS agency account, team hierarchy, permissions | Client name, jurisdiction, contact | Account created, invite links generated | p95 < 1s | Auth system | Multi-factor onboarding verification |
| `inviteSpecialDesignation()` | Generate and send invite code for school principal, utility rep, etc. | Designation type, recipient email | Invite code + link | p95 < 500ms | Auth system | 30-day expiration |
| `verifyDesignationCredentials()` | Confirm school principal/utility rep/etc credentials | User ID, designation_type | Designation verified or rejected | p95 < 5s | External DB (HRIS, government) | Audit logged |

**Key Algorithms:** Resource dispatch uses proximity + capacity matching. Help request triage uses category classification + geospatial clustering. Welfare check prioritization uses demographic + hazard risk scoring. Mutual aid uses resource availability + inter-agency agreements.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, PostGIS, TimescaleDB, Redis, NATS, S3

### PostgreSQL + PostGIS

```sql
CREATE TABLE ems_clients (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agency_name VARCHAR(500),
  jurisdiction VARCHAR(500),
  jurisdiction_geometry GEOMETRY(MultiPolygon, 4326),
  contact_id BIGINT REFERENCES users(id),
  backup_contact_id BIGINT REFERENCES users(id),
  status VARCHAR(20)
);

CREATE TABLE ems_zones (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  zone_name VARCHAR(200),
  zone_type VARCHAR(50),
  geometry GEOMETRY(Polygon, 4326),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_team_id BIGINT
);

CREATE TABLE ems_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  event_type VARCHAR(100),
  hazard_type VARCHAR(50),
  severity_level INT,
  affected_zones BIGINT[],
  declared_by BIGINT REFERENCES users(id),
  declared_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20)
);

CREATE TABLE help_requests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creator_user_id BIGINT REFERENCES users(id),
  location GEOMETRY(Point, 4326),
  category VARCHAR(50),
  urgency VARCHAR(20),
  description TEXT,
  assigned_responder_id BIGINT REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  triage_level INT,
  assigned_to_ems BOOLEAN,
  assigned_to_volunteer BOOLEAN
);

CREATE TABLE ems_resources (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  vehicle_id BIGINT REFERENCES vehicles(id),
  resource_type VARCHAR(50),
  unit_name VARCHAR(100),
  occupancy_current INT,
  occupancy_max INT,
  status VARCHAR(20),
  location GEOMETRY(Point, 4326),
  last_location_update TIMESTAMP WITH TIME ZONE,
  equipment_manifest JSONB,
  on_duty_staff BIGINT[],
  deployed_to BIGINT REFERENCES ems_zones(id)
);

CREATE TABLE dispatch_incidents (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES ems_events(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  incident_type VARCHAR(100),
  location GEOMETRY(Point, 4326),
  responders_assigned BIGINT[],
  status VARCHAR(20),
  dispatch_notes TEXT
);

CREATE TABLE ems_routes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES ems_events(id),
  route_name VARCHAR(200),
  geometry GEOMETRY(LineString, 4326),
  evacuation_capacity_vehicles INT,
  confirmed_passable BOOLEAN,
  confirmed_by BIGINT[],
  confirmed_at TIMESTAMP WITH TIME ZONE,
  blocked_status VARCHAR(20),
  blockage_reason TEXT,
  blockage_location GEOMETRY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  role VARCHAR(50),
  hierarchy_level INT,
  on_duty BOOLEAN,
  assigned_unit_id BIGINT REFERENCES ems_resources(id),
  started_duty_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(client_id, user_id)
);

CREATE TABLE mutual_aid_agreements (
  id BIGSERIAL PRIMARY KEY,
  client_a_id BIGINT NOT NULL REFERENCES ems_clients(id),
  client_b_id BIGINT NOT NULL REFERENCES ems_clients(id),
  resource_types VARCHAR(100)[],
  max_resources INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE mutual_aid_requests (
  id BIGSERIAL PRIMARY KEY,
  requesting_client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  event_id BIGINT REFERENCES ems_events(id),
  resource_type VARCHAR(50),
  quantity_requested INT,
  deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20),
  fulfilled_by_client_id BIGINT REFERENCES ems_clients(id),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mutual_aid_codes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES ems_events(id),
  code VARCHAR(20) UNIQUE,
  partner_agency_id BIGINT,
  resource_type VARCHAR(50),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by BIGINT REFERENCES users(id)
);

CREATE TABLE contacts_stakeholders (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  contact_type VARCHAR(50),
  contact_name VARCHAR(500),
  organization VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(500),
  primary_contact BOOLEAN,
  secondary_contact BOOLEAN,
  property_or_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ems_zones_geometry ON ems_zones USING GIST(geometry);
CREATE INDEX idx_ems_zones_client ON ems_zones(client_id);
CREATE INDEX idx_ems_events_client ON ems_events(client_id);
CREATE INDEX idx_ems_events_created ON ems_events(created_at DESC);
CREATE INDEX idx_help_requests_location ON help_requests USING GIST(location);
CREATE INDEX idx_help_requests_triage ON help_requests(triage_level, status);
CREATE INDEX idx_ems_resources_client ON ems_resources(client_id);
CREATE INDEX idx_ems_resources_location ON ems_resources USING GIST(location);
CREATE INDEX idx_dispatch_incidents_event ON dispatch_incidents(event_id);
CREATE INDEX idx_ems_routes_event ON ems_routes(event_id);
CREATE INDEX idx_team_members_client ON team_members(client_id);
CREATE INDEX idx_mutual_aid_requests_status ON mutual_aid_requests(status);
```

### TimescaleDB

```sql
CREATE TABLE resource_location_history (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  resource_id BIGINT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  status VARCHAR(50)
);
SELECT create_hypertable('resource_location_history', 'time', if_not_exists => TRUE);
CREATE INDEX idx_resource_history_id_time ON resource_location_history (resource_id, time DESC);
```

### Redis

```
Key patterns:
  event:[event_id]:zones → [zone_ids]
  event:[event_id]:resources_deployed → {resource_id → status}
  event:[event_id]:help_requests_triage → [request_ids_by_priority]
  zone:[zone_id]:resource_locations → {resource_id → {lat, lon, timestamp}}
  team:[client_id]:on_duty → [user_ids]

TTL: Zone assignments 24h, Event context 7 days, Resource locations 1 hour
```

### NATS Streams

```
Subject: ems.events.declared
Subject: ems.events.ended
Subject: ems.resources.deployed
Subject: ems.resources.status_changed
Subject: ems.help_requests.created
Subject: ems.help_requests.assigned
Subject: ems.help_requests.completed
Subject: ems.routes.confirmed
Subject: ems.routes.blocked
Subject: ems.mutual_aid.requested
Subject: ems.mutual_aid.granted
Retention: 30 days, 50GB
```

### S3

```
Bucket: beacon-ems-clients
Prefix: /client/{client_id}/events/{event_id}/
Prefix: /client/{client_id}/reports/
Retention: 2 years for incident reports, 90 days for intermediate logs
Access: Signed URLs for authorized personnel
```

**Data Size Estimate:** 5000+ EMS agencies, avg 50 zones per agency = 250K zones. 100K events/year with avg 1000 help requests per event = 100M help request records. Location history 10M updates/day = 100GB/month.

**Archival Strategy:** Archive events after 1 year. Keep help request metadata 2 years. Delete location history after 30 days.

---

## 5. UI Components

**Screens:**
- Admin dashboard (zones, events, resources, help requests)
- Zone drawing canvas
- Event declaration wizard
- Dispatch layer (resources, routes, incidents)
- Resource inventory
- Help request queue (triage, assignment)
- Team management (schedule, on-duty status)
- Mutual aid coordination
- Contacts/stakeholder database
- Reports (post-event analytics)

**Buttons/Controls:**
- "Draw Zone": Navy #0B0F2A, map toolbar
- "Declare Event": Red, prominent
- "Deploy Resource": Teal #0097B2, resource list
- "Assign Help": Orange, help request queue
- "Request Mutual Aid": Purple, team view
- "Confirm Route": Green, route detail
- "Call Up Staff": Red, team management
- "Generate Aid Code": Navy #0B0F2A, mutual aid form

**Map Layers:**
- Zones: Colored polygons (operational regions), z-order 70, update on-draw
- Resources: Vehicle icons (ambulance, fire, police, ATV) with occupancy badges, z-order 80, update 1min
- Help requests: Exclamation markers (color by triage level), z-order 85, update real-time
- Routes: Polylines (green = confirmed, yellow = unconfirmed, red = blocked), z-order 75, update on-confirm
- Incidents: Cross markers (red), z-order 90, update real-time
- Staging areas: Pentagon markers (purple), z-order 65

**Notifications/Alerts:**
- Event declared: Broadcast to all users, "Emergency event declared for [zone]"
- Help request assigned: Push to responder, "[Category] request at [address]"
- Route blocked: Alert to dispatch, "Route [name] reported blocked by [reason]"
- Resource depleted: Alert to admin, "Shelter [name] at 100% capacity"
- Mutual aid granted: Notification to requester, "[Agency] can provide [resource]"

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A for primary, red for emergency, teal #0097B2 for actions.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-ems-admin | React + Redux | `npm run build` | Frontend team |
| beacon-ems-api | Node.js/Express | `npm run build && npm run test` | Backend team |
| beacon-dispatch-layer | Go/gRPC | `go build ./...` | Dispatch team |
| beacon-zone-drawing | Canvas.js / Mapbox | `npm run build` | Maps team |

**Deployment:** Docker on Kubernetes, separate cluster from public API for security isolation.

**CI/CD:** GitHub Actions with additional security scanning. Restricted deployment approval for EMS systems.

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Design, API contracts, zone drawing prototype
2. **Months 2-4:** Admin dashboard, event declaration, resource tracking
3. **Months 4-5:** Help request triage, dispatch integration
4. **Months 5-6:** Mutual aid, team management, contacts database
5. **Month 6+:** Beta with 3 pilot EMS agencies, production rollout

**Build Phases:**
- Phase 1: Zone drawing, event declaration, basic admin (2 months)
- Phase 2: Resource tracking, dispatch layer, routing (2 months)
- Phase 3: Help requests, team management, mutual aid (2 months)

**Test Coverage Targets:** 90% unit (safety-critical), 80% integration, 20% e2e.

**Deployment Strategy:** Blue-green deployment. Canary 1 test agency → 10% of agencies → 50% → 100%.

**Monitoring Metrics:** Admin dashboard load p95 <200ms, resource update latency p95 <500ms, help request assignment latency p95 <2s, help request triage accuracy 95%+.

**Improvement Research:** User feedback on zone drawing UX, dispatch efficiency metrics, help request fulfillment success rates.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:** HIPAA (911 calls, health data), CMMC L2 (government systems), FedRAMP (federal integration), Good Samaritan (volunteer liability).

**PII Handled:** EMS staff names, phone numbers, shift schedules, emergency contacts, 911 call details, next-of-kin.

**Encryption:**
- In-transit: TLS 1.3 + mTLS for inter-agency
- At-rest: AES-256-GCM
- Keys: Managed in HSM, separate per client

**Audit Trail:** All zone changes, event declarations, resource deployments, help request assignments logged with actor + timestamp. Retained 2 years.

**Data Retention:** 911 calls + incident data 2 years (legal hold). Resource location history 30 days. Team schedules 1 year.

**Third-Party Integrations:** 911 CAD system (incident data), HRIS (team roster verification), Government ID database (special designation verification).

---

## 9. Mesh/Offline

**Offline-First Features:**
- View cached zones, teams, resources
- Create/edit zones locally, sync on reconnect
- Dispatch instructions composed locally, broadcast on reconnect
- View cached help requests
- Update resource status locally, broadcast on reconnect

**Sync Strategy:** CRDT for zone edits, Last-Write-Wins for resource status.

**Cache Size:** Zones 100MB, resources 50MB, team roster 50MB = ~200MB.

**Priority Queue:** Resource locations → events → help requests → zones.

**Compression:** GeoJSON simplified to 3 decimals, gzip for JSON.

---

## 10. Update Protocols

**Update Frequency:** Bug fixes hotfixed same day. Feature releases weekly. Major updates monthly.

**Rollout Strategy:** Staged per agency: 1 test agency → 10% → 100%.

**Rollback Plan:** Automatic rollback if error rate >0.1%, any safety incident reported.

**User Notification:** In-app banner, mandatory training before major feature rollout.

**Testing Before Release:** Staging with real 911 CAD system integration, tabletop exercise with pilot agency.

---

## 11. Cross-Module Dependencies

**Consumes:**
- Account & Auth (43): User verification, special designations
- Location Sharing (44): User location for dispatching
- Public Users (40): Help requests, hazard reports
- Hazard Models: Real-time hazard state, forecasts
- Vehicle Manager (16): Resource specs, capacity
- Evacuation Manager: Shelter assignments, routes
- Notification system: Alerts, broadcasts

**Provides:**
- Public Users: Evacuation orders, route confirmations, help request assignments
- Hazard Models: Ground truth on hazard status, resource deployment data
- Reports system: Incident data, performance metrics
- Media/Public Affairs: Evacuation status, resource needs

**Critical Path:** Account & Auth, Public Users, Location Sharing must ship first.

**Teams to Consult:**
- Legal team: 911 integration liability, Good Samaritan
- Security team: CMMC L2 compliance, inter-agency data sharing
- 911 CAD vendor: Integration, API contracts
- State Emergency Management: Statewide coordination

**Potential Conflicts:** Help request → liability (who's responsible if volunteer fails?). Mutual aid codes → security (prevent spoofing). Next-of-kin data → privacy (HIPAA concerns).

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (API, admin dashboard): $40K
- Database (PostgreSQL, TimescaleDB, security): $25K
- NATS/messaging: $10K
- Redis cache: $5K
- Security (firewalls, monitoring): $15K
- 911 CAD integration: $10K
- Total: ~$105K/month

**Personnel (Monthly):**
- Team lead (1): $15K
- Backend engineers (4): $60K
- Frontend engineers (2): $30K
- QA/integration specialist (1): $12K
- Customer success (1): $10K
- Total: ~$127K/month

**Optimization Ideas:**
- Self-serve 911 CAD integration (reduce vendor cost 20%)
- Cache zone definitions locally (reduce DB load 30%)
- Batch resource location updates (reduce NATS traffic 40%)

---

## 13. Agent Monitor Team

**5 Agents:**

1. **Quality Agent:** Code, tests, API latency, crash rate
   - Alert: Admin dashboard load time p95 >500ms
   - Alert: Help request assignment latency >5s
   - Alert: Test coverage <85%

2. **Research Agent:** Help request triage quality, dispatch efficiency, route passability
   - Alert: Help request fulfillment rate <80%
   - Alert: Route accuracy (actual vs confirmed) <90%
   - Alert: Triage accuracy <95%

3. **Business Agent:** Cost per agency, adoption rate, user satisfaction
   - Alert: Cost per agency >$2000/month
   - Alert: Feature adoption <50% among pilot agencies
   - Alert: Help request response time >10 minutes

4. **Compliance Agent:** Privacy, security, legal compliance, liability
   - Alert: Unauthorized access to 911 data detected
   - Alert: Help request liability incident reported
   - Alert: CMMC L2 compliance audit failure

5. **Lead Agent:** Orchestrates other 4, escalates patterns
   - Escalates: Safety incident in help request system
   - Escalates: Potential liability claim
   - Escalates: 3+ agents alert simultaneously

**Reporting:** Each agent reports to module owner + domain head.

---

## 14. Validation Practices

**Accuracy Targets:**
- Help request triage: 95% accuracy (correctness critical for safety)
- Route confirmation: 100% accuracy (team safety depends on passable routes)
- Resource dispatch: 90% success (units reach assigned locations on time)
- Evacuation status: 99% accuracy (admin decision-making depends on real data)

**Loss Weighting:**
- False negative help request (triage too low): 1000x cost
- False positive help request (over-triage): 1x cost
- Wrong resource deployment: 100x cost
- Evacuation status inaccuracy: 100x cost

**A/B Testing:**
- Help request UI: measure triage accuracy, assignment latency
- Route confirmation workflow: measure adoption, route safety
- Mutual aid matching: measure speed, resource suitability

**Drift Detection:**
- Help request triage accuracy: weekly validation
- Dispatch success rate: daily analysis
- Resource deployment time: continuous monitoring
- EMS user satisfaction: quarterly surveys

**Validation Data:** Post-event debriefs (help request fulfillment), 911 CAD records (dispatch accuracy), incident reports (outcome validation).

---

## 15. Data Science Considerations

**Model Selection:** Help request triage uses decision tree (interpretable to EMS staff). Dispatch routing uses Dijkstra with real-time traffic. Welfare check prioritization uses risk scoring (demographics + hazard vulnerability).

**Training Data:**
- Help request triage: 10K labeled requests from 5 EMS agencies, category distribution
- Dispatch routing: 5K historical deployments with travel time ground truth
- Welfare check priority: 1000 households with vulnerability scores + hazard outcomes

**Retraining Schedule:** Help request model monthly. Dispatch routing weekly (seasonal road changes). Welfare prioritization quarterly.

**Benchmarks:** Triage baseline 85% accuracy, target 95%. Dispatch routing baseline 80% on-time arrival, target 90%.

**Failure Cases:** Triage misses high-priority non-obvious cases (domestic violence). Dispatch routing fails in completely blocked areas. Welfare prioritization misses new vulnerabilities.

**Explainability:** Show help request triage reason ("High priority: [criteria]"). Show welfare check ranking rationale ("Elderly, near fire perimeter").

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Frontend: React + Redux, Mapbox GL JS
- Backend: Node.js/Express + Go/gRPC
- Database: PostgreSQL + PostGIS, TimescaleDB, Redis
- Messaging: NATS
- 911 integration: Custom adapter layer

**External Dependencies:**
- mapbox-gl ^2.15
- express ^4.18
- grpc ^1.28
- Security scanning: npm audit, OWASP Zap
- External: 911 CAD system (vendor-specific)

**CI/CD Pipeline:**
- Lint: ESLint, Go fmt
- Tests: Jest, integration tests with staging 911 CAD
- Security: CMMC L2 scanning, code review required
- Performance: Load test 100 concurrent admins, 10K resources
- Deployment: Separate security-hardened cluster, manual approval for prod

**Technical Debt:**
- Refactor 911 CAD adapter layer (tightly coupled to vendor)
- Decouple zone drawing from event declaration
- Add comprehensive API documentation for 911 integration

**SLA & Runbooks:**
- Availability: 99.9% (EMS-critical)
- Help request assignment: p95 <2s
- Resource update: p95 <500ms
- Error rate: <0.01%
- Oncall runbook: Check K8s, check 911 CAD connectivity, contact vendor if needed

**Scalability:** Target 5000 EMS agencies, 100K concurrent resources during major multi-state event. Bottleneck: 911 CAD integration bandwidth. Mitigation: batch updates, fallback to polling.

---

## Notes

- EMS onboarding must include extensive training (complex system, safety-critical)
- 911 CAD integration non-negotiable for EMS adoption
- Help request assignment has direct liability implications; extreme care required
- Mutual aid codes must be unhackable (no enumeration, no reuse)
- All data handling must be HIPAA-compliant (medical incident data)
- Consider federal/state/local hierarchy for statewide deployments
