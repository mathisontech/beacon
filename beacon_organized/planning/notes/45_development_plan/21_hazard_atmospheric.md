# Atmospheric & Wind Cluster

Hazards: Tornado, Hurricane, Winter Storm, Dust Storm, Extreme Cold

**Lead:** Atmospheric Cluster Lead

**Engineers:**
- Tornado Model Engineer
- Hurricane Model Engineer
- Winter Storm/Dust Storm Engineer
- Extreme Cold Engineer

## Tornado (10 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| ingest_nws_tornado_warning() | NWS API feed | warning_geometry, issued_time | Detection |
| process_nexrad_mesocyclone() | NEXRAD 0.5° data | mesocyclone_location, rotation_rate | Detection |
| detect_tornado_vortex_signature() | NEXRAD base reflectivity | vortex_center, vortex_strength | Detection |
| detect_debris_signature() | NEXRAD dual-pol (ZDR, ρhv) | debris_location, debris_confidence | Detection |
| predict_tornado_path() | Location, motion, shear | path_polygon, confidence_cone, T+30min | Spread |
| calculate_shelter_rating() | Building footprint, lat/lon | shelter_score (0-100) | Shelter |
| estimate_affected_population() | Shelter rating × population | affected_count, at_risk_count | Risk Assessment |
| generate_tornado_alert() | Detection + predictions | alert_text, geojson | Communication |
| validate_tornado_prediction() | Forecast path vs observed | cone_error_deg, missed_tornado_flag | Validation |
| triangulate_chaser_reports() | User photo + metadata | location, confidence, feed → ingest | Sensor Integration |

**UI Layers:**
- Storm track animation (5-min update)
- Tornado path prediction cone overlay
- Damage probability heat map
- Shelter location + rating overlay

**Databases:**
- tornado_events (id, issued_time, path_geom, intensity, duration)
- tornado_warnings (id, issuance_time, expiration_time, warning_text, affected_counties)

**Mesh/Offline:** NEXRAD cached locally, prediction runs device-side using pre-trained DL surrogate

**Cost:** NEXRAD API ~$500/mo, server ~$2k/mo

**Agent Monitors:**
- Quality: Tornado detection sensitivity, false positive rate
- Research: NWS new warning criteria, mesocyclone detection papers
- Business: API costs, model latency vs warning lead time
- Compliance: Alert accuracy, Good Samaritan review
- Ops: NWS feed uptime, NEXRAD data pipeline

**Dependencies:** NWS tornado warning feed, NEXRAD base reflectivity, user photo uploads

---

## Hurricane (10 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| ingest_nhc_track() | NHC best track forecast | track_points, cone, intensity_forecast | Detection |
| run_slosh_surge_model() | Track, central pressure, bathymetry | surge_depth_grid, inundation_extent | Spread |
| compute_holland_wind_profile() | Lat, lon, max_wind, pressure_deficit | wind_speed_grid | Risk Assessment |
| model_compound_flooding() | Storm surge + rainfall + tide | total_flood_depth_grid | Spread |
| calculate_evacuation_timing() | Windspeed_forecast, route_network | evacuation_zones, T+critical | Shelter |
| predict_landfall_location() | NHC track forecast, cone | landfall_coords, landfall_time, confidence | Spread |
| estimate_storm_surge_depth() | Holland model + bathymetry + tide | surge_depth_by_location | Risk Assessment |
| generate_hurricane_alert() | Track + surge + wind fields | alert_text, multi-layer_geojson | Communication |
| compute_wind_damage_zones() | Wind speed grid × fragility curves | damage_probability_by_building | Vulnerability |
| validate_track_accuracy() | Forecast track vs observed track | forecast_error_nm_by_horizon | Validation |

**UI Layers:**
- Track forecast animation (spaghetti ensemble display)
- Surge depth contours (6h-72h)
- Wind damage probability overlay
- Evacuation zone routing

**Databases:**
- hurricane_events (id, name, season, start_date, max_intensity, track_geom)
- hurricane_forecasts (event_id, forecast_time, track_points, intensity_forecast)
- hurricane_surge_grids (event_id, forecast_time, depth_raster)

**Mesh/Offline:** NHC track cached, SLOSH results pre-computed for 100+ Atlantic basins

**Cost:** NHC API free, SLOSH computation ~$5k/season, server ~$3k/mo

**Agent Monitors:**
- Quality: Track forecast error, surge depth validation
- Research: SLOSH model updates, new compound flooding papers
- Business: Ensemble forecast member count, compute resource allocation
- Compliance: Disclaimer accuracy, evacuation timing legality
- Ops: NHC feed uptime, SLOSH grid delivery pipeline

**Dependencies:** NHC track forecast, NOAA bathymetry, GEBCO elevation, tide gauge data

---

## Winter Storm (8 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| compute_sperry_piltz_ice() | Air temp, dew point, precip type | ice_accumulation_mm | Risk Assessment |
| model_wind_chill() | Air temp, wind speed | wind_chill_temp_C, frostbite_time | Lethality |
| predict_road_surface_temp() | Ground temp, air temp, wind, cloud cover | pavement_temp_C | Infrastructure |
| model_snow_drift() | Wind speed, wind direction, terrain | drift_depth_grid | Spread |
| detect_blizzard_conditions() | Visibility < 1/4 mi, wind > 35 mph | blizzard_flag, duration | Detection |
| track_plowed_routes() | DOT plow feed, priority routes | plow_coverage_pct, untreated_segments | Resource Overlay |
| generate_winter_alert() | Ice + wind chill + blizzard flags | alert_text, hazard_polygon | Communication |
| validate_accumulation_forecast() | Forecast total vs observed | accumulation_rmse_cm | Validation |

**UI Layers:**
- Wind chill temperature map
- Ice accretion forecast (6-24h)
- Blizzard visibility cone
- Plow route overlay (DOT feed)

**Databases:**
- winter_storm_events (id, start_time, accumulation_cm, max_wind_mph, duration)
- winter_alerts (id, hazard_type, issuance_time, affected_areas)

**Mesh/Offline:** Local MOS guidance for pavement temp, wind chill lookup tables

**Cost:** NWP model data ~$800/mo, DOT plow API ~$200/mo

**Agent Monitors:**
- Quality: Wind chill accuracy, accumulation RMSE
- Research: NOAA winter storm forecast skill, pavement temperature papers
- Business: DOT feed latency, alert volume during season
- Compliance: Frostbite risk disclaimer, windchill accuracy
- Ops: NWP feed pipeline, DOT API uptime

**Dependencies:** NWP forecast models, DOT plow status feed, road sensor network

---

## Dust Storm (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| detect_haboob() | Satellite IR, wind speed, dust detection index | haboob_extent, leading_edge_speed | Detection |
| model_pm10_visibility() | Wind speed, dust source maps, mixing height | visibility_mi_grid | Risk Assessment |
| predict_dust_transport() | HYSPLIT backward trajectory, wind forecast | dust_arrival_time, affected_areas | Spread |
| generate_dust_alert() | Haboob detection + transport forecast | alert_text, visibility_grid_geojson | Communication |
| validate_dust_extent() | Forecast extent vs satellite observed extent | extent_error_pct | Validation |

**UI Layers:**
- Haboob boundary animation
- Visibility forecast (contours)
- PM10 concentration grid
- Satellite dust detection overlay

**Databases:**
- dust_events (id, detection_time, extent_geom, leading_edge_speed_mph)
- dust_alerts (event_id, issuance_time, visibility_forecast_hours)

**Mesh/Offline:** HYSPLIT run locally, dust source maps pre-computed

**Cost:** HYSPLIT compute ~$300/mo, satellite data feed ~$500/mo

**Agent Monitors:**
- Quality: Haboob detection rate, visibility RMSE
- Research: Satellite dust detection algorithms, HYSPLIT updates
- Business: HYSPLIT compute scaling, alert volume per season
- Compliance: Visibility disclaimer, health impact messaging
- Ops: Satellite feed pipeline, HYSPLIT queue management

**Dependencies:** Satellite infrared, wind forecast, HYSPLIT dispersion model

---

## Extreme Cold (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| compute_wind_chill_index() | Air temp, wind speed | wind_chill_C, frostbite_risk_time | Lethality |
| model_hypothermia_risk() | Air temp, humidity, wind, precipitation | hypothermia_risk_hours | Lethality |
| forecast_cold_duration() | Temperature time series | cold_spell_duration_days, recovery_time | Spread |
| generate_extreme_cold_alert() | Wind chill < threshold, duration > threshold | alert_text, vulnerable_population_zones | Communication |
| validate_temperature_forecast() | Forecast low temp vs observed | forecast_rmse_C | Validation |

**UI Layers:**
- Wind chill contours (6-hourly update)
- Hypothermia risk zones
- Warming center locations overlay
- Cold spell duration chart

**Databases:**
- extreme_cold_events (id, start_date, min_temp_C, duration_days, frostbite_risk_index)
- cold_shelter_status (location_id, capacity, current_occupancy, coordinates)

**Mesh/Offline:** Wind chill lookup tables, NWP MOS cached

**Cost:** NWP data ~$500/mo, warming center database maintenance ~$200/mo

**Agent Monitors:**
- Quality: Wind chill forecast accuracy, frostbite risk timing
- Research: NOAA cold spell forecasting skill, hypothermia research
- Business: Warming center capacity alerts, alert volume
- Compliance: Health risk disclaimer, vulnerable population outreach
- Ops: Temperature sensor network uptime, shelter database sync

**Dependencies:** NWP temperature/wind forecast, warming center locations, vulnerable population registry

---

## Cross-Cluster Dependencies

- Tornado → Debris signature detection feeds into Wildfire spark detection
- Hurricane → Flood, Surge, Wind Damage (interconnected models)
- Winter Storm → Power grid cascade failure risk
- Dust Storm → Air Quality PM10 feed
- Extreme Cold → Power demand surge, critical infrastructure stress

## Legal/Compliance

- Good Samaritan: All wind damage alerts include structural integrity disclaimer
- Evacuation Routes: Verified for equal access, tested with accessibility tools
- Privacy: User storm chaser photos anonymized before public display

## Cost Summary

| Component | Monthly | Annual |
|-----------|---------|--------|
| APIs (NWS, NHC, DOT) | $1,700 | $20,400 |
| Compute (SLOSH, HYSPLIT) | $2,600 | $31,200 |
| Server Infrastructure | $5,000 | $60,000 |
| Satellite/Radar Data | $1,200 | $14,400 |
| **Total** | **$10,500** | **$126,000** |
