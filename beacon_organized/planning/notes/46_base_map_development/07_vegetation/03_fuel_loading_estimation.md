# Fuel Loading Estimation

Critical for wildfire spread model. Primary: LANDFIRE FBFM40 40 fuel models. Secondary: LiDAR vegetation metrics + satellite NDVI.

## LANDFIRE Fuel Behavior Fuel Model (FBFM40)

40 standardized fuel model categories from Rothermel fire spread equations.

| Model # | Name | Fuel Type | Load (tons/ha) | Depth (ft) | Max Spread |
|---|---|---|---|---|---|
| 1 | Short grass | Grass | 0.5-1.0 | 1 | Extreme |
| 2 | Timber/grass | Mixed | 1.5-2.5 | 1-3 | Very high |
| 6 | Sparse scrub | Shrub | 1.0-2.0 | 2 | High |
| 7 | Closed-canopy shrub | Shrub | 3.0-5.0 | 6-8 | Extreme |
| 9 | Hardwood litter | Forest | 1.5-2.0 | 0.2 | Low |
| 10 | Timber litter | Forest | 2.0-3.0 | 1 | Low-moderate |
| 11 | Light logging debris | Slash | 3.5-5.0 | 1 | Moderate |
| 12 | Medium logging slash | Slash | 8.0-12.0 | 2-3 | High |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_landfire_fbfm40(bbox) | Bounding box | FBFM40 30m raster | fuel.fbfm40_loaded |
| compute_fuel_loading_tons_per_ha(fbfm40, lidar_canopy) | FBFM40 + canopy metrics | Fuel loading grid | fuel.loading_computed |
| estimate_fuel_moisture(weather, ndvi, aspect) | Weather + NDVI + slope | Moisture % grid | fuel.moisture_estimated |
| compute_fuel_bed_depth(fbfm40, veg_height) | FBFM40 + height | Depth meters grid | fuel.depth_computed |
| classify_fuel_type(fbfm40, veg_class) | FBFM40 + EVT | Fuel type (grass/shrub/timber/slash) | fuel.type_classified |
| compute_fire_spread_rate_input(fbfm40, fuel_load, moisture) | All fuel layers | Rothermel inputs | fuel.spread_inputs_computed |
| adjust_for_recent_treatment(fbfm40, fire_history) | FBFM40 + burn scars/treatments | Adjusted fuel model | fuel.treatment_adjusted |

## Fuel Loading by FBFM40 Category

Empirical ton/ha values from LANDFIRE documentation.

| Category Type | Typical Range | Confidence |
|---|---|---|
| Grass | 0.5-2.0 | High |
| Shrub | 2.0-8.0 | Medium-high |
| Timber (natural litter) | 3.0-6.0 | Medium |
| Logging slash | 8.0-25.0 | Medium (site-specific) |

## Fuel Moisture Estimation

Days since rain + temperature + aspect drives moisture.

```
Fuel moisture (%) = base_moisture
                  - (days_since_rain * 2)
                  - (temperature_F / 50)
                  + (aspect_shading_factor) * 5

  Base moisture (FBFM40 specific)
  Grass: 80-120%
  Shrub: 60-100%
  Timber: 40-80%

Constraints: clamp to 5-200% realistic range
```

## Fuel Bed Depth

Height of fuel layer available for burning.

| Fuel Type | Depth (m) |
|---|---|
| Grass | 0.3-0.5 |
| Shrub | 1.0-3.0 |
| Timber litter | 0.1-0.3 |
| Logging slash | 1.0-5.0 |
| Crown fuel (canopy) | CHM (0.1-50m) |

## Rothermel Fire Spread Inputs

FBFM40 + fuel loading + moisture feed into Rothermel equations:

| Input | Source |
|---|---|
| Fuel model number | FBFM40 grid |
| Fuel bed depth | Estimated from height |
| Fuel loading | LiDAR-enhanced FBFM40 |
| Fuel moisture | Weather model input |
| Surface-to-crown transition threshold | EVT lookup |
| Canopy bulk density | LiDAR canopy metrics |

## Recent Treatment Adjustments

Burn scars and fuel breaks modify fuel loading.

| Treatment | Fuel Loading Adjustment |
|---|---|
| Prescribed burn (0-5 years ago) | -80% |
| Fuel reduction thinning | -30-60% depending on intensity |
| Fuel break (cleared area) | 0 (non-flammable) |
| Post-fire recovery (>5 years) | Gradually restored to baseline |

## Data Storage

| Table | Schema |
|---|---|
| fbfm40_grid | tile_id, fbfm40_raster_30m, model_distribution |
| fuel_loading | tile_id, loading_tons_ha_grid_30m, min_load, max_load, mean_load |
| fuel_moisture | tile_id, date, moisture_pct_grid |
| fuel_bed_depth | tile_id, depth_m_grid |
| fuel_treatment_history | zone_id, treatment_type, date, loading_reduction_pct |

## Redis Cache

```
fbfm40:tile:{tile_id} -> 30m FBFM40 grid (int8)
fuel_loading:tile:{tile_id} -> 30m loading grid (float32)
fuel_moisture:tile:{tile_id}:date -> 30m moisture grid
fuel_depth:tile:{tile_id} -> 30m depth grid (float32)
rothermel_inputs:tile:{tile_id}:date -> pre-computed fire spread inputs
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| fuel.fbfm40_loaded | {tile_id, model_distribution} | Per tile |
| fuel.loading_computed | {tile_id, mean_loading, high_load_zones} | Per tile |
| fuel.moisture_estimated | {date, tile_id, mean_moisture} | Daily during fire season |
| fuel.high_fuel_area_detected | {location, loading_tons_ha, area_m2} | If loading >6 tons/ha |
| fuel.treatment_applied | {location, treatment_type, new_loading} | Per treatment |

## Validation

- Cross-check FBFM40 against field-surveyed fuel plots (>80% agreement)
- Compare fuel loading estimates against published forest inventory data
- Validate fuel moisture against fuel moisture sticks during fire season
- Compare post-fire fuel reduction against prescribed burn records

## Accuracy Targets

| Metric | Target |
|---|---|
| FBFM40 classification | >85% accuracy |
| Fuel loading estimate | ±2 tons/ha RMSE |
| Fuel moisture prediction | ±10% |
| Fuel type classification | >90% |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Fuel loading refiner | Enhance FBFM40 resolution to 10m | Sentinel-2 + FBFM40 + field plots |
| Fuel moisture predictor | Weather + NDVI → moisture | Fire season weather + fuel samples |
| Treatment effectiveness | Predict post-treatment fuel loading | Prescribed burn records + re-survey |

## Performance

| Operation | Time (1 km²) |
|---|---|
| FBFM40 load | 1 sec |
| Fuel loading compute | 3 sec |
| Moisture estimate | 2 sec |

## Dependencies

- rasterio, gdal (raster I/O)
- numpy, pandas (array ops)
- Rothermel library (fire spread equations)
- Redis (caching)
- NATS (publishing)
