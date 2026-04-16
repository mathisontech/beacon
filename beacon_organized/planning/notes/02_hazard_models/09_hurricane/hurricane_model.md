# Hurricane Hazard Model

## Risk Layer
NHC (National Hurricane Center) track forecast cone of uncertainty + intensity envelope. Grid-based risk scoring: probability of tropical-force winds (>39 mph) within 120-hour window, updated every 6 hours. Baseline: hazard layer combines track forecast (cone), intensity model (Saffir-Simpson escalation), historical track uncertainty (+/-km envelope). High-risk zones: within cone 12-72hr window, coastal counties. Grid 4km resolution matching NHC operational grid.

API: NHC Current Hurricane Tracks (https://www.nhc.noaa.gov/gis/), GIS data feed updated 0600/1200/1800/0000 UTC with 5-day track + cone. Storm-specific shapefile (track, cone, wind field extent).

## Ongoing Hazard Model
Track forecast: GFS (Global Forecast System, NOAA), HWRF (Hurricane Weather and Research Forecasting model), HMON (Hurricane Multi-scale Observation Model). Ensemble consensus: 3-model average position + intensity. Update cycle: every 6hr with 120hr lead time. Intensity model: Saffir-Simpson scale (1-5) with wind speed ranges (Cat 1: 74-95mph, Cat 5: >157mph).

Rapid intensification: flagged if intensity increase >35 kt/24hr (sea surface temp >26.5°C, low wind shear). Weakening: landfall-induced (-10 kt/6hr typical), outflow restriction (-5 kt/6hr).

Probability cone: radial uncertainty (km) increases with forecast hour: 12hr±50km, 72hr±150km, 120hr±200km. Hazard grid cell score = integral(track probability * intensity probability) over forecast window.

## Spread/Evolution
Wind field modeling: Holland parametric wind profile r_m = 55*(P0-Pc)^0.5 where Pc=minimum central pressure (mb), P0=ambient (1013mb). Wind speed V(r) = sqrt((Vmax²*r_m/r)*exp(1-r_m/r)) for radius r from center. Maximum sustainable wind (MSW) drives Category assignment.

Asymmetric wind: forward speed adds 0-30% to right-side winds (Northern Hemisphere). Wind field extent: tropical storm force (>39 mph) extends 100-300km from center (size-dependent). Evolution: rapid intensification phase (0-48hr), plateau (48-96hr), weakening (post-landfall).

Steering flow: beta drift (westward 10-20 kt), subtropical ridge interaction (recurvature timing). Spreading: circulation expands 0.5-1.0°lat/day post-landfall (dissipation via friction/land interaction).

## Lethality
Wind mortality: >100 mph exposure = ~2% direct, 8% indirect (debris impact, falls). Flying debris: roof debris >150 mph, window glass penetration >100 mph. Building failure: structural (frame collapse >140 mph), envelope (water intrusion, progressive failure cascade).

Storm surge mortality: 80-95% of hurricane deaths. Surge height h = 2.4*sqrt(pressure_deficit) + 0.02*wind_speed² (approximate). Surge velocity 8-15 ft/s, carries debris/vehicles. Compound flooding: surge (6-20 ft) + rainfall runoff (6-24 inches) = 12-40 ft total water level. Drowning is primary mechanism (70%), trauma secondary (30%).

Inland flooding: 500+ miles from coast possible. 24-72 hour rainfall 10-40 inches typical, rates 2-4 in/hr during peak. Flooding mortality increases 2-3x vs coastal surge zones. Wind + flood compound hazard multiplier 1.8x.

## Safe Zones
Safe from surge: >4m (13ft) elevation above mean high water, >2km inland from coast. Safe from wind: Category 1 structures rated 110 mph sustained, Category 5 structures (rare) rated >150+ mph. Inland safe: beyond 200km from track (wind <40 mph), elevation >500m reduces flood risk. Pre-positioned shelters: concrete structures, schools, community centers, located 30-100km inland upwind of forecast track.

Real-time safe zone validation: recomputed every 6hr post-NHC advisory. Shelter capacity cross-check: evacuation population vs available shelter bed capacity (constraint for mandatory phases). Safe zone persistence: valid only while track probability within that zone >40%.

## Evacuation
Evacuation trigger: NHC forecast cone intersects jurisdiction AND Category ≥1 within 48-72hr. Trigger matrix: Cat 1-2 (suggested evacuation, vulnerable populations mandatory), Cat 3+ (mandatory all). Evacuation window: 24-48hr (depends on forecast uncertainty).

Evacuation protocol: 1) identify population in risk zones (cone + county), 2) issue 48hr voluntary/24hr mandatory notice (emergency alert system + broadcast), 3) route traffic inland northward (away from recurvature), 4) pre-position shelters 100km+ inland, 5) real-time traffic monitoring (DOT feeds). Staging: vulnerable first (hospitals, nursing homes), then general population. Bottleneck: I-95 corridor typically saturates 200+ miles inland from storm.

## Vulnerability
Population exposure: coastal counties + flood zones. Vulnerability class: 1-Critical (storm surge zones <1m elevation, mobile homes, assisted living), 2-High (flood-prone inland <2km elevation, wood-frame homes), 3-Medium (older residential <1980 construction code), 4-Low (new construction >2013 FEMA standards, elevated homes). Multiplier: night (2.0x, sleeping), tourism season (1.5x coastal).

Infrastructure: power grid (pole damage, saltwater corrosion, 10+ day restoration typical), water systems (intake contamination, distribution breaks), roads (washout, debris, 1-4 week repair), hospitals (roof damage, backup power failure). Supply chain: fuel shortages (3-10 days recovery), food distribution (10-20 days).

## Secondary Effects
Tornadoes: 20-40% of hurricanes spawn 1-10 tornadoes. Primarily rainband tornadoes, weak (EF0-EF1), short-lived (<15min). Tornado zones: right-front quadrant 100km from center. Mortality: incremental 50-200 per major hurricane.

Tropical cyclone rip currents: coastal beach hazard, speeds 3-6 ft/sec, difficult to escape. Saltwater contamination: estuaries (coastal aquifers), agriculture (crop damage), naval vessels (corrosion). Erosion: 1-5m coastal retreat per major hurricane.

Infectious disease: contaminated water supplies, sewage overflow, vector proliferation (mosquitoes, 3-month post-event). Mental health impacts: 20-30% PTSD in severe impact zones (6-12 month duration).

## Operational Protocols
Tracking: NHC Automated Tropical Cyclone Forecast (ATCF) data feed (6-hourly), GFS/HWRF model output (NOAA NOMADS server), sea surface temp (GOES satellite thermal). Decision logic: IF (track cone probability >40% AND intensity ≥Cat1) THEN issue advisory. Ensemble consensus required: 2+ models must agree on intensity threshold.

Confidence thresholds: 70% required for watches (24-48hr), 85% for warnings (<24hr). Cross-validation: NHC official forecast vs Beacon model (trend monitoring, divergence alerts). Rapid intensification flagged if OHC (ocean heat content) >90 kJ/cm² + SST >26.5°C.

## Caching/Offline
Track forecast: GeoJSON polyline + cone polygon, size <5MB per advisory. Wind field: parametric model coefficients cached (size <1KB). Historical tracks: 10-year archive (15-30MB SQLite). Surge/flood lookup: pre-computed SLOSH grid (storm-specific). Offline: cache latest 3 advisories + 10-year climatology + pre-calculated surge levels per tide stage.

Update frequency: every 6hr (synchronized with NHC advisory cycle). Differential sync: new forecast polyline + cone only, ~200KB per cycle. Validation: NHC advisory timestamp cross-check. Stale flag: >12hr without update (hurricane tracking requires current data).

## Comms/UI
Map display: NHC track forecast cone (light fill, 5-day extent), intensity scale marker at 12/24/72/120hr points (color: green/yellow/orange/red per category). Wind field overlay: asymmetric extent (parametric model), tropical-force wind (>39 mph) zone highlighted. Storm surge inundation: pre-computed static polygon overlay (feet above mean high water).

Alert card: current storm name, category/wind speed, forecast track direction (bearing + mph movement), center pressure (mb), nearest land distance (km/hr to impact). Secondary: confidence level (%), NHC advisory timestamp.

Push alerts: 24-48hr before cone intersection with user location. Frequency: 1 alert per advisory cycle (6hr). Detail page: 5-day track forecast (animated timeline), intensity graph (wind speed projection), SLOSH surge level (feet, tide-stage dependent), rainfall forecast (QPF 10-day GFS, 1-2 inch/hr peak rates), evacuation route optimization (inland, northward bias).

## Sensor Input
Satellite: GOES-16/17 infrared band 13 (10.3µm, cloud-top temp 0.5km resolution, 15min refresh), GOES microwave (rain rate algorithm, ~4km), NOAA ASCAT scatterometer (surface wind, 12.5km, 6-12hr delay). Band 14 (11.2µm) for fog discrimination. Passive microwave: SSMIS (rain rate + water vapor, 15km).

Aircraft: NOAA Hurricane Hunters (WC-130J Hercules) dropsondes (GPS-equipped, 1km vertical resolution), flight-level wind/pressure (±0.3mb accuracy), center fix via GPS (<5km accuracy). Frequency: 6-12hr during active threat, coordinated with NHC.

Buoys: NOAA NDBC buoys (real-time sea state, 0.01m wave height precision). Sea surface temp: NOAA OI SST (0.25° grid, daily, 0.5°C precision).

API: NOAA NHC advisories (https://www.nhc.noaa.gov/xml/), GOES-R API (Google Cloud, AWS, 15-min latency), NOMADS GFS/HWRF model data. Integration latency: satellite 15-30min, aircraft 30min post-mission, advisory 30min post-official release, model output 4-6hr post-initialization.

Data quality: satellite cloud-top temp <0.5K uncertainty, aircraft position <10km accuracy, pressure reading <2mb precision, droplet velocity <0.5 m/s. Outlier detection: satellite wind spike validation against NHC fix (>10 kt deviation = flag).

## Multi-Hazard Compounding
Hurricane + storm surge + rainfall compound flooding: surge peak (6-20 ft) + 24-72hr rainfall (10-40in) = total inundation 12-40ft. Mortality multiplier: 2.5x vs. single hazard. Hurricane + tornado: 20-40% generate spinoffs, EF0-EF1 typical, concentrated right-front quadrant. Tornado lethality adds 50-200 deaths per major hurricane. Wildfire interaction: dry pre-storm conditions allow rapid post-hurricane fire spread (burn scar + wind). Storm surge + groundwater: saltwater intrusion into aquifers (recovery 1-5 years, agricultural impact).
