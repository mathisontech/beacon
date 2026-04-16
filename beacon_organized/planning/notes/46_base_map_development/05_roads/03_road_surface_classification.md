# Road Surface Classification

Classify road surface type and condition from multi-source imagery.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| classify_surface_from_satellite | NAIP RGB-NIR or Sentinel-2 reflectance | Surface class (paved/unpaved) + confidence | Spectral signatures |
| classify_surface_from_street_view | Mapillary image tiles | Surface class + condition | CNN classifier |
| estimate_surface_condition | Surface type, wear patterns, crack detection | Condition class (good/fair/poor/impassable) | Texture analysis |
| detect_dirt_road_from_terrain | DEM slope analysis, vegetation clearing | Unpaved road candidate | Flow-based analysis |
| flag_seasonal_roads | Road location, climate zone, seasonal data | Impassable period (winter snow, spring mud) | Regional climate model |

## Data Storage

Surface stored inline in road GeoParquet:

```
{
  "surface_type": "asphalt" | "concrete" | "gravel" | "dirt" | "mixed" | "unknown",
  "surface_confidence": float32,
  "surface_source": "satellite" | "street_view" | "osm",
  "condition": "good" | "fair" | "poor" | "impassable",
  "condition_confidence": float32,
  "seasonal_impassable": boolean,
  "seasonal_impassable_months": [int],
  "pavement_coverage": float32,
  "last_condition_survey": datetime
}
```

## Primary Method: Satellite Spectral Classification

**Accuracy target: >90% paved/unpaved discrimination**

Use NAIP 4-band (R, G, B, NIR) or Sentinel-2 (B, G, R, NIR).

Spectral signatures:

| Surface | NDVI (IR/(IR-Red)) | NDBI (NIR-SWIR)/(NIR+SWIR) | Reflectance Pattern |
|---|---|---|---|
| Asphalt | 0.0-0.2 (dark) | 0.3-0.5 | Dark across bands, low NIR |
| Concrete | 0.1-0.3 (brighter) | 0.4-0.6 | Bright in visible, moderate NIR |
| Gravel | 0.2-0.4 (variable) | 0.3-0.5 | Mottled, moderate NIR |
| Dirt/unpaved | 0.3-0.6 (vegetated) | 0.2-0.4 | Higher NIR (mixed vegetation) |
| Vegetation overhang | 0.6-1.0 (high NDVI) | Low | High NIR, excludes from road width |

Algorithm:

1. Extract road mask from D-LinkNet
2. Sample spectral values within road mask
3. Compute NDVI per pixel
4. Threshold-based classification:
   - NDVI < 0.3 → Paved candidate
   - NDVI 0.3-0.6 → Mixed/gravel candidate
   - NDVI > 0.6 → Vegetation (exclude)
5. Within paved candidates, use NDBI to distinguish asphalt vs. concrete
6. Assign confidence based on spectral separation from threshold

Confidence: 0.80-0.90 (high for clear asphalt vs. dirt, lower for mixed/gravel).

## Secondary Method: Street-View CV

For detailed surface condition assessment:

Model: ResNet-50 fine-tuned on pavement condition dataset.

Classes:
- Asphalt (good, fair, poor, broken)
- Concrete (good, fair, poor)
- Gravel/unpaved
- Mixed/cobblestone

Training data: 1000-image curated Mapillary set with pavement engineers labeling.

Process:

1. Query Mapillary for road-level images (straight-ahead view)
2. Crop road surface patches (exclude shoulders, buildings)
3. Run ResNet-50 inference
4. Majority voting across multiple images per segment

Detects: surface type + condition indicators (cracks, potholes, rutting).

Confidence: 0.85-0.95 (high precision on surface type, good condition discrimination).

## OSM Source Tag

OSM `surface=*` tag values:
- asphalt, concrete, paved, asphalt;concrete (mixed)
- gravel, dirt, sand, earth (unpaved)
- compacted (semi-improved)

Confidence: 0.65-0.75 (varies by region, newer OSM entries more reliable).

## Road Condition Scoring

**Good**: No visible wear, no cracks >2cm, pavement intact.
**Fair**: Minor wear, small cracks (<2cm), pavement 90-100% intact.
**Poor**: Visible ruts, large cracks (>2cm), potholes, pavement 70-90% intact.
**Impassable**: Major damage, severe ruts, washouts, pavement <70% intact, flooded, heavy debris.

Condition determined by:
1. Street-view crack detection (automated via image processing)
2. Pothole/rut detection (LiDAR roughness index)
3. User reports (real-time damage feedback)

Confidence: 0.70-0.85 (crack detection reliable, overall condition assessment more subjective).

## Dirt Road Detection

For areas without satellite coverage or where roads unmapped:

DEM slope analysis:

1. Find areas with low vegetation (NDVI <0.4) but traversable gradient (slope <15°)
2. Check for vegetation clearing pattern (straight line through forest)
3. Width check (2-5m width typical for forest tracks)
4. If all criteria met → unpaved road candidate (confidence 0.50-0.70)

Validation: Cross-reference with street-view if available.

## Seasonal Impassability

Roads in regions with seasonal conditions:

| Region | Season | Condition | Months |
|---|---|---|---|
| Mountain passes | Winter | Snow impassable | 11-4 |
| Northern regions | Winter | Ice/snow | 11-3 |
| Unpaved roads (wet climate) | Spring | Mud (4WD only) | 3-5 |
| Desert washes | Monsoon season | Flash flood risk | 6-9 |

Determine by:
1. Road location (elevation, latitude)
2. Historical weather data (average snow days, precipitation)
3. User reports (seasonal closure logs)
4. Road maintenance schedules (government closure notices)

Flag: `seasonal_impassable=true`, `seasonal_impassable_months=[11,12,1,2,3]`

## Surface-Specific Passability

Base passability by surface + vehicle type:

| Surface | 2WD | AWD | 4WD | Fire Truck |
|---|---|---|---|---|
| Asphalt (good) | 100% | 100% | 100% | 100% |
| Asphalt (poor) | 80% | 95% | 100% | 90% |
| Concrete | 100% | 100% | 100% | 100% |
| Gravel (good) | 90% | 100% | 100% | 95% |
| Gravel (poor) | 60% | 90% | 100% | 80% |
| Dirt (dry) | 60% | 90% | 100% | 70% |
| Dirt (wet) | 20% | 60% | 100% | 40% |

Passability = base × width_factor × traffic_factor (congestion).

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| surface.classification.tile_done | Tile complete | Per-tile |
| surface.cv_model_updated | New ResNet-50 deployed | Weekly |
| surface.condition_alert | Impassable road flagged | On detection |
| surface.seasonal_update | Seasonal closure/opening | Seasonal |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `surface:tile:{tile_id}:distribution` | 7 days | Histogram of surface types |
| `surface:condition:impassable_roads` | 24 hours | Roads marked impassable |
| `surface:seasonal:closed_roads` | 30 days | Seasonally closed roads per month |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Satellite spectral classification (CPU) | $50-80 |
| Street-view CV (ResNet-50 on Mapillary) | $200-300 |
| Condition scoring (crack detection, LiDAR roughness) | $100-150 |
| Seasonal road determination (climate data lookup) | $50-80 |
| OSM tag integration + manual validation (50 samples) | $100-150 |
| **Total** | **$500-760** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| Satellite surface classification | >90% | 300-segment comparison |
| Street-view condition accuracy | >85% | 100-road engineer audit |
| Crack detection sensitivity | >80% recall | 50-road pothole survey |
| Seasonal impassability flag recall | >90% | Historical closure records |
| Dirt road detection precision | >85% | 100-segment ground truth |

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Satellite coverage | >90% per tile | Proceed |
| Street-view image availability | >60% per tile | Proceed, supplement with satellite |
| Surface-condition agreement | >75% multi-source | Proceed, flag conflicts |
| Seasonal data completeness | >80% roads | Proceed |

## Success Metrics

| Metric | Target |
|--------|--------|
| Classification cycle | <25 days (US) |
| Satellite inference latency per tile | <2 seconds |
| Street-view CV latency per road | <0.1 sec |
| Mean surface confidence | >0.80 |
| Condition assessment update frequency (events) | Real-time |
