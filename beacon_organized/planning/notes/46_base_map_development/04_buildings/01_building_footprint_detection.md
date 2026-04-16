# Building Footprint Detection

Extract precise building boundary polygons from aligned multi-source data.

## Functions

| Function | Input | Output | Dependencies |
|----------|-------|--------|--------------|
| classify_building_points | LiDAR XYZ point cloud | Binary classification per point (building/non-building) | Pre-trained CNN backbone |
| extract_footprint_polygon | Classified point cloud | Polygon boundary (GeoJSON) | Alpha-shape or Ramer-Douglas-Peucker |
| simplify_polygon | Raw polygon | Simplified polygon | Line simplification tolerance (0.5m) |
| compute_footprint_area | Polygon geometry | Area in m² | Geodetic calculation |
| merge_overlapping_footprints | Polygon array | Merged polygon set | Union operation, 0.5m overlap threshold |
| validate_against_osm | Extracted polygon, OSM outline | Confidence score 0-1 | IOU overlap metric |
| score_footprint_confidence | Multi-source polygons (LiDAR, satellite, OSM) | Aggregate confidence 0-1 | Source agreement weighting |

## Data Storage

Footprints stored in GeoParquet with schema:

```
{
  "geometry": "POLYGON(...)",
  "building_id": "string (UUID)",
  "tile_id": "string (x_y format)",
  "area_m2": float64,
  "height_m": float32,
  "confidence": float32,
  "source_agreement": int32,
  "last_updated": datetime,
  "source_lidar": boolean,
  "source_satellite": boolean,
  "source_osm": boolean
}
```

## Model Architecture

**Primary: Mask R-CNN (Building Detection)**
- Backbone: ResNet-101 pretrained on ImageNet
- Input: LiDAR DSM (1m resolution, normalized elevation)
- Output: Binary mask per pixel + bounding box
- Training data: SpaceNet buildings dataset + regional hand-labeled LiDAR
- Target accuracy: 0.85 mAP @ 0.5 IOU

**Secondary: U-Net Segmentation (Satellite)**
- Backbone: EfficientNet-B4 pretrained on ImageNet
- Input: NAIP 4-band RGB-NIR (0.6m)
- Output: Binary building mask per pixel
- Training data: SpaceNet + NIST buildings dataset
- Target accuracy: 0.78 IOU
- Use case: Validation in LiDAR-sparse areas

**Tertiary: OSM Validation**
- Source: OpenStreetMap building outlines
- Role: Confirm or override ML detections
- Confidence boost: +0.2 if ML and OSM agree within 5m
- Confidence penalty: -0.15 if significant disagreement

## Processing Pipeline

```
LiDAR DSM (1m) + NAIP RGB-NIR (0.6m)
       ↓
Normalize elevation to 0-255 range
       ↓
Apply Mask R-CNN to DSM
       ↓
Apply U-Net to NAIP in LiDAR-sparse tiles
       ↓
Polygonize binary masks (connected components)
       ↓
Simplify polygons (0.5m tolerance)
       ↓
Merge overlaps >0.5m
       ↓
Validate against OSM
       ↓
Score confidence (multi-source agreement)
       ↓
Output GeoParquet with confidence per building
```

## NATS Messaging

| Topic | Event | Frequency |
|-------|-------|-----------|
| footprints.detection.tile_done | Tile complete | Per-tile |
| footprints.detection.ml_model_updated | New Mask R-CNN deployed | Weekly |
| footprints.detection.osm_conflict | Major disagreement with OSM | On detection |

## Redis Cache

| Key | TTL | Use |
|-----|-----|-----|
| `footprints:tile:{tile_id}:count` | 7 days | Building count per 1km tile |
| `footprints:tile:{tile_id}:avg_area` | 7 days | Mean building area m² |
| `footprints:model_metrics` | 7 days | Current Mask R-CNN mAP, inference time |

## Cost Estimates (Monthly, US)

| Component | Cost |
|-----------|------|
| Mask R-CNN inference (8× A100 GPUs, 30 days) | $400-500 |
| U-Net inference (satellite tiles, 4× A100) | $150-200 |
| Polygon simplification + merge (CPU, 32 vCPU) | $80-100 |
| OSM conflation API calls | $50-80 |
| S3 storage (GeoParquet output) | $100-150 |
| **Total** | **$780-1,030** |

## Accuracy Targets

| Metric | Target | Test Set |
|--------|--------|----------|
| mAP @ 0.5 IOU | 0.85 | SpaceNet validation |
| Polygon area accuracy (vs. orthophoto) | <5% RMSE | 200-building field survey |
| OSM agreement (tiles with OSM coverage) | >75% IoU | 1000-building overlap test |
| False negatives (missed buildings) | <5% | Manual visual inspection |
| False positives (non-buildings) | <3% | Manual inspection |

## Quality Gates

Per-tile quality checks:

| Check | Threshold | Action |
|-------|-----------|--------|
| Mask R-CNN confidence mean | >0.6 | Proceed |
| U-Net dice score (satellite) | >0.7 | Proceed |
| OSM conflation rate | >60% tiles | Proceed, flag low-OSM areas |
| Area range plausibility | 20-50,000 m² | Flag outliers for review |

## Success Metrics

| Metric | Target |
|--------|--------|
| Extraction cycle (US) | <25 days |
| Inference latency per 1km tile | <2 seconds |
| Polygon simplification time | <0.1 seconds per building |
| Mean confidence score globally | >0.65 |
| Mean confidence score (US with LiDAR) | >0.82 |
