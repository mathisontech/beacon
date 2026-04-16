## Flood Hazard Model

### 1. Risk Layer

National Water Model (NWM) v2.1 streamflow forecasts at 1km resolution + National Hydrography Dataset Plus (NHDPlus) reach delineation. Long-term flood risk from FEMA Flood Insurance Study (FIS) data: 100-year, 500-year zone boundaries vectorized into GeoJSON. Base Flood Elevation (BFE) assigned per river reach from NFHL (National Flood Hazard Layer) raster at 10m.

Hydrographic slope calculation: elevation_drop / reach_length determines flow velocity potential (Manning's n roughness from LiDAR-derived canopy + substrate classification). Impervious surface fraction from NLCD (30m resolution) adjusts runoff coefficient. Urban vs. rural Manning's n: urban = 0.05-0.08, vegetated = 0.08-0.15. Dam inventory (USACE NID database, 91,000+ dams) identifies exposure to dam-break scenarios within 50km radius.

Baseline risk score: (Q100 / channel_capacity) × (1 + dam_failure_probability) × (1 + urban_runoff_factor). Calculated monthly given seasonal discharge variations. Flash flood guidance zones from NOAA RFC (River Forecast Centers) flagged when QFF > Q2 predicted.

### 2. Ongoing Hazard Model

USGS StreamStats API (https://streamstats.usgs.gov/streamstatsservices/) provides real-time gauge observations for 7,600+ active stations. NWIS (National Water Information System) integration polls gage heights/discharge every 15 minutes. NWM retrospective + forecast ensemble (3/18-hour lead time) ingested from NOAA Geospatial Data Clearing House. RFC medium-range QPF (Quantitative Precipitation Forecast) 5-day horizon.

Nowcast layer: MRMS (Multi-Radar Multi-Sensor) precipitation at 1km/1min resolution from NOAA AWS. Flash flood guidance thresholds by basin (RFC provides county-level guidance). User reports of flooding via Beacon app: photo + GPS + "street_flood_depth_cm" crowdsourced. Historic flood inundation layer from USGS Flood Inundation Mapping Program (FIM) database.

### 3. Spread/Evolution Model

HEC-RAS (Hydrologic Engineering Center River Analysis System) 1D/2D hybrid hydraulic modeling. Manning equation: V = (1/n) × R^(2/3) × S^(1/2) where V = velocity, R = hydraulic radius, S = slope. 2D mesh grid (50m cell resolution typical) discretizes floodplain. Implicit finite difference solver with subcritical/supercritical transition detection.

HAND method (Height Above Nearest Drainage) rasterization: each pixel elevation - nearest_stream_elevation = susceptibility ranking. HAND < 2m = high flood susceptibility. Inundation modeling: water surface elevation propagated downstream with stage-discharge relationship (Manning curve per reach). Levee/berm inclusion via barrier geometry input.

Unsteady flow boundary conditions from NWM QPF + observed discharge. Manning's n spatial variation (digital elevation model derivation + satellite derived building/vegetation extraction). Peak stage arrival timing calculated by wave kinematic celerity = Q / (B × h). Backwater effects from confluences/constrictions computed iteratively.

Dam-break scenario: instantaneous/linear breach (USBR equations) generates initial flood wave. Breach parameters from dam height, material type (embankment = faster). Hydrograph attenuation downstream: Muskingum-Cunge routing (k = 0.5 × reach_length / velocity, x = 0.3 typical). Downstream stage rise acceleration factor = 2-5x normal flood rate.

### 4. Lethality Model

Drowning hazard: velocity × depth product determines hazard zone. FEMA depth-velocity criterion: 1.4 m^2/s = dangerous, > 2.0 m^2/s = lethal. Depth > 1.5m + velocity > 1.0 m/s = pedestrian lethal. Vehicle washout: 0.3m depth × 2 m/s velocity sufficient to float most cars. Structural failure threshold: hydrostatic + hydrodynamic force = (ρ × g × h^2 / 2) + (0.5 × ρ × v^2 × A). Force > 5000 N/m width → collapse risk.

Entrapment lethality: building water ingress rate = (breach_area × velocity). Time-to-safe_height = height_refuge / (inflow_rate / room_area). Hypothermia onset in 50°F water = 1-2 hours (relevant for winter floods). Contamination exposure: sewage/chemical influx from industrial zones (EPA facility database) creates secondary toxicity layer.

Debris impact lethality: projectile hazard from tree/building fragment transport. Fragment terminal velocity = sqrt(2 × g × h) at 2m drop height = 6.3 m/s impact. Probability of impact = debris_concentration × velocity × exposure_area.

### 5. Safe Zone Layer

Pre-mapped elevation refuges: hills > 2m above 100-year BFE. Multi-story structures with roof access (exclude basements). Flood-resistant structures (elevated first floor > BFE + 1ft freeboard). FEMA flood insurance database flags properties with elevated design status.

Dynamic safe zone calculation: HAND raster thresholded at predicted stage + 1.5m safety buffer. Intersection of forecast inundation extent with road network identifies elevated safe routes. Bridge deck elevation check: if bridge_deck_height > peak_stage + 1m, bridge passable. Temporal component: safe zone validity window tied to peak stage ETA. Once water recedes below safe threshold (recession rate = 0.1-0.3 m/hr typical), safe zone re-enabled.

Flood-resistant shelter identification: basement exclusion rule, generator/fuel pre-position confirmation. Shelters within predicted inundation zone require multi-story validation.

### 6. Evacuation Layer

Flood warning triggers: NWM forecast Q_peak > 10-year recurrence interval OR RFC flash flood guidance exceeded. Evacuation zone: predicted stage footprint + 1km buffer. Phased evacuation: outer zones (5-10km) on advisory, middle (2-5km) on watch, inner (0-2km) on warning (48/24/6 hour notice respectively).

Contra-flow routes: identify highway segments outside inundation extent, reverse lane direction. Elevation-gain routing: Dijkstra pathfinding penalizing downhill segments (avoid flowing water). Detour routes via HEC-RAS inundation extent boundary (route along watershed ridgeline if necessary).

Evacuation timing: time-to-safe = distance / average_speed - time_to_congestion. Congestion prediction from population density × roads_available (scaling factor 0.7 cars/household). Bottleneck identification: bridge capacity = lane_count × 1800 vehicles/hour/lane. Queuing delay = (demand - capacity) × average_delay_per_vehicle.

### 7. Vulnerability Layer

Dialysis centers, hospitals from CMS/state licensing databases. Assisted living facilities requiring vehicle evacuation (HUD/state data). Prison populations (incarcerated cannot self-evacuate; pre-coordinate with facility). Water-dependent populations (houseboats, RVs in floodplains). Basement dweller identification via rental property databases (Zillow/Redfin) + occupancy surveys.

Mobility-limited clustering: tracts with high % Medicare population (proxy for elderly). Assisted evacuation resource pre-positioning near vulnerable facility clusters. Floating rescue resource staging (boats, rafts) near high-water hazard zones.

### 8. Secondary Effects

Bridge scour risk: shear stress τ = ρ × g × R × S. Excess shear τ_excess = τ - τ_critical (0.05-0.1 Pa typical). Scour depth = 2.2 × (V / sqrt(g × D50)) × D50. Bridge closure threshold: depth_over_deck or scour_undermining_foundation. Road closure propagation: bridge out → entire route unavailable.

Sediment/debris dam formation at constrictions (railroad embankments, road fills). Backwater rise from dam = Q / (B × beta) where beta = 0.1-0.3 depending on sediment volume. Surge wave release if dam fails: magnitude = 0.5 × accumulated_water_volume / reach_length.

Contamination plume: sewage treatment plant inundation from NPDES permit database. Chemical facility overflow (EPA RMP database). Plume transport: Gaussian diffusion model with peak concentration = mass_released / (sqrt(4πkt)). Travel distance to 50% concentration = sqrt(4kt × ln(2)).

### 9. Operational Protocols

Event trigger: NWM stage forecast > 10-year level OR user reports from 3+ independent observers in 1km cluster. Hourly NWM ensemble ensemble update cycle; if 70% ensemble members exceed threshold, escalate event. Flood state progression: advisory → watch → warning → emergency (resource deployment triggers).

RFC coordination: NOAA RFC duty meteorologist contacted when NWM forecast indicates major flood potential. Data archival: hydrograph, inundation extent (GeoTIFF), stage time-series, user reports timestamped.

Dammed reservoir coordination: preemptive spillway release if flood surge predicted (coordinate with dam operator via USACE district office). Sandbag distribution from pre-positioned stockpile locations (county emergency management).

### 10. Caching/Offline

NHDPlus reach network (10km tile cached): reach geometry + Manning's n + slope. BFE raster (10km × 10km): 100/500 year extent. DEM (100m resolution, 10km extent). Predicted inundation extent (GeoTIFF) + shapefile from latest NWM run. Offline evacuation routes pre-cached (4 cardinal directions from each zone centroid).

Low-intensity mode: HAND-based flooding (no HEC-RAS simulation), constant 0.5 m/s velocity assumption, 6-hour recession time. Battery mode: disable MRMS updates, rely on NWM ensemble median (vs. full distribution).

### 11. Comms/UI

Water depth overlay on map (blue gradient, darker = deeper). Depth-velocity product hazard zones marked in red ("LETHAL" label). Peak stage ETA text display with arrival time window (e.g., "Peak water level 7:30 PM ± 30 min"). Current stage vs. safe height indicator: "Water at 4.2m, safe height 5.1m, margin = 0.9m (MARGINAL)".

Bridge passability status icon (green = safe, red = closed, yellow = monitor). Evacuation route ETA includes traffic congestion estimate. Offline-status warning when NWM data stale (>6 hours for non-flood events, >30 min during active flood).

### 12. Sensor Input

Water level proxy: phone proximity to water detected via humidity sensor if waterproof model. GPS drift analysis under bridge/levee indicates proximity. User manual reports: tap "water depth" UI input, select depth range (knee/torso/head height), confirm with photo. Acoustic signature: rushing water sound detected via microphone, proximity analysis via acoustic attenuation model.

Stranded vehicle detection: GPS stationary for >10min in predicted inundation zone + elevation below safe threshold = high rescue priority flag. Car flash flood warning: accelerometer-based tilt detection (vehicle buoyancy causes pitch change). Battery drain + location persistence in water zone = potential entrapment condition.

