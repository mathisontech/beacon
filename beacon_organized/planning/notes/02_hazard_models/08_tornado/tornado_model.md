## Tornado Hazard Model

### 1. Risk Layer

Tornado climatology from NOAA Storm Data (70+ years, 50,000+ events). Regional frequency: Great Plains = 0.5-1.5 tornadoes per 1000 sq mi per year (Dixie Alley = 0.3-0.5). Seasonal peak: April-May (spring instability) + November (secondary peak). Diurnal maximum: 4-6 PM (afternoon surface heating, jet stream positioning).

Probability of strong tornado (EF3+) per 100 sq mi per year: Oklahoma = 0.15, Kansas = 0.12, Mississippi = 0.08. Conditional probability model: given supercell signature detected by radar, P(tornado) = 20-40% within 30-min window. Storm-relative helicity (SRH) parameterization: SRH < 100 m²/s² → <5% tornado probability, SRH > 400 m²/s² → 50%+ probability.

Building exposure from HAZUS (FEMA standard): wood-frame residential (80% vulnerable to EF2+), pre-1980 mobile homes (85% vulnerable to EF1+), small masonry homes (60% vulnerable to EF3+). County-level risk scores weighted by tornado frequency + structural vulnerability. Baseline risk: (annual_frequency × probability_strong × vulnerability_percent) × population_density.

### 2. Ongoing Hazard Model

NEXRAD dual-polarization radar (159 stations across US): reflectivity (dBZ), differential reflectivity (ZDR), correlation coefficient (CC), specific differential phase (KDP). Mesocyclone detection algorithm (MDA): rotational velocity > 20 knots detected via Doppler velocity couplets (adjacent pixels with opposing velocity). Mesocyclone confidence = function(velocity_differential, azimuthal_continuity, height_extent). Automated alert: confidence > 0.8 triggers "rotation detected" message.

Storm-relative velocity (SRV) computed by removing storm motion (25-40 mph typical). Tornado vortex signature (TVS) detection: velocity couplet core radius < 2 km, asymmetry ratio < 0.7 (one side faster), low-level reflectivity hook (debris signature). Debris signature indicator: ZDR depression (< 0 dB) in tornado core (wet debris), reflectivity enhancement (30-50 dBZ) from large hail/debris mixture. Confidence threshold for tornado existence = ZDR hook + velocity couplet + debris signature simultaneity.

Spotters/chasers feed real-time observations (confirmed sightings, funnel cloud reports, visual tornado reports). Photo/video uploads with GPS timestamp enable triangulation. Community-reported sightings (Beacon app) aggregated: ground-truth vs. false-alarm filtering via machine-learning classifier (trained on 5000+ historical reports). Sighting credibility score based on user historical accuracy.

### 3. Spread/Evolution Model

Mesocyclone dynamics: angular momentum conservation in rotating updraft. Vertical vorticity ω_z = ∂v/∂x - ∂u/∂y. Circulation = ∮(u dx + v dy) integrated along closed path. Critical circulation for tornado formation ≈ 10^5 m²/s over 2km radius. Intensification governed by pressure-perturbation forcing (pressure minima in core drive convergence, self-sustaining feedback).

Temporal evolution: vortex genesis (30-60 min, circulation growth 10^4 → 10^5), intensification (10-20 min, maximum intensity reached), decay (10-30 min, rapid weakening). EF-scale rating: wind speed threshold calibration: EF0 = 65-85 mph, EF1 = 86-110, EF2 = 111-135, EF3 = 136-165, EF4 = 166-200, EF5 = 200+. Damage assessment teams use 28 damage indicators per EF scale for post-event analysis.

Path prediction model: ensemble of Historical Storm Tracking (HaST) trajectories. Historical analog selection: current storm parameters (inflow layer RH, 0-6km wind shear, CAPE) matched against tornado database (Euclidean distance in parameter space). K-nearest-neighbor forecast: mean trajectory of 5-10 most similar historical cases. Forecast cone: 68% confidence interval (±2 km perpendicular at 1 km range, expanding with time).

Width/intensity evolution: initial width = 100-200m (thin rope stage), peak width = 500-1500m (mature). Circulation contraction (pressure-perturbation feedback) concentrates vorticity, increasing wind speed per Rankine vortex: V(r) = Γ / (2π × r) where Γ = circulation. Maximum winds at radius of maximum wind (RMW = 100-300m typical).

### 4. Lethality Model

Wind lethality: 60 mph = falling debris risk (shingles, tree branches), 80 mph = structural damage begins (windows break), 110 mph = complete house structural failure (roofs removed), 160+ mph = total destruction (rubble field). Person exposed in open: 110+ mph = high injury probability, 170+ mph = lethal wind speed for sustained exposure.

Impact trauma: projectile velocity distribution in tornado (fraction of debris reaching 100+ mph). Debris flux model: number of projectiles = debris_concentration × wind_speed × exposure_time. Injury probability by debris type: small stick (2cm diameter, 100 mph) → skin laceration probability = 30%, penetrating injury = 5%. Large pole (30cm, 150 mph) → impact fatality probability = 80%.

Shelter lethality: interior room (windowless bathroom, basement, storm cellar) reduces lethal wind exposure to 20% (walls attenuate ~80% of wind speed gradient). Mobile home fatality rate = 15-20x higher than site-built housing (EF2 tornado). Masonry/concrete block buildings reduce fatality 50% vs. wood-frame at same intensity. Basement occupancy: fatality rate in basement ≈ 2% (collapses rare); above-ground ≈ 5-10%.

### 5. Safe Zone Layer

Pre-mapped safe rooms: interior bathrooms/closets (no external walls), basements (debris protection), reinforced storm shelters (FEMA-rated, 250+ mph+ wind design). Shelter capacity database: count, location, accessibility (wheelchair, pediatric, medical equipment). Safe room criteria: wall thickness > 12 inches (concrete/block), roof anchorage rated for 200+ mph uplift, opening protection (shutter-rated walls).

Dynamic safe zone: tornado track forecast cone (68% confidence ±2km). Perpendicular distance to track center > 5km = outside direct vortex zone (safer, but wind damage still possible 50+ miles from center). Safe direction: perpendicular to motion vector (avoid end-on approach where vortex motion combines with translation for maximum wind speed). Temporal safe zone: time-to-arrival calculated from current position + forward speed (typically 40-60 mph).

Shelter accessibility during warning (15-25 minute window): safe room within 5-minute reach preferred (< 2 km walk/drive). Multi-story building upper floors (interior hallways) acceptable if basement unavailable (80%+ mortality reduction vs. exterior/upper-story locations). Outdoor safe zone: culvert/depression > 2m deep provides wind speed reduction (vortex circulation may still create locally strong winds, but overall hazard reduced).

### 6. Evacuation Layer

Tornado warning trigger: radar-confirmed rotation (mesocyclone detection confidence > 0.8) OR trained spotter visual confirmation OR debris signature detection. Warning window = 15-25 minutes typical (range 5-60 min depending on warning system performance). Immediate action: vertical evacuation to interior rooms, basement sheltering (horizontal evacuation ineffective for tornado proximity < 10 km).

Evacuation routing for distant threats (tornado track > 10km away, time-to-impact > 1 hour): movement perpendicular to track direction (90° angle from storm motion). Avoid vehicles in open (mobile home communities particularly vulnerable). Shelter-in-place decision: closer to interior room/basement than travel distance to safe building → shelter immediately (< 1 min deployment time vs. 5-15 min evacuation).

Traffic evacuation pre-tornado (tornado formation not yet confirmed): use contraflow on major corridors if implemented (rarely triggered pre-tornado). Evacuation zones by warning confidence: high confidence (debris signature + rotation + spotter report) → all persons within 10km should seek shelter. Medium confidence (rotation only) → persons within 5km shelter, others remain alert.

### 7. Vulnerability Layer

Nursing homes/assisted living facilities in tornado-prone counties: 200+ facilities in Great Plains. Evacuation: residents cannot self-shelter in interior rooms efficiently (mobility aids, cognitive impairment). Pre-positioned resources: hardened shelter facility or contingency bussing (2 buses per 100 residents, 10-15 min deployment). Hospitals: patient movement during tornado warning non-essential (interior hallway sheltering preferred over evacuation).

Schools: student populations in tornado-prone regions have tornado drill training. Auditorium/gymnasium (open structures) are high-risk sheltering locations (roof collapse in EF2+). Designated shelter areas: interior hallways/bathrooms, locker room areas (interior walls). Daycare/preschool: adult supervision ratio 2:1 for orderly shelter movement.

Mobile home communities: 1-2% of housing stock, 10-15% of tornado fatalities (Dixie Alley). Evacuation protocol: pre-identification of evacuation shelters (community center, school, church) with capacity confirmation. Vehicle distribution: estimate 60% occupancy (2 persons per vehicle, 30% driving privately). Evacuation ETA: 15-20 min from warning onset given road capacity constraints.

### 8. Secondary Effects

Hail accumulation (tornadic supercells produce giant hail, 2-4 inch diameter typical): roof damage triggers water intrusion (rain + melting hail). Vehicle damage: windshield breakage (visibility loss), engine block cracking (coolant loss). Hail-damage casualty: person struck by hailstone > 1 inch diameter at terminal velocity 100+ mph → concussion/laceration risk.

Lightning risk: tornado clouds produce frequent lightning (cloud-to-ground stroke density 3-10 strokes per minute during peak activity). Lightning fatality within tornado damage zone = 2-5 cases per 1000-person exposure (low probability but possible). Co-occurrence: tornado + lightning = evacuation complication (sheltering delays outdoor movement, lightning risk during outdoor movement).

Secondary flooding: tornado rainfall rate often exceeds 1 inch/hour (convective downburst). Flood-prone areas within tornado damage zone face combined tornado + flash flood hazard (90 min window). Debris dam formation in streams: fallen trees accumulate, temporary impoundment, dam breach flood wave. Magnitude = debris-blocked volume / breach time.

### 9. Operational Protocols

Event activation: WSR-88D radar-confirmed TVS OR trained spotter report OR multiple Beacon app sightings (3+) from cluster < 5km. Tornado warning issuance: typically < 4 minutes from trigger to product release (record speed). Data logging: radar reflectivity/velocity fields (10 min prior, during, post-event), mesocyclone evolution, spotter triangulation (azimuth from multiple locations estimates tornado position), damage survey (post-event).

County emergency management coordination: siren activation (audio alert broadcast), media notification (TV/radio interruption), Wireless Emergency Alert (WEA) SMS to all phones in warned area (typically 5-county region). Storm-chaser coordination: official spotter networks (SpotterNetwork.com, social media feeds) provide crowd-sourced sightings. Post-event damage assessment: NWS Storm Data team arrival (12-24 hours) for official EF-scale rating.

### 10. Caching/Offline

Pre-computed tornado climatology (500-year frequency raster, 1 km resolution): 10 MB per county. Building vulnerability database (structure type, year built, EF-scale fragility curves): 50 KB per county. Safe shelter locations (interior rooms, basements, formal shelters) + capacities: 5 KB per county. Historical tornado tracks (last 50 years): visualization layer.

Offline tornado model: mesocyclone detection disabled (requires real-time radar). Path projection: constant-velocity straight-line extrapolation (typical 40-60 mph forward speed). Shelter routing: simple proximity-based nearest-safe-room algorithm. Battery mode: disable radar polling, rely on warning confirmation via SMS/alert integration.

### 11. Comms/UI

Tornado warning polygon on map (red bounding box, labeled "TORNADO WARNING, Expires 4:15 PM"). Forecast track cone (68% confidence, dark red center line, light red buffer). Mesocyclone marker (green rotation icon) with detected position/confidence level. Wind speed overlay: 50/100/150+ mph concentric circles (red intensity gradient).

Safe shelter recommendation popup: "NEAREST SHELTER: 123 Main St Basement (400m, <1 min drive)". Sighting report feed: "Funnel cloud reported near County Rd 5 at 3:45 PM (spotter: John_Chaser)". Damage assessment post-event: "EF3 damage area near Smithville (1-3 mi wide, 10 mi track length estimated)". Offline status: "Using pre-computed hazard model (tornado watch active)".

### 12. Sensor Input

Phone accelerometer: tornado wind (60+ mph gusts) creates sustained vibration (10-30 Hz frequency range). Structural failure signatures (building deformation acceleration). Microphone: roar sound (60-80 dB, distinctive 100-500 Hz frequency content). Audio classification CNN (trained on 200+ tornado recordings) distinguishes tornado from other storms (80%+ accuracy). Wind-speed estimation from microphone noise (acoustic impedance calibration).

GPS drift analysis: wind-blown phone object increases GPS uncertainty 5-10m (multipath scattering from debris). Pressure sensor: rapid pressure drop during vortex passage (5-10 mb over 10 minutes) unique signature vs. straight-line wind. User sighting triangulation: azimuth from 2+ independent observers allows tornado position estimation (error radius ~1 km). Shelter status crowdsourcing: "In interior bathroom, 5 people, safe until warning expires".

