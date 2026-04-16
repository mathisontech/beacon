# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## Development Plan: Claude Code Build Guide

---

### How to Use This Guide

Same rules as the global pipeline build guide: one step per Claude Code session, verify before proceeding, commit after each step. Reference the relevant layer doc for each step.

This plan is ordered by dependencies. Reference data first (no ML needed), then deterministic LiDAR processing, then ML model training, then ML-based extraction, then satellite and street view.

---

## Phase N0: Per-Source-Tile Prerequisite (2 steps)

Fast layers that provide land cover context for everything else.

### Step T.1 — WorldCover fetcher + standardizer

**Ask Claude:** "Build the WorldCover fetcher and standardize processor following the Per-Tile Pipeline doc. Download ESA WorldCover 3° tiles, validate class codes, compress as COG, write to S3. Use the same fetcher/processor/validate.py pattern as the global pipeline."

**Delivers:** Fetcher + processor + validator for WorldCover.

**Verify:** Tiles on S3. Class distribution logged. Open random tile in QGIS — valid classes, correct geography.

---

### Step T.2 — NLCD fetcher + standardizer

**Ask Claude:** "Build the NLCD fetcher and standardize processor. Download the national GeoTIFF, tile into 1° COGs, extract the impervious surface product as separate tiles, write to S3."

**Delivers:** Fetcher + processor + validator for NLCD.

**Verify:** Tiles cover CONUS. Class codes valid. Impervious surface 0-100%. Urban areas show high impervious.

---

## Phase N1: Reference Data (7 steps, all parallelizable)

Simple download-and-standardize layers. No ML. Can all be built simultaneously since they have no interdependencies.

### Step R.1 — LANDFIRE fuels

**Ask Claude:** "Build the LANDFIRE fetcher and processor per the Reference Data Layers doc. Download all 6 products (FBFM40, EVT, EVC, EVH, CBD, CC), tile into consistent COGs, write to S3."

**Delivers:** Fetcher + processor + validator.

**Verify:** All products downloaded. Fuel model codes valid. Coverage matches CONUS.

---

### Step R.2 — Census population + building disaggregation

**Ask Claude:** "Build the Census processor per the Reference Data Layers doc. Download census block data and ACS estimates. Build the dasymetric mapping function that distributes block population to buildings proportional to footprint area × floors. Output: population per 1km cell and population per building estimate."

**Delivers:** Census fetcher + population disaggregation processor.

**Verify:** Cell populations sum to county totals. Building population estimates non-negative. No building exceeds its block total.

> *This processor needs building footprints as input. Use Microsoft Building Footprints initially, swap to LiDAR/NAIP-derived footprints later when available.*

---

### Step R.3 — FEMA flood zones

**Ask Claude:** "Build the FEMA fetcher and processor. Download NFHL flood zone polygons, standardize into GeoParquet, compute per-building flood risk by spatial join with building footprints."

**Delivers:** Fetcher + processor + validator.

**Verify:** Flood zones valid polygons. Zone hierarchy logical. Buildings in known flood areas flagged.

---

### Step R.4 — Government boundaries

**Ask Claude:** "Build the boundaries processor. Download and standardize: state, county, city, census tract, school district, fire district, police jurisdiction, and protected area boundaries. All as GeoParquet."

**Delivers:** Fetcher + processor + validator.

**Verify:** Each boundary type tiles without gaps. State boundaries sum to CONUS.

---

### Step R.5 — Utility infrastructure

**Ask Claude:** "Build the utilities processor. Merge HIFLD transmission lines, OSM power data, EIA utility territories, HIFLD gas pipelines. Deduplicate where sources overlap. Output as GeoParquet."

**Delivers:** Fetcher + processor + validator.

**Verify:** Transmission lines connect between substations. Utility territories cover all states.

---

### Step R.6 — Seismic data

**Ask Claude:** "Build the seismic processor. Download USGS fault lines, NSHM hazard maps, derive liquefaction susceptibility raster. Output fault lines as GeoParquet, hazard as tiled raster."

**Delivers:** Fetcher + processor + validator.

**Verify:** Fault lines in California, Pacific NW. PGA highest near plate boundaries.

---

### Step R.7 — Burn history

**Ask Claude:** "Build the burn history processor. Download MTBS fire perimeters and NIFC perimeters. Merge and deduplicate. Compute years-since-last-burn raster."

**Delivers:** Fetcher + processor + validator.

**Verify:** Known major fires (Camp Fire, Dixie Fire) present. Years-since-burn = 0 for current year fires.

---

## Phase N2: LiDAR Pass 1 — Deterministic Processing (8 steps)

These are the non-ML LiDAR processors. No trained models needed. Process a small test project first, then scale to full queue.

### Step L.1 — 3DEP Fetcher

**Ask Claude:** "Build the 3DEP fetcher per the LiDAR Layer doc. Query USGS API for available projects. Download LAZ tiles for a small test project (~100 km²) with parallel downloads, checksum verification, manifest writing."

**Delivers:** 3DEP fetcher with --project-id and --limit flags.

**Verify:** LAZ tiles on S3. Manifest lists all tiles. lasinf validates files. Fetch log has telemetry.

---

### Step L.2 — lidar_classify (PDAL classification)

**Ask Claude:** "Build the lidar_classify processor per the LiDAR Layer doc. Run PDAL SMRF ground classification, height-based vegetation classification, building detection via planar clustering. Process the test project. Output classified LAZ."

**Delivers:** lidar_classify processor + validator.

**Verify:** Open classified point cloud in CloudCompare. Ground is green, buildings red, vegetation heights make sense. No large areas misclassified.

---

### Step L.3 — lidar_dem (DEM + DSM)

**Ask Claude:** "Build lidar_dem processor. Grid ground points to bare-earth DEM, first returns to DSM. Resolution based on QL level. Fill small voids. Build project VRT. Compare against Copernicus for gross errors."

**Delivers:** DEM + DSM processor + validator.

**Verify:** DEM opens in QGIS. Smooth terrain, buildings removed. DSM shows buildings and trees. Copernicus comparison shows < 2m systematic offset.

---

### Step L.4 — lidar_terrain_derivatives

**Ask Claude:** "Build lidar_terrain_derivatives. Compute slope, aspect, surface roughness, and depression depth from the LiDAR DEM VRT. Same approach as global slope/aspect but at 0.5-1m resolution."

**Delivers:** Terrain derivatives processor + validator.

**Verify:** Slope/aspect consistent with global versions but much more detailed. Depressions visible in known low-lying areas.

---

### Step L.5 — lidar_canopy

**Ask Claude:** "Build lidar_canopy processor per the LiDAR doc. Canopy height model, cover fraction, 5 height strata density rasters, understory density, vegetation gap mask."

**Delivers:** Canopy processor + validator.

**Verify:** Canopy height = DSM - DEM. Strata densities sum consistently. Gaps visible in open areas within forest.

---

### Step L.6 — lidar_intensity_texture

**Ask Claude:** "Build lidar_intensity_texture processor. Compute range-normalized intensity raster, surface texture (ground elevation variance), and flat-smooth mask (candidate paved surfaces)."

**Delivers:** Intensity/texture processor + validator.

**Verify:** Flat-smooth mask highlights known roads and parking lots. Intensity varies across surface types.

---

### Step L.7 — lidar_buildings_basic

**Ask Claude:** "Build lidar_buildings_basic processor. Cluster building-classified points, compute alpha-shape footprints, calculate height stats, estimate floors, compute inter-building distances. Output as GeoParquet."

**Delivers:** Building extraction processor + validator.

**Verify:** Building count reasonable for area. Heights > 0. Footprints match satellite view. No overlapping footprints.

---

### Step L.8 — lidar_shadow_coverage

**Ask Claude:** "Build lidar_shadow_coverage processor per the LiDAR doc. Compute point density, coverage confidence, shadow zones behind tall objects, shadow depth estimates. If flight trajectory available, use ray geometry. Otherwise infer from density patterns."

**Delivers:** Coverage/shadow processor + validator.

**Verify:** Shadow zones behind tall buildings. Low confidence in shadowed areas. High confidence in open areas with multiple scan passes.

> *This is one of the most important layers. Every downstream ML layer inherits this confidence. Get it right before proceeding.*

---

## Phase N3: ML Model Training (5 steps, parallel with N2)

Train the foundation and task models needed for Pass 2 processing.

### Step M.1 — Training infrastructure setup

**Ask Claude:** "Set up the ML training infrastructure. Create a training/ directory with: data loading for LiDAR point clouds, NAIP images, and Mapillary images. Config for GPU training (PyTorch). Logging with Weights & Biases or TensorBoard. Evaluation scripts for each model type."

**Delivers:** Training infrastructure. Data loaders. Eval scripts.

**Verify:** Can load a batch of LiDAR points and NAIP patches on GPU without errors.

---

### Step M.2 — ALSO foundation model pre-training

**Ask Claude:** "Implement the ray-aware occupancy network adapted from ALSO for aerial LiDAR per the ML Training Plan doc. Pre-train on 500+ km² of unlabeled 3DEP point clouds. Condition on DEM and shadow zone outputs from Pass 1. Output: per-point 512-dim embeddings."

**Delivers:** ALSO pre-training pipeline. Pre-trained model checkpoint.

**Verify:** Surface reconstruction quality on held-out data. Shadow zone prediction accuracy. Embeddings cluster meaningfully (buildings vs vegetation vs ground).

> *This takes 2-4 weeks of GPU time. Start early.*

---

### Step M.3 — LiDAR task model training (RandLA-Net)

**Ask Claude:** "Build the RandLA-Net classification model initialized with ALSO embeddings. Fine-tune on labeled data with the custom class taxonomy from the LiDAR doc. Implement active learning loop: model predicts → export low-confidence regions → human labels → retrain."

**Delivers:** Classification model + active learning pipeline.

**Verify:** 85%+ accuracy on holdout set. Confusion matrix reviewed for safety-critical classes.

> *Need labeled data first. See training data collection strategy in ML Training Plan.*

---

### Step M.4 — Street view detection model (YOLO)

**Ask Claude:** "Fine-tune YOLOv8-l for multi-class street view detection per the ML Training Plan. Detection heads for barriers, buildings, vegetation, infrastructure, surfaces, vehicles. Train on labeled Mapillary images."

**Delivers:** YOLO detection model + evaluation.

**Verify:** mAP > 0.7 on holdout set. Visually inspect detections on 100 random images.

---

### Step M.5 — NAIP task models (U-Net, YOLO)

**Ask Claude:** "Build the NAIP task models per the ML Training Plan: building segmentation (U-Net), vegetation classification (U-Net), surface classification (U-Net), pool detection (YOLO). Train each on appropriate labeled datasets."

**Delivers:** 4 NAIP models + evaluations.

**Verify:** Building IoU > 0.7. Vegetation accuracy > 85%. Pools mAP > 0.9.

---

## Phase N4: LiDAR Pass 2 — ML Extraction (5 steps)

Now that models are trained, run them on the classified LiDAR data.

### Step L.9 — lidar_ml_classify

**Ask Claude:** "Build lidar_ml_classify processor. Run the trained RandLA-Net model on classified LAZ from Pass 1. Output re-classified LAZ with custom classes and per-point confidence scores."

**Delivers:** ML classification processor + validator.

**Verify:** Custom classes (paved_candidate, shrub, fence_candidate, etc.) present. Confidence scores vary appropriately.

---

### Step L.10 — lidar_advanced_buildings

**Ask Claude:** "Build lidar_advanced_buildings processor per the LiDAR doc. Run PointNet++ on per-building point subsets for roof type, material estimate, solar panels, helicopter landing assessment."

**Delivers:** Advanced building processor + validator.

**Verify:** Roof types reasonable for region. Solar panels detected on known solar installations.

---

### Step L.11 — lidar_barriers

**Ask Claude:** "Build lidar_barriers processor. Extract fence, wall, guardrail polylines from ML-classified points. Compute height, length, type."

**Delivers:** Barrier processor + validator.

**Verify:** Barriers are linear. Heights 0.5-4m. Fences vs walls distinguished by thickness.

---

### Step L.12 — lidar_vegetation_detail + lidar_surface_features

**Ask Claude:** "Build lidar_vegetation_detail (individual trees, veg-structure distances, ladder fuel zones) and lidar_surface_features (power lines, curbs, road widths, parking, driveways, helicopter landing zones) per the LiDAR doc."

**Delivers:** 2 processors + validators.

**Verify:** Trees inside forest, not inside buildings. Power lines follow pole-to-pole. Road widths 3-30m.

---

### Step L.13 — lidar_soil_estimate

**Ask Claude:** "Build lidar_soil_estimate processor. Rough soil classification from intensity + texture + slope + vegetation context. Output: soil class estimate with low confidence scores."

**Delivers:** Soil processor + validator.

**Verify:** Rocky areas on steep slopes. Sandy near coasts. Confidence appropriately low almost everywhere.

---

## Phase N5: NAIP + Street View Processing (4 steps)

### Step S.1 — NAIP fetcher + all extraction processors

**Ask Claude:** "Build the NAIP fetcher and all extraction processors per the NAIP Satellite Layer doc: buildings, vegetation, surfaces, pools, residential edge, helicopter landing, coverage. Process one test state."

**Delivers:** Fetcher + 7 processors + validators.

**Verify:** Each layer produces reasonable output. Satellite view and extracted features align.

---

### Step S.2 — Mapillary fetcher + barrier processor

**Ask Claude:** "Build the Mapillary fetcher (download image metadata for target region) and the streetview_barriers processor per the Street View Layer doc. Run detection model on images, associate across multi-view sequences, project to map coordinates."

**Delivers:** Fetcher + barrier processor + validator.

**Verify:** Barriers geo-located near property edges. Types classified. Heights estimated.

---

### Step S.3 — Remaining street view processors

**Ask Claude:** "Build the remaining street view processors per the Street View Layer doc: buildings/facades, storefronts, vegetation, ground surface, infrastructure, coverage."

**Delivers:** 6 processors + validators.

**Verify:** Storefronts match OSM POIs. Fire hydrants detected. Coverage model shows blind spots behind buildings.

---

### Step S.4 — All coverage/blind-spot layers

**Ask Claude:** "Verify that all three source-specific coverage layers are complete and consistent: LiDAR shadow_coverage, NAIP canopy_occlusion + cloud_shadow, and Mapillary visibility_depth. Each should produce a 0-1 confidence raster documenting where that source can and cannot observe."

**Delivers:** Verified coverage layers for all three primary sources.

**Verify:** Dense forest: LiDAR confidence high (penetrates canopy), NAIP confidence low (sees only treetops), street view confidence low (road only). Open suburban: all three high. No road: street view confidence 0.

---

## Phase N6: Automation + Full Pipeline (3 steps)

### Step N.1 — National orchestrator

**Ask Claude:** "Build the national pipeline orchestrator. Manages project queue (3DEP), state queue (NAIP), region queue (Mapillary). Priority ordering. Dependency tracking between Pass 1 and Pass 2. Integrates with the global pipeline orchestrator."

**Delivers:** National orchestrator with priority queue.

**Verify:** Queue processes test project through both passes. NAIP and street view run after LiDAR for same area.

---

### Step N.2 — Version comparison system

**Ask Claude:** "Build the version comparison system per the LiDAR doc. When new data supersedes old, compare outputs: building changes, vegetation changes, elevation changes. Flag anomalies. Write comparison report."

**Delivers:** Version comparison processor.

**Verify:** Process two overlapping LiDAR projects. Comparison detects known changes.

---

### Step N.3 — Coverage dashboard

**Ask Claude:** "Build a simple web dashboard showing: which cells have which layers, from which sources, at what recency. Color-coded map of data completeness. Flag cells with stale data or missing sources."

**Delivers:** Coverage tracking dashboard.

**Verify:** Dashboard shows test project area as complete. Surrounding area shows gaps.

---

## Step Summary

| Phase | Steps | What |
|-------|-------|------|
| N0 | T.1-T.2 | WorldCover + NLCD (prerequisite) |
| N1 | R.1-R.7 | Reference data (LANDFIRE, Census, FEMA, boundaries, utilities, seismic, burn history) |
| N2 | L.1-L.8 | LiDAR Pass 1 deterministic (classify, DEM, terrain, canopy, intensity, buildings, shadow) |
| N3 | M.1-M.5 | ML model training (ALSO, RandLA-Net, YOLO, U-Net) — parallel with N2 |
| N4 | L.9-L.13 | LiDAR Pass 2 ML extraction (refined classify, advanced buildings, barriers, vegetation, features, soil) |
| N5 | S.1-S.4 | NAIP + Street View processing |
| N6 | N.1-N.3 | Automation, version comparison, coverage dashboard |

**34 steps total.** Combined with the 22 global pipeline steps and 2 per-tile steps: **58 steps** for the complete World Base Map.

**The critical path:** ML training (Phase N3) is the bottleneck. Start it as early as possible, in parallel with Pass 1 deterministic processing. Everything in Pass 2 and most of NAIP/street view depends on trained models.
