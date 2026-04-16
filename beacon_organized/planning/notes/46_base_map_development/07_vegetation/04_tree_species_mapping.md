# Tree Species Mapping

Classify species from satellite multispectral + LiDAR structure + LANDFIRE EVT. Critical for flammability indexing and fire behavior prediction.

## Data Sources

| Source | Spectral Bands | Resolution | Coverage |
|---|---|---|---|
| Sentinel-2 | 11 bands (red-edge + SWIR) | 10/20/60m | Global, weekly |
| NAIP (US) | RGB + NIR | 0.6m | US, 2-3yr refresh |
| LiDAR structural metrics | Height, density, profile | 1m | US (3DEP) |
| LANDFIRE EVT | 140 vegetation categories | 30m | US coverage |

## Spectral Signatures (Sentinel-2)

| Species Group | B2 (Blue) | B3 (Green) | B4 (Red) | B5 (RE) | B8 (NIR) | B11 (SWIR) | B12 (SWIR2) |
|---|---|---|---|---|---|---|---|
| Conifer (spruce/fir/pine) | Low | Low | Med-low | Med | Med | Med-high | Med-high |
| Deciduous (oak/maple/birch) | Low | Med | Low | High | High | Low | Low |
| Eucalyptus/tropical | Low | Med-high | Med | High | High | Med | Low |
| Aspen (white bark) | Med | Med-high | Med | Med | Med-high | Low | Low |

## LiDAR Structural Indicators

| Species Type | Height Range | Crown Shape | Return Profile |
|---|---|---|---|
| Conifer (dense) | 20-40m | Conical/narrow | Concentrated top, sparse middle |
| Pine (open crown) | 15-35m | Sparse, spreading | Multiple return levels |
| Deciduous broad | 15-30m | Rounded, dense | Strong single return |
| Aspen | 15-25m | Columnar | Narrow vertical profile |
| Birch | 15-25m | Pendulous | Soft return edges |
| Tropical palm | 10-20m | Linear stem | Single return at top |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| classify_tree_species(spectral, lidar_struct, evt) | Sentinel-2 + LiDAR + EVT | Species class per tree/pixel | vegetation.species_classified |
| identify_coniferous_vs_deciduous(spectral, lidar) | Multispectral + structural | Binary conifer grid | vegetation.conifer_detected |
| estimate_tree_age(height, lidar_growth, spectral) | Height + growth curve + spectral | Age years (confidence) | vegetation.tree_age_estimated |
| compute_species_flammability_index(species) | Species class | Flammability 0-1 | vegetation.species_flammability |
| detect_dead_standing_trees(lidar_reflectance, ndvi) | LiDAR + NDVI | Snag polygon layer | vegetation.snags_detected |
| detect_beetle_kill_zones(ndvi_change, spectral_red) | Temporal NDVI + red reflectance | Dead tree zone polygons | vegetation.beetle_kill_detected |

## Species Flammability Index

Fuel moisture, dead wood, crown fire potential by species.

| Species | Flammability (0-1) | Fuel Moisture (%) | Crown Fire Risk |
|---|---|---|---|
| Lodgepole pine | 0.95 | 40-60 | Very high |
| Douglas-fir | 0.85 | 50-70 | Very high |
| Spruce (dense) | 0.90 | 45-65 | Extreme |
| Ponderosa pine (open) | 0.70 | 55-75 | Moderate-high |
| Aspen | 0.60 | 60-80 | Moderate |
| Oak (deciduous) | 0.50 | 70-90 | Low-moderate |
| Maple | 0.45 | 75-95 | Low |
| Birch | 0.55 | 65-85 | Low-moderate |

## Tree Age Estimation

Height-to-age relationships vary by species and climate.

| Species | Growth Rate (m/yr) | Max Height (m) |
|---|---|---|
| Lodgepole pine (dense) | 0.3-0.5 | 25-35 |
| Douglas-fir | 0.4-0.7 | 40-60 |
| Aspen (pioneer) | 0.5-1.0 | 25-30 |
| Oak (slow-growing) | 0.2-0.4 | 20-30 |

## Dead Tree (Snag) Detection

Recent beetle-kill or disease creates high-risk fuel.

```
Snag signature:
  - High LiDAR return (hard wood)
  - Low NDVI (<0.3)
  - Spectral red reflectance >0.2
  - Temporal NDVI decline >0.2 year-to-year
```

## Data Storage

| Table | Schema |
|---|---|
| tree_species_map | tile_id, species_grid_10m, primary_species_30m, confidence |
| conifer_density | tile_id, conifer_fraction_grid |
| species_flammability | tile_id, flammability_grid_0_1 |
| snag_locations | snag_id, location, height_m, age_estimate |
| beetle_kill_zones | zone_id, geometry, mortality_pct, year_detected |
| tree_age_map | tile_id, age_years_grid, confidence |

## Redis Cache

```
species:tile:{tile_id} -> 10m species grid (int8)
conifer:tile:{tile_id} -> 10m conifer binary mask
flammability:tile:{tile_id} -> 10m flammability grid (0-1)
snags:tile:{tile_id} -> snag point layer
beetle_kill:tile:{tile_id} -> zone polygons
tree_age:tile:{tile_id} -> 10m age grid (years)
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| vegetation.species_classified | {tile_id, distribution, confidence} | Per tile |
| vegetation.high_flammability_area | {location, species, flammability_score} | If flammability >0.75 |
| vegetation.snag_detected | {location, height, age_estimate} | Per snag >5m |
| vegetation.beetle_kill_detected | {zone_id, location, mortality_pct} | Per zone >20% mortality |
| vegetation.tree_age_estimated | {tile_id, mean_age, age_distribution} | Per tile |

## Validation

- Cross-check species classification against field-surveyed plots (>70% accuracy target)
- Validate snag detection against aerial photo interpretation
- Compare beetle-kill detection against USFS pest surveys
- Confirm conifer/deciduous classification against county forest inventory

## Accuracy Targets

| Metric | Target |
|---|---|
| Species classification | >70% accuracy (broad classes) |
| Conifer/deciduous | >85% accuracy |
| Snag detection | >80% precision |
| Beetle-kill zone detection | >75% recall |
| Tree age estimate | ±10 years RMSE |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| Species classifier | Random Forest on spectral + structural features | Field plots + Sentinel-2 + LiDAR |
| Conifer detector | Binary classifier | EVT conifer labels |
| Snag detector | Anomaly detection in NDVI/reflectance | LiDAR + high-res orthophoto snags |
| Beetle-kill predictor | Temporal NDVI change + spatial clustering | USFS pest survey records |

## Performance

| Operation | Time (1 km²) |
|---|---|
| Species classification | 5 sec |
| Snag detection | 3 sec |
| Beetle-kill mapping | 4 sec |

## Dependencies

- rasterio, gdal (raster I/O)
- numpy, pandas (array ops)
- scikit-learn (Random Forest classifier)
- TensorFlow (deep learning models)
- Sentinel Hub API (satellite data)
- Redis (caching)
- NATS (publishing)
