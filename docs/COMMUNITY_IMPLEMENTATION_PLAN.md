# Community Module - Full Implementation Plan

## Overview

This plan covers: (1) the full community feature buildout to production depth, (2) the CONFolder builder system, and (3) spec waves for all previously missing backend features. Organized by priority.

---

## PRIORITY 1: Identity, Trust & Legal Foundation

These must exist before any community interaction is safe to ship.

### Wave A: Account Creation & Core Identity

| Task | What to build | Key decisions |
|------|--------------|---------------|
| A-01 Account Creation Flow | Multi-step onboarding: email/phone, name, photo, terms acceptance. Store in `users` table. E.164 phone format, optional email. | Which auth provider? NextAuth + custom? Magic link vs password? |
| A-02 Account Management | Edit name, email, phone, photo. Deactivate account. Reactivation window (30 days). | Soft delete cascade: what happens to messages, group memberships, contacts? |
| A-03 Session & Auth | JWT or session tokens. Refresh flow. Device fingerprinting for security. | Token expiry policy. Max concurrent sessions. |

### Wave B: ID Verification

| Task | What to build | Key decisions |
|------|--------------|---------------|
| B-01 Selfie Capture | Camera access, photo capture, liveness detection (blink/turn). Store encrypted. | On-device liveness (MediaPipe) vs cloud (AWS Rekognition)? |
| B-02 ID Document Scan | Upload or camera capture of government ID. OCR extraction of name/address/DOB. | Vendor: Onfido, Jumio, Veriff, or AWS Textract + custom? Budget constraint. |
| B-03 Face Match | Compare selfie to ID photo. Confidence threshold (e.g., >95%). | Cloud API (Rekognition CompareFaces) vs on-device (TFLite face embedding). Privacy tradeoff. |
| B-04 Address Validation | User-entered address checked against ID address and USPS API. Geocode to lat/lon for neighborhood matching. | USPS Address Validation API (free) + Google Geocoding. |
| B-05 Background Check | Sex offender registry check. Possibly criminal background. | API: Checkr, GoodHire, or direct NSOPW API? Cost per check. Frequency of re-check. |
| B-06 Verified Badge Logic | Combine results: selfie + ID + address + background = verified. Partial verification levels. Badge display rules. | What constitutes "verified" vs "partially verified"? Grace period for incomplete? |
| B-07 Verification Data Lifecycle | Encrypted storage. Auto-delete raw images after verification complete (keep hash only). Re-verification triggers (address change, annual). | CCPA/GDPR: right to delete verification data. Retention policy. |

### Wave C: Legal & Consent

| Task | What to build | Key decisions |
|------|--------------|---------------|
| C-01 Legal Release Framework | `legal_releases` table: id, version, type, content_hash, effective_date, deprecated_date. Versioned documents. | How to handle version changes: re-consent required? Silent update for non-material changes? |
| C-02 Consent Manager | Per-feature consent tracking. `user_consents` table: user_id, release_id, granted_at, revoked_at, method (tap, scroll, e-sign). | Which features require consent? Sensor data, location sharing, mesh relay, EMS access. |
| C-03 Terms of Service | TOS document. Acceptance required at signup. Version tracking. | Legal review needed before launch. |
| C-04 Privacy Policy | Privacy policy document. Link from settings. Version tracking. | Must cover: data collection, sharing with EMS, mesh relay, sensor data. |
| C-05 Data Deletion Flow | User requests deletion. 30-day grace period. Cascade: anonymize messages (replace author with "Deleted User"), remove from groups, delete contacts, purge verification data, delete location history. Export-my-data (JSON download) before deletion. | CCPA right-to-delete. GDPR Article 17. What data is retained for safety (e.g., hazard reports)? |
| C-06 Sensor Consent Toggles | Per-sensor consent: accelerometer, barometer, microphone, camera, GPS, Bluetooth. Each requires legal release acknowledgment. Audit log. | Granular vs grouped consent. Can EMS override during active event? |
| C-07 Emergency Legal Override | During declared emergencies, certain data sharing may be legally required or permitted. Document which data, under what authority, with what audit trail. | Work with legal counsel. FEMA/ICS interoperability requirements. |

---

## PRIORITY 2: Communication Infrastructure

### Wave D: Messaging Backend

| Task | What to build | Key decisions |
|------|--------------|---------------|
| D-01 Message Data Model | `messages` table with: id, thread_id, author_id, text, encrypted_blob, timestamp, reply_to_id, edited_at, deleted_at. `reactions` table: message_id, user_id, emoji, created_at. | Soft delete messages (show "deleted" placeholder) vs hard delete? |
| D-02 Thread Model | `threads` table: id, type (group/dm/request), name, created_at, last_message_at. `thread_members`: thread_id, user_id, role, joined_at, muted_until, last_read_at. | DM threads: auto-create on first message? |
| D-03 Request Mailbox | Non-contact DMs route to separate inbox. Spam scoring. Accept/reject/block actions. Accepting promotes to contact. | Rate limit on request messages (prevent spam). Block = permanent or reversible? |
| D-04 End-to-End Encryption | Signal Protocol adaptation: per-thread key pairs. Key exchange on thread creation. Key rotation on member change. Encrypted blob storage (server never sees plaintext). | Signal Protocol (libsignal) vs custom AES-256-GCM. Group key management: Sender Keys vs pairwise? |
| D-05 Message Templates | Pre-built status messages: "I'm safe", "Need help", "Evacuating", "Sheltering". 2-byte compressed codes for mesh efficiency. Custom templates per group. | Template taxonomy. Which templates trigger system actions (e.g., "Need help" creates a help request)? |
| D-06 Reactions | Reaction set: OK, !, ?, +1, thumbs-down. Per-message, per-user. Real-time sync. | Fixed set vs custom emoji? Reactions on encrypted messages: metadata or encrypted? |
| D-07 Reply Threading | Reply-to-message with quoted reference. Inline thread view (not separate thread). | How deep can replies nest? 1 level (flat) vs unlimited? |
| D-08 Read Receipts | Per-user last_read_at per thread. Unread counts. Optional per-message read receipt (privacy setting). | Privacy: can users opt out of read receipts? |
| D-09 Message Search | Full-text search across threads. Filter by author, date, type. | Search on encrypted messages: impossible without client-side search index. Build local search index? |
| D-10 Notification Routing | Route notifications by: contact message, group message, request message, system alert. Per-category mute, per-thread mute, DND schedule. | Push notification service: FCM + APNS. Fallback: SMS for critical alerts? |

### Wave E: Mesh Networking

| Task | What to build | Key decisions |
|------|--------------|---------------|
| E-01 Mesh Protocol Design | Peer discovery (Bluetooth LE + WiFi Direct). Relay topology (flooding vs structured). Packet format. Priority tiers (emergency > status > chat). | BLE range ~100m. WiFi Direct ~200m. LoRa would extend to 2km+ but requires hardware. Phase 1: BLE+WiFi only. |
| E-02 Offline Message Queue | Local SQLite queue. Store-and-forward on reconnection. Deduplication by message hash. Ordering by timestamp + sender_id. | Max queue size. TTL for queued messages. Conflict resolution on sync. |
| E-03 Mesh Relay Logic | Each device relays messages for nearby devices. Hop limit (max 5). Seen-message cache to prevent loops. Battery-aware relay (reduce relay when <20%). | Relay consent: opt-in or opt-out? Battery threshold configurable? |
| E-04 Mesh Compression | Template compression (2-byte codes). Field compression for status updates. Binary protocol for mesh packets. | Compression ratio target: 80%+ vs plaintext. |
| E-05 Mesh Security | Encrypted relay (relay nodes cannot read content). Authentication of mesh peers (only verified Beacon users relay). Mesh packet signing. | How to authenticate peers without internet? Pre-cached verification certificates? |
| E-06 Online/Offline Transition | Detect connectivity loss. Switch to mesh mode. Queue outgoing messages. On reconnection: sync queue, resolve conflicts, update read receipts. | Grace period before mesh mode (5 seconds connectivity loss?). |

---

## PRIORITY 3: Community Features (Full Depth)

### Wave F: Contacts & Household

| Task | What to build | Key decisions |
|------|--------------|---------------|
| F-01 Emergency Contact Manager | Priority-ordered contact list (1-5). Per-contact: name, phone, email, relationship, Beacon user link (if on platform). Auto-notify on status change. | What if contact isn't on Beacon? SMS fallback? |
| F-02 Trusted Neighbors | Discovery: show nearby verified users. Request/accept trust relationship. Trust levels: recognized, trusted, emergency-trusted. | Proximity radius for discovery. Privacy: users can hide from discovery. |
| F-03 Contact Import | Phone contacts import. Match against Beacon users by phone number (hashed lookup). Suggest connections. | Privacy: hash-based matching (no plaintext phone numbers sent to server). |
| F-04 Household Manager | Members: name, age, disabilities (mobility/visual/hearing/cognitive), medical needs, pets (type, count, size, carrier needed). Dependents who cannot self-evacuate flagged. | Age ranges vs exact ages. Medical info: minimal (relevant to evacuation) not full medical records. |
| F-05 Household Evacuation Profile | Auto-generated from household data: vehicle capacity needed, accessibility requirements, pet transport needs, estimated evacuation time. Feeds into routing engine. | How to handle multi-vehicle households. Shared evacuation with neighbors. |
| F-06 Location Sharing | 4 granularity levels: exact, neighborhood-block, neighborhood, city. Per-contact override. Context-aware: auto-share exact with EMS during declared emergency. Time-limited sharing option. | Default level. Who can see what. Location history retention (24h rolling? event-duration only?). |

### Wave G: Groups

| Task | What to build | Key decisions |
|------|--------------|---------------|
| G-01 Group Types | Neighborhood (geo-bounded auto-suggest), parent-community (city/county), burn-together (shared risk zone), evacuation convoy (temporary, event-duration), custom. | Geo-boundary source for neighborhoods. How to handle overlapping boundaries. |
| G-02 Group Creation & Settings | Name, type, description, boundary (polygon or radius), join policy (open/request/invite-only), max members. Creator becomes founder. | Max group size limits per type. |
| G-03 Role Hierarchy | Founder > Admin > Moderator > Member > Follower. Permission matrix: invite, remove, pin message, create channel, edit settings, view member list, post. | Can founder transfer ownership? Can admin promote to admin? |
| G-04 Group Suggester | Based on: home location, saved locations, school (from household children), workplace, existing contacts' groups. Ranked by relevance. | Suggestion algorithm. How to handle privacy (don't reveal that a specific contact is in a group). |
| G-05 Invite Codes | 6-character alphanumeric codes. Expiry (24h default, configurable). Single-use or multi-use. QR code generation. Deep link. | Code collision avoidance. Rate limit on code generation. |
| G-06 Group Channels | Per-group channels: #general (default), #emergency (pinned), custom. Channel-level mute. | Max channels per group. Who can create channels. |
| G-07 Group-Level Aggregation | Aggregate member statuses into group health dashboard: X safe, Y sheltering, Z need help, W unknown. Active alerts affecting group boundary. | Real-time vs polling. How often to recalculate. |

### Wave H: Equipment, Skills & Vehicles

| Task | What to build | Key decisions |
|------|--------------|---------------|
| H-01 Equipment Registry | Checkboxes + free text: generator (wattage, fuel type), chainsaw, boat (type, capacity), pump, plow, tractor, medical kit, ham radio, satellite phone. Availability toggle (available now / not available). | How to match equipment to requests. Radius for equipment sharing. |
| H-02 Skills Registry | Professional: retired EMS, retired fire, retired police, nurse, doctor, EMT, search-and-rescue trained. Practical: CPR certified, swift water rescue, ham radio licensed, CDL. Verification level (self-reported, credential uploaded, verified). | Skill verification workflow. Liability for self-reported skills. |
| H-03 Vehicle Manager | Make, model, year (auto-fill specs from vehicle DB). Manual override: length, width, height, clearance, seats, 4WD, snow tires, tow hitch, roof rack. Vehicle type: sedan, SUV, truck, van, motorcycle, RV, boat trailer. | Vehicle spec database: NHTSA API or static dataset? Multi-vehicle support. |
| H-04 Resource Matching | When help request comes in, match against nearby available equipment/skills/vehicles. Rank by: distance, relevance, verification level. | Matching algorithm. Notification to matched users. Opt-in to matching. |

---

## PRIORITY 4: History, Helping & Post-Event

### Wave I: Account History & Helping

| Task | What to build | Key decisions |
|------|--------------|---------------|
| I-01 Event History | Per-user record of every hazard event they were involved in: event type, duration, their status changes, actions taken. | Retention period. Privacy: who can see your event history. |
| I-02 Helping History | Record of: help offered (what, when, to whom, outcome), help received (what, when, from whom). Reputation score derived from history. | How to prevent gaming reputation. Verification of help completion. |
| I-03 Usage & Battery Log | App usage patterns, battery impact tracking, data consumption. Helps optimize for low-power situations. | Aggregated only, no individual tracking beyond the user's own device. |
| I-04 Location Audit | Log of every location share event: who saw your location, when, at what granularity. User can review and revoke retroactively. | Audit log retention. How retroactive revocation works (can't unsee, but can block future). |
| I-05 Action Log | System actions taken on behalf of user: auto-status updates, emergency location shares, mesh relay participation. Full transparency. | How to present this without overwhelming. Filterable by type. |

---

## PRIORITY 5: CONFolder Builder System

### Architecture

```
beacon-dev
  └── Product Manager
       └── Community
            ├── Project Manager
            │    ├── Feature Overview (kanban of all features by status)
            │    ├── CONFolders (browse/edit all CONFolders, review queue)
            │    └── Notification Manager
            └── DEV
                 ├── Module Hierarchy (tree view of all modules, each with CONFolder link)
                 ├── Standalone UI (component preview sandbox)
                 └── Dev Monitor (task tracker, gate checks)
```

### CONFolder Builder - Implementation Steps

1. **Module Registry** - Create `/beacon/docs/confolders/index.json` as the central dictionary. Each entry: `{ module_id, module_name, hierarchy_path, confolder_path, bookmark_status }`.

2. **Enumerate Community Modules** - Walk the community hierarchy and create skeleton CONFolders:
   ```
   community
   ├── messages
   │   ├── messages.thread-model
   │   ├── messages.encryption
   │   ├── messages.reactions
   │   ├── messages.reply-threading
   │   ├── messages.templates
   │   ├── messages.search
   │   ├── messages.request-mailbox
   │   ├── messages.read-receipts
   │   └── messages.notification-routing
   ├── contacts
   │   ├── contacts.emergency
   │   ├── contacts.trusted-neighbors
   │   ├── contacts.import
   │   └── contacts.location-sharing
   ├── groups
   │   ├── groups.types
   │   ├── groups.creation
   │   ├── groups.roles
   │   ├── groups.suggester
   │   ├── groups.invite-codes
   │   ├── groups.channels
   │   └── groups.aggregation
   ├── household
   │   ├── household.members
   │   └── household.evacuation-profile
   ├── identity
   │   ├── identity.account-creation
   │   ├── identity.account-management
   │   ├── identity.selfie-capture
   │   ├── identity.id-scan
   │   ├── identity.face-match
   │   ├── identity.address-validation
   │   ├── identity.background-check
   │   └── identity.verified-badge
   ├── legal
   │   ├── legal.release-framework
   │   ├── legal.consent-manager
   │   ├── legal.tos
   │   ├── legal.privacy-policy
   │   ├── legal.data-deletion
   │   ├── legal.sensor-consent
   │   └── legal.emergency-override
   ├── equipment
   │   ├── equipment.registry
   │   ├── equipment.skills
   │   ├── equipment.vehicles
   │   └── equipment.resource-matching
   ├── mesh
   │   ├── mesh.protocol
   │   ├── mesh.offline-queue
   │   ├── mesh.relay
   │   ├── mesh.compression
   │   ├── mesh.security
   │   └── mesh.online-offline
   └── history
       ├── history.events
       ├── history.helping
       ├── history.usage
       ├── history.location-audit
       └── history.action-log
   ```

3. **Populate** - For each module, fill CONFolder fields from architecture docs, task specs, and planning notes. Use bookmark system for anything requiring vendor selection or legal review.

4. **Review Queue Page** - Build page at `/product/community/project/confolders` that shows all bookmarked CONFolders sorted by priority. Filter by status (in-progress, blocked, placeholder).

5. **CONFolder Viewer** - Clicking "CONFolder" on any module in the DEV > Module Hierarchy view opens a structured card with collapsible sections for each CONFolder dimension (M, IO, DW, P, CH, L, F, S, X).

6. **Export for Training** - Script to walk all `.confolder.json` files, validate schema, and export to a single `confolders_training.jsonl` file.

### CONFolder Builder Agent Workflow

When an agent is tasked with building CONFolders:

1. Read CONFOLDER_STANDARD.md
2. Read COMMUNITY_ARCHITECTURE.md
3. Read all dev-task specs (C-01 through C-34)
4. Read module-taxonomy.md and 01_module_template.md
5. For each module in the hierarchy:
   a. Create `.confolder.json` with all fields
   b. Fill what is known from existing docs
   c. For unknown fields: set bookmark status, write return_note
   d. For NR fields: explicitly set NR with brief justification
6. Write to central index
7. Report: X complete, Y in-progress, Z blocked

---

## Execution Order

**Phase 1 (Now):** Adjust menu (done). Formalize CONFolder standard (done). Create CONFolders for community modules (next).

**Phase 2 (Claude Code windows):** Build Waves A-C (Identity, Verification, Legal). These are the foundation everything else depends on.

**Phase 3 (Parallel):** Waves D+F (Messaging backend + Contacts/Household). These can be built in parallel since they share the user model but don't depend on each other.

**Phase 4 (Parallel):** Waves G+H (Groups + Equipment). Depend on contacts being built.

**Phase 5:** Wave E (Mesh). Depends on messaging backend being complete.

**Phase 6:** Wave I (History). Depends on all other features existing to generate history data.

**Phase 7:** CONFolder builder UI in beacon-dev. Can be built any time but most useful after module hierarchy is populated.
