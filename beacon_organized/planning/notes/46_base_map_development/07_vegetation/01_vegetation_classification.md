# Vegetation Classification

Primary: LANDFIRE EVT 140-category classification. Secondary: satellite NDVI 12-class segmentation, LiDAR vegetation detection.

## LANDFIRE Existing Vegetation Type (EVT)

140 detailed categories covering US vegetation at 30m resolution.

| EVT Category | Description | Fire Behavior | Traversability |
|---|---|---|---|
| 11 | Developed, urban/barren | None (urban) | Variable by structure |
| 12 | Developed, open space/park | Low | High |
| 21 | Grassland/grass-dominated | Extreme (low fuel) | Very high |
| 51 | Herbaceous shrubland | High | Medium |
| 52 | Shrubland (generic) | High | Medium-low |
| 71 | Ponderosa pine/Douglas-fir | High crown fire risk | Medium |
| 101 | Aspen forest | Moderate | Medium |
| 131 | Deciduous forest | Moderate | Low-medium |
| 141 | Coniferous forest | Very high | Low |
| 161 | Sparse vegetation | Low | High |
| 201 | Water | None | Impassable |

## 12-Class Satellite Segmentation

Complement EVT with Sentinel-2 10m classification for resolution enhancement and change detection.

| Class | Sentinel-2 Spectral Signature | Confidence |
|---|---|---|
| Water | MNDWI | >0.95 |
| Forest (dense) | High NDVI, low RVI | 0.92 |
| Forest (open) | Medium NDVI, medium RVI | 0.88 |
| Grassland | Low-medium NDVI, low RVI | 0.85 |
| Shrubland | Medium NDVI, high RVI | 0.82 |
| Barren/rock | Very low NDVI, high SWIR | 0.88 |
| Urban | NDBI high, NDVI low | 0.89 |
| Crop | Seasonal NDVI spike | 0.80 |
| Wetland | NDMI, water mix | 0.78 |
| Snow/ice | NDSI, low thermal | 0.96 |
| Cloud | High reflectance all bands | 0.99 |
| Shadow | Low reflectance, low thermal | 0.81 |

## LiDAR Vegetation Detection

Three-return profile distinguishes vegetation from surface.

| Return Profile | Interpretation | Result |
|---|---|---|
| Single strong return | Bare ground, pavement | Non-vegetation |
| Two returns (first high, second low) | Low vegetation, grass | Below-canopy surface |
| Three+ returns | Canopy structure, multiple layers | Vegetation present |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_landfire_evt(bbox) | Bounding box | EVT 30m raster | vegetation.evt_loaded |
| compute_ndvi_from_satellite(bbox, date) | Sentinel-2 bands | NDVI 10m grid | vegetation.ndvi_computed |
| classify_vegetation_type(evt, ndvi, lidar) | EVT + NDVI + LiDAR returns | Vegetation class grid | vegetation.type_classified |
| map_vegetation_zones(vegetation_grid) | Classification grid | Zone polygon layer | vegetation.zones_mapped |
| compute_greenness_index(ndvi_time_series) | Multi-date NDVI | Greenness score (0-1) | vegetation.greenness_computed |
| detect_drought_stress(ndvi_historical) | NDVI time series | Stress grid (0-1) | vegetation.drought_stress_detected |
| detect_invasive_species_spread(ndvi_change, location) | NDVI change + geography | Invasion polygon layer | vegetation.invasive_detected |

## Data Storage

| Table | Schema |
|---|---|
| vegetation_evt | tile_id, evt_grid_30m, evt_category_names |
| vegetation_satellite | tile_id, ndvi_grid_10m, classification_12class, confidence |
| vegetation_lidar | tile_id, return_profile_grid, veg_binary_mask |
| vegetation_zones | zone_id, geometry, evt_category, confidence, area_m2 |
| drought_stress_raster | tile_id, stress_grid, stress_magnitude_0_1 |

## Redis Cache

```
evt:tile:{tile_id} -> 30m EVT grid (int8)
ndvi:tile:{tile_id} -> 10m NDVI grid (float32)
vegetation_class:tile:{tile_id} -> 10m 12-class grid (int8)
lidar_veg:tile:{tile_id} -> binary vegetation mask
drought_stress:tile:{tile_id} -> stress magnitude grid
invasive_zones:{tile_id} -> zone polygons
```

## NATS Publishing

| Topic | Message | Condition |
|---|---|---|
| vegetation.evt_loaded | {tile_id, category_distribution} | Per tile |
| vegetation.type_classified | {tile_id, accuracy_estimate} | Per tile |
| vegetation.ndvi_computed | {tile_id, mean_ndvi, stress_count} | Per date |
| vegetation.drought_stress_detected | {location, stress_magnitude, area_m2} | If stress >0.6 |
| vegetation.invasive_detected | {location, species_probable, spread_rate} | Per detection |

## Greenness Index

Normalized 0-1 score for vegetation health:

```
Greenness = (NDVI - NDVI_min) / (NDVI_max - NDVI_min)
  NDVI_min typically -0.1 (water/barren)
  NDVI_max typically 0.9 (dense forest)

Drought stress = 1.0 - Greenness (0=healthy, 1=severely stressed)
```

## Validation

- Cross-check EVT against field surveyed vegetation plots
- Compare 12-class segmentation against ground truth orthophoto labels
- Validate NDVI against field reflectance measurements
- Compare drought stress detection against USDA drought monitor

## Accuracy Targets

| Metric | Target |
|---|---|
| EVT per-class accuracy | >80% |
| 12-class segmentation | >82% overall |
| NDVI correlation | >0.90 with field |
| Drought stress detection | >85% precision |

## ML Models

| Model | Purpose | Training Data |
|---|---|---|
| EVT enhancer | Refine 30m categories to 10m | Sentinel-2 + labeled EVT sites |
| NDVI validator | Detect anomalous NDVI values | Sentinel-2 training set |
| Invasive species detector | Identify non-native vegetation | Satellite change + field surveys |

## Performance

| Operation | Time (1 km²) |
|---|---|
| EVT loading | 1 sec |
| NDVI compute | 3 sec |
| Classification | 4 sec |

## Dependencies

- rasterio, gdal (raster I/O)
- numpy, pandas (array ops)
- scikit-learn (classification)
- Sentinel Hub API (satellite data)
- Redis (caching)
- NATS (publishing)
