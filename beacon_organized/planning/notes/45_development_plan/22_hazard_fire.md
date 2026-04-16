# Fire Cluster

Hazards: Wildfire, Extreme Heat, Air Quality

**Lead:** Fire Cluster Lead

**Engineers:**
- Fire Spread Model Engineer
- Fire/Smoke CV Engineer
- Lethality & Air Quality Engineer

## Wildfire Spread (12 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| initialize_rothermel_engine() | Fuel type, moisture, slope, wind | rothermel_state | Spread |
| compute_farsite_perimeter() | Rothermel state, ignition point, 15-min intervals | perimeter_polygon | Spread |
| model_crowning_flammap() | Fuel moisture, tree height, wind speed | crown_fire_probability_grid | Risk Assessment |
| generate_spot_fires() | Ember transport model, downwind distance | spot_fire_locations, ignition_prob | Spread |
| compute_ember_transport() | Flame length, wind speed, fuel size | max_spotting_distance_m, distribution | Spread |
| model_wildland_residential_transition() | Parcel footprint, structure density, fuel | wui_risk_score | Vulnerability |
| calculate_burn_together_groups() | Evacuation zone, road network, fire perimeter | evac_group_id, grouping_polygon | Shelter |
| integrate_user_sighting() | User photo + timestamp + location | confidence_score, feed_to_cv_pipeline | Sensor Integration |
| rerun_spread_with_sighting() | Updated ignition point or extent | new_perimeter, impact_assessment | Spread |
| compute_evacuation_zone() | Fire perimeter, wind forecast, spread rate | evacuation_polygon, trigger_time | Shelter |
| predict_containment_timeline() | Fire behavior + firefighter resources | expected_containment_date, resource_need | Risk Assessment |
| validate_spread_vs_observed() | Forecast perimeter vs satellite observed | perimeter_error_pct, model_rmse | Validation |

**UI Layers:**
- Real-time fire perimeter animation
- Evacuation zone routing
- Spotting distance forecast cone
- WUI vulnerability heat map

**Databases:**
- wildfire_events (id, name, start_date, start_location, max_acres, containment_date)
- wildfire_perimeters (event_id, timestamp, perimeter_polygon, confidence)
- evacuation_orders (event_id, issuance_time, zone_id, evacuation_polygon)
- fire_sightings (id, user_id, timestamp, photo_path, location, verified_flag)

**Data Dependencies:**
- LANDFIRE fuel data (20m resolution, national coverage)
- ALERTWildfire camera feed (high-res visible, 15-min cadence)
- HPWREN network cameras
- NWP wind forecast

**Mesh/Offline:** Rothermel/FARSITE runs locally on device, pre-cached fuel layers

**Cost:** LANDFIRE maintenance ~$500/mo, camera API ~$2k/mo, compute ~$3k/mo

---

## Fire/Smoke CV (8 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| process_fire_camera_feed() | ALERTWildfire/HPWREN camera image | flame_detection, fire_location | Detection |
| classify_smoke_day() | RGB image from user/camera | smoke_confidence, smoke_extent | Detection |
| classify_smoke_night() | Thermal camera image | smoke_confidence_thermal, glow_detection | Detection |
| score_user_photo_veracity() | User-submitted image | veracity_score (0-100), duplicate_check | Validation |
| detect_flame_in_photo() | RGB or thermal image | flame_bounding_box, flame_area_px | Detection |
| train_synthetic_smoke() | GAN synthesis of smoke plumes | synthetic_dataset_size, model_improvement_pct | Training |
| share_backbone_with_perception() | Street-level perception backbone | transfer_learning_weights | Architecture |
| validate_cv_accuracy() | Model predictions vs human labels | precision, recall, f1_score | Validation |

**Shared Backbone:** Wildfire/smoke CV shares convolutional backbone with street-level perception module (trees, buildings, road condition detection)

**Databases:**
- fire_detections (id, timestamp, method, location, confidence, image_path)
- cv_model_versions (id, architecture, training_date, accuracy_metrics)

**Mesh/Offline:** MobileNetV3-based detector runs on-device, backbone pre-trained

**Cost:** Camera feeds ~$2k/mo, GPU training ~$1.5k/mo, storage ~$800/mo

---

## Arson Detection (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| check_power_line_proximity() | Fire location, power line GIS layer | power_line_distance_m, risk_flag | Validation |
| check_lightning_history() | Fire location, NOAA lightning archive | lightning_strike_count_24h, likely_natural | Validation |
| check_camping_proximity() | Fire location, campground/park data | campground_distance_m, user_activity_flag | Validation |
| compute_crossover_proximity() | Fire location, road/trail network | crossover_distance_m, human_access_index | Validation |
| assess_upwind_position() | Ignition point, predominant wind direction | upwind_building_count, upwind_fuel_load | Vulnerability |
| generate_arson_flag() | Composite of above factors | arson_probability (0-100), alert_law_enforcement | Communication |

**Output:** Triggers law enforcement notification if arson_probability > 70%

**Databases:**
- arson_assessments (fire_id, power_line_flag, lightning_flag, camp_flag, arson_probability)

---

## Lethality & Air Quality (8 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| model_heat_smoke_oxygen() | Fire perimeter, wind, population density | exposure_duration_min, oxygen_depletion_risk | Lethality |
| run_hysplit_dispersion() | Fire perimeter, smoke start time, 72h forecast | smoke_plume_geom, transport_direction | Spread |
| compute_pm25_concentration() | HYSPLIT output, atmospheric mixing | pm25_concentration_grid_ugm3 | Air Quality |
| integrate_airnow_data() | EPA AirNow station observations | measured_pm25, comparison_to_forecast | Validation |
| compute_wbgt_heat_index() | Air temp, humidity, radiation, wind | wbgt_celsius, heat_stress_category | Lethality |
| map_urban_heat_islands() | Building density, albedo, tree canopy | urban_heat_island_temp_increase_C | Risk Assessment |
| generate_air_quality_alert() | PM2.5 grid, vulnerable population | alert_tier, affected_population_count | Communication |
| validate_smoke_dispersion() | Forecast smoke extent vs satellite observed | plume_extent_error_pct, transport_timing_error | Validation |

**UI Layers:**
- PM2.5 concentration contours (12-hourly update)
- Smoke plume trajectory animation
- Vulnerable population zones overlay
- Air quality index by neighborhood

**Databases:**
- smoke_events (event_id, start_time, max_pm25, duration_hours, affected_population)
- air_quality_alerts (id, issuance_time, pm25_level, vulnerable_pop_count)

**Mesh/Offline:** HYSPLIT runs locally, PM2.5 lookup tables pre-computed

**Cost:** HYSPLIT compute ~$1.5k/mo, EPA AirNow API ~$300/mo

---

## Cross-Module Dependencies

- Wildfire Spread → Smoke CV (flame detection feedback)
- Smoke CV → Lethality (PM2.5 modeling)
- Lethality → Air Quality alerts → Health department notifications
- Arson Detection → Law enforcement dispatch

## Agent Monitor Teams

**Quality Agent:**
- Spread model perimeter error (target <5% at T+1h)
- CV detection precision/recall on wildfire test set
- PM2.5 RMSE vs AirNow observations

**Research Agent:**
- LANDFIRE fuel data updates (annual)
- New FARSITE/Rothermel papers
- Smoke plume physics improvements

**Business Agent:**
- Camera feed costs vs. detection improvement
- GPU training budget allocation
- Model inference latency on mobile

**Compliance Agent:**
- Evacuation zone accuracy (Good Samaritan review)
- Arson flag legal liability
- Air quality alert accuracy disclaimer

**Ops Agent:**
- Camera feed uptime (target >99.5%)
- LANDFIRE data pipeline sync
- HYSPLIT queue management

---

## Legal/Compliance

- Good Samaritan: Evacuation zone borders reviewed for liability
- Smoke Disclaimer: Air quality advisory only, not medical guidance
- Arson Alert: Only issued to authorized law enforcement, not public
- User Photo Privacy: All user-submitted imagery anonymized on storage, verified users only

## Cost Summary

| Component | Monthly | Annual |
|-----------|---------|--------|
| Camera feeds | $2,000 | $24,000 |
| Compute (FARSITE, HYSPLIT, GPU) | $6,000 | $72,000 |
| Storage | $1,200 | $14,400 |
| Data (LANDFIRE, EPA, NWP) | $1,200 | $14,400 |
| Server infrastructure | $4,000 | $48,000 |
| **Total** | **$14,400** | **$172,800** |
