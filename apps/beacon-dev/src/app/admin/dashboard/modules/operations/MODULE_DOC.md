# Event Operations Module – Comprehensive Development Documentation

## Module Overview

The Event Operations module manages declared incidents and coordinated response operations within the Beacon emergency management platform. It orchestrates Teams Manager (organized response units) and Resource & Dispatch Manager (physical asset tracking) to enable seamless emergency response from incident declaration through team deployment and mutual aid coordination.

**Module Status:** Architecture phase
**Owner:** [To be assigned]
**Team:** EMS Operations
**Critical Priority:** High — Direct liability for emergency response effectiveness

---

## 1. Module Architecture

### Hierarchy
```
Event Operations (parent module)
├── Teams Manager (sub-module)
│   ├── Team Composition & Roles
│   ├── Shift Scheduling
│   ├── Backup Management
│   ├── Field Communication
│   ├── Location Tracking
│   └── Mutual Aid Coordination
└── Resource & Dispatch Manager (sub-module)
    ├── Personnel Tracking
    ├── Vehicle Management
    ├── Equipment & Supply Inventory
    ├── 911 Integration
    ├── Dispatch Queue
    ├── Resource Accessibility Modeling
    └── Logistics Coordination
```

### Data Flow Architecture
```
External Sources → Data Ingestion
    ↓
Event Declaration System → Hazard Agents (automatic triggers)
    ↓
Event Context (zones, severity) → Teams Manager
    ↓
Team Activation → Resource & Dispatch Manager
    ↓
Real-time GPS + Status → Dispatch Layer (broadcast to EMS)
    ↓
Resource Requests ← Help Request System (public users)
    ↓
Mutual Aid Coordination ← Neighboring Agencies
    ↓
Post-Event Archival → Analytics & Lessons Learned
```

### Integration Points
- **Event Declaration:** Receives hazard type, severity, affected zones from hazard agents
- **Public Users Module:** Help requests, evacuation status confirmations, welfare check requests
- **Special Designations:** School principals (evacuation coordination), utilities (infrastructure status), hospital reps (surge capacity)
- **911 CAD System:** Incident data, dispatch calls, resource assignments
- **Mesh Networking:** Offline sync for zones, team rosters, resource locations
- **Location Services:** Real-time GPS for field units, breadcrumb trails
- **Notifications:** Push alerts for team activation, help request assignment, route blockage
- **Evacuation Routing:** Evacuation zones, shelter assignments, route confirmation

---

## 2. Sub-Module: Teams Manager

Manages all organized response units (EMS, fire, police, special services) with real-time coordination, role-based access, and mutual aid integration.

### Core Functions

#### 2.1 Team Composition & Organization

**Function: `getTeamHierarchy(client_id)`**
- Returns organizational hierarchy mirror of EMS/fire/police agency structure
- Example: Fire Chief → Battalion Chief → Captain → Firefighter
- Access control: Team leads only see subordinate teams
- Output: Hierarchical JSON with role permissions per level

**Function: `createTeam(client_id, team_data)`**
- Input: Team name, type (EMS, fire, police, special), parent team, jurisdiction
- Validates hierarchy consistency (no circular references)
- Assigns unique team ID and icon color
- Outputs: Team ID + broadcast to admin dashboard

**Function: `addTeamMember(team_id, user_id, role, start_date)`**
- Assigns user to team with specific role (paramedic, firefighter, incident commander, etc.)
- Validates user credentials (EMS license, fire dept employee, etc.)
- Sets role permissions (can dispatch units, can confirm routes, etc.)
- Outputs: Team member record + notification to team lead

**Function: `updateTeamRoles(team_id, role_definitions)`**
- Admin defines custom roles (e.g., "EMS Supervisor" with specific permissions)
- Role permissions: dispatch authority, help request triage, mutual aid requests, zone drawing
- Broadcast changes to all team members
- Outputs: Role update log + permission refresh

#### 2.2 Shift Scheduling & Availability

**Function: `createShift(client_id, shift_data)`**
- Input: Start time, duration, team, assigned personnel
- Supports overlapping shifts for handoff periods
- Outputs: Shift ID, calendar broadcast to team

**Function: `markOnDuty(user_id, shift_id, unit_id)`**
- User begins shift, assigned to specific unit (ambulance 12, fire engine 5, etc.)
- Broadcasts availability to dispatch layer
- Triggers call-up for backup if understaffed
- Outputs: On-duty status + occupancy badge update

**Function: `markOffDuty(user_id, shift_id)`**
- User clocks out, removes from dispatch availability
- If critical role (incident commander), triggers backup succession protocol
- Outputs: Availability update + escalation if needed

**Function: `viewTeamAvailability(client_id)`**
- Real-time dashboard showing on-duty staff, available units, capacity
- Color-code: green (fully staffed), yellow (reduced capacity), red (critical gaps)
- Shows projected availability next 2 hours (for overtime planning)
- Outputs: Availability dashboard + staffing alerts

**Function: `getOvertimeTracking(client_id, date_range)`**
- Tracks cumulative hours per staff member
- Alerts when approaching maximum allowed hours
- Suggests call-up candidates for next shift
- Outputs: Overtime report + staffing recommendations

#### 2.3 Backup Management & Succession

**Function: `requestBackup(team_id, resource_type, urgency)`**
- EMS/fire chief requests backup resources (ambulances, fire engines, personnel)
- Input: Resource type, quantity, location, deadline
- System searches local resources first, then mutual aid pool
- Outputs: Backup request ID + response countdown display

**Function: `callUpOffDutyStaff(client_id, activation_level)`**
- Initiates emergency call-up to off-duty personnel
- Activation levels: Level 1 (routine), Level 2 (event underway), Level 3 (mass casualty/multi-unit event)
- SMS + app push + automated phone calls
- Tracks acceptance/rejection/response times
- Outputs: Call-up log + arrival ETA estimates

**Function: `designateIncidentCommander(event_id, primary_user_id, backup_user_id)`**
- Marks primary and backup incident commanders for event
- Primary has authority to declare event, request resources, approve mutual aid
- Backup auto-escalates if primary disconnects >5 minutes
- Outputs: Succession plan record + broadcast to team

**Function: `generateMutualAidCode(event_id, agency_name, resource_type, duration_hours)`**
- Creates 12-character alphanumeric code (e.g., `SC-FIRE-2A9X-7K`)
- Non-Beacon agencies enter code, gain temporary EMS view (limited to event geom)
- Code is single-use, time-limited, revocable
- Outputs: Secure code + QR link for easy entry

#### 2.4 Field Communication Channels

**Function: `getTeamChatChannel(team_id, event_id)`**
- Returns encrypted NATS-based chat channel specific to team + event
- Supports text, voice, location sharing, status updates
- Offline-capable: queues messages, syncs on reconnect
- Example: "Fire-Strike-Team-A-EVENT-12345"
- Outputs: Chat channel + message history

**Function: `broadcastTeamNotification(team_id, notification_type, content)`**
- Types: evacuation order, route blockage, resource availability change, help request
- Sends to app + SMS (for field units), email (for leads)
- Mandatory acknowledgment required within 30 minutes
- Outputs: Notification log + ack tracking

**Function: `reportTeamStatus(team_id, status_update)`**
- Team member reports status: "En route to [location]", "On scene", "Unit deployed", "Returning to base"
- Broadcasts to dispatch layer + relevant channels
- Logs timestamp for activity tracking
- Outputs: Status broadcast + timeline

#### 2.5 Real-Time Team Location Tracking

**Function: `updateTeamLocation(unit_id, latitude, longitude, timestamp, accuracy)`**
- Receives GPS from mobile unit every 10-30 seconds (configurable)
- Validates location sanity (not >150mph, not outside jurisdiction without authorization)
- Stores in TimescaleDB for historical tracking
- Broadcasts to dispatch layer + relevant channels
- Outputs: Location broadcast + update latency <500ms p95

**Function: `getTeamLocationBreadcrumb(unit_id, event_id, time_range)`**
- Returns historical path (breadcrumb trail) for incident reconstruction
- Shows route taken, time at each location, dwell time
- Useful for post-event analysis and liability defense
- Outputs: GeoJSON LineString + timeline

**Function: `enableLocationTracking(team_id, event_id)`**
- Activates real-time location sharing for team during event
- Each team member's phone sends GPS + battery status
- Location visible only to EMS (not public) unless manually shared
- Outputs: Tracking enabled broadcast

**Function: `disableLocationTracking(team_id, event_id)`**
- Stops location sharing after event ends or manually disabled
- Last known locations cached for 48 hours
- Outputs: Tracking disabled log

#### 2.6 Mutual Aid Coordination (Cross-Agency)

**Function: `requestMutualAid(requesting_client_id, resource_type, quantity, deadline, event_id)`**
- EMS agency broadcasts resource request to partner agencies
- Input: Ambulances, fire engines, rescue teams, equipment, personnel
- Partner agencies see request in real-time, can accept with ETA
- Automatic matching if mutual aid agreement pre-negotiated
- Outputs: Mutual aid request ID + response tracking

**Function: `acceptMutualAidRequest(receiving_client_id, request_id, offered_resources)`**
- Partner agency commits resources to responding agency
- Tracks what's committed, real-time availability
- Coordinates ETA with receiving agency for staging area
- Outputs: Acceptance confirmation + resource broadcast

**Function: `validateMutualAidAgreement(client_a_id, client_b_id, resource_types)`**
- Verifies formal mutual aid agreement exists between agencies
- Example: "Riverdale Fire ↔ Metropolis Fire: 2 engines, 1 rescue team"
- Checks agreement active (not expired/revoked)
- Outputs: Agreement valid/invalid + terms

**Function: `getMutualAidPartners(client_id, jurisdiction_geometry, distance_km)`**
- Returns list of neighboring agencies within distance who could provide mutual aid
- Ranks by agreement status (formal agreement > ad-hoc capability)
- Shows historical response times + available resources
- Outputs: Partner list + capability matrix

**Function: `initiateSecureHandoff(requesting_agency_id, supporting_agency_id, resource_ids, code)`**
- Supporting agency enters mutual aid code, gains temporary map access
- Handoff location + briefing info shown
- Code ensures only pre-authorized agencies can see sensitive data
- Outputs: Access granted + status broadcast

### Teams Manager Database Schema

```sql
CREATE TABLE ems_teams (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  team_name VARCHAR(200),
  team_type VARCHAR(50), -- EMS, Fire, Police, Special
  parent_team_id BIGINT REFERENCES ems_teams(id),
  hierarchy_level INT, -- 1=division, 2=company, 3=shift
  jurisdiction_geometry GEOMETRY(MultiPolygon, 4326),
  icon_color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id)
);

CREATE TABLE team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES ems_teams(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  role VARCHAR(100), -- Paramedic, Firefighter, Incident Commander, etc.
  role_permissions JSONB, -- {dispatch_authority: true, help_triage: true, ...}
  verified_credentials VARCHAR(500), -- EMS license #, fire dept ID, etc.
  start_date DATE,
  end_date DATE,
  UNIQUE(team_id, user_id)
);

CREATE TABLE team_shifts (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES ems_teams(id),
  shift_name VARCHAR(100), -- "A Shift", "Night Shift"
  start_time TIMESTAMP WITH TIME ZONE,
  duration_hours INT,
  assigned_personnel BIGINT[], -- user_ids
  on_duty_personnel BIGINT[], -- currently active
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_location_history (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  unit_id BIGINT NOT NULL,
  team_id BIGINT NOT NULL,
  location GEOMETRY(Point, 4326),
  accuracy_meters INT,
  battery_percent INT
);
SELECT create_hypertable('team_location_history', 'time', if_not_exists => TRUE);

CREATE TABLE mutual_aid_agreements (
  id BIGSERIAL PRIMARY KEY,
  client_a_id BIGINT NOT NULL REFERENCES ems_clients(id),
  client_b_id BIGINT NOT NULL REFERENCES ems_clients(id),
  resource_types VARCHAR(100)[], -- [Ambulance, Fire Engine, Rescue Team]
  max_resources INT,
  jurisdiction_distance_km INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  UNIQUE(client_a_id, client_b_id)
);

CREATE TABLE mutual_aid_requests (
  id BIGSERIAL PRIMARY KEY,
  requesting_client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  event_id BIGINT REFERENCES ems_events(id),
  resource_type VARCHAR(50),
  quantity_requested INT,
  deadline TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20), -- pending, accepted, fulfilled, rejected
  fulfilling_client_id BIGINT REFERENCES ems_clients(id),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mutual_aid_codes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES ems_events(id),
  code VARCHAR(20) UNIQUE, -- SC-FIRE-2A9X-7K
  generating_agency_id BIGINT REFERENCES ems_clients(id),
  partner_agency_id BIGINT,
  resource_type VARCHAR(50),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by BIGINT REFERENCES users(id),
  UNIQUE(event_id, code)
);

CREATE INDEX idx_ems_teams_client ON ems_teams(client_id);
CREATE INDEX idx_ems_teams_hierarchy ON ems_teams(client_id, hierarchy_level);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_shifts_team ON team_shifts(team_id);
CREATE INDEX idx_team_location_history_unit_time ON team_location_history (unit_id, time DESC);
CREATE INDEX idx_mutual_aid_requests_status ON mutual_aid_requests(status, deadline);
```

---

## 3. Sub-Module: Resource & Dispatch Manager

Tracks all physical assets and orchestrates dispatch operations for response units, equipment, and supplies.

### Core Functions

#### 3.1 Personnel Tracking

**Function: `getAvailablePersonnel(client_id, date, role_filter)`**
- Returns list of staff scheduled for shift, marked on-duty
- Filters by role (paramedic, firefighter, incident commander, etc.)
- Shows current assignment + occupancy status
- Outputs: Personnel list with availability dashboard

**Function: `trackPersonnelStatus(user_id, status)`**
- Statuses: available, dispatched, on-scene, transporting, returning, out-of-service
- Broadcasts status change to dispatch layer + team leads
- State machine validation: available → dispatched → on-scene → returning → available
- Outputs: Status update + notification broadcast

**Function: `deployPersonnelToLocation(user_id, destination_location, priority)`**
- Assigns individual responder to location
- Calculates ETA based on current location + vehicle + conditions
- Broadcasts assignment to responder + team lead
- Outputs: Dispatch confirmation + ETA estimate

#### 3.2 Vehicle Management

**Function: `registerVehicle(client_id, vehicle_data)`**
- Input: Make, model, year (auto-lookup NHTSA vPIC for specs), unit number, type icon
- Retrieves: Length, width, height, turn radius, clearance, capacity
- Stores manual specs for specialty vehicles (ATV, helicopter, boat)
- Outputs: Vehicle ID + equipment template

**Function: `updateVehicleStatus(vehicle_id, status, location, occupancy)`**
- Statuses: available, in-transit, on-scene, out-of-service, maintenance
- Updates location + occupancy count (current vs. max)
- Broadcasts to dispatch layer with vehicle icon
- Outputs: Real-time vehicle status broadcast

**Function: `trackVehicleLocation(vehicle_id)`**
- Receives GPS from vehicle's mobile unit
- Stores in TimescaleDB time-series
- Validates location sanity (not >150mph, jurisdiction boundaries)
- Outputs: Location broadcast + history stored

**Function: `getVehicleCapacity(vehicle_id)`**
- Returns occupant capacity + equipment manifest
- Example: Ambulance 12 = 2 paramedics + 1 patient stretcher + 4 seats
- Used for dispatch routing + evacuation capacity planning
- Outputs: Capacity JSON + utilization status

**Function: `manageEquipmentManifest(vehicle_id)`**
- Records equipment loaded on vehicle (AED, oxygen, stretchers, rescue tools)
- Updates before/after deployment for accountability
- Alerts if critical equipment missing
- Outputs: Equipment checklist + dispatch approval

#### 3.3 Equipment & Supply Inventory

**Function: `trackSupplyInventory(client_id, supply_type, quantity_on_hand)`**
- Supply types: oxygen bottles, stretchers, AEDs, IV supplies, medications, fuel, food/water, blankets
- Real-time count per location (station, base, supply depot)
- Alerts when stock falls below reorder threshold
- Outputs: Inventory dashboard + reorder alerts

**Function: `deploySupplies(supply_id, quantity, destination_location)`**
- Moves supplies from depot to forward staging area or unit
- Tracks supply consumption during event
- Outputs: Deployment log + inventory update

#### 3.4 911 Integration & Dispatch Queue

**Function: `ingestCADIncident(incident_data)`**
- Receives incident from 911 CAD system (standardized format: call ID, address, incident type, time)
- Normalizes address (geocodes to point), validates jurisdiction
- Queues for dispatcher review
- Outputs: Incident in dispatch queue + notification to dispatch

**Function: `getDispatchQueue(client_id)`**
- Returns all pending incidents sorted by priority + timing
- Priority: life-threatening > urgent > routine > information
- Shows ETA to incident + available resources
- Outputs: Dispatch queue dashboard

**Function: `assignIncidentToUnit(incident_id, unit_id, priority)`**
- Links incident to specific ambulance/fire engine/police unit
- Unit receives notification + route to incident
- Broadcasts assignment to dispatch layer
- Outputs: Dispatch assignment + unit notification

**Function: `trackIncidentStatus(incident_id)`**
- Statuses: dispatched, en-route, on-scene, patient care, transport, complete
- Updates as unit reports status changes
- Shows ETA to hospital for transport incidents
- Outputs: Real-time incident progress tracking

**Function: `validateBeaconCoverage(address)`**
- Checks if address covered by Beacon (EMS client jurisdiction)
- If YES: dispatch through Beacon with full data sharing
- If NO: warn user "Report received but EMS may not have been notified. Call 911 directly."
- Outputs: Coverage status + guidance

#### 3.5 Dispatch Layer Broadcast

**Function: `publishDispatchLayer(event_id)`**
- Activates real-time dispatch layer visible to EMS field teams
- Shows: unit locations + statuses, incidents, routes, zones, shelter locations
- Updates every 30-60 seconds
- Accessible via mobile app, web dashboard, offline cache
- Outputs: Layer broadcast + real-time updates

**Function: `updateDispatchLayerElement(element_id, new_data)`**
- Modifies dispatch layer data: unit location, incident status, zone boundary
- Broadcasts changes immediately
- Example: Ambulance 12 moves to new location, icon updates on all screens
- Outputs: Element update broadcast

**Function: `confirmEvacuationRoute(route_id, confirming_unit_id)`**
- EMS team verifies evacuation route is passable
- Records confirmation timestamp, confirming unit
- Propagates passable status to public users (green checkmark on route)
- Outputs: Route status update + public notification

**Function: `reportRouteBlocked(route_id, blockage_reason, blockage_location)`**
- EMS team marks route as impassable (fire, debris, flooding, etc.)
- Suggests alternative routes to public users
- Blocks route from public evacuation suggestions
- Outputs: Route blocked broadcast + alternate route suggestions

#### 3.6 Resource Accessibility Modeling

**Function: `canUnitReachLocation(unit_id, destination_location, time_limit_minutes)`**
- Predicts if unit can reach destination given current conditions (road closures, hazard zones, traffic)
- Uses: current location, vehicle specs, real-time hazard data, confirmed route status
- Returns: reachable / unreachable / timeout
- Confidence score based on data freshness
- Outputs: Reachability prediction + confidence

**Function: `getOptimalResourceDispatch(incident_location, incident_type, availability_time)`**
- Recommends closest available unit that can reach location in time
- Considers: distance, unit type match, vehicle capacity, current assignments
- Returns ranked list: [Unit A (ETA 3min), Unit B (ETA 5min), Unit C (unreachable)]
- Outputs: Dispatch recommendation + ETA estimates

**Function: `getWelfareCheckPriority(area_geometry, demographic_data)`**
- Scores welfare checks for dispatch prioritization
- Factors: elderly/disabled concentration, hazard proximity, accessibility
- Returns sorted priority list of addresses needing welfare checks
- Outputs: Priority-ranked welfare check list

#### 3.7 Logistics Coordination

**Function: `assignMeetingPoint(location, teams, purpose, time)`**
- Designates team rendezvous location (staging area, incident command post, etc.)
- Broadcasts to team leads + dispatch
- Shows GPS coordinates + overhead photo (from base map)
- Outputs: Meeting point broadcast + team notification

**Function: `markStagingArea(location, capacity, resource_type)`**
- Designates safe holding area for resources pre-deployment
- Example: "School parking lot, 50 vehicle capacity, for evacuation staging"
- Calculates capacity auto-magically from area geometry
- Outputs: Staging area marked on dispatch layer

**Function: `blockRoadForOperations(road_id, geometry, time_duration_hours)`**
- Reserves road exclusively for EMS traffic
- Broadcasts "Road closed to public" warning
- Suggests alternate routes to public users
- Time-limited blocking (auto-expires)
- Outputs: Road blocked broadcast + public notification

#### 3.8 Account Onboarding & Special Designations

**Function: `onboardClientAccount(client_data)`**
- Input: Agency name, jurisdiction, primary contact
- Creates EMS client account + team hierarchy mirror
- Generates invite links for account setup
- Outputs: Client account + setup links

**Function: `generateDesignationInviteCode(designation_type, recipient_email)`**
- Creates invite code for special designation (school principal, utility rep, hospital rep, fire chief, etc.)
- Code: 12-char alphanumeric, single-use, 30-day expiration
- Distribution via email link
- Outputs: Invite code + recipient notification

**Function: `verifyDesignationCredentials(user_id, designation_type)`**
- Validates credentials via external databases:
  - School Principal: District HRIS lookup
  - Utility Rep: Company HR verification
  - Fire Chief: Government employee directory
  - Hospital Rep: CMS National Provider Identifier
  - EMS Director: State NREMT database
- Outputs: Designation verified or rejected + audit log

### Resource Manager Database Schema

```sql
CREATE TABLE ems_resources (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  vehicle_id BIGINT REFERENCES vehicles(id),
  resource_type VARCHAR(50), -- Ambulance, Fire Engine, Rescue Team, etc.
  unit_name VARCHAR(100),
  unit_number INT,
  occupancy_current INT DEFAULT 0,
  occupancy_max INT,
  status VARCHAR(20), -- available, in-transit, on-scene, out-of-service
  location GEOMETRY(Point, 4326),
  last_location_update TIMESTAMP WITH TIME ZONE,
  equipment_manifest JSONB, -- {oxygen: 3, stretcher: 1, AED: 1, ...}
  on_duty_personnel BIGINT[], -- user_ids assigned
  assigned_to_incident_id BIGINT REFERENCES dispatch_incidents(id),
  deployed_to_zone_id BIGINT REFERENCES ems_zones(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicles (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT REFERENCES ems_clients(id),
  make VARCHAR(100),
  model VARCHAR(100),
  year INT,
  vpic_specs JSONB, -- {length_m: 7.5, width_m: 2.4, height_m: 3.0, ...}
  length_m DECIMAL,
  width_m DECIMAL,
  height_m DECIMAL,
  turn_radius_m DECIMAL,
  clearance_cm INT,
  drivetrain VARCHAR(20), -- 2WD, 4WD, AWD
  passenger_capacity INT,
  towing_capacity_kg INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resource_location_history (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  resource_id BIGINT NOT NULL,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  accuracy_meters INT,
  battery_percent INT,
  status VARCHAR(20)
);
SELECT create_hypertable('resource_location_history', 'time', if_not_exists => TRUE);
CREATE INDEX idx_resource_history_id_time ON resource_location_history (resource_id, time DESC);

CREATE TABLE dispatch_incidents (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES ems_events(id),
  cad_incident_id VARCHAR(50),
  incident_type VARCHAR(100),
  location GEOMETRY(Point, 4326),
  address VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dispatcher_id BIGINT REFERENCES users(id),
  assigned_resources BIGINT[], -- resource_ids
  status VARCHAR(20), -- dispatched, en-route, on-scene, transport, complete
  priority INT -- 1=critical, 2=urgent, 3=routine
);

CREATE TABLE ems_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  event_type VARCHAR(100), -- Wildfire, Flood, Earthquake, Severe Weather, etc.
  hazard_type VARCHAR(50),
  severity_level INT, -- 1-5 scale
  affected_zones BIGINT[], -- zone_ids
  declared_by BIGINT REFERENCES users(id),
  declared_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20), -- active, concluded
  incident_commander_id BIGINT REFERENCES users(id),
  backup_commander_id BIGINT REFERENCES users(id)
);

CREATE TABLE ems_zones (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  zone_name VARCHAR(200),
  zone_type VARCHAR(50), -- Operational, Evacuation, Shelter, Staging, Command Post
  geometry GEOMETRY(Polygon, 4326),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_team_id BIGINT REFERENCES ems_teams(id),
  assigned_resources BIGINT[] -- resource_ids
);

CREATE TABLE ems_routes (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES ems_events(id),
  route_name VARCHAR(200),
  geometry GEOMETRY(LineString, 4326),
  evacuation_capacity_vehicles INT,
  confirmed_passable BOOLEAN DEFAULT FALSE,
  confirmed_by BIGINT[], -- user_ids
  confirmed_at TIMESTAMP WITH TIME ZONE,
  blocked_status VARCHAR(20), -- passable, blocked, hazardous
  blockage_reason TEXT,
  blockage_location GEOMETRY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supply_inventory (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES ems_clients(id),
  supply_type VARCHAR(100), -- Oxygen, Stretcher, AED, Medication, etc.
  quantity_on_hand INT,
  reorder_threshold INT,
  location VARCHAR(200), -- "Station A", "Supply Depot", "Unit 12"
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ems_resources_client ON ems_resources(client_id);
CREATE INDEX idx_ems_resources_location ON ems_resources USING GIST(location);
CREATE INDEX idx_dispatch_incidents_event ON dispatch_incidents(event_id);
CREATE INDEX idx_dispatch_incidents_status ON dispatch_incidents(status);
CREATE INDEX idx_ems_zones_client ON ems_zones(client_id);
CREATE INDEX idx_ems_zones_geometry ON ems_zones USING GIST(geometry);
CREATE INDEX idx_ems_routes_event ON ems_routes(event_id);
```

---

## 4. Event Declaration & Management

### Automatic vs. Manual Declaration

**Automatic Declaration**
- Trigger: Hazard agent threshold met + validation agent approves
- Timeline: Immediate publication (within 5 minutes of trigger)
- Example: USGS confirms fire >100 acres → automatically declare wildfire event
- Human override: Module lead can suppress within 15-minute window (document reason)

**Manual Declaration**
- Initiator: EMS incident commander or module lead
- Timeline: Immediate publication (incident commander assumes responsibility)
- Example: Suspected arson, unconfirmed reports, unusual situation
- Validation: Post-publication (agent flags anomalies within 30 minutes)

### Event Lifecycle

**Phase 1: Detection (T+0-5 min)**
- Hazard agent detects threshold exceeded
- Alert agent notifies module lead
- Module lead reviews, approves/rejects within 15 minutes

**Phase 2: Activation (T+5-15 min)**
- Event declared, EMS contacted
- Default map layers activated (fire extent, evacuation zones, shelter locations)
- Team activation initiated
- Public alert broadcast

**Phase 3: Operational (T+15 min - T+event end)**
- Teams deployed, resources tracked
- Real-time dispatch layer updates
- Help requests triaged + assigned
- Mutual aid coordinated
- Route confirmation/blockage updates
- Evacuation status tracked

**Phase 4: Conclusion (T+event end)**
- Event declared "closed"
- Teams stand down, units return to base
- Location tracking stops
- Evacuation status archived

**Phase 5: Post-Event (T+24h - T+7d)**
- After-Action Report (AAR) due from module lead
- Data archival to cold storage (S3)
- Lessons learned incorporated into model retraining

### Default Layer Activation Per Hazard

**Wildfire Event**
- Hazard: Fire extent (orange heatmap), confidence contours
- Secondary: Air quality index (PM2.5), wind direction, smoke plume
- POI: Evacuation centers, fire hydrant access, water source
- Warning: 5km buffer around fire perimeter

**Flood Event**
- Hazard: Flood extent (blue polygon), depth estimates
- Secondary: Stream flow rates, rainfall radar, dam failure risk
- POI: High-ground shelters, water distribution centers
- Warning: 1km upstream alert zone

**Earthquake Event**
- Hazard: Epicenter, magnitude, depth
- Secondary: Liquefaction zones, aftershock probability
- POI: Hospitals, shelters, emergency supply centers
- Warning: Shaking intensity zones (USGS)

**Severe Weather Event**
- Hazard: Storm track (animated), probability cone
- Secondary: Wind direction, hail/tornado indicators
- POI: Basement shelters, warning sirens
- Warning: 1-hour storm forecast path

### Multi-Hazard (Cascading) Events

**Detection:** Coordinator agent monitors all modules for cascade patterns

**Example Cascades:**
- Earthquake → landslides, dam failures → flood agent activated
- Wildfire → air quality emergency → severe weather agent engaged
- Flooding + active wildfire → containment zones updated dynamically

**Conflict Resolution:**
- If agents recommend conflicting evacuations: merge zones (safety-first, union not intersection)
- Module leads immediately notified of merged event
- Cascade decision logged with reasoning

**Resource Coordination:**
- Single EMS coordinator manages resources across all hazard modules
- Resource requests from one module visible to others (prevent over-allocation)

---

## 5. Core Data Structures & API Endpoints

### API Endpoints

```
POST /api/v1/events
  Create event declaration
  Input: {event_type, hazard_type, severity_level, affected_zones, declared_by}
  Output: {event_id, alert_broadcast}

GET /api/v1/events/{event_id}
  Fetch event details + current status
  Output: Event object + resource deployments + team activations

POST /api/v1/events/{event_id}/zones
  Draw operational zone
  Input: {zone_name, zone_type, geometry, assigned_team_id}
  Output: {zone_id, broadcast}

GET /api/v1/teams/{team_id}/schedule
  View team shift schedule + on-duty status
  Output: Shift roster + availability dashboard

POST /api/v1/teams/{team_id}/member
  Add team member
  Input: {user_id, role, verified_credentials}
  Output: Team member record

POST /api/v1/resources/{resource_id}/location
  Update resource location (GPS)
  Input: {latitude, longitude, accuracy, battery_percent}
  Output: Location broadcast

GET /api/v1/resources?client_id={id}
  List all resources for EMS agency
  Output: Resource list + status dashboard

POST /api/v1/help-requests/{request_id}/assign
  Assign help request to responder
  Input: {responder_id, responder_type: "ems"|"volunteer"}
  Output: Assignment confirmation + responder notification

POST /api/v1/mutual-aid/request
  Request mutual aid from partners
  Input: {resource_type, quantity, deadline, event_id}
  Output: Mutual aid request ID + partner responses

POST /api/v1/mutual-aid/code/generate
  Generate secure code for non-Beacon partner
  Input: {event_id, partner_agency, resource_type, duration_hours}
  Output: {code, expires_at, qr_link}

POST /api/v1/routes/{route_id}/confirm
  EMS team confirms route passable
  Input: {confirming_unit_id}
  Output: Route status update + public notification

POST /api/v1/routes/{route_id}/block
  Mark route as blocked
  Input: {blockage_reason, blockage_location}
  Output: Route blocked broadcast + alternate suggestions

GET /api/v1/dispatch-layer/{event_id}
  Fetch real-time dispatch layer
  Output: GeoJSON with resources, incidents, routes, zones

GET /api/v1/events/{event_id}/ics-export
  Export event data for ICS integration
  Output: GeoJSON + ICS metadata (for incident command)

POST /api/v1/teams/{team_id}/call-up
  Initiate call-up to off-duty staff
  Input: {activation_level, message}
  Output: Call-up log + response tracking
```

### Key Response Objects

**Event Object**
```json
{
  "id": 12345,
  "event_type": "Wildfire",
  "hazard_type": "wildfire_perimeter",
  "severity_level": 4,
  "affected_zones": [101, 102, 103],
  "declared_by": 567,
  "declared_at": "2026-03-25T14:30:00Z",
  "status": "active",
  "incident_commander_id": 567,
  "backup_commander_id": 890,
  "resources_deployed": [1001, 1002, 1003],
  "teams_activated": [10, 11],
  "evacuation_initiated": true,
  "mutual_aid_requested": ["Metropolis Fire", "County EMS"]
}
```

**Resource Object**
```json
{
  "id": 1001,
  "resource_type": "Ambulance",
  "unit_name": "AMB-12",
  "status": "on-scene",
  "location": {"-122.5, 37.8"},
  "occupancy": "2/4",
  "on_duty_personnel": [456, 789],
  "assigned_to_incident_id": 5555,
  "equipment_manifest": {
    "oxygen_bottles": 3,
    "stretchers": 1,
    "aed": 1,
    "iv_supplies": 12
  },
  "last_location_update": "2026-03-25T14:32:15Z"
}
```

**Team Object**
```json
{
  "id": 10,
  "team_name": "Fire Strike Team A",
  "team_type": "Fire",
  "hierarchy_level": 2,
  "members": [
    {
      "user_id": 456,
      "role": "Captain",
      "on_duty": true,
      "assigned_unit_id": 1001
    }
  ],
  "current_shift": "Day Shift",
  "availability": "available",
  "location": "-122.5, 37.8",
  "assigned_zones": [101, 102]
}
```

---

## 6. Employee & Admin Interfaces

### Admin Dashboard Screens

**1. Event Command Center**
- Map view with active event layers
- Team locations + unit statuses
- Help request queue (color-coded by priority)
- Resource inventory at a glance
- Incident commander + backup status
- Mutual aid request tracker
- Button bar: "Draw Zone", "Declare Event", "Deploy Resource", "Request Mutual Aid"

**2. Zone Drawing Canvas**
- Interactive map with polygon drawing tool
- Zone types dropdown: Operational, Evacuation, Shelter, Staging
- Assign team/resources to zone
- Edit/delete existing zones
- Validate geometry (no overlaps, valid coordinates)

**3. Resource Dispatch Board**
- Table: Unit name, type, status, location, occupancy, assignment
- Map layer: Vehicle icons with occupancy badges
- Filters: Status, type, zone, availability
- Action buttons: "Deploy", "Mark Available", "Reassign"
- Real-time update <500ms p95

**4. Team Management**
- Hierarchical org chart (expandable)
- Per-team roster with roles + shift assignments
- On-duty counter (green=full, yellow=reduced, red=critical)
- Call-up controls: Level 1/2/3 activation buttons
- Shift schedule calendar

**5. Help Request Triage Queue**
- List of incoming help requests (category, location, urgency)
- Triage dashboard: priority score + assignment recommendation
- Assign to EMS or volunteer responders
- Track completion status
- Response time metrics

**6. Mutual Aid Coordination**
- Partner agency list + capability matrix
- Pending mutual aid requests (with countdown if deadline)
- Accepted offers + resource tracking
- Code generation form for non-Beacon agencies
- Agreement verification

**7. Evacuation Status**
- Real-time count: Total evacuated, in-transit, sheltered by zone
- Evacuation rate graph (vehicles/min evacuating)
- Route confirmation status (green=confirmed, yellow=unconfirmed, red=blocked)
- Blockage map + alternative route suggestions
- ETA to clear per route

**8. Post-Event Reports**
- After-Action Report (AAR) form
- Timeline view (dispatch calls, decisions, outcomes)
- Accuracy metrics (alerts vs. observed)
- Resource utilization (personnel hours, vehicles deployed)
- Lessons learned documentation

### EMS Field Team Interface

**Mobile App (iOS/Android)**
- Real-time location map (shows team + other units)
- Incident assignment + routing
- Status update buttons: "En route", "On scene", "Patient care", "Returning"
- Help request notifications
- Route confirmation UI ("Confirm route passable?")
- Battery/signal strength indicator
- Offline functionality: view cached zones, pre-composed status messages

**In-Vehicle (Dispatch Hardware)**
- Dispatch console with large touchscreen
- Incoming incident queue + assignment buttons
- Unit location map (all units visible)
- Resource status (occupancy, equipment status)
- Call-up initiation
- Mutual aid response interface

### Special Designation Interfaces

**School Principal**
- Evacuation activation button
- Student location map (neighborhood-granule only)
- Parent-community group chat
- EMS coordination channel
- Shelter opening request form

**Fire Chief**
- Full incident command authority
- Strike team assignment interface
- Evacuation order submission
- Mutual aid request authority
- Resource reallocation dashboard

**Utility Representative**
- Outage extent map (customer locations)
- Work order assignment queue
- Field crew GPS (if opted-in)
- Public notification authority
- Infrastructure status post updates

**Hospital Representative**
- Bed occupancy by unit (ER, ICU, med-surg)
- Incoming ambulance queue
- Surge capacity activation controls
- Mutual aid request interface
- Supply shortage alerts

---

## 7. Integration Requirements

### 911 CAD Integration

**Data Ingestion**
- Format: Standardized CAD incident schema (or vendor-specific adapter)
- Frequency: Real-time updates
- Content: Call ID, address, incident type, caller phone, priority
- Validation: Geocode address, normalize incident type, assign Beacon jurisdiction

**Incident Queue Management**
- Dispatcher sees incidents in Beacon alongside CAD
- Double-entry prevented (CAD incident auto-maps to Beacon incident)
- Resource assignment in Beacon updates CAD unit status (if supported)
- Fallback: Separate tracking if CAD integration unavailable

**Error Handling**
- CAD unavailable: Fall back to manual incident entry
- Address geocode failure: Flag for dispatcher, prompt manual correction
- Incident type unmapped: Auto-assign to "Other", dispatcher categorizes

### Hazard Agent Integration

**Event Trigger Thresholds**

| Hazard Type | Auto-Trigger Condition | Confidence Threshold | Publication Threshold |
|---|---|---|---|
| Wildfire | USGS fire >100 acres | 70% | >50 people affected |
| Flood | USGS gauge >90th percentile | 65% | >30 people affected |
| Earthquake | USGS mag >4.0 | Confirmed | Any confirmation |
| Severe Weather | NWS watch/warning issued | 80% | Any issued warning |

**Event Publication**
- Agent publishes to NATS topic: `ems.events.declared`
- Module lead receives alert (app + SMS)
- Auto-publication begins, module lead can suppress within 15 min
- Suppression logs reason for audit

**Data Export for ICS**
- Endpoint: `/api/v1/events/{event_id}/ics-export`
- Format: GeoJSON + ICS metadata
- Update frequency: Every 5 minutes during active event
- Fields: Incident name, hazard type, extent, confidence, severity

### Evacuation Routing Integration

**Evacuation Zone Coordination**
- Operations module provides zone geometry
- Routing module calculates routes from all addresses in zone
- Route confirmation feeds back to operations (blocked/passable status)
- ETA calculation uses route confirmation + traffic models

**Shelter Assignment**
- Operations module marks shelter locations + capacity
- Routing module suggests shelters based on proximity + capacity
- Operations tracks shelter occupancy (coordinated with shelter staff)

**Mesh Network Sync**
- Zones, routes, team rosters cached locally on field devices
- Offline: View cached data, create/edit zones locally
- Sync: CRDT-based merge when connectivity returns
- Priority: Resource locations > events > help requests > zones

---

## 8. Development Blocks & Unresolved Questions

### Technical Development Blocks

1. **911 CAD Adapter Layer**
   - Vendor-specific implementation (CAD systems vary by region)
   - Need: Standard interface spec for EMS onboarding
   - Blocker: Depends on which CAD vendor piloting EMS uses
   - Solution: Build adapter template, vendor-specific extensions

2. **Zone Drawing UX**
   - Complex to use under stress in emergency
   - Research needed: Rapid polygon creation interaction patterns
   - Test: User studies with dispatchers, validate 30-second zone creation
   - Risk: Poor UX → EMS abandonment

3. **Help Request Triage Accuracy**
   - Decision tree model needed (interpretable to EMS staff)
   - Training data: 10K labeled requests from multiple EMS agencies
   - Challenge: Category imbalance, context-dependent prioritization
   - Target: 95% accuracy, quarterly retraining

4. **Welfare Check Prioritization**
   - Risk scoring model: demographics + hazard proximity + accessibility
   - Data quality: Accurate elderly/disabled registry maintenance
   - Challenge: Bias detection + fairness validation
   - Validation: Post-event outcome audit

5. **Mutual Aid Code Security**
   - Must prevent enumeration attacks (guessing valid codes)
   - Use: Cryptographically secure random, single-use, time-limited
   - Verification: Code validating against event_id prevents replay
   - Audit: Log all code generation/use for compliance

### Design & UX Research Needed

1. **Zone Drawing**
   - What interaction pattern enables rapid polygon creation?
   - Test candidates: Freehand, point-and-click, voice commands
   - Stress testing: Can dispatcher draw zone in <1min under pressure?

2. **Resource Dispatch Workflow**
   - Current: Admin selects unit → assigns location
   - Alternative: AI recommends closest unit, admin confirms
   - Validation: Compare dispatch time + outcome vs. manual selection

3. **Help Request Assignment**
   - UI for triage queue: What info helps dispatcher make decision?
   - Should show: Category, location, urgency, recommended responder type
   - Validation: Triage accuracy + assignment fulfillment rate

4. **Mutual Aid Matching**
   - When multiple agencies can provide resource: Auto-select nearest?
   - Consider: Agreement terms, inter-agency relationships
   - Challenge: Optimize speed vs. fairness across agencies

### Policy & Liability Questions

1. **Help Request Liability**
   - Who's responsible if volunteer fails to assist properly?
   - Insurance requirements for volunteer responders
   - Waiver language required before volunteer acceptance
   - **Solution:** Consult legal + insurance partner before launch

2. **Next-of-Kin Access**
   - During emergency, EMS can see next-of-kin contacts
   - HIPAA implications: Only show during declared event, not general search
   - Access audit: Log all next-of-kin lookups
   - **Solution:** Legal review + audit logging mandatory

3. **Mutual Aid Code Security**
   - Non-Beacon agencies gain temporary access to event map
   - Can they screenshot sensitive data?
   - Mitigation: Watermark screenshots, time-limit access, deactivate code after use
   - **Solution:** Implement technical controls + legal agreements

4. **Welfare Check Accuracy**
   - False negative (mark building evacuated when occupied): High liability
   - Verify via phone? In-person? Photo confirmation?
   - **Solution:** Multiple confirmation sources, escalation for uncertainty

5. **False Alert Liability**
   - If Beacon declares evacuation but hazard doesn't materialize: Cost/liability
   - Mitigation: High confidence thresholds, module lead override, audit trail
   - **Solution:** Insurance policy + legal review of liability cap

### Data Quality & Validation

1. **Team Roster Verification**
   - How to verify EMS staff listed are actually employed?
   - Solution: Integration with HRIS (for large agencies) or manual upload (for small)
   - Ongoing: Periodic verification (annual?) to catch departures

2. **Resource Capacity Data**
   - Vehicle specs lookup via NHTSA vPIC (automated)
   - Equipment manifest: Manual entry + periodic audit
   - Challenge: Keeping manifests current during events + staffing changes

3. **Address Geocoding**
   - 911 calls provide address (often incomplete or misspelled)
   - Validation: Fuzzy match against base map addresses
   - Fallback: Dispatcher manual correction on map

4. **Resource Location GPS**
   - Sanity check: Not >150mph, within jurisdiction (unless mutual aid)
   - Accuracy: Report with accuracy_meters field
   - Offline: Last known position cached, synced on reconnect

---

## 9. Compliance & Safety Framework

### Regulatory Alignment

**NIMS (National Incident Management System)**
- Operations module operates in "support" role to incident commander
- Uses NIMS standard terminology (event, jurisdiction, resource request, units)
- Chain of command: Module lead reports to FEMA operations section chief
- Exports event data to ICS-201 (incident briefing), ICS-202 (objectives), ICS-205 (comms plan)

**HIPAA (Health Insurance Portability & Accountability Act)**
- Applies to: 911 calls, patient transport data, hospital coordination
- Controls: Encrypt at rest (AES-256-GCM), TLS 1.3 in transit, access audit logging
- Access: Only EMS-authorized users see medical incident data
- Retention: 2 years (per medical record retention laws)

**CMMC L2 (Cybersecurity Maturity Model Certification)**
- Required for government contracts (if EMS is county/state)
- Scope: Authentication, encryption, incident response, supply chain security
- Audit: Third-party assessment annually
- **Cost:** ~$50K-100K annually for CMMC compliance

**Good Samaritan Laws**
- Protect volunteers who assist in emergency (liability shield)
- Beacon must ensure legal wording in help request acceptance form
- Insurance: Beacon may need general liability coverage for platform
- **Consult:** Legal counsel in each state (laws vary)

### Data Handling & Privacy

**PII Handled**
- EMS staff names, employee IDs, phone numbers, shift schedules
- Emergency contacts (next-of-kin, family members)
- 911 call details (caller name, phone, incident type)
- Patient medical info (during hospital coordination)

**Encryption**
- In-transit: TLS 1.3 + mTLS for inter-agency communication
- At-rest: AES-256-GCM on PostgreSQL + S3
- Keys: Managed in AWS KMS, rotated annually
- Per-client key isolation (separate keys per EMS agency)

**Access Control**
- Role-based: Admin vs. dispatch vs. field team
- Team-based: Can only see own team + authorized partners
- Jurisdiction-based: Can only see own jurisdiction (except during mutual aid)
- Audit: All access logged with user ID, timestamp, action

**Audit Logging**
- All zone changes, event declarations, resource deployments, help assignments logged
- Retention: 2 years (for legal hold + compliance)
- Searchable: Full-text on action type, user, timestamp
- Immutable: Write-once logs in S3 with object lock

### Incident Response & Escalation

**Safety Incident**
- Definition: Help request resulted in injury, liability claim, breach of agreement
- Response: Incident logged immediately, escalation to legal
- Investigation: Root cause analysis within 24 hours
- Resolution: Policy change + retraining if systemic

**Data Breach**
- Detection: Automated monitoring for unauthorized access
- Response: Disable access, notify affected users, contact legal
- Forensics: Audit log analysis, retain for investigation
- Notification: Follow HIPAA breach notification timeline (60 days)

**System Unavailability**
- SLA: 99.9% uptime (4.3 hours downtime/month)
- Alert: Page on-call engineer if latency p95 >500ms or error rate >0.1%
- Runbook: Check K8s status, database connectivity, 911 CAD integration
- Recovery: Automatic failover if primary unavailable, manual escalation if failover fails

---

## 10. Deployment Architecture

### Technology Stack

**Frontend**
- Framework: React + Redux (state management)
- Mapping: Mapbox GL JS (or Leaflet for offline)
- Mobile: React Native (iOS/Android)
- Responsive: WCAG 2.2 AA compliant, Inter font family

**Backend**
- API Server: Node.js/Express (REST) or Go/gRPC (high-performance dispatch)
- Message Queue: NATS (pub/sub for real-time broadcasts)
- Database: PostgreSQL + PostGIS (geospatial), TimescaleDB (time-series location)
- Cache: Redis (real-time event state, team availability)
- Storage: S3 (incident reports, post-event archival)

**DevOps**
- Containerization: Docker
- Orchestration: Kubernetes (separate security-hardened cluster from public API)
- CI/CD: GitHub Actions (lint, test, security scanning)
- Monitoring: Prometheus + Grafana (latency, error rate, uptime)
- Logging: ELK stack (audit trail, debugging)

**Security**
- Authentication: OAuth 2.0 (for special designations), SAML (for government clients)
- Authorization: Role-based access control (RBAC) per designation
- Secrets: AWS Secrets Manager (API keys, DB passwords)
- OWASP: Regular scanning (top 10 vulnerabilities)
- Code review: Required for all PRs (security team sign-off for EMS systems)

### Deployment Strategy

**Blue-Green Deployment**
- Blue (current) ↔ Green (new version)
- Route traffic from blue to green after validation
- Instant rollback if issues (revert traffic to blue)
- Canary: Route 1% to green first, validate error rate + latency

**Rollout Phases**
1. Test EMS agency (Riverdale Fire): Full validation, shadow mode
2. 10% of agencies: Gradual rollout, monitor closely
3. 50% of agencies: Continued monitoring
4. 100% of agencies: Full rollout, standard SLA applies

**Rollback Triggers**
- Error rate >0.1% sustained >5min
- Latency p95 >2s sustained >5min
- Any safety incident reported by pilot agency
- 911 CAD integration failure
- Database connectivity loss

### Monitoring & Alerting

**Key Metrics**
- Admin dashboard load time p95: <200ms
- Dispatch queue latency (incident creation to display): p95 <1s
- Resource location update latency (GPS to broadcast): p95 <500ms
- Help request assignment latency: p95 <2s
- Mutual aid code generation: p95 <500ms
- Error rate: <0.01%
- Uptime: 99.9% (4.3 hours downtime/month allowed)

**Alert Thresholds**
- Admin dashboard load p95 >500ms → page on-call
- Dispatch latency >5s → page on-call + EMS notification
- Error rate >0.1% → page on-call immediately
- 911 CAD connectivity lost → escalate to operations manager
- Database latency >1s → investigate, potential failover

**SLA for EMS Clients**
- Availability: 99.9% during declared events, 99.5% otherwise
- Incident response: <1 min to page engineer on call
- Incident resolution: <15 min typical (depends on root cause)
- Communication: Update EMS every 5 min during incident

---

## 11. Testing Strategy

### Unit Tests (90% coverage for safety-critical paths)

**Teams Manager**
- Zone drawing: Valid polygon creation, invalid geometry rejection
- Team member assignment: Hierarchy validation, role permission checks
- Location tracking: GPS sanity checks, outlier rejection
- Mutual aid codes: Single-use enforcement, expiration validation

**Resource Manager**
- Vehicle specs lookup: NHTSA API response parsing, fallback to manual
- Resource dispatch: Closest unit selection, occupancy constraints
- Help request triage: Category classification, priority scoring
- 911 CAD integration: Incident parsing, address geocoding, jurisdiction validation

### Integration Tests (80% coverage)

**Event Flow**
- Declare event → activate hazard layers → deploy resources → track locations
- Assign help request → notify responder → track completion
- Request mutual aid → accept → track resource deployment

**911 Integration**
- Receive CAD incident → normalize → queue for dispatcher → assign unit → track dispatch

**Mesh Sync**
- Create zone offline → sync on connectivity → verify in database → broadcast

### End-to-End Tests (20% coverage for critical workflows)

**Scenario 1: Small Fire Event**
- Declare wildfire
- Deploy 2 ambulances, 1 fire engine to zone
- Confirm route passable
- Track evacuation status
- Verify help requests assigned

**Scenario 2: Help Request During Event**
- Public user requests welfare check
- EMS triages (high priority, elderly nearby)
- Assign volunteer responder
- Track completion + outcome

**Scenario 3: Mutual Aid Activation**
- Request 2 ambulances from neighboring agency
- Partner accepts, provides ETA
- Provide mutual aid code for non-Beacon partner
- Verify access + resource deployment

### Load Testing

**Scenario:** 100 concurrent EMS admins, 10K active resources during major event

**Metrics to Validate**
- Admin dashboard load time remains <200ms p95
- Resource location broadcast latency <500ms p95
- Help request assignment latency <2s p95
- Database query latency <100ms p95 for common queries

---

## 12. Cost & Resource Estimates

### Infrastructure (Monthly)

| Component | Cost | Notes |
|---|---|---|
| Compute (K8s, API servers) | $40K | Scales with concurrent users |
| Database (PostgreSQL, TimescaleDB) | $25K | Includes backups, replication |
| NATS/messaging | $10K | Real-time broadcasts |
| Redis cache | $5K | Session + event state |
| S3 storage | $5K | Incident reports, archival |
| Security (WAF, DDoS) | $10K | CMMC L2 compliance |
| 911 CAD integration | $10K | Vendor fees (varies) |
| **Total** | **$105K** | |

### Personnel (Monthly, MVP Phase)

| Role | Count | Cost |
|---|---|---|
| Team Lead | 1 | $15K |
| Backend Engineer | 3 | $45K |
| Frontend Engineer | 2 | $30K |
| QA / Integration Specialist | 1 | $12K |
| Customer Success | 1 | $10K |
| **Total** | **8** | **$112K** |

### Optimization Opportunities

1. **Self-serve CAD integration** (~20% cost reduction)
   - Provide reusable adapter templates
   - Reduce vendor consulting costs

2. **Zone caching** (~30% database load reduction)
   - Cache zone definitions locally on devices
   - Reduce GeoJSON queries during events

3. **Batch resource location updates** (~40% NATS traffic reduction)
   - Aggregate GPS updates, broadcast every 30s instead of continuous
   - Balance: Real-time visibility vs. bandwidth

---

## 13. Success Metrics & KPIs

### Operational Metrics

| Metric | Target | Why It Matters |
|---|---|---|
| Help request response time | <10 min average | Direct impact on volunteer coordination |
| Help request fulfillment rate | >85% | Measure system effectiveness |
| Dispatch assignment latency | <2s p95 | EMS operational efficiency |
| Route confirmation accuracy | 100% | Safety: passable routes prevent accidents |
| Mutual aid activation time | <5 min from request | Critical for large events |
| Evacuation status update latency | <30s | Real-time command visibility |

### User Satisfaction

| Metric | Target | How Measured |
|---|---|---|
| EMS admin satisfaction | >4.5/5 | Quarterly survey |
| Dispatch efficiency gain | >20% faster assignments | Benchmark vs. CAD-only |
| Help request triage accuracy | >95% | Post-event validation |
| Feature adoption | >70% for new features | Usage analytics |

### Safety & Compliance

| Metric | Target | Audit Frequency |
|---|---|---|
| Unauthorized data access incidents | 0 | Continuous monitoring |
| HIPAA compliance violations | 0 | Annual third-party audit |
| Help request liability claims | <1 per 10K requests | Quarterly review |
| False positive help requests | <5% | Monthly analysis |

---

## 14. Phased Development Roadmap

### Phase 1: Foundation (Months 1-3)
**Goals:** Core event management, basic team/resource tracking

**Deliverables:**
- Event declaration (manual + automatic triggers)
- Zone drawing canvas
- Team composition + shift scheduling
- Resource status dashboard
- Basic 911 CAD integration (polling)

**Testing:** Unit + integration tests, staging environment with test EMS agency

**Deliverable Artifacts:**
- API contracts finalized
- Database schema v1
- UI wireframes approved
- Deployment pipeline functional

### Phase 2: Dispatch & Coordination (Months 4-5)
**Goals:** Real-time dispatch, help request triage, mutual aid

**Deliverables:**
- Real-time dispatch layer (resources + incidents)
- Help request triage queue + assignment
- Mutual aid requests + code generation
- Route confirmation/blockage tracking
- Real-time location tracking + breadcrumb trails

**Testing:** Load testing with 100 concurrent admins, 10K resources

**Deliverable Artifacts:**
- Dispatch layer production-ready
- Help request triage model trained (95% accuracy)
- Mutual aid code security validated
- Mesh sync for offline functionality

### Phase 3: Advanced Features (Months 6-8)
**Goals:** Welfare check prioritization, evacuation coordination, multi-hazard

**Deliverables:**
- Welfare check prioritization algorithm
- Evacuation status tracking (real-time)
- Multi-hazard event coordination (cascading events)
- Post-event archival + AAR generation
- Advanced analytics dashboard

**Testing:** Tabletop exercises with pilot EMS agencies

**Deliverable Artifacts:**
- Welfare check model trained
- Evacuation routing integration complete
- Post-event reporting pipeline
- Advanced dashboards (team utilization, resource efficiency)

### Phase 4: Production Scale (Months 9-12)
**Goals:** Harden, scale, prepare for 5+ EMS agencies

**Deliverables:**
- Performance optimization (latency <200ms p95)
- Redundancy (failover for critical components)
- Compliance hardening (CMMC L2 audit-ready)
- Training materials + certification program
- 24/7 on-call rotation

**Testing:** Production-like load testing (1000 concurrent users)

**Deliverable Artifacts:**
- Scalability validated (5000 agencies target)
- Security audit complete
- Training curriculum finalized
- SLA definitions met

---

## 15. Critical Path & Dependencies

### Build Order (what must ship before what)

1. **Account & Auth Module** (prerequisite)
   - Special designation system must be working
   - User roles + permissions defined
   - OAuth integration for government accounts

2. **Location Sharing Module** (prerequisite)
   - Real-time GPS tracking architecture
   - Privacy controls + legal agreements
   - Offline mesh sync foundation

3. **Event Declaration System** (prerequisite)
   - Hazard agent integration
   - Module lead approval workflow
   - Event lifecycle management

4. **Teams Manager** (foundational)
   - Team composition, roles, hierarchy
   - Shift scheduling
   - Backup management

5. **Resource & Dispatch Manager** (built on Teams Manager)
   - Resource tracking + dispatch
   - 911 CAD integration
   - Dispatch layer

6. **Help Request System** (depends on dispatch)
   - Triage queue + assignment
   - Responder notification
   - Completion tracking

7. **Mutual Aid Coordination** (depends on all above)
   - Request + acceptance flow
   - Code generation + validation
   - Cross-agency data sharing

### Teams to Consult

| Team | Topic | When |
|---|---|---|
| Legal | 911 integration liability, Good Samaritan, HIPAA | Before feature ship |
| Security | CMMC L2 compliance, data encryption, access control | During design phase |
| 911 CAD Vendor | Integration details, data format, API contracts | Month 1 |
| State Emergency Mgmt | NIMS alignment, ICS integration, state hierarchy | Month 1 |
| Pilot EMS Agency | UX validation, workflow fit, training needs | Throughout |

---

## 16. Known Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| 911 CAD integration delays | Dispatch unusable without CAD | High | Start vendor discussion immediately, build adapter template |
| Help request triage inaccuracy | Liability if high-priority request missed | Medium | 95% accuracy target, bias audits, human review of borderline cases |
| Mutual aid code enumeration attack | Non-Beacon agencies gain unauthorized access | Low | Cryptographically secure random, single-use, time-limited, rate limiting |
| Data breach (PII/HIPAA) | Regulatory fine, reputational damage | Low | Encryption, access control, audit logging, 2-year retention |
| EMS adoption failure | Module becomes unused, investment wasted | Medium | Extensive pilot testing, user feedback loop, iterative improvements |
| False positive evacuation alert | Cost to government, user fatigue | Medium | High confidence thresholds (70%+), module lead override, audit trail |
| Volunteer responder liability | Lawsuit if volunteer causes harm | Medium | Waiver language, legal review, insurance policy, good samaritan protections |
| Scalability bottleneck | System fails at 5000 agencies scale | Low | Load testing early, horizontal scaling, caching strategy, database optimization |

---

## 17. Appendix: Reference Documents

### External Standards & Specifications
- **NIMS**: National Incident Management System (FEMA)
- **ICS**: Incident Command System (NFPA 1561)
- **HIPAA**: Health Insurance Portability & Accountability Act (HHS)
- **CMMC L2**: Cybersecurity Maturity Model Certification Level 2 (NIST)
- **WCAG 2.2**: Web Content Accessibility Guidelines (W3C)
- **PostGIS**: Geospatial SQL database (PostgreSQL extension)
- **PMTiles**: Cloud-optimized tile format (for offline maps)

### Planning Documents Referenced
- `14_accounts_and_auth/account_types.md` - Special designations + user hierarchies
- `11_special_designations/special_designations.md` - Designation types + permissions matrix
- `37_event_protocols/event_protocols_overview.md` - Event triggers + ICS integration
- `37_event_protocols/event_declaration.md` - Event declaration mechanics
- `12_evacuation_management/evacuation_notes_from_master.md` - Evacuation + shelter coordination
- `34_human_oversight_roles/human_oversight.md` - Module leads, QA, on-call rotation
- `10_ems_client_groups/ems_capabilities.md` - Zone drawing, mutual aid, welfare checks
- `16_vehicle_manager/vehicle_manager_notes.md` - Vehicle specs + tracking
- `45_development_plan/42_ems_clients.md` - EMS module architecture (detailed)

### Key Metrics & Targets
- **Latency SLAs**: Dispatch <2s, resource update <500ms, help assign <2s
- **Accuracy Targets**: Help triage 95%, route confirmation 100%, evacuation status 99%
- **Availability**: 99.9% (EMS clients), 99.5% (non-event)
- **Coverage**: 5000+ EMS agencies, 100K+ concurrent resources during major events
- **Safety**: Zero unauthorized data access incidents, zero HIPAA violations

---

## 18. Conclusion

The Event Operations module is a critical safety-focused system that orchestrates emergency response at scale. Success depends on:

1. **Technical Excellence**: Sub-second latency, 99.9% uptime, robust error handling
2. **Deep EMS Integration**: Close collaboration with 911 CAD vendors, NIMS alignment, ICS compliance
3. **Safety First**: Extensive testing, liability mitigation, audit trails, human oversight
4. **User-Centered Design**: Intuitive interfaces, rapid training, field team feedback
5. **Compliance & Privacy**: HIPAA encryption, CMMC L2 hardening, access audit logging

The module is foundational to Beacon's mission: saving lives by coordinating professional response and mobilizing public volunteer capacity during emergencies. All development decisions should prioritize safety, accuracy, and operational effectiveness.

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Status:** Architecture Phase
**Maintainer:** [To be assigned]
