# Burn Scar Detection

Satellite temporal change detection (NBR index). Maps recent burns, estimates severity, computes post-fire debris flow risk (2-3x baseline for 2 years).

## Data Sources

| Source | Index | Resolution | Frequency |
|---|---|---|---|
| Sentinel-2 (NIR, SWIR) | NBR | 20m | 5 days |
| Landsat 8/9 | NBR | 30m | 16 days |
| FIRMS/VIIRS | Active fire hotspots | 375m | Daily |
| MTBS (USGS) | Historical burn severity | 30m | Annual |

## Burn Detection Indices

Normalized Burn Ratio (NBR) most sensitive to vegetation burn signature.

```
NBR = (NIR - SWIR) / (NIR + SWIR)
dNBR = NBR_prefire - NBR_postfire

High dNBR = severe burn
```

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| detect_burn_scars_nbr(pre_image, post_image, threshold) | Pre/post Sentinel-2 | Burn scar binary raster | fire.burn_scar_detected |
| compute_burn_severity(dnbr_grid, classification) | dNBR grid | Severity (unburned/low/moderate/high) | fire.severity_computed |
| estimate_recovery_stage(nbr_series, years_since_fire) | Multi-year NBR + time | Recovery stage (0-5) | fire.recovery_stage_estimated |
| compute_post_fire_debris_flow_risk(burn_sev, slope, drainage) | Severity + terrain | Debris flow risk 0-1 | fire.debris_flow_risk_computed |
| map_recent_burn_perimeters(burn_scars, temporal_order) | Burn grid + dates | Burn perimeter polygons with dates | fire.burn_perimeters_mapped |
| detect_reburn_risk_zones(burn_history, current_fuel) | Burn history + fuel layer | Reburn risk zone polygons | fire.reburn_risk_zones |

## Burn Severity Classification (MTBS Standard)

| Class | dNBR Range | NBR Change | Vegetation Impact |
|---|---|---|---|
| Unburned | < -100 | Increase (regrowth) | No burn impact |
| Low | -100 to 99 | Slight decrease | Light scorch, survival |
| Moderate | 100-269 | Moderate decrease | Crown scorch, some tree death |
| High | 270-439 | High decrease | Most trees killed |
| Extreme | > 440 | Very high decrease | Complete kill, substrate exposed |

## Post-Fire Risk Modeling

Multi-hazard cascade from vegetation loss.

| Hazard | Effect | Duration | Multiplier |
|---|---|---|---|
| Debris flow (soil) | 2-3x baseline risk | 2-3 years | 2.5 |
| Erosion | 5-10x baseline | 3-5 years | 7 |
| Flooding (reduced infiltration) | 1.5-2x baseline | 1-2 years | 1.75 |
| Mudslide initiation | 3-5x baseline | 2-3 years | 4 |

## Data Storage

| Table | Schema |
|---|---|
| burn_scars | scar_id, bbox, detection_date, severity_class, area_m2, confidence |
| burn_severity_raster | tile_id, date, severity_grid (0-4) |
| burn_perimeters | perimeter_id, geometry, detection_date, burn_start_date, severity_mean |
| post_fire_risk | tile_id, date, risk_type, risk_grid_0_1 |
| recovery_stages | scar_id, years_postfire, recovery_stage, ndvi_mean |

## Redis Cache

```
burn_scars:tile:{tile_id}:date -> burn scar polygons
severity:tile:{tile_id}:date -> 30m severity grid
nbr:tile:{tile_id}:date -> 20m NBR raster
recovery:scar_id:date -> recovery stage + NDVI
debris_flow_risk:tile:{tile_id}:date -> 30m risk grid (0-1)
reburn_risk:tile:{tile_id}:date -> 30m reburn risk grid
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| fire.burn_scar_detected | {scar_id, location, area_m2, confidence} | Per new scar |
| fire.severity_computed | {scar_id, severity_mean, distribution} | Per scar |
| fire.high_severity_zone | {location, severity_class, area_m2} | If high/extreme severity |
| fire.debris_flow_risk_increased | {location, risk_level, duration_years} | If risk >0.6 |
| fire.recovery_stage_updated | {scar_id, years_postfire, recovery_stage} | Quarterly |
| fire.reburn_risk_detected | {location, risk_score, likely_trigger} | If risk >0.7 |

## Recovery Stages

| Stage | Years Postfire | NDVI | Vegetation |
|---|---|---|---|
| 0 (Fresh burn) | <3 months | <0.1 | Bare soil, charred wood |
| 1 (Immediate) | 3-12 months | 0.1-0.3 | Herbaceous/grass growth |
| 2 (Early) | 1-3 years | 0.3-0.5 | Shrub colonization, grass dominance |
| 3 (Intermediate) | 3-10 years | 0.5-0.7 | Shrub-forest transition |
| 4 (Advanced) | 10-30 years | 0.7-0.85 | Young forest re-establishment |
| 5 (Recovered) | >30 years | 0.85+ | Pre-fire forest structure |

## Validation

- Cross-check NBR burn detection against FIRMS active fire hotspots (>95% agreement)
- Validate severity classification against MTBS historical severity maps
- Compare debris flow risk against USGS post-fire debris flow surveys
- Confirm reburn risk against historical fire records (second burn within 5 years)

## Accuracy Targets

| Metric | Target |
|---|---|
| Burn scar detection | >90% precision & recall |
| Severity classification | >85% accuracy per class |
| Debris flow risk prediction | >80% AUC (area under ROC) |
| Recovery stage estimation | ±2 years |
| Reburn risk prediction | >75% AUC |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Burn severity refiner | Enhance 30m severity to 10m | Sentinel-2 + MTBS labels |
| Debris flow predictor | Integrate burn + hydrology + geology | Post-fire debris flow records |
| Recovery curve fitter | Predict recovery trajectory | MTBS burn series + NDVI time series |
| Reburn risk model | Predict second burn probability | Fire history + current fuel |

## Performance

| Operation | Time (1 km²) |
|---|---|
| NBR compute | 2 sec |
| Severity classify | 1 sec |
| Debris flow risk | 4 sec |
| Recovery estimate | 2 sec |

## Dependencies

- rasterio, gdal (raster I/O)
- numpy, scipy (index computation, temporal analysis)
- scikit-learn (classification, clustering)
- TensorFlow (deep learning models)
- Sentinel Hub API (satellite data)
- FIRMS API (active fire reference)
- Redis (caching)
- NATS (publishing)
