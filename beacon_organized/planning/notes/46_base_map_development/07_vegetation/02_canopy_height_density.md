# Canopy Height & Density

Canopy height from LiDAR CHM (Canopy Height Model = DSM - DEM). Density from canopy cover fraction and LiDAR return ratios.

## Data Sources

| Source | Metric | Resolution | Coverage |
|---|---|---|---|
| LiDAR DSM (3DEP) | Canopy surface | 1m | US coverage |
| LiDAR DEM (3DEP) | Bare earth | 1m | US coverage |
| Satellite shadows (optical) | Height proxy | 10m | Global |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| compute_chm(dsm, dem) | DSM + DEM rasters | CHM raster (meters) | vegetation.chm_computed |
| estimate_canopy_height(chm, lidar_returns) | CHM + LiDAR waveform | Height ±1.5m | vegetation.height_estimated |
| compute_canopy_cover_fraction(lidar_returns, chm) | Return density + CHM | Fraction 0-1 | vegetation.cover_fraction_computed |
| compute_canopy_density(lidar_returns, vertical_profile) | Return count by height | Density 0-1 | vegetation.density_computed |
| detect_individual_trees(chm, dsm) | CHM + DSM | Tree polygon layer | vegetation.trees_detected |
| estimate_tree_count_per_area(chm, tree_spacing) | CHM + tree size model | Count per hectare | vegetation.tree_count_estimated |
| compute_understory_density(lidar_returns_0_to_2m) | 0-2m return profile | Understory density 0-1 | vegetation.understory_computed |

## CHM Calculation

```
CHM[i,j] = DSM[i,j] - DEM[i,j]

where:
  DSM = first return elevation (canopy top)
  DEM = last return elevation (bare earth)

Clipping: CHM = max(0, min(CHM, 100)) to remove noise
```

## Canopy Height Estimation

Coarse LiDAR estimates enhanced with allometric relationships:

| Tree Type | Height/Crown Width Ratio |
|---|---|
| Conifer (dense) | 0.6-0.8 |
| Hardwood (broad crown) | 0.4-0.6 |
| Palm/sparse | 0.3-0.5 |

## Canopy Cover Classification

Fraction of ground covered by canopy projection.

| Cover % | Classification | Fire Behavior |
|---|---|---|
| 0-10 | Open / scattered trees | Low crown fire risk |
| 10-30 | Sparse / park-like | Moderate risk |
| 30-60 | Moderate closure | High risk |
| 60-90 | Dense / closed canopy | Extreme crown fire risk |
| >90 | Very dense | Extreme risk |

## Vertical Density Profile

LiDAR return distribution by height bin enables multi-layer classification.

```
For each cell, record return count in 1m bins:
  Returns 0-1m: understory
  Returns 1-5m: lower canopy
  Returns 5-15m: mid canopy
  Returns 15-30m: upper canopy

Density[layer] = returns[layer] / total_returns
```

## Data Storage

| Table | Schema |
|---|---|
| canopy_height_model | tile_id, chm_grid_1m, min_height, max_height, mean_height |
| canopy_cover | tile_id, cover_fraction_grid, cover_percent_category |
| tree_detections | tree_id, location, height_m, crown_diameter_m, species_confidence |
| density_profile | tile_id, height_bin_densities (array) |
| understory | tile_id, understory_density_grid |

## Redis Cache

```
chm:tile:{tile_id} -> 1m CHM raster (float32)
canopy_cover:tile:{tile_id} -> 1m cover fraction (float32)
density_profile:tile:{tile_id} -> stacked vertical profile
trees:tile:{tile_id} -> tree point layer
understory:tile:{tile_id} -> 1m density grid
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| vegetation.chm_computed | {tile_id, mean_height} | Per tile |
| vegetation.tall_trees_detected | {location, height_m, count} | If >20m trees |
| vegetation.dense_canopy_detected | {location, cover_pct, area_m2} | If cover >70% |
| vegetation.understory_computed | {tile_id, mean_density} | Per tile |
| vegetation.tree_detected | {location, height, crown_diam} | Per individual tree >5m |

## Crown Fire Initiation Criteria

Forest fire models use:

| Factor | Threshold |
|---|---|
| Canopy base height | <2m from surface enables crown fire |
| Canopy bulk density | >0.05 kg/m³ supports crown fire |
| Canopy cover | >60% enables fire propagation |

Combined: crown_fire_risk = all three thresholds met.

## Validation

- Cross-check CHM against field-surveyed tree heights (±1.5m target)
- Compare canopy cover against high-res orthophoto visual assessment
- Validate tree count per hectare against field plot inventory
- Confirm understory density correlates with field-measured brush height

## Accuracy Targets

| Metric | Target |
|---|---|
| Canopy height RMSE | <1.5m |
| Canopy cover RMSE | <10% |
| Individual tree detection | >90% for trees >5m |
| Tree count accuracy | ±20% per hectare |

## ML Models

| Model | Purpose |
|---|---|
| Tree crown segmentation | Watershed algorithm on CHM peaks | CHM training data |
| Species classifier from crown | Correlate crown shape + height + reflectance | Aerial imagery + field plots |
| Understory vegetation classifier | Distinguish grass from brush from small trees | Return profile + multispectral |

## Performance

| Operation | Time (1 km²) |
|---|---|
| CHM compute | 2 sec |
| Crown separation | 8 sec |
| Density profile | 4 sec |

## Dependencies

- rasterio, gdal (LiDAR data I/O)
- numpy, scipy (morphological ops, watershed) |
- scikit-image (edge detection)
- Redis (caching)
- NATS (publishing)
