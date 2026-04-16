# 50. Modeling & Simulation Module

## Overview
Physics-based hazard simulation pipeline with deep learning acceleration, sensor fusion, and digital twin testing. Enables real-time what-if scenarios and offline on-device hazard modeling through quantized surrogates.

## Ownership
- **Module Lead:** ML/Physics Engineer
- **Reports to:** CTO
- **Team Size:** 4 engineers (DL, physics, sensor fusion, validation)

## Parent/Submodules
- Parent: 02_hazard_models, 22_modeling_simulation
- Submodules: DL Training, Evacuation Sim, Sensor Fusion, World Model, Digital Twin

## Goals
- Deploy TFLite surrogates on-device for Tier 1 hazards (wildfire, flood)
- <5s on-phone inference latency for single prediction
- Evacuation simulation for population 10K-100K within 30s
- Sensor fusion update rate 1Hz (GPS, barometric, WiFi)
- Confidence-calibrated predictions (reported vs. actual accuracy within 5%)

---

## Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| train_dl_surrogate | Physics sim → DL model | Physics dataset (10K scenarios) | PyTorch model | 8hr training | FARSITE, HEC-RAS binaries |
| quantize_model | Float32 → INT8/FLOAT16 | PyTorch checkpoint | TFLite (.tflite) | 2min | tf_quantization lib |
| validate_surrogate | DL vs physics holdout | Test scenarios (1K) | Accuracy metrics | 30min | Physics baseline |
| compress_weights | Knowledge distillation | Teacher model + student | Distilled model | 4hr | Student architecture |
| deploy_on_phone | Bundle model in app | TFLite + metadata | React Native bundle | - | EAS Update |
| run_inference | Single prediction | Feature vector (20D) | Hazard extent + confidence | <5s | Model weights, Feature pipeline |
| simulate_evacuation | Agent-based pop sim | Road network, population density | Routes, timings, bottlenecks | <30s | Road network, Pop density DB |
| detect_traffic_stuck | Traffic congestion detection | Vehicle velocity stream | Stuck location + severity | 1s | GPS stream (1Hz) |
| optimize_exit_routes | Route people to least-congested exit | Population density, routes | Per-person recommended route | <2s | Evacuation sim output |
| predict_run_out_time | ETA to hazard reach location | Hazard spread model, location | Minutes until impact | <1s | Spread model, user location |
| estimate_population | Time-of-day pop density | Building footprints, hour-of-day | People count per grid cell | <100ms | Building DB, Census data |
| calculate_regional_risk | Per-hazard baseline risk | Jurisdiction, hazard type | Risk score (0-100) | <100ms | Historical hazard DB |
| triangulate_storm_chaser | Tornado location from reports | Observer locations + sightings | Computed location + confidence | <10s | Radar data, Image triangulation |
| fuse_sensors_realtime | Multi-source hazard input | Barometric, GPS, WiFi, weather | Fused state estimate | 100ms | Sensor streams |
| detect_barometric_anomaly | Pressure drop → flood potential | Barometric pressure time series | Anomaly flag + confidence | 1s | Phone barometer data |
| model_population_behavior | Predict evacuation compliance | Historical behavior, hazard type | Expected evac rate (0-100%) | <100ms | Behavior archive |
| flood_depth_prediction | Inundation depth map | Rainfall, terrain, soil type | Depth raster (0-10m) | <2s | Terrain DB, Soil data |
| wind_field_generation | Hurricane wind speed field | Track position, intensity | Wind velocity raster | <1s | Hurricane track, Physics model |
| ash_plume_dispersion | Volcanic ash spread | Eruption location, wind, altitude | PM10 concentration field | 2s | Wind forecast, Plume model |
| landslide_runout_sim | Debris flow extent | Slope, snowpack, rainfall | Runout polygon + travel time | 5s | DEM, Soil stability model |
| tsunami_inundation | Coastal wave run-up | Fault slip, seafloor topo | Water level extent map | 10s | MOST precomputed runs |
| heat_index_forecast | Thermal hazard prediction | Temperature, humidity, wind | Heat index (°F) + warnings | <100ms | Weather API |
| drought_severity_index | Water stress calculation | Precipitation, soil moisture, temp | Index (0-100) + trend | <500ms | Drought model |
| smoke_visibility_impact | Air quality effect on navigation | Fire location, wind, terrain | Visibility distance estimate | <1s | Fire model, Wind, PM2.5 |

---

## Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| model_versions | DL/physics model metadata | model_id, version, training_date, training_rmse, source_data | 2 years |
| simulation_scenarios | Past simulation runs | scenario_id, event_id, parameters, results_hash | 1 year |
| evacuation_outcomes | Historical evac run data | outcome_id, location, pop_count, routes_taken, time_to_safety | 7 years |
| sensor_calibration | Phone sensor accuracy | device_id, sensor_type, calibration_offset, last_check | 90 days |
| confidence_calibration | Predicted vs actual accuracy | model_id, confidence_bin, precision, recall | Continuous |
| population_density_hourly | Time-of-day pop maps | jurisdiction_id, hour_of_day, building_type, person_count | Historical archive |
| hazard_extent_archive | Past predicted/observed extents | event_id, model_version, predicted_extent, observed_extent | 10 years |
| traffic_stuck_events | Congestion reports | event_id, location, duration_min, vehicle_count | 90 days |

---

## Message Bus (NATS)

| Channel | Publisher | Subscriber | Frequency | Payload |
|---------|-----------|------------|-----------|---------|
| modeling.wildfire.predictions | Wildfire Model | Analysis Agent, World Model | On alert | {extent, confidence, lead_time} |
| modeling.flood.predictions | Flood Model | Analysis Agent, World Model | 15min | {depth_map, confidence, lag_time} |
| modeling.earthquake.predictions | Earthquake Model | Analysis Agent, World Model | Real-time | {magnitude, location, confidence} |
| simulation.evacuation.update | Evacuation Sim | EMS Dashboard, World Model | 10s (during event) | {route_assignments, eta_distribution, bottleneck_locations} |
| sensor.fusion.realtime | Sensor Fusion | World Model, Local Models | 1Hz | {fused_state, confidence, sensor_quality} |
| simulation.traffic.stuck | Traffic Detection | EMS Alerts | 5s | {location, severity, affected_count} |
| modeling.population.estimate | Pop Estimator | Resource Allocation | 1min | {jurisdiction, count_by_building_type} |
| simulation.digital_twin.start | Digital Twin | Model Trainer | On-demand | {event_id, hazard_type, parameters} |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Update Freq |
|-------------|---------|-----|------|------------|
| model:wildfire:v2.3:weights | Cached TFLite wildfire model | Session (24hr) | 45MB | Never (version stable) |
| model:flood:v1.2:weights | Cached flood surrogate | Session (24hr) | 32MB | Never (version stable) |
| sim:evacuation:{event_id}:current | Live evac simulation state | 5min | 2MB | 10s |
| sensor:barometric:{device_id}:last | Last barometric reading | 1min | 100B | 1Hz |
| pop:density:{jurisdiction}:{hour} | Hourly pop density for quick lookup | Permanent | 5MB | Daily midnight |
| model:confidence_bins | Confidence calibration lookup table | Permanent | 500KB | Weekly |
| hazard:regional_risk:{jurisdiction} | Pre-computed baseline risk | 1hr | 50KB | Daily |

---

## External Integrations

| System | Purpose | Protocol | Auth | SLA |
|--------|---------|----------|------|-----|
| USGS Earthquake API | Real-time earthquake data | REST/JSON | API key | <5min lag |
| NOAA Weather API | Weather forecasts, radar | HTTPS + Grib2 | API key | <1hr |
| FARSITE binary | Physics-based fire spread | Subprocess (local) | None | Internal |
| HEC-RAS binary | Flood inundation physics | Subprocess (local) | None | Internal |
| Sentinel-1 SAR data | Flood extent detection | S3 + tile server | AWS credentials | <1day |
| NWIS Stream Gauge | Real-time river levels | REST/JSON | Public | <1hr |
| Overture Maps | Building footprints, roads | S3 GeoParquet | Public | Quarterly |

---

## API Contracts

### Get Hazard Prediction
```
GET /api/v1/simulation/predict?hazard_type=wildfire&lat=40.1&lon=-120.5&zoom=13
Response: {
  hazard_extent: {type: "Polygon", coordinates: [...]},
  confidence: 0.87,
  lead_time_hours: 4,
  model_version: "wildfire_v2.3.1"
}
```

### Run Evacuation Simulation
```
POST /api/v1/simulation/evacuation
Body: {
  event_id: "ev123",
  population_count: 50000,
  origin_polygon: {type: "Polygon", ...},
  available_routes: ["route_a", "route_b"]
}
Response: {
  routes: [{id, assigned_count, eta_min, eta_max, bottleneck_locations}],
  completion_time_min: 240
}
```

### Sensor Fusion Update
```
POST /api/v1/sensors/fuse
Body: {
  device_id: "device123",
  barometric_pa: 101325,
  gps_lat: 40.1, gps_lon: -120.5,
  wifi_network_count: 8
}
Response: {
  fused_state: {hazard_proximity_score, elevation_estimate, connectivity_quality},
  updated_models: ["flood", "landslide"]
}
```

---

## UI Components (Where Applicable)

| Component | Purpose | Inputs | Outputs |
|-----------|---------|--------|---------|
| SimulationViewer | Animate evacuation routes over time | Event, simulation result | Visual playback |
| ConfidenceIndicator | Show model confidence + calibration | Prediction object | Confidence gauge (0-100%) |
| TrafficHeatmap | Show congestion on evacuation routes | Evacuation sim state | Color-coded road segments |
| PopulationDensityLayer | Overlay time-of-day population | Jurisdiction, hour | Heatmap layer on map |

---

## Offline & Mesh

- **On-phone models:** TFLite surrogates (45MB wildfire, 32MB flood) bundled in app; updated via EAS monthly
- **No-service scenarios:** Pre-computed regional risk stored locally; barometric anomaly detection fully local
- **Mesh replication:** Sensor fusion aggregates from nearby phones via mesh; flood + barometric data shared across nodes

---

## Cost Breakdown

| Component | Cost/Month | Scale | Notes |
|-----------|-----------|-------|-------|
| Physics simulation (FARSITE/HEC-RAS) | $0 | Internal binaries | Self-hosted |
| DL training infrastructure (GPU) | $3,000 | Monthly retraining | 10x20 GPU cluster |
| Model versioning + storage (S3) | $50 | ~500MB models × 12 versions | 1-year retention |
| Sensor data ingestion (TimescaleDB) | $200 | 500K data points/day avg | Real-time & historical |
| Evacuation simulation compute | $300 | On-demand Kubernetes jobs | Auto-scale during events |
| **Subtotal (steady state)** | **$3,550** | | |
| **During active event (10x)** | **$35,500** | 10-day wildfire/hurricane | Peak burst |

---

## Monitoring (5-Agent Team)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | Model accuracy vs baselines | Daily | F1 score, precision, recall | F1 drop >5% |
| Research | Compare predictions to outcomes | Weekly | Precision by region, seasonality | Systematic bias detected |
| Business | Simulation performance, SLAs | Daily | Latency <5s, crash rate | >2% crashes, >10s latency |
| Compliance | Model training data logging, audit | Weekly | Training data sources, version control | Missing audit trail |
| Lead | Escalation & decision review | Real-time (events) | False positive rate, user trust | >15% false alarms |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| 02_hazard_models | Core physics interfaces | Soft | High (consumes predictions) |
| 03_data_sources | Real-time sensor feeds | Hard | Critical (live input) |
| 06_atlas_base_map | Terrain DEM, land use | Hard | Critical (spatial inputs) |
| 09_public_groups, 10_ems_clients | Evacuation simulation consumers | Soft | Medium (simulation output) |
| 36_data_storage | TimescaleDB for time series | Hard | Critical (sensor data storage) |

---

## Cross-Module Dependencies

| From Module | To Modeling/Sim | Type | Purpose |
|------------|-----------------|------|---------|
| 21_beacon_world_model | Consumes all predictions | Soft | State synthesis |
| 33_agentic_planners | Triggers analysis agent | Hard | Recommendation generation |
| 39_module_validation | Validation metrics | Soft | Model accuracy tracking |
| 17_notifications_alerts | Alert messaging | Soft | Output distribution |
| 12_evacuation_management | Evacuation routing | Hard | Route optimization + ETA |

---

## Implementation Notes

- **DL surrogate training:** Physics simulations → synthetic dataset (10K scenarios) → DL model → quantize → deploy
- **Confidence calibration:** Track reported confidence vs actual accuracy; calibrate confidence bins until reported = actual ±5%
- **Evacuation sim:** Agent-based model; agents navigate using A* pathfinding; vehicles modeled with capacity; detect and report traffic congestion
- **Sensor fusion:** Barometric pressure correlated with elevation/flood risk; WiFi networks indicate proximity to infrastructure; GPS fused with map constraints
- **Digital twin:** Replay past events through current models; compare outputs to observed extents; use for pre-deployment validation
