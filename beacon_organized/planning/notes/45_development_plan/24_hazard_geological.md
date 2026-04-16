# Geological Cluster

Hazards: Earthquake, Liquefaction, Sinkhole, Avalanche, Landslide, Volcano

**Lead:** Geological Cluster Lead

**Engineers:**
- Seismic Engineer
- Avalanche Engineer
- Landslide Engineer
- Volcano Engineer

## Earthquake (8 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| integrate_shakealert_eew() | USGS ShakAlert EEW message | magnitude, epicenter, depth, p_wave_arrival | Detection |
| process_gmpe_shakemap() | Magnitude, distance, vs30 soil class | gmpe_ground_motion_prediction | Risk Assessment |
| forecast_etas_aftershocks() | Main shock magnitude, location, time | aftershock_probability_grid, magnitude_forecast | Spread |
| score_building_vulnerability() | Building footprint, age, construction type, vs30 | vulnerability_score (0-100) | Vulnerability |
| compute_ground_motion_grid() | GMPE predictions, site amplification | pgv_grid_cms, pga_grid_g | Risk Assessment |
| estimate_structural_damage() | Ground motion × vulnerability score | damage_state_distribution, casualty_estimate | Vulnerability |
| generate_earthquake_alert() | Ground motion + damage forecast + population | alert_text, impact_polygon_geojson | Communication |
| validate_magnitude_accuracy() | EEW magnitude vs final USGS magnitude | magnitude_bias, convergence_time | Validation |

**UI Layers:**
- Ground motion intensity ShakeMaps (MMI scale color)
- Building damage probability heat map
- Aftershock probability zones
- Nearby hospital/fire station overlay

**Databases:**
- earthquake_events (id, magnitude, epicenter, depth_km, origin_time, final_magnitude)
- shakemaps (event_id, pgv_grid, pga_grid, mmi_grid, confidence)
- building_vulnerability (building_id, location, age, construction, vs30, vuln_score)
- aftershock_forecasts (event_id, time_window, prob_grid, mag_forecast)

**Data Dependencies:**
- USGS ShakAlert EEW API (real-time, <10 sec)
- USGS ShakeMap final products
- USGS National Seismic Hazard Model (site amplification)
- USGS National Building Inventory (age, construction)
- USGS vs30 soil velocity map

**Mesh/Offline:** GMPE equations run locally, ShakeMaps cached hourly

**Cost:** ShakAlert API ~$300/mo, ShakeMap processing ~$800/mo, compute ~$1.5k/mo

---

## Liquefaction/Sinkhole (4 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| compute_zhu_liquefaction() | Ground acceleration, depth to GWT, fines content | liquefaction_probability_grid | Risk Assessment |
| map_liquefaction_zones() | Liquefaction prob + land use + slope | liquefaction_hazard_zone_polygons | Risk Assessment |
| assess_karst_susceptibility() | Geology map, soluble rock extent, GWT depth | sinkhole_hazard_zone_polygons | Risk Assessment |
| generate_liquefaction_alert() | Liquefaction zones + population + infrastructure | alert_text, hazard_polygon_geojson | Communication |

**Trigger:** Earthquake alert automatically triggers liquefaction hazard assessment

**UI Layers:**
- Liquefaction probability overlay
- Karst sinkhole hazard zones
- Soil type/GWT depth map

**Databases:**
- liquefaction_assessments (event_id, liquefaction_prob_grid, affected_structures)
- karst_hazard_zones (zone_id, susceptibility_level, polygon)

**Data Dependencies:**
- USGS vs30 and depth-to-GWT maps
- USGS geological maps
- Fines content from borehole database

**Mesh/Offline:** Zhu formula runs locally

**Cost:** Geological data maintenance ~$400/mo

---

## Avalanche (6 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| run_snowpack_model() | Temperature, precipitation, wind, slope aspect | snowpack_stability_index, slab_depth_cm | Spread |
| simulate_ramms_runout() | Release area, terrain DEM, entrainment | runout_extent_polygon, runout_velocity_ms | Spread |
| compute_burial_survival_curve() | Burial depth, duration | survival_probability_at_time | Vulnerability |
| classify_terrain_by_aspect() | DEM slope aspect, elevation bands | avalanche_terrain_class (terrain_trap_risk) | Risk Assessment |
| generate_avalanche_alert() | Instability + runout zones + population | alert_text, hazard_polygon_geojson | Communication |
| validate_runout_extent() | Forecast runout polygon vs accident reports | extent_error_pct, false_negative_rate | Validation |

**UI Layers:**
- Snowpack stability index by slope
- Avalanche runout extent polygons (color by velocity)
- Buried survival time curve
- Backcountry skiing route overlay

**Databases:**
- avalanche_events (id, date, aspect, elevation_m, vertical_drop_m, number_buried)
- snowpack_forecasts (date, grid, stability_index, slab_depth_cm)
- avalanche_terrain (terrain_id, aspect, elevation_band, terrain_trap_class)

**Data Dependencies:**
- NWP temperature, precipitation, wind forecast
- USGS DEM
- Avalanche forecasting shapefiles (USDA Forest Service)
- Accident reports (avalanche.org database)

**Mesh/Offline:** Snowpack model runs locally, RAMMS pre-computed for known terrain traps

**Cost:** RAMMS computation ~$800/mo, NWP data ~$300/mo

---

## Landslide (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| compute_newmark_displacement() | Earthquake PGA, slope angle, friction angle | permanent_slope_displacement_cm | Risk Assessment |
| model_post_fire_debris_flow() | Burn area extent, rainfall forecast, slope | debris_flow_runout_extent, peak_discharge | Spread |
| detect_insar_deformation() | Sentinel-1 InSAR time series | deformation_rate_mm_yr, anomaly_location | Detection |
| map_susceptibility_zones() | Slope, geology, land use, GWT depth | landslide_susceptibility_polygon_zones | Risk Assessment |
| generate_landslide_alert() | Susceptibility + recent deformation + trigger | alert_text, hazard_polygon_geojson | Communication |

**Triggers:** Earthquake (Newmark), Heavy rainfall, Post-wildfire conditions

**UI Layers:**
- Landslide susceptibility zones
- InSAR deformation rate map
- Debris flow runout polygons
- Cutslope/fillslope hazard overlay

**Databases:**
- landslide_inventory (id, date, location, volume_m3, damage_count)
- susceptibility_zones (zone_id, susceptibility_class, polygon)
- insar_time_series (location, deformation_rate_mm_yr, latest_date)

**Data Dependencies:**
- USGS landslide inventory (historical)
- USGS slope stability maps
- Sentinel-1 InSAR time series
- USGS geological maps
- Burn area perimeters (post-fire trigger)

**Mesh/Offline:** Newmark displacement runs locally, InSAR processed weekly

**Cost:** InSAR processing ~$1.2k/mo, susceptibility map updates ~$300/mo

---

## Volcano (5 Functions)

| Function | Input | Output | Module |
|----------|-------|--------|--------|
| model_laharz_lahar() | Volcano DEM, drainage path, rainfall | lahar_runout_extent, inundation_depth | Spread |
| run_ash3d_dispersion() | Eruption column height, wind forecast, ashfall rates | ashfall_thickness_grid_mm, ashfall_duration | Spread |
| monitor_insar_deformation() | Sentinel-1 time series | deformation_rate_cm_yr, anomaly_location | Detection |
| detect_seismic_swarm() | USGS volcano seismometer network | swarm_magnitude_sum, event_rate_hz | Detection |
| generate_volcanic_alert() | Deformation + seismic swarm + ashfall extent | alert_text, evacuation_polygon_geojson | Communication |

**UI Layers:**
- Volcanic deformation map (InSAR)
- Lahar runout zones
- Ashfall thickness contours
- Seismic epicenter overlay

**Databases:**
- volcano_events (id, volcano_name, eruption_start, eruption_end, vei_index)
- ashfall_grids (event_id, timestamp, thickness_grid_mm)
- seismic_swarms (volcano_id, start_time, event_count, magnitude_sum)

**Data Dependencies:**
- USGS Volcano Disaster Assistance Program (VDAP)
- Sentinel-1 InSAR time series
- USGS volcano seismometer networks
- NWP wind forecast
- Volcano DEM

**Mesh/Offline:** LAHARZ and ASH3D run locally for 16 US volcanoes

**Cost:** InSAR processing ~$1k/mo, seismic feed integration ~$400/mo

---

## Cross-Module Dependencies

- Earthquake → Tsunami (ShakAlert trigger)
- Earthquake → Liquefaction (ground motion input)
- Earthquake → Landslide (slope displacement trigger)
- Wildfire → Post-fire Debris Flow (burn area + rainfall)
- Volcano → Ashfall → Air Quality → Health alerts

## Agent Monitor Teams

**Quality Agent:**
- ShakAlert magnitude convergence time
- Liquefaction probability validation
- Avalanche runout extent RMSE
- Landslide susceptibility false positive rate

**Research Agent:**
- USGS GMPE updates
- Avalanche forecasting research
- InSAR deformation detection papers
- Volcanic monitoring new methods

**Business Agent:**
- Compute cost per earthquake event
- InSAR processing queue management
- Model inference latency requirements

**Compliance Agent:**
- Earthquake alert accuracy, Good Samaritan review
- Avalanche terrain warnings legal liability
- Volcanic evacuation zone authority coordination

**Ops Agent:**
- ShakAlert EEW feed uptime
- Seismic network station health
- InSAR processing pipeline
- Volcano monitoring instrument status

---

## Legal/Compliance

- Good Samaritan: All geological hazard alerts reviewed with USGS for liability
- Avalanche Warnings: Explicitly state "no guarantee", responsible for terrain assessment
- Volcanic Evacuation: Coordinated with US Geological Survey Volcano Disaster Assistance
- Liquefaction Alerts: Disclaimer that ground failure probability is probabilistic, not deterministic
- Earthquake Alerts: ShakAlert integration must include USGS standard disclaimers

## Cost Summary

| Component | Monthly | Annual |
|-----------|---------|--------|
| USGS data feeds (ShakAlert, ShakeMap) | $1,200 | $14,400 |
| InSAR processing (Sentinel-1) | $2,500 | $30,000 |
| Seismic/volcano sensor networks | $800 | $9,600 |
| Computation (RAMMS, LAHARZ, ASH3D) | $2,000 | $24,000 |
| Server infrastructure | $2,500 | $30,000 |
| **Total** | **$9,000** | **$108,000** |
