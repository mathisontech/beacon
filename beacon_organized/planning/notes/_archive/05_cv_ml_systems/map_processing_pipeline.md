# CV/ML Systems and Map Processing Pipeline

## Atlas Map Processor

Core multi-source fusion pipeline. Ingests DEM (SRTM 30m global, 3DEP 1m US), satellite imagery (Sentinel-2 10m, NAIP 0.6m US), vector data (OSM, TIGER/Line), and LiDAR point clouds (3DEP). Outputs standardized 1km tiles with 30+ layers per tile.

Processing stages: raw ingestion, georeferencing (EPSG:4326 standard), resampling (bilinear for continuous, nearest-neighbor for categorical), fusion (weighted by resolution and recency), validation (automated + human spot-check), tiling (PMTiles format for CDN delivery).

Throughput target: 10,000 tiles/hour on 8x A100 GPU cluster. Full US coverage (~8M tiles) in ~33 days. Incremental updates process only changed source data.

## ML Model Architecture

Foundation model: Modified U-Net with EfficientNet-B4 encoder pretrained on ImageNet. Fine-tuned per task.

Task-specific models:
- Building detection: Mask R-CNN, 0.85 mAP on SpaceNet, outputs footprints + height estimates
- Road extraction: D-LinkNet, 0.78 IoU on DeepGlobe, outputs centerlines + width + surface type
- Land cover classification: 12-class segmentation (water, forest, grass, crop, urban, barren, wetland, snow, cloud, shadow, shrub, other), 0.82 overall accuracy
- Vegetation density: Regression model outputting NDVI-calibrated density 0-1, used for fire fuel loading
- Structure material classification: From street-level imagery, 6 classes (wood, brick, concrete, metal, stone, mixed), 0.71 accuracy
- Change detection: Siamese network comparing pre/post imagery, flags new construction, destruction, vegetation change

## On-Device Inference

Compressed models for phone-side processing using TensorFlow Lite (Android) and Core ML (iOS).
- Wildfire smoke detection from camera: MobileNetV3, quantized INT8, ~80ms inference on iPhone 14
- Damage assessment from photos: EfficientNet-B0, ~120ms, outputs damage severity 0-4
- Scene classification: Is user indoors/outdoors, in vehicle, in open space, near structures

Model sizes: 5-15MB per model. Total on-device ML bundle: ~80MB. Updated via OTA monthly or on-demand during events.

## Fire and Smoke Identification Model (Shared CV Module)

A single fire/smoke detection model trained to operate across all lighting conditions: full daylight, dusk/dawn, nighttime, overcast, backlit by sun, smoke-obscured. Used in two contexts:

1. **Fire camera network processing (server-side):** Ingests feeds from staffed fire lookout cameras (ALERTCalifornia, ALERTWildfire). Runs full-resolution model on server GPU. Detects smoke columns before human observers in some conditions.

2. **User photo veracity scoring (on-device + server):** When users submit fire/flame sighting reports with photos, the model runs on-device for immediate feedback ("photo appears to contain smoke/flames") and again server-side at full resolution. Reports with CV-confirmed imagery receive higher confidence weighting in the sighting aggregation pipeline.

Training data: combination of ALERTWildfire historical camera footage (labeled), HPWREN fire imagery dataset, synthetic smoke overlays on landscape imagery for data augmentation across lighting conditions. Night detection uses IR-band simulation where available and visible-spectrum flame detection otherwise.

This model is the same one used by the street-level perception module for real-time change detection — a fire/smoke classification head sits alongside the general obstruction detection head in the shared backbone.

## Validation Pipeline

Automated validation runs on every model update:
- Holdout test sets per geography (urban, suburban, rural, wilderness) and per climate zone
- Minimum accuracy thresholds per task (must pass all to deploy)
- A/B comparison against previous model version
- Edge case test suite: clouds, shadows, snow cover, night imagery, post-disaster scenes
- Human review: 2% random sample from each production run, flagged tiles queued for manual review

Metrics tracked: precision, recall, F1, IoU (segmentation), mAP (detection), MAE (regression). Dashboards in Grafana.

## Automatic vs Manual Processing

Automatic processor handles ski resorts, campus layouts, and other structured environments where satellite+LiDAR provides sufficient detail. Uses template matching for known facility types.

Manual processor enables EMS personnel to draw evacuation zones, meeting points, shelter locations, resource staging areas. All manual edits versioned with audit trail. Verification workflow: editor submits, reviewer approves, changes go live. Conflicting edits from multiple EMS agencies resolved by jurisdiction hierarchy.

## Layer Conflict Resolution

When multiple sources disagree (e.g., OSM says road exists, satellite shows none): higher-resolution source wins by default. Recency tiebreaker if resolution is equal. Manual override available. Confidence score attached to every feature (0-1) based on source count and agreement.

Data quality score per tile: 0-100 based on source count, resolution, recency, and validation pass rate. Tiles scoring below 60 flagged for priority update.
