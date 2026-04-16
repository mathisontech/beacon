# CV/ML Map Processing Module

## 1. Overview
Extracts structured features from imagery (satellite, LiDAR, street-view) to populate map layers using computer vision and machine learning models.

## 2. Ownership
- VP: Platform Engineering
- Leads: CV/ML, Buildings, Roads, Vegetation, Street Perception
- Engineers: Perception (x1)

## 3. Parent Module
Platform Engineering

## 4. Submodules
- Building Detection
- Road Extraction
- Vegetation Analysis
- Land Cover Classification
- Change Detection
- Street Perception
- Privacy Pipeline

## 5. Goals
1. Extract features at >85% accuracy across all categories
2. Process 1M km²/month of satellite imagery
3. Support real-time street perception inference (<500ms)
4. Maintain privacy compliance in all outputs

## 6. Functions

| Function | Purpose | Input | Output | SLA | Accuracy Target |
|----------|---------|-------|--------|-----|-----------------|
| detect_building_footprint | Extract building boundaries | Satellite image | Polygon set | 30m | 90% IoU |
| classify_building_material | Identify roof/wall material | Building RGB+NIR | Material class | 15m | 85% F1 |
| estimate_building_height | Calculate height from shadows/stereo | DEM, Stereo image | Height (m) | 20m | ±2m RMSE |
| detect_soft_story | Flag weak story structures | Building footprint, LiDAR | Risk score | 10m | 80% recall |
| identify_building_purpose | Classify building use | Footprint, Context, OSM | Use class | 25m | 75% accuracy |
| detect_roof_geometry | Extract roof plane structure | Lidar point cloud | Plane set | 15m | 85% F1 |
| extract_road_network | Delineate road centerlines | Satellite image | LineString set | 30m | 85% F1 |
| measure_road_width | Calculate width per segment | Road centerline, Image | Width (m) | 10m | ±0.5m RMSE |
| classify_road_surface | Identify asphalt/gravel/dirt | Road image | Surface class | 10m | 85% accuracy |
| detect_bridge_condition | Assess bridge integrity | Bridge image, LiDAR | Condition score | 20m | 80% agreement |
| identify_road_markings | Extract lane/turn markings | Street imagery | Marking geometry | 15m | 85% precision |
| calculate_ndvi | Compute vegetation index | Satellite multispectral | NDVI raster | 5m | Normalized |
| estimate_canopy_height | Calculate tree height | LiDAR + Satellite | Height (m) | 15m | ±1.5m RMSE |
| classify_tree_species | Identify tree type | RGB+NIR, Canopy height | Species class | 30m | 70% accuracy |
| estimate_fuel_loading | Compute vegetation fuel mass | NDVI, Height, Species | Mass (tons/ha) | 20m | ±2 tons/ha |
| map_burn_scars | Identify burned areas | Pre/post imagery | Polygon set | 25m | 90% precision |
| measure_snow_cover | Detect snow extent | Multispectral image | Snow mask | 10m | 90% F1 |
| segment_land_cover_12class | Classify all land cover types | Satellite image | LC raster | 20m | 80% per-class |
| classify_impervious_surface | Detect built surfaces | Satellite + LiDAR | Imperviousness % | 15m | 80% accuracy |
| detect_parking_lots | Identify parking areas | RGB image | Polygon set | 15m | 85% precision |
| detect_pools | Locate swimming pools | RGB image | Polygon set | 15m | 80% precision |
| classify_fence_material | Identify fence type | Street image, Lidar | Material class | 10m | 75% accuracy |
| detect_gate_lock_type | Determine gate security | Street image | Lock type | 10m | 80% accuracy |
| identify_guardrails | Detect safety barriers | Street image, LiDAR | Location set | 10m | 85% recall |
| detect_boulders | Locate large rocks | Lidar point cloud | Boulder centroids | 10m | 80% F1 |
| compute_siamese_diff | Compare images for changes | Old image, New image | Difference heatmap | 30m | N/A |
| detect_structural_change | Identify building/road changes | Change heatmap | Change polygon set | 20m | 80% F1 |
| flag_new_construction | Mark new structures | Before/after imagery | Construction site polygons | 25m | 85% precision |
| detect_demolition | Identify removed structures | Before/after imagery | Demolition polygons | 20m | 80% precision |
| reproject_lidar_to_street | Align LiDAR to street view | LiDAR cloud, Camera pose | Projected cloud | 5m | <0.5m error |
| detect_scene_change_raft | Identify scene change types | Street image pair | Change type flags | 15m | 85% accuracy |
| classify_damage_severity | Rate structural damage | Damage image | Severity (1-5) | 10m | 80% agreement |
| run_ondevice_inference | Execute lightweight model | Mobile device data | Model output | 500ms | Model accuracy |
| run_batch_inference | Process imagery in bulk | Image batch | Prediction batch | 10m | Parallelized |
| validate_model_accuracy | Test model performance | Validation dataset | Accuracy report | 2h | Per-metric |
| promote_model_version | Deploy trained model | Validated model | Prod model | 5m | Post-deploy test |
| rollback_model | Revert to prior version | Prod model ID | Restored model | 5m | Validation check |
| blur_faces | Redact human faces | Image with faces | Blurred image | 10m | >99% coverage |
| blur_license_plates | Redact license plates | Image with plates | Blurred image | 5m | >99% coverage |
| validate_blur_completeness | Verify redaction quality | Blurred image | Validation report | 2m | Pass/fail |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| ml_models | Model registry | model_id, name, framework, version | Indefinite |
| model_versions | Version history | model_id, version, accuracy, deploy_date | 2 years |
| extraction_runs | Batch job records | run_id, model_id, input_source, status | 6 months |
| feature_confidence | Prediction confidence | feature_id, confidence_score, timestamp | 1 year |
| training_datasets | Dataset registry | dataset_id, size_gb, class_distribution | 1 year |

## 8. Frameworks & Libraries
- PyTorch: Primary training framework
- TensorFlow: Alternative training/inference
- TFLite: Mobile inference
- CoreML: iOS/macOS deployment
- ONNX: Cross-platform model format

## 9. Infrastructure
- GPU cluster: NVIDIA A100 (16x cards)
- Training: Batch processing on GPU
- Inference: Optimized for latency and throughput
- Edge deployment: TFLite on mobile devices

## 10. Accuracy Standards

| Category | Metric | Target |
|----------|--------|--------|
| Buildings | IoU | 90%+ |
| Roads | F1 Score | 85%+ |
| Vegetation | NDVI R² | >0.9 |
| Land Cover | Per-class accuracy | 80%+ |
| Street Perception | Damage classification | 80%+ agreement |
| Privacy Redaction | Coverage | >99% |

## 11. Model Versioning
- Semantic versioning (major.minor.patch)
- Pre-deployment validation on holdout test set
- A/B testing for gradual rollout
- Automatic rollback on accuracy drop >5%

## 12. Privacy & Compliance
- Face blur pipeline mandatory before output
- License plate redaction required
- Validation checks on 10% of outputs
- No raw street imagery retained >7 days

## 13. Integration Points
- Base Map module: Provides reference layers
- Hazard models: Consumes features
- Data pipeline: Accepts raw imagery
- Real-time systems: Street perception feeds

## 14. Cost Breakdown
- GPU cluster: ~$25K/yr amortized
- Model training: ~$10K/yr compute
- Data labeling: ~$30K/yr
- Library licenses: ~$5K/yr

## 15. Monitoring & Alerts
- Model accuracy drift detection
- Inference latency tracking
- GPU utilization monitoring
- Privacy validation pass rate
- Training job failure alerts

## 16. Dependencies
- Geospatial data (satellite, LiDAR, street imagery)
- Labeled training datasets (internal + external)
- GPU infrastructure
- Base map reference layers
- Privacy compliance framework
