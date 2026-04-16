# AMBER Alert Hazard Model

## Risk Layer

NCMEC (National Center for Missing & Exploited Children) case database integrated with Beacon. Risk stratification: Abduction confirmed (high), Family abduction (medium), Lost child (low), Endangered runaway (medium-high). Activation criteria per DOJ guidelines: child <18, credible evidence abduction, child in imminent danger, sufficient description available. Geographic radius model: search zone expands 50km initial, then 100km/hour based on vehicle speed estimate. Risk index: R = (Age_Factor × Evidence_Strength × Vehicle_Track_Quality) / 100.

## Ongoing Hazard Model

NCMEC activation triggers Beacon system. Case details extracted from NCMEC database API: victim description (age, clothing, distinguishing marks), vehicle (color, make, model, license plate, VIN if available). Highway surveillance integration: NTCIP (National Transportation Communications for ITS Protocol) connected digital signage (500+ highway signs in network). License plate recognition (LPR) system alerts from state DOTs, toll authorities (0-5 minute response). Cellular geolocation: vehicle last ping triangulated via carrier records (warrant required, 50-500m accuracy).

## Spread/Evolution

Abduction incident propagation: initial dispatch 15 minutes, first alert broadcast 10 minutes, geofence activation concurrent. Alert radius: 50km rings. Expansion rate: assumes 60 mph average (worst-case scenario increases ring radius 30km/hour). Multi-state broadcast: if vehicle likely crossed state lines (>3 hours elapsed). Temporal decay: alert intensity increases first 6 hours (critical window), maintains tier for 24-48 hours, then transitions to investigative (lower broadcast frequency). Media activation: TV/radio outlets via Emergency Alert System (EAS) integration.

## Lethality

Abduction fatality rate: 45-54% within first 3 hours post-abduction if confirmed. Escape probability: 68% within first 2 hours if child <8 years old. Injury likelihood: non-custodial abductors inflict injury 38% of cases. Sexual abuse progression: 30-day average timeline before escalation in trafficking scenarios. Psychological trauma: 85% of recovered children exhibit PTSD symptoms. Temporal cascade: each hour delay reduces safe recovery probability by 3-5%.

## Safe Zones

Law enforcement facilities (police, sheriff, state patrol stations): immediate protection. Manned community centers, schools during hours. Transit hubs (airports, train stations, bus terminals): CCTV monitoring, security staff. Highway patrol checkpoints: vehicle stop/inspection capability. Cellular dead zones (no tracking): isolated areas reduce risk if victim aware. Rest areas with attendants. Hospitals/clinics: safe harbor for injured child. Shelters (domestic violence, homeless): immediate custody transfer if shelter-appropriate. Commercial establishments with high foot traffic (stores, malls): visibility/witness abundance.

## Evacuation

Active abduction: target evacuation is escape/rescue. Protocol: broadcast alert (15-minute window), saturate area with law enforcement (50-100 officer mobilization). Roadblock network: state highway patrol establishes checkpoints on major routes (30-90 minute setup). Airport/rail alerts issued (APHIS coordination, 20-minute lag). School lockdown if child known enrolled (preventive). Community canvassing: door-to-door, parking lot search (4-6 hour window). Drone search in rural/wooded areas (SAR activation). Helicopter flyover if weather permits.

## Vulnerability

Children <5 years old: 90% fatality if not recovered within 6 hours (trafficking networks). Rural location children: 2.3x higher mortality (longer response times, fewer witnesses). Non-custodial abduction (family member): 60% chance of voluntary return within 24 hours (lower risk). Stranger abduction: 46% fatality rate. Low-income areas: 1.8x higher victim count (environmental risk factors). Disabled children: 3.2x abduction risk (special needs increased).

## Secondary Effects

False alerts: 15-20% AMBER codes later deemed unfounded. Public alert fatigue: diminished response if >6 alerts/month (boy-who-cried-wolf effect reduces tips by 40%). Traffic accidents caused by alert-seeking behavior: 2-5 secondary collisions per active alert. Family trauma extends 2-5 years post-recovery (therapy needs). Media intrusion during investigation impairs case (witness identification compromised). Custody disputes trigger false alerts (15% of codes): legal complications arise.

## Operational Protocols

NCMEC verifies case meets criteria (10-15 minute review). Coordinator activates state AMBER system (45-state network participation). Law enforcement dispatch coordinates: establish command post, deploy resources, initiate LPR monitoring. NTCIP highway signs updated (5-minute dissemination). EAS broadcast to radio/TV (15-minute window from activation). Social media amplification: Facebook/Twitter auto-posts via NCMEC integration. School notifications if applicable. Toll authority alerts toll plazas. Case reassessment every 6 hours; escalate to multi-state if warranted. Stand-down: victim recovery or evidence exhaustion.

## Caching/Offline

Pre-cache NCMEC most-wanted cases (30-50 active, updated daily). Store NTCIP highway sign locations/capabilities (1MB GeoJSON). Cache law enforcement agency contacts (state, county, local dispatch centers). Offline mode provides last 7-day case database (200+ recent unsolved cases). Pre-cache Cellular carrier geolocation procedure/legal framework (reference docs). Store school/institution databases (enrollment records for filtering). Background tiles include all highways, rest areas, toll plazas (zoom 11-15). Timestamp cases; refresh hourly during active alerts.

## Comms/UI

Alert (Level 1): "AMBER ALERT: 4-year-old Sophia Rodriguez abducted from Phoenix. Silver Honda Odyssey, AZ plate ABC-1234. Suspect: male, 30s, tan baseball cap. Last seen I-10 eastbound 0945. If seen, call 911 immediately." Push: immediate + 4-hour + 12-hour + 24-hour refreshes. SMS via IPAWS: "ALERT: Abducted child. Vehicle desc: Honda Odyssey silver AZ-ABC1234. Area: I-10 corridor. Tips: 911." Web: live case map showing LPR hits, highway sign status, vehicle sightings (crowd-sourced), law enforcement staging. Voice: 911 dispatch protocols. In-app: one-tap reporting with GPS location.

## Sensor Input

Primary: NCMEC case database (real-time activation feed). Secondary: Law enforcement dispatch (CAD computer-aided dispatch records). Tertiary: License plate recognition (LPR) network (state DOTs, toll authorities, highway cameras). Quaternary: Cellular geolocation (warrant-based, carrier records). Quinary: NTCIP highway sign network. Mobile: citizen sighting reports (app-based, photo/location validation). CCTV: transit hubs, retail establishments (via police request). Traffic cameras (DOT state networks). Media monitoring (social reports amplification). Toll plaza attendant observations.

## Search Zone Expansion Algorithm

Initial zone (hour 0): 50km radius around abduction location. Hour 1-3: expand to 100km radius (vehicle travel assumption 60 mph). Hour 4-6: 150km radius (assume interstate travel 70 mph). Hour 12+: 200km+ multi-state (coordinate with regional AMBER networks). Probability density function: Gaussian centered at last known location, variance increases with time. High-probability corridors: interstate routes have 3x weighting vs. local roads (traffic pattern analysis). State border predictions: if vehicle likely crossed, activate adjacent state (reciprocal agreements). Time-zone considerations: broadcast timing coordinated across zones (3-hour window activation). Cell tower geofence: carrier provides location history within ±500m accuracy (warrant-required data).

## Investigation Cascade Protocol

Tier 1 (minutes 0-15): Case verification, NCMEC filing, law enforcement activation. Tier 2 (minutes 15-45): LPR network alerts, EAS broadcast preparation, media activation. Tier 3 (minutes 45-120): Multi-state coordination, highway sign updates, social media amplification. Tier 4 (hours 2-6): Photo release to media (TV, radio, internet), citizen tip line activation, traffic pattern analysis. Tier 5 (hours 6-24): Interstate commerce federal involvement (FBI if warranted), Amber network newsletter distribution. Tier 6 (24+ hours): Investigative reassessment, de-escalation protocols if case conditions change.

## False Alert Prevention

Validation checklist: (1) custodial status confirmed (not family abduction), (2) child description sufficient (photo analysis for broadcasts), (3) vehicle information >50% complete (license, color, make). Rejection triggers: custody dispute unresolved (mediation first), runaway without danger evidence, insufficient vehicle data. Media hold guidelines: 3-hour mandatory review before broad broadcast (reduce false alerts by 40%). Photo authentication: reverse-image check to prevent misleading media. Demographic verification: child age/race/gender cross-checked against missing persons networks (reduce false matches 50%). Reactivation criteria: new evidence emergence requires re-broadcast (8-hour window).

## Tip Management & Verification

Sighting reports: location geotagged, timestamp recorded, submitter contact verified. Photo validation: metadata extraction (EXIF) confirms time/location match. Vehicle confirmation: license plate manual verification (reduce LPR false positives 30%). Multi-report triangulation: three independent sightings in same area trigger high-confidence alert zone. Hoax detection: social media keyword analysis flags suspicious patterns (same-account repeat tips, timing anomalies). Lead prioritization: interstate sightings rank first, trailing-edge geofence second, citizen tips third. Case closure notification: broadcast stop within 30 minutes of confirmed recovery.
