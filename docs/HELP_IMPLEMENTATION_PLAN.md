# Help Module - Full Implementation Plan

## Overview

The Help page is Beacon's mutual-aid engine. Users request help, offer help, track ongoing requests, heart good deeds, reconnect missing people/animals, and build a public library of stories about neighbors helping neighbors. This plan covers the full feature buildout to production depth with 7 spec waves and 45+ tasks.

## Core Design Principles

1. **No shaming.** Users who swipe away a help request are never exposed. The requester never knows who declined. This is critical for adoption.
2. **Safety-first mutual aid.** Location recording begins the moment someone accepts a help request. Both parties' locations are logged until resolution. This protects everyone.
3. **Verified vs Trusted distinction.** Trusted neighbor = someone you chose in advance (pre-emergency relationship). Verified neighbor = any Beacon-verified user near you (ID-verified, adds legitimacy to geofenced requests).
4. **Encouragement over obligation.** The main feed shows people stepping up. Hearts on stories. Public library of heartwarming moments. The goal is to inspire participation.

## Dependencies on Community Module

The Help module depends on several Community foundations:
- **Identity (Waves A-B):** User accounts, verified badge, ID verification
- **Legal (Wave C):** Consent for location recording during help, liability releases
- **Messaging (Wave D):** DM between helper and requester, group threads for regional requests
- **Contacts (Wave F):** Trusted neighbor system, emergency contacts
- **Equipment/Skills (Wave H):** Resource matching for capability-based help routing
- **Location Sharing (F-06):** Granularity controls, emergency auto-share

---

## PRIORITY 1: Help Request Core

### Wave HA: Help Request Lifecycle

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HA-01 Help Request Creation | Two entry points: (1) tag on map page (long-press location, describe need), (2) help page form (category, description, urgency, location radius). Categories: welfare check, supply run, transport, medical assist, pet care, shelter, debris/damage, utility, other. | Max active requests per user? Character limit on description? Photo attachment? |
| HA-02 Help Request Data Model | `help_requests` table: id, requester_id, category, title, description, urgency (low/med/high/critical), status (open/claimed/ongoing/resolved/expired/cancelled), location (point), radius_m, created_at, claimed_at, resolved_at, expires_at. Soft expiry after 72h for non-critical. | Auto-expire policy. Escalation for unclaimed critical requests. |
| HA-03 Request Status Machine | State transitions: open > claimed > ongoing > resolved. Also: open > expired, open > cancelled, claimed > cancelled (helper backs out, returns to open). Only requester can mark resolved. Helper can mark "completed on my end" which prompts requester to confirm. | What if requester goes offline before resolving? Auto-resolve after X days? |
| HA-04 Request Claiming | Helper taps "I can help" on a request. Requester gets notified. If multiple helpers, first-claim wins for 1:1 requests. For regional requests (e.g., "check on my grandma"), single-claim. For open requests (e.g., "anyone have a generator"), multiple helpers can respond. | Claim timeout: if helper doesn't follow through in 2h, release claim? |
| HA-05 Location Recording on Accept | The moment a helper accepts a request, both user locations are recorded continuously (every 60s) until resolution. Stored in `help_location_log`: help_request_id, user_id, lat, lon, timestamp. Consent prompt before first accept. | Frequency of location logging. Storage retention. Privacy: who can see the log? Only the two parties + admins? |
| HA-06 Help Request Expiry & Cleanup | Non-critical requests expire after 72h. Critical requests never auto-expire but get escalated (notification to nearby admins/moderators). Expired requests archived, not deleted. | Escalation chain for unclaimed critical requests. |

### Wave HB: Help Routing & Notifications

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HB-01 Geofence Proximity Module | Dynamic "nearby" radius based on: population density, Beacon user density, and request urgency. Dense urban: 0.5-2km. Suburban: 2-10km. Rural: 10-50km. Emergency multiplier (2x radius for critical). Configurable per-region. | Data source for population density (Census API). How to compute Beacon user density efficiently (geohash grid). |
| HB-02 Capability-Based Routing | Match request category to helper capabilities. "Transport needed" routes to users with vehicles. "Medical assist" routes to users with medical skills. "Generator available?" routes to equipment registry matches. Falls back to all verified users if no capability match. | Integration with community.equipment.resource-matching. Opt-in vs opt-out for capability routing. |
| HB-03 Opt-In Geofenced Notifications | Users set in settings: "Open to nearby help requests during emergencies" (toggle). When enabled, nearby requests generate push notification. User can swipe away (requester never knows). Notification includes: category, distance, brief description. | Notification frequency cap (max 5/hour during events?). DND override for critical requests? |
| HB-04 Non-Emergency Routing | For non-emergency help requests (e.g., "can someone feed my cat while I'm traveling"), route to: (1) trusted neighbors first, (2) verified neighbors within radius, (3) general nearby users. Staggered notification: trusted first, wait 30min, then verified, wait 1h, then general. | Stagger timing. Should non-emergency requests be visible on the public feed? |
| HB-05 Swipe-Away Privacy | When a user swipes away a notification, it's recorded locally only (for notification frequency tuning). The requester's view never shows who was notified and who declined. Only shows: "X people notified" and "1 person responded." | Store swipe-away analytics aggregated only, never per-user. |

---

## PRIORITY 2: Social & Public Feed

### Wave HC: Help Feed & Rankings

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HC-01 Main Help Feed | Default view: ongoing help requests near you sorted by recency. Tabs: Open (needs help), Ongoing (in progress), Resolved (completed). Filter by: category, distance, urgency. Each card shows: category badge, title, distance, time, status, helper count. | Feed refresh rate. Pagination vs infinite scroll. |
| HC-02 Feed Ranking Algorithm | Sortable by: recency (default), urgency, distance, status. "Trending" = most hearts on resolved stories. Weighting: critical requests always surface above non-critical regardless of sort. | Algorithm weights. How to handle gaming/manipulation. |
| HC-03 Heart System | Users can heart resolved help stories. Heart count shown on story card. Hearting is anonymous (no public "liked by" list). Used for trending sort and story library ranking. One heart per user per story. | Unheart? Show total count or threshold ("many people loved this")? |
| HC-04 Prayer Requests | Dedicated category: "Asking for prayers/good thoughts." No helper needed. Shows on feed with distinct styling. Users can heart. No location sharing, no claiming, no resolution tracking. Soft expire after 7 days. | Moderation for prayer requests. Report/flag system. |
| HC-05 Feed Moderation | Report button on any request or story. Flagged items go to community moderators (group admins in area). Auto-hide after X reports. Requester notified and can appeal. | Threshold for auto-hide. Moderator queue in beacon-dev. |

### Wave HD: Stories & Public Library

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HD-01 Story Nomination | After a regional help request is resolved, any involved party can nominate it to the public stories library. Nomination includes: brief narrative (written by nominator), helper names (with consent), category tags. | Consent flow: all named users must approve before story goes public. |
| HD-02 Story Page | Public story card: title, narrative, category tags, location (neighborhood-level only, never exact), date, heart count, participants (first name + last initial). Photo optional (uploaded by participants). | Max narrative length. Photo moderation. |
| HD-03 Story Library | Browsable collection of all public stories. Sort by: most hearts, recency, category, location. Search by keyword. Regional filtering (my neighborhood, my city, all). | Public vs app-only access. SEO considerations if web-accessible. |
| HD-04 Story Takedown | Any participant can request a story be taken offline at any time. Immediate removal, no appeal needed. Soft delete (data retained for safety records but hidden from public). | Notification to other participants. Grace period or instant? |
| HD-05 Story Moderation | Same moderation pipeline as feed. Community moderators review flagged stories. Auto-hide after threshold. | Share moderation queue with feed moderation. |

---

## PRIORITY 3: Missing People & Animals

### Wave HE: Reconnection System

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HE-01 Missing Person Report | Form: name, photo, last known location, physical description, medical needs, contact info for finder. Status: missing, found-safe, found-injured, deceased. Verified users only can post. | Integration with official missing person databases (NamUs, NCIC)? Or Beacon-only for now? |
| HE-02 Missing Animal Report | Form: species, breed, name, photo, last known location, collar/microchip info, medical needs. Status: missing, found, reunited. | Photo required? Multiple photos? |
| HE-03 Found Reports | "I found someone/an animal" form that cross-references against active missing reports by location proximity and description match. Notification to original reporter. | Matching algorithm: location radius + keyword similarity. Confidence threshold for auto-match. |
| HE-04 Reconnection Feed | Dedicated section within help page: Missing tab. Shows active missing reports sorted by recency and proximity. Resolved reports (reunited) move to stories library automatically. | Separate tab or integrated into main feed with filter? |
| HE-05 Reconnection Privacy | Missing person reports visible to verified users only. Found reports trigger DM to original reporter (not public). Contact exchange only through Beacon messaging. No phone numbers shared publicly. | What data is visible publicly vs to verified users only. |

---

## PRIORITY 4: Verified Neighbor System

### Wave HF: Neighbor Verification for Help

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HF-01 Verified Neighbor Badge | Distinct from trusted neighbor. Verified neighbor = any Beacon user with completed ID verification who is within the geofenced area. Badge shows on help request responses. Not a relationship (no adding needed). | Visual distinction from trusted neighbor badge. |
| HF-02 Trusted Neighbor Geofence Request | User can broadcast to a radius: "Looking for trusted neighbors in [area]." Nearby users get notification to opt-in. Establishes mutual trusted-neighbor relationship. Designed for pre-emergency meetups ("meet in the lobby"). | Max radius for trusted neighbor request. Expiry on the broadcast? |
| HF-03 Pre-Emergency Meetup Coordination | When a user sends a trusted-neighbor request with a meetup component, it creates a temporary group with location and time. After meetup, both parties confirm and trusted-neighbor relationship is established. | Integration with groups module. Temporary group auto-delete after confirmation. |
| HF-04 Legitimacy Scoring for Geofenced Requests | When someone sends a geofenced help request ("check on my grandma at 123 Oak St"), verified-neighbor responses get priority in the queue. Requester sees "Verified Neighbor" badge on responders. Adds trust without requiring pre-existing relationship. | How to weight verified vs unverified responses. |

---

## PRIORITY 5: Analytics & Admin

### Wave HG: Help Manager (beacon-dev)

| Task | What to build | Key decisions |
|------|--------------|---------------|
| HG-01 Help Dashboard | beacon-dev page: total requests (open/ongoing/resolved), response time metrics, category breakdown, geographic heatmap of requests. | Refresh rate. Historical vs real-time. |
| HG-02 Moderation Queue | Flagged requests and stories queue. Moderator actions: dismiss flag, hide content, warn user, ban user. Audit log of all moderation actions. | Moderator roles: who gets access. |
| HG-03 Story Library Admin | Manage public stories: feature/unfeature, review takedown requests, edit content (typos etc.), manage nominations queue. | Editorial control vs hands-off. |
| HG-04 Missing Persons Admin | Dashboard of active missing reports. Escalation tools: promote to wider radius, link to official databases, contact authorities. | Integration with law enforcement systems. |
| HG-05 Help Analytics | Metrics: avg response time, help completion rate, helper retention, geographic coverage gaps, capability gaps (requests with no matched helpers). Export to CSV. | Which metrics matter most for product decisions. |

---

## Execution Order

**Phase 1 (Foundation):** Depends on Community Phases 2-3 being complete (identity, legal, messaging, contacts).

**Phase 2 (Core):** Waves HA + HB (request lifecycle + routing). These are the foundation of the help system.

**Phase 3 (Social):** Waves HC + HD (feed, hearts, stories). Can run in parallel since feed and stories are independent UI concerns.

**Phase 4 (Reconnection):** Wave HE (missing people/animals). Independent of social features.

**Phase 5 (Neighbor Verification):** Wave HF. Extends trusted-neighbor from community module.

**Phase 6 (Admin):** Wave HG (beacon-dev dashboard, moderation, analytics). Can begin in Phase 3 for moderation queue.

---

## Cross-Module Data Flows

### Help -> Community
- Help request creation reads user's verified badge status (identity)
- Helper matching queries equipment/skills/vehicles registries (equipment)
- DM between helper and requester uses messaging backend (messages)
- Location recording uses location sharing infrastructure (contacts.location-sharing)
- Trusted neighbor requests extend community.contacts.trusted-neighbors

### Help -> Map
- Help requests can be tagged on the map (map page interaction)
- Help request locations shown as map layer during events
- Missing person last-known-location plotted on map

### Help -> Alerts
- Critical unclaimed help requests escalate to alert system
- Missing person reports can generate area alerts

### Community -> Help
- ID verification status determines who can post missing reports
- Consent manager tracks help-specific consents (location recording)
- Data deletion cascade must handle help history, stories, location logs
