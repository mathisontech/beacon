# Special Designations

## Overview

Special designations grant users elevated permissions, data access, and coordination roles during emergencies. Beacon defines 12 designation types, each with distinct responsibilities, verification requirements, and incident authorities. Designations are role-based, not account-level; a single user can hold multiple designations across different organizations.

## Designation Types and Authorities

### 1. School Principal

Manage emergency response at school facility. Receives parent-community group admin access, real-time student location data during evacuations, EMS coordination channel.

Invite workflow: Superintendent or district emergency coordinator sends invite code. Principal creates Beacon account, enters invite code, selects school from list, receives verification request. District admin approves via email link (24-hour expiration).

Data access: Roster of enrolled students + families, student location (neighborhood-granule) during event phases 2+, health/accessibility notes from family profiles, school facility address/floor plans.

Incident authority: Can initiate school evacuation (triggers auto-alert to parents + EMS), request EMS for medical incidents, open school as shelter, request police for trespasser/lockdown scenarios. Actions logged and tagged with principal ID.

### 2. Utility Representative

Manage grid/water outages and infrastructure failures. Receives outage map layer, work order assignment feed, customer location data, public notification authority.

Invite: Utility company HR or dispatch sends invite code. Rep creates account, enters code, provides employee ID (verified against company HRIS). Designated role at company confirms via SMS to employee's phone on file.

Data access: Outage extent map, affected customer count by area, work order queue, field crew GPS (if opted-in), historical outage patterns (for that utility only).

Incident authority: Post outage status to "Infrastructure" map layer (visible to all Beacon users), request large-scale push notification to affected customers (auto-includes utility name/outage reference number), coordinate with fire chief on critical infrastructure failures.

### 3. Plower

Manage snow/ice clearing operations. Receives task assignment map, road condition layer, customer service tickets. Can report road status, coordinate with fire dispatch.

Invite: City public works or private snow removal company dispatch sends invite. Plower enters invite code, provides driver's license photo (liveness check), license number verified. Dispatcher approves via app notification.

Data access: Task list (with address/property owner name), current road conditions (submitted by other ploers in region), active winter weather warnings, customer service requests related to access.

Incident authority: Update road status (open/blocked/hazardous), request emergency call-out notification to affected customers, accept additional task assignment from dispatch outside normal rotation.

### 4. Tornado Tracker

Real-time tornado spotting and damage assessment. Receives radar overlay, historical tornado database, direct communication with NWS Storm Prediction Center (SPC).

Invite: NWS Regional Headquarter meteorologist sends invite. Tracker creates account, enters code, receives link to meteorology certification requirements. Self-attestation of formal training (NWS/NOAA brief endorsement). NWS admin auto-verifies via meteorologist credential lookup.

Data access: Base reflectivity radar (2-min updates), tornado historical database (location, intensity, track), NWS text products (TOR, SVS), direct SPC chat channel, damage imagery database (geotagged photos from prior events).

Incident authority: Submit tornado observation (location, intensity, direction, speed) directly to SPC chat and local NWS office (auto-forwarded). Request confirmation of sighting from nearby chasers. Post photo of tornado/damage with automated geotagging.

### 5. Storm Chaser

Mobile extreme weather documentation. Receives severe weather alerts, permits coordination with law enforcement, image submission pipeline.

Invite: Open invite code (self-service link on Beacon website). Chaser creates account, enters code, confirms liability waiver acknowledgment + insurance verification (online policy lookup). Auto-activated on waiver completion.

Data access: Severe weather alerts (2-min before public), radar, alert areas, other chaser locations (map only, no names), hazard zone boundaries, route suggestions based on weather model.

Incident authority: Submit geotagged photo/video (immediately searchable by hazard specialists), request legal safe zones (public land only, no private property advice), coordinate with nearby chasers (opt-in). No authority to modify official alerts or dispatch resources.

### 6. Fire Spotter

Stationary wildfire detection and progression reporting. Receives fire perimeter updates, air quality data, evacuation order tracking. Typically volunteer or fire department staff.

Invite: Fire chief or county fire coordinator sends invite. Spotter creates account, enters code, provides spotter tower location (geotagged). Fire chief approves via in-app notification.

Data access: Active fire perimeters (CAL FIRE / InciWeb feeds), fire progression timeline, air quality index (EPA), evacuation orders by area, firefighter position data (EMS/fire dispatch groups only), weather at spotter's location.

Incident authority: Report fire observations (time, location, extent, direction, color/smoke behavior) to fire dispatch and NWS. Photo submission auto-embeds spotter location (within 500ft accuracy). Emergency call-out if spotter is threatened.

### 7. Fire Chief

Incident command authority. Receives mutual aid coordination channel, evacuation order submission authority, all firefighter location/status data, critical infrastructure map.

Invite: County or state fire coordinator sends invite. Chief creates account, enters code, provides fire department ID. State fire coordinator verifies via government employee database. Multi-factor approval (email + phone confirmation).

Data access: All fire incidents in jurisdiction, firefighter strike teams and positions (real-time), mutual aid availability and requests, evacuation zone map (with edit permissions), critical infrastructure locations (hospitals, schools, utilities), CAL FIRE incident updates (if applicable), EMS transport queue.

Incident authority: Issue evacuation orders (triggers public alerts), request mutual aid, assign strike teams to incidents, update fire perimeter (if incident commander), authorize road closures, request law enforcement (for scene security), approve shelter locations.

### 8. Ambulance/EMS Director

Coordinate emergency medical transport. Receives 911 call feed, hospital bed capacity, patient transport status, triage coordination.

Invite: County EMS coordinator or hospital administrator sends invite. EMS director creates account, enters code, provides EMS license/certification number. County EMS office verifies via state NREMT database.

Data access: Active 911 dispatch calls (anonymized patient data), transport queue to hospitals, hospital bed availability (ER, ICU, surge capacity), ambulance unit locations and status, mutual aid requests from other agencies, MCI (mass casualty incident) protocols.

Incident authority: Request hospital surge capacity activation, dispatch ambulance units, coordinate with fire chief on scene access, triage patient distribution by hospital, request EMS mutual aid, update transport status in real-time.

### 9. State Emergency Representative

Statewide coordination and resource allocation. Receives CAL FIRE ICS authority, mutual aid dispatch authority, interstate coordination channel.

Invite: State emergency management agency sends invite (Governor's office, Cal OES). Rep creates account, enters code, provides state position letter. Multi-factor: email + SMS confirmation from verified .gov phone.

Data access: All active incidents statewide, mutual aid requests/allocations, resource status (personnel, equipment), evacuation order registry, interstate incident coordination (EMAC), incident commander chat for all Type 1/2 fires.

Incident authority: Approve/deny mutual aid requests, allocate state resources to incidents, issue statewide evacuation recommendations, coordinate with federal partners, update public evacuation status API.

### 10. State Politician

Constituent communication and resource advocacy. Receives evacuation zone map, district boundary overlay, event impact summary (by district), public notification authority.

Invite: Open link via official government website. Politician creates account, enters code, verifies office via biometric selfie + government ID (AI matching). Legislative credentials auto-verified against state roster.

Data access: Evacuation zones in legislative district, number of constituents affected (by event), infrastructure damage summary, public alerts issued in district, fundraiser/relief links for affected communities.

Incident authority: Post message to affected constituents (auto-tagged as "Official Statement"), request resource support from state agencies, share relief links + donation platforms, reply to public constituent messages.

### 11. Federal Emergency Representative

Interstate/national incident coordination. Receives federal incident command channel, FEMA resource database, interstate mutual aid authority.

Invite: FEMA or federal emergency management sends invite. Rep creates account, enters code, provides FEMA ID. Auto-verified via federal employee directory (ISED). Requires CAC (Common Access Card) authentication.

Data access: All incident types (federal jurisdiction), FEMA resource status, mutual aid interstate requests, federal grant eligibility tracker, interstate incident coordination (EMAC), disaster declaration data.

Incident authority: Approve federal resource deployment, authorize FEMA reimbursement codes, dispatch federal resources (DoD, HHS), coordinate with international partners (if applicable), issue federal evacuation recommendations.

### 12. Hospital Representative

Healthcare surge coordination. Receives patient surge data, mutual aid requests, PPE/supply status, evacuation center medical support needs.

Invite: Hospital administrator or county health officer sends invite. Rep creates account, enters code, provides hospital NPI number. County health office verifies via CMS National Provider Identifier database.

Data access: Current bed occupancy (ER, ICU, med-surg), patient surge forecasts, incoming ambulance queue, mutual aid requests from other hospitals, evacuation center medical needs, pharmacy inventory, staff availability.

Incident authority: Accept/decline mutual aid requests, post bed availability status, request EMS transport diversion, authorize emergency department surge protocols, receive medical supply mutual aid requests.

## Invite Code Workflow

Invite codes are 12-character alphanumeric tokens (e.g., SC-FIRE-2A9X-7K). Single-use, 30-day expiration. Revocable by issuer at any time.

Distribution: Codes issued through admin portal. Sender provides recipient email; system sends invite link with embedded code. Recipient clicks link, creates account or logs in, enters code, completes verification step (varies per designation).

Verification:
- Self-attesting: Tornado Tracker (meteorology cert), Storm Chaser (waiver), Fire Chief (department ID)
- Database-verified: School Principal (district HRIS), Utility Rep (company HR), Plower (DMV license), EMS/Hospital (NREMT/NPI), State/Federal (government ID directory)
- Admin-approved: All others (fire chief approves spotter, EMS director approves, etc.)

Revocation: Issuer can revoke invite codes before use. Used designations can be revoked by issuer (authority removed immediately, archived for audit).

## Permissions Matrix

| Designation | Location Access | Alert Authority | Dispatch Access | Mutual Aid | Data Export |
|---|---|---|---|---|---|
| School Principal | Student neighborhood | School evacuation | EMS only | No | Attendance export |
| Utility Rep | Customer service | Infrastructure outage | None | Yes (utilities) | Anonymized outage stats |
| Plower | Task list | Road conditions | Dispatch (work orders) | Yes (public works) | None |
| Tornado Tracker | Public map | Observation to SPC | NWS chat | No | Photo database |
| Storm Chaser | Hazard zones | Photo submission | None | Peer coordination | None |
| Fire Spotter | Perimeter + tower | Fire observations | Fire dispatch | No | None |
| Fire Chief | All firefighters | Evacuation orders | Strike teams | Yes (mutual aid) | Full incident data |
| EMS Director | Ambulance units | Hospital coordination | 911 feed | Yes (ambulance) | Anonymized transport |
| State Emergency Rep | All incidents | Statewide evacuation | State resources | Yes (EMAC) | Full incident archive |
| State Politician | Constituent areas | Constituent messages | None | Advocacy only | Anonymized impact |
| Federal Rep | Interstate incidents | Federal resources | National database | Yes (FEMA) | All federal data |
| Hospital Rep | Surge data | Bed availability | Mutual aid | Yes (hospitals) | Anonymized patient flow |

## Implementation Notes

Database schema: Designations table (id, user_id, type, issuer_id, verified_at, authority_level, expires_at, revoked_at). Permissions indexed by designation type for authorization layer.

Audit logging: Every designation action (issue, verify, revoke, authorize) logged with actor, timestamp, justification. Searchable by user/incident/authority.

Mesh network: Designations cached locally on device; permissions refreshed on mesh sync. Offline actions queue and sync on reconnect.

Scale: Beacon targets 100K+ designations across ~50 states. Invite code rotation to prevent enumeration attacks.
