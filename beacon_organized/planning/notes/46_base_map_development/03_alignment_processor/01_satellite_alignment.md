# Satellite Alignment

Sentinel-2, NAIP, GOES, VIIRS registration to 1km grid.

## Sources

| Source | Resolution | Coverage | Revisit | Bands | Use |
|--------|-----------|----------|---------|-------|-----|
| Sentinel-2 | 10m | Global | 5 days | 11 (RGB + NIR + SWIR) | NDVI, burn scars, water, snow, cloud mask |
| NAIP | 0.6m | US | Every 2-3 yrs | 4 (RGB + NIR) | Building/tree detail, parking, pools |
| GOES | 2km | US | 5-15 min | 16 (thermal + visible) | Active fires, cloud tops, lightning |
| VIIRS | 375m | Global | Daily | 22 | Fire detection, thermal anomalies |

## Functions

| Function | Input | Output | Algorithm |
|----------|-------|--------|-----------|
| `download_sentinel2_scene` | AOI + date | Cloud optimized GeoTIFF | Copernicus hub API, parallel downloads |
| `apply_atmospheric_correction` | L1C GeoTIFF | L2A (BOA reflectance) | Sen2Cor, FLAASH, or fmask |
| `mask_clouds_shadows` | L2A + QA layer | Cloud/shadow mask UInt8 | FMask algorithm, >95% accuracy target |
| `register_to_grid` | GeoTIFF + GCP | Aligned to 1km grid | Affine transform, GCP refinement |
| `compute_band_indices` | Multispectral raster | NDVI, NDWI, NBR, NDSI | Standard formulas, per-pixel |
| `create_temporal_composite` | Stack of 10 scenes | Composite raster | Median/max over 30-day window |
| `download_naip_tile` | Tile ID + AOI | Cloud optimized GeoTIFF | USGS datastore or AWS bucket |
| `orthorectify_naip` | Raw NAIP + DEM | Ortho-corrected GeoTIFF | RPC-based, terrain correction |
| `coregister_naip_sentinel` | NAIP ortho + S2 | NAIP aligned to S2 grid | Mutual information, sub-pixel |
| `detect_seasonal_change` | Composite T1 + T2 | Change mask, magnitude | Normalized difference images |
| `download_goes_scene` | Sat ID + time | Raw NetCDF | NOAA bucket, time-series indexing |
| `resample_goes_to_grid` | GOES 2km raster | Resampled to 1km grid | Bilinear, boundary handling |
| `download_viirs_granule` | Date + region | HDF5 granule | LAADS DAAC or NASA Fire API |
| `register_viirs_to_grid` | VIIRS granule | 1km aligned stack | GCP-based affine + bilinear |

## Spatial Registration

Accuracy target: sub-pixel RMSE <0.5 pixel at source resolution.

### GCP Collection

| Source | GCP Method | Density |
|--------|-----------|---------|
| Sentinel-2 | Manual on unique features (road junctions, roofs, field boundaries) | 15-20 per scene |
| NAIP | Automatic feature matching to S2 where available | 50+ per tile |
| GOES | Georeferencing API (GOES nav) + cloud-tracking refinement | Inherent accuracy ±1km |
| VIIRS | Fire locations (verified ground truth) + coastline matching | 10-20 per swath |

### Affine Correction

```
1. Collect GCPs (manual or automatic)
2. Compute affine transform: pixel_to_latlon
3. Estimate residuals per GCP
4. Reproject using GDAL warp or rasterio
5. Check alignment against reference (Sentinel-2 as global baseline)
6. If RMSE > threshold: retry with manual GCPs
```

## Temporal Alignment

All scenes tagged with acquisition timestamp (UTC). Scenes >6 months old flagged during validation.

| Source | Latency | Frequency | Comment |
|--------|---------|-----------|---------|
| Sentinel-2 | 1-2 days | 5 days | Copernicus processing delay |
| NAIP | Months to years | 2-3 years | Flight scheduling |
| GOES | Real-time | 5-15 min | Operational satellites |
| VIIRS | 1 day | Daily | LAADS processing |

Compositing window: 30 days (month). Use median for Sentinel-2 (robust to clouds), max for VIIRS (fire detection).

## Cloud/Shadow Masking

Algorithm: FMask + custom confidence scoring.

| Threshold | Confidence | Action |
|-----------|-----------|--------|
| FMask cloud probability >80% | Low | Exclude from mosaic |
| Shadow probability >70% | Low | Flag in confidence layer |
| Cloud edge (probability 40-80%) | Medium | Include with reduced weight |
| Clear (probability <40%) | High | Use in composite |

Output: binary mask (clear=1, cloud/shadow=0) + confidence raster (0-1).

## Band Indices

Computed per pixel from atmospherically corrected reflectance.

| Index | Formula | Use |
|-------|---------|-----|
| NDVI | (NIR - RED) / (NIR + RED) | Vegetation health/density |
| NDWI | (NIR - SWIR) / (NIR + SWIR) | Vegetation moisture (fire fuel) |
| NBR | (NIR - SWIR2) / (NIR + SWIR2) | Burn severity mapping |
| NDSI | (GREEN - SWIR) / (GREEN + SWIR) | Snow/ice detection |
| MNDWI | (GREEN - SWIR) / (GREEN + SWIR) | Water body extent |

Output: UInt8 (0-255) per band. Each layer separate GeoTIFF.

## Databases

**sentinel2_scenes** — Track all downloaded scenes.

| Field | Type | Notes |
|-------|------|-------|
| scene_id | VARCHAR | Sentinel-2 product ID |
| tile_id | INT | Aligned to 1km grid |
| acq_date | DATE | Acquisition timestamp |
| cloud_pct | FLOAT | Percentage cloud cover |
| status | ENUM | Downloaded, processed, composite_used |

**satellite_indices** — Pre-computed band indices per tile.

| Field | Type | Notes |
|-------|------|-------|
| tile_id | INT | 1km cell |
| acq_date | DATE | Acquisition date |
| source | ENUM | Sentinel2, NAIP, GOES |
| index_type | VARCHAR | NDVI, NDWI, NBR, etc. |
| mean_value | FLOAT | Spatial mean |
| stddev | FLOAT | Spatial stddev |

## Cost & Performance

| Operation | Cost | Time |
|-----------|------|------|
| Sentinel-2 download per scene | $0.10-0.20 (API) | 5-10 min |
| Atmospheric correction (1 scene) | $0.50 CPU-hours | 30-60 min (GPU: 5 min) |
| NAIP orthorectification per tile | $0.20-0.30 | 10-20 min |
| Co-registration per source-pair | $0.05-0.10 | 5-10 min |
| Monthly global Sentinel-2 composite | $50-80 total | 12-24 hours |

## Validation

| Check | Method | Target |
|-------|--------|--------|
| GCP residuals | RMS error per scene | <0.5 pixels |
| Spectral consistency | Compare overlapping Sentinel-2 tiles | Correlation >0.95 |
| Temporal stability | Month-to-month NDVI variance | <0.05 in static areas |
| Registration to LiDAR | Match building edges | <1m offset |
| Cloud mask accuracy | Spot-check against Landsat | >95% accuracy |

## Quality Gates

- No scene >80% cloud cover in composite
- Temporal span of scene stack <6 months
- At least 3 scenes per 30-day window where available
- Geospatial alignment RMSE <0.5 pixel
- All indices within valid range

## Accuracy Targets

| Metric | Sentinel-2 | NAIP | GOES | VIIRS |
|--------|-----------|------|------|-------|
| Positional RMSE | <10m | <3m | ±1km | ±375m |
| Spectral accuracy | >90% band correlation | >95% | N/A | N/A |
| Temporal consistency | <0.05 NDVI month-month | N/A | Real-time | ±1 day |

## Integration Notes

Sentinel-2 is the global baseline. NAIP co-registered to Sentinel-2 where both available (US). GOES used real-time for fire detection (separate path). VIIRS bridging thermal gap for global real-time fire and thermal anomalies.
