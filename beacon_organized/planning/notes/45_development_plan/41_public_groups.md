# Public Groups Module

Coordinates users by shared geography or community. Supports four group types: Family, Neighborhood, Community, Organization. Enables location sharing, convoy coordination, resource pooling, and emergency communication within groups.

---

## 1. Module Metadata

**Team:** Group Coordination

**Parent Module:** Beacon Core Platform

**Sub-Modules:** Location Sharing (44), Messaging, Group Admin

**Goal:** Enable communities to coordinate evacuation, resource sharing, and mutual support during emergencies.

**Mission Alignment:** Saves lives through collective intelligence, peer resource sharing, and organized group evacuations.

**Owner:** [To be assigned]

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| Group creation | User action | JSON | On-demand | `{type, name, geometry, founder_id}` |
| Membership request | User action | JSON | On-demand | `{group_id, user_id, role_request}` |
| Location shares | User action | JSON | On-demand | `{group_id, user_id, granularity, duration}` |
| Message | User action | JSON | Real-time | `{group_id, author_id, channel, text, timestamp}` |
| Resource pool | User action | JSON | On-demand | `{group_id, resource_type, quantity, owner_id}` |
| Evacuation alert | Alert system | CAP/JSON | On-alert | `{zone_geometry, severity, shelter_list}` |
| **Output: Group view** | Mobile app | JSON | Real-time | `{members, location_map, messages, resources}` |
| **Output: Convoy roster** | Mobile app | JSON | On-request | `{drivers, passengers, vehicles, route, ETA}` |
| **Output: Shelter assignment** | EMS/mobile | JSON | On-event | `{member_id, shelter_id, transport_type}` |
| **Output: Resource alerts** | Mobile app | Push/in-app | Real-time | `{resource_type, available_count, locations}` |

**Output Consumers:** Mobile app, EMS admin, group members, neighboring groups during events.

---

## 3. Function Breakdown

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `createGroup()` | Initialize new group with type, boundaries | Name, type, geometry, founder | Group ID, invite code | p95 < 1s | User DB | Validation 100% |
| `discoverGroups()` | Find groups near user location | User location, group_type | Ranked group list | p95 < 500ms | User DB, geohash index | 5+ groups returned |
| `requestMembership()` | Join public/request private group | User ID, group ID, profile | Request ID, pending status | p95 < 500ms | User DB, Group DB | Duplicate request rejected |
| `approveMembership()` | Admin accepts group member | Request ID, admin ID | Member added, notification | p95 < 500ms | User DB, Group DB | Audit logged |
| `removeMember()` | Admin/founder removes member | Member ID, group ID, reason | Member removed, notified | p95 < 500ms | Group DB, Messaging | Location share revoked |
| `setLocationGranularity()` | User chooses location visibility per group | Group ID, granularity level | Updated setting | p95 < 500ms | User DB | Options: off/approx/neighborhood/exact |
| `toggleLocationSharing()` | Enable/disable location in group | Group ID, user ID, enabled | Setting applied | p95 < 500ms | User DB, Location sharing | Privacy audit logged |
| `shareMessage()` | Post to group channel | Group ID, user ID, text, channel | Message ID, broadcast | p95 < 500ms | Messaging system, Mesh | Encryption end-to-end |
| `createChannel()` | New group channel (announcements, resources, etc.) | Group ID, channel_name, visibility | Channel ID | p95 < 500ms | Group DB | Admin-only or member creation |
| `pinAnnouncement()` | Moderator highlights message | Message ID, moderator ID | Pinned status | p95 < 500ms | Messaging system | Top of channel always |
| `logisticsResource()` | Register vehicle, shelter, equipment for pooling | Group ID, user ID, resource_type, details | Resource ID, visibility | p95 < 500ms | Resource DB | Photo upload optional |
| `requestResource()` | Ask group for help with resource | Group ID, resource_type, quantity, need | Request ID, match list | p95 < 2s | Resource DB | Preference ranking |
| `offerResource()` | Volunteer resource to group | Group ID, user ID, resource_type, quantity | Offer ID, matching | p95 < 500ms | Resource DB, Mesh | Auto-match if exact fit |
| `viewResourcesNearby()` | See available resources in region | Location, resource_type, radius_km | Resource list with distance | p95 < 500ms | Resource DB, geohash | 99% availability |
| `startConvoy()` | Create evacuation convoy group | Zone ID, member IDs, drivers, shelters | Convoy ID, roster | p95 < 2s | Evacuation system, Vehicle DB | Vehicle capacity verified |
| `assignConvoyRole()` | Designate driver, passenger, leader | Convoy ID, member ID, role | Role assigned, confirmed | p95 < 500ms | Convoy DB | Location auto-share enabled |
| `updateConvoyStatus()` | Report convoy progress (departed, en route, arrived) | Convoy ID, status, timestamp | Broadcast to group | p95 < 500ms | Convoy DB, Messaging | EMS visible |
| `calculateGroupCoverage()` | Check if zone evacuation possible with group resources | Zone ID, group members | Coverage report: vehicles, capacity, routing | p95 < 10s | Vehicle DB, Road DB | Feasibility 90%+ |
| `suggestTrustedNeighbor()` | Recommend neighbor to help elderly/vulnerable | User ID, group ID, criteria | Ranked neighbor list | p95 < 2s | User DB, Trust scoring | Vetting passed |
| `designateTrustedNeighbor()` | Family authorizes neighbor for emergency help | User ID, neighbor ID, authority_level | Relationship recorded | p95 < 500ms | Trusted neighbor DB | Notification to neighbor |
| `viewGroupAnalytics()` | Admin sees group stats and activity | Group ID, admin ID | Member count, activity heatmap, message volume | p95 < 1s | Analytics DB | Last 30 days |
| `transferFounderRole()` | Founder transfers leadership to another member | Group ID, founder ID, new_founder_id | Role transferred, audit logged | p95 < 500ms | Group DB | Cannot transfer to self |
| `searchGroupMessages()` | Find past messages in group channels | Group ID, query, date_range | Ranked message list | p95 < 2s | Message index | Full-text search 99% recall |
| `scheduleBroadcast()` | Pre-compose alert to send at specific time | Group ID, message, send_time, template | Scheduled broadcast ID | p95 < 500ms | Message queue | Timezone-aware |
| `activateEventMode()` | Switch group to emergency operations mode | Event ID, zone geometry | Event interface, shelter assignments | p95 < 1s | Alert system | Evacuation zone map overlay |
| `displayEvacuationStatus()` | Show real-time member evacuation progress | Group ID, event ID | Departed/in-transit/arrived counts | p95 < 500ms | Evacuation DB, Location | Auto-update every 30s |
| `trackUnaccountedMembers()` | Identify members not responding to evacuation | Group ID, event ID, timeout_minutes | Unaccounted list with last-seen | p95 < 5s | Location DB, Messaging | Push notification escalation |
| `detectGroupInactivity()` | Identify dormant groups for archival | Group ID, activity_threshold | Inactivity status | p95 < 5s | Analytics DB | Threshold 90 days no posts |
| `archiveGroup()` | Deactivate dormant group, preserve messages for export | Group ID, archive_type | Group marked inactive, data exported | p95 < 2s | Group DB, Export system | On-demand export available |
| `dissolveGroup()` | Permanent deletion (only if <=20 members, <90 days) | Group ID, founder ID, reason | Group deleted, members notified | p95 < 1s | Group DB | Audit trail preserved |
| `validateMembership()` | Verify email domain or principal approval for schools | Member ID, group ID, verification_type | Verified status | p95 < 5s | Email/HRIS integration | Retry logic on failure |

**Key Algorithms:** Group discovery uses geohash bucketing + distance ranking. Trusted neighbor matching uses behavioral similarity + vetting history. Convoy routing minimizes bottlenecks + balances shelter capacity. Message indexing uses full-text search with recency decay.

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL, PostGIS, Elasticsearch, Redis, NATS, S3

### PostgreSQL + PostGIS

```sql
CREATE TABLE groups (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(500),
  description TEXT,
  founder_id BIGINT NOT NULL REFERENCES users(id),
  geometry GEOMETRY(Polygon, 4326),
  privacy_level VARCHAR(20),
  member_count INT,
  last_activity TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20)
);

CREATE TABLE group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  role VARCHAR(50),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_share_granularity VARCHAR(20),
  location_share_enabled BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN,
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, user_id)
);

CREATE TABLE group_channels (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(200),
  visibility VARCHAR(20),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE group_messages (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT NOT NULL REFERENCES group_channels(id) ON DELETE CASCADE,
  author_id BIGINT REFERENCES users(id),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMP WITH TIME ZONE,
  encrypted_location_blob BYTEA,
  reactions JSONB
);

CREATE TABLE group_resources (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  owner_id BIGINT REFERENCES users(id),
  resource_type VARCHAR(50),
  quantity INT,
  description TEXT,
  location GEOMETRY(Point, 4326),
  availability_status VARCHAR(20),
  photo_ref VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE resource_requests (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id),
  requester_id BIGINT REFERENCES users(id),
  resource_type VARCHAR(50),
  quantity_needed INT,
  urgency VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fulfilled_by BIGINT REFERENCES users(id),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20)
);

CREATE TABLE convoys (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id BIGINT,
  group_id BIGINT REFERENCES groups(id),
  origin GEOMETRY(Point, 4326),
  destination GEOMETRY(Point, 4326),
  assigned_shelter_id BIGINT,
  departure_status VARCHAR(20),
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  member_count INT,
  capacity_remaining INT
);

CREATE TABLE convoy_members (
  id BIGSERIAL PRIMARY KEY,
  convoy_id BIGINT NOT NULL REFERENCES convoys(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  role VARCHAR(50),
  vehicle_id BIGINT REFERENCES vehicles(id),
  confirmed BOOLEAN,
  location_share_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE trusted_neighbors (
  id BIGSERIAL PRIMARY KEY,
  authorized_user_id BIGINT NOT NULL REFERENCES users(id),
  trusted_neighbor_id BIGINT NOT NULL REFERENCES users(id),
  authority_level VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vetting_status VARCHAR(20),
  UNIQUE(authorized_user_id, trusted_neighbor_id)
);

CREATE TABLE group_audit_log (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups(id),
  actor_id BIGINT REFERENCES users(id),
  action VARCHAR(100),
  target_id BIGINT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_groups_geometry ON groups USING GIST(geometry);
CREATE INDEX idx_groups_last_activity ON groups(last_activity DESC);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_messages_channel ON group_messages(channel_id);
CREATE INDEX idx_group_messages_created ON group_messages(created_at DESC);
CREATE INDEX idx_group_resources_group ON group_resources(group_id);
CREATE INDEX idx_convoys_group ON convoys(group_id);
CREATE INDEX idx_convoy_members_convoy ON convoy_members(convoy_id);
```

### Elasticsearch

```
Index: group_messages
Fields: message_id, channel_id, author_name, text, timestamp, group_id, pinned
Mapping: full-text search on text, aggregate by channel + timestamp
```

### Redis

```
Key patterns:
  group:[group_id]:members → [user_ids]
  group:[group_id]:resources → {resource_type → count}
  convoy:[convoy_id]:location_updates → {member_id → {lat, lon, timestamp}}
  trusted_neighbors:[user_id] → [neighbor_ids + vetting_status]

TTL: Member list 1 hour, Resources 30 minutes, Convoy locations 5 minutes
```

### NATS Streams

```
Subject: groups.created
Subject: groups.members.joined
Subject: groups.members.left
Subject: groups.messages.posted
Subject: groups.resources.offered
Subject: groups.convoys.departed
Subject: groups.convoys.arrived
Subject: groups.event_mode.activated
Retention: 30 days, 10GB per group
```

### S3

```
Bucket: beacon-groups
Prefix: /group/{group_id}/messages/exports/
Prefix: /group/{group_id}/resources/photos/
Retention: 1 year for message exports, 90 days for resource photos
Access: Signed URLs for group members
```

**Data Size Estimate:** 1M groups, avg 200 members = 200M membership records. 10M messages/day per active group = 10B messages/year = ~2TB/year.

**Archival Strategy:** Archive dormant groups after 180 days. Keep message exports for 1 year. Delete resource photos after 90 days.

---

## 5. UI Components

**Screens:**
- Group discovery (map + list)
- Group detail (members, channels, resources)
- Group messaging (channels, thread view)
- Resource board (available/requested)
- Evacuation event mode (member status, shelter assignment)
- Convoy roster (drivers, passengers, vehicles, route)
- Group settings (privacy, roles, archival)
- Trusted neighbors setup (authorization, vetting)

**Buttons/Controls:**
- "Create Group": Teal #0097B2, main screen
- "Join Group": Teal #0097B2, discovery results
- "Request Help": Orange, in-group messaging
- "Share Resource": Navy #0B0F2A toggle, resource board
- "Start Convoy": Red, event mode
- "Mark Safe": Green, evacuation status
- "Leave Group": Gray, settings
- "Transfer Leadership": Navy #0B0F2A, admin only

**Map Layers:**
- Group boundary: Light purple polygon outline, z-order 40
- Member locations: Colored dots (verified neighbor, family, community), z-order 60, update 2min
- Resource locations: Icon pins (vehicle, shelter, equipment), z-order 65, update 10min
- Convoy route: Blue polyline with vehicle icons, z-order 80, update 1min
- Evacuation zone: Red hatched polygon overlay, z-order 70, update on alert

**Notifications/Alerts:**
- Member joined: In-app, "New member [name] joined group"
- Resource offered: In-app, "Available: [vehicle/shelter], offered by [member]"
- Evacuation order: Push + in-app banner, "[Group] evacuation recommended for [zone]"
- Convoy departing: Push, "Convoy [id] departing for [shelter] in 5 minutes"
- Member unaccounted: Push (admin), "[Name] not accounted for in evacuation"

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A for primary, teal #0097B2 for actions, red for evacuation.

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-groups-api | Node.js/Express | `npm run build && npm run test` | Backend team |
| beacon-groups-ui | React Native | `npm run build:ios && npm run build:android` | Mobile team |
| beacon-message-indexing | Elasticsearch + Logstash | `docker compose up` | Search team |
| beacon-convoy-routing | Go/gRPC | `go build ./...` | Routing team |

**Deployment:** Docker on Kubernetes. Elasticsearch cluster for message search. Redis cluster for member list caching.

**CI/CD:** GitHub Actions. Lint → unit tests → integration tests → canary 10% → 100%.

---

## 7. Lifecycle

**Milestones:**
1. **Months 1-2:** Design, API contracts, group types definition
2. **Months 2-4:** Group creation, membership, messaging, basic resources
3. **Months 4-5:** Evacuation event mode, convoy logistics, location sharing integration
4. **Months 5-6:** Trusted neighbors, admin tools, archival
5. **Month 6+:** Beta in 3 pilot cities, production rollout

**Build Phases:**
- Phase 1: Group CRUD, membership, messaging (2 months)
- Phase 2: Event mode, convoys, evacuation status (2 months)
- Phase 3: Resource pooling, trusted neighbors, admin (1 month)

**Test Coverage Targets:** 85% unit, 70% integration, 20% e2e. Priority: evacuation convoy correctness, message encryption, location privacy.

**Deployment Strategy:** Canary 10% → 50% → 100%. Rollback if error rate >0.5%.

**Monitoring Metrics:** Group load p95 <500ms, message delivery p95 <2s, member count accuracy 99%+, message search latency p95 <1s.

**Improvement Research:** User feedback on group discovery (A/B test geohash precision), convoy routing satisfaction, message search effectiveness.

---

## 8. Legal/Privacy/Security

**Applicable Regulations:** CCPA (member data, location), Privacy Act (school groups with student data).

**PII Handled:** Name, email, phone, home location, vehicle details, trusted neighbor relationships.

**Encryption:**
- Messages: End-to-end encryption, user keys stored locally
- Location in group: Encrypted with group public key before transmission
- In-transit: TLS 1.3
- At-rest: AES-256-GCM

**Audit Trail:** Member joins/leaves, role changes, location shares, message moderation all logged. Retained 1 year.

**Data Retention:** Messages kept per group policy (default 1 year). Location history 30 days. Member records deleted on removal + 30 days.

**Third-Party Integrations:** School district HRIS (membership verification), utility company systems (outage info), Stripe (donations/fund pooling).

---

## 9. Mesh/Offline

**Offline-First Features:**
- View cached group member list
- View cached recent messages (last 24 hours)
- Compose messages locally, sync on reconnect
- Report resource availability locally, broadcast on reconnect
- Participate in convoy with cached assignments

**Sync Strategy:** CRDT (Conflict-free Replicated Data Type) for message order and member list. Last-write-wins for resource availability.

**Cache Size:** Member list 50MB (1M groups x 200 members), message cache 500MB (48 hours), resource cache 100MB = ~700MB.

**Priority Queue:** Location updates → evacuation status → messages → resources.

**Compression:** GeoJSON simplified to 4 decimals, message text gzipped.

---

## 10. Update Protocols

**Update Frequency:** Continuous deployment for bug fixes, weekly feature releases, monthly major updates.

**Rollout Strategy:** Staged 2% → 10% → 50% → 100%.

**Rollback Plan:** Automatic rollback if error rate >1%, crash rate >0.1%.

**User Notification:** In-app banner for major updates, background automatic updates for patches.

**Testing Before Release:** Staging environment with real group data, A/B test 5% production for 48 hours.

---

## 11. Cross-Module Dependencies

**Consumes:**
- Account & Auth (43): User verification, role permissions
- Location Sharing (44): Granularity controls, privacy settings
- Public Users (40): User profiles, vehicle information
- Evacuation Manager: Shelter assignments, evacuation orders
- Messaging system: Message delivery, encryption

**Provides:**
- EMS Admin (42): Group evacuation status, resource inventory
- Public Users: Group discovery, member profiles
- Notification system: Group alerts, broadcasts

**Critical Path:** Account & Auth, Location Sharing must ship first. Evacuation Manager needed for event mode.

**Teams to Consult:**
- Privacy team: Location data in groups, CCPA
- Safety team: Volunteer vetting, liability
- EMS team: Event mode integration, shelter coordination

**Potential Conflicts:** Message encryption + moderation (hard to moderate encrypted messages). Location sharing + privacy expectations. Group size limits + all-hands groups.

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (API servers, message queue): $30K
- Database (PostgreSQL, replication): $15K
- Search (Elasticsearch cluster): $10K
- Cache (Redis): $5K
- Storage (S3 message exports): $8K
- Messaging (NATS): $5K
- Total: ~$73K/month

**Personnel (Monthly):**
- Team lead (1): $15K
- Backend engineers (3): $45K
- Mobile engineers (1): $15K
- QA (1): $10K
- Total: ~$85K/month

**Optimization Ideas:**
- Compress old message archives (reduce storage 60%)
- Cache member lists locally (reduce DB load 40%)
- Batch location updates (reduce network traffic 30%)

---

## 13. Agent Monitor Team

**5 Agents:**

1. **Quality Agent:** Code, tests, message delivery latency
   - Alert: Group load time p95 >1s
   - Alert: Message delivery failure >0.1%
   - Alert: Test coverage <80%

2. **Research Agent:** User satisfaction, message search quality, member retention
   - Alert: Group discovery click-through rate <20%
   - Alert: Message search recall <90%
   - Alert: Member retention after 30 days <70%

3. **Business Agent:** Group growth, resource pooling adoption, user engagement
   - Alert: Cost per active group >$100
   - Alert: Resource request fulfillment rate <50%
   - Alert: Message activity trend declining

4. **Compliance Agent:** Privacy, security, content moderation
   - Alert: Unauthorized member access detected
   - Alert: Offensive content not moderated <24h
   - Alert: PII leaked in messages

5. **Lead Agent:** Orchestrates other 4, escalates patterns
   - Escalates: Safety incident in group (violence, harassment)
   - Escalates: Privacy breach suspected
   - Escalates: 3+ agents alert simultaneously

**Reporting:** Each agent reports to module owner + domain head.

---

## 14. Validation Practices

**Accuracy Targets:**
- Group membership list: 100% correctness
- Evacuation status display: 100% accuracy (member state sync)
- Resource availability: 95% correctness (self-reported)
- Convoy routing: 90% passable

**Loss Weighting:**
- Member missing in evacuation: 1000x cost
- Wrong convoy assignment: 100x cost
- Resource unavailable when claimed: 10x cost

**A/B Testing:**
- Group discovery algorithm: measure join rate
- Convoy suggestion: measure adoption, satisfaction
- Resource pooling incentives: measure participation

**Drift Detection:**
- Member retention rates: weekly cohort analysis
- Message volume per group: detect declining engagement
- Resource fulfillment success: detect scams/unreliability

**Validation Data:** Post-event surveys (member evacuation success), historical group data, user feedback.

---

## 15. Data Science Considerations

**Model Selection:** Group discovery uses geohash bucketing + relevance ranking. Trusted neighbor matching uses behavioral similarity + vetting history. Member retention uses cohort analysis.

**Training Data:**
- Group discovery: 50K historical groups, user join patterns
- Trusted neighbor: 10K vetting histories, background check results
- Retention: 100K user group memberships, tenure data

**Retraining Schedule:** Group discovery monthly (seasonal patterns). Trusted neighbor quarterly. Retention analysis monthly.

**Benchmarks:** Group discovery baseline 60% click-through, target 70%. Trusted neighbor baseline 50% vetting acceptance, target 75%.

**Failure Cases:** Geographic ambiguity (neighborhood boundaries unclear), trusted neighbor mismatch (personality conflict), convoy oversubscription.

**Explainability:** Show why group suggested ("8 of your contacts in this neighborhood group"). Show why neighbor recommended ("Similar age, adjacent neighborhood, verified background").

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Backend: Node.js/Express, PostgreSQL + PostGIS
- Mobile: React Native
- Search: Elasticsearch
- Messaging: NATS
- Cache: Redis

**External Dependencies:**
- elasticsearch ^8.0
- express ^4.18
- Security scanning: npm audit, dependabot

**CI/CD Pipeline:**
- Lint: ESLint, Prettier
- Tests: Jest (unit), Postgres integration tests
- Security: OWASP dependency check
- Performance: Load test 1000 concurrent groups
- Deployment: Docker, K8s canary rollout

**Technical Debt:**
- Refactor message search indexing (high CPU on large groups)
- Decouple member list from group detail (latency issue)
- Add comprehensive message encryption documentation

**SLA & Runbooks:**
- Availability: 99.5%
- Message delivery: p99 <2s
- Group load: p95 <500ms
- Oncall runbook: Check K8s pod status, review Elasticsearch health

**Scalability:** Target 1M groups, 50K concurrent convoys during major event. Bottleneck: message search on large archives. Mitigation: archive old messages, shard by date.

---

## Notes

- Group type defaults strongly influence member expectations (family = privacy, community = openness)
- Convoy assignment critical for evacuation success; prioritize correctness over speed
- Message moderation challenge for end-to-end encrypted groups; consider key escrow for legal requests
- Trusted neighbor vetting is high-stakes; background checks non-negotiable
- Group size scaling: 100s of members easy, 1000s need special UI/performance tuning
