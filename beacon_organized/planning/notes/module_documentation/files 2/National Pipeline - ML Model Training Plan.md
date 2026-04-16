# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## ML Model Training Plan

---

### Training Architecture Overview

The national pipeline requires trained models at three levels:

1. **Self-supervised foundation models** — Pre-trained on massive unlabeled data. Learn geometric and visual representations without human labels. Expensive to train once, then reused everywhere.

2. **Task-specific supervised models** — Fine-tuned on labeled data for specific extraction tasks (building segmentation, barrier classification, etc.). Moderate training cost, need labeled datasets.

3. **Cross-modal fusion model (LeJEPA)** — Learns correspondences between LiDAR, satellite, and street view. Self-supervised on paired multi-modal data. Enables each modality to fill in what others miss.

---

## Foundation Models

### Model F1: Ray-Aware Geometric Foundation (ALSO-adapted)

**Purpose:** Learn aerial LiDAR physics from massive unlabeled 3DEP data. Produces rich per-point embeddings that understand both scene geometry and sensor limitations.

**Architecture:** Neural implicit occupancy network conditioned on LiDAR ray geometry.

**Key adaptation for aerial LiDAR:**
- ALSO was built for automotive (horizontal) LiDAR. Aerial LiDAR is nearly nadir with different occlusion patterns.
- Incorporate flight trajectory data so model learns scan angle effects on point density and shadow zones.
- Condition on DEM and shadow zone maps from the deterministic Pass 1 processors.

**Pre-training task:** Given a subset of LiDAR rays from a scene, predict occupancy along held-out rays. Forces the model to learn:
- Buildings have vertical walls below rooftops
- Trees have trunks below canopy
- Shadows behind tall objects are likely populated by surfaces not directly observed
- Density variations reflect sensor geometry, not scene geometry

**Training data:** Raw unlabeled 3DEP point clouds. Target: 500+ km² across diverse terrain (urban, suburban, rural, forested, mountainous, coastal). No human labels needed.

**Training compute:** ~2-4 weeks on 4× A100 GPUs. One-time cost.

**Output:** 512-dimensional per-point embeddings. Also produces refined detection confidence layer as a byproduct.

**Validation:** Compare surface reconstruction quality against ground truth (withhold known ground points, predict their positions). Measure shadow zone prediction accuracy against multi-pass LiDAR areas.

---

### Model F2: Street View Visual Foundation

**Purpose:** General visual feature extraction from street-level imagery.

**Architecture:** DINOv2 ViT-L or similar self-supervised vision transformer.

**Pre-training:** Use off-the-shelf DINOv2 weights (pre-trained on internet images). Fine-tune on Mapillary imagery to adapt to street-view-specific distribution (camera angles, motion blur, lens distortion, vehicle dashboard reflections).

**Training data:** 1M+ Mapillary images, unlabeled. Self-supervised fine-tuning only.

**Output:** Per-image feature embeddings used as backbone for all street view task-specific models.

---

### Model F3: Satellite Visual Foundation

**Purpose:** Feature extraction from NAIP aerial imagery, adapted for 4-band (RGB + NIR).

**Architecture:** ViT-L adapted for 4-channel input.

**Pre-training:** Start from satellite-specific foundation model (SatMAE, SatCLIP, or similar). Fine-tune on NAIP 4-band imagery to learn spectral signatures specific to US landscape types.

**Training data:** NAIP tiles from 20+ states, ~10,000 tiles. Self-supervised.

**Output:** Per-patch feature embeddings used as backbone for NAIP task-specific models.

---

## Task-Specific Models (LiDAR)

### Model L1: Point Cloud Classification (RandLA-Net)

**Purpose:** Refine PDAL classification into custom class taxonomy.

| Custom Class | Training Source |
|--------------|----------------|
| paved_candidate | Manual labels on flat-smooth areas |
| unpaved_candidate | Manual labels on rough ground |
| grass | Manual labels + LANDFIRE cross-reference |
| shrub | Manual labels + NAIP NDVI cross-reference |
| deciduous_tree | Manual labels on leaf-off/leaf-on comparison |
| conifer | Manual labels (year-round canopy) |
| dead_vegetation | Manual labels (low NDVI + standing structure) |
| building | DALES transfer → fine-tune |
| shed/small_structure | Manual labels (small footprint, low height) |
| power_line | DALES transfer → fine-tune |
| fence_candidate | DALES transfer → fine-tune |
| wall_candidate | Manual labels (thick vertical surfaces) |
| curb | Manual labels on QL1 data only |

**Architecture:** RandLA-Net backbone initialized with Model F1 (ALSO) embeddings.

**Training data needed:** ~50 km² hand-labeled at custom taxonomy.

**Labeling strategy:**
1. Run PDAL classification as baseline
2. Pre-label using DALES transfer for building/fence/power_line
3. Human annotators correct and add custom classes
4. Active learning: model classifies → human reviews worst-confidence areas → retrain
5. Target: 3-5 labeling rounds to reach 85%+ accuracy

**Training compute:** ~1 week on 2× A100 per round.

---

### Model L2: Building Analysis (PointNet++)

**Purpose:** Roof type, material estimate, solar panel detection, helicopter landing assessment per building.

**Architecture:** PointNet++ operating on per-building point cloud subsets (cropped by footprint polygon).

**Training data:** Buildings with known attributes from county assessor records (roof type, year built, material). Match assessor records to LiDAR-detected buildings by spatial join.

**Labeling strategy:** No manual labeling needed — assessor data provides labels. Challenge is acquiring and cleaning assessor records across jurisdictions.

**Training data estimate:** ~50,000 buildings with assessor labels across 10 diverse counties.

---

### Model L3: Vegetation Detail

**Purpose:** Individual tree detection, species group classification.

**Architecture:** PointNet++ on vegetation-classified point subsets.

**Training data:** Manually labeled trees in forested and suburban areas. USFS Forest Inventory and Analysis (FIA) plots provide ground-truth species and height data in some locations.

---

## Task-Specific Models (Street View)

### Model S1: Multi-Class Object Detector (YOLO)

**Purpose:** Detect all target objects in street-view frames.

**Architecture:** YOLOv8-l with custom detection heads.

**Detection classes (grouped by head):**
- **Barriers:** fence, wall, guardrail, bollard, hedge, gate
- **Buildings:** facade, entrance, garage_door, storefront, signage
- **Vegetation:** tree, shrub, ground_cover, dead_vegetation
- **Infrastructure:** fire_hydrant, utility_pole, traffic_sign, street_light, storm_drain, transformer_box
- **Surface:** road_edge, sidewalk_edge, driveway_entrance, parking_area
- **Vehicles:** parked_car, parked_truck (for street parking detection)

**Training data:** ~10,000 images hand-labeled across 20+ US cities.

**Labeling strategy:**
1. Use Mapillary's pre-extracted detections as weak labels for common objects
2. Hand-label custom classes (storefront types, barrier types, specific infrastructure)
3. Active learning iterations

**Training compute:** ~3 days on 2× A100 per iteration.

---

### Model S2: Material Classification (ResNet-50)

**Purpose:** Classify material of detected objects from cropped image patches.

**Architecture:** ResNet-50 image classifier on detection crops.

**Material classes:** chainlink, wood, vinyl, brick, concrete, stone, metal, glass, stucco, shingle, tile, membrane, vegetation, unknown

**Training data:** ~20,000 labeled material patches (500 per material type × ~40 material/object combinations).

---

### Model S3: Storefront / Facility Classifier

**Purpose:** Identify business type from storefront appearance and signage.

**Architecture:** Two-stage: (1) OCR on signage → text extraction, (2) Image classifier + text features → facility type.

**Facility categories:** school, hospital, clinic, pharmacy, fire_station, police_station, religious_institution, gas_station, grocery, big_box_retail, restaurant, bank, government_office, ice_cream_shop, cold_storage, auto_repair, hardware_store, hotel, daycare, nursing_home, unknown

**Training data:**
1. Match OSM POI tags to Mapillary images by location
2. Use matched pairs as training data (image of building at POI location → POI category label)
3. ~10,000 matched pairs across categories
4. Hand-label ambiguous cases

---

### Model S4: Monocular Depth (MiDaS fine-tuned)

**Purpose:** Estimate distance from camera to objects for geo-projection.

**Architecture:** MiDaS v3.1 / DPT-Large fine-tuned on street-view depth.

**Training data:** Generate pseudo ground-truth depth maps from multi-view Mapillary sequences using structure-from-motion (COLMAP). Fine-tune pre-trained MiDaS on these.

---

## Task-Specific Models (NAIP Satellite)

### Model A1: Building Segmentation (U-Net)

**Purpose:** Extract building footprints from overhead imagery.

**Architecture:** U-Net with ResNet-34 encoder, 4-channel input (RGB + NIR).

**Training data:** Microsoft/Google building footprints as labels. Verified against NAIP imagery in 20 cities.

---

### Model A2: Vegetation Classification (U-Net)

**Purpose:** Classify vegetation type from spectral signature.

**Architecture:** U-Net with spectral band features.

**Training data:** NLCD as weak labels, manually refined in 10 sample regions.

---

### Model A3: Surface Classification (U-Net)

**Purpose:** Classify ground surface type from color and texture.

**Architecture:** U-Net with spectral + texture features.

**Training data:** Manual labels on diverse surfaces. OSM surface tags as weak labels for road segments.

---

### Model A4: Pool Detection (YOLOv8)

**Purpose:** Detect swimming pools from overhead.

**Training data:** ~5,000 labeled pools from diverse suburban regions.

---

## Cross-Modal Fusion Model (Future)

### Model X1: LeJEPA Multi-Modal Fusion

**Purpose:** Learn to predict representations across modalities. Given any one source, predict what the other sources would see. Enables each source to compensate for others' blind spots.

**Architecture:** JEPA prediction framework with SIGReg loss (LeJEPA).

**Encoder branches:**
- LiDAR branch: Takes Model F1 (ALSO) embeddings
- Satellite branch: Takes Model F3 (NAIP foundation) embeddings
- Street view branch: Takes Model F2 (street view foundation) embeddings

**Prediction tasks (self-supervised):**
1. LiDAR embedding → predict satellite embedding (learn what surfaces look like from above)
2. Satellite embedding → predict LiDAR embedding (learn 3D structure from 2D appearance)
3. LiDAR + satellite → predict street view (learn ground-level detail from overhead)
4. Street view → predict LiDAR (learn 3D geometry from facade photos)

**Training data:** Spatially aligned LiDAR + NAIP + Mapillary data. No human labels needed — the pairing is the supervision signal. Target: 200+ km² with all three sources available.

**Training compute:** ~2-4 weeks on 4× A100.

**Output:** Per-location multi-modal embedding that the downstream fusion pipeline uses to produce merged layers.

---

## Training Data Collection Strategy

### Phase 1: Bootstrap with existing labels (Months 1-3)
- Download Microsoft/Google building footprints → labels for A1
- Download DALES dataset → pre-train L1 on 8 classes
- Download FIA plots → labels for L3 vegetation
- Match OSM POIs to Mapillary images → labels for S3 storefronts
- Use Mapillary pre-extracted features → weak labels for S1

### Phase 2: Manual labeling campaign (Months 3-6)
- Label ~50 km² of LiDAR with custom classes → L1
- Label ~10,000 street view images → S1
- Label ~20,000 material patches → S2
- Label barrier segments in 20 cities → S1 + S2
- Label surface types in diverse areas → A3 + S1

### Phase 3: Active learning iteration (Months 6-12)
- Deploy models, collect lowest-confidence predictions
- Human review and correction of model failures
- Retrain with expanded labeled set
- Repeat 3-5 times per model

### Phase 4: Foundation model pre-training (Months 3-6, parallel with Phase 2)
- Pre-train F1 (ALSO) on unlabeled 3DEP → 500+ km²
- Fine-tune F2 (DINOv2) on Mapillary → 1M+ images
- Fine-tune F3 (SatMAE) on NAIP → 10,000+ tiles

### Phase 5: Cross-modal fusion (Months 12-18)
- Pre-train X1 (LeJEPA) on spatially aligned multi-modal data
- Evaluate cross-modal prediction quality
- Iterate on prediction tasks and architecture

---

## Hardware Requirements

| Phase | Hardware | Duration | Estimated Cost |
|-------|----------|----------|----------------|
| F1 (ALSO pre-training) | 4× A100 80GB | 2-4 weeks | $3,000-6,000 (cloud) |
| F2 (DINOv2 fine-tune) | 2× A100 | 3-5 days | $500-1,000 |
| F3 (SatMAE fine-tune) | 2× A100 | 3-5 days | $500-1,000 |
| L1-L3 (LiDAR task models) | 2× A100 | 1 week each × 3-5 rounds | $1,000-2,000 per model |
| S1-S4 (Street view models) | 2× A100 | 3 days each × 3-5 rounds | $500-1,000 per model |
| A1-A4 (NAIP models) | 2× A100 | 3 days each × 3-5 rounds | $500-1,000 per model |
| X1 (LeJEPA fusion) | 4× A100 | 2-4 weeks | $3,000-6,000 |
| **Total estimated** | | | **$15,000-30,000** |

Cloud GPUs (Lambda Labs, Vast.ai) at ~$1.50-3/hr per A100. Own hardware amortizes quickly if training becomes ongoing.
