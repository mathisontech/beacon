# Communications & Alerts Module — Complete Development Documentation

**Module Role:** Time-critical information delivery to users and coordinated emergency response personnel across multi-channel infrastructure (push, SMS, mesh, IPAWS).

**Responsibility:** Notifications & Alerts Manager + Mesh Network Manager

**Ownership:**
- Director: Communications & Alerts Operations
- Leads: Alert Composition & Workflows, Multi-Channel Delivery, Mesh Network Protocol, Security & Compliance, Partnerships (Ring/Starlink)

---

## 1. FUNCTIONALITY OVERVIEW

### 1.1 Notifications & Alerts Manager

**Core Responsibility:** Getting time-critical information to affected users through the fastest available channels, with approval workflows for human oversight.

#### 5-Tier Alert System

| Level | Type | Content | Delivery | Repeat | DND Override | Fallback |
|-------|------|---------|----------|--------|--------------|----------|
| 1 | Informational | Weather updates, forecasts, general guidance | Standard push | None | Respects DND | None |
| 2 | Advisory | Preparedness actions, air quality, service disruptions | Priority push (1hr delay) | Single | Override after 1h | SMS if opted-in |
| 3 | Watch | Potential hazard (strong wind, winter storm watch) | High-priority push | 10-min repeat x3 (30min window) | Full override | SMS + audible (1sec beep) |
| 4 | Warning | Imminent hazard (tornado, flash flood) | Urgent push | 2-min repeat x10 (20min window) | Full override | SMS + automated call + SOS banner |
| 5 | Emergency | Life-threatening (evacuation order, extreme fire) | Continuous push | 30-sec repeat indefinitely | All contacts | SMS + call + mesh broadcast + siren |

**Key Metrics:**
- Level 1 delivery: Standard channel (respects DND)
- Level 2-3: Escalate to SMS if push fails
- Level 4-5: Escalate to phone calls + SMS + local siren coordination
- Frequency cap: 20 push/hour per user (except Level 5)
- Rate limiting: 200 alerts/day per area (prevents spam)
- Target delivery latency: <2 min from alert issuance to user receipt
- Push delivery success target: 95%+
- SMS delivery success target: 85%+

#### Multi-Channel Delivery

**Push Notifications (Primary)**
- Apple Push Notification service (APNs) for iOS
- Firebase Cloud Messaging (FCM) for Android
- Batched delivery every 10 seconds (max 1000/batch)
- Retry logic: APNs (3x over 30min), FCM (5x over 60min)

**SMS (Fallback & Opted-in)**
- Sent via Twilio premium routes
- High-deliverability carrier agreements
- Format: `BEACON [TYPE] - [Location]. [Action]. [Details]. [Link]`
- Compression: ~100-120 chars per alert
- Target latency: <2min handset receipt
- Payload: Alert headline + deep link to app detail view

**Automated Phone Calls (Level 4+)**
- Text-to-speech delivery when SMS fails
- Format: `[Alert type]. [Main instruction]. Reply STOP to opt out.`
- Non-blocking (user can hang up immediately)
- Conditional escalation: Level 4 after 2-min unacknowledged, Level 5 every 5 minutes

**Mesh Network Broadcast (Level 3+)**
- High-priority alerts (Level 3+) broadcast to all mesh nodes within 10 miles
- Offline users receive alert bundle when reconnected
- Mesh caches recent alerts (24-hour window)
- TTL=5 (max 5 hops)
- Target latency: <5min from alert issuance to offline user mesh sync

**IPAWS/WEA/CAP Integration**
- Ingests CAP (Common Alerting Protocol) feeds from NOAA every 2 minutes
- Parses: incident_area, severity (extreme/severe/moderate), urgency, onset/expires times, headline, description, instructions
- Deduplication by areaDesc + severity + hazard type
- WEA delivery status tracking (coverage gap detection)
- Local CAP feeds from fire dispatch, police, EMS (timestamp alignment ±1min)

#### Alert Templates & Escalation

**Template-Driven Composition**
- Pre-composed templates by hazard type with variable slots (location, time, speed, etc.)
- Templates tested for clarity, brevity, actionability
- Examples:
  - Wildfire: `Evacuation Order [1/2/3] for [area]. [Routes]. [Shelters]. Time to impact: [X min].`
  - Tornado: `Tornado [Watch/Warning]. Seek shelter [location guidance]. [Wind speed, direction, movement].`
  - Wind: `High Wind [Watch/Warning]. Expected gusts [X mph]. Secure items. Duration: [time].`
  - Flooding: `Flash Flood [Watch/Warning]. Avoid [areas]. [Safe routes]. [Duration].`
  - Hazmat: `Hazardous Materials Release in [area]. [Shelter/evacuate direction]. Report symptoms [number].`

**Escalation Logic**
- If alert unacknowledged after 5 minutes, system escalates:
  - Level 3 Watch: repeat every 5 min for 30 min, add SMS
  - Level 4 Warning: repeat every 2 min for 45 min, add SMS + phone call
  - Level 5 Emergency: repeat every 30 sec indefinitely, SMS + call + push + mesh
- Acknowledgment per-user (tapping notification or opening alert detail)
- Escalation pauses for acknowledged users but continues for others

**User Controls**
- Mute push entirely (SMS-only mode)
- Disable SMS (push-only mode)
- Subscribe to specific hazard types only (wind, flood, fire, etc.)
- DND (Do Not Disturb) settings: time windows, override levels

#### Approval Workflows

**Tiered Authorization**
- Agent drafts alert text (AI system or human)
- Module lead review: <15-min SLA, approve/reject/modify
- CTO co-sign required for >50K recipients
- Automatic approval for pre-approved templates under threshold

**Audit Trail**
- All drafts, rejections, modifications logged with timestamp + user
- Decision tracking: Who approved, when, what changes
- Rejection reasoning required (stored for post-event analysis)

#### Acknowledgment Tracking

**Per-User Tracking**
- Alert ID + User ID + Timestamp acknowledged
- Stored in DeliveryLog table
- Analytics: Acknowledgment rate by alert type, geography, time-of-day
- Re-escalation prevented for acknowledged users

**Escalation Prevention**
- Same alert (areaDesc + hazard type) doesn't re-escalate if acknowledged
- New alert (different area or hazard type) triggers new escalation sequence
- Status update alerts (30-min summaries during multi-hour events) don't escalate

### 1.2 Mesh Network Manager

**Core Responsibility:** Offline-first peer-to-peer communication when carrier networks are down, with intelligent traffic prioritization and compression.

#### Mesh Architecture

**Multi-Layer Connectivity**
- BLE Mesh: Short-range (10-100m), low power, all devices
- WiFi Direct: Medium-range (100-300m), higher bandwidth, device-to-device
- LoRa: Long-range (5+ km), very low power, ground penetration
- Starlink Backbone: Satellite uplink for rural/remote areas
- Ring Doorbell Relay: Distributed relay points from 5M+ Ring doorbells

**Peer Discovery**
- BLE scan: Discover nearby mesh nodes
- Signal strength tracking: RSSI averaging
- Capability advertisement: Max message size, battery level, supported protocols
- TTL-based flooding: Broadcasts reach all nodes within hop limit

**Link Establishment**
- BLE mesh: ECDH P-256 pairing + AES-256-GCM session encryption
- WiFi Direct: Group formation, passphrase-based auth
- LoRa: Pre-shared key registration with device ID
- All links: 5-minute security sliding window + per-packet nonce to prevent replay

#### Traffic Prioritization

**Three-Tier Priority System**
1. **EMS Traffic (Tier 1):** 100% priority, always routes first
   - Alert acknowledgments from field responders
   - Resource requests
   - Critical status updates
   - Target latency: <500ms through mesh

2. **Help Requests (Tier 2):** 50% priority (subject to congestion)
   - "I'm stuck" broadcasts
   - Shelter-in-place requests
   - Welfare check responses
   - Animal rescue coordination

3. **Status Updates (Tier 3):** 10% priority (lowest)
   - Location updates
   - Event status summaries
   - Map tile synchronization
   - Historical data sync

**Congestion Response**
- Standard messages queued before custom messages
- Low-priority (Tier 3) messages drop if queue exceeds capacity
- High-priority (Tier 1) messages buffer indefinitely
- Queue backlog visible to users (notification shows delivery pending)

#### Compression Strategy

**Payload Classification**
- Detect message type: Standard alert, location, media, custom
- Choose compression algorithm:
  - Standard alerts: Protocol Buffers (90% compression)
  - Locations: Varint encoding (75% compression)
  - Media: Zstd (50-70% compression)
  - Custom text: Zstd (30-40% compression)

**Algorithm Selection**
- Protocol Buffers: Standard pre-composed messages (alerts, status codes)
  - ~5ms encode/decode
  - 300 bytes → 30 bytes (90% reduction)
  - Perfect for repeated alert delivery

- Zstd: General-purpose compression
  - ~10ms encode/decode
  - Variable ratio (30-70% depending on content)
  - Streaming support for large payloads

- Delta Encoding: Map tiles + location sequences
  - Send only changes from previous known state
  - 70-90% reduction for tile updates
  - Group representation: Send distribution of points, not individual coordinates

**Size Estimation**
- Typical payloads:
  - Emergency alert: 300 bytes → 30 bytes compressed
  - Location update: 50 bytes → 12 bytes compressed
  - Map tile update: 50KB → 5KB compressed
- Target: 70-90% compression ratio across mesh traffic

#### Battery Management

**Power Budget Allocation**
- Transmit power reduction: Lower power levels for short distances
- Feature gating: Disable non-critical features at low battery
  - <20% battery: Disable background location sync, reduce mesh polling
  - <10% battery: Mesh receive-only mode, disable map rendering
  - <5% battery: Emergency SOS broadcast only

**Transmission Duty Cycle**
- Estimate battery drain rate: mAh/hour under current radio utilization
- Allocate transmission budget: Hours remaining × transmission cost
- Adjust message queueing: High-priority messages always transmit, low-priority queued

**Offline Queue Management**
- Maximum queue size: 100MB (expandable to 500MB on devices with large storage)
- Storage priority: Recent high-priority messages retained
- Deletion: Oldest low-priority messages dropped first when full
- Re-transmission: Auto-retry queued messages every 5 minutes when network unavailable

#### Routing & Topology

**Path Selection**
- Compute mesh topology: BFS from device to all reachable peers
- Breadth-first routing: Fewest hops preferred
- Link quality metric: RSSI + hop success history
- Alternate paths: Maintain backup routes if primary path congested

**Topology Tracking**
- Periodically (every 30 sec) rediscover peer list via BLE scan
- Update routing table with discovered peers
- Track hop success rate: (Successful relays / Attempted relays) per peer
- Age out dead peers: Remove unreachable nodes after 5-minute timeout

**Fragment Detection**
- Monitor for mesh partitions: Groups of nodes isolated from main mesh
- Broadcast to largest fragment only (prevents duplicate delivery to other fragments)
- Notify users if in disconnected fragment (simplified UI, queuing to primary mesh)

#### Offline Sync Queue

**Message Buffering During Outages**
- Messages queued if device offline (no cell service, mesh unreachable)
- Queue persisted to device storage (JSON + binary payloads)
- Retry period: Every 5 minutes attempt delivery (mesh sync, WiFi, LTE, SMS)
- Max queue age: 24 hours (older messages deleted)

**Reconnection Handling**
- Detect connectivity restoration: Network monitor detects LTE/WiFi availability
- Bundle delivery: Send all queued messages in single batch
- Deduplication: Merge local + cloud queue (prevent duplicate delivery)
- User notification: "Sync in progress" → "Sync complete" with delivery counts

**Cross-Device Sync**
- All user devices maintain separate queues
- Cloud sync point: Beacon servers as arbiter
- De-duplication: Cloud identifies duplicate messages (same content, same timestamp)
- Example: Device A sends message while offline, Device B sends same message via cloud → Merged into single delivery record

#### Starlink Partnership Integration

**Mesh Backbone Connectivity**
- Starlink ground stations: 100+ gateways across western US
- Mesh nodes can relay to nearby ground station (RF signature identification)
- Priority: (1) Direct WiFi/LTE, (2) Mesh relay to Starlink gateway, (3) Mesh relay to cell tower, (4) Store-and-forward

**Rural Area Coverage**
- Areas without cell service: Starlink backbone sole uplink option
- Latency: 20-30ms to ground station + 50-100ms to Beacon servers (total ~100ms)
- Used for bulk data (model updates, historical sync), not real-time operations
- Bandwidth cap: 10 Gbps/month included + $5/GB overage

**Emergency Priority Access**
- During disasters, Starlink escalates Beacon traffic to emergency VPN
- Guaranteed 10 Mbps uplink (priority over other customers)
- SLA: 99.5% uptime for primary gateways, failover <2 sec
- Cost: $100K/month for priority access

#### Ring Partnership Integration

**Doorbell Relay Points**
- 5M+ Ring doorbells in western US = distributed relay infrastructure
- Mesh nodes can relay to nearby doorbell (WiFi Direct or BLE)
- Doorbells maintain persistent internet connection (AWS IoT integration)
- Acts as relay to cloud → Beacon servers

**Baseline Imagery for Damage Assessment**
- Opt-in: Users share anonymized street-facing footage
- Processing: LiDAR reprojection model learns typical street appearance
- Event-time: Compare live frames to baseline for damage detection
- Privacy: All data treated as Restricted; opt-in per homeowner

**Loot/Arson Detection**
- Post-event object detection: Backpack, vehicle, crowbar in doorbell footage
- Flags suspicious activity: Person entering damaged property, carrying items
- Alerts: Property owner + local police
- Requires owner consent at signup

**Financial Model**
- Cost to Beacon: $0.10/doorbell/month = 5M × $0.10 × 12 = $6M/year
- Revenue: Premium loot detection ($2/month) × 500K subscribers = $12M/year
- Net positive revenue offset

---

## 2. INDEPENDENT DEVELOPMENT BLOCKS

### Block A: Alert Composition & Templates

**Dependencies:** Database (PostgreSQL), message schema
**Owned by:** Alert Workflows Team
**Deliverables:**
- Template editor UI (EMS admin interface)
- Template storage (templates table)
- Variable slot injection engine
- Hazard-type-specific templates (8+ templates)
- Testing: Template clarity + variable coverage

**Database Schema:**
```
templates (
  id UUID primary key,
  hazard_type VARCHAR (wildfire, flood, earthquake, etc.),
  alert_level INTEGER (1-5),
  template_text TEXT (with {var} placeholders),
  variables JSONB {required: [location, duration], optional: [wind_speed]},
  test_coverage JSON {text_clarity_score, brevity_score, actionability_score},
  created_by UUID (employee),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**API Endpoints:**
- `POST /api/v1/admin/templates` — Create new template
- `GET /api/v1/admin/templates?hazard_type={type}&level={level}` — List templates
- `PUT /api/v1/admin/templates/{id}` — Update template
- `POST /api/v1/admin/templates/{id}/test` — Render template with test variables
- `DELETE /api/v1/admin/templates/{id}` — Archive template

---

### Block B: Approval Workflow Engine

**Dependencies:** Templates (Block A), database, notification system
**Owned by:** Alert Workflows Team
**Deliverables:**
- Approval dashboard UI (module lead, CTO view)
- Workflow state machine (draft → pending → approved/rejected)
- SLA tracking (15-min module lead, CTO for >50K)
- Audit logging (all decisions + reasoning)

**Database Schema:**
```
alert_drafts (
  id UUID primary key,
  template_id UUID references templates,
  variables JSONB {location, duration, etc.},
  rendered_text TEXT (final message),
  draft_by UUID (employee or AI system),
  draft_at TIMESTAMP,
  status VARCHAR (draft, pending_approval, approved, rejected),
  approval_history JSONB [
    {reviewer_id, action, timestamp, reasoning}
  ],
  recipient_count INTEGER,
  requires_cto_sign BOOLEAN,
  expires_at TIMESTAMP (auto-delete if not approved within 15min)
)
```

**State Machine:**
- Draft → Pending (sent to module lead)
- Pending → Approved (module lead accepts, auto-routes to CTO if >50K)
- Pending → Rejected (module lead denies, provides reasoning)
- Approved → Published (CTO co-signs or auto-approves if <50K)
- Published → Delivered (alert sent to users)

---

### Block C: Multi-Channel Delivery Engine

**Dependencies:** User contact DB, APNs/FCM credentials, Twilio account, approval workflow
**Owned by:** Delivery Infrastructure Team
**Deliverables:**
- Push delivery layer (APNs + FCM batch manager)
- SMS fallback layer (Twilio integration)
- Call delivery layer (text-to-speech + carrier gateway)
- Mesh broadcast integration
- Retry logic + failure handling

**Database Schema:**
```
delivery_log (
  id UUID primary key,
  alert_id UUID references alert_drafts,
  user_id UUID references users,
  channel VARCHAR (push, sms, call, mesh),
  delivered_at TIMESTAMP nullable,
  acknowledged_at TIMESTAMP nullable,
  attempt_count INTEGER,
  last_attempt_at TIMESTAMP,
  failure_reason VARCHAR nullable,
  retry_scheduled_at TIMESTAMP nullable,
  compression_ratio FLOAT
)

delivery_queue (
  id UUID primary key,
  alert_id UUID,
  user_id UUID,
  channel VARCHAR,
  priority INTEGER (1-5),
  enqueued_at TIMESTAMP,
  target_delivery_time TIMESTAMP,
  status VARCHAR (queued, sent, failed, acknowledged)
)
```

**API Endpoints:**
- `POST /api/v1/alerts/{id}/deliver` — Initiate multi-channel delivery
- `POST /api/v1/alerts/{id}/send-sms-fallback/{user_id}` — Trigger SMS for failed push
- `POST /api/v1/alerts/{id}/send-call/{user_id}` — Trigger call for Level 4+
- `GET /api/v1/alerts/{id}/delivery-status` — Check delivery statistics
- `POST /api/v1/alerts/{id}/acknowledge` — User acknowledges receipt

---

### Block D: Escalation & Auto-Repeat Manager

**Dependencies:** Delivery engine (Block C), user preferences, acknowledgment tracking
**Owned by:** Alert Workflows Team
**Deliverables:**
- Escalation state machine (Watch → Warning → Emergency)
- Repeat scheduling engine (cron-based or queue-based)
- User acknowledgment detection + pause escalation
- Per-alert escalation history tracking

**Escalation Rules:**
- Level 3 Watch (unacknowledged): repeat every 5 min for 30 min
- Level 4 Warning (unacknowledged): repeat every 2 min for 45 min + SMS + call
- Level 5 Emergency (unacknowledged): repeat every 30 sec indefinitely
- Acknowledged by user: Pause escalation, but continue for other users

**Implementation:**
```
escalation_schedules (
  id UUID primary key,
  alert_id UUID,
  user_id UUID,
  current_level INTEGER (1-5),
  escalation_start_at TIMESTAMP,
  next_repeat_at TIMESTAMP,
  acknowledged_at TIMESTAMP nullable,
  repeat_count INTEGER,
  max_repeats INTEGER,
  repeat_interval_sec INTEGER
)
```

---

### Block E: IPAWS/WEA/CAP Integration

**Dependencies:** External data feeds, alert database
**Owned by:** External Data Integration Team
**Deliverables:**
- CAP feed polling (NOAA servers, local dispatch)
- CAP parser (XML → alert objects)
- Deduplication logic (areaDesc + severity + type)
- WEA delivery status tracking
- Local CAP feed ingestion

**Integration Points:**
- NOAA CAP feeds (every 2 minutes): Tornado, flood, winter storm alerts
- NWS API (weather.gov): Watches + warnings
- Local CAP feeds: Fire dispatch (CAL FIRE), police, EMS
- WEA carriers: Verizon, AT&T, T-Mobile delivery status

**CAP Parsing:**
```
cap_alerts (
  id UUID primary key,
  cap_identifier VARCHAR (source ID),
  incident_area GEOMETRY (polygon),
  severity VARCHAR (extreme, severe, moderate, minor),
  urgency VARCHAR (immediate, expected, future),
  onset TIMESTAMP,
  expires TIMESTAMP,
  headline TEXT,
  description TEXT,
  instruction TEXT,
  areaDesc VARCHAR,
  source VARCHAR (NWS, CAL_FIRE, etc.),
  ingested_at TIMESTAMP,
  deduplicated_to UUID nullable (if duplicate)
)
```

---

### Block F: Mesh Network Protocol Stack

**Dependencies:** BLE/WiFi/LoRa drivers, NATS message bus, Redis
**Owned by:** Mesh Network Protocol Team
**Deliverables:**
- Peer discovery (BLE scan engine)
- Link establishment (pairing, encryption)
- Routing engine (topology + path selection)
- TTL-based flooding
- Security (ECDSA signing, nonce/timestamp validation)

**Core Functions:**
- `discover_peers(region_radius)` → List[Peer]
- `establish_ble_link(peer_id)` → LinkState
- `establish_wifi_direct_link(peer_id)` → LinkState
- `route_message(dest_id, payload)` → NextHop
- `broadcast_mesh_message(message, ttl)` → HopCount
- `compute_relay_path(start, end)` → Path[]

**Message Format (Protocol Buffer):**
```protobuf
message MeshPacket {
  bytes packet_id = 1;        // 256-bit nonce
  int64 timestamp = 2;        // Milliseconds since epoch
  bytes origin_id = 3;        // Sender device ID
  bytes dest_id = 4;          // Final recipient (or broadcast)
  bytes next_hop_id = 5;      // Relay node
  bytes payload = 6;          // Compressed message
  int32 ttl = 7;              // Hops remaining
  bytes signature = 8;        // ECDSA P-384 signature
  int32 priority = 9;         // 1 (EMS) to 3 (status)
}
```

---

### Block G: Compression Engine

**Dependencies:** Protocol Buffers, Zstd library, message classification
**Owned by:** Mesh Network Protocol Team
**Deliverables:**
- Message type detection
- Algorithm selection logic
- Codec implementations (Protobuf, Zstd, delta encoding)
- Compression ratio tracking

**Functions:**
- `detect_payload_type(message)` → CompressionType
- `compress_payload_protobuf(json_object)` → ByteArray
- `compress_payload_zstd(bytes)` → ByteArray
- `decompress_payload(compressed_bytes)` → OriginalData
- `estimate_compressed_size(original_size, type)` → EstimatedBytes

**Compression Metrics:**
```
compression_stats (
  id UUID,
  timestamp TIMESTAMP,
  message_type VARCHAR,
  original_size_bytes INTEGER,
  compressed_size_bytes INTEGER,
  compression_ratio FLOAT,
  encode_time_ms FLOAT,
  decode_time_ms FLOAT
)
```

---

### Block H: Battery Management System

**Dependencies:** Device telemetry, mesh network status, feature flags
**Owned by:** Mobile Client Team (with Mesh Network support)
**Deliverables:**
- Battery drain estimation model
- Feature gating logic (<20%, <10%, <5% thresholds)
- Transmission duty cycle calculator
- Offline queue prioritization

**Functions:**
- `manage_battery_budget(battery_pct, urgency)` → TransmitTimeAllowance
- `reduce_transmit_power(battery_pct, distance)` → PowerLevel
- `disable_idle_features(battery_pct, threshold)` → FeatureState
- `estimate_battery_drain(current_pct, tx_rx_ratio)` → HoursRemaining

**Battery Model:**
- Baseline drain (idle): 2% per hour
- Mesh transmission: +1% per 5 minutes transmitting
- GPS polling: +0.5% per location fix
- Screen on: +3% per hour

---

### Block I: Rate Limiting & Frequency Capping

**Dependencies:** Redis (counter storage), delivery engine
**Owned by:** Alert Workflows Team
**Deliverables:**
- Per-user push cap (20/hour, except Level 5)
- Per-area alert cap (200/day)
- Queuing logic for excess alerts
- Rate limit status API

**Redis Keys:**
```
alert:rate_limit:{user_id}:{hour} → Counter (atomic increment)
alert:area_cap:{area_code}:{day} → Counter
alert:queue:{user_id} → List[Alert] (queued for next hour)
```

**Logic:**
- Check `alert:rate_limit:{user_id}:{hour}` before delivery
- If >= 20, queue for delivery after hour boundary
- Exception: Level 5 alerts always deliver immediately
- Per-area cap: Check before publishing to prevent spam

---

### Block J: Analytics & Monitoring

**Dependencies:** Delivery log, acknowledgment tracking, performance metrics
**Owned by:** Analytics & Operations Team
**Deliverables:**
- Alert delivery success metrics
- Acknowledgment rate tracking
- Mesh broadcast reach statistics
- SMS deliverability by carrier
- Real-time health dashboard

**Metrics:**
```
alert_metrics (
  timestamp TIMESTAMP,
  alert_id UUID,
  alert_level INTEGER,
  alert_type VARCHAR,
  geography VARCHAR (area code),
  total_recipients INTEGER,
  push_delivered INTEGER,
  sms_delivered INTEGER,
  call_delivered INTEGER,
  mesh_delivered INTEGER,
  acknowledged_count INTEGER,
  delivery_latency_sec FLOAT,
  acknowledgment_rate FLOAT
)

mesh_metrics (
  timestamp TIMESTAMP,
  message_count INTEGER,
  avg_hops INTEGER,
  avg_compression_ratio FLOAT,
  delivery_success_rate FLOAT,
  avg_latency_ms FLOAT,
  nodes_active INTEGER
)
```

---

### Block K: Employee Interface — Alert Composition Dashboard

**Dependencies:** Templates (Block A), approval workflow (Block B), delivery stats
**Owned by:** UI/UX Team
**Deliverables:**
- Alert composer UI (template selection + variable input)
- Real-time recipient count estimate
- Approval status tracker
- Delivery tracking dashboard
- Analytics view (historical performance)

**UI Components:**
- Template selector (dropdown filtered by hazard type + level)
- Variable input form (auto-generated from template schema)
- Recipient preview (map + count, by geography)
- Approval timeline (submitted → module lead → CTO → published)
- Delivery status (push % → SMS % → call % → mesh %)
- Acknowledgment tracker (real-time bar chart)

---

### Block L: Employee Interface — Mesh Network Health Dashboard

**Dependencies:** Mesh topology, peer statistics, offline queue metrics
**Owned by:** UI/UX Team
**Deliverables:**
- Live topology visualization (nodes + links)
- Peer signal strength map
- Battery drain trends
- Offline queue status
- Starlink/Ring relay point status

**Visualizations:**
- Network graph: Nodes colored by battery %, edges weighted by signal strength
- Heatmap: Coverage areas overlaid on map, gray zones = dead spots
- Timeline: Connection history (online/offline), uptime %, peak hour traffic
- Alerts: Partition detection, dead peers, saturated paths

---

### Block M: Employee Interface — Approval Workflow Dashboard

**Dependencies:** Alert drafts, approval history, SLA tracking
**Owned by:** UI/UX Team
**Deliverables:**
- Draft queue (pending review)
- SLA timer (15-min countdown, color coding)
- Bulk actions (approve multiple drafts)
- Rejection reason templates
- Archive of past decisions

**UI Components:**
- Inbox: List of pending drafts (sorted by SLA deadline)
- Detail view: Rendered alert preview + recipient count + audit history
- Action buttons: Approve, Reject (with dropdown for reason), Request changes
- Auto-approve threshold (for <50K recipients, no CTO review)
- Audit view: Show all past approvals + rejections (searchable by date, type, approver)

---

### Block N: Delivery Tracking Dashboard

**Dependencies:** Delivery log, acknowledgment data
**Owned by:** Analytics Team
**Deliverables:**
- Real-time delivery status (push/SMS/call counts)
- Acknowledgment tracker
- Failure analysis (by geography, channel, time-of-day)
- Historical comparison (this alert vs. similar alerts)

**Metrics Displayed:**
- Delivery timeline: X-axis = time since alert, Y-axis = % delivered (per channel)
- Acknowledgment curve: S-curve showing adoption over time
- Channel comparison: Push vs SMS vs call (stacked bar)
- Failure reasons: Pie chart (network, carrier reject, invalid number, etc.)

---

## 3. CONSIDERATION FRAMEWORK (7 CATEGORIES × ALL SUB-DIMENSIONS)

### 3.1 User Experience (UX)

**Accessibility**
- Alert text: Minimum 18pt font, high contrast (WCAG AA)
- Color not sole indicator: Icons + text for urgency levels
- Screen reader support: Alert level + hazard type + actionable text read aloud
- Audible alerts: Configurable volume + frequency (not 5 consecutive beeps)

**Clarity & Actionability**
- Every alert: Clear primary action (evacuate, shelter, stay put) in first sentence
- Consistent alert structure: [Action] + [Reason] + [Timeline] + [Resources]
- Jargon avoidance: "evacuation order" not "incident classification update"
- Testing: Read templates with non-emergency staff, measure comprehension

**User Control**
- Mute/disable toggles: Per hazard type, globally, time-window DND
- Preference granularity: Push only, SMS only, push+SMS, phone calls
- Deep link handling: Alert detail view pre-loaded, no extra taps
- Notification persistence: Alert remains in notification center until acknowledged

**Offline Behavior**
- Graceful degradation: Works without cellular + without internet
- Queue visualization: "Syncing 3 messages" status visible
- No data loss: Queued messages survive device power-off
- Transparent sync: User sees delivery count after connectivity restored

---

### 3.2 Performance & Reliability

**Latency Targets**
- Alert composition to delivery: <2 min (from publication to 95% user receipt)
- Mesh relay: <5 min offline user sync
- Push delivery: <30 sec from server → APNs/FCM → device
- Escalation trigger: <5 sec from unacknowledged threshold to repeat delivery

**Throughput & Capacity**
- Peak load: 1M deliveries/min (major multi-state fire event)
- Concurrent alerts: 10K active alerts (5+ levels)
- Mesh topology: 100+ hops, 1000+ node clusters
- SMS gateway: 10K SMS/min via Twilio

**Reliability Metrics**
- Push delivery success: 95%+ (target)
- SMS delivery success: 85%+ (target)
- No single point of failure: APNs failure → SMS fallback → mesh
- Retry logic: APNs 3x, FCM 5x, SMS 1x (no retry if failed)

**Failure Handling**
- APNs unavailable → Immediate SMS fallback
- FCM unavailable → Immediate SMS fallback
- SMS unavailable → Queue for retry + notify EMS of delivery failure
- Mesh partition → Alert queued, delivered to largest fragment + retried to others

**Backup & Recovery**
- Dual-region deployment: Primary + secondary AWS region
- Database replication: Real-time sync, automatic failover
- Cache strategy: Redis cluster (6 nodes), LRU eviction if full
- Disaster recovery: RTO 2 min (database), RTO 1 min (tile service)

---

### 3.3 Security & Privacy

**Data Protection**
- Encryption at rest: AES-256-GCM for all alert + delivery data
- Encryption in transit: TLS 1.3 for all APIs
- Mesh encryption: ECDH P-256 pairing + AES-256-GCM per-session
- Key rotation: Quarterly for AWS KMS, per-message for mesh

**Access Control**
- Role-based access: Employee → Admin → Director hierarchy
- Principle of least privilege: Employees see only alerts relevant to their module
- MFA required: All employee + EMS admin login
- API authentication: JWT with RS256 signature, 15-min token TTL

**Audit & Compliance**
- All approvals logged: Who, when, what changes, reasoning
- Delivery audit trail: Every send attempt + reason for failure
- User privacy: Alert acknowledgments tied to user_id, not device ID
- PII handling: Never include SSN, address, phone in alert text

**Security Testing**
- Quarterly vulnerability scan: Qualys + Tenable
- Semi-annual pen testing: Internal high-risk zones
- Annual external pen testing: Full surface area
- Post-deployment testing: Every major release

**Incident Response**
- On-call rotation: 24/7 incident commander
- Response timeline: T+0 detect, T+15 notify, T+60 contain, T+4hr customer notification
- Evidence preservation: S3 object lock (immutable logs)
- Post-incident review: Within 24 hours, document root cause + remediation

---

### 3.4 Regulatory & Compliance

**FCC Regulations**
- IPAWS/WEA compliance: Send only authorized messages, follow CAP standards
- SMS carrier compliance: Use approved short codes, respect STOP commands
- Call recording: Text-to-speech calls don't require recording consent (no recording)
- Frequency limits: No more than 1 call per user per hour (except EMS category 5)

**Data Residency & Retention**
- User data: Retained 90 days post-event, then anonymized
- Alerts: Retained 7 years (audit + regulatory requirement)
- Delivery logs: Retained 6 months (operational), then archived to Glacier
- Mesh node data: Retained 7 days (transient)

**Accessibility Compliance**
- WCAG 2.1 AA: All UI elements conform
- 508 compliance: Federal contractor requirement
- Testing: Automated scanning + manual testing with screen readers
- Annual audit: Third-party accessibility assessment

**CMMC Level 2 Compliance**
- Access control (3.1): RBAC with least privilege
- Identification & authentication (3.2): MFA for all users
- System development (3.7): Code review + static analysis (SonarQube, Snyk)
- Incident response (3.6): Documented procedures, 60-min response time

**FedRAMP Authorization Path**
- CMMC Level 2 prerequisite (12-month path)
- JAB stream (faster, 12-18 months) or Agency-specific (FEMA sponsor)
- System Security Plan (SSP) + Security Assessment Report (SAR)
- Continuous monitoring post-authorization (3 years)

---

### 3.5 Operations & Monitoring

**Operational Dashboards**
- Health status: All systems green/yellow/red
- Alert pipeline: Drafts → Approvals → Deliveries (flow rate)
- Channel status: Push/SMS/call/mesh delivery rates
- Escalation queue: Pending repeats, retry backlog
- Error budget: % of SLA consumed (by module)

**Alerting Thresholds**
- Push delivery <90%: Page on-call engineer
- SMS delivery <70%: Page on-call engineer
- Mesh delivery latency >10min: Investigate
- Approval SLA breach: Email module lead
- Rate limit queue >1000 messages: Investigate

**Metrics Collection**
- Prometheus: Scrape delivery success, latency, compression ratios
- CloudWatch: AWS service metrics (Lambda, RDS, SQS)
- Custom metrics: Alert-specific (approval time, escalation count)
- Retention: 30 days detailed, 1 year aggregated

**Runbooks**
- APNs outage: Activate SMS fallback, page Apple liaison
- SMS outage: Queue for retry, escalate to Twilio support
- Mesh partition: Manually merge largest fragments, broadcast merge notification
- Rate limit saturation: Scale delivery pipeline, investigate source

---

### 3.6 Cost & Resource Management

**Infrastructure Costs**
- APNs/FCM: $0.10 per million pushes = $100K/year (at 1B pushes/year)
- Twilio SMS: $0.0075 per SMS = $75K/year (at 10M SMS/year)
- Twilio voice: $0.013 per minute = $130K/year (10K calls × 5min avg)
- Starlink priority: $100K/month = $1.2M/year
- Ring partnership: $0.10/doorbell/month = $6M/year (5M doorbells)

**Database Costs**
- PostgreSQL RDS: ~$8K/month (multi-AZ, 15TB)
- Redis: ~$100/month (6-node cluster)
- S3 storage (delivery logs): ~$5K/month

**Total Estimated Annual Cost:**
- Small scale (10M users): $2-3M
- Medium scale (100M users): $8-10M
- Enterprise scale (500M users): $15-20M

**Cost Optimization**
- Push batching: Combine multiple alerts into single batch → reduce API calls
- SMS compression: Keep under 160 chars → single segment (no overage)
- Mesh priority: Reduce SMS/call escalation → cheaper mesh delivery
- Ring revenue: Premium loot detection ($2/month × 500K) = $12M/year → offsets Ring cost

---

### 3.7 Maintenance & Evolution

**Technical Debt Management**
- Legacy template system: Refactor to schema-based system (estimated 40hrs)
- Delivery retry logic: Consolidate across channels (estimated 20hrs)
- Mesh routing: Optimize BFS algorithm for 1000+ node scale (estimated 60hrs)
- Compression codec: Benchmark new algorithms (estimated 30hrs)

**Scalability Roadmap**
- Year 1: 100M users, 1 state (CA)
- Year 2: 300M users, 3 states (CA, OR, WA)
- Year 3: 500M users, 5 states + territories
- Year 5: 1B+ users, national coverage

**Feature Backlog**
- Geofence-based alerts (2Q 2026): Send alerts to users entering zones
- Multi-language templates (3Q 2026): Spanish, Mandarin, Vietnamese
- Haptic feedback (4Q 2026): Vibration patterns per hazard type
- Deaf/blind accessibility (1Q 2027): VoiceOver testing, high-contrast modes

**Deprecation Schedule**
- Legacy push protocol (v1): Sunset by 2027 (3 years notice)
- SMS fallback (if push >99%): Consider sunsetting by 2030
- BLE Mesh v1: Replace with v2 (longer range, lower latency) by 2028

---

## 4. DETAILED DOCUMENTATION PER DEVELOPMENT BLOCK

### Block A: Alert Composition & Templates

**Architecture**
- Template storage: PostgreSQL `templates` table
- Variable schema: JSON schema validation (JSONSchema standard)
- Rendering: Jinja2-like template engine (server-side)
- Validation: Type checking + required field verification

**Data Model**
```
templates {
  id: UUID (primary key)
  hazard_type: VARCHAR (wildfire, flood, earthquake, wind, tornado, severe_weather, hazmat, utility_outage, ems_request)
  alert_level: INTEGER (1-5)
  template_text: TEXT (with {var} placeholders)
  variables: JSONB {
    required: [{name, type, description, example}, ...],
    optional: [{name, type, description, example}, ...]
  }
  examples: JSONB [{input_vars, rendered_output}, ...]
  testing_metrics: JSONB {text_clarity_score, brevity_score, actionability_score}
  created_by: UUID (employee ID)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  active: BOOLEAN
}
```

**Variable Types**
- location: City, county, neighborhood (e.g., "San Jose", "Santa Cruz County")
- time_duration: Hours, minutes (e.g., "45 minutes", "2 hours")
- wind_speed: MPH (e.g., "60 mph", "70-80 mph gusts")
- fire_size: Acres (e.g., "500 acres", "2,500 acres")
- evacuation_level: 1, 2, or 3
- shelter_address: Full address with coordinates
- routes: Route names (Route 89 North, Highway 101)
- resource_count: Number of shelters, buses, etc.

**API Endpoints**
```
POST /api/v1/admin/templates
Request: {hazard_type, alert_level, template_text, variables, examples}
Response: {id, created_at}

GET /api/v1/admin/templates?hazard_type={type}&level={level}
Response: [{id, hazard_type, alert_level, template_text, ...}, ...]

PUT /api/v1/admin/templates/{id}
Request: {template_text, variables, ...}
Response: {updated_at}

POST /api/v1/admin/templates/{id}/test
Request: {test_variables}
Response: {rendered_text, char_count, approval_required}

DELETE /api/v1/admin/templates/{id}
Response: {archived_at}
```

**Testing Criteria**
- Text clarity: Read by 5 non-emergency staff, measure comprehension (target 95%+)
- Brevity: Fit in SMS (160 chars) when compressed
- Actionability: "What should I do?" clearly answerable from text
- Variable coverage: All required variables used in template

---

### Block B: Approval Workflow Engine

**State Machine**
```
[Draft] --submit--> [Pending Approval] --approve--> [CTO Review] --approve--> [Published]
                                     |
                                     +--reject--> [Rejected] --resubmit--> [Pending Approval]

Timeouts:
- Pending Approval: 15 minutes (module lead SLA)
- CTO Review: 5 minutes (for >50K recipients)
- Published: Alert expires after 24 hours (auto-delete if not delivered)
```

**Data Model**
```
alert_drafts {
  id: UUID (primary key)
  template_id: UUID (references templates)
  variables: JSONB (location, duration, etc.)
  rendered_text: TEXT (final alert message)
  draft_by: UUID (employee or AI system)
  draft_at: TIMESTAMP
  status: VARCHAR (draft, pending, approved, cto_review, published, rejected, expired)
  approval_history: JSONB [
    {reviewer_id, action, timestamp, reasoning, duration_sec}
  ]
  recipient_count: INTEGER
  geography: GEOMETRY (polygon of affected area)
  requires_cto_sign: BOOLEAN (true if >50K recipients)
  expires_at: TIMESTAMP
  published_at: TIMESTAMP nullable
}
```

**SLA Tracking**
- Module lead: 15 minutes from submission to review
- CTO: 5 minutes from escalation (only if >50K recipients)
- Auto-approval: Drafts <50K recipients + matching pre-approved template
- Timeout handling: Page on-call approver if timeout imminent (at 80% mark)

**Rejection Workflow**
- Reason templates: (1) Inaccurate, (2) Premature, (3) Grammar/clarity, (4) Violates policy
- Return to draft: Employee notified, can edit and resubmit
- Resubmit resets SLA: 15-min clock restarts
- Rejection archive: Searchable history for post-event analysis

---

### Block C: Multi-Channel Delivery Engine

**Architecture**
- Delivery orchestrator: Routes alert to appropriate channels
- Channel-specific handlers: APNs, FCM, SMS, Call, Mesh
- Failure handling: Escalates to next channel on failure
- Batch processing: Coalesces multiple alerts into single API call

**Delivery Flow**
```
Alert Published
  ↓
Query user list (by geography)
  ↓
For each user:
  ├─ Check delivery preferences (push only? SMS only?)
  ├─ Check frequency cap (20/hour)
  ├─ Create delivery queue entry
  ↓
Batch deliver (every 10 sec):
  ├─ APNs batch (up to 1000)
  ├─ FCM batch (up to 1000)
  ├─ SMS gateway (up to 100/batch, rate-limited by Twilio)
  ├─ Mesh broadcast (flood with TTL=5)
  ↓
Retry failed:
  └─ APNs → SMS (if push failed)
  └─ FCM → SMS (if push failed)
  └─ SMS → Mesh (if SMS failed for Level 4+)
```

**Push Notification Formatting**
- Title: Hazard type + severity (e.g., "Emergency: Evacuation Order")
- Body: Main action + location (e.g., "Evacuate San Jose. Leave on Route 101 North.")
- Deep link: beacon://alerts/{alert_id} (pre-loads alert detail view)
- Custom data: {alert_level, hazard_type, affected_area_polygon}
- Sound: Custom alert sound (1-sec beep for Level 3, 3-sec siren for Level 4, 5-sec siren for Level 5)

**SMS Formatting**
- Length: Compressed to fit 1-2 segments (160-320 chars)
- Format: `BEACON [TYPE] — [Location]. [Action]. [Time]. [Link]`
- Example: `BEACON EVAC — San Jose. Leave on Rte 101 N. Go now. beacon.app/a/{short_code}`
- Link: Bitly shortening (reduces to ~25 chars)

**Phone Call Formatting**
- Text-to-speech: Natural sounding, ~1 sec per sentence
- Message: `[Alert type]. [Main instruction]. Reply STOP to opt out.`
- Example: `Evacuation Order. Leave San Jose immediately on Route 101 North. Reply STOP to opt out.`
- Timing: Non-blocking (user can hang up anytime)

**API Endpoints**
```
POST /api/v1/alerts/{id}/deliver
Request: {}
Response: {delivery_queue_count, channel_breakdown}

GET /api/v1/alerts/{id}/delivery-status
Response: {total_recipients, push_sent, push_delivered, sms_sent, sms_delivered, call_sent, call_delivered, mesh_broadcast_count, mesh_acknowledgments}

POST /api/v1/alerts/{id}/acknowledge
Request: {device_id}
Response: {acknowledged_at}
```

---

### Block D: Escalation & Auto-Repeat Manager

**Escalation State Diagram**
```
[Unacknowledged] (Level 3)
  └─ 5min → [Escalated Level 3] (repeat every 5min for 30min)
             └─ 30min → [Escalated Level 4?] (depends on alert type)

[Unacknowledged] (Level 4)
  └─ 5min → [Escalated Level 4] (repeat every 2min for 45min) + SMS + call
             └─ 45min → [Escalated Level 5?] (depends on alert type)

[Unacknowledged] (Level 5)
  └─ 5min → [Escalated Level 5] (repeat every 30sec indefinitely) + SMS + call + mesh

[Acknowledged] → Stop escalation (per user)
```

**Implementation**
```
escalation_schedules {
  id: UUID
  alert_id: UUID
  user_id: UUID
  current_level: INTEGER (1-5)
  escalation_start_at: TIMESTAMP
  next_repeat_at: TIMESTAMP
  acknowledged_at: TIMESTAMP nullable
  repeat_count: INTEGER
  max_repeats: INTEGER
  repeat_interval_sec: INTEGER
}
```

**Scheduling Logic**
- Every 30 seconds: Check escalation_schedules for alerts due to repeat
- For each due alert:
  - If acknowledged_at set: Skip (user already notified)
  - Else: Re-queue for delivery (same channels as initial)
- Update next_repeat_at: current_time + repeat_interval_sec

---

### Block E: IPAWS/WEA/CAP Integration

**Data Sources**
1. NOAA CAP feeds (https://alerts.weather.gov)
   - Polling: Every 2 minutes
   - Feeds: Tornado warnings, flood watches, winter storm advisories
   - Format: CAP (Common Alerting Protocol) XML

2. Local CAP feeds (from fire dispatch, police, EMS)
   - Polling: Every 5 minutes
   - Format: Same CAP XML
   - Authentication: API key per agency

3. WEA delivery status
   - Polling: Every 5 minutes
   - Carriers: Verizon, AT&T, T-Mobile
   - Info: Message delivered count, failure reasons

**CAP Parsing**
```
cap_alert {
  cap_identifier: "US20260325-001" (unique source ID)
  incident_area: {type: "Polygon", coordinates: [[lat,lon], ...]}
  severity: "extreme" | "severe" | "moderate" | "minor"
  urgency: "immediate" | "expected" | "future"
  onset: 2026-03-25T14:30:00Z
  expires: 2026-03-25T18:30:00Z
  headline: "Tornado Warning"
  description: "A tornado warning has been issued for..."
  instruction: "Seek shelter immediately..."
  areaDesc: "Portions of Santa Clara County"
  source: "NWS San Francisco"
}
```

**Deduplication Logic**
- Key: areaDesc + severity + hazard_type (e.g., "Portions of Santa Clara County" + "extreme" + "Tornado")
- Match existing alerts: If key matches, treat as update (not new alert)
- Update detection: If description changed, note update_note
- Expiration: Remove expired alerts from active queue

**WEA Integration**
- WEA delivery status API: Query carrier networks
- Coverage gap detection: If WEA failed for >80% of area, escalate to SMS + push
- Logging: Track delivery success by carrier + geography

---

### Block F: Mesh Network Protocol Stack

**Peer Discovery (BLE Mesh)**
```
discover_peers(region_radius_meters) {
  // BLE scan for nearby devices advertising mesh service UUID
  // Filter by signal strength (>-80 dBm)
  // Return list of peers with RSSI, device name, supported protocols

  // Timeout: 5 seconds
  // Returns: [{peer_id, signal_strength_dbm, supported_protocols: [ble, wifi_direct, lora]}, ...]
}
```

**Link Establishment**
```
establish_ble_link(peer_id, auth_token) {
  // ECDH P-256 key exchange (1 sec)
  // Derive session encryption key (AES-256-GCM)
  // Negotiate MTU (max message size)
  // Return: LinkState {connected, encryption_key, mtu}

  // Timeout: 2 seconds
}
```

**Routing Engine**
```
route_message(dest_id, payload) {
  // Compute topology: BFS from device to all peers
  // Find shortest path (fewest hops)
  // Evaluate link quality (RSSI + success rate history)
  // Return: {next_hop_id, path_length, estimated_latency_ms}
}
```

**Broadcast Message**
```
broadcast_mesh_message(message, ttl) {
  // Assign 256-bit nonce + timestamp
  // Sign with ECDSA P-384 private key
  // Create MeshPacket with TTL
  // Flood to all neighbors (except sender)
  // Each relay decrements TTL, discards if TTL=0

  // Target: Reach all nodes within TTL hops
  // Latency: ~100ms per hop (BLE link delay ~20ms + routing ~30ms)
}
```

---

### Block G: Compression Engine

**Message Type Detection**
```
detect_payload_type(message) {
  if (is_standard_alert(message)) return "protobuf"
  if (is_location_update(message)) return "varint"
  if (is_map_tile(message)) return "delta_encoding"
  if (message.size < 1KB) return "protobuf"
  if (message.size > 10KB) return "zstd"
  return "zstd"
}
```

**Protocol Buffers (for Standard Alerts)**
- Encodes message structure as binary
- ~5ms encode/decode
- 300 bytes → 30 bytes (90% compression)
- Ideal for repeated messages (same structure)

**Zstd (General-Purpose Compression)**
- High compression ratio (50-70% for typical JSON)
- ~10ms encode/decode
- Streaming support (compress large payloads incrementally)
- Dictionary support (pre-learn common patterns)

**Delta Encoding (for Map Tiles)**
- Send only changed regions from previous tile
- 70-90% reduction for incremental updates
- Decoder maintains previous tile state
- Perfect for real-time map synchronization

---

### Block H: Battery Management System

**Battery Drain Estimation**
```
estimate_battery_drain(current_pct, tx_rx_ratio, idle_duration_hours) {
  // Baseline drain: 2% per hour (idle)
  // Mesh TX: +1% per 5 min transmitting
  // Mesh RX: +0.3% per 5 min receiving
  // GPS polling: +0.5% per location fix
  // Screen on: +3% per hour

  // Calculate remaining hours:
  // drain_rate = baseline + (tx_sec * tx_factor) + (rx_sec * rx_factor)
  // hours_remaining = current_pct / drain_rate

  return hours_remaining
}
```

**Feature Gating by Battery**
- >20% battery: Full features (location polling every 30 sec, mesh active)
- 20-10% battery: Location polling every 5 min, mesh receive-only
- 10-5% battery: Location polling every 10 min, mesh disabled
- <5% battery: Emergency SOS broadcast only, all other features disabled

**Transmission Duty Cycle**
```
manage_battery_budget(battery_pct, urgency) {
  // Allocate transmission time based on battery + urgency
  // High urgency (Tier 1): Always transmit, regardless of battery
  // Medium urgency (Tier 2): Transmit if >10% battery
  // Low urgency (Tier 3): Transmit if >20% battery

  // Duty cycle: transmission_time_per_hour = hours_remaining * transmission_cost
  return transmission_allowance_seconds_per_hour
}
```

---

### Block I: Rate Limiting & Frequency Capping

**Per-User Push Cap**
```
Redis key: alert:rate_limit:{user_id}:{hour}

Before delivery:
  count = INCR alert:rate_limit:{user_id}:{current_hour}
  if count >= 20 and alert_level < 5:
    APPEND alert:queue:{user_id} alert_id
    return QUEUED
  else:
    return DELIVER
```

**Per-Area Alert Cap**
```
Redis key: alert:area_cap:{area_code}:{day}

Before publishing:
  count = INCR alert:area_cap:{area_code}:{current_day}
  if count >= 200:
    return RATE_LIMITED (reject alert)
  else:
    return PUBLISH
```

**Queued Delivery**
- At hour boundary: Pop all queued alerts for user
- Deliver queued alerts: Batched (respect new hour's 20/hr cap)
- Exception: Level 5 alerts never queued, always deliver immediately

---

### Block J: Analytics & Monitoring

**Delivery Metrics Collection**
```
After each delivery:
  INSERT INTO alert_metrics VALUES (
    timestamp: NOW(),
    alert_id: {id},
    alert_level: {1-5},
    alert_type: {hazard_type},
    geography: {area_code},
    total_recipients: COUNT(user_ids),
    push_delivered: COUNT(push_success),
    sms_delivered: COUNT(sms_success),
    call_delivered: COUNT(call_success),
    mesh_delivered: COUNT(mesh_success),
    delivery_latency_sec: {end_time - start_time},
    ...
  )
```

**Dashboard Queries**
- Success rate by channel: `SELECT channel, COUNT(*) as delivered, COUNT(*) as total, delivered/total as success_rate FROM delivery_log GROUP BY channel`
- Latency percentiles: `SELECT PERCENTILE_CONT(0.5), PERCENTILE_CONT(0.95), PERCENTILE_CONT(0.99) FROM delivery_log`
- Acknowledgment rate: `SELECT COUNT(acknowledged_at) / COUNT(*) FROM delivery_log GROUP BY alert_id`

---

## 5. DATABASE SCHEMAS (NORMALIZED)

**Core Tables:**
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  hazard_type VARCHAR(50) NOT NULL,
  alert_level INTEGER CHECK (alert_level >= 1 AND alert_level <= 5),
  template_text TEXT NOT NULL,
  variables JSONB NOT NULL,
  examples JSONB,
  testing_metrics JSONB,
  created_by UUID REFERENCES employees,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

CREATE TABLE alert_drafts (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES templates,
  variables JSONB NOT NULL,
  rendered_text TEXT NOT NULL,
  draft_by UUID REFERENCES employees,
  draft_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'draft',
  approval_history JSONB,
  recipient_count INTEGER,
  geography GEOMETRY(Polygon, 4326),
  requires_cto_sign BOOLEAN,
  expires_at TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE delivery_log (
  id UUID PRIMARY KEY,
  alert_id UUID REFERENCES alert_drafts,
  user_id UUID REFERENCES users,
  channel VARCHAR(20), -- 'push', 'sms', 'call', 'mesh'
  delivered_at TIMESTAMP,
  acknowledged_at TIMESTAMP,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  failure_reason VARCHAR(255),
  compression_ratio FLOAT,
  PRIMARY KEY (alert_id, user_id, channel)
);

CREATE TABLE escalation_schedules (
  id UUID PRIMARY KEY,
  alert_id UUID REFERENCES alert_drafts,
  user_id UUID REFERENCES users,
  current_level INTEGER,
  escalation_start_at TIMESTAMP,
  next_repeat_at TIMESTAMP,
  acknowledged_at TIMESTAMP,
  repeat_count INTEGER DEFAULT 0,
  max_repeats INTEGER,
  repeat_interval_sec INTEGER
);

CREATE TABLE mesh_peers (
  id UUID PRIMARY KEY,
  peer_id VARCHAR(64) UNIQUE,
  device_type VARCHAR(50),
  last_seen TIMESTAMP,
  signal_strength_dbm INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mesh_topology (
  id UUID PRIMARY KEY,
  snapshot_id VARCHAR(64),
  topology_json JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  fragment_count INTEGER
);
```

---

## 6. API ENDPOINT SPECIFICATION

**Alert Composition**
```
POST /api/v1/admin/alerts/compose
Request: {template_id, variables, recipient_geography}
Response: {alert_id, rendered_text, recipient_count, requires_cto_sign}

POST /api/v1/admin/alerts/{id}/submit-approval
Request: {drafting_notes}
Response: {status: "pending", expires_at}

PUT /api/v1/admin/alerts/{id}/approve
Request: {approval_notes}
Response: {status: "cto_review" | "published"}

PUT /api/v1/admin/alerts/{id}/reject
Request: {rejection_reason}
Response: {status: "rejected"}
```

**Delivery**
```
POST /api/v1/alerts/{id}/deliver
Request: {}
Response: {delivery_queue_count, channel_breakdown: {push, sms, call, mesh}}

GET /api/v1/alerts/{id}/delivery-status
Response: {total_recipients, delivered_by_channel, acknowledgment_rate, latency_stats}

POST /api/v1/alerts/{id}/acknowledge
Request: {device_id}
Response: {acknowledged_at, escalation_paused: true}
```

**Templates**
```
GET /api/v1/admin/templates?hazard_type={type}&level={level}
Response: [{id, template_text, variables, ...}, ...]

POST /api/v1/admin/templates/{id}/test
Request: {test_variables}
Response: {rendered_text, char_count, approval_required}
```

---

## 7. TESTING STRATEGY

**Unit Testing**
- Template rendering: Verify variable substitution, special character escaping
- Compression: Verify encode/decode round-trips, compression ratios
- Rate limiting: Verify counter increments, hour boundary resets
- Mesh routing: Verify BFS topology calculation, path selection

**Integration Testing**
- Approval workflow: Draft → Pending → Approved → Published
- Delivery pipeline: Alert → Push → SMS fallback on failure
- Escalation: Unacknowledged for 5min → repeat triggered
- Mesh broadcast: Message relayed to 5+ hops away

**Load Testing**
- 1M deliveries/min (100K concurrent push batches)
- Mesh topology with 1000+ nodes
- Compression throughput: 10K message/sec through codec
- Rate limiting: Verify no race conditions under contention

**Chaos Testing**
- APNs API failure: Verify SMS fallback activated within 30 sec
- SMS gateway timeout: Verify mesh fallback for Level 4+
- Mesh partition: Verify queuing + retry to largest fragment
- Database failure: Verify RTO <2 min, RPO <1 min

---

## 8. IMPLEMENTATION ROADMAP (PHASES)

**Phase 1 (Q2 2026): Core Alert System**
- Template management system
- Approval workflow engine
- Multi-channel delivery (push + SMS)
- Basic analytics

**Phase 2 (Q3 2026): Mesh Network Core**
- BLE mesh protocol implementation
- Compression engine (Protobuf + Zstd)
- Offline queue management
- Topology tracking

**Phase 3 (Q4 2026): Advanced Features**
- IPAWS/WEA/CAP integration
- Escalation + auto-repeat
- Rate limiting + frequency capping
- Mesh partitioning + recovery

**Phase 4 (Q1 2027): Partnerships & Scale**
- Starlink backbone integration
- Ring doorbell relay points
- LoRa mesh expansion
- Emergency priority access

**Phase 5 (Q2+ 2027): Optimization & Resilience**
- ML-based message routing (predict best hops)
- Adaptive compression (learn message patterns)
- Mesh coverage gap analysis
- Advanced analytics (per-hazard-type performance)

---

## 9. QUICK REFERENCE

**Alert Levels:** 1=Info, 2=Advisory, 3=Watch, 4=Warning, 5=Emergency
**Delivery SLA:** <2 min push, <2 min SMS, <5 min mesh
**Mesh Compression:** 70-90% reduction (Protocol Buffers + Zstd)
**Rate Limit:** 20 push/hour per user (except Level 5)
**Approval SLA:** 15 min (module lead) + 5 min (CTO if >50K)
**Mesh TTL:** 5 hops max, ~100ms per hop
**Retention:** Alerts 7 years, delivery logs 6 months, mesh nodes 7 days

---

End of Module Documentation
