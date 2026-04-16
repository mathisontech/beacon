# Event Management Module Documentation

**Mission:** Manage the complete lifecycle of declared emergencies in real-time, coordinating multi-hazard events, EMS response, and user evacuation while maintaining ICS/NIMS compliance and comprehensive audit trails.

---

## 1. Module Metadata

**Team:** Event Operations & Coordination

**Parent Module:** Beacon Core Platform

**Sub-Modules:**
1. Event Manager
2. User Sighting & Condition Reporting
3. Beacon Hazard Models Manager
4. User Danger Manager
5. User Location Determination

**Goal:** Sustain operational control during declared emergencies by managing event lifecycle, aggregating hazard intelligence, assessing user threats, and coordinating emergency response.

**Mission Alignment:** Event Management is the operational backbone that activates all other event-time modules. It translates hazard detection into coordinated emergency response that saves lives.

**Owner:** Event Operations Lead | event-ops@beacon.emergency

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema |
|------|--------|------|-----------|--------|
| **Automatic hazard trigger** | Hazard Models (wildfire, flood, etc.) | JSON | Real-time | `{hazard_type, magnitude, location, confidence, timestamp}` |
| **Manual event declaration** | EMS Admin / Module Lead | JSON + GeoJSON | On-demand | `{event_id, hazard_type, polygons, severity, declared_by, timestamp}` |
| **User sightings** | Public & EMS field reports | JSON + Images | Real-time | `{sighting_id, hazard_type, location, confidence, photos, timestamp}` |
| **Environmental data** | USGS, NWS, weather API | JSON | 5-15 min | `{source, data_type, geometry, value, timestamp}` |
| **User locations** | Location system (GPS, mesh) | Binary (compressed) | Continuous | `{user_id, lat, lon, accuracy, timestamp}` |
| **EMS acknowledgments** | EMS dispatch system | JSON | Real-time | `{event_id, ems_id, ack_timestamp, action}` |
| **Cascade event signals** | Coordinator agent | JSON | Real-time | `{primary_event_id, cascade_hazard, confidence}` |
| **ICS form requests** | Incident Command System | JSON | On-demand | `{form_type (201/202/205), event_id}` |
| **Post-event review requests** | Module lead / legal | JSON | T+24h to T+30d | `{event_id, review_type, requested_by}` |
| **Output: Event alert** | Public & EMS users | JSON + Rich media | Real-time | `{event_id, hazard_type, zone_polygon, confidence, affected_pop, action_requested}` |
| **Output: Evacuation command** | Public users + EMS | GeoJSON route + metadata | Real-time | `{route_id, start, end, danger_level, timing, shelter_destinations}` |
| **Output: Resource request** | EMS resource manager | JSON | Real-time | `{event_id, resource_type, quantity, location, priority}` |
| **Output: ICS export** | Incident Command System | GeoJSON + metadata | Every 5 min | `{incident_name, objectives, resources, contact_info}` |
| **Output: Audit log** | Data storage (immutable) | JSON + append-only | Real-time | `{timestamp, user_id, action, data_changed, reason}` |

**Output Consumers:**
- Public users (evacuation routing, alerts)
- EMS dispatch (resource coordination, tactical overview)
- Hazard Models (sighting feedback, model calibration)
- Evacuation Manager (route confirmation, shelter assignment)
- Incident Command System (ICS forms 201/202/205)
- Legal/auditors (post-event data retrieval)

---

## 3. Function Breakdown

### 3.1 Event Lifecycle Management

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `create_event()` | Declare new emergency | trigger data + hazard type | event_id, initial state | <100ms | Hazard Models | Event created, alert queued |
| `escalate_event()` | Increase severity/zone | event_id, new_severity | updated event record | <50ms | Authority validation | Severity reflected, alerts sent |
| `de_escalate_event()` | Lower severity/close zones | event_id, affected_zones | updated event record | <50ms | EMS confirmation | Zones cleared, public notified |
| `merge_cascading_events()` | Combine related hazards | primary_event_id, secondary_event | merged event_id | <200ms | Coordinator agent | Zones unified, resources consolidated |
| `close_event()` | Declare emergency resolved | event_id, final_timestamp | archived event | <100ms | EMS sign-off | Event marked closed, archival started |
| `suppress_automatic_trigger()` | Override auto-declaration | event_id, reason, override_authority | suppression_record | <10ms | CTO approval | Override logged, no alert sent |
| `validate_trigger_threshold()` | Check hazard metrics | hazard_data, thresholds | confidence_score, is_valid | <50ms | USGS/NWS data | Confidence >70% for publication |

### 3.2 Event Declaration Logic

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `automatic_declaration()` | Trigger if thresholds met | hazard_trigger, validation | event_id or suppression | <5min | Analysis agent approval | Matches trigger thresholds |
| `manual_declaration()` | User-initiated event | user_id, hazard_type, geometry | event_id | <100ms | User authority check | Event created immediately |
| `publish_event_alert()` | Send to all users in zone | event_id, geometry, severity | alert_id, delivery_log | <1min SLA | Notifications system | SMS+app delivered within 1min |
| `notify_ems_chain()` | Escalation to EMS hierarchy | event_id | ack_required flag | <2min per tier | EMS contact database | Primary -> secondary -> operations |
| `request_ems_acknowledgment()` | Prompt EMS response | event_id, ems_contact | ack_pending record | <30s | Dispatcher queue | Persistent notification until ACK |
| `escalate_ems_chain()` | Move to next contact on no ACK | event_id | escalation_log | <2min | Human operator fallback | Next tier notified within window |

### 3.3 Hazard Observation Aggregation

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `ingest_sighting()` | Store fire/flood/damage report | sighting_object | sighting_id, confidence | <100ms | Validation logic | Stored, deduplicated, indexed |
| `triangulate_observations()` | Combine multiple reports | sighting_array | consensus_location, confidence | <500ms | Geospatial engine | Consensus within tolerance |
| `spam_filter_sighting()` | Detect false/malicious reports | sighting_object | is_spam_flag, reason | <200ms | Spam model, user history | False reports suppressed |
| `confidence_score_sighting()` | Rank report reliability | sighting_object + context | confidence_0_100 | <100ms | ML model (on-device) | Score 0-100, calibrated |
| `feed_model_feedback()` | Return sightings to hazard models | event_id, sightings | model_update_signal | <1s | Hazard Models system | Model receives feedback |
| `contradict_sighting()` | Allow users to challenge reports | sighting_id, contradiction_data | contradiction_record | <500ms | User authority check | Contradiction logged, visibility adjusted |

### 3.4 Multi-Hazard Event Coordination

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `detect_cascade_pattern()` | Identify secondary hazard triggers | primary_event, hazard_data | cascade_signal or null | <500ms | Coordinator agent | Detects earthquake->landslide |
| `auto_activate_secondary_module()` | Enable related hazard models | cascade_signal | activated_module_id | <100ms | Module registry | Secondary module initialized |
| `merge_evacuation_zones()` | Combine overlapping threats | zone_array | merged_zone_polygon | <200ms | GIS engine | Union of zones, safety-first |
| `manage_resource_conflicts()` | Prevent double-allocation | resource_requests | allocation_log | <100ms | Resource manager | Request visibility across modules |
| `coordinate_module_decisions()` | Resolve hazard-specific conflicts | decision_array | final_decision, reasoning | <500ms | Coordinator agent, EMS | Documented conflict resolution |
| `broadcast_cascade_signal()` | Notify related modules of merge | cascade_event_id | nats_message_sent | <100ms | NATS pub/sub | All modules receive update |

### 3.5 User Threat Assessment Integration

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `request_danger_assessment()` | Query User Danger Manager | user_id, event_id | danger_level, recommendation | <500ms | User Danger system | Returns stay/shelter/evacuate |
| `project_danger_over_time()` | Forecast user threat window | user_location, hazard_evolution | danger_timeline | <1s | Hazard Models, forecasting | 15-min + 1hr projections |
| `identify_vulnerable_populations()` | Find at-risk users in zone | event_geometry, user_attributes | user_priority_list | <500ms | User database, dependencies | Schools, hospitals, elderly homes |
| `broadcast_evacuation_command()` | Issue coordinated evac order | event_id, target_zone | evacuation_id, routing_triggered | <2s | Evacuation Manager | Routes generated, users alerted |
| `provide_location_guidance()` | Integrate location determination | user_id | current_location, confidence | <500ms | User Location system | GPS/mesh/WiFi fusion result |

### 3.6 ICS/NIMS Integration

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `generate_ics_201()` | Incident briefing form | event_id | ICS-201 document (PDF/JSON) | <2s | Event data, hazard status | Form populated, printable |
| `generate_ics_202()` | Incident objectives form | event_id, EMS_input | ICS-202 document | <2s | Event analysis, recommendations | Objectives reflect situation |
| `generate_ics_205()` | Communication plan form | event_id, ems_contacts | ICS-205 document | <2s | Contact database | All chiefs + module leads listed |
| `export_geojson_for_nims()` | Package event as GeoJSON | event_id | GeoJSON feature + metadata | <500ms | Event record + hazard layers | Valid GeoJSON, NIMS compatible |
| `schedule_nims_export()` | Queue 5-min export cycle | event_id | export_job_id | <100ms | Scheduler | Exports run every 5 minutes |
| `submit_fema_report()` | Send anonymized event data | event_id, anonymization_params | submission_id, receipt_timestamp | <1s | Data anonymization, FEMA API | Data sent within 30 days post-event |

### 3.7 Data Recording & Audit Trail

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `log_event_action()` | Append to immutable audit log | user_id, action, data_changed | log_entry_id | <100ms | S3 (immutable) | Entry written to append-only log |
| `record_hazard_observation()` | Store all observations | observation_object | obs_id, timestamp | <100ms | TimescaleDB | Time-series indexed by timestamp |
| `record_agent_output()` | Log all model recommendations | agent_id, output_data | output_id | <100ms | TimescaleDB | Model confidence, timestamp logged |
| `record_human_decision()` | Log approvals/rejections | user_id, decision, timing | decision_id | <100ms | PostgreSQL | EMS action timestamped |
| `record_user_interaction()` | Log user hazard acknowledgments | user_id, event_id, action | interaction_id | <100ms | TimescaleDB | Evacuation confirmation tracked |
| `compress_event_data()` | Archive after 24hrs inactivity | event_id | compressed_size_bytes | <10s | S3, gzip | Data reduced by 70%+ |
| `retrieve_audit_trail()` | Search event history | event_id, query_params | audit_entries (paginated) | <1s | S3 search | Legal/audit access only |

### 3.8 Emergency Response Coordination

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `request_ems_resource()` | Submit resource need | event_id, resource_type, qty | request_id | <500ms | Resource manager | Request visible to all modules |
| `coordinate_backup_aid()` | Activate mutual aid agreements | event_id, resource_shortage | backup_contact_list | <100ms | Backup manager, agreements DB | Backup units notified |
| `generate_visibility_code()` | Create access token for non-Beacon units | event_id, backup_org | secure_code_string | <100ms | Auth system | Code valid for event duration |
| `track_resource_allocation()` | Monitor equipment/personnel | event_id | allocation_snapshot | <500ms | Resource manager | Real-time availability shown |
| `mark_zone_impassable()` | Update road status from field | zone_geometry, reason | zone_update_id | <200ms | Routing engine | Routes recalculated immediately |

### 3.9 Event Closure & Post-Event Processing

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `declare_recovery_phase()` | Transition from active to recovery | event_id, timestamp | event_status='recovery' | <100ms | EMS confirmation | Alerts stop, archival begins |
| `trigger_after_action_report()` | Request module lead AAR | event_id | aar_due_timestamp (T+30days) | <100ms | Notification system | Module lead notified |
| `anonymize_event_data()` | Prepare public release dataset | event_id, anonymization_rules | anonymized_dataset_id | <30s | Data anonymization engine | PII removed, aggregated |
| `archive_to_cold_storage()` | Move to long-term storage | event_id | archive_location_s3 | <60s | S3, Glacier | 7-year retention applied |
| `generate_lessons_learned()` | Extract insights for training | event_id | summary_document | <10s | Event analysis, ML | Key findings extracted |

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL + PostGIS, TimescaleDB, Redis, NATS, S3

### 4.1 PostgreSQL + PostGIS

#### Events Table
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_code VARCHAR(32) UNIQUE NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,
  severity_level INT DEFAULT 1,
  status VARCHAR(30) DEFAULT 'declared',
  declared_by BIGINT,
  declared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  geometry GEOMETRY(Polygon, 4326),
  affected_population INT,
  affected_area_sqkm DECIMAL(10,2),
  confidence_score DECIMAL(3,2),
  data_quality_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_hazard_type ON events(hazard_type);
CREATE INDEX idx_events_declared_at ON events(declared_at DESC);
CREATE INDEX idx_events_geom ON events USING GIST(geometry);
```

#### Hazard Observations Table
```sql
CREATE TABLE hazard_observations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id),
  observation_type VARCHAR(50),
  source_type VARCHAR(50),
  source_id VARCHAR(255),
  location GEOMETRY(Point, 4326),
  magnitude DECIMAL(8,3),
  confidence DECIMAL(3,2),
  images JSONB,
  metadata JSONB,
  is_contradicted BOOLEAN DEFAULT FALSE,
  contradiction_count INT DEFAULT 0,
  spam_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_observations_event ON hazard_observations(event_id);
CREATE INDEX idx_observations_confidence ON hazard_observations(confidence DESC);
CREATE INDEX idx_observations_created ON hazard_observations(created_at DESC);
CREATE INDEX idx_observations_geom ON hazard_observations USING GIST(location);
```

#### Cascade Events Table
```sql
CREATE TABLE cascade_events (
  id BIGSERIAL PRIMARY KEY,
  primary_event_id BIGINT REFERENCES events(id),
  secondary_event_id BIGINT REFERENCES events(id),
  cascade_type VARCHAR(50),
  detection_confidence DECIMAL(3,2),
  was_merged BOOLEAN DEFAULT FALSE,
  merged_event_id BIGINT REFERENCES events(id),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cascade_primary ON cascade_events(primary_event_id);
CREATE INDEX idx_cascade_merged ON cascade_events(was_merged);
```

#### EMS Acknowledgments Table
```sql
CREATE TABLE ems_acknowledgments (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id),
  ems_id BIGINT,
  tier_level INT,
  contact_phone VARCHAR(20),
  contacted_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  ack_status VARCHAR(30),
  escalation_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ack_event ON ems_acknowledgments(event_id);
CREATE INDEX idx_ack_status ON ems_acknowledgments(ack_status);
CREATE INDEX idx_ack_pending ON ems_acknowledgments WHERE ack_status = 'pending';
```

#### ICS Export Log Table
```sql
CREATE TABLE ics_export_log (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES events(id),
  form_type VARCHAR(10),
  exported_geojson JSONB,
  export_number INT,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_nims BOOLEAN DEFAULT FALSE,
  nims_receipt_timestamp TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ics_event ON ics_export_log(event_id);
```

### 4.2 TimescaleDB (Time-Series)

#### Event Timeline Table
```sql
CREATE TABLE IF NOT EXISTS event_timeline (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_id BIGINT NOT NULL,
  hazard_magnitude DECIMAL(8,3),
  observation_count INT,
  affected_population INT,
  confidence_score DECIMAL(3,2),
  model_state JSONB,
  metadata JSONB
);

SELECT create_hypertable('event_timeline', 'time', if_not_exists => TRUE);
CREATE INDEX idx_timeline_event_time ON event_timeline (event_id, time DESC);
```

#### User Danger Projection Table
```sql
CREATE TABLE IF NOT EXISTS user_danger_projections (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  danger_level VARCHAR(30),
  recommended_action VARCHAR(30),
  projected_safe_zones INT,
  metadata JSONB
);

SELECT create_hypertable('user_danger_projections', 'time', if_not_exists => TRUE);
CREATE INDEX idx_danger_user_time ON user_danger_projections (user_id, time DESC);
```

### 4.3 Redis

```
Key Patterns:
  event:{event_id}:active_users      → SET of user_ids in event zone
  event:{event_id}:danger_cache      → HASH of user_id -> danger_level
  event:{event_id}:evacuation_routes → HASH of user_id -> route_json
  event:{event_id}:ems_ack           → HASH of ems_contact -> timestamp
  cascade:pending                    → SET of event_ids awaiting merge decision

TTL: Active events kept in Redis (7 days); cleared on event closure
Use Cases: Real-time event state, user presence caching, routing cache
```

### 4.4 NATS Streams

```
Subjects:
  event.declared                    → Consumers: Notifications, Evacuation Manager, Hazard Models
  event.escalated                   → Consumers: All modules
  event.hazard_observation          → Consumers: Hazard Models, Analysis Agent
  event.user_action                 → Consumers: User Danger Manager, Analytics
  event.cascade_detected            → Consumers: Coordinator Agent
  event.ems_acknowledgment          → Consumers: Event Manager, Dispatch
  event.closed                      → Consumers: Archive system, Post-event analysis

Retention: Events retained 24 hours (or until processed + ACKed by all consumers)
Consumers: Auto-ack on processing; 3-retry on failure before DLQ
```

### 4.5 S3

```
Bucket: beacon-production
Prefixes:
  /events/{event_id}/audit-log/        → Immutable append-only audit trail
  /events/{event_id}/observations/     → Raw sighting data with images
  /events/{event_id}/ics-exports/      → ICS form exports (every 5min)
  /events/{event_id}/aar/              → After-Action Reports (T+30 days)
  /archive/events/{event_id}/          → Compressed cold storage (7-year retention)

Retention:
  - Active events: Standard S3 (min 30 days, typically 1 year)
  - Closed events: Moved to Glacier after T+7 days
  - Legal/audit hold: Indefinite (flagged records)

Access: Private; signed URLs for legal/audit retrieval
Object Lock: Enabled on audit-log prefix (WORM - Write Once Read Many)
```

**Data Size Estimate:**
- Per active event: ~50-200 MB/hour (observations, logs, exports)
- Typical event duration: 12-72 hours
- Monthly events: 10-50 (varies by region/season)
- Monthly storage: ~500 GB - 2 TB

**Archival Strategy:**
- T+0 to T+24h: Active event, real-time data in PostgreSQL + Redis
- T+24h to T+7d: Compress to Glacier; keep working copy in S3 Standard
- T+7d+: Glacier Deep Archive; S3 Standard deleted
- T+7y+: Permanently deleted (unless legal hold flagged)

---

## 5. UI Components

### 5.1 Admin Dashboard Screens

**Event Declaration Screen**
- Trigger source selector (automatic vs. manual)
- Hazard type dropdown (wildfire, flood, earthquake, etc.)
- Event zone drawing (polygon tool, import GeoJSON)
- Initial severity / magnitude input
- Confidence slider (0-100%)
- Affected population estimate (calculated from layer + user locations)
- "Declare Event" button (navy #0B0F2A, confirmed by second user)
- Suppression form (if overriding automatic trigger)

**Event Overview Map**
- Active event polygon (semi-transparent, teal #0097B2)
- Hazard observations as pins (color-coded by confidence)
- User locations within zone (anonymized heatmap by default)
- Evacuation routes (green lines, arrows showing direction)
- Shelters (blue cross icons, capacity bars)
- EMS resource icons (ambulance, fire truck, ATV)
- Real-time hazard projection overlay (animated evolution)

**Escalation/De-escalation Panel**
- Current severity display
- Severity control (slider 1-5 or dropdown)
- Zone geometry editor (adjust evacuation zone)
- "Confirm Escalation" button (requires approval from 2nd EMS official)
- Reason text field (mandatory for changes)
- Timestamp of last change

**EMS Acknowledgment Tracker**
- Event summary (type, zone, affected count)
- Primary contact (name, role, phone)
- "Contacted at / Acknowledged at" timestamps
- Escalation timer (show countdown to next tier)
- Message history (what was sent, when, delivery status)
- Manual override (mark acknowledged if system fails to detect)

**ICS Form Builder**
- Form type selector (201 / 202 / 205)
- Auto-populated fields from Beacon (incident name, location, affected area)
- Manual fields for EMS input (objectives, resources, contacts)
- "Generate PDF" button (exports readable form)
- "Export to NIMS" button (sends GeoJSON to ICS system)
- Last export timestamp

**Resource Request Panel**
- Request type (vehicles, personnel, equipment)
- Quantity & priority level
- "Submit Request" button
- Real-time availability (show which resources are allocated to other events)
- Mutual aid button (triggers backup manager)

### 5.2 Map Layers (Event-Time)

**Event Boundary Layer**
- Geometry type: Polygon
- Color: Teal #0097B2, stroke 2px
- Fill opacity: 15%
- Z-order: 100
- Update frequency: Real-time (when zone adjusted)
- Interactive: Clickable to show event summary

**Hazard Observation Layer**
- Geometry type: Point (or small circle)
- Color gradient: Red (high confidence) → Yellow (medium) → Gray (low)
- Size: Scales by confidence (2px - 6px radius)
- Z-order: 95
- Update frequency: Real-time as observations arrive
- Interactive: Click to show observation details (time, source, photos)
- Toggle: Can be hidden if too many points

**Evacuation Route Layer**
- Geometry type: LineString (with arrows)
- Color: Green (#22B968 primary, secondary routes in lighter green)
- Stroke width: 3px
- Z-order: 90
- Update frequency: Every 5 minutes (as routes recalculated)
- Interactive: Click to show ETA, congestion, shelter destinations

**Shelter & Safe Zone Layer**
- Geometry type: Point (shelters) or Polygon (safe zones)
- Color: Shelter = Blue #0097B2, Safe Zone = Light green
- Z-order: 85
- Update frequency: As zones updated
- Interactive: Click to show capacity, distance, resource status

**EMS Resource Layer**
- Geometry type: Point (icons vary by vehicle type)
- Icons: Fire truck, ambulance, ATV, helicopter
- Color: Red (active responder), Orange (in transit), Gray (staged)
- Number badge: Shows occupants/equipment count
- Z-order: 80
- Update frequency: Real-time from tracker
- Interactive: Click to show unit details, contact, availability

### 5.3 Buttons/Controls

| Button Name | Action | Color | Location | Keyboard |
|---|---|---|---|---|
| Declare Event | Open declaration form | Navy #0B0F2A | Top of Event Manager | Ctrl+D |
| Escalate Severity | Increase event level | Orange #FF9800 | Event Overview panel | ↑ |
| De-escalate Severity | Decrease event level | Teal #0097B2 | Event Overview panel | ↓ |
| Merge Cascade | Merge secondary event | Purple | Cascade alert | M |
| Edit Zone | Polygon editor for evacuation area | Gray | Map toolbar | E |
| Request EMS ACK | Manual trigger of ACK request | Navy | EMS panel | Ctrl+A |
| Suppress Trigger | Cancel auto-declaration | Red | Event card (early window only) | S |
| Generate ICS-201/202/205 | Build and export form | Navy | ICS panel | Ctrl+I |
| Export to NIMS | Send GeoJSON to incident command | Green | ICS panel | Ctrl+N |
| Request Resource | Open resource request form | Teal | Resource panel | Ctrl+R |
| Close Event | Mark event as closed | Gray | Event Overview | Ctrl+E |
| View Audit Trail | Open immutable log viewer | Navy | Settings menu | Ctrl+L |
| After-Action Report | Link to AAR submission form | Navy | Post-event only | N/A |

### 5.4 Notifications/Alerts

| Alert Type | Trigger | Template | Channel | Priority |
|---|---|---|---|---|
| **Automatic Trigger Alert** | Hazard threshold crossed | "ALERT: [Hazard] detected in [Zone]. Confidence [%]. Actions: Acknowledge / View Details" | SMS + App push | Critical |
| **Cascade Detected Alert** | Secondary hazard activated | "UPDATE: [Secondary hazard] triggered by [primary]. Merging zones..." | App only | High |
| **EMS ACK Timeout Alert** | No response within tier window | "[Contact name], acknowledge this emergency. Tap to respond." | SMS + Phone call | Critical |
| **Escalation Notification** | Moving to next tier | "Escalating to [Next contact] — [Primary] did not acknowledge within 2 minutes" | SMS + App | High |
| **Resource Shortage Alert** | Request cannot be fulfilled | "Insufficient [Resource type]. Activating mutual aid..." | App + Dispatch | High |
| **Zone Expansion Alert** | Evacuation area grows | "Evacuation zone expanded. New routes generated. Evacuate immediately." | App push | Critical |
| **User Danger Alert** | Population enters high-risk area | "[N] users in danger zone. Recommend evacuation." | App (EMS only) | High |
| **Model Confidence Drop Alert** | Prediction uncertainty increases | "Model confidence dropped to [%]. Data quality degraded." | App (Module lead) | Medium |
| **Observation Contradiction Alert** | Multiple sightings conflict | "[N] contradictions to fire location. Recommend field verification." | App (EMS) | Medium |

### 5.5 Brand Compliance

- **Font:** Inter (all text)
- **Primary Color:** Navy #0B0F2A (headings, primary buttons, key data)
- **Secondary Color:** Teal #0097B2 (highlights, positive actions)
- **Accent Colors:**
  - Red #E53935 (danger, high urgency)
  - Green #22B968 (safe, completed)
  - Orange #FF9800 (warning, medium urgency)
  - Gray #9E9E9E (neutral, secondary)
- **Accessibility:** WCAG 2.2 AA minimum (contrast ratio 4.5:1 for text)
- **Typography:**
  - Headings: Inter Bold, 24-32px
  - Body: Inter Regular, 14-16px
  - Labels: Inter Medium, 12-14px
- **Icons:** Should not contain text; minimal styling

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-event-manager | TypeScript + Node.js + Express | `npm run build && npm start` | Event Ops Team |
| beacon-frontend-admin | React + TypeScript | `npm run build` | Frontend Team |
| beacon-data-pipeline | Python + Airflow | `docker build && docker run` | Data Team |
| beacon-hazard-models | Python + TensorFlow/PyTorch | `python setup.py build` | Hazard ML Team |
| beacon-ics-integration | Python + FastAPI | `docker build && docker push` | ICS Integration Team |
| beacon-auth-service | Go + gRPC | `go build` | Auth Team |

**Deployment:**
- Services: Docker + Kubernetes (EKS)
- Databases: RDS (PostgreSQL), TimescaleDB on separate RDS
- Caching: ElastiCache (Redis)
- Message Queue: NATS on Kubernetes
- Storage: S3 with Object Lock
- Load Balancing: Application Load Balancer (ALB)

**CI/CD:**
- GitHub Actions for all repos
- PR → automated tests → staging deployment
- Main branch → production deployment (blue-green)
- Feature flag gates new functionality

---

## 7. Lifecycle

### 7.1 Milestones

1. **Months 1-2: Requirements & Design Review**
   - Requirements finalized with EMS stakeholders
   - Database schema approved by data team
   - ICS/NIMS integration spec signed off by legal
   - Architecture review by platform team

2. **Months 2-3: Core Implementation**
   - Event lifecycle functions implemented
   - PostgreSQL & TimescaleDB schemas created
   - Basic event declaration workflow
   - NATS stream publishers/consumers

3. **Months 3-4: Integration Testing**
   - Integration with Hazard Models
   - Integration with Evacuation Manager
   - Integration with User Location system
   - EMS stakeholder testing in staging

4. **Months 4-5: Beta Deployment**
   - Pilot with 1-2 EMS agencies
   - Real incident testing (if available)
   - Performance tuning (audit logs, exports)
   - User feedback integration

5. **Month 5+: Production Rollout**
   - Gradual rollout to all EMS clients
   - 24/7 monitoring and on-call support
   - Post-deployment iterations

### 7.2 Build Phases

**Phase 1: Event Lifecycle (Weeks 1-6)**
- Create/escalate/de-escalate/close events
- Automatic vs. manual declaration logic
- Event status tracking
- Database setup

**Phase 2: Hazard Observations (Weeks 7-12)**
- Sighting ingestion and deduplication
- Confidence scoring & spam filtering
- Triangulation of multiple reports
- Observation-to-model feedback loop

**Phase 3: EMS Coordination (Weeks 13-18)**
- Acknowledgment tracking & escalation
- Resource request management
- Cascade event detection & merging
- Multi-hazard zone management

**Phase 4: ICS/NIMS Integration (Weeks 19-24)**
- ICS-201/202/205 form generation
- GeoJSON export for incident command
- FEMA data submission workflow
- Legal compliance validation

**Phase 5: Audit & Post-Event (Weeks 25-30)**
- Immutable audit log implementation
- Event archival workflow
- After-Action Report templates
- Data anonymization for public release

**Phase 6: Monitoring & Ops (Weeks 31-36)**
- Agent monitoring (cascade detection, data quality)
- Operational dashboards
- Alert tuning for production
- Runbooks for common scenarios

### 7.3 Test Coverage Targets

| Category | Target | Notes |
|----------|--------|-------|
| Unit Tests | 85% | Event lifecycle, calculations, validation logic |
| Integration Tests | 75% | Module boundaries, NATS messaging, database |
| E2E Tests | 60% | Full event lifecycle, user-visible flows |
| Load Tests | Yes | 10k concurrent users in zone, 1000 events/min ingestion |
| Chaos Tests | Yes | Network partitions, database failover, service degradation |

### 7.4 Deployment Strategy

- **Blue-green** for database schema changes (synchronized rollout with services)
- **Canary** for new algorithms (10% → 25% → 50% → 100% traffic over 24hrs)
- **Rolling** for bug fixes (5 replicas, 1 at a time, health checks between)
- **Rollback**: Automated if error rate > 1% or latency p95 > 5s

### 7.5 Monitoring Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Event declaration latency p95 | <100ms | >500ms |
| EMS acknowledgment delivery SLA | <1 min | >2 min |
| Sighting ingestion latency p99 | <500ms | >2s |
| ICS export generation time | <2s | >5s |
| Audit log write latency | <100ms | >500ms |
| Cascade detection latency | <500ms | >2s |
| Error rate | <0.1% | >0.5% |
| Data archival completion time | <10s per event | >30s |

### 7.6 Improvement Research

- **A/B Testing:** Severity escalation UI (modal vs. inline), alert urgency rankings
- **User Feedback:** Monthly surveys from EMS administrators on usability
- **Performance Analysis:** Profiling audit log writes under peak load, optimizing geo-queries
- **Model Retraining:** Quarterly recalibration of cascade detection confidence thresholds based on real events

---

## 8. Legal/Privacy/Security

### 8.1 Applicable Regulations

- **CCPA (California):** Location data subject to opt-out; data retention rights
- **CMMC Level 2:** Encryption, access control, audit logging (if serving federal contracts)
- **FedRAMP:** If serving federal agencies; AES-256, TLS 1.3, annual security assessment
- **Good Samaritan Law:** System must document decision-making to defend against liability
- **HIPAA (if hospital data):** De-identification required for any health information
- **ICS/NIMS Compliance:** Standard terminology, interoperability, chain of custody

### 8.2 PII Handled

| Data Type | Collected | Stored | Shared | Reason |
|---|---|---|---|---|
| User Location | Yes | 30 days | On-demand to EMS | Hazard proximity assessment |
| User Name | No | N/A | N/A | Not needed; use user IDs |
| Phone Number | Yes (EMS only) | 7 years | To incident command | Emergency contact chain |
| Health Status (optional) | Yes (user-reported) | 30 days | To User Danger system | Risk assessment |
| Emergency Contacts | Yes (EMS input) | 7 years | Within incident command | Resource coordination |
| Sighting Images | Yes | 1 year | Researchers (anonymized) | Model training |

**Minimal Collection Principle:** No email addresses collected; no social media integration; no commercial data sharing.

### 8.3 Encryption

**In Transit:**
- TLS 1.3 for all API calls (HTTP/2)
- QUIC for mesh networking (DTLS 1.3 fallback)
- Signed JWTs for inter-service authentication

**At Rest:**
- PostgreSQL: pgcrypto (AES-256-GCM for sensitive columns)
- S3: AES-256-SSE with KMS key rotation (annual)
- Redis: Encryption disabled (in-memory cache only; no sensitive data at rest)
- TimescaleDB: Same as PostgreSQL

**Key Management:**
- AWS KMS for S3 and database keys
- KMS key rotation: Every 12 months
- Root key: Held by Chief Information Security Officer
- Access: IAM roles per service (principle of least privilege)

### 8.4 Audit Trail

**What Is Logged:**
- Every event create/escalate/de-escalate/close action
- User who made the decision, timestamp, reason text
- Model confidence scores at decision time
- EMS acknowledgment timing and responses
- Data changes (before/after JSON diff)
- ICS exports and submissions

**Retention:** 7 years minimum (immutable S3 with Object Lock)

**Access Control:**
- Beacon employees: Full audit trail (via service role)
- Legal/law enforcement: Subpoena-based retrieval (signed URLs, logged)
- Auditors: 3rd-party access (quarterly, logged)
- Users: Cannot access their own audit trail (privacy-first)

**Search Capability:** Full-text search on audit log via Elasticsearch (separate cluster, encrypted)

### 8.5 Data Retention

| Data Type | Retention | Reason |
|---|---|---|
| Active event data | 24 hrs in hot storage | Real-time operational use |
| Event observations | 1 year | Model retraining, research |
| EMS acknowledgments | 7 years | Legal/regulatory requirement |
| User locations (during event) | 30 days | Privacy preservation |
| User locations (general) | 7 days | Battery efficiency, no emergency |
| Audit logs | 7 years | Immutable record for investigation |
| Images/photos | 1 year | Model training, then anonymized |
| After-Action Reports | Indefinite | Organizational learning |

### 8.6 Third-Party Integrations

| Service | Data Shared | DPA | Notes |
|---|---|---|---|
| USGS APIs | None | N/A | Read-only; Beacon initiates |
| NWS APIs | None | N/A | Read-only; Beacon initiates |
| ICS/NIMS Systems | Event GeoJSON | Required | FEMA data sharing agreement |
| Mutual Aid Backup Orgs | Event boundary only | Per agreement | Non-Beacon org coordination |

**Data Processing Agreements (DPA):** Required for any 3rd party handling user data (e.g., cloud storage, analytics).

---

## 9. Mesh/Offline

### 9.1 Offline-First Features

**Feature: Event Declaration Queueing**
- If no internet: Event declaration cached locally
- Timestamp recorded at user's device
- Synced when connectivity returns
- Conflicts resolved by latest-wins + audit logging

**Feature: Hazard Observation Sync**
- Sightings accumulated during outage
- Automatically uploaded when reconnected
- CRDT (Conflict-free Replicated Data Type) ensures consistency
- Duplicates filtered server-side

**Feature: Local Event Zone Cache**
- Event polygon downloaded to device when declared
- Evacuation routes calculated locally (A* algorithm)
- User can navigate without network
- Routes re-optimized when connectivity returns

**Feature: Observation Replay**
- Users with intermittent connectivity can review all cached observations
- Timestamps preserved for later syncing
- Visual indicator shows "synced" vs. "pending"

### 9.2 Sync Strategy

**Conflict Resolution:**
- If user reports same sighting twice (e.g., offline then online): Deduplicate by location + timestamp + user_id
- If EMS changes event severity offline, server changes it: Server version wins; local user shown "event updated"
- If cascade merge offline: Coordinator agent retries on reconnect

**Ordering:** FIFO with timestamp ordering (server time of arrival, not user device time)

**Retry Logic:**
- Failed sync: Retry after 5s, 15s, 60s, 5min (exponential backoff)
- After 24hrs failed retries: Mark as requiring manual intervention
- User warned: "Some changes couldn't sync; contact EMS admin"

### 9.3 Cache Size

- Event geometry: 50 KB per event
- Observations (100 observations): 500 KB
- Routes (20 alternate routes): 2 MB
- Model state: 10 MB
- **Total local cache:** ~15 MB per active event

Device storage: 100 MB reserved for event data (scales to 10 concurrent events)

### 9.4 Priority Queue

When reconnecting, sync in this order:
1. EMS acknowledgments (critical for response coordination)
2. Event escalations (safety-critical)
3. Hazard observations (for model feedback)
4. User locations (for resource allocation)
5. ICS exports (administrative)
6. Audit logs (compliance, can be queued)

### 9.5 Compression

**Observation data:** JSON → MessagePack (35% size reduction)

**Event geometry:** GeoJSON → TopoJSON (60% reduction for complex polygons)

**Model state:** JSONB → Protocol Buffers (45% reduction)

**Overall target:** Active event data compressed to <5 MB per device

---

## 10. Update Protocols

### 10.1 Update Frequency

- **Event declaration logic:** Continuous (no restart needed)
- **Hazard model confidence thresholds:** Hourly checks (batch retraining overnight)
- **ICS form templates:** Weekly (updated when FEMA changes schema)
- **Escalation timing rules:** Quarterly (based on AAR feedback)
- **Database schemas:** Monthly (planned maintenance window)

### 10.2 Rollout Strategy

**For algorithm changes (e.g., cascade detection):**
1. Deploy to 10% of regions (non-critical areas)
2. Monitor confidence metrics for 24 hrs
3. Expand to 50% if metrics acceptable
4. Full rollout after 1 week validation

**For database changes:**
- Blue-green: Deploy new schema, dual-write for 1 week, migrate data, switch reads
- Rollback: Keep old schema for 2 weeks; revert read traffic if needed

**For UI changes:**
- Feature flag behind admin toggle
- 25% → 50% → 100% rollout over 1 week
- Separate feature flags per EMS admin role

### 10.3 Rollback Plan

**If error rate spikes above 1%:**
1. Automatic alert to on-call engineer
2. Revert service to previous version (within 2 min)
3. Page incident commander
4. Investigation post-incident

**If data corruption detected:**
1. Immediately pause writes to affected table
2. Restore from hourly backup (within 1 min)
3. Replay transaction log post-corruption
4. Notify affected EMS admins

### 10.4 User Notification

- **Admin interface:** "Update available" banner (non-blocking)
- **Mobile app:** Auto-update enabled (no user action)
- **Email:** Notification of breaking changes (e.g., API deprecation)
- **Changelog:** Published to internal wiki + GitHub releases

### 10.5 Testing Before Release

**Staging Environment:**
- Mirrors production (same data volume, queries)
- Test event generated with historical hazard data
- All integrations mocked (USGS, ICS, etc.)
- Load testing: 1000 concurrent users, 100 events/min

**A/B Testing Duration:**
- Metrics collected for 1 week in canary (10% traffic)
- Success criteria: Error rate <0.1%, latency p95 stable
- If criteria met: Expand to 100%

**Metrics Validated Before Rollout:**
- Latency p50/p95/p99
- Error rate
- Resource utilization (CPU, memory, disk)
- Model accuracy (if applicable)

---

## 11. Cross-Module Dependencies

### 11.1 Consumes (Inputs to Event Manager)

| Module | Data Type | Frequency | Use |
|--------|-----------|-----------|-----|
| **Hazard Models** | Trigger signals, confidence scores | Real-time | Auto-event declaration, confidence validation |
| **User Location System** | User positions (anonymized) | Continuous | Affected population estimate, danger assessment |
| **User Danger Manager** | Danger projections, recommendations | On-demand | Evacuation command generation |
| **Hazard Models Framework** | Confidence thresholds, model state | Hourly | Decision rules for publication |
| **Authentication/Auth** | User roles, permissions | On-demand | Authorization for event actions |
| **Mesh Network** | Offline observation queues | On-connect | Sync cached sightings |

### 11.2 Provides (Outputs from Event Manager)

| Module | Data Type | Frequency | Use |
|--------|-----------|-----------|-----|
| **Notification System** | Alert templates, zones, recipients | Real-time | Public & EMS alerts |
| **Evacuation Manager** | Event ID, zone geometry, timing | Real-time | Route generation, shelter assignment |
| **Hazard Models** | Observations, feedback signals | Real-time | Model calibration & retraining |
| **User Danger Manager** | Event ID, hazard projection | On-demand | Per-user threat assessment |
| **ICS System** | GeoJSON exports, form data | Every 5 min | Incident command coordination |
| **Resource Manager** | Resource requests, allocation signals | Real-time | Equipment & personnel coordination |
| **Data Pipeline** | Event logs, observations | Real-time | ETL ingestion, archival |
| **Backup Manager** | Event boundary, resource needs | On-event | Mutual aid activation |

### 11.3 Critical Path

**Must be built before Event Manager can ship:**
1. User Location System (need location for affected population)
2. Hazard Models (need trigger signals)
3. Notification System (need alert infrastructure)
4. Authentication (need role-based access)

**Can be built in parallel:**
- User Danger Manager (can mock initially)
- Evacuation Manager (can mock route generation)
- ICS integration (can stub out forms)

### 11.4 Teams to Consult

| Team | Topic | Timing |
|------|-------|--------|
| **Hazard Models Team** | Trigger thresholds, confidence scoring | Design phase (week 1) |
| **EMS Stakeholders** | Approval workflow, acknowledgment timing | Requirements (week 1-2) |
| **Legal** | ICS/NIMS compliance, data retention | Design (week 2) |
| **Data Team** | Database schema, archival strategy | Design (week 2-3) |
| **Frontend Team** | UI components, brand compliance | Implementation (week 4+) |
| **Ops/DevOps** | Kubernetes deployment, monitoring | Planning (week 3) |
| **Security** | Encryption key management, audit logs | Design (week 2) |

### 11.5 Potential Conflicts

**Conflict 1: Cascade Detection Timing**
- Problem: If two hazards occur simultaneously, which is primary?
- Resolution: Coordinator agent uses model confidence; highest confidence = primary
- Mitigation: Document decision in audit log; allow EMS manual override

**Conflict 2: Zone Expansion vs. Evacuation Complexity**
- Problem: Larger zones require more evacuation routing capacity
- Resolution: Routing engine reports feasibility; if not feasible, recommend phased evacuation
- Mitigation: Resource manager tracks evacuation capacity in real-time

**Conflict 3: Observation Contradiction**
- Problem: Users contradict fire location, model disagrees
- Resolution: Flag for EMS manual verification; model continues using original confidence
- Mitigation: Count contradictions; if 10+ users contradict, lower model confidence by 20%

**Conflict 4: Offline Event Merging**
- Problem: Two events declared offline, then merge on reconnect
- Resolution: Server performs merge; local user sees notification "Events merged into [merged_id]"
- Mitigation: Preserve both event IDs in audit log for traceability

---

## 12. Cost Tracking

### 12.1 Infrastructure (Monthly)

| Component | Estimate | Notes |
|---|---|---|
| **Compute** | $3,500 | EKS cluster: 5 nodes (t3.xlarge), autoscaling to 20 |
| **Database** | $2,500 | RDS PostgreSQL (db.r5.xlarge) + TimescaleDB dedicated instance |
| **Cache** | $500 | ElastiCache Redis (cache.r5.large) |
| **Storage** | $1,000 | S3 (Standard + Glacier): 10 TB total, tiered retention |
| **Message Queue** | $200 | NATS cluster on Kubernetes (included in compute) |
| **Networking** | $300 | ALB, NAT Gateway, cross-region transfer |
| **Search** | $400 | Elasticsearch for audit log search (dev/staging only; prod uses S3 Select) |
| **Monitoring** | $800 | CloudWatch, Datadog, custom dashboards |
| **Backup** | $150 | Automated RDS & S3 backups |
| **SSL Certificates** | $50 | AWS Certificate Manager (free, but management tools) |
| **3rd-party APIs** | $200 | USGS/NWS/satellite data feeds |
| **Total** | ~$10,000 | |

### 12.2 Personnel (Monthly)

| Role | Count | Hours/Month | Cost | Notes |
|---|---|---|---|---|
| **Team Lead (Event Ops)** | 1 | 160 | $20,000 | Planning, EMS coordination, incident response |
| **Backend Engineer** | 2 | 320 | $40,000 | Event lifecycle, integrations, performance |
| **DevOps Engineer** | 1 | 160 | $16,000 | Deployment, monitoring, infrastructure |
| **QA/Testing** | 1 | 160 | $10,000 | Integration testing, load testing, staging |
| **Data Engineer** | 1 | 80 | $10,000 | Archive pipeline, data anonymization (part-time) |
| **On-Call Support** | 2 | 60 | $8,000 | 24/7 incident response (shared across team) |
| **Total** | 8 | 900 | $104,000 | |

**Fully Loaded Cost (Infrastructure + Personnel):** ~$114,000 / month

### 12.3 Optimization Ideas

1. **Reduce Database Costs (-$300/mo):** Use RDS read replicas for audit log queries instead of always-on Elasticsearch
2. **Optimize Compute (-$500/mo):** Use spot instances for non-critical workloads (staging, batch jobs)
3. **S3 Lifecycle Policies (-$200/mo):** Faster transition to Glacier (1 day instead of 7)
4. **Consolidate Monitoring (-$300/mo):** Use CloudWatch only; remove Datadog
5. **Regional Failover (-$400/mo):** Reduce standby region capacity during low-risk periods
6. **Shared Infrastructure (-$1,000/mo):** Event Manager shares EKS cluster with other modules (already done)

**Potential Monthly Savings:** ~$2,700 (24% reduction) with optimization

---

## 13. Agent Monitoring & Human Oversight

### 13.1 Cascade Detection Agent

**Agent Role:** Automatically detect when one hazard triggers a secondary hazard (e.g., earthquake → landslide).

**Decision Points:**
1. Detect pattern in real-time data (earthquake magnitude + terrain → avalanche risk)
2. Query secondary hazard model for activation probability
3. If probability > 60%: Automatically activate secondary module
4. Report decision to Coordinator Agent

**Human Oversight:**
- Module lead reviews cascade detection in post-event audit
- If false positive rate > 5%: Revert to manual approval for that cascade type
- EMS can manually block cascade detection if they disagree (logged)

**Monitoring Metrics:**
- Cascade detection precision (% of auto-detected cascades that were real)
- Detection latency (time from trigger to activation)
- Override rate (how often humans disagree)

### 13.2 Observation Validation Agent

**Agent Role:** Filter spam, score confidence, triangulate multiple observations.

**Decision Points:**
1. New observation arrives
2. Run spam filter (historical user accuracy, observation plausibility)
3. Calculate confidence based on source + location + time
4. Triangulate with nearby observations (within 5km, within 10min)
5. Return confidence score to event manager

**Human Oversight:**
- User can contradict observation with photo evidence
- EMS can manually override confidence score
- If spam filter has >10% false positive rate: Revert to manual review

**Monitoring Metrics:**
- Spam precision/recall
- Confidence score calibration (do events with 80% confidence actually occur 80% of the time?)
- Triangulation accuracy (does consensus location match actual hazard?)

### 13.3 Zone Expansion Agent

**Agent Role:** Recommend evacuation zone updates based on hazard evolution.

**Decision Points:**
1. Monitor hazard projections over time
2. If projected zone expands >20%: Flag for EMS review
3. Calculate affected population change
4. Estimate new evacuation routes needed
5. Request EMS approval before expanding zone

**Human Oversight:**
- EMS must approve all zone expansions (never auto-execute)
- Agent provides reasoning: "Fire projected to spread NE; 500 additional residents affected"
- EMS can override and draw custom zone instead

**Monitoring Metrics:**
- Zone expansion precision (do projected expansions actually occur?)
- Timing accuracy (do expansions happen on schedule?)
- EMS approval rate (what % of recommendations are approved?)

### 13.4 Resource Conflict Resolution Agent

**Agent Role:** Prevent double-allocation of resources across hazard modules.

**Decision Points:**
1. New resource request arrives (e.g., helicopter from wildfire module)
2. Check if helicopter already allocated to flood event
3. Query availability from resource manager
4. If unavailable: Recommend alternative or escalate to EMS
5. Log decision for audit trail

**Human Oversight:**
- EMS resource manager has final approval on all allocations
- Agent recommends priorities based on affected population
- EMS can override recommendation and allocate differently

**Monitoring Metrics:**
- Allocation conflict detection rate
- Resolution time (how long to resolve conflicts)
- Resource utilization efficiency

### 13.5 ICS Export Agent

**Agent Role:** Automatically generate and export ICS forms every 5 minutes.

**Decision Points:**
1. Collect current event state (geometry, observations, resources)
2. Generate ICS-201 (briefing), ICS-202 (objectives), ICS-205 (communication)
3. Package as GeoJSON
4. Send to NIMS system
5. Log export in S3

**Human Oversight:**
- Module lead reviews ICS-201 before first generation (manual verification)
- After approval, exports run automatically
- EMS can manually edit form if system errors
- Changes tracked in audit log

**Monitoring Metrics:**
- Export generation latency
- NIMS submission success rate
- Data accuracy (do ICS forms reflect actual event state?)

---

## 14. Employee Interface Requirements

### 14.1 Model Training Dashboard

**Purpose:** Allow ML engineers to retrain cascade detection and confidence scoring models with post-event data.

**Features:**
- Event timeline view (with observation/decision history)
- Data quality metrics (how many observations? spam rate?)
- Model performance metrics (precision/recall on test set)
- Confidence curve (model prediction vs. actual outcome)
- Retraining trigger: "Retrain with last 10 events"
- A/B test comparison (old model vs. new model on historical data)

**Workflow:**
1. Engineer selects date range of events
2. System pulls observations + ground truth (did cascade actually occur?)
3. Engineer configures training hyperparameters
4. System trains model; shows validation metrics
5. Engineer approves; model deployed to staging
6. 1-week A/B test in canary (10% of regions)
7. If metrics improve: Gradual rollout to 100%

### 14.2 Accuracy Dashboards

**Event Manager Accuracy Board:**
- Trigger accuracy: "Of 50 auto-triggered events, 47 were real (94%)"
- False positive rate: "5 false alarms in last 90 days (1%)"
- False negative rate: "2 missed events in last 90 days (0.5%)"
- Confidence calibration: "Events with 80% confidence occurred 82% of the time"

**Cascade Detection Board:**
- Precision: "Of 10 auto-detected cascades, 8 were real (80%)"
- Recall: "Of 12 total cascades, 10 were detected (83%)"
- Detection latency distribution (p50/p95/p99)
- Override rate: "EMS overrode 2/10 cascade decisions (20%)"

**Observation Confidence Board:**
- Spam filter performance (precision/recall)
- Triangulation accuracy (consensus location within X meters of actual?)
- Confidence calibration curve (80% confidence observations: did 80% actually occur?)

### 14.3 Simulation Tools

**Multi-Event Simulator:**
- Load historical event data (wildfire + flood overlap, for example)
- Replay event with current models and decision rules
- Compare output: "Would we have evacuated same zone? Same timing?"
- Identify improvements: "If we had used new cascade model, would cascade have been detected 3 min earlier?"

**Stress Test Simulator:**
- Simulate 10 concurrent events
- Monitor system latency, database load, alert delivery
- Identify bottlenecks: "ICS export takes 8s under 10-event load (should be <2s)"
- Recommend scaling adjustments

### 14.4 Sighting Review Interface

**Purpose:** Allow EMS field teams and supervisors to review and validate observations.

**Features:**
- Map of all sightings for event (color by confidence)
- Timeline view (observations ordered by timestamp)
- Photo gallery (all photos from sighting)
- Triangulation indicator ("12 sightings triangulated to 1 location")
- Confirmation button: "I verified this sighting in field"
- Contradiction form: "This sighting is incorrect; here's photo evidence"
- Bulk action: "Mark all sightings in zone as confirmed"

**Workflow:**
1. EMS patrol drives through event zone
2. Review sightings in their current location
3. Tap "Confirmed" if they see fire/damage/hazard
4. Upload field photo
5. Sighting confidence increases; feeds back to models

### 14.5 ICS Form Builder Interface

**Purpose:** Allow EMS to manually edit or create ICS forms when system auto-generation fails.

**Features:**
- Form template selector (201/202/205)
- Auto-populated fields (incident name, location, affected population)
- Manual field editor (objectives, resources, contacts)
- Live preview (how form will look when printed/submitted)
- Validation: "Missing incident commander name; form cannot be submitted"
- Approval workflow: "Form submitted by [Chief]; waiting for regional IC approval"
- Version history: "ICS-201 v3, updated at 14:32 by [Name]"
- Export options (PDF for filing, JSON for NIMS, email to stakeholders)

**Workflow:**
1. Chief creates new ICS-201
2. System populates incident basics from Beacon event
3. Chief adds objectives + resources manually
4. Chief submits for regional approval
5. Regional IC reviews; approves or requests changes
6. Once approved, form exported to NIMS + printed for operations center

### 14.6 Database Schema Explorer

**Purpose:** Allow data engineers to inspect event data structure during/after emergency.

**Features:**
- Table browser (explore events, observations, cascade records, etc.)
- Query builder (SQL or visual)
- Data profiling (column types, null rates, value distributions)
- Relationship diagram (foreign keys, data dependencies)
- Export data (JSON, CSV)
- Performance analysis (index usage, query plans)

**Use Cases:**
- "How many observations came from social media sources?" → Browse observations, filter by source_type
- "Did cascade detection work correctly on the wildfire event from March 15?" → Query cascade_events table
- "What's the distribution of confidence scores?" → Data profiling → histogram of confidence column

---

## 15. API Endpoints (Event Management Service)

### 15.1 Event Lifecycle

```
POST /api/v1/events
  Body: { hazard_type, geometry, severity, declared_by, manual/auto }
  Response: { event_id, created_at, status }

GET /api/v1/events/{event_id}
  Response: { event_id, status, geometry, observations_count, affected_pop, ... }

PATCH /api/v1/events/{event_id}
  Body: { action: escalate|de_escalate|close, new_severity?, reason }
  Response: { updated event object }

GET /api/v1/events?status=active&hazard_type=wildfire
  Response: { events: [...], total_count }
```

### 15.2 Sightings

```
POST /api/v1/events/{event_id}/observations
  Body: { location, observation_type, source_id, magnitude, images: [...] }
  Response: { observation_id, confidence_score }

GET /api/v1/events/{event_id}/observations
  Response: { observations: [...], triangulation_consensus: {lat, lon, confidence} }

POST /api/v1/observations/{obs_id}/contradict
  Body: { contradiction_reason, evidence_photo }
  Response: { contradiction_id, observation_status: 'disputed' }
```

### 15.3 EMS Coordination

```
GET /api/v1/events/{event_id}/ems-chain
  Response: { primary_contact, secondary_contacts, acknowledgment_status, escalation_history }

POST /api/v1/events/{event_id}/ems-acknowledge
  Body: { ems_id, action: acknowledged|en_route|on_scene }
  Response: { acknowledgment_id, updated_status }

POST /api/v1/events/{event_id}/resources/request
  Body: { resource_type, quantity, priority, location }
  Response: { request_id, status }

GET /api/v1/events/{event_id}/resources
  Response: { allocated: [...], available: [...], conflicts: [...] }
```

### 15.4 Cascade Detection

```
GET /api/v1/events/{event_id}/cascade-status
  Response: { is_cascade: boolean, primary_event_id, secondary_event_id?, merge_status }

POST /api/v1/events/{event_id}/cascade/approve-merge
  Body: { decision: merge|keep_separate, reasoning }
  Response: { action_taken, merged_event_id? }
```

### 15.5 ICS Integration

```
GET /api/v1/events/{event_id}/ics/201
  Response: { form_data, filled_fields, pending_fields }

PATCH /api/v1/events/{event_id}/ics/201
  Body: { incident_commander, objectives: [...], estimated_costs }
  Response: { updated_form, validation_errors? }

POST /api/v1/events/{event_id}/ics/export
  Query: ?format=json&forms=201,202,205
  Response: { geojson, forms: {...} }

POST /api/v1/events/{event_id}/ics/submit-to-nims
  Body: { approver_id }
  Response: { submission_id, fema_receipt_timestamp? }
```

### 15.6 Audit & Compliance

```
GET /api/v1/events/{event_id}/audit-trail
  Query: ?start_time=ISO8601&end_time=ISO8601&action=escalate|declare|close
  Response: { entries: [{ timestamp, user_id, action, data_before, data_after }] }

GET /api/v1/events/{event_id}/aar-data
  Query: ?anonymize=true
  Response: { event_summary, observations_summary, decisions_timeline, metrics }
```

---

## 16. Success Metrics & Long-Term Vision

### 16.1 Operational Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Event declaration latency (P95) | <100ms | TBD (pilot phase) |
| EMS alert delivery SLA | <1 min (100% within 2 min) | TBD |
| Cascade detection accuracy | >85% precision | TBD |
| Observation confidence calibration | Within 5% of predicted | TBD |
| Audit log completeness | 100% of actions logged | TBD |
| ICS form generation time | <2s | TBD |
| System availability during events | 99.95% | TBD |

### 16.2 User Satisfaction Metrics

- **EMS satisfaction:** Quarterly survey; target >4/5 on usability
- **Feature adoption:** Track % of EMS using cascade detection override (should be <10% to indicate system is working)
- **Decision confidence:** "Did the system help you make better decisions?" (target >80% agree)

### 16.3 Long-Term Vision

**Year 1:** Core Event Management + ICS integration (this module)

**Year 2:** Advanced cascade detection; multi-region coordination

**Year 3:** AI-powered resource allocation; predictive zone expansion (prevent evacuations using better forecasting)

**Year 5+:** Fully autonomous decision support (agent makes recommendations with human sign-off, eventually reduces to logging-only if accuracy proven)

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Cascade Event** | Secondary hazard triggered by primary (e.g., earthquake → landslide) |
| **Confidence Score** | 0-100 model prediction that a hazard/observation is real |
| **Hazard Trigger** | Measurement that crosses threshold; initiates auto-declaration |
| **ICS/NIMS** | Incident Command System / National Incident Management System (federal emergency standards) |
| **Observation** | User/EMS report of fire/flood/damage; includes location, photo, source |
| **Sighting** | Synonym for observation (observation used internally; sighting in UX) |
| **Spam Filter** | ML model that identifies false/malicious observations |
| **Triangulation** | Combining multiple observations to estimate true hazard location |
| **Zone** | Evacuation area polygon; defines who receives alerts |

## Appendix B: Related Documentation

- `/planning/notes/37_event_protocols/event_protocols_overview.md` — Trigger thresholds, ICS details
- `/planning/notes/21_beacon_world_model/human_intelligence_vs_llms.md` — Goal-oriented decision framework
- `/planning/notes/22_modeling_simulation/modeling_simulation.md` — Model compression, DL surrogates
- `/planning/notes/08_public_user_features/public_user_features.md` — User-facing evacuation features
- `/planning/notes/10_ems_client_groups/ems_capabilities.md` — EMS workflows, resource management

---

**Document Version:** 1.0
**Last Updated:** 2026-03-25
**Owner:** Event Operations Lead
**Status:** Ready for Implementation
