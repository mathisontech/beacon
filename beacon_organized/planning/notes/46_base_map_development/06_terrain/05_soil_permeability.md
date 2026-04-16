# Soil Permeability

Soil properties from SSURGO (US) and SoilGrids (global). Critical for flood Manning's n, landslide saturation, drought water retention, earthquake liquefaction.

## Data Sources

| Source | Region | Resolution | Coverage | Access |
|---|---|---|---|---|
| SSURGO (USDA NRCS) | US | 30m polygons | 95% US | Free, WCS/WFS |
| SoilGrids (ISRIC) | Global | 250m | Global | Free, cloud |
| Vs30 maps (USGS) | Global | 1 km | Global | Free |
| Fan et al Water Table | Global | 1 km | Global | Free |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_ssurgo_data(bbox) | Bounding box | Soil polygon layer + properties | soil.ssurgo_loaded |
| compute_infiltration_rate(soil_type, depth) | Soil properties | Inches/hour | soil.infiltration_computed |
| compute_saturation_capacity(soil_type) | Soil properties | Percent water holding capacity | soil.saturation_computed |
| estimate_runoff_coefficient(soil_type, cover) | Soil + landcover | Runoff fraction (0-1) | soil.runoff_coef_computed |
| classify_soil_texture(sand_pct, clay_pct, silt_pct) | Texture components | USDA texture class | soil.texture_classified |
| compute_liquefaction_susceptibility(vs30, soil_type) | Shear velocity + soil | Liquefaction risk (0-1) | soil.liquefaction_computed |
| compute_erosion_potential(soil_type, slope) | Soil + slope | K-factor erosion potential | soil.erosion_computed |

## SSURGO Properties Table

| Property | Derivation | Use |
|---|---|---|
| Permeability (in/hr) | Lab test / estimation | Flood Manning's n |
| Drainage class | Observed / inference | Slope saturation risk |
| Hydrologic soil group (A-D) | Runoff classification | Flood modeling |
| Depth to water table | Measured/modeled | Liquefaction, subsidence |
| Depth to bedrock | Survey/inference | Stability |
| Available water capacity | Lab data | Drought, vegetation stress |
| Shrink-swell potential | Clay mineralogy | Foundation risk |
| Erosion K-factor | Standard values | Erosion modeling |

## Soil Texture Classification (USDA Triangle)

| Class | Sand % | Silt % | Clay % | Use |
|---|---|---|---|---|
| Sandy | >70 | <27 | <7 | High infiltration, low cohesion |
| Loamy sand | 50-70 | <27 | <7 | Moderate infiltration |
| Loam | 23-52 | 28-50 | 7-27 | Balanced properties |
| Clay loam | 20-45 | 27-40 | 27-40 | Low infiltration, cohesive |
| Clay | <45 | <40 | >40 | Very low infiltration, stable |

## Data Storage

| Table | Schema |
|---|---|
| soil_polygons | polygon_id, bbox, ssurgo_mapunit_id, texture_class, permeability_in_hr, saturation_pct |
| soil_rasters | tile_id, texture_grid, permeability_grid, saturation_grid, vs30_grid |
| liquefaction_zones | zone_id, bbox, vs30_range, risk_level, area_m2 |

## Redis Cache

```
soil:texture:tile:{tile_id} -> 30m texture grid
soil:permeability:tile:{tile_id} -> 30m permeability (in/hr)
soil:saturation:tile:{tile_id} -> 30m water capacity
soil:vs30:tile:{tile_id} -> 1km Vs30 grid
liquefaction:zones:tile:{tile_id} -> zone polygons
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| soil.ssurgo_loaded | {bbox, mapunit_count} | Per bbox |
| soil.permeability_computed | {tile_id, mean_permeability} | Per tile |
| soil.liquefaction_zone_detected | {location, vs30_range, risk_level} | Per zone |
| soil.high_erosion_area | {location, k_factor} | If erosion potential high |

## Liquefaction Risk Zoning

Zhu et al. 2017 model:

```
Risk = f(Vs30, depth_to_water_table, magnitude_distance)
  Vs30 < 180 m/s: High risk
  180-250 m/s: Moderate risk
  >250 m/s: Low risk

Saturation factor: multiply by (0.5 if deep water, 1.0 if <3m water)
```

## Flood Integration (Manning's n)

| Permeability | Manning's n |
|---|---|
| >2.0 in/hr (sandy) | 0.025-0.030 |
| 0.5-2.0 in/hr (loam) | 0.035-0.050 |
| <0.5 in/hr (clay) | 0.055-0.080 |

## Landslide Saturation

Water table depth + antecedent rainfall determine pore pressure and slope stability.

```
Saturation risk = 1.0 if (rainfall_mm_7day > 100 AND depth_to_water < 2m)
                = 0.5 if (rainfall_mm_7day > 50 AND depth_to_water < 5m)
                = 0.0 otherwise
```

## Validation

- Cross-check SSURGO permeability against lab measured values (>95% agreement)
- Compare Vs30 liquefaction zones against earthquake damage records
- Validate water table depth against well logs
- Field survey erosion K-factors in high-risk areas

## Accuracy Targets

| Metric | Target |
|---|---|
| Texture classification | >90% accuracy |
| Permeability estimate | Within 0.5 in/hr |
| Liquefaction zone boundary | >85% agreement with geological survey |

## ML Models

| Model | Purpose |
|---|---|
| Missing soil predictor | Estimate texture/properties in ungapped regions | SoilGrids + TensorFlow |
| Permeability refiner | Predict permeability from satellite spectral data | SSURGO training + Sentinel-2 |

## Dependencies

- rasterio, fiona (data I/O)
- numpy, scipy (texture classification)
- Redis (caching)
- NATS (publishing)
