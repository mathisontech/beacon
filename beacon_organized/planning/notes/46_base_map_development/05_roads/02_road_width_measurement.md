# Road Width Measurement

Measure road width and effective drivable width along entire network.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| measure_road_width_lidar | LiDAR point cloud, road centerline | Width at all points (meters) | Point cloud extent per cross-section |
| measure_road_width_satellite | NAIP/Sentinel-2 RGB, road mask, scale | Width estimate (meters) | Pixel width × ground resolution |
| interpolate_width_gaps | Width array with nulls | Interpolated width (linear, moving average) | Gap filling algorithm |
| compute_effective_width | Road width, street crowding layer | Effective drivable width (meters) | Parked car adjustment |
| classify_width_category | Width (meters) | Category string | Thresholds |
| validate_width_against_osm_lanes | Measured width, lane count | Agreement score | Expected width per lane |

## Data Storage

Widths stored inline in road GeoParquet and as separate raster:

```
{
  "width_m": float32,
  "width_confidence": float32,
  "width_source": "lidar" | "satellite" | "interpolated",
  "lanes": int32,
  "effective_width_m": float32,
  "width_category": "narrow" | "standard" | "wide" | "highway"
}
```

Width raster (1m resolution per tile): 32-bit float, meters, indexed to road centerline.

## Primary Method: LiDAR Width

**Accuracy target: ±0.5m RMSE**

Process:

1. For each point on road centerline (10m spacing)
2. Extract perpendicular cross-section of LiDAR points (±25m from centerline)
3. Identify road surface points: elevation ±0.3m from centerline height
4. Find leftmost and rightmost road surface points
5. Width = distance between left and right edges
6. Confidence based on point density (sparse = lower confidence)

Adjustments:
- Vehicles parked on road: detect as outliers, exclude from width calculation (separate "street_crowding" layer)
- Sidewalk: often visible as adjacent elevated pixels, exclude by filtering elevation
- Shoulders: may be gravel/grass, lower reflectance, can be distinguished by surface classification

Output: Width at 10m intervals along entire road segment.

## Secondary Method: Satellite Width

For areas lacking LiDAR (global coverage):

1. Extract road binary mask from D-LinkNet or segmentation
2. Find road extent (perpendicular distance from centerline to mask edge)
3. Width = 2 × perpendicular extent × pixel_scale

Pixel scale = 0.6m (NAIP) or 10m (Sentinel-2).

Accuracy: ±1-2m (lower than LiDAR due to imagery resolution and shadow effects).

Confidence: 0.60-0.75.

## Width Interpolation

Handle gaps (tunnels, dense vegetation occlusion):

For segments with missing width data:
- If gap <100m: linear interpolation between adjacent measurements
- If gap 100-500m: moving average of neighboring 500m segments
- If gap >500m: use regional average width for road type category

## Effective Drivable Width

Actual usable width accounting for parked cars (street crowding):

```
effective_width = measured_width - street_crowding_adjustment
```

Street crowding detected from LiDAR as vehicles in road corridor (not building parking):
- Sedan: ~1.8m wide, ~4.5m long
- SUV: ~2.0m wide, ~4.8m long
- Truck: ~2.5m wide, ~6.0m long

If vehicle detected on road edge: reduce effective width by vehicle width.

Example: 7m measured width with parked car on one side = 7 - 1.8 = 5.2m effective.

## Width Categories

| Category | Range (meters) | Vehicle Type | Hazard Implication |
|----------|---|---|---|
| Narrow | <4.5 | Single car only | Fire truck passability issue |
| Standard | 4.5-8 | 2 cars (1 each direction) | Normal evacuation |
| Wide | 8-15 | 3+ cars or heavy equipment | High throughput |
| Highway | >15 | Trucks, buses, multiple lanes | Freeway-scale capacity |

## Validation Against OSM Lanes

OSM `lanes` tag expected width:
- 1 lane: 3.5m
- 2 lanes: 7m
- 3 lanes: 10.5m
- 4 lanes: 14m

Measured width should align with lanes × 3.5m (±1m tolerance).

If measured width = 8.5m but OSM says 3 lanes (10.5m expected):
- Confidence reduced by 0.15
- Flag for manual verification (possible OSM error or road narrowing)

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| widths.measurement.tile_done | Tile complete | Per-tile |
| widths.quality_alert | Low confidence width | Per region |
| widths.osm_discrepancy | Measured vs. OSM mismatch | On detection |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `widths:tile:{tile_id}:mean_width` | 7 days | Average road width per tile |
| `widths:tile:{tile_id}:distribution` | 7 days | Histogram of widths |
| `widths:effective_width:cached` | 7 days | Effective width accounting for crowding |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| LiDAR cross-section extraction (CPU, 16 vCPU) | $100-150 |
| Width interpolation + validation (CPU) | $50-80 |
| Satellite width measurement (image processing) | $80-120 |
| OSM lane validation (data matching) | $30-50 |
| Manual verification of 100 samples | $100-150 |
| S3 storage (width raster + vectors) | $80-120 |
| **Total** | **$440-670** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| LiDAR width RMSE | 0.5 m | 100-point field survey |
| Satellite width accuracy | ±1.5 m | 50-segment manual measurement |
| Interpolation error (bridged gaps) | <0.3 m | Comparison across gap points |
| OSM lane agreement | >80% | 200-segment validation |
| Effective width accuracy | ±0.4 m | 30-parked-car scenarios |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| LiDAR coverage | >85% per tile | Proceed |
| Width range plausibility | 2m - 40m | Flag outliers |
| Interpolation gap rate | <5% per tile | Proceed, escalate if exceeded |
| OSM lane agreement | >70% per tile | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Measurement cycle | <20 days (US) |
| LiDAR cross-section latency | <0.01 sec per point |
| Interpolation latency | <0.1 sec per segment |
| Mean width confidence | >0.80 |
| Effective width update frequency (events) | Real-time |
