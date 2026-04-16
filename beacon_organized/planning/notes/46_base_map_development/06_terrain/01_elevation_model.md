# Elevation Model (DEM)

Bare earth elevation from multi-source DEM fusion. Primary: 3DEP LiDAR (US, 1m). Fallback: Copernicus 30m (global).

## Data Sources

| Source | Region | Resolution | Recency | Access |
|---|---|---|---|---|
| 3DEP (USGS) | US | 1m | 2013-2023 | Free, OpenAPI |
| Copernicus DEM | Global | 30m | 2021 | Free, ESA CDN |
| ASTER GDEM | Global fallback | 30m | 2011-2019 | Free, USGS |

## Functions

| Function | Input | Output | NATS Topic |
|---|---|---|---|
| load_dem_3dep(bbox, year) | Bounding box | 1m DEM raster | dem.loaded |
| load_dem_copernicus(bbox) | Bounding box | 30m DEM raster | dem.loaded |
| merge_dem_sources(dem_3dep, dem_copernicus) | Two DEMs | Merged 1m (3DEP preferred) | dem.merged |
| fill_voids(dem, method) | DEM + gap mask | Void-filled DEM | dem.voids_filled |
| remove_artifacts(dem, threshold) | DEM + artifact threshold | Cleaned DEM | dem.artifacts_removed |
| compute_relative_elevation(dem, reference) | DEM + sea level | Height above reference | dem.relative |
| compute_height_above_ground(dem, lidar_surface) | DEM + DSM | Vegetation height | vegetation.height_above_ground |

## Processing Pipeline

1. Tile DEM into 1 km x 1 km blocks (avoid memory overflow)
2. Load 3DEP for US; Copernicus elsewhere
3. Merge where both exist (3DEP weighted 0.95)
4. Interpolate voids using surrounding elevations
5. Filter artifacts (spike/depression removal)
6. Validate against reference surveys
7. Cache in Redis layer by tile ID

## Data Storage

| Table | Schema |
|---|---|
| dem_tiles | tile_id, bbox, resolution, void_fraction, rmse_error, created_at |
| dem_metadata | source, version, acquisition_date, processing_date |

## Redis Cache

```
dem:tile:{tile_id} -> compressed 1m raster
dem:metadata:{tile_id} -> {source, rmse, void_count}
dem:void_mask:{tile_id} -> binary mask of interpolated regions
```

## NATS Publishing

| Topic | Message | Frequency |
|---|---|---|
| dem.loaded | {bbox, source, resolution} | Per tile |
| dem.merged | {tile_id, coverage} | Per merged tile |
| dem.voids_filled | {tile_id, void_fraction} | Per tile |
| dem.artifact_detected | {tile_id, location, type} | Per artifact |
| dem.validation_complete | {bbox, rmse, status} | Per validation pass |

## Accuracy Metrics

| Dataset | RMSE Target | Measured |
|---|---|---|
| 3DEP (bare earth) | <1m | 0.8m avg US |
| Copernicus | <5m | 2.3m avg global |
| Merged (3DEP priority) | <1m | 0.9m |

## Validation

- Cross-check 3DEP against USGS survey benchmarks (monthly sample)
- Compare Copernicus against GDEM for gap coverage
- Visual inspection of artifact removal (2% sample per region)
- Compare relative elevation against known tide gauges coastal zones

## ML Models

| Model | Purpose |
|---|---|
| Artifact detector (ResNet) | Flag spikes/depressions |
| Void interpolator (U-Net) | Predict missing elevation |

## Compute Cost

| Operation | Cost (per US coverage) |
|---|---|
| DEM loading + merge | $2 |
| Void fill + artifact removal | $15 |
| Validation | $8 |

## Dependencies

- rasterio (DEM I/O)
- gdal (reprojection, merge)
- scipy.interpolate (void fill)
- numpy, pandas
- Redis (caching)
- PostgreSQL (metadata)
- NATS (publish results)
