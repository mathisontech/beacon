# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## Street View (Mapillary) Layer

---

### Source Overview

Mapillary provides crowdsourced street-level imagery. Unlike LiDAR (top-down) or satellite (overhead), street view sees the world from the side — the perspective humans experience. This makes it the primary source for material identification, facade analysis, and ground-level object detection.

| Property | Value |
|----------|-------|
| Coverage | Major US roads well-covered, suburban/rural gaps |
| Resolution | Varies (phone cameras to professional rigs) |
| Format | JPEG images with GPS, compass heading, timestamps |
| Update cycle | Continuous crowd-sourced uploads |
| Access | Free API for research, commercial licensing available |

### Processing Strategy

Street view is processed **per coverage area** — geographic regions where imagery exists. Unlike LiDAR's single-pass overhead view, street view provides a drive-by perspective with natural multi-view sequences (the same object seen from multiple angles as the vehicle passes).

Processing produces **independent estimation layers** for every feature the camera can see. Each layer includes a blind-spot/coverage model documenting what the camera could and could not observe (blocked by parked cars, around corners, down side streets with no coverage).

### Fetcher: mapillary

Downloads image metadata and sequences for target regions.

**Takes in:** Mapillary API / tile endpoints

**Spits out:**
- Image metadata (GPS, heading, timestamp, sequence ID): `raw/mapillary/v{NNN}/{region_id}/metadata.parquet`
- Image tiles or download URLs: `raw/mapillary/v{NNN}/{region_id}/images/`
- Coverage map: which road segments have imagery, from which dates

**Schedule:** Monthly check for new coverage in client regions. Quarterly for expansion areas.

---

### Core Architecture: Multi-View Object Detection

Street view processing uses a **multi-view correspondence pipeline**. Instead of analyzing single images independently, the system leverages the fact that a vehicle driving past an object captures it from multiple angles across sequential frames.

**Stage 1: Single-frame detection** — Run object detection / segmentation on each image independently. Produces candidate detections with bounding boxes, class labels, and confidence.

**Stage 2: Multi-view association** — Match detections across frames in a sequence. The same fence seen in frames 12, 13, and 14 from different angles becomes a single geo-located fence object with multi-view evidence.

**Stage 3: Monocular depth estimation** — Estimate distance from camera to detected objects. Combined with GPS and compass heading, this places each detection on the map with a position confidence.

**Stage 4: Property extraction** — For each geo-located object, extract properties visible in the images: material, condition, dimensions, sub-type.

**Model architecture:**

**Detection backbone:** YOLO-v8 or similar real-time detector, fine-tuned on street-view-specific training data. Separate detection heads for different object categories.

**Multi-view fusion:** Natural multi-view correspondence using sequential frames (the car drove past and saw it from multiple angles — far better than synthetic augmentation, as we discussed). Objects observed from more angles get higher confidence.

**Depth estimation:** Monocular depth network (MiDaS or DPT) for distance estimation. Combined with camera GPS + heading for map projection.

**LeJEPA cross-modal (future):** Self-supervised pre-training on paired street view + LiDAR data. The model learns to predict what the LiDAR embedding should look like given a street view image, enabling it to infer 3D geometry from 2D photos in areas without LiDAR.

---

## Extraction Layers

Each layer is an independent estimate. The fusion model (separate pipeline, not covered here) will merge these with LiDAR and satellite estimates downstream.

### Layer: streetview_barriers

Fences, walls, guardrails, bollards, hedges, berms.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/barriers.parquet`

| Field | How Populated |
|-------|---------------|
| geom | LineString. Barrier location projected from camera GPS + depth estimate |
| barrier_type | fence_chainlink / fence_wood / fence_metal / fence_vinyl / wall_brick / wall_concrete / wall_stone / hedge / guardrail / bollard / berm / unknown |
| height_estimate_m | From monocular depth + known camera height |
| material | chainlink / wood / vinyl / brick / concrete / stone / metal / vegetation / unknown |
| has_gate | Boolean. Gate detected along this barrier segment |
| gate_width_estimate_m | If gate detected, estimated opening width |
| condition | good / fair / poor / damaged (visible damage, lean, missing sections) |
| climbable | Boolean estimate (chainlink=yes, tall smooth wall=no) |
| fire_resistance | low (wood, vinyl) / medium (chainlink) / high (brick, concrete, stone) |
| passable_on_foot | Boolean estimate (climbable OR gate OR damaged opening) |
| passable_by_vehicle | Boolean estimate (gate wide enough OR missing section) |
| n_views | Number of frames this barrier was observed in |
| confidence | Float 0-1. Higher with more views and clearer imagery |

**Training data:** Hand-labeled barrier segments in diverse neighborhoods (suburban, urban, rural). ~5,000 labeled barriers across 20+ cities for initial model. Active learning to expand.

---

### Layer: streetview_buildings

Facade analysis — what street view can tell about buildings that overhead imagery cannot.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/buildings.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Point. Building location (matched to nearest LiDAR/satellite building footprint) |
| matched_building_id | FK to lidar_buildings or satellite_buildings if matchable |
| facade_material | brick / wood_siding / vinyl_siding / stucco / stone / glass / metal / concrete / unknown |
| est_floors_visible | Integer. Floors visible from street (may differ from LiDAR total if only one side visible) |
| has_storefront | Boolean. Ground-floor commercial glass frontage |
| storefront_type | If has_storefront: classified from signage/appearance |
| has_garage | Boolean. Visible garage door |
| garage_width_estimate_m | Width of garage opening |
| entrance_location | Point. Detected primary entrance (door) location |
| window_density | low / medium / high (indicator of occupancy type) |
| condition | good / fair / poor / damaged |
| fire_vulnerability | Low (brick/concrete) / medium (stucco) / high (wood/vinyl) — from material |
| confidence | Float 0-1 |
| n_views | Frames this building facade was observed in |

---

### Layer: streetview_storefronts

Specific business and facility identification from signage and appearance.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/storefronts.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Point. Storefront location |
| matched_building_id | FK to building layer |
| business_type | Classified from signage, appearance, and context |
| facility_category | Categories relevant for emergency response: |
| | school / hospital / clinic / pharmacy / fire_station / police_station / |
| | religious_institution / gas_station / grocery / big_box_retail / |
| | restaurant / bank / government / ice_cream_shop / cold_storage / |
| | auto_repair / hardware_store / hotel / daycare / nursing_home / |
| | veterinary / other_commercial / unknown |
| has_walk_in_freezer | Boolean estimate (ice cream shops, restaurants, grocery = likely) |
| has_vault | Boolean estimate (banks = likely) |
| has_fuel_storage | Boolean estimate (gas stations, auto repair = likely) |
| tornado_shelter_potential | none / low / medium / high — based on construction + internal space |
| signage_text | OCR'd text from visible signage (for matching/verification) |
| confidence | Float 0-1 |

**Why ice cream shops and banks matter:** Walk-in freezers and bank vaults are known tornado shelter locations for people caught in the open. Gas stations have fuel storage that creates explosion risk. These facility-level classifications directly feed hazard models.

**Training data:** Start with OSM POI tags for ground truth matching. Train signage recognition model on labeled storefront images. ~10,000 labeled storefronts across diverse commercial areas.

---

### Layer: streetview_vegetation

Trees, shrubs, ground cover visible from street level.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/vegetation.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Point or polygon. Vegetation location |
| veg_type | tree / shrub / hedge / ground_cover / ornamental / dead_standing / unknown |
| height_estimate_m | From monocular depth |
| species_hint | deciduous / conifer / palm / broadleaf_shrub / unknown (visual classification) |
| proximity_to_structure_m | Distance to nearest building |
| is_transitional_fuel | Boolean. Could this carry fire between wildland and structure? |
| condition | healthy / stressed / dead / recently_pruned |
| confidence | Float 0-1 |

**Transitional fuel identification:** Shrubs, ornamental plants, and unmaintained vegetation adjacent to structures are "bridge fuels" that enable fire to spread from wildland to urban areas. This is exactly the gap in traditional wildfire models.

---

### Layer: streetview_ground_surface

Road surface, sidewalks, driveways, parking visible at street level.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/ground_surface.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Polygon. Surface area |
| surface_type | asphalt / concrete / gravel / dirt / grass / sand / water / unknown |
| is_road | Boolean |
| is_sidewalk | Boolean |
| is_driveway | Boolean |
| is_parking | Boolean |
| condition | good / cracked / potholed / flooded / debris_covered |
| est_road_width_m | If road: estimated width from camera |
| est_lane_count | If road: visible lane count |
| has_street_parking | Boolean. Cars parked along road edge |
| confidence | Float 0-1 |

---

### Layer: streetview_infrastructure

Fire hydrants, utility poles, signs, storm drains, mailboxes, benches, and other street furniture.

**Spits out (GeoParquet):** `mapillary/v{NNN}/{region_id}/infrastructure.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Point. Object location |
| object_type | fire_hydrant / utility_pole / traffic_sign / stop_sign / street_light / storm_drain / mailbox / bench / bus_stop / dumpster / transformer_box / unknown |
| height_estimate_m | From monocular depth |
| condition | good / fair / damaged |
| confidence | Float 0-1 |

**Fire hydrant locations** are particularly critical for firefighting operations and are poorly mapped in most areas.

---

### Layer: streetview_coverage

What street view can and cannot see. The blind-spot model.

**Spits out (raster per tile):**
- Coverage density: `mapillary/v{NNN}/{region_id}/coverage/density/{tile}.tif` (Float32, images per 100m road segment)
- Coverage recency: `mapillary/v{NNN}/{region_id}/coverage/recency/{tile}.tif` (UInt16, days since most recent image)
- Visibility depth: `mapillary/v{NNN}/{region_id}/coverage/visibility/{tile}.tif` (Float32, meters — how far from the road can the camera see)
  - *Blocked by buildings, fences, vegetation. Decreases rapidly with distance from road.*
  - *This is the street view equivalent of LiDAR's shadow zone layer.*
- Coverage confidence: `mapillary/v{NNN}/{region_id}/coverage/confidence/{tile}.tif` (Float32, 0-1)
  - 1.0 = multiple recent images from multiple angles, good visibility
  - 0.5 = single pass, recent, clear views
  - 0.2 = old imagery (>3 years), single angle
  - 0.0 = no street view coverage (no road with imagery)

**Why this matters:** Street view can only see what's visible from the road. A house set 50m back behind trees is invisible. A backyard fence is invisible from the front. The coverage model documents exactly where street view evidence exists and where downstream layers are extrapolating or relying on other sources.

---

## Model Training Plan

### Detection Model (YOLO-based)

**Architecture:** YOLOv8-l fine-tuned for street-view multi-class detection

**Training data strategy:**
1. Start with Mapillary's pre-extracted detections as weak labels
2. Hand-label ~10,000 images across diverse US regions for custom classes
3. Active learning: deploy model, human-review lowest-confidence detections, relabel, retrain
4. Target: 80%+ mAP on holdout set for all classes

**Classes (detection heads):**
- Barriers: fence, wall, guardrail, bollard, hedge, gate
- Buildings: facade, entrance, garage, storefront, signage
- Vegetation: tree, shrub, ground_cover, dead_vegetation
- Infrastructure: hydrant, pole, sign, storm_drain, transformer
- Surface: road_edge, sidewalk_edge, driveway, parking_area
- Vehicles: parked_car, parked_truck (for street parking detection)

### Material Classification Model

**Architecture:** ResNet-50 operating on cropped detection patches

**Training data:** ~20,000 labeled material patches (500 per material type × ~40 material types)

**Output:** Per-detection material classification with confidence

### Monocular Depth Model

**Architecture:** MiDaS v3.1 or DPT-Large, fine-tuned on street-view-specific depth data

**Training data:** Use structure-from-motion on multi-view Mapillary sequences to generate pseudo ground-truth depth maps. Fine-tune pre-trained model on these.

### Multi-View Correspondence

**Architecture:** Feature matching across sequential frames using SuperGlue or LightGlue

**Training:** Self-supervised on Mapillary sequences — the same object in consecutive frames provides natural training pairs (as discussed: this is better than synthetic augmentation because it provides real viewpoint variation)

### LeJEPA Cross-Modal (Future)

**Architecture:** JEPA prediction framework with SIGReg loss (~50 lines of core code)

**Training:** Self-supervised on paired street view + LiDAR data. Prediction tasks:
- Given street view embedding of a facade, predict the LiDAR embedding of that building
- Given LiDAR geometry of a barrier, predict what the street view sees

**Purpose:** Enables inference of 3D geometry from street view alone in areas without LiDAR, and inference of material/appearance from LiDAR alone in areas without street view.

---

## Database Tables (Street View-Specific)

All street view tables follow the same pattern as LiDAR tables — independent estimates that will be merged downstream. Tables include `source = 'streetview'` to distinguish from LiDAR and satellite estimates of the same features.

**streetview_barriers** — same schema as lidar_barriers plus material, gate, climbability, fire resistance fields

**streetview_buildings** — facade-level properties not visible from above

**streetview_storefronts** — business/facility classification from signage

**streetview_vegetation** — species hints and condition from visual appearance

**streetview_infrastructure** — fire hydrants, poles, signs, drains

**streetview_ground_surface** — surface type classification from visual appearance
