# Building Height Estimation

Estimate building height and floor count from elevation data and imagery.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| compute_building_height_lidar | DSM, DEM, footprint | Height (meters) | Zonal statistics |
| estimate_height_from_shadow | Satellite image, sun angle | Height (meters) | Shadow length pixels, time-of-image |
| estimate_floor_count | Height (meters) | Floor count (integer) | Height-to-floor ratio (3.5m typical, 2.7m commercial, 2.4m residential) |
| classify_height_category | Height (meters) | Category string | Thresholds: low (1-3 floors), mid (4-7), high-rise (8+) |
| validate_against_assessor | Estimated floors, assessor records | Confidence score | Agreement rate |

## Data Storage

Heights stored inline in building GeoParquet:

```
{
  "height_m": float32,
  "height_confidence": float32,
  "floor_count_estimated": int32,
  "floor_count_assessor": int32,
  "height_source": "lidar" | "shadow" | "assessor" | "fused",
  "shadow_analyzed": boolean,
  "dsm_max": float32,
  "dem_ground": float32
}
```

## Primary Method: LiDAR DSM - DEM

**Accuracy target: ±2m RMSE**

For each building footprint:

1. Extract all DSM (digital surface model) pixels within polygon
2. Extract all DEM (bare earth) pixels within polygon
3. Compute zonal statistics: max(DSM), mean(DEM)
4. Height = max(DSM) - mean(DEM)
5. Floor count = round(Height / 3.5)

Adjustments:
- Vegetation on roof: LiDAR may overestimate. Check for vegetation signature in neighboring bare cells, reduce if roof partially vegetated
- Flat roofs vs. pitched: Measure roof extent, flag if slope >5 degrees (pitched)
- Chimney/antenna: Filter isolated high returns >0.5m above primary roof

## Secondary Method: Shadow Analysis

For areas lacking LiDAR (global fallback):

1. Extract satellite image from near-nadir pass (sun angle 30-60°)
2. Detect building shadow polygon
3. Measure shadow length in pixels
4. Convert pixel length to meters (scale from ground resolution)
5. Height = shadow_pixels × pixel_size ÷ tan(sun_angle)

Requires:
- Image timestamp (metadata)
- Sun angle calculation (Ephemeris algorithm)
- Cloud-free shadow visibility

Accuracy: ±1-2m but lower confidence (0.6-0.7).

## Floor Count Estimation

Height-to-floor ratios (regional variants):

| Building Type | Ratio | Use Case |
|---|---|---|
| Single-family residential | 3.5-4.0 | Default |
| Multi-family (apartment) | 3.2-3.5 | Purpose-classified apartment |
| Commercial (offices) | 3.8-4.5 | Purpose-classified office |
| Retail | 3.5-4.0 | Purpose-classified retail |
| Industrial warehouse | 5.0-8.0 | Purpose-classified industrial |

Formula: `floors = round(height_m / ratio)`

Validate against assessor records where available (county tax data).

## Model Integration

For buildings with multiple floor count sources:

```
fused_floor_count = weighted_mean(
  LiDAR_height / ratio (weight: 0.5),
  assessor_records (weight: 0.3),
  estimated_from_facades (weight: 0.15),
  satellite_shadow (weight: 0.05)
)
```

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| heights.estimation.tile_done | Tile processed | Per-tile |
| heights.validation.assessor_mismatch | >10% disagreement | Per 10km region |
| heights.model_updated | New shadow analysis deployed | Weekly |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `heights:tile:{tile_id}:mean_height` | 7 days | Average building height per tile |
| `heights:tile:{tile_id}:floor_distribution` | 7 days | Histogram of floor counts |
| `heights:assessor_agreement_rate` | 30 days | Validation metric |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| DSM-DEM zonal statistics (CPU, 16 vCPU) | $80-120 |
| Shadow analysis (satellite imagery processing) | $100-150 |
| Assessor record lookup and matching | $150-200 |
| S3 storage update (incremental) | $30-50 |
| **Total** | **$360-520** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Height RMSE (vs. field survey) | 2.0 m | 100-building survey |
| Floor count accuracy | 90% within ±1 floor | Assessor validation |
| Shadow analysis accuracy | 2.5 m RMSE | Manual measurements |
| Assessor record agreement | >80% | Jurisdiction validation |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| LiDAR DSM coverage | >90% per tile | Proceed |
| Height range plausibility | 2m - 200m | Flag outliers |
| Floor count reasonableness | 1-60 floors | Flag extremes |
| Assessor conflict rate | <10% per tile | Escalate if exceeded |

## Success Metrics

| Metric | Target |
|--------|--------|
| Height estimation cycle | <15 days (US) |
| Zonal statistics latency | <0.05 sec per building |
| Assessor record matching rate | >75% |
| Overall confidence score (height) | >0.80 |
