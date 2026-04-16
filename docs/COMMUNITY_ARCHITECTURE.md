# Community Module Architecture

## Product Pages (5 tabs in public app / 5 subtabs in Product Management)

| Tab | Public App | Admin Product Management |
|-----|-----------|--------------------------|
| Map | Live map with layers | Map feature config, layer toggles |
| Community | Profile, contacts, groups, chat | Community feature development |
| Alerts | Official + user alerts | Alert rules, templates, escalation |
| Help | PHP, resources, task streams | Help system config, moderation |
| Settings | App preferences, privacy, legal | Default settings, legal releases |

---

## Community Page Hierarchy

### 1. USER PROFILE & ACCOUNT
```
community/profile/
├── registration/        # Account creation, forgot password, email verify
├── basic-info/          # Name, photo, phone number
├── household/           # Disabilities, elderly, children, pets, household size
├── vehicles/            # Vehicle manager (make/model/year → dimensions DB lookup)
├── equipment-skills/    # Tractors, plows, boats, certs (retired EMS/fire/police)
├── sensors/             # Barometric sharing, location triggers, mesh settings
├── privacy/             # Location sharing granularity, legal releases, toggles
├── id-verification/     # Face + ID photo, address match, background check
└── history/             # Action/event history timeline
```

#### Data Flows - Profile
```
SIGNALS IN:
  - User form input (registration, profile fields)
  - Phone contacts API (for contact import)
  - Device sensors (barometric, GPS, accelerometer)
  - Camera (ID photo, face photo)
  - Vehicle DB API (make/model → dimensions lookup)
  - Background check API (sex offender registry)

TRANSFORMS:
  - Vehicle spec enrichment (user selects make/model → auto-fill dimensions, clearance, 4WD, seats)
  - ID verification pipeline (face match + address match + background check → trust score)
  - Sensor consent aggregation (per-sensor toggles → permission bitmap)
  - Location granularity resolver (user setting + context → sharing level)

SIGNALS OUT:
  - User profile record → PostgreSQL users table
  - Vehicle records → vehicles table (linked to user + household)
  - Verification status → id_verifications table
  - Sensor permissions → sensor_consents table
  - Location sharing config → location_settings table
  - Event history → user_events table (append-only log)
```

### 2. CONTACTS
```
community/contacts/
├── emergency/           # Next of kin (ordered list, near + far locations)
├── phone-import/        # Import phone contacts, find Beacon users
├── trusted-neighbors/   # Trusted neighbor requests, building-level matching
└── manage/              # Contact list CRUD, invite non-users
```

#### Data Flows - Contacts
```
SIGNALS IN:
  - Phone contacts API (names, numbers)
  - User search (by phone number → find Beacon users)
  - Trusted neighbor requests (from other users)
  - Emergency contact acceptance (invited contacts confirm)

TRANSFORMS:
  - Phone number normalization (E.164 format)
  - Contact matching (phone → user_id lookup, fuzzy name match)
  - Emergency contact ordering (user-defined priority + distance calculation)
  - Trust score aggregation (ID verified + no flags + accepted by contact)

SIGNALS OUT:
  - emergency_contacts table (user_id, contact_user_id, priority, relationship, location)
  - trusted_neighbors table (user_id, neighbor_id, status, building_id)
  - contact_invites table (inviter_id, phone, status, invite_code)
```

### 3. GROUPS
```
community/groups/
├── discover/            # Suggested groups (by location, household, skills)
├── create/              # Create new group (type, boundaries, name, policies)
├── types/               # 4 types: neighborhood, parent-community, burn-together, convoy
├── membership/          # Join, invite codes, requests, followers vs members
├── roles/               # Founder, admin, moderator, member, follower permissions
├── settings/            # Privacy, channels, policies, event protocols
└── analytics/           # Member count, activity, message volume
```

#### Data Flows - Groups
```
SIGNALS IN:
  - User home location + saved locations → nearby group discovery
  - Household data (children → school groups, skills → specialty groups)
  - Census tract / fire district boundaries → neighborhood group suggestions
  - School enrollment data → parent-community auto-creation
  - Evacuation system → convoy group auto-generation
  - Invite codes (12-char alphanumeric, 30-day expiry, single-use)

TRANSFORMS:
  - Group suggestion ranking: score = (1/distance) × (1/area_covered) × relevance_weight
    Neighborhoods > cities (smaller area = higher priority)
  - Membership state machine: invited → pending → member (or follower)
  - Role hierarchy: founder > admin > moderator > member > follower
  - Privacy policy resolver: per-user location mode × group default → effective sharing

SIGNALS OUT:
  - groups table (id, type, name, geometry, privacy_tier, created_by)
  - group_members table (group_id, user_id, role, location_share_mode, joined_at)
  - group_invites table (group_id, code, created_by, expires_at, used_by)
  - group_channels table (group_id, name, type, permissions)
  - group_policies table (group_id, key, value)
```

#### Group Types Detail
```
NEIGHBORHOOD:        50-500 households, discovery-based, census/fire boundaries
                     Discoverable at 10+ members. Founder = default admin.

PARENT-COMMUNITY:    School-linked, auto-discovered via enrollment
                     Principal = admin. Email domain verification.

BURN-TOGETHER:       Algorithmic: 5mi radius, fuel type, wind corridor, insurance tier
                     Fire chief = coordinator. 180-day expiry.

EVACUATION CONVOY:   Auto-generated during events. Time-limited, read-only.
                     Driver/passenger roles. Vehicle capacity tracked.
```

#### Roles & Permissions Matrix
```
                    FOUNDER  ADMIN  MOD    MEMBER  FOLLOWER
Create group        ✓
Delete group        ✓
Transfer founder    ✓
Appoint admin       ✓        ✓
Set policies        ✓        ✓
Schedule broadcasts ✓        ✓
Remove members      ✓        ✓      ✓
Pin announcements   ✓        ✓      ✓
Create channels     ✓        ✓      ✓
View mod queue      ✓        ✓      ✓
Send messages       ✓        ✓      ✓      ✓
Join convoys        ✓        ✓      ✓      ✓
Update own location ✓        ✓      ✓      ✓
View directory      ✓        ✓      ✓      ✓       ✓
View broadcasts     ✓        ✓      ✓      ✓       ✓
Leave group         ✓        ✓      ✓      ✓       ✓
```

### 4. CHAT & MESSAGING
```
community/chat/
├── group-channels/      # Per-group: emergency, weather, evacuation, resources
├── direct-messages/     # 1:1 encrypted messaging
├── status-updates/      # User status history (safe, sheltering, evacuating, etc.)
├── templates/           # Pre-composed messages (heavy compression for mesh)
└── mesh-sync/           # Offline message queue, conflict resolution
```

#### Data Flows - Chat
```
SIGNALS IN:
  - User typed messages
  - Pre-composed template selections
  - Status update buttons (safe, sheltering, evacuating, needs help)
  - Mesh relay packets (offline sync)
  - Group event mode triggers (auto-channels during emergencies)

TRANSFORMS:
  - Message encryption (group public key → ciphertext, only group members decrypt)
  - Mesh compression (standardized messages → 2-byte codes, custom → delta-encoded)
  - Conflict resolution (offline sync: timestamp + deterministic ordering)
  - Status aggregation (per-group member status rollup for admins)

SIGNALS OUT:
  - messages table (group_id, channel_id, author_id, text, timestamp, encrypted_blob)
  - user_status table (user_id, status, timestamp, group_context)
  - message_templates table (hazard_type, template_key, compressed_code)
  - mesh_queue table (message_id, relay_status, hops, delivered_at)
```

---

## Database Schema (Community tables)

```sql
-- Core user profile
users (id, email, phone, name, photo_url, created_at, verified_at)
user_profiles (user_id, disabilities, elderly, children_count, pet_count, pet_types, skills[])
user_settings (user_id, key, value)

-- Vehicles & equipment
vehicles (id, user_id, make, model, year, length_cm, width_cm, height_cm, clearance_cm, seats, four_wd, snow_tires, type)
equipment (id, user_id, type, description, available)

-- Sensors & location
sensor_consents (user_id, sensor_type, enabled, legal_release_id, granted_at)
location_settings (user_id, default_mode, default_granularity, mesh_relay_enabled)
location_events (user_id, timestamp, lat, lng, accuracy, granularity, context_type, encrypted_blob)

-- ID verification
id_verifications (user_id, face_photo_url, id_photo_url, address_match, background_check_status, verified_at)

-- Contacts
emergency_contacts (id, user_id, contact_user_id, priority, relationship, location_lat, location_lng, location_label)
trusted_neighbors (id, user_id, neighbor_id, building_id, status, requested_at, accepted_at)
contact_invites (id, inviter_id, phone, invite_code, status, created_at, expires_at)

-- Groups
groups (id, type, name, description, geometry, privacy_tier, created_by, created_at, status)
group_members (id, group_id, user_id, role, location_share_mode, joined_at, last_active)
group_invites (id, group_id, code, created_by, expires_at, used_by, used_at)
group_channels (id, group_id, name, type, created_by)
group_policies (id, group_id, key, value)

-- Messaging
messages (id, group_id, channel_id, author_id, text, timestamp, encrypted_blob, template_key)
direct_messages (id, sender_id, recipient_id, text, timestamp, encrypted_blob)
user_status (id, user_id, status, timestamp, group_id, expires_at)
message_templates (id, hazard_type, key, text, compressed_code)

-- Event history
user_events (id, user_id, event_type, details, timestamp)
audit_log (id, accessor_id, user_id, action, context, timestamp)
```

---

## UI Components Required

### Profile Section
- RegistrationForm (email, password, forgot-password flow)
- BasicInfoForm (name, photo upload, phone)
- HouseholdForm (disabilities checkboxes, pet types, children count, elderly toggle)
- VehicleManager (add/edit vehicles, make/model autocomplete → spec lookup)
- EquipmentSkillsForm (checkboxes + free text, certification uploads)
- SensorSettingsPanel (per-sensor toggles with explanations)
- PrivacySettingsPanel (location mode selector, granularity per context, legal release modals)
- IdVerificationFlow (camera capture → face + ID → address match → status display)
- EventHistoryTimeline (scrollable log of user actions/events)

### Contacts Section
- EmergencyContactList (ordered, drag-to-reorder, add near + far)
- PhoneContactImporter (permission request → scan → match → invite)
- TrustedNeighborPanel (request/accept flow, building-level matching)
- ContactManager (search, filter, CRUD, invite status)

### Groups Section
- GroupDiscovery (ranked suggestions, join buttons)
- GroupCreator (type selector, boundary drawing, name, policies)
- GroupCard (summary: name, type, member count, role, last activity)
- MembershipManager (invite code generator, join requests, member list)
- RoleManager (assign/revoke roles, permissions display)
- GroupSettingsPanel (privacy, channels, event protocols)
- GroupAnalytics (member count chart, activity heatmap, message volume)

### Chat Section
- ChannelList (per-group channels, unread badges)
- MessageThread (encrypted messages, timestamps, sender info)
- StatusBar (current status display + update buttons)
- TemplateSelector (pre-composed messages, mesh-optimized)
- MeshSyncIndicator (online/offline status, queue depth)
