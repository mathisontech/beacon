# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## NAIP Satellite (Aerial Imagery) Layer

---

### Source Overview

NAIP (National Agriculture Imagery Program) provides 0.6m resolution aerial imagery covering all of CONUS. This is the highest-resolution free imagery available for the US and is the primary source for overhead visual feature extraction.

| Property | Value |
|----------|-------|
| Coverage | Continental US (all states) |
| Resolution | 0.6m (some areas 0.3m) |
| Bands | 4-band: RGB + NIR (near-infrared) |
| Format | COG (Cloud-Optimized GeoTIFF) |
| Update cycle | Every 2-3 years per state |
| Access | Free via AWS open data, USDA |

### Processing Strategy

NAIP is processed **per state flight** — each state is flown as a unit every 2-3 years. Processing produces independent estimation layers for every feature visible from overhead. Each layer includes a coverage/confidence model.

Unlike LiDAR which sees in 3D, NAIP sees only the top surface — roofs, tree canopy, pavement. But it sees **color and texture** which LiDAR cannot. And unlike Sentinel-2 (10m), NAIP at 0.6m can resolve individual buildings, pools, driveways, and large vehicles.

### Fetcher: naip

Downloads NAIP imagery for target states from AWS open data.

**Takes in:** AWS S3 open data bucket / USDA Geospatial Data Gateway

**Spits out:**
- Raw COG tiles: `raw/naip/v{NNN}/{state}_{year}/{tile}.tif`
- Manifest with tile inventory, dates, cloud cover notes

**Schedule:** Check quarterly for new state releases. Process immediately on availability.

---

## Extraction Layers

All layers are independent estimates. The fusion model merges them with LiDAR and street view estimates downstream.

### Processor: naip_buildings

Building footprint extraction from overhead imagery.

**Model architecture:** U-Net with ResNet-34 encoder, trained on NAIP imagery with Google Open Buildings / Microsoft Building Footprints as ground truth labels.

**Spits out (GeoParquet):** `naip/v{NNN}/{state}/buildings.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Polygon. Building footprint from image segmentation |
| area_m2 | Float. Footprint area |
| roof_color | Classified: white/gray/brown/red/blue/dark/green |
| roof_material_hint | metal (high reflectance) / shingle (texture) / flat_membrane / tile / unknown |
| has_solar_panels | Boolean. Detected from visual pattern on roof |
| has_pool_adjacent | Boolean. Pool detected within 20m |
| shadow_length_m | Float. Measured shadow → height estimate (requires sun angle from metadata) |
| height_from_shadow_m | Float. Estimated from shadow_length and sun angle |
| confidence | Float 0-1 |

**Training data:** ~20 diverse US cities, labels from Microsoft Building Footprints verified against NAIP imagery. ~500,000 buildings for training. Active learning on failure cases.

**Validation:** Compare footprint count against Microsoft/Google in holdout areas. IoU > 0.7 on matching buildings.

---

### Processor: naip_vegetation

Vegetation classification from spectral bands (RGB + NIR).

**Model architecture:** Random forest on per-pixel spectral features + texture, with deep learning (U-Net) for boundary refinement.

**Spits out (raster per tile):**
- Vegetation mask: `naip/v{NNN}/{state}/vegetation/mask/{tile}.tif` (UInt8: bare/grass/shrub/tree_canopy/crop)
- NDVI: `naip/v{NNN}/{state}/vegetation/ndvi/{tile}.tif` (Float32, -1 to 1 — NIR band enables this)
- Shrub locations (GeoParquet polygons): `naip/v{NNN}/{state}/vegetation/shrubs.parquet`
  - Fields: geom, area_m2, ndvi_mean, adjacent_to_structure (boolean), is_transitional_fuel_candidate
  - *Shrubs are the "bridge fuels" for WUI fire spread. NAIP + NIR can separate photosynthetic shrubs from dead vegetation and bare ground.*
- Tree canopy (GeoParquet polygons): `naip/v{NNN}/{state}/vegetation/tree_canopy.parquet`
  - Fields: geom, area_m2, ndvi_mean, species_hint (deciduous/conifer from spectral signature), canopy_density

**Why NIR matters:** The near-infrared band separates live vegetation (high NIR reflectance) from dead vegetation and bare ground (low NIR) far more reliably than RGB alone. This is critical for fuel moisture estimation in fire modeling.

**Validation:** Vegetation mask correlates with NLCD land cover. NDVI values reasonable (-0.1 to 0.9 for land). Shrub detection correlates with known WUI areas.

---

### Processor: naip_surfaces

Ground surface classification from overhead imagery.

**Model architecture:** U-Net with spectral + texture features. NIR helps separate impervious (low NIR) from pervious (variable NIR) surfaces.

**Spits out (raster per tile):**
- Surface class: `naip/v{NNN}/{state}/surfaces/class/{tile}.tif`
  - Classes: asphalt / concrete / gravel / dirt / sand / grass / water / bare_soil / unknown
- Impervious surface mask: `naip/v{NNN}/{state}/surfaces/impervious/{tile}.tif` (UInt8, binary)

**Spits out (GeoParquet vectors):**
- Pavement polygons: `naip/v{NNN}/{state}/surfaces/pavement.parquet`
  - Fields: geom, surface_type, area_m2, is_road, is_parking_lot, is_driveway
- Parking lots: `naip/v{NNN}/{state}/surfaces/parking_lots.parquet`
  - Fields: geom, area_m2, est_vehicle_capacity, surface_type, helicopter_landable
- Driveways: `naip/v{NNN}/{state}/surfaces/driveways.parquet`
  - Fields: geom (linestring), width_m, surface_type, connects_to_road, connects_to_building
- Road width estimates: `naip/v{NNN}/{state}/surfaces/road_widths.parquet`
  - Fields: geom (point along centerline), visible_width_m, has_visible_parking (cars along edge)
  - *Complements LiDAR road width. NAIP can see lane markings and parked cars that indicate actual usable width.*

**Validation:** Impervious mask correlates with NLCD developed classes. Parking lots at known shopping centers detected.

---

### Processor: naip_pools

Swimming pool detection. Straightforward overhead CV task.

**Model architecture:** YOLO-v8 object detection fine-tuned on pool examples.

**Spits out (GeoParquet):** `naip/v{NNN}/{state}/pools.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Point. Pool centroid |
| area_m2 | Float. Pool surface area |
| pool_type | in_ground / above_ground / commercial (from size and shape) |
| nearest_building_id | FK to building layer |
| confidence | Float 0-1 |

**Why pools matter for emergencies:**
- Water source for firefighting (especially in areas with limited hydrants)
- Drowning hazard during floods (debris, visibility)
- Location indicator for residential density and property type

**Training data:** ~5,000 labeled pools from diverse regions. High accuracy is achievable — pools are visually distinctive from overhead (blue rectangles/ovals).

**Validation:** Pool density correlates with suburban residential areas. No pools detected in commercial/industrial zones (except commercial pools which are larger).

---

### Processor: naip_residential_edge

Detects the boundary between residential/urban development and wildland/agricultural areas.

**Model architecture:** Sliding-window binary classifier (developed vs. undeveloped) → edge extraction on the classification boundary.

**Spits out (GeoParquet):** `naip/v{NNN}/{state}/residential_edge.parquet`

| Field | How Populated |
|-------|---------------|
| geom | LineString. The WUI boundary line |
| edge_type | abrupt (development ends sharply at forest/wildland) / gradual (scattered structures into vegetation) / intermix (structures embedded in wildland vegetation) |
| development_density_inside | structures per km² on developed side |
| vegetation_density_outside | NDVI mean on wildland side |
| confidence | Float 0-1 |

**Why this matters:** The Wildland-Urban Interface (WUI) boundary is where most structure fires during wildfires begin. Knowing exactly where development meets wildland, and the nature of that transition, is critical for fire modeling.

**Validation:** Compare against existing USFS WUI maps. Edge should generally agree but may differ where development has expanded since USFS last mapped.

---

### Processor: naip_helicopter_landing

Overhead assessment of potential helicopter landing zones.

**Takes in:** Surface classification + vegetation mask + building footprints + slope from DEM

**Spits out (GeoParquet):** `naip/v{NNN}/{state}/helicopter_landing.parquet`

| Field | How Populated |
|-------|---------------|
| geom | Polygon. Landing zone boundary |
| area_m2 | Float. Clear area |
| surface_type | From surface classifier |
| max_slope_deg | From DEM within zone |
| nearest_obstruction_m | Distance to nearest tree/building/pole |
| obstruction_height_m | Height of nearest obstruction |
| approach_clear | Boolean. At least one direction has >200m clear approach |
| zone_type | open_field / parking_lot / roof / athletic_field / cleared_area |
| confidence | Float 0-1 |

**Validation:** Known helipads detected. Hospital parking lots flagged. No landing zones on steep slopes or in dense forest.

---

### Processor: naip_coverage

What NAIP can and cannot observe from overhead.

**Spits out (raster per tile):**
- Coverage date: `naip/v{NNN}/{state}/coverage/date/{tile}.tif` (UInt16, days since epoch — when this area was last flown)
- Cloud/shadow mask: `naip/v{NNN}/{state}/coverage/cloud_shadow/{tile}.tif` (UInt8, binary — areas obscured by clouds or their shadows)
- Canopy occlusion: `naip/v{NNN}/{state}/coverage/canopy_occlusion/{tile}.tif` (Float32, 0-1)
  - *What fraction of the ground is hidden by tree canopy?*
  - *In a dense forest, NAIP sees only treetops. Ground features (fences, streams, paths) are invisible.*
  - *This is the satellite equivalent of LiDAR's shadow zone: areas where the source fundamentally cannot observe.*
- Overall confidence: `naip/v{NNN}/{state}/coverage/confidence/{tile}.tif` (Float32, 0-1)
  - 1.0 = clear sky, open ground, recent flight
  - 0.5 = under partial canopy, some ground visible
  - 0.1 = dense canopy, ground essentially invisible
  - 0.0 = cloud-covered or no NAIP coverage

**Why canopy occlusion matters:** Under dense tree cover, NAIP cannot see the ground at all. Fences, paths, driveways, small structures, and ground vegetation are invisible. The confidence layer tells the fusion model where to rely on LiDAR (which penetrates canopy) instead of NAIP.

---

## Database Tables (NAIP-Specific)

**naip_buildings** — footprints with roof properties, solar panels, shadow-derived height
**naip_pools** — pool locations with size and type
**naip_parking_lots** — parking areas with capacity and landing potential
**naip_driveways** — driveway linestrings connecting buildings to roads
**naip_shrubs** — shrub polygons with transitional fuel flagging
**naip_residential_edge** — WUI boundary lines with edge type classification

All tables include `source = 'naip'` and `confidence` field. All are independent estimates that feed the downstream fusion model.

---

## Model Training Plan

| Model | Architecture | Training Data | Target Metric |
|-------|-------------|---------------|---------------|
| Building segmentation | U-Net + ResNet-34 | MS/Google footprints as labels, 20 cities | IoU > 0.7 |
| Vegetation classification | U-Net + spectral | NLCD as weak labels, manual refinement | 85% pixel accuracy |
| Surface classification | U-Net + spectral | Manual labels on diverse surfaces | 80% pixel accuracy |
| Pool detection | YOLOv8-l | ~5,000 labeled pools | mAP > 0.9 |
| Residential edge | Binary classifier | Manual edge labels in 10 WUI zones | Edge within 50m of truth |
| Helicopter landing | Rule-based + classifier | Manual labels on known helipads + open areas | 90% recall on known sites |

**Training progression:** Start with rule-based/heuristic versions of each layer. Replace with ML models as training data accumulates. The heuristic versions provide weak labels for bootstrapping the ML training.
