# Avalanche Hazard Model

## Risk Layer
Probabilistic hazard map from Swiss SLF SNOWPACK integration. Grid cells (50m) scored 1-5 based weak layer detection. High-risk zones: terrain angles 30-45°, active slopes > 0.4 hectares. Data: daily SNOWPACK runs at 07:00 UTC.

API: SLF Bulletin API (https://www.slf.ch/en/) returns avalanche problem types, danger level (1-5), altitude bands (treeline transition zones).

## Ongoing Hazard Model
SNOWPACK multi-layer energy balance: density evolution, liquid water content, weak layer identification via shear strength reduction. Persistent weak layer signature: faceted grain depth hoar <15cm from surface, high-frequency rebound below 100kg/m². Update frequency: 6-hourly synced with SLF CAIC UAC advisory feeds.

Danger levels: 1-Low (isolated), 2-Moderate (careful terrain selection), 3-Considerable (specific slopes unsafe), 4-High (many slopes), 5-Extreme (all slopes avalanche terrain).

## Spread/Evolution
Slab release modeled via slope stiffness, trigger probability Poisson process with underlying weak layer stability. Terrain trap analysis: concave slopes, gullies, ridge terrain. Evolution probability increases 0.8x per adjacent steep slope meeting angle criterion (>30°). Spatial adjacency: 8-connected grid cells.

RAMMS runout model inputs: slab depth (measured cm), release volume (m³), friction coefficient. Output: runout distance (m), flow velocity (m/s), max deposition depth (m). Update triggers: new persistent weak layers, temperature swing >5°C/6hr, wind loading >20kg/m²/hr.

## Lethality
Burial survival curves via avalanche rescue research:
- 15min burial: 92% survival (compression asphyxia rare)
- 35min burial: 30% survival (asphyxia onset)
- 1hr+: <10% survival

Secondary mortality factors: trauma (60% of deaths), asphyxiation (30%), hypothermia (10%). Lethality multiplier: 1.0 (unburied), 2.5 (buried <15min), 7.0 (buried >35min). Depth-death correlation: >2m burial depth +3.0x mortality risk.

## Safe Zones
Terrain classification: non-avalanche terrain (flat <20°), avalanche terrain (20-29°), definite avalanche terrain (>30°). Safe zones require elevation below historical runout maximum (via RAMMS 100-year scenario). Buffer: +200m conservative margin. Safe zone persistence: recalculated daily post-advisory update.

Refuge structures: certified avalanche terrain shelters, buildings >100m from slope base, ridge locations above starting zone altitude. Real-time safe zone validation: no active danger level 4+ within 500m.

## Evacuation
Evacuation trigger: DAY4 forecasted danger level ≥4, or active advisory level ≥4 within 48hr window. Trigger: CAIC/UAC danger level ≥3 combined with slope-specific elevation band match.

Evacuation protocol: 1) identify residents/facilities in <500m buffer, 2) issue 2hr notice (text/push), 3) direct to pre-planned safe zones, 4) validate departure via GPS ping confirmations. Evacuation zones: 500m slope buffer + 2x RAMMS runout distance.

## Vulnerability
Population exposure: resident count within risk grid cells. Vulnerability class: 1-Critical (lodges, ski resorts, permanent structures in terrain traps), 2-High (seasonal cabins within 300m runout), 3-Medium (communities 300-500m from slope), 4-Low (>500m distance). Multiplier: night (2.0x, sleeping), day (1.5x, tourism), business hours (1.0x).

Infrastructure vulnerability: roads (transportation cut), power lines (cascade failure), water infrastructure (snowload damage). Road closure trigger: danger ≥3 + slope terrain within 100m road width.

## Secondary Effects
Dust clouds: visibility <10m, respiratory hazard (volcanic ash composition). Airborne debris: rock fragmentation, tree projectiles (>50m flight). Ground shaking: negligible for avalanche. Acoustic waves: avalanche roar reaches 100dB+, audible >5km, structural resonance low risk.

Avalanche-induced icequakes: rare, minor tsunami risk in glacial lakes. Hydrologic impact: snowmelt acceleration +5-15% post-large event. Post-event: increased rockfall risk 48-72hr (destabilized slopes).

## Operational Protocols
Observation stations: pit digging (manual), snowboard tests, hand shear tests. Remote sensing: satellite slope stability indicators via InSAR (monthly SENTINEL-1). Daily trigger: automated SNOWPACK output + manual observation correlation (0.85 Spearman correlation required).

Decision logic: IF (danger ≥3 AND elevation band matches AND slope aspect matches) THEN issue advisory + risk layer update. Confidence thresholds: 70% required for danger ≥4 escalation.

## Caching/Offline
Hazard maps: GeoTIFF format 50m resolution, cached hourly post-update. Size: 12-18MB per region. Offline index: SQLite with pre-computed RAMMS runout polygons. Update sync: low-bandwidth differential encoding (changed cells only), fallback to hourly diff schedule when offline >6hr.

Backup data: previous 7-day hazard grids cached. Validation: checksum verification (SHA-256) per update batch. Stale data flag after 24hr without network (red-flag UI notification).

## Comms/UI
Map display: base avalanche danger level (color scale: green/yellow/orange/red/maroon), terrain overlay (30°+ slopes highlighted), wind direction arrows (aspect loading). Alert card: current advisory summary, elevation band at risk, recommended actions.

Push alerts: trigger only danger ≥3 + proximity <5km to user location. Frequency cap: 1 alert/4hr per hazard. Detail page: SNOWPACK layer diagram, recent observations, RAMMS runout zone, evacuation shelter directions (map + distance).

## Sensor Input
Avalanche detection: seismic stations (USGS network, 100Hz sampling, M>-2 magnitude threshold), acoustic infrasound (0.1-10Hz band-pass filter), pressure sensors at runout zones (dynamic 0-100 kPa range). Slope instrumentation: snowpack height (ultrasonic ±2cm precision), density (cosmic ray neutron sensor, 0.05m-depth profile), temperature (PT100 thermistor chain, 0.1°C resolution, 1m spacing). Wind data: ASOS station nearest slope (10m elevation wind gust, 1-minute sustained average).

Integration: raw sensor streams pushed to SNOWPACK model ingest queue. Latency: <5min from sensor to map update. Data quality: outlier detection (IQR method, whiskers 1.5x), missing value interpolation (kriging for spatial gaps, exponential variogram). Calibration: annual pit comparison within 10cm of snowpack height sensors, annual density verification sampling.

## Spatial Analysis
Grid aggregation: Thiessen polygons for interpolating station-sparse regions. Terrain curvature adjustment: add 15% weight to convex slopes (concave 0.85x), slope angle coupling via sine transformation (steeper increases susceptibility 1.05x per 5° above 30°). Aspect bias correction: lee slopes accumulate wind-loaded snow (+25% density, +20% persistent weak layer probability). Multi-scale harmonization: 50m hazard grid fed from 100m SNOWPACK output via cubic spline interpolation.

## Feedback Loops
Avalanche release depressurizes weak layers (transient effect, +0.1 lethality multiplier next 24hr for cascades). Terrain smoothing: slab erosion removes 5-15cm surface roughness. Warm-up cycles: daytime solar forcing (1.5-3°C surface gain) accelerates isothermal conditions (weak layer threshold -10°C). Precipitation phase: rain-on-snow (>0°C) indexes trigger +1.0 lethality multiplier (saturated basal layer sliding).

## Model Validation
Hindcast accuracy: SNOWPACK vs. SLF pit observations (skill score 0.72 over 1000+ pits, bias -0.1 danger levels). False negative rate: 8% (missed avalanches), false positive rate: 15% (no avalanche occurred). Temporal error: lead-time skill degrades 0.05 skill points per 12hr forecast horizon (30-36hr limit).

Runout model RAMMS cross-validation: 50+ documented Swiss avalanches, mean absolute error 180m in runout distance, overprediction 12% average (conservative safety margin). Burial survival curve validation: 300+ rescue dataset correlation (R²=0.91 with burial depth + time interaction).

## Multi-Hazard Interaction
Avalanche triggers debris flows (saturated basal + impact energy). Debris flow lethality multiplier if preceded by avalanche: 1.5x. Lahar flow interaction: volcanic ash reduces snowpack stability (friction reduction 0.8x). Temperature feedback: volcanic SO2 absorbs infrared (radiative forcing effect, negligible <10km distance). Wind-load avalanche coupling: hurricane-force wind (>100 mph) increases slope slab loading 30%, probability multiplier 1.4x.

## Terrain-Based Hazard Refinement
Aspect bias: north-facing slopes store weak layers longer (slower isothermal), south-facing accelerate warming (+0.2 lethality/day April-June). Elevation bands: treeline (2000-3000m) acts as speed brake (trees reduce flow 0.6x), above treeline acceleration normal. Terrain roughness: forests reduce avalanche speed 40-60%, hazard extent shortened 25%. Valley confinement: narrow valleys (width <200m) constrain flow direction, broader valleys allow spreading (cell adjacency increase 2x). Slope convexity amplifies shear stress (convex slopes +0.15 slip probability), concave slopes -0.1 (stress redistribution).
