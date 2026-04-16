# Hydrological Cluster

Hazards: Flood, Tsunami, Dam Failure, Rip Current

**Lead:** Hydro Cluster Lead

**Engineers:**
- Flood Model Engineer
- Tsunami/Coastal Engineer
- Dam/Infrastructure Failure Engineer

## Flood (10 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| run_hecras_2d() | Terrain DEM, Manning roughness, hydrograph | water_surface_elevation_grid | Spread |
| integrate_nwm_forecast() | NOAA National Water Model | inflow_hydrograph, stage_forecast | Detection |
| compute_hand_depth() | DEM, nearest stream burn, water surface | flood_depth_m_grid | Risk Assessment |
| process_flash_flood_guidance() | NOAA FFG threshold × rainfall forecast | flash_flood_probability | Alerting |
| overlay_fema_nfhl() | FEMA NFHL polygons, computed depths | floodplain_intersection, risk_mismatch | Risk Assessment |
| ingest_glofas_forecast() | Global Flood Awareness System | transboundary_flood_forecast | Detection |
| detect_flood_extent_sar() | Sentinel-1 SAR imagery | water_extent_polygon, extent_change_rate | Detection |
| compute_flood_depth_grid() | HEC-RAS output, DEM | depth_raster_m, uncertainty_bounds | Risk Assessment |
| generate_flood_alert() | Depth + affected population + evacuation zone | alert_text, multi_layer_geojson | Communication |
| validate_flood_extent() | Forecast extent vs satellite observed | extent_rmse_pct, stage_error_m | Validation |

**UI Layers:**
- Flood depth contours (0.3-3m color scale)
- Evacuation zone routing
- Affected infrastructure overlay (roads, bridges, utilities)
- Stage/hydrograph time series

**Databases:**
- flood_events (id, start_date, peak_stage_m, duration_hours, extent_sq_km)
- flood_forecasts (event_id, lead_time_hours, depth_grid_path, confidence)
- fema_nfhl (zone_id, zone_type, return_period, polygon)
- usgs_gauges (gauge_id, location, drainage_area_sq_km, current_stage_m)

**Data Dependencies:**
- NOAA National Water Model (1km grid, 6-hourly)
- USGS NWIS gauge network (real-time stage)
- USGS 3DEP DEM (10m resolution)
- FEMA NFHL polygons
- Sentinel-1 SAR imagery (6-day revisit)

**Mesh/Offline:** HEC-RAS pre-computed for 200+ major river basins, locally cached

**Cost:** NWM API ~$400/mo, gauge data ~$200/mo, SAR processing ~$1.5k/mo, compute ~$2.5k/mo

---

## Tsunami (8 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| run_most_comit_propagation() | Earthquake slip model, bathymetry | tsunami_waveheight_grid_15min | Spread |
| detect_dart_buoy_anomaly() | NOAA DART buoy sea level data | anomaly_flag, amplitude_m, arrival_time | Detection |
| train_neural_operator() | MOST simulations → neural network | surrogate_model_weights | DL Surrogate |
| compute_coastal_transect() | Bathymetry, tsunami amplitude, topography | runup_height_m, inundation_inland_m | Risk Assessment |
| model_runup() | Shallow water equations, beach profile | maximum_inundation_extent, debris_hazard | Spread |
| calculate_eta_to_coast() | Wave speed from bathymetry, distance | minutes_to_coast, impact_forecast | Alerting |
| generate_tsunami_alert() | ETA, inundation extent, affected population | alert_text, evac_polygon_geojson | Communication |
| validate_propagation_model() | Forecast ETA vs observed DART buoy | eta_error_minutes, amplitude_error_pct | Validation |

**UI Layers:**
- Wave height propagation animation (15-min frames)
- ETA contours (5-min intervals to coast)
- Inundation extent polygons
- DART buoy observation overlay

**Databases:**
- tsunami_events (id, earthquake_id, epicenter, magnitude, start_time)
- tsunami_propagations (event_id, lead_time_hours, wave_height_grid, eta_forecast)
- dart_buoys (buoy_id, location, max_amplitude_m, arrival_time)

**Data Dependencies:**
- USGS ShakAlert earthquake location/magnitude (real-time)
- NOAA DART buoy network (sea level, 1-min samples)
- ETOPO2 global bathymetry
- Coastal DEM (10m resolution)

**Mesh/Offline:** Neural operator surrogate runs on-device, MOST pre-computed for 50 subduction zones

**Cost:** MOST computation ~$3k/mo, ShakAlert API integration ~$200/mo, DART feed ~$300/mo

---

## Dam Failure (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| compute_froehlich_breach() | Dam height, width, reservoir level, soil type | breach_time_min, peak_outflow_cms | Spread |
| load_nid_dam_data() | USACE NID database, dam properties | dam_footprint, downstream_population | Risk Assessment |
| map_downstream_inundation() | HEC-RAS breach scenario, DEM | inundation_extent_geom, depth_grid | Spread |
| model_power_grid_cascade() | Powerline network, dam location, failure extent | substation_outage_count, cascade_risk | Resource Overlay |
| generate_dam_failure_alert() | Breach scenario, downstream population | alert_tier, evacuation_polygon, affected_count | Communication |

**Trigger:** Automatic if dam structural monitoring sensors exceed thresholds; manual override available

**UI Layers:**
- Dam location + storage level
- Downstream inundation zone
- Power grid cascade visualization
- Evacuation routing for downstream residents

**Databases:**
- dams (dam_id, name, height_m, storage_mcm, downstream_population, nid_id)
- dam_failure_scenarios (dam_id, scenario_name, breach_time_min, peak_outflow_cms, inundation_geom)

**Data Dependencies:**
- USACE NID database (8,000+ dams)
- Dam sensor network (if available)
- Power utility SCADA network
- Downstream DEM, population grid

**Mesh/Offline:** HEC-RAS breach scenarios pre-computed for critical dams

**Cost:** NID data maintenance ~$300/mo, sensor integration ~$1k/mo

---

## Rip Current (4 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| model_wave_wind_tide() | Wave forecast, wind, tidal stage | near_shore_current_grid | Spread |
| identify_rip_channels() | Bathymetry, wave direction, shore break pattern | rip_channel_locations | Risk Assessment |
| estimate_rip_strength() | Wave height, period, shore normal angle | rip_speed_mps, escape_difficulty | Risk Assessment |
| generate_rip_current_alert() | Rip speed > threshold, beach population | alert_text, warning_polygon | Communication |

**UI Layers:**
- Rip current velocity vectors overlay
- Beach hazard zones (high/medium/low)
- Rip channel location markers

**Databases:**
- rip_forecasts (beach_id, timestamp, rip_speed_mps, risk_level)
- beaches (beach_id, location, lifeguard_status, population_density)

**Data Dependencies:**
- Wave forecast (WAVEWATCH III, SWAN)
- Wind forecast
- Tide tables
- Coastal bathymetry

**Mesh/Offline:** Empirical rip current formula runs locally

**Cost:** Wave forecast data ~$300/mo

---

## Cross-Module Dependencies

- Flood → Dam Failure (cascade risk check)
- Flood + Tsunami → Compound flooding modeling
- Earthquake → Tsunami (ShakAlert trigger)
- Power Grid Failure → Hospital vulnerability (cascading failure)

## Agent Monitor Teams

**Quality Agent:**
- HEC-RAS stage RMSE vs USGS gauges (target <0.5m)
- MOST tsunami ETA error (target <5 min at coast)
- Rip current speed validation

**Research Agent:**
- HEC-RAS model updates from USACE
- Tsunami surrogate neural operator improvements
- New rip current detection papers

**Business Agent:**
- Compute cost per flood forecast
- GPU memory for DL surrogate inference
- Dam failure scenario recompute cadence

**Compliance Agent:**
- Evacuation zone accuracy, Good Samaritan review
- Dam failure alert liability (FEMA coordination)
- Rip current warning legal responsibility

**Ops Agent:**
- USGS gauge data pipeline uptime
- DART buoy feed latency
- Wave forecast model availability

---

## Legal/Compliance

- Good Samaritan: Dam failure alerts reviewed with USACE for liability
- Evacuation Routes: Verified for equal access, tested with mobility aids
- Privacy: Downstream population registry maintained at zipcode level minimum
- Coordination: USGS Water Resources, NOAA, USACE integrated into dispatch

## Cost Summary

| Component | Monthly | Annual |
|-----------|---------|--------|
| NOAA/USGS data feeds | $1,000 | $12,000 |
| Satellite processing (SAR) | $1,500 | $18,000 |
| HEC-RAS/MOST computation | $4,000 | $48,000 |
| Gauge/DART/Wave data | $800 | $9,600 |
| Server infrastructure | $3,000 | $36,000 |
| **Total** | **$10,300** | **$123,600** |
