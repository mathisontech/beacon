## Wildfire Hazard Model

### 1. Risk Layer

Fuel moisture content from LANDFIRE fuel data (13 standard fuel models: 1hr, 10hr, 100hr, 1000hr timelag categories). Dead fuel moisture estimated via MERRA-2 solar radiation, NOAA RH/temperature grids at 4km resolution. Live fuel moisture from SMAP soil moisture + spectral vegetation indices (NDVI/GVMI). NFDRS Energy Release Component (ERC) percentiles from NOAA Storm Prediction Center integrated with drought indices (US Drought Monitor, Palmer Drought Severity Index).

Vegetation type classification via Landfire EVT raster (140 categories). Elevation/aspect from 10m DEM affects wind/temperature microclimate. Building density from OSM/local GIS overlays identifies wildland-urban interface (WUI) polygons. Insurance risk aggregates from Zillow (structure value) x structure density = property-at-risk layer.

Baseline risk score: (fuel_load × moisture_reduction_factor × vegetation_flammability) × (1 + wui_density_factor). Cached daily at 30m resolution within 100km of urban areas.

### 2. Ongoing Hazard Model

VIIRS 375m active fire detection (NASA FIRMS API endpoint: https://firms.modaps.eosdis.nasa.gov/api/area/csv) updated every 12 hours. MODIS 1km hotspots for continental scale. Thermal anomaly algorithm: radiance > 3 sigma above background + pixel temperature differential analysis. Confidence metadata indicates P(fire) = 0.8-1.0.

Fire perimeter ingestion from InciWeb (incident information system) via REST API polling 15-minute intervals. Perimeter vectorization into GeoJSON polygons with timestamp. WFIGS (Wildfire Incident Growth Simulation) daily growth forecasts for large incidents. Manual incident creation for unreported fires detected via thermal imagery.

Local fire sightings crowd-sourced via Beacon app (user reports with GPS/photo). Sighting confidence calculated from user history (firefighter/official flag), photo quality, spatial clustering. Historic fire layer (USGS GeoMAC, InciWeb archive) identifies repeat-burn zones.

**Fire Camera Network Integration:** Major fire risk regions use staffed fire lookout cameras (ALERTCalifornia, ALERTWildfire networks). Beacon ingests these feeds for early smoke detection. The same underlying CV model used for fire camera analysis also processes user-submitted photos — a single smoke/flame identification model trained across all lighting conditions (day, night, dawn/dusk, overcast, backlit) provides veracity scoring to user reports. Posts that contain CV-confirmed smoke or flame imagery receive higher confidence weighting in the sighting aggregation pipeline. This CV model is shared with the street-level perception module (Section 3.5) so both benefit from the same training investment.

### 2b. Arson Detection Module

**High Arson Risk Detector:** Flags fires with suspicious ignition characteristics. Inputs: ignition point location, nearby infrastructure, weather conditions, existing risk layers. High-arson-risk indicators:
- No power lines in vicinity (rules out electrical ignition)
- No lightning detected in preceding 24 hours (rules out natural cause)
- No camping areas or campfire-permitted zones nearby
- Fire started near or at the residential-to-woodland transition line, especially at the predicted crossover point where fire would spread most efficiently from wildland into residential areas
- Fire started perfectly upwind of the crossover point (intentional positioning for maximum spread)

The system already maintains a layer showing the most likely crossover points accounting for wind direction. If a fire STARTS AT a crossover point (rather than starting in woods and eventually crossing over), the admin side receives an arson flag with confidence score.

**EMS Response to Sightings:** When EMS receives notification of a fire sighting, they can geofence the area and push a request to nearby users asking them to report what they see at that location. The request specifically asks users to include photos of people in the area — if arson is later suspected, these crowd-sourced photos become evidence. This integrates with the EMS Help Manager (Section 10.5) public assistance request system.

### 3. Spread/Evolution Model

**Wildland/Residential Fire Spread Model:** The spread model must handle the transition between wildland and residential environments as a continuous system, not two separate models. The residential-to-woodland transition line is a precomputed layer in the base map. Fire behavior changes fundamentally at this boundary: wildland fire spreads through vegetation fuel beds at rates governed by Rothermel; once it reaches structures, spread behavior shifts to structure-to-structure ignition governed by radiant heat distance, ember shower density, and building material flammability. The model treats the crossover zone as a special regime where both wildland and structural fire physics run simultaneously. The crossover point layer (precomputed per wind direction from 8 cardinal directions) identifies where fire is most likely to jump from wildland into residential areas, and these points are also inputs to the arson detection module (Section 2b).

Rothermel fire spread model (Anderson 1983) physics engine: Fireline intensity = (R × Heff × epsilon × etaS) / 60 where R = reaction intensity (fuel dependent), Heff = net heating value, epsilon = combustion efficiency, etaS = fuel surface area-to-volume ratio. Wind reduction factor via Albini correction (max speed threshold 40 mph typical). Slope factor (uphill acceleration = exp(3.533 × tan(slope°))).

FARSITE extension: quasi-steady fire growth with vector fire line representation. Perimeter expansion rate = R × t^0.5 (elliptical growth pattern). Major/minor axis ellipse from max_speed/crosswind_ratio. Landscape rasterization at 30m resolution for computation feasibility; output polygon perimeter vertices at 60-second intervals.

FlamMap crowning model: crown fire initiation when Byram intensity > 4000 kW/m (critical threshold varies by forest type). Transition to passive/active crowning based on Rothermel crown fire rate. Spotting ember transport: embers travel distance = base_distance + wind_augment × gust_speed. Spot fire generation probability from spot_count distribution within 2km downwind radius.

Burn-together group detection: k-means clustering on building locations (input k=5-10 per region, adjusted for density). Distance threshold = 30m + structure_height. If fire_reach_probability > 0.7 for cluster center, label entire group "burn_together=1". Recalculated server-side every 15 minutes with current wind.

### 4. Lethality Model

Heat lethality: radiant heat dose integral over exposure time. Thermal pain threshold = 44°C skin contact; lethal dose = 50°C × 10 seconds or 70°C × 1 second. FDS (Fire Dynamics Simulator) output interpretation for heat layer projections to 250m radius from fire perimeter.

Smoke inhalation lethality: CO/CO2/HCN production rates from fuel type databases. Incapacitation threshold = FED (Fractional Effective Dose) > 1.0. Visibility reduction model: optical density τ = 1.8 × soot_concentration. Lethal visibility = < 10m horizontal range. Oxygen depletion model from smoke layer height and enclosure volume (relevant for structure-based evacuation scenarios).

Burn injury probability per body exposure: contact burn > 5 sec at >55°C = severe/lethal. Radiant exposure = 5 kW/m^2 for 60sec = deep burn pain onset. Combined mortality risk = composite of heat + smoke + burn injuries scaled by escape time available.

### 5. Safe Zone Layer

Base map safe zones: firebreaks (cleared strips > 50m width), water bodies > 500m^2, constructed defensible space (cal-fire standards), roads with water access. Storm-resistant structures (concrete/steel) scored via structure database lookup (Zillow/assessor data). Recent burn zones mapped with cooling progression: T_0 (peak burn temp) → ambient in 3-5 hours (validated against MODIS brightness temperatures).

Dynamic safe zone recalculation with active fire model: perimeter + 500m buffer = evacuation zone. Intersection of evacuation buffer with forward spread projection identifies safe zones on lateral flanks. Access check: safe zone only valid if road connectivity exists and fire hasn't cut off access route. Pre-computed accessibility graph updated every 30 minutes.

### 6. Evacuation Layer

Evacuation trigger: fire perimeter within 5km AND forward spread model projects entry into 10km zone within 4 hours. Evacuation zones (0-2km urgent, 2-5km ready, 5-10km level 0 advisory) calculated from fire location. Route pathfinding via OSRM (Open Source Routing Machine) avoiding fire perimeter buffer. Dynamic re-routing if fire crosses evacuation route.

Safe zone destination scoring: distance × (1 - structure_density) × accessibility. Multi-objective optimization: minimize time to safety + minimize casualty exposure + avoid congestion zones. Carpool matching via spatial-temporal proximity. Last-resort designated zones (marked emergency shelters) visible only to EMS accounts.

### 7. Vulnerability Layer

Nursing homes/hospitals/schools identified via state health databases (NPI/HIN numbers). Population density estimates from census blocks. Single-vehicle households from vehicle registration databases (proxy for low-income/mobility-limited). Vulnerable populations self-report or are reported by contacts. Elderly-only households (property tax records indicate occupant age).

Vulnerability score per structure = Σ (risk_factor_i × weight_i). Mobility-limited individuals: require assisted evacuation, pre-positioned resources. Hospital patients: medical equipment dependency, oxygen supply constraints. Incarcerated populations: pre-coordinate with facility management on evacuation procedures.

### 8. Secondary Effects

Tree fall model: diameter threshold = 20cm, lean angle threshold = 20°, wind speed threshold = 35 mph. Spatial buffer = 1.5 × tree_height from trunk. Probability = wind_ratio^3 × dead_wood_fraction. Road blockage identification: fallen tree × road intersection = route unavailable.

Power outage detection: fire perimeter intersection with utility transmission lines (OpenStreetMap power data). Transformer-level outage prediction from fire-line proximity + wind-driven ember risk. Communication tower loss: radio dead zone polygons expanding as towers fail.

Smoke impacts on traffic: visibility < 100m triggers accident risk multiplier = 3x. Air quality impacts: smoke plumes shift with wind. Fine particulate layer (PM2.5) calculated from fire size × distance × atmospheric stability (Pasquill-Gifford diffusion model).

### 9. Operational Protocols

Event activation threshold: VIIRS confirmed active fire + perimeter data from official source OR Beacon user sightings from 5+ independent observers within 500m cluster. Data recording: thermal imagery, perimeter GeoJSON, spread predictions, user reports (with timestamps/GPS accuracy) logged to incident database.

Regional default layers: high-risk zones automatically show oxygen depletion layer, heat exposure layer, smoke projection. County-specific incident management protocols integrated (handoff between state/federal resources). Pre-incident resource positioning: identify vulnerable facilities needing evacuation hours in advance.

### 10. Caching/Offline

Cache resident fire perimeter (100km radius) at 30m raster + GeoJSON vectors. LANDFIRE fuel data tile-cached (10km × 10km). DEM/aspect slopes precomputed. Rothermel coefficients lookup tables (fuel model → spread rate) 50kb. User evacuation routes cached with timestamp freshness checks every 1 hour.

Low-intensity offline mode: simplified Rothermel (constant wind assumption), no FARSITE perimeter updates, straight-line evacuation paths. Battery mode: disable real-time VIIRS polling, rely on cached perimeter + offline spread prediction.

### 11. Comms/UI

Flame sighting reminder in evacuation UI: "Did you see flames not on map? Mark them." Mandatory acknowledge banner: "Use at your own risk" swipe-to-dismiss. Vehicle icons on map showing occupant count + vehicle type (firetruck/ambulance/personal). Burn-together group highlighting on map (red outline clusters). Danger rating projection text: "If you leave in 5 minutes, danger rating = HIGH; 15 minutes = CRITICAL."

Time-to-safe-zone ETA display with evacuation route geometry. Offline-status indicator when perimeter data stale (> 30 min old). Backup comm channel recommendation when cell loss predicted.

### 12. Sensor Input

Phone accelerometer detects building collapse (rapid acceleration drop + vibration signature). Ambient light sensor + accelerometer combination detects flame proximity (rapid IR intensity + vibration). Microphone background analysis for cracking sounds (structural failure indicator, used with caution).

GPS drift analysis: user stationary in moving fire = heat-incapacitated. Battery drain rate anomaly: normal drain 2%/hr becomes 5%+/hr if phone exposed to heat source (> 35°C sustained). Integration with user input: confirm phone location via manual map tap, accumulate sighting history per user account to weight future reports.

