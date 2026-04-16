# Location Sharing Overview

## Privacy Controls

Location sharing is strictly opt-in. Users control visibility through three modes: off, group-only, emergency-only, or public. Modes applied per-location-share session, user can change at any time. Transition between modes does not retroactively change prior location history visibility.

### Off Mode

No location visible. User location not sent to server or group members. User receives location-less alerts (hazard type + general area only). Cannot join evacuation convoys (system doesn't know where to route). Cannot be located by EMS in emergency. Useful for privacy-maximizing users; tradeoff is reduced emergency coordination benefit.

### Group-Only Mode

Location visible to members of explicitly selected groups only. No public visibility. EMS cannot access location. User can toggle per-group: enable in family group, disable in neighborhood group. Location shared at granularity selected by user (exact, neighborhood-block, neighborhood, city).

Group sharing uses end-to-end encryption: user's location encrypted with group's public key, server cannot decrypt, only group members with private key can see. Server stores ciphertext only.

### EMS-Only Mode

Location shareable with EMS on emergency request. Normal operation: no location visible. If EMS calls (9-1-1 linked to Beacon, or manual EMS alert via app), system requests precise location from user. User can accept/decline. If accepted, EMS receives exact location for 30 minutes, then auto-expires. If declined, location not shared.

EMS emergency protocols (Section 12) define when EMS can request location (active structure fire, medical emergency at address, trapped vehicle, etc.). Frivolous or non-emergency requests logged; repeated abuse disqualifies EMS agency.

### Public Mode

Location visible to all Beacon users (map-level granularity only, never exact coordinates). Useful for team coordination (firefighters, plowers, delivery drivers). Public location is neighborhood-granule or coarser; exact coordinates never public. Location updates every 5 minutes for public users, real-time for group members.

## Granularity Levels

Users select granularity independently per group/mode:

### Exact (±50m)

User's precise coordinates sent to recipient. Requires explicit user confirmation at setup, and can be revoked at any time. Used for: family coordination during evacuation, EMS emergency response, group convoy assignments. Permission expires at event end or 1 week, whichever earlier. Re-confirmation required for new events.

### Neighborhood-Block (±200m)

User location rounded to block-level precision (~250m x 250m grid). Prevents pinpointing individual building but allows street-scale coordination. Used for: group messaging coordination, general evacuation status, neighbor check-ins.

### Neighborhood (±500m)

User location rounded to ~500m x 500m grid. Enables area-level coordination but preserves broad privacy. Used for: public team tracking, general volunteer mobilization, community awareness.

### City (±5km)

User location rounded to city/district level. Minimal privacy loss; mostly informational. Used for: public alerts, aggregate statistics (number of users evacuating per county).

## Emergency Override

EMS agencies can request precise location for users in emergency situations. Request generated when:
- 9-1-1 call received with Beacon user phone number
- Fire dispatch notified of structure fire or vehicle crash with Beacon user present
- Medical emergency reported via Beacon app (user/witness initiates call)

Request sent as push notification to user: "EMS requests your location for emergency response at [address]. Accept? Yes / No". User has 10 seconds to respond. If no response, location assumption: user at reported incident address (if address available) or at last known location.

If user accepts, EMS receives exact coordinates. Location precision: GPS ±5m accuracy in open sky, ±15m in urban canyon. EMS can access location for 30 minutes from request initiation, then auto-expires and user is notified ("Your location was shared with EMS for 30 minutes. Access ended.").

EMS cannot re-request location repeatedly; system allows max 1 re-request per incident. Abusive re-requesting (>3 denied requests per month per EMS agency) triggers audit by state EMS office.

Logging: Every override request logged with: user ID (hashed), EMS agency, timestamp, accepted/declined, result. Accessible to user in privacy dashboard.

## Mesh Network Location Relay

Offline users (no LTE/WiFi) can share location via mesh network. User broadcasts location (exact or granular) to nearby mesh nodes. Nodes relay location to broader mesh, eventually reaching server when any node connects to internet.

Relay delay: ~5-30 minutes depending on mesh connectivity. Not suitable for real-time tracking; used for post-event location verification ("My household is at this shelter").

Privacy: Mesh relay unencrypted (local mesh only), but relay nodes do not store location history. Location received and immediately forwarded. Nodes cache only most recent location per user for 1 hour.

Opt-in: Users can toggle "mesh location sharing" separately. If disabled, user location not relayed even if offline. Users relying on mesh accept privacy/delay tradeoff.

## Battery Drain Management

Continuous location tracking (1-min updates) drains ~30% battery per 8 hours. Beacon uses adaptive frequency:

Normal (non-event): 30-min update frequency. User location synced every 30 minutes. Low impact: ~3% drain per 8 hours.

Advisory/Watch (Level 2-3 alert active): 10-min update frequency. ~10% drain per 8 hours.

Warning/Emergency (Level 4-5 alert): 2-min update frequency. ~25% drain per 8 hours. Users warned: "High-frequency tracking enabled. Battery will drain rapidly. Consider plugging in."

User override: Users can select "always high frequency" or "low frequency only" in settings. High-frequency option displays battery warning.

Battery saver mode: When device battery <20%, Beacon reduces all tracking to 60-min frequency unless emergency alert active.

## Location History Retention

Location data retained based on context:

Group-only sharing: History retained for 72 hours on server (for group member access), then deleted. User can request deletion anytime.

EMS emergency: Location data retained for incident duration + 30 days (for EMS case review). Then deleted unless requested by user's attorney (for legal action).

Public/team tracking: History not retained; real-time position only. No historical playback available.

Event-specific (evacuation): Location history during event retained for 6 months, then anonymized (user ID stripped, only aggregate statistics retained). User can request early deletion.

User deletion: Users can request "delete all my location history" in privacy settings. Deletion is permanent and affects all prior records. Confirmation required ("You cannot undo this deletion").

Cross-service sharing: Location history never shared between groups or with third parties. Each context (family group, EMS, public tracking) maintains separate location stream.

## Implementation Notes

Database schema: LocationEvents table (user_id, timestamp, latitude, longitude, accuracy, granularity_level, context_type [group/ems/public], encrypted_location_blob). Indexed by user_id + timestamp for history queries.

Encryption: User's location encrypted using group's public key before transmission. Decryption key held by group members only. For EMS override, location encrypted with EMS agency's public key.

Audit logging: All location access logged to AuditLog table (accessor_id, user_id, timestamp, context, justification, result). User can view audit log in privacy settings.

Retention enforcement: Automated job runs daily to delete aged location records per policy. Cannot be overridden by any user or admin.

Scale: Beacon targets 50M users, peak concurrent tracking: 5M users (during major event). Location event storage: ~5 bytes per event (timestamp, granule ID). 5M × 1 event/min × 1440 min = 7.2M events/day = ~36MB/day, 1GB/month per 50M users. Requires sharded database (by user_id).
