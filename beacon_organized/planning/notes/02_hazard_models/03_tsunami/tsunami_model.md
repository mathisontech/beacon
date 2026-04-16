## Tsunami Hazard Model

### 1. Risk Layer

USGS National Seismic Hazard Map (NSHM) integrated with tsunami earthquakes (Mw >= 7.0, shallow depth < 30km). Subduction zone cataloging: Cascadia, Alaska-Aleutian, Japan-Kuril-Kamchatka, Tonga-Kermadec, Peru-Chile. Probabilistic tsunami hazard analysis (PTHA) with annual exceedance probability curves. Moderate hazard zones: 1000-year inundation extent. High hazard: 100-year inundation. Bathymetric dataset (GEBCO 2023, 15 arc-second resolution) defines tsunami wave propagation pathways.

Coastal building exposure from OSM/parcel databases within inundation zones. Port infrastructure (harbors, piers, berthing areas) flagged as critical infrastructure. Tsunami speed per depth: c = sqrt(g × h), meaning shallow continental shelf (h = 100m) → c = 31 m/s vs. deep ocean (h = 5000m) → c = 223 m/s. Baseline risk score: (frequency × magnitude × inundation_depth × building_density). Updated every 24 hours with seismic catalog.

### 2. Ongoing Hazard Model

USGS ShakeAlert EEW (Earthquake Early Warning) system provides M, location, depth within 3-8 seconds of rupture. Real-time seismic stations (IRIS/USGS network, ~2000 stations) characterize event immediately. PTWC (Pacific Tsunami Warning Center) issues bulletins: "TSUNAMI WATCH" or "TSUNAMI WARNING" with estimated wave arrival times (ETA).

DART buoy network (39 deep-ocean stations) transmits real-time ocean bottom pressure anomalies via Iridium satellite. DART data latency: 5-10 minute delay from measurement. Sea surface height anomaly threshold = 20mm above background indicates tsunami passage. Coastal tide gauge network (NOAA, 200+ stations) confirms inundation with 1-minute sampling interval.

User reports of unusual sea behavior: rapid sea level drop (negative surge), change in wave character (shorter period oscillations), audible roar. Photo + GPS + timestamp crowdsourcing. Historic tsunami catalog (NOAA/ITIC) provides reference wave periods (13-120 minute range) for anomaly detection validation.

### 3. Spread/Evolution Model

MOST (Method of Splitting Tsunamis) shallow water equation solver from NOAA. Nonlinear shallow water equations: η_t + (η·u)_x + (η·v)_y = 0 (continuity); u_t + u·u_x + g·η_x = 0 (momentum). Staggered finite difference grid (27 arc-second resolution = ~800m) for Pacific basin, finer 3 arc-second (~90m) for coastal zones. Time-stepping: explicit leap-frog method, Courant stability CFL < 0.5.

ComMIT (Cornell Multi-grid Coupled Tsunami) extends MOST with 2-3 nested grids: basin scale → regional → local. Grid refinement ratio 1:9 between levels. Bathymetry smoothing via biharmonic filter avoids spurious wave reflections. Source representation: seismic slip model distributed on fault plane. Okada (1992) deformation: vertical displacement field from moment tensor + fault geometry + slip distribution (from seismic inversion products, e.g., USGS finite fault models within 10-15 min of event).

Wave shoaling and refraction with depth-dependent Snell's law: ray parameter p = sin(θ) / c = constant. Wave height amplification via Green's law: H_coast / H_deep = sqrt(c_deep / c_coast). Continental shelf resonance (Helmholtz frequency = c / (4 × bay_length)) triggers seiche oscillations (prolonged 5-15 minute period oscillations).

Physics-informed neural operators (DeepONet architecture) trained on 10,000 pre-computed MOST scenarios. 90% speedup vs. full MOST simulation (300 sec → 30 sec) enabling ensemble forecasting. Input: earthquake parameters (Mw, hypocenter, focal mechanism, slip distribution). Output: inundation depth raster + velocity field + arrival time grid.

### 4. Lethality Model

Wave impact force: dynamic pressure = 0.5 × ρ × v^2 where v = water velocity. Depth-velocity product hazard: 1.0 m^2/s = force ~500 N/m width (human incapacitation threshold). > 2.0 m^2/s = lethal force. Small boat flotation loss: buoyant force < weight + dynamic pressure force → capsizing at depth-velocity ~ 3 m^2/s.

Inundation depth lethality: > 2m depth → drowning risk for majority of population (except strong swimmers). Hydraulic drag coefficient C_d = 1.2 for human torso. Drag force = 0.5 × ρ × v^2 × A × C_d. Burial probability under sediment/debris given inundation duration and bed-load concentration. Debris impact: log/boulder concentration in flow, terminal velocity = sqrt(2 × g × h), impact energy = 0.5 × m × v^2.

Exposure time to drowning: apnea duration = 30-60 sec + hypoxia onset 2-4 minutes. Person inundated depth > 1m for > 5 minutes = lethal. Rescue probability: buoyant objects availability + nearby humans to assist. Hypothermia: water temperature < 15°C → critical condition within 15-30 minutes.

### 5. Safe Zone Layer

Elevation refuges: terrain > 30m above mean sea level (inundation projection adds margin). Pre-mapped vertical evacuation zones: multi-story buildings with flat roofs, secure roof structures rated for wind load 200 mph (equivalent to wave force). Tsunami vertical evacuation shelter criteria: upper floor above estimated run-up + 2m freeboard, stable structure (no damage from wave impact force).

Dynamic safety recalculation: MOST/ComMIT inundation extent propagated to 10min before arrival (time for shelter confirmation + movement). Barrier effectiveness: seawalls (success rate 70-80%), mangrove forests (100-300m × depth reduction 50-70%), offshore reef arrays (attenuation 30-60% for 1m amplitude waves).

Accessible safe zone identification: vertical shelters within 5-minute walk distance (250-400m), clear route with no inundation during evacuation window. Safe zone validity expiration: wave train duration (Pacific tsunamis = 1-2 hour sequence), recurrence interval between waves (18-30 minute typical). After final wave passage + 30 min grace, safe zone re-opened.

### 6. Evacuation Layer

Evacuation trigger: M >= 7.0 within 1000km of coast (automatic 10min pre-positioning). Confirmation via PTWC/NTWC bulletin or DART buoy detection. For regional sources (< 500km epicenter), evacuation window = 5-15 min pre-arrival (requires near-source detection). For distant sources (> 1000km), evacuation window = 3-12 hours.

Evacuation zone: all residential/commercial areas within inundation extent polygon. Lateral routing: evacuation parallel to coast (perpendicular movement away from water). Route elevation-gain priority: minimize horizontal distance while maximizing elevation gain rate. Topographic pathfinding: prefer ridge-line routes (> 30m elevation gain per km if possible).

Vertical evacuation instruction: if horizontal evacuation infeasible (urban density, limited routes), direct to nearest tall building. Building selection: minimum 4-story, roof access confirmed, capacity > estimated occupants in zone. Vertical evacuation ETA < horizontal ETA to safe zone elevation triggers preference switch.

Traffic model: parking/vehicle distribution from OSM point-of-interest density. Evacuation demand = population_in_zone × (vehicles_per_household × household_members_per_vehicle). Bottleneck capacity (freeway exit, bridge) = lanes × 1800 veh/hr/lane. Queue length extrapolation: if demand > capacity for > 30min, congestion-induced casualties predicted.

### 7. Vulnerability Layer

Coastal nursing homes/assisted living from state licensing data (100+ facilities in high-hazard zones). Hospital evacuation planning: ambulance capacity = 4-6 patients per vehicle, patient transport time 30-90 min to inland facility. Dialysis center patients: 3-4 hour treatment duration, mobile dialysis truck coordination required.

Fisheries/harbor workers: occupational exposure highest (working at sea, docks). Migration status populations: undocumented residents may avoid evacuation to avoid authorities. Homeless populations: encampments in parks, under bridges near rivers (subject to surge), vehicle dwellers in beach parking areas.

Deaf/blind accessibility: auditory siren limitations (requires visual alerts). Mobility aids: wheelchair users need ramped/accessible evacuation routes. Assisted living coordination: pre-identified buses, medical equipment staging areas, driver training on emergency protocols.

### 8. Secondary Effects

Seiche generation in harbors/bays: initial wave reflection from coastline generates standing wave pattern. Harbor seiche period = 2 × L / c (L = bay length). Port damage: seiche amplitudes 2-4m cause vessel mooring failures, dock structure impacts. Shipping container loss from container ship movement in seiche, spill environmental hazard.

Liquefaction susceptibility from Zhu et al. (2017) cyclic stress ratio parameterization. Tsunami wave oscillation (1-2 Hz frequency, low frequency) contributes minimal liquefaction risk vs. earthquake, but combined earthquake + tsunami hazard increases. Landslide triggers: submarine landslides during earthquake rupture can generate local tsunamis (Papua New Guinea 1998, Mw 7.0, ~2000 fatalities from local tsunami wave).

Saltwater intrusion: tsunami inundation deposits salt in soil, crop damage lasting 3-5 years. Aquifer contamination: freshwater displacement (density differential) causes saltwater wedge penetration 50-100m inland from coast. Infrastructure corrosion: salt spray + direct inundation accelerates rust/decay (replacement timeline 1-2 years for critical systems).

### 9. Operational Protocols

Event activation: USGS ShakeAlert M >= 6.5 within 1000km coast automatically triggers tsunami watch. PTWC/NTWC bulletin confirmation supersedes automatic trigger. Data logging: seismic parameters (M, location, depth, focal mechanism), DART buoy observations, tide gauge observations, user reports, inundation extent (GeoTIFF). Incident coordination: state emergency operations center notified, NOAA PTWC liaison communication channel.

Test protocol: monthly tsunami test drills (Great ShakeOut scenario). Annual model validation: hindcast 2004 Indian Ocean (Mw 9.1), 2011 Japan (Mw 9.0), 2015 Chile (Mw 8.3) events. Model skill: mean absolute error < 30cm for arrival time, < 20% for peak amplitude.

### 10. Caching/Offline

Pre-computed inundation extent rasters (100-year tsunami) for all major coastal regions (1GB per region). Vertical evacuation building database (address, floors, roof access, capacity): 50000+ buildings cached. Elevation model (30m DEM) for 100km inland buffer. Evacuation route pre-calculation: 100km × 100km tiles with pre-computed shortest elevation-gain paths.

Offline mode: use pre-computed hazard extent (no MOST solver), vertical evacuation routing only, constant 3 m/s wave speed assumption for ETA calculation. Battery mode: disable tide gauge polling, rely on PTWC bulletin timing. Low-data mode: text-based alerts only (no inundation raster).

### 11. Comms/UI

Inundation depth overlay (blue gradient, deeper shades for greater depth). Run-up projection line on map (white dashed line) with estimated elevation. Wave arrival time countdown timer: "Tsunami arrives 2:15 PM (ETA ± 10 min)". Current evacuation status: "URGENT - Evacuation in progress (45 min to safe zone)" vs. "READY - Evacuation advised (2 hours to safe zone)".

Building-specific shelter recommendation: building address + floors + capacity "SHELTER AVAILABLE: 3-story library (123 Main St), 500-person capacity, 3 min walk". Offline indicator: "Using pre-computed hazard model (updated 2026-03-01)". Siren status: "Official tsunami siren active at 0 dB (audible)" vs. "No siren detected, rely on phone alerts".

### 12. Sensor Input

Accelerometer earthquake detection (P-wave arrival acceleration > 0.1g), classify as tsunami trigger confirmation. Mobile app geolocation confirms coastal vs. inland (evacuation protocol differs). Barometric pressure sensor: rare but rapid pressure drop can indicate tsunami wave pressure pulse arrival (5-10 min after visible wave).

Water level sensor (if waterproof phone model): submersion depth indicates inundation progress. User manual reports: "Water at [ankle/knee/torso/head] height", confirm with timestamp/photo. Shelter status report: "Inside 4-story building, on 3rd floor, 12 others present" confirms vertical evacuation success. Network connectivity loss (cell tower inundation) triggers cached-model-only mode.

