# Landslide Hazard Model

## Risk Layer
USGS landslide susceptibility mapping (10m DEM-based): logistic regression integrating slope angle, aspect, curvature, soil type, precipitation. Hazard scores 1-5 from susceptibility probability (1=<10%, 5=>70%). High-risk zones: slopes >30°, recent burn scars, road cuts, stream-adjacent cliffs. Grid 30m resolution. Data source: USGS Geological Hazards Science Center susceptibility layer (gis.usgs.gov/arcgis).

API: USGS Landslide Hazards Program data portal returns pre-computed susceptibility rasters, updated post-major fire events.

## Ongoing Hazard Model
Triggering thresholds via rainfall intensity-duration curves. Empirical relationships: shallow (<2m) landslides trigger at 20-40mm/6hr, deep slides (2-10m) at 60-150mm/24hr. Antecedent moisture condition (AMC) adjustment: wet season +30% susceptibility, dry season -20%. Soil saturation modeled via Green-Ampt infiltration: f(t) = Fc + (F0-Fc)*exp(-kt) where Fc=final infiltration capacity, k=decay constant (soil-dependent 0.01-0.1/hr).

Newmark displacement analysis: critical acceleration threshold ac = g*tan(phi)*sin(theta), where phi=friction angle, theta=slope angle. Displacement integration: u = integral(max(0, a-ac))²dt, threshold ~10cm triggers instability. Update frequency: hourly rainfall + soil moisture data.

## Spread/Evolution
Debris flow evolution: loose material mobilization triggers motion down-slope valley paths. Spreading: 8-connected grid adjacency, spreading probability increases with slope angle >25°. Flow accumulation from high-elevation sources, velocity profile: initial velocity v0 = sqrt(2*g*h*sin(theta)) where h=debris depth, theta=slope angle.

Debris travel distance: empirical (angle of repose method) D = h/tan(phi_r), friction angle phi_r = 35° typical. Extent expansion: 2.0x per doubling of debris volume. Evolution probability increases 0.15x per 10mm precipitation spike. Clustering: adjacent cells with >50% susceptibility trigger multi-slide complexes.

Post-fire debris flow evolution: burn severity increases erodible material 5-20x, mobility 2-3x. Runout distance extends 20-40% beyond unburned baseline.

## Lethality
Burial probability: landslide depth 2-10m typical, mortality 40-80% if buried >0.5m (trauma, suffocation, crushing). Small debris flows (<1m): 5-15% mortality. Large slides (>10m): 80-100% impact mortality for unprotected structures. Debris composition: rocks (boulder trauma), soil (compaction asphyxia), water (drowning component if saturated).

Slide velocity impact: >10 m/s = 100% mortality on exposed structures. 5-10 m/s = 70% mortality, <5 m/s = 20% mortality. Injury mechanism: blunt force (boulders), burial depth/asphyxiation, entombment in buildings.

Secondary hazard: damming valley creates upstream flooding, spillway breach creates secondary debris flow 50km downstream. Mortality multiplier: landslide + flood scenario 2.5x (compound damage).

## Safe Zones
Slide-free terrain: slopes <15°, stable ridge locations, >100m lateral distance from slope base. Debris flow safe: >50m elevation above channel, or >200m lateral distance to flow accumulation path. Ridge-top communities safe from valley slides, moderate risk from ridge-parallel failures.

Real-time safe zone validation: triggers on rainfall threshold exceeded. Pre-positioned safe zones: emergency shelter zones identified upslope, away from gullies, on competent bedrock. Validation: structural engineering review for slide resistance (factor of safety >1.5 minimum). Distance buffer: +300m conservative margin for run-up/splash zone.

## Evacuation
Evacuation trigger: rainfall threshold exceeded (20mm/6hr for shallow slopes, 60mm/24hr for deep) AND susceptibility >3. Secondary trigger: Newmark displacement >5cm cumulative. Evacuation window: 2-6 hours (rainfall-triggered), 12-24 hours (seasonal wet period alert).

Evacuation protocol: 1) identify residents/structures in >3 susceptibility zones within valley drainage paths, 2) issue 6hr advance notice (alert + SMS), 3) pre-position shelters upslope, 4) real-time tracking via mobile app. Phased: voluntary 6hr prior, mandatory 2hr prior to threshold. Route validation: avoid valley channels, use ridge/upslope paths.

## Vulnerability
Population exposure: census tract overlay on susceptibility grid. Vulnerability class: 1-Critical (valley-floor homes, <100m from drainage), 2-High (slope-adjacent homes 100-300m), 3-Medium (distant communities 300-1000m), 4-Low (>1000m or flat terrain). Multiplier: night (1.8x, sleeping), wet season (2.0x).

Infrastructure: roads (valley washout, 3-12 month repair), bridges (debris impact), water systems (intake burial), power lines (rock debris contact). Lifelines: single road valley communities vulnerable to isolation. Post-fire infrastructure doubly at risk (fire damage + debris flow).

## Secondary Effects
Valley damming: debris dams tributary valleys, impounds water 10-100m depth. Failure mechanism: spillway erosion, piping, uplift pressure. Failure probability: 0.2-0.5/year per dam. Outburst hydrograph: 3-5x normal discharge, can travel 50+ km downstream.

Dust clouds: visibility <100m in active debris flow zone, PM10/PM2.5 spike. Air shaking: debris impact/collision acoustics. Water bodies: landslide-induced tsunami in reservoirs (rare, <5m waves typical).

Groundwater disruption: aquifer recharge interrupted 1-5 years post-major slide. Tree throw: >20% slope failures cause forest destabilization, secondary debris loading.

## Operational Protocols
Monitoring: USGS rainfall data (NOAA NWS API, 1hr resolution), soil moisture (NRCS SNOTEL, SMAP satellite), slope stability indices. Real-time trigger: IF (rainfall threshold exceeded AND susceptibility >3) THEN escalate alert. Confidence: 60% required for mandatory evacuation trigger (conservative due to false alarm cost).

Field observations: manual visual surveys post-event (cracks, seepage, tilted trees). Instrumentation: tiltmeters, piezometers at critical sites (updated quarterly). Decision logic: rainfall + antecedent moisture + field confirmation (2-person rule for evacuations).

## Caching/Offline
Susceptibility raster: GeoTIFF 30m resolution, 50-200MB per region. Cache: hourly differential updates. Newmark displacement lookup table: pre-computed for slope angle bins (5° increments). Debris flow routing: flow accumulation DEM cached locally.

Offline capability: store baseline susceptibility + 7-day rainfall history + Newmark thresholds. Update sync: rainfall updates every 1hr (critical), susceptibility changes quarterly (or post-fire). Validation: checksum per layer. Stale flag: >24hr without update for rainfall data (warning notification).

Differential encoding: rainfall-triggered updates <1MB (new cells only), full raster refresh monthly.

## Comms/UI
Map display: susceptibility heat map (gradient 1-5), rainfall intensity overlay (mm/6hr scale), debris flow path overlays (arrows showing downslope direction). Alert card: current rainfall total (mm), threshold status, Newmark displacement status (cm if >critical), affected neighborhoods count.

Push alerts: trigger rainfall threshold exceeded + susceptibility match (severity combo). Frequency cap: 1 alert/6hr. Detail page: susceptibility explanation (soil type, slope combo), rainfall trend (24hr hyetograph), evacuation shelter directions (map/turn-by-turn), emergency contact list. Sensor status: last rainfall gauge reading timestamp, soil moisture value.

Real-time graph: cumulative rainfall (vs threshold), Newmark displacement trend, antecedent moisture index (30-day).

## Sensor Input
Rainfall: USGS Streamflow and Precipitation Data (WATERDATA API, https://waterdata.usgs.gov/nwis), NOAA NWS (next-gen radar mosaics 1km/5min, 0.1mm min detectable). Soil moisture: SMAP satellite (L3, 36km, daily, 0.04 m³/m³ precision), NRCS SNOTEL stations (hourly, 6-state coverage, TDR probes), SCAN network (50-state, sub-hourly, 10 depth levels). API: NOAA OpenDAP, USDA NRCS FTP.

Slope instrumentation: tiltmeters (2x per critical slope, 0.01° precision, 1Hz sampling), piezometers (groundwater pressure, sub-meter intervals, 0.1 kPa resolution). Crack monitors: non-contact laser displacement (mm resolution, <10cm range). Seismic: acceleration sensors detect slide initiation (threshold >0.1g, frequency 1-100Hz bandpass). Telemetry: cell modem + satellite backup (latency <60sec).

Integration latency: rainfall <15min, satellite soil moisture 24hr delay, in-situ sensors <5min. Data quality: spatial kriging for gauge gaps (exponential variogram, nugget 0.2), outlier detection (IQR whiskers 3.0x for extremes), saturation check (soil moisture >0.45 m³/m³ = saturation). Model calibration: annual site survey, tiltmeter zero-check, piezometer barometric pressure correction.

## Model Validation
Susceptibility ROC analysis: USGS mapping AUC=0.81 across 500+ global regions. Newmark displacement validation: 200+ paleoseismic sites, critical displacement threshold 10cm correlates 0.68 with historical damage (bias: 15% under-predict mobilization). Rainfall-triggered hindcast: 90% detection rate at 20mm/6hr threshold (eastern US), false positive rate 12%.

Debris flow runout empirical: angle-of-repose formula error ±25% on 100+ documented events. Post-fire mobility multiplier (2-3x) calibrated on 50+ burn events (2015-2023 southwest US). Seasonal calibration: antecedent moisture seasonal index (AMI) varies 0.6-1.4x depending month (wet spring vs. dry autumn).

## Multi-Hazard Compounding
Landslide + flood: damming valve creates upstream impoundment (10-100m), spillway failure generates secondary flow 50+ km downstream. Mortality multiplier: 3.0x flood impact vs. initial slide. Landslide + earthquake: coseismic + post-seismic loading cascades (weeks-months). Newmark displacement + rainfall saturation index combines multiplicatively (threshold reduction 0.6x). Wildfire + landslide: burn scar hydrophobicity (infiltration -80%), debris load +500%, mobility +300%. Post-fire debris flow travel distance 2-4x longer than historical.

Avalanche + landslide clustering: high-elevation terrain failure triggers slope-wide instability. Debris interaction: entrained rock + snow creates slurry (density 1.8-2.0 g/cm³), lethality 2.5x vs. snow alone. Hurricane/tropical cyclone + landslide: extreme rainfall (10-40 in/24hr) saturates slopes, frequency multiplier 5-8x peak event. Typhoon-season landslides dominate annual volume (70-90%) in Asia-Pacific region.
