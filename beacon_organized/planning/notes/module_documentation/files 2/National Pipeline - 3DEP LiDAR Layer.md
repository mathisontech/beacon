# World Base Map — National Processing Pipeline

**US-specific data sources processed by project, state, or region**

## 3DEP LiDAR Layer

---

### Source Overview

USGS 3DEP (3D Elevation Program) provides airborne LiDAR point clouds covering the US. Data arrives as individual acquisition projects (e.g., "FL_Peninsular_2018") with varying coverage, density, and quality levels.

| Property | Value |
|----------|-------|
| Coverage | ~90% of CONUS, growing |
| Resolution | QL1 (8+ pts/m²) or QL2 (2+ pts/m²) |
| Format | LAZ (compressed LAS) |
| Update cycle | Per-project, varies by region (1-10 year refresh) |
| Typical project | 500-50,000 km², one state or county |

### Processing Strategy

LiDAR is processed **per project**, not per tile or per cell. A project is the natural unit — all data within a project shares the same acquisition parameters, density, and quality. Processing per project means:
- Consistent quality within the processing unit
- Edge handling between projects (different dates, densities) is explicit
- Projects can be prioritized by client need
- New projects can be processed independently without rerunning existing coverage

After per-project processing, outputs are chopped into 1km cells for the per-cell pipeline.

### Fetcher: usgs_3dep

Downloads LiDAR projects from USGS repositories. Checks for new projects monthly.

**Takes in:** USGS 3DEP API / Entwine index / AWS open data bucket

**Spits out:**
- Raw LAZ files: `s3://beacon-atlas/national_base_map/raw/3dep/v{NNN}/{project_id}/{tile}.laz`
- Flight trajectory (if available): `s3://beacon-atlas/national_base_map/raw/3dep/v{NNN}/{project_id}/trajectory/`
- Manifest: `s3://beacon-atlas/national_base_map/raw/3dep/v{NNN}/{project_id}/manifest.json`

**Schedule:** Check monthly for new projects. Prioritize: (1) client regions, (2) high-risk areas, (3) fill gaps.

**Pseudocode:**
1. Query USGS 3DEP API for projects updated since last check
2. For each new/updated project:
   - Compare against existing coverage
   - *If supersedes existing project, flag for reprocessing*
   - Download all LAZ tiles (parallel, resume on failure)
   - Download flight trajectory if available
   - Verify checksums
   - Write manifest with project metadata (date, density, QL level, CRS, extent)
3. Write fetch log

**Validation:** All LAZ tiles valid (lasinf check), point count matches manifest, CRS consistent within project, density matches declared QL level.

---

### Processing: Two-Pass Architecture

LiDAR processing runs in two passes per project:

**Pass 1: Classification + Rasterization** — Deterministic processing that produces standard rasters and classified point clouds. No ML models. Uses PDAL filters and GDAL.

**Pass 2: ML Extraction** — Deep learning models that extract objects, classify materials, and produce the advanced layers. Uses the classified output from Pass 1 as input.

This split means Pass 1 can run immediately on any new project. Pass 2 can be added/improved over time as models are trained, without rerunning Pass 1.

---

## Pass 1 Processors (Deterministic)

### Processor: lidar_classify

Point cloud classification using PDAL's standard filters.

**Takes in:** Raw LAZ tiles from fetcher

**Spits out:** Classified LAZ with standard classes:
- `s3://beacon-atlas/national_base_map/3dep/v{NNN}/{project_id}/classified/{tile}.laz`
- Classification: ground (2), low veg (3), medium veg (4), high veg (5), building (6), noise (7), water (9), bridge deck (17), overhead structure (18)

**Pseudocode:**
1. For each LAZ tile in the project:
   - Run PDAL noise filter (statistical outlier removal)
   - Run PDAL SMRF ground classification
   - Run PDAL HAG (height above ground) computation
   - Classify by height bands: low veg (0.15-1m), medium veg (1-3m), high veg (>3m)
   - Building classification: planar clusters above 2m HAG with area >10m²
   - Write classified LAZ
2. Log per-tile: point count per class, processing time, any classification warnings

**Validation:** No tiles 100% noise, ground classification present in all tiles, building class present in tiles with known structures.

---

### Processor: lidar_dem

High-resolution DEM from ground-classified points.

**Takes in:** Classified LAZ (ground points)

**Spits out:**
- Bare-earth DEM: `3dep/v{NNN}/{project_id}/dem/{tile}.tif` (Float32, meters, COG)
- DSM (surface model): `3dep/v{NNN}/{project_id}/dsm/{tile}.tif`
- Project VRT for each: `3dep/v{NNN}/{project_id}/dem/project.vrt`

**Resolution:** Matches source QL. QL1: 0.5m. QL2: 1m.

**Pseudocode:**
1. Grid ground-classified points to DEM raster (IDW interpolation)
2. Grid first-return points to DSM raster
3. Fill small voids (< 5m diameter) by interpolation
4. Flag larger voids (buildings, water) as nodata
5. Build project VRT
6. Compare against Copernicus DEM for gross error detection
   - *Flag any pixel where |3DEP - Copernicus| > 20m as suspect*

**Validation:** Elevation range plausible for region, void percentage < expected for density, Copernicus comparison shows no systematic offset > 2m.

---

### Processor: lidar_terrain_derivatives

Slope, aspect, surface roughness, depression depth from the 3DEP DEM.

**Takes in:** Project DEM VRT

**Spits out (per tile):**
- Slope: `3dep/v{NNN}/{project_id}/slope/{tile}.tif` (Float32, degrees)
- Aspect: `3dep/v{NNN}/{project_id}/aspect/{tile}.tif` (Float32, 0-360, flat=-1)
- Surface roughness: `3dep/v{NNN}/{project_id}/roughness/{tile}.tif` (Float32, std dev of elevation in 5m window)
- Depression depth: `3dep/v{NNN}/{project_id}/depressions/{tile}.tif` (Float32, meters below pour point)
  - *Identifies pooling areas for flood modeling. Every local minimum that would trap water.*

**Validation:** Same checks as global slope/aspect, plus roughness values reasonable for land cover type.

---

### Processor: lidar_canopy

Vegetation structure from classified vegetation points.

**Takes in:** Classified LAZ (vegetation classes) + project DEM

**Spits out (per tile):**
- Canopy height model: `3dep/v{NNN}/{project_id}/canopy/height/{tile}.tif` (Float32, meters — DSM minus DEM)
- Canopy cover fraction: `3dep/v{NNN}/{project_id}/canopy/cover/{tile}.tif` (Float32, 0-1, ratio of veg returns to total in 5m window)
- Height strata density (5 bands):
  - `canopy/strata_0_05m/{tile}.tif` — ground cover, 0-0.5m (pts/m²)
  - `canopy/strata_05_1m/{tile}.tif` — low shrubs, 0.5-1m
  - `canopy/strata_1_3m/{tile}.tif` — tall shrubs / small trees, 1-3m
  - `canopy/strata_3_10m/{tile}.tif` — understory / small canopy, 3-10m
  - `canopy/strata_10m_plus/{tile}.tif` — canopy, 10m+
- Understory density: `canopy/understory/{tile}.tif` (Float32, veg point density below half canopy height)
- Vegetation gap mask: `canopy/gaps/{tile}.tif` (UInt8, binary — gaps >5m diameter in otherwise continuous canopy)

**Why these matter:**
- Strata density drives fuel ladder estimation (fire climbing from ground to canopy)
- Understory density determines ground-level visibility and foot passability
- Gap mask identifies defensible space and potential landing zones within forested areas

**Validation:** Canopy height >= 0. Cover fraction 0-1. Strata densities sum consistently with canopy cover.

---

### Processor: lidar_intensity_texture

Surface characteristics from return intensity and ground point patterns.

**Takes in:** Classified LAZ (ground points) with intensity values

**Spits out (per tile):**
- Intensity raster: `3dep/v{NNN}/{project_id}/surface/intensity/{tile}.tif` (UInt16, range-normalized mean intensity of ground returns)
- Surface texture: `3dep/v{NNN}/{project_id}/surface/texture/{tile}.tif` (Float32, local elevation variance of ground points in 2m window)
- Flat-smooth mask: `3dep/v{NNN}/{project_id}/surface/flat_smooth/{tile}.tif` (UInt8, binary — areas where slope < 3° AND texture < threshold)
  - *Candidate pavement/hardscape. Must be confirmed by satellite or street view.*

**Why this matters:** Intensity + texture can't distinguish asphalt from packed dirt, but they CAN identify "flat, smooth, hard surface" which narrows possibilities for the fusion model.

**Validation:** Intensity values non-zero where ground exists. Flat-smooth mask correlates with known road corridors.

---

### Processor: lidar_buildings_basic

Rule-based building extraction without ML. Produces initial footprints and heights.

**Takes in:** Classified LAZ (building class) + project DEM

**Spits out:**
- Building footprints (GeoParquet): `3dep/v{NNN}/{project_id}/buildings/footprints.parquet`
  - Fields: geom (polygon), height_mean, height_max, height_min, height_std, area_m2, n_points, confidence
- Building centroids (GeoParquet): `3dep/v{NNN}/{project_id}/buildings/centroids.parquet`
  - Fields: geom (point), building_id (FK to footprints), height_mean
- Estimated floor count: `height_mean / 3.5` rounded (stored in footprints as est_floors)

**Pseudocode:**
1. Cluster building-classified points (DBSCAN, eps based on density)
2. For each cluster:
   - Compute alpha shape → footprint polygon
   - Calculate height stats (mean, max, min, std HAG)
   - Estimate floor count (mean height / 3.5m per floor)
   - Confidence based on: point density, shape regularity, height consistency
3. Compute inter-building distances → nearest_building_distance field

**Validation:** Footprint count reasonable for land use type. Heights > 0 and < 500m. No overlapping footprints.

---

### Processor: lidar_shadow_coverage

The detection confidence / blind-spot analysis. Documents where LiDAR could and could not observe.

**Takes in:** Raw LAZ (all points) + flight trajectory (if available) + project DEM + building footprints

**Spits out (per tile):**
- Point density: `3dep/v{NNN}/{project_id}/coverage/density/{tile}.tif` (Float32, pts/m²)
- Coverage confidence: `3dep/v{NNN}/{project_id}/coverage/confidence/{tile}.tif` (Float32, 0-1)
  - 1.0 = well-observed from multiple angles
  - 0.5 = single-pass coverage, adequate
  - 0.1 = deep shadow behind tall structure, minimal returns
  - 0.0 = zero coverage below a certain height
- Shadow zones: `3dep/v{NNN}/{project_id}/coverage/shadows/{tile}.tif` (UInt8 mask — areas with near-zero ground returns behind tall objects)
- Shadow depth estimate: `3dep/v{NNN}/{project_id}/coverage/shadow_depth/{tile}.tif` (Float32, meters — estimated horizontal extent of blind spot based on object height and scan angle)

**Pseudocode:**
1. Compute point density per 1m² cell
2. If flight trajectory available:
   - For each scan line, compute ray angles to ground
   - Identify cells shadowed by tall objects (buildings, trees) based on geometry
   - Estimate shadow depth: `object_height * tan(90° - scan_angle)`
3. If no trajectory:
   - Infer shadow zones from density patterns (sudden drops behind tall objects)
   - Lower confidence in shadow estimates
4. Compute overall confidence: f(density, n_scan_passes, shadow_status)

**Why this is critical:** Every downstream layer inherits this confidence. A building height estimated from 3 points in a shadow zone is less trustworthy than one from 200 points with multi-angle coverage. The fusion model uses this to weight LiDAR evidence against other sources.

**Validation:** Density matches declared QL level on average. Shadow zones correlate with tall objects. No confidence > 1.0.

---

## Pass 2 Processors (ML-Based)

These require trained models. See the ML Model Training Plan for training data strategy and architecture details.

### Processor: lidar_ml_classify

Deep learning point cloud classification that refines the PDAL classification from Pass 1.

**Takes in:** Classified LAZ from lidar_classify + coverage confidence from lidar_shadow_coverage

**Model architecture:** RandLA-Net backbone pre-trained with ALSO-inspired ray-aware objective on unlabeled 3DEP data, then fine-tuned on labeled data with custom class taxonomy.

**Custom class taxonomy (beyond standard LAS classes):**
- Ground subtypes: paved_candidate, unpaved_candidate, water
- Vegetation subtypes: grass, shrub, deciduous_tree, conifer, dead_vegetation
- Structure subtypes: building, shed/small_structure, cylindrical (tank/silo)
- Linear features: power_line, fence_candidate, wall_candidate, guardrail
- Surface features: curb, sidewalk_edge, retaining_wall

**Spits out:**
- Re-classified LAZ with custom classes: `3dep/v{NNN}/{project_id}/ml_classified/{tile}.laz`
- Per-point confidence scores (stored as extra dimension in LAZ)

**Training data requirements:**
- ~50 km² hand-labeled at custom taxonomy (diverse: urban, suburban, rural, forested)
- DALES provides 8-class starting point for transfer learning
- Active learning loop: model classifies → human corrects worst-confidence regions → retrain

**Validation:** Classification accuracy > 85% on holdout set. Confusion matrix reviewed manually for safety-critical classes (buildings, power lines).

---

### Processor: lidar_advanced_buildings

ML-enhanced building analysis. Extracts roof type, estimates materials, identifies features.

**Takes in:** ML-classified LAZ + building footprints from Pass 1 + coverage confidence

**Spits out (added to footprints GeoParquet):**
- roof_type: flat | gable | hip | complex | unknown
- roof_material_estimate: metal | shingle | tile | membrane | unknown (confidence score)
- has_solar_panels: boolean estimate
- helicopter_landable: boolean (flat roof, area > 100m², no obstructions within 10m above)
- building_condition_flags: height_variance_anomaly, lean_detected, partial_collapse_candidate

**Model architecture:** PointNet++ operating on per-building point subsets, trained on buildings with known attributes from assessor data.

**Validation:** Roof type accuracy > 75% on holdout. Helicopter landing candidates reviewed manually for first 100.

---

### Processor: lidar_barriers

Fence, wall, guardrail detection and classification from LiDAR.

**Takes in:** ML-classified LAZ (fence_candidate, wall_candidate, guardrail classes) + coverage confidence

**Spits out:**
- Barrier polylines (GeoParquet): `3dep/v{NNN}/{project_id}/barriers/barriers.parquet`
  - Fields: geom (linestring), barrier_type (fence | wall | guardrail | berm | unknown), height_mean, height_max, length_m, confidence
  - *This is the LiDAR-only estimate. Street view will produce its own barrier layer.*
  - *The fusion model will merge them for the final barrier layer.*

**Why LiDAR barriers are limited but valuable:**
- LiDAR CAN see: height, length, position, whether it's thin (fence) vs thick (wall)
- LiDAR CANNOT reliably see: material, climbability, gate locations, condition
- These limitations are exactly what street view fills in

**Validation:** Barriers are linear (not blobby). Heights reasonable (0.5-4m). Lengths > 2m.

---

### Processor: lidar_vegetation_detail

Individual tree detection and vegetation classification.

**Takes in:** ML-classified LAZ (vegetation subtypes) + canopy layers from Pass 1 + DEM

**Spits out:**
- Individual tree points (GeoParquet): `3dep/v{NNN}/{project_id}/vegetation/trees.parquet`
  - Fields: geom (point), height_m, crown_diameter_m, species_group (conifer | deciduous | palm | dead), confidence
- Vegetation-to-structure distances: `3dep/v{NNN}/{project_id}/vegetation/veg_structure_distance.parquet`
  - Fields: tree_id, nearest_building_id, distance_m, angle_degrees
  - *Critical for defensible space assessment*
- Ladder fuel zones (GeoParquet polygons): areas where continuous vegetation exists from ground cover through understory to canopy
  - Fields: geom, min_height, max_height, horizontal_extent_m

**Validation:** Tree count reasonable for canopy cover. Heights consistent with canopy height model. No trees inside building footprints.

---

### Processor: lidar_surface_features

Extracts ground-level features that LiDAR can detect geometrically.

**Takes in:** ML-classified LAZ + DEM + building footprints + road corridors (from OSM)

**Spits out:**
- Power line segments (GeoParquet): `3dep/v{NNN}/{project_id}/features/power_lines.parquet`
  - Fields: geom (linestring), height_mean, height_min (sag point), span_length_m, confidence
  - *Confidence lower for single-pass coverage. Wire perpendicular to flight path = fewer hits.*
- Curb lines (GeoParquet): `3dep/v{NNN}/{project_id}/features/curbs.parquet`
  - Fields: geom (linestring), height_cm (curb height above road), confidence
  - *Only detectable at QL1 (8+ pts/m²). QL2 areas get confidence = 0.*
- Road width estimates (GeoParquet): `3dep/v{NNN}/{project_id}/features/road_widths.parquet`
  - Fields: geom (point along road centerline), width_m, has_parking (boolean — asymmetric width suggests street parking), confidence
- Parking area candidates (GeoParquet polygons): `3dep/v{NNN}/{project_id}/features/parking.parquet`
  - Fields: geom, area_m2, surface_type_hint (from flat-smooth mask)
- Driveway candidates (GeoParquet linestrings): `3dep/v{NNN}/{project_id}/features/driveways.parquet`
  - Fields: geom, width_m, connects_to_road (boolean), connects_to_building (boolean)
- Helicopter landing candidates (GeoParquet polygons): areas flat enough and clear enough for landing
  - Fields: geom, area_m2, max_slope_deg, min_clearance_m (height of nearest obstacle), surface_type_hint

**Validation:** Power lines follow pole-to-pole patterns. Curbs parallel roads. Road widths 3-30m. Landing zones actually flat and clear.

---

### Processor: lidar_soil_estimate

Rough soil classification from LiDAR-derivable signals.

**Takes in:** Intensity raster + surface texture + DEM + slope + vegetation layers + coverage confidence

**Spits out:**
- Soil class estimate: `3dep/v{NNN}/{project_id}/soil/class/{tile}.tif`
  - Classes: rocky, sandy_candidate, clay_candidate, organic_candidate, unknown
  - *Very rough. LiDAR intensity correlates weakly with surface material.*
  - *Primary purpose: flag rocky ground (high intensity, rough texture) vs soft ground (lower intensity, smooth)*
- Soil confidence: `3dep/v{NNN}/{project_id}/soil/confidence/{tile}.tif` (Float32, 0-1)
  - *Will be low almost everywhere. This is a weak signal that the fusion model combines with satellite color.*

**Validation:** Rocky areas correlate with steep slopes and sparse vegetation. Sandy candidates near expected geographic features.

---

## Database Tables (LiDAR-Specific)

**lidar_buildings** — Written by lidar_buildings_basic + lidar_advanced_buildings
| Field | How Populated |
|-------|---------------|
| id | Auto-increment |
| geom | Polygon. Alpha shape from building-classified point cluster |
| centroid | Point. Centroid of footprint (for spatial indexing) |
| project_id | Which 3DEP project this came from |
| height_mean | Float. Mean HAG of building points |
| height_max | Float. Max HAG |
| area_m2 | Float. Footprint area |
| est_floors | Integer. height_mean / 3.5, rounded |
| roof_type | flat/gable/hip/complex/unknown (from ML processor) |
| roof_material_estimate | metal/shingle/tile/membrane/unknown (from ML processor) |
| has_solar_panels | Boolean (from ML processor) |
| helicopter_landable | Boolean (flat, large, clear — from ML processor) |
| nearest_building_distance_m | Float. Distance to nearest other building |
| confidence | Float 0-1. Based on point density and coverage confidence |
| coverage_confidence | Float 0-1. From shadow/coverage processor |

**lidar_barriers** — Written by lidar_barriers
| Field | How Populated |
|-------|---------------|
| id | Auto-increment |
| geom | LineString. Barrier centerline |
| project_id | 3DEP project source |
| barrier_type | fence/wall/guardrail/berm/unknown (from ML classification) |
| height_mean | Float. Mean barrier height in meters |
| length_m | Float. Total barrier length |
| confidence | Float 0-1 |

**lidar_trees** — Written by lidar_vegetation_detail
| Field | How Populated |
|-------|---------------|
| id | Auto-increment |
| geom | Point. Tree crown center |
| project_id | 3DEP project source |
| height_m | Float. Tree height from DEM |
| crown_diameter_m | Float. Estimated crown spread |
| species_group | conifer/deciduous/palm/dead (from ML classification) |
| nearest_building_id | FK to lidar_buildings |
| distance_to_nearest_building_m | Float. For defensible space |
| confidence | Float 0-1 |

**lidar_power_lines** — Written by lidar_surface_features
| Field | How Populated |
|-------|---------------|
| id | Auto-increment |
| geom | LineString. Power line segment |
| height_mean | Float. Average wire height |
| height_min | Float. Sag point height |
| span_length_m | Float. Distance between poles |
| confidence | Float 0-1. Low for wires perpendicular to flight path |

---

## Version Comparison

When a new LiDAR project supersedes an existing one for the same area, the processor compares versions:

1. Load previous version's outputs for the overlap area
2. Compute change statistics:
   - New buildings appeared / buildings disappeared
   - Vegetation height changes > 5m (clearing or growth)
   - Ground elevation changes > 1m (grading, construction)
   - Road width changes
3. Flag gross anomalies (building disappeared but no construction detected → possible classification error in new data)
4. Write comparison report to update_logs

This catches processing errors before they corrupt the live data.

---

## Rendering

**Raster layers:** Cell-chopped versions served as BTS-RASTER PNGs via CloudFront after per-cell compositing.

**Vector layers (buildings, barriers, trees, power lines, features):** Served from PostGIS via pg_tileserv as BTS-VECTOR-HAZARD or BTS-VECTOR-ROAD style MVT tiles, with MapLibre GL JS v4.x for 2D and CesiumJS v1.119+ for 3D (clamped to terrain).

**Coverage/confidence layers:** Served as BTS-RASTER with color ramp (green = high confidence, red = low/shadow zone) for administrator visualization of data quality.
