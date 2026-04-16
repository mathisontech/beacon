# Volcano Hazard Model

## Risk Layer
USGS VDAP geospatial hazard assessment: volcanic hazard zones 1-4 (very high risk lahar corridors, pyroclastic flow exposed). CVO (Cascades Volcano Observatory) multi-hazard polygons: lava flow (1km/day typical), lahars (60km/hr+ velocity), pyroclastic flows (100km/hr+). Grid scoring 1-5 cross-references USGS Volcano Disaster Assistance Program shapefile inventory (updated per volcano status change).

API: USGS Volcano Disaster Assistance Program Data Portal (https://volcanoes.usgs.gov/volcanic-rocks/) provides volcano-specific hazard maps. Hazard zone polygons ingested as GeoJSON layers.

## Ongoing Hazard Model
Monitoring baseline: seismic energy (USGS Earthquake Hazards Program API, magnitude threshold 0.5+), deformation (InSAR SENTINEL-1 coherence change >2cm/month), gas emissions (SO2 flux via TROPOMI satellite, threshold >100 tonnes/day). Alert level escalation matrix:

Normal: seismicity baseline, no deformation, SO2 nominal.
Advisory: elevated microseismicity (5+ events/day, M<2), <1cm deformation, SO2 50-100 t/day.
Watch: increased seismic swarms (20+ events/hr, M1-2), 1-5cm deformation, SO2 100-500 t/day, thermal anomaly detection.
Warning: M>2 earthquakes, >5cm deformation, SO2 >500 t/day, visible steam/ash column.

Update frequency: real-time seismic/deformation feeds, daily SO2 satellite pass.

## Spread/Evolution
Lahar progression via LAHARZ empirical model: valley-floor deposition area scales with volcano peak elevation (H) and runout distance. Lahar velocity profile: initial 15-40 m/s (proximal), decay to 2-5 m/s (distal >50km). Flow height attenuation: h(x) = h0 * exp(-0.02*x) where x=distance downstream (km).

Pyroclastic flow advance: radial spread from summit vent, velocity 50-150 m/s, temperature 200-800°C. Modeled as circular expanding zone, 1.5km radius per minute (early phase), slowing to <0.5km/min beyond 10km. Evolution triggers: seismic swarm escalation, SO2 spike >1000 t/day, thermal anomaly pixel growth rate >5%/hr.

## Lethality
Lahar burial: mortality 8-12% per meter depth (higher than avalanche due to rock/debris trauma). Temperature: 10°C above ambient typical, lethal if >50°C. Asphyxiation time: 2-5min (lahar density 1.6-2.0 g/cm³). Injury mechanism: blunt force (boulders), burial, drowning in flow.

Pyroclastic flow: 100% mortality within 2km proximal zone (temperature >300°C, velocity >30 m/s). Mortality gradient: 80% at 3km, 20% at 5km, <5% beyond 8km. Thermal injury threshold: >60°C exposure 30sec = 3rd degree burns.

Lahars + floods: compound hazard, velocity amplification 1.3-1.8x, reach 60-80km downstream (major river valleys). Damage multiplier 2.0 vs lahar alone.

## Safe Zones
Pyroclastic flow safe: >8km lateral distance from central vent, behind ridge barriers >500m elevation gain, or valley-confined areas >200m above valley floor. Lahar safe: >300m elevation above channel (empirical historical margin). River evacuation: upstream of known lahar source valleys critical. Ridge-top communities generally safe from lahars, moderate risk for pyroclastic (thermal radiation).

Real-time safe zone validation: <500m proximity to Alert level Watch/Warning triggers re-computation. Pre-positioned safe zones: emergency shelters 15-30km from volcano, built to withstand ash/thermal load.

## Evacuation
Evacuation trigger: Watch alert + lahar runout zone intersection, OR Warning alert (all exposed zones). Evacuation window: 30min (lahar-prone valleys), 10min (pyroclastic-prone ridge slopes). Trigger protocol: escalate alert → activate reverse 911 (SMS/phone), mobile alert push, siren if installed.

Evacuation protocol: 1) identify residents/facilities in hazard zone polygons, 2) issue staged alerts (30min/10min), 3) direct upslope (lahar) or away from vent (pyroclastic), 4) track mobile pings. Constraint: road capacity may limit evacuation <population at risk, trigger mandatory vs voluntary phases.

## Vulnerability
Population exposure: census blocks overlapped with hazard polygons. Vulnerability class: 1-Critical (lahar valley communities <20km, pyroclastic <5km), 2-High (lahar 20-50km, pyroclastic 5-10km), 3-Medium (lahar 50-100km, pyroclastic 10-20km), 4-Low (>100km lahar, >20km pyroclastic). Multiplier: night (2.0x), day/tourism (1.5x).

Infrastructure: water supplies (lahars contaminate with ash/sediment, require filtration), roads (burial/washout), power (ash-induced insulators fail, SO2 corrosion). Agricultural land impact: tephra deposition >10cm destroys crops.

## Secondary Effects
Ash fall: visibility <10m, respiratory irritation (PM2.5 spike 50-500 µg/m³), aviation hazard (engine damage). Ash dispersion modeled via HYSPLIT trajectory (NOAA), Ash3d (USGS) for 3D. Column height input: volcanic explosivity index (VEI), typical 2-5km column.

Lahars trigger mudflows downstream, icequakes in glacial zones, flooding of tributaries. Pyroclastic flows generate base surges (low-density currents, 50km/hr, cool to <100°C at 10km). Lahars + lahars: valley resonance, secondary slumping. Pyroclastic + wind: downwind ash dispersal severe.

Ground shaking: lahar pressure waves <1Hz (minor), pyroclastic density current pressure >1 kPa (window-breaking). Tsunami risk: lahars entering lakes (rare but high consequence).

## Operational Protocols
Monitoring: USGS CVO real-time seismic network (IRIS, FDSN API), weekly GPS surveys (kinematic), daily gas sampling (SO2 spectrometer), satellite deformation (monthly InSAR). Decision logic: alert matrix (seismic + deformation + gas) with 2-person confirmation required for Watch/Warning escalation.

Confidence threshold: 75% for Watch, 85% for Warning. Data integration: seismic events ingested real-time, InSAR/satellite processed within 24hr, gas data batch processed daily. Cross-check: any single parameter threshold met requires manual expert review.

## Caching/Offline
Hazard polygons: GeoJSON cached, size 5-15MB per volcano. Lahar/pyroclastic routing: pre-computed flow accumulation grids (500m resolution). Update frequency: hazard polygon change on alert escalation, routing updated quarterly post-DEM refresh.

Offline cache: pre-load volcano-specific hazard layers, alert history (30-day), LAHARZ coefficients. Validation: timestamp on all layers. Stale data: flag after 7 days without network (volcano monitoring requires recent data).

Differential sync: alert level changes trigger full sync, routine polygon updates use tile-based differential (modified tiles only).

## Comms/UI
Map display: hazard zones (lahar corridors, pyroclastic extent) color-coded by distance. Alert indicator: card shows current alert level, seismic summary (events last 24hr), SO2 reading (tonnes/day), deformation status. Recent activity: 7-day seismic timeline, last satellite overpass timestamp.

Push alerts: Watch/Warning triggers immediate push + sms (30sec). Frequency cap: 1 alert/2hr. Detail page: hazard zone boundaries (street overlay), evacuation routes to safe zones (turn-by-turn), nearest shelters (distance, capacity if available), emergency contact list.

Real-time stream: seismic event log (magnitude, depth, distance), SO2 values (time series 30-day), InSAR deformation arrows (mm/year direction).

## Sensor Input
Seismic network: USGS ANSS stations (1-5km spacing per volcano), sensitivity 0.1mg accelerometers, digitization 16-bit @ 40Hz. API: USGS Earthquake Hazards Program (https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) 15min refresh. Swarm detection: >5 events/hr triggers automated alert escalation.

Deformation: kinematic GPS (sub-cm precision, 0.5cm/month sustained >1month = Watch trigger), InSAR (SENTINEL-1 ascending/descending, 12-day orbit, 5cm resolution). Coherence threshold: >0.4 (stable region), <0.2 (deformation zone). API: USGS InSAR program archive, ESA Copernicus hub.

Gas sampling: SO2 spectrometer (daily, 2-5 tonnes/day baseline detection), TROPOMI satellite (daily pass, 5km pixel, 0.1 DU detection limit). API: ESA Copernicus Hub, TEMIS SO2 database (http://www.temis.nl/).

Thermal: MODIS thermal anomaly (MOUNTS algorithm, 1km pixel, 4x daily). Temperature threshold: >310K (37°C above ambient). Pressure sensors at fumarole fields (real-time digital, <1 kPa resolution).

Integration latency: seismic <1min, satellite data 24-48hr, gas 1-24hr delay. Data fusion: Bayesian belief network combining seismic + deformation + gas (normalized 0-1 scale per parameter).

## Multi-Hazard Compounding
Lahar + debris flow: volcano source + downstream saturation. Velocity amplification 1.3-1.8x, reach 60-100km (vs. 30-60km lahar alone). Mortality multiplier: 2.0x. Pyroclastic flow + lahars: simultaneous hazard zones (<5km volcano), thermal + flow burial (100% mortality proximal, gradient to 5% at 10km). Ash + volcanic gases: respiratory damage (SO2 irritation + ash abrasion), healthcare surge (asthma exacerbation +300-500%). Post-event lahars (weeks) triggered by monsoon rainfall (regolith mobilization). Lahars + earthquake: dynamic liquefaction of volcanic alluvium (mobility +40%). Pyroclastic + wind: downwind ash dispersal 100+ km (aviation hazard), eye irritation 50+ km.

Volcano + climate: glacier-fed lahars sensitive to ice extent (climate-driven seasonal change -5% per decade mass loss). Groundwater heating (volcano case) raises base flow (hydrologic perturbation). Volcanic tremor acoustic waves couple to buildings (low-frequency, <10Hz resonance risk, amplification 2-5x if frequency match).
