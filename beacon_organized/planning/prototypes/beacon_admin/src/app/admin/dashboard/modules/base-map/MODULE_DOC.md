# Base Map Module Development Documentation

**Status:** Development Planning
**Version:** 1.0
**Last Updated:** 2026-03-25
**Owner:** Base Map Manager
**Scope:** Foundational geographic data system for Beacon emergency management platform

---

## Executive Summary

The Base Map module is the geographic data foundation for all Beacon operations. It integrates terrain, buildings, roads, vegetation, infrastructure, population density, and hazard zones from 30+ global data sources into a unified, versioned digital twin. The module serves 5+ downstream hazard models, evacuation routing, notifications, public/EMS/admin interfaces, and agentic planners.

**Key Stats:**
- **Coverage:** Global (fallback) + Enhanced US (high-res)
- **Grid:** 1km × 1km cells
- **Tile Format:** PMTiles with Zstandard compression
- **Update Frequency:** Scheduled (monthly), post-event (4-6hrs), user-reported (real-time)
- **Confidence Range:** 0.2-0.5 (global), 0.4-0.7 (enhanced US), 0.7-0.9 (full US)
- **Processing Throughput:** 10,000 tiles/hour on 8× A100 GPUs

---

## 1. Module Architecture & Ownership Structure

### 1.1 Five Sub-Managers

```
Base Map Module (Director)
├── Base Map Manager
│   ├── Alignment Processor (registration, multi-source harmonization)
│   ├── Building Extraction (footprints, attributes, vulnerability)
│   ├── Road Extraction (network, geometry, passability)
│   ├── Terrain Extraction (DEM, slope, traversability)
│   ├── Vegetation Extraction (EVT, fuel loading, canopy)
│   ├── Infrastructure Detection (utilities, hazmat, dams)
│   └── Population Estimation (census, time-of-day, capacity)
│
├── Event-Triggered Update Manager
│   ├── Post-Event Resurvey Coordinator
│   ├── Satellite Tasking Integration
│   └── Conflict Resolution (new vs. baseline data)
│
├── User-Requested Map Adjustment Manager
│   ├── Manual Report Processor
│   ├── Persistent Change Validator
│   └── Transient Obstruction Handler
│
├── User-Created Map Layers Manager
│   ├── EMS Evacuation Zone Editor
│   ├── Utility Zone Manager
│   ├── Private Layer Permissions
│   └── Non-Private Layer Federation
│
└── Automated Sensor-Driven Map Attributes
    ├── Traversability Inference (device movement)
    ├── Building Attribute Inference (sensors)
    ├── Real-Time Perception (street-level cameras)
    └── Sensor Data Fusion
```

### 1.2 Organizational Structure

| Role | Responsibility | Team | SLA |
|------|---|---|---|
| Base Map Director | Strategic oversight, version control, rollback approval | Director-level | Strategic |
| Data Pipeline Lead | Overall system design, SLA management, version numbering | Data Operations | System-wide |
| Alignment Specialist | Geospatial registration, CRS normalization, grid alignment | Data Operations | Per-tile |
| Building Extraction Lead | ML model training, footprint detection, attribute extraction | ML/CV Team | Monthly refresh |
| Road Extraction Lead | Network topology, width measurement, passability modeling | ML/CV Team | Monthly refresh |
| Terrain Lead | DEM processing, derivative calculation, traversability | Data Operations | Annual (3DEP) |
| Vegetation Lead | LANDFIRE integration, canopy metrics, fuel loading | ML/CV Team | Biennial |
| Infrastructure Lead | Utility detection, hazmat facility identification | Data Operations | Annual |
| Demographics Lead | Population estimation, occupancy modeling, Census integration | Data Science | Annual |
| Digital Twin Custodian | Version management, PostgreSQL/S3 maintenance, rollback procedures | Infrastructure | Continuous |
| Tile Delivery Lead | PMTiles generation, CDN optimization, client caching | Platform Engineering | Per-release |
| Source Refresh Coordinator | Track release calendars, detect new data, trigger ingestion | Data Operations | Per-source |
| Post-Event Update Specialist | Coordinate satellite tasking, manage resurvey assets | Field Operations | Event-triggered |
| Validation Specialist | Quality gates, regression detection, promotion sign-off | Data Quality | Per-update |

---

## 2. Complete Functionality Map

### 2.1 Data Sources & Integration

**Primary Data Sources:**

| Tier | Source | Resolution | Frequency | Coverage | Cost |
|------|--------|-----------|-----------|----------|------|
| **US Enhanced** | 3DEP LiDAR | 1m | 1-2/year | US (select regions) | Free (USGS) |
| | NAIP Aerial | 0.6m | Annual | Contiguous US | Free (USDA) |
| | Mapillary Street-View | Variable | Continuous | Community-contributed | Free (partnership) |
| | County Assessor | Vector | Annual | Per-county | $5K-20K/year varies |
| **US & Global** | Sentinel-2 | 10m | 5 days | Global | Free (ESA) |
| | Copernicus DEM | 30m | Annual | Global | Free (ESA) |
| | OpenStreetMap | Vector | Continuous | Global | Free (community) |
| **Specialty** | LANDFIRE EVT/FBFM | 30m | Biennial (even years) | US/Western | Free (USFS) |
| | FEMA Flood Maps | Vector | Irregular | US | Free (FEMA) |
| | SSURGO Soils | 30m | Annual | US | Free (USDA NRCS) |
| | NHD+ Hydrology | Vector | Annual | US | Free (USGS) |
| | ESA WorldCover | 10m | Biennial | Global | Free (ESA) |
| | GEM Active Faults | Vector | Ad-hoc | Global | Free (GEM) |
| | Smithsonian Volcano Database | Vector | Ad-hoc | Global | Free |

**Data Authority Chain (Conflict Resolution):**
1. Human confirmation (EMS, field verification): +0.3 confidence boost
2. Higher resolution wins (LiDAR 1m > Satellite 10m > Global 30m)
3. Recency (newer source on tie)
4. Agreement (more sources = higher confidence)
5. Manual override (audit trail required)

### 2.2 Complete Layer Inventory

#### Terrain Layers
- **Elevation (DEM):** 1m (3DEP US) / 30m (Copernicus global)
  - Derived: Slope (degrees), Aspect (compass), Curvature (profile/plan)
  - Traversability by vehicle type (all 8 directions)
  - Drainage direction (D8), Flow accumulation
  - Terrain classification (flat/gentle/moderate/steep/cliff)

#### Building Layers
- **Footprint:** Polygon geometry (LiDAR + satellite)
- **Height:** Meters (LiDAR DSM - DEM)
- **Material:** Classification (street-view CV: wood/concrete/steel/other)
- **Purpose:** Type/use (OSM + CV + assessor: residential/commercial/office/school/hospital/shelter/industrial/etc.)
- **Age:** Year built (assessor records)
- **Occupancy:** Unit count, floor count, basement presence
- **Structural:** Soft story flag, seismic retrofit status, roof geometry
- **Fire Risk:** Material + spacing + vegetation proximity score
- **Shelter Viability:** Durability + capacity + accessibility per hazard type
- **Accessibility:** Exits/entrances, fence rammability, wheelchair access

#### Road Layers
- **Network Topology:** Centerline (OSM ↔ TIGER conflation)
- **Geometry:** Width (all points), lanes, lane direction
- **Surface:** Type (paved/unpaved), condition, seasonality
- **Barriers:** Bridges (elevation, capacity), gates, fences (rammability)
- **Turn Constraints:** U-turn feasibility, K-turn feasibility, turn radius by vehicle
- **Passability:** Dynamic model (terrain + condition + obstacles)
- **Driveways:** Length, width, slope
- **Parking:** Lot footprints, capacity
- **Transit:** Routes, stops, schedules
- **Docks/Marinas:** Water access points, vessel capacity
- **Special:** Snow plow routes, flat open fields

#### Vegetation Layers
- **Type:** LANDFIRE EVT (140 categories)
- **Height:** Canopy height model (LiDAR DSM - DEM)
- **Density:** Canopy cover %, vegetation density
- **Health:** NDVI (Sentinel-2), stress indicator
- **Fuel Loading:** Tons/hectare (LANDFIRE FBFM40 + LiDAR)
- **Species:** Tree classification (satellite multispectral + LiDAR)
- **Burn Scars:** NBR temporal index, recovery stage

#### Infrastructure Layers
- **Power:** Transmission/distribution lines, substations, poles
- **Water:** Mains, towers, wells, fire hydrants (with pressure indicators)
- **Telecom:** Cell towers, fiber routes
- **Hazmat:** Facilities (EPA RMP/TRI), blast zones
- **Dams/Levees:** Location, height, material
- **Gas Pipelines:** Routes (PHMSA)
- **Nuclear:** Plant locations, planning zones
- **Communication:** Network redundancy maps

#### Population Layers
- **Density:** People/km² at 100m resolution
- **Breakdown:** Residential/commercial/daytime/nighttime
- **Time-of-Day:** Multiplier by hour, day, season
- **Vulnerable:** Age, mobility, medical dependency
- **Aggregated:** By census tract, by building, by zone

#### Hazard Zone Layers (Reference)
- **Wildfire:** Burn probability, WUI boundary, fire risk index
- **Flood:** FEMA zones (100yr, 500yr), HAND-derived inundation, dam failure zones
- **Seismic:** ShakeMaps, liquefaction zones, landslide susceptibility
- **Tsunami:** Inundation scenarios (2m, 5m, 10m wave heights)
- **Avalanche:** Historic runouts, starting zones, terrain factors
- **Volcanic:** Pyroclastic flows, lahars, ashfall zones
- **Landslide:** Susceptibility (slope/soil/drainage), prior events

### 2.3 Processing Pipeline

```
Raw Data Ingest (30+ sources)
    ↓
CRS Normalization (all to EPSG:4326)
    ↓
Spatial Registration (GCP-based alignment)
    ↓
Temporal Alignment (normalize timestamps to monthly epochs)
    ↓
Resolution Harmonization (resample to 1km grid)
    ↓
Aligned Multi-Source Stack (per 1km tile)
    ↓
Attribute Extraction Processors (buildings, roads, terrain, vegetation, infrastructure, population)
    ↓
Multi-Source Fusion (weighted by resolution, recency, agreement)
    ↓
Digital Twin State (PostgreSQL + S3 rasters)
    ↓
Version Snapshot (immutable checkpoint)
    ↓
Tile Composition (merge all attributes per tile)
    ↓
Tile Generation (PMTiles archive)
    ↓
Delta Encoding (hash-based diffs for incremental updates)
    ↓
CDN Distribution (CloudFront + S3)
    ↓
Offline Client Cache (5GB LRU per device)
    ↓
Real-Time Transient Layer (event-duration obstructions, bypass tile generation)
    ↓
Consumers (hazard models, routing, mobile apps, EMS, public web)
```

### 2.4 Downstream Dependencies

**Hazard Models Consuming Base Map:**
- Wildfire: Terrain, vegetation EVT, fuel loading, building density, road access
- Flood: DEM/HAND, Manning's roughness, building elevation, barriers, stream geometry
- Earthquake: Soil Vs30, building materials/age, infrastructure interdependencies
- Tsunami: Coastal elevation, building height, structural material, road network
- Avalanche: Slope (>30°), curvature, aspect, forest density, historic runouts
- Landslide: Slope/curvature, drainage, soil permeability, vegetation, burn scars
- Volcano: Valley topology (elevation, river centerlines), infrastructure exposure
- Hurricane: Terrain, building attributes (materials, height), vegetation, roads
- Tornado: Building materials, fragility (year built, code era), shelter locations
- Winter Storm: Road surface type, building heating method, power infrastructure
- Dust Storm: Terrain surface type, vegetation, visibility zones
- Drought: Soil permeability, vegetation health (NDVI), water infrastructure
- Extreme Heat: Canopy cover, building materials (thermal properties), road surface
- Extreme Cold: Building insulation (year built proxy), heating infrastructure
- Hazmat: Building materials, population density, road network, resource access
- Dam Failure: Elevation/topology, downstream communities, road network
- Rip Current: Coastal elevation, beach topology, offshore bathymetry
- Infrastructure Failure: Utility network topology, building dependencies
- Power Grid: Grid topology, population density, critical facilities
- Sinkhole: Depth to bedrock, karst indicators, building foundations
- Liquefaction: Soil type (Vs30, water table), building foundations (age proxy)

**Core Features Consuming Base Map:**
- Evacuation Routing: Road width, lanes, passability, terrain traversability, driveways
- Notifications: Building types (hospitals, schools), proximity to hazard zones
- Street-Level Perception: LiDAR baseline prior, real-time change detection
- Modeling/Simulation: Terrain, vegetation, buildings, roads for physics-based models
- World Model: Road network topology, building purpose, terrain traversability
- Agentic Planners: Road network, terrain, building locations, GeoJSON hazard overlays

**User Features Consuming Base Map:**
- Public Users: Shelter finding, vehicle evacuation routes, safe zones, fence rammability
- Public Groups: Convoy routing (multi-vehicle width constraints), resource pooling
- EMS Clients: Zone drawing (elevation contours), resource positioning (parking/access)
- Vehicle Manager: Turn radius constraints, K-turn feasibility, passability checks
- Ski Resorts: Terrain slopes, avalanche zones, run mapping

---

## 3. Independent Development Blocks

Break the Base Map module into independently testable/deployable units. Each block is a unit of work that can be planned, staffed, and validated independently.

### BLOCK 1: Data Alignment & Registration Processor

**Scope:** Transform raw multi-source geospatial data into unified 1km grid, EPSG:4326, monthly epochs.

**Responsibilities:**
- Ingest raw data from 30+ sources (satellite, LiDAR, vectors, reference data)
- Normalize CRS to EPSG:4326
- Perform spatial registration (GCP-based alignment, <0.5px RMSE)
- Temporal alignment (normalize to monthly epochs)
- Resolution harmonization (resample all to 1km cells)
- Validation (completeness, coverage, confidence scoring)
- Output: Per-tile aligned multi-source stack

**Key Features:**
- Automated GCP detection for satellite/LiDAR pairs
- Source-pair offset caching (30-day TTL in Redis)
- Multi-tier processing (global/national/per-source/per-cell)
- Conflict detection (>5% area mismatch → escalate)
- Quality gating (>50% coverage, >20% high confidence threshold)

**Processing Tiers:**
- Global All-at-Once: 30-45 days, monthly
- Per-Source-Tile: 1-7 days, variable
- National Per-Source: 1-2 weeks, CONUS priority
- Per-Cell Real-Time: Minutes-hours, event-triggered

**Storage Layout:**
```
s3://beacon-atlas/alignment_processor/
├── raw/v{NNN}/              # Raw pre-alignment data
├── staging/v{NNN}/          # Post-processing, pre-validation
├── aligned/v{NNN}/          # Live validated data
├── archive/                 # Previous versions (Glacier)
└── quarantine/              # Failed validation
```

**NATS Topics Published:**
- `alignment.{tier}.started` - Processor start
- `alignment.{tier}.tile_complete` - Tile finished
- `alignment.{tier}.validation_result` - QA pass/fail
- `alignment.{tier}.conflict_detected` - Source mismatch
- `alignment.{tier}.finished` - Tier complete

**Success Metrics:**
- Alignment cycle time (global): 30-45 days
- Per-source-tile latency: 1-7 days
- Positional accuracy (RMS): <1 pixel at source resolution
- Confidence score mean: >0.6 globally, >0.75 US
- Data completeness: >80% cells have >3 sources

**Cost:** ~$500-1000/month (EC2 compute, S3 storage, data ingest)

---

### BLOCK 2: Building Extraction & Attribute System

**Scope:** Extract 30+ attributes per building footprint from aligned multi-source stack.

**Responsibilities:**
- Detect building footprints from LiDAR + satellite (Mask R-CNN inference)
- Estimate height (DSM - DEM, shadow analysis)
- Classify material (street-view CV: wood/concrete/steel/other)
- Determine purpose/use type (OSM + CV + assessor)
- Calculate vulnerability scores (per hazard type)
- Assess shelter viability (capacity, accessibility, durability)
- Handle special buildings (hospitals, schools, hazmat facilities)
- Conflict resolution (multi-source agreement scoring)

**Key Features:**
- Mask R-CNN with ResNet-101 backbone for footprint detection (mAP >0.85)
- Height estimation with <2m RMSE
- Material classification (F1 >0.85)
- Purpose classification (accuracy >0.80)
- Soft story detection (recall >0.80)
- Shelter scoring agreement with EMS (Kappa >0.75)
- Confidence scoring (0.0-1.0, <0.4 flagged for review)

**ML Models:**
- Footprint detection: Mask R-CNN on LiDAR + Sentinel-2
- Height estimation: Random Forest regression on LiDAR metrics
- Material CV: ResNet-50 on street-view samples (500 EMS-verified images)
- Purpose classification: XGBoost on OSM tags + assessor + CV features
- Shelter viability: EMS-trained classifier on building attributes

**Output Format:** GeoParquet with 30+ attributes per feature, confidence scores

**NATS Topics Published:**
- `buildings.extraction.started` - Processor launch
- `buildings.extraction.tile_complete` - Tile finished
- `buildings.extract.quality_issue` - Low confidence building flagged
- `buildings.extract.finished` - All tiles done

**Success Metrics:**
- Extraction cycle time: <30 days (US)
- Footprint accuracy (mAP @ 0.5 IOU): >85%
- Height RMSE vs. field survey: <2m
- Material classification accuracy: >85%
- Shelter identification agreement with EMS: Kappa >0.75

**Cost:** ~$750-1100/month (A100 inference, EMS verification, storage)

---

### BLOCK 3: Road Extraction & Passability System

**Scope:** Extract 40+ attributes per road segment for routing and hazard modeling.

**Responsibilities:**
- Conflate network topology (OSM ↔ TIGER/Line matching >85%)
- Measure width at all points (<0.5m RMSE)
- Classify surface type (paved/unpaved, condition)
- Detect bridges/overpasses (elevation, capacity, weight limits)
- Identify gates/barriers (lock types, rammability)
- Analyze turn feasibility (U-turn, K-turn, by vehicle type)
- Model dynamic passability (terrain, surface, obstacles)
- Extract driveways, parking, transit routes, docks

**Key Features:**
- D-LinkNet road inference from satellite
- LiDAR-based width measurement (all points)
- Street-view CV for surface condition
- Bridge/gate detection from height discontinuities
- Passability model: terrain slope + surface + obstacles + weather
- Transit API integration (routes, stops, schedules)
- 24-hour cache for dynamic passability updates

**ML Models:**
- Road detection: D-LinkNet on Sentinel-2
- Surface classification: ResNet-50 on street-view
- Bridge detection: LiDAR height + OSM cross-reference
- Gate/barrier: YOLO small object detector on LiDAR
- Passability: XGBoost on multi-feature terrain + weather

**Output Format:** GeoParquet line segments with 40+ attributes, confidence scores

**NATS Topics Published:**
- `roads.extraction.started` - Processor launch
- `roads.extraction.tile_complete` - Tile finished
- `roads.extract.quality_issue` - Low confidence segment
- `roads.extract.passability_update` - Dynamic model change

**Success Metrics:**
- Extraction cycle time: <35 days (US)
- Network conflation match rate: >85%
- Width accuracy (RMSE): <0.5m
- Surface classification F1: >0.90
- Bridge inventory completeness: >95% (vs. DOT records)
- Passability model validation: >0.80 accuracy
- Routing latency: <200ms per-user query

**Cost:** ~$1200-1600/month (D-LinkNet inference, LiDAR processing, transit APIs)

---

### BLOCK 4: Terrain Extraction & Traversability System

**Scope:** Complete terrain attribute extraction for hazard models and routing.

**Responsibilities:**
- Load DEM (3DEP 1m US, Copernicus 30m global)
- Fill voids, remove artifacts
- Compute slope (degrees), aspect (compass), curvature (profile/plan)
- Delineate drainage (D8 flow direction, flow accumulation)
- Overlay soil permeability (SSURGO)
- Generate traversability grids by vehicle type
- Identify impassable terrain, cliffs
- Classify terrain categories (flat/gentle/moderate/steep/cliff)

**Key Features:**
- Void-filling algorithm (<0.5m RMSE error)
- Slope/aspect/curvature using GDAL
- D8 drainage direction with >98% correctness
- Terrain obstacle detection (U-Net on LiDAR)
- Cliff edge classification (ResNet-18, precision >0.95)
- 8-directional traversability costs per vehicle class
- Height above ground (for urban canyon modeling)

**ML Models:**
- Terrain obstacle detection: U-Net on LiDAR + manual labels
- Cliff edge classification: ResNet-18 on multi-directional slope
- Surface type classification: Random Forest on LiDAR + satellite

**Output Format:** Cloud-Optimized GeoTIFF (Float32) + raster tiles

**Success Metrics:**
- Elevation accuracy (3DEP): <1m RMSE
- Elevation accuracy (Copernicus): <5m RMSE
- Slope angular error: <0.5°
- Drainage direction correctness: >98%
- Traversability classification F1: >0.85
- Cliff edge detection precision: >0.95

**Cost:** ~$100-200/month (GPU compute, GDAL processing, storage)

---

### BLOCK 5: Vegetation Extraction & Fuel System

**Scope:** Extract vegetation attributes for wildfire, avalanche, traversability modeling.

**Responsibilities:**
- Load LANDFIRE EVT (140 categories)
- Compute NDVI from Sentinel-2
- Extract LiDAR vegetation metrics (canopy height model, density)
- Classify canopy cover percentage
- Identify tree species (multispectral + structure)
- Estimate fuel loading (tons/hectare, FBFM40)
- Detect burn scars (NBR temporal index)
- Estimate recovery stage

**Key Features:**
- LANDFIRE EVT classification accuracy >80% per-class
- Canopy height estimation (RMSE <1.5m)
- Canopy cover estimation (RMSE <10%)
- Fuel loading validation (±2 tons/hectare)
- Burn scar detection (>90% precision/recall)
- Species classification (>70% accuracy)
- NDVI temporal consistency (<0.05 seasonal shift)

**ML Models:**
- Vegetation type: Random Forest + Sentinel-2
- Canopy height: Random Forest regression on LiDAR
- Tree species: ResNet-18 multispectral
- Burn scar: U-Net temporal (pre/post satellite pairs)
- Fuel moisture: XGBoost on weather + NDVI + moisture data

**Output Format:** Cloud-Optimized GeoTIFF (raster) + GeoParquet (vectors)

**Success Metrics:**
- EVT accuracy: >80% per-class
- Canopy height RMSE: <1.5m
- Canopy cover RMSE: <10%
- Fuel loading RMSE: ±2 tons/ha
- Burn scar precision/recall: >90%/>85%

**Cost:** ~$100-200/month (GPU inference, LANDFIRE licensing, storage)

---

### BLOCK 6: Infrastructure & Hazmat Detection System

**Scope:** Detect and extract all infrastructure attributes (utilities, hazmat, dams, communication).

**Responsibilities:**
- Detect power lines (LiDAR + street-view CV)
- Locate substations, poles, cell towers
- Identify fire hydrants with pressure indicators
- Extract water mains, towers, wells
- Map gas pipeline routes (PHMSA)
- Locate hazmat facilities (EPA RMP/TRI)
- Extract dams and levees (NID database, LiDAR)
- Model utility redundancy and single points of failure

**Key Features:**
- Power line detection accuracy >95% length coverage
- Cell tower localization (FCC database agreement 100%)
- Hydrant geoposition <10m error
- Pipeline route accuracy >90% (PHMSA)
- Hazmat facility 100% EPA agreement
- Utility GIS licensing (where available)
- Blast/plume zone generation for hazmat facilities

**ML Models:**
- Power line detection: Line detection CNN on LiDAR
- Cell tower localization: YOLO object detector on satellite
- Hydrant detection: Small object detector on street-view
- Facility classification: Convolutional classifier on satellite
- Hazmat zone generation: Buffer + plume modeling

**Output Format:** GeoParquet points/linestrings with facility attributes

**Success Metrics:**
- Power line coverage: >95%
- Cell tower locational error: <50m
- Hydrant positional error: <5m
- Gas pipeline route agreement: >90%
- Hazmat zone boundary agreement: >85%

**Cost:** ~$150-300/month (utility GIS licensing varies, detection inference)

---

### BLOCK 7: Population Estimation & Occupancy System

**Scope:** Estimate population by location, time-of-day, and special facilities.

**Responsibilities:**
- Extract building units from detection layer
- Classify building purpose (residential/commercial/office/school/etc.)
- Load Census demographic data (block group level)
- Compute base residential population (units × household size)
- Estimate daytime commercial population (floor area × density)
- Apply time-of-day multipliers (peak/night/weekend)
- Adjust for seasonal variation (tourism, college calendars)
- Add transient population (hotels, hospitals)
- Aggregate to 100m grid cells

**Key Features:**
- Unit count estimation (±25%)
- Time-of-day multipliers by hour/day/season
- Vulnerable population breakdown (age, mobility)
- Special facility capacity (schools, nursing homes)
- Daytime vs. nighttime population factors
- Seasonal adjustment (tourist hotspots, college towns)
- Accuracy: ±15% residential, ±30% daytime, ±50% transient

**ML Models:**
- Building unit counter: ResNet CNN on rooftop imagery
- Occupancy predictor: Time series model on cellular data (anonymized)
- Daytime population: Gradient boosting on employment + school + transit data

**Output Format:** Raster (100m, UInt16 population/km²) + GeoParquet aggregations

**Success Metrics:**
- Residential population: ±15% of Census
- Daytime population: ±30% vs. employment/school data
- Building unit count: ±20% field survey sampling
- Time-of-day factor accuracy: >85%
- Transient population: ±50% vs. hotel/tourism data

**Cost:** ~$80-150/month (Census API, GPU inference, occupancy modeling)

---

### BLOCK 8: Digital Twin & Version Management System

**Scope:** Persistent, versioned, updateable model of Earth's surface with rollback capability.

**Responsibilities:**
- Maintain PostgreSQL+PostGIS live tables (buildings, roads, vegetation, etc.)
- Store S3 raster archives (elevation, land cover, population)
- Create immutable version snapshots on every update
- Track version history (metadata, trigger, tiles affected)
- Implement rollback procedure (<30 min SLA)
- Manage retention policy (hot/warm/cold tiers)
- Broadcast state changes to NATS
- Cache frequently-accessed tiles in Redis (>85% hit target)

**Key Features:**
- Versioning: v{YYYMMDDxxx} per update trigger
- Immutable snapshots per version
- TimescaleDB for time-series attribute changes
- Redis hot cache (1-hour TTL per tile)
- Version-specific confidence scores
- Audit trail (who, when, why for all changes)
- Multi-consumer notification via NATS

**Storage Architecture:**
- PostgreSQL: 500GB (current + 9 prior versions hot)
- S3: 4TB live + staging
- Glacier: Deep Archive for >1 year old
- Redis: 16GB cluster (6-node) for caching

**NATS Topics Published:**
- `beacon.atlas.updates` - Version bump, tiles affected, confidence delta
- `beacon.routing.obstruction` - Transient obstruction (event-duration)
- `beacon.atlas.versions` - Version history stream
- `beacon.atlas.rollback` - Rollback event notification

**Success Metrics:**
- Twin health score: ≥85% (coverage + freshness + confidence)
- Coverage score: >80% (tiles with data)
- Freshness score: >80% (updated in last 30 days)
- Confidence score: >0.70 average
- Rollback time: <30 minutes
- Cache hit rate: >85%

**Cost:** ~$2500-4000/month (RDS Multi-AZ, TimescaleDB, Redis, S3, monitoring)

---

### BLOCK 9: Tile Composition, Generation & Delivery System

**Scope:** Compose all attributes into cloud-optimized PMTiles, deliver via CDN with offline cache.

**Responsibilities:**
- Merge all attribute layers per 1km tile
- Generate PMTiles archives (Zstandard compression)
- Compute hash-based deltas for incremental updates
- Upload to S3 origin for CloudFront
- Manage CloudFront CDN caching (7-day TTL tiles, 1-hour version manifests)
- Support range requests (fetch single segment without full tile)
- Coordinate offline client cache (5GB LRU per device)
- Mesh network delta propagation (device-to-device sharing)

**Key Features:**
- PMTiles single-file format (no XYZ directory explosion)
- Zstandard compression level 19 (26-47% ratio)
- Delta encoding (5-15% of tile size for updates)
- CloudFront 400+ edge locations
- Range request friendly (<50ms p95 latency on CDN hit)
- Offline cache: precache strategy (saved locations, hazard proximity, recent history)
- Mesh propagation: delta shares via peer network

**Tile Format:**
```
Layers per Tile:
├── Elevation + derivatives (Float32 raster, 30m resampled)
├── Land cover (UInt8 raster, 11-class, 10m resampled)
├── Building footprints (GeoJSON polygons)
├── Road network (GeoJSON linestrings)
├── Vegetation (GeoJSON polygons)
├── Infrastructure (GeoJSON points/lines)
├── Water bodies (GeoJSON polygons)
├── Hazard zones (GeoJSON polygons)
└── Population density (UInt16 raster)
```

**CDN Configuration:**
| Path | TTL | Compression |
|------|-----|-------------|
| `*.pmtiles` | 7 days | Gzip |
| `*/delta/*.zstd` | 1 day | Gzip |
| `*/version.json` | 1 hour | Gzip |

**Success Metrics:**
- Tile response latency: <50ms p95 (CDN hit)
- CDN hit rate: >95%
- Average tile size: <1.2MB compressed
- Offline sync time: <60 seconds
- Update cycle SLA: 6 hours (scheduled), 4-6 hours (post-event)

**Cost:** ~$800-1200/month (S3, CloudFront, processing)

---

### BLOCK 10: Update Protocols & Real-Time Integration System

**Scope:** Manage scheduled, post-event, and user-reported map updates with validation gates.

**Responsibilities:**
- Track data source release calendars (Sentinel-2, NAIP, LiDAR, etc.)
- Trigger ingestion automatically (Sentinel-2 every 5 days, NAIP annual)
- Coordinate post-event resurveys (satellite tasking, aerial survey)
- Ingest user-reported changes (persistent >24hr, transient event-duration)
- Run validation gates (no regression, >quality threshold)
- Promote to live after approval
- Notify downstream consumers (NATS)
- Archive previous versions

**Update Triggers:**

| Trigger | Frequency | Owner | SLA |
|---------|-----------|-------|-----|
| Sentinel-2 digest | Weekly | Source Refresh Coordinator | Automatic |
| NAIP | Annual per state | Source Refresh Coordinator | Manual |
| 3DEP LiDAR | 1-2/year | Source Refresh Coordinator | Manual |
| OSM | Weekly diff | Source Refresh Coordinator | Automatic |
| LANDFIRE | Biennial (even years) | Source Refresh Coordinator | Manual |
| Census | Annual ACS, decennial | Source Refresh Coordinator | Manual |
| FEMA floods | Irregular | Hazard Specialist | Manual |
| Post-event | Wildfire >5k acres, EQ >M5.5, Flood >100 bldgs | Post-Event Specialist | 4-6 hours |
| User reported | Manual + photo | EMS/staff or automated (>70% anomaly) | 30 min - 2 hours |

**Validation Gates:**
1. Quality comparison (old vs. new confidence scores)
2. Regression detection (no key attributes decreased)
3. Completeness check (>50% tile coverage)
4. Source agreement (multiple sources converging = higher confidence)

**Conflict Resolution:**
- Newer update (post-event) overrides older (scheduled) if confidence higher
- User-reported persistent change overrides automated if >3 confirmations
- Manual review required if confidences within 10 percentage points
- Base Map Director decides tie-break (audit trail required)

**Success Metrics:**
- Update cycle latency: Scheduled 4-8 hours validation, post-event 4-6 hours, user-report 1-2 hours
- Promotion SLA: Same day (user-reported), after business hours (scheduled)
- Regression detection rate: 100% (no low-quality updates promoted)
- Validation pass rate: >95%

**Cost:** ~$300-500/month (satellite tasking on-demand, validation infrastructure)

---

### BLOCK 11: User-Created Layers & EMS Customization System

**Scope:** Allow EMS to draw evacuation zones, utility zones; support private and federated public layers.

**Responsibilities:**
- Provide zone drawing interface (polygon digitization)
- Store EMS evacuation zones per jurisdiction
- Support utility zone management (power, water, gas service areas)
- Implement private layer permissions (user/group-scoped)
- Federate non-private layers (discoverable by other EMS agencies)
- Version control on custom layers (rollback, audit trail)
- Real-time sync across EMS team members

**Key Features:**
- Draw tools: Polygon, line, point
- Base layers: Elevation contours, satellite, simplified basemap
- Persistence: Store in PostgreSQL + S3
- Sharing: EMS draw → stored in jurisdiction-scoped schema
- Permissions: Private (creator only), shared (team), public (federated discovery)
- Versioning: Track all edits, rollback to prior version
- Real-time: NATS broadcast when zones drawn/updated

**Downstream Consumers:**
- Hazard models subscribe to active evacuation zones (e.g., flood model respects EMS-drawn zones)
- Routing engine respects blocked roads drawn by EMS
- Notifications use EMS zones for targeted alerts
- Mobile apps display EMS zones to public users

**Success Metrics:**
- Zone drawing latency: <500ms (real-time feedback)
- Sync time: <1 second across team members
- Audit trail completeness: 100% (all edits logged)

**Cost:** ~$200-400/month (PostgreSQL, NATS, real-time sync infrastructure)

---

### BLOCK 12: Real-Time Sensor Integration & Street-Level Perception

**Scope:** Integrate device sensor data to infer traversability, building attributes, and detect real-time changes.

**Responsibilities:**
- Collect device motion data (accelerometer, gyroscope) for traversability inference
- Infer building attributes from smart home sensors (occupancy, heating method)
- Process street-level camera images for change detection
- Compare live perception vs. LiDAR baseline prior
- Flag real-time obstructions (down trees, road debris)
- Update transient routing layer (event-duration)
- Feed persistent changes (>24hr) back to base map update queue

**Key Features:**
- Traversability inference: ML model on device motion (off-road, steep, obstacle)
- Building occupancy: Infer from WiFi/Bluetooth beacon density
- Heating detection: Smart meter data (gas/elec/oil)
- Street-level CV: Change detection vs. LiDAR baseline (U-Net)
- Real-time layer: NATS broadcast to routing engine (1-min latency)
- Persistent queue: Batch >24-hour obstructions for base map update

**ML Models:**
- Traversability: Random Forest on IMU features (gyroscope, accelerometer, altitude)
- Occupancy: Neural network on WiFi beacon detection data
- Change detection: U-Net comparing current camera frame vs. LiDAR prior
- Building attribute: XGBoost on multi-sensor fusion

**Success Metrics:**
- Traversability inference accuracy: >75%
- Occupancy detection (populated/empty): >85%
- Change detection precision/recall: >90%/>85%
- Real-time layer latency: <1 minute

**Cost:** ~$400-600/month (sensor data ingestion, inference, NATS topics)

---

### BLOCK 13: Quality Assurance & Confidence Scoring System

**Scope:** Comprehensive quality gates, accuracy validation, and confidence calculation per tile and attribute.

**Responsibilities:**
- Calculate per-tile confidence scores (0.0-1.0 scale)
- Track data quality metrics (source agreement, recency, completeness)
- Run accuracy validation (ground truth, field surveys, spot-checks)
- Flag low-confidence tiles/attributes for priority updates
- Generate coverage gap reports (identify underserved regions)
- Benchmark model accuracy (vs. field reference data)
- Monitor freshness (last update age per tile)

**Quality Scoring Factors:**
- Source count: More sources = higher confidence
- Source resolution: LiDAR 1m > Satellite 10m > Global 30m
- Recency: Within 6 months = higher confidence
- Validation pass rate: % of tiles passing QA gates
- Known weaknesses: Flagged regions (e.g., dense urban where LiDAR poor)

**Quality Tiers:**
| Confidence | Use Case | Hazard Bias |
|------------|----------|-----------|
| 0.7-0.9 | Full US, primary hazard models | None (trusted) |
| 0.4-0.7 | Enhanced US, secondary/routing | ±10% uncertainty factor |
| 0.2-0.5 | Global fallback | ±30% uncertainty factor |
| <0.2 | Suppress (flag for acquisition) | Do not use |

**Success Metrics:**
- Mean confidence globally: >0.6
- Mean confidence US: >0.75
- Tiles <0.4 confidence: <5% of total
- Accuracy vs. ground truth: Exceeds model-specific targets
- Coverage gaps identified: 100% per region

**Cost:** ~$300-500/month (ground truth surveys, validation infrastructure, analysis)

---

## 4. Technical Considerations Framework

For each development block, address these 7 considerations:

### A. Product & Strategy

| Block | Functionality Scope | Competitive Advantage | Prominence & Timing | Account Access Matrix | Activation Conditions |
|-------|---|---|---|---|---|
| 1. Alignment | Multi-source registration | Unified grid + conflict resolution | Foundational (Phase 0) | All internal teams | Raw data availability |
| 2. Buildings | 30+ attributes extraction | Street-view CV + assessor synthesis | Phase 1 (month 1-3) | Hazard models, routing, EMS | LiDAR + satellite coverage |
| 3. Roads | 40+ attributes extraction | Width measurement + passability | Phase 1 (month 1-3) | Routing, EMS dispatch | OSM + TIGER + LiDAR |
| 4. Terrain | DEM + traversability | Unified traverse model by vehicle | Phase 0 (foundational) | All hazard models | Free DEM sources |
| 5. Vegetation | EVT + fuel loading | LANDFIRE + LiDAR fusion | Phase 2 (wildfire focus) | Wildfire model primarily | LANDFIRE EVT availability |
| 6. Infrastructure | Utility + hazmat detection | Comprehensive interdependency | Phase 3 (earthquake focus) | EQ model, cascade analysis | Utility GIS licensing |
| 7. Population | Occupancy + time-of-day | Census + behavioral multipliers | Phase 1 (concurrent) | All casualty/demand models | Census + building data |
| 8. Digital Twin | Versioned persistent model | Immutable snapshots + rollback | Phase 0 (foundational) | All downstream consumers | PostgreSQL + S3 infra |
| 9. Tile Delivery | PMTiles + CDN + offline | Cloud-optimized, mesh-capable | Phase 1 (client launch) | All mobile/web clients | CloudFront + S3 ready |
| 10. Updates | Scheduled/post-event/user | Real-time transient layer | Phase 2 (events) | EMS, routing, hazard models | Update pipeline ready |
| 11. Custom Layers | EMS zone drawing | Private + federated permission | Phase 2 (EMS launch) | EMS only | PostgreSQL + NATS |
| 12. Real-Time Sensors | Traversability + perception | Device sensor + camera fusion | Phase 3 (advanced) | Routing, adaptive algorithms | Sensor data APIs |
| 13. QA & Confidence | Quality gates + scoring | Transparent confidence reporting | Phase 0 (continuous) | All teams | Validation infrastructure |

**Future Viability:**
- Blocks 1-4: Foundational (permanent)
- Blocks 5-7: Hazard-specific expansions
- Block 8-10: Delivery/update infrastructure (permanent)
- Block 11-12: Advanced customization/personalization (growth features)
- Block 13: Continuous improvement (permanent)

### B. Technical Architecture

| Block | Technical Feasibility | Database Design | Codebase Architecture | Data Storage & Retention | API & Integration Points |
|-------|---|---|---|---|---|
| 1. Alignment | High (established GDAL/GDAL/QGIS tools) | PostgreSQL: source inventory per tile; Redis: offset cache | Modular pipeline (ingest → CRS → register → validate) | S3: raw/staging/aligned/archive; Glacier for >1yr | NATS: tile_complete events; S3: input/output URIs |
| 2. Buildings | High (Mask R-CNN established) | PostgreSQL: buildings table + confidence; S3: GeoParquet | Detection pipeline → attribute pipeline → fusion | GeoParquet: 30+ attributes; PostgreSQL: spatial index | NATS: tile_complete; API: building-by-location queries |
| 3. Roads | Medium (D-LinkNet + width measurement) | PostgreSQL: roads table + confidence; Redis: passability cache | Network conflation → geometry → surface → passability | GeoParquet: 40+ attributes; raster: passability grid | NATS: passability_update; API: routing queries |
| 4. Terrain | High (DEM + GDAL + rasterio) | PostgreSQL: metadata; S3: COG rasters | DEM processing pipeline → derivative pipeline | Cloud-Optimized GeoTIFF; 1m US + 30m global | NATS: tile_complete; API: elevation/slope queries |
| 5. Vegetation | Medium (LANDFIRE + satellite CV) | PostgreSQL: vegetation table; S3: LANDFIRE EVT rasters | EVT loading → NDVI computation → LiDAR extraction → fuel | GeoParquet: vegetation polygons; raster: fuel models | NATS: tile_complete; API: fuel_loading queries |
| 6. Infrastructure | Medium (LiDAR detection + utility GIS) | PostgreSQL: utility table + facility risk zones | Utility GIS import → LiDAR detection → facility classification | S3: facility shapefile + raster blast zones | NATS: tile_complete; API: facility_location queries |
| 7. Population | Medium (building units + Census + time-of-day) | PostgreSQL: population by building/grid; TimescaleDB: hourly TS | Building unit inference → occupancy modeling → aggregation | Raster (100m); GeoParquet: aggregated counts | NATS: tile_complete; API: population_by_location |
| 8. Digital Twin | High (PostgreSQL + S3 versioning) | PostgreSQL: per-attribute tables + version column; TimescaleDB: change history; S3: version snapshots | Version manager → storage layer → conflict resolver | PostgreSQL hot: current+9 prior; S3: all versions; Glacier: >1yr | NATS: updates/rollback broadcast; API: time-series queries |
| 9. Tile Delivery | High (PMTiles + CloudFront well-documented) | Redis: version manifest cache; S3: PMTiles archive | Tile composer → PMTiles encoder → CDN uploader | S3: live tiles + delta archives; Glacier: old versions | NATS: no direct; API: tile download, version check |
| 10. Updates | High (orchestration + NATS) | PostgreSQL: update log + triggers; TimescaleDB: audit trail | Update orchestrator → validation gates → promotion → notification | PostgreSQL: update history; S3: staging/live versions | NATS: updates topic; API: update status queries |
| 11. Custom Layers | High (PostGIS polygon operations) | PostgreSQL: zone table per jurisdiction; version control | Zone editor → geometry validation → permission check → broadcast | PostgreSQL: zone versions; S3: backup | NATS: zone_drawn broadcast; API: zone CRUD |
| 12. Real-Time Sensors | Medium (sensor fusion pipelines) | PostgreSQL: sensor reading log; Redis: live state | Sensor ingestion → feature extraction → ML inference → routing layer update | TimescaleDB: 7-day hot, then archive; Redis: transient state | NATS: obstruction_detected; API: sensor data ingest |
| 13. QA & Confidence | High (metrics + statistical testing) | PostgreSQL: quality_scores table; TimescaleDB: confidence trends | QA processor → validation reporter → confidence calculator | PostgreSQL: scores; S3: validation reports; Glacier: history | NATS: quality_issue broadcast; API: confidence_by_tile |

### C. Reliability & Performance

| Block | Resilience & Failover | Performance Benchmarks | Scalability | Offline/Mesh Capability | Real-Time Requirements |
|---|---|---|---|---|---|
| 1. Alignment | Multi-source redundancy: if one source fails, others fill gap; quarantine tier for conflicts | Alignment cycle: 30-45 days (global); Per-source: 1-7 days; Positional RMSE: <1 pixel | Scales: 26K tiles globally; Processing throughput: 10K tiles/hour on 8× A100 | Not applicable | Streaming: NATS per-tile completion (no strict deadline) |
| 2. Buildings | Fallback to OSM buildings if LiDAR unavailable; lower confidence scored | Extraction: <30 days (US); Footprint mAP: >0.85; Height RMSE: <2m | Scales: 3M+ buildings US; Inference: 8× A100 concurrent | Offline: cache building layer; Mesh: propagate updates | Not real-time; 6-hour update SLA |
| 3. Roads | Fallback to OSM network if LiDAR width unavailable; lower confidence | Extraction: <35 days (US); Width RMSE: <0.5m; Routing latency: <200ms | Scales: 6M+ road segments US; Inference: 8× A100 concurrent | Offline: cache road layer; Mesh: propagate passability deltas | Real-time: passability updates (seconds), routing <200ms |
| 4. Terrain | Automatic downgrade Copernicus if 3DEP unavailable; graceful degradation | Elevation RMSE: <1m (3DEP)/<5m (Copernicus); Slope <0.5°; Compute: ~$50/mo | Scales: Global 1km grid (26K tiles); 1m US coverage; Vectorization: CPU-only | Offline: cache terrain rasters; Mesh: share elevation tiles | Not real-time; annual refresh |
| 5. Vegetation | Fallback to global ESA WorldCover if LANDFIRE unavailable | Extraction: <30 days (US); EVT accuracy: >80%; Canopy height RMSE: <1.5m | Scales: 3M+ vegetation polygons US; Inference: 4× A100 concurrent | Offline: cache vegetation layer; Mesh: share raster tiles | Event-triggered: burn scar detection (hours) |
| 6. Infrastructure | Utility GIS missing → fallback to LiDAR detection only (lower confidence); EPA databases always available | Detection accuracy: >95% power lines, >90% gates, <10m hydrants | Scales: 500K+ power poles, 1M+ hydrants, 50K+ hazmat facilities US | Offline: cache facility locations; Mesh: share discovery data | Not real-time; annual refresh + ad-hoc hazmat updates |
| 7. Population | Fallback to Census block-group average if building unit count unavailable | Residential: ±15% Census; Daytime: ±30%; Unit count: ±20% | Scales: 1M+ buildings + 200K Census tracts US; Occupancy model: CPU-only | Offline: cache population grids; Mesh: share density rasters | Not real-time; 6-hour update SLA |
| 8. Digital Twin | Multi-AZ RDS failover (2 min); Standby replica ready; Point-in-time recovery (7 days) | Version snapshot latency: <5 min (processing); Rollback SLA: <30 min | Scales: 500GB PostgreSQL; 4TB S3; 6-node Redis cluster; 26K active tiles | Offline: cache via Redis + client-side SQLite subset | Real-time: NATS broadcasts on update (seconds) |
| 9. Tile Delivery | CloudFront auto-failover to stale cache (<1 min); S3 cross-region replica | Tile fetch latency: <50ms p95 (CDN hit); Offline sync: <60 sec startup | Scales: 3TB live + 6TB archive; 500M CDN requests/month; 100GB/month transfer | Offline: 5GB LRU cache per device; Mesh: delta propagation | Real-time: delta delivery on new version (<1 min) |
| 10. Updates | Validation quarantine tier if regression detected; rollback available | Update SLA: 4-8 hrs (scheduled), 4-6 hrs (post-event), 30 min (user-report) | Scales: Multiple concurrent updates; conflict resolution required <10 min | Offline: client caches prior version; Mesh: share deltas | Real-time for events: 4-6 hour processing + 1 min CDN delivery |
| 11. Custom Layers | Zone persistence in PostgreSQL; version control for rollback | Zone drawing latency: <500ms; Sync across EMS: <1 sec | Scales: 100+ zones per jurisdiction; 50+ jurisdictions | Offline: cache EMS zones in local DB | Real-time: NATS broadcast on zone drawn/updated |
| 12. Real-Time Sensors | Sensor data loss → fallback to static base map; graceful degradation | Sensor ingestion: <1 sec latency; Inference: <100ms per frame; Routing layer update: <1 min | Scales: 1M+ active devices; 100K+ sensor readings/sec; <1 sec processing | Offline: use prior sensor model; Mesh: share trained model weights | Real-time: transient routing updates (seconds) |
| 13. QA & Confidence | Validation failure → block promotion; manual review required | Quality scoring: <5 min per tile; Regression detection: 100%; Pass rate: >95% | Scales: 26K tiles; Daily confidence trend analysis | Offline: use cached confidence scores | Continuous monitoring; no strict deadline |

### D. Security, Legal & Compliance

| Block | Cybersecurity | Legal/Regulatory | Privacy | Government Compliance |
|---|---|---|---|---|
| 1. Alignment | Encryption: TLS 1.3 for all data in transit; S3: SSE-S3 for stored raw data; GDPR: public data sources only | Data rights: All sources public or licensed (no proprietary without agreement); Licensing: document terms per source | Public data (satellite, DEM, OSM); No user data at this stage | FIPS 140-2 (if GovCloud required): TLS, key management |
| 2. Buildings | Encryption: TLS 1.3; S3: SSE-S3 for building GeoParquet; Model: no user ID in training data | Assessor records: Licensed per county; Intellectual property: Mask R-CNN trained on public+licensed data | Street-view CV: Use anonymized imagery (blur faces/plates); Building footprints: Public domain | FCC compliance: No unauthorized freq/spectrum use |
| 3. Roads | Encryption: TLS 1.3; S3: SSE-S3; Model training: no user trajectory data | OSM: CC-BY-SA 4.0 (proper attribution); TIGER/Line: Public domain; Street-view: Licensed | Real-time passability: Do not log user location without consent; Road closures drawn by EMS only | DOT data: Public per government; No private driveway classification without owner consent |
| 4. Terrain | Encryption: TLS 1.3; S3: SSE-S3 | DEM sources: Public (3DEP, Copernicus); SSURGO: Public (USDA); No licensing issues | DEM data: Public; No user-specific terrain analysis | USGS/NOAA compliance: Data retention per federal mandate |
| 5. Vegetation | Encryption: TLS 1.3; S3: SSE-S3; Model: no user location in training | LANDFIRE: Public (USFS); Sentinel-2: Public (ESA); Street-view: Licensed | Burn scar detection: Public; No user property-specific damage prediction without consent | USFS data: Attribution required; Fire data: NIFC compliance |
| 6. Infrastructure | Encryption: TLS 1.3; S3: SSE-S3; Utility GIS: May require confidential agreements | Utility GIS: Licensed (agreements per utility); EPA databases: Public; PHMSA: Public | Facility locations: Public (EPA published); Blast zones: Can be public (hazard planning) | CISA compliance: Critical infrastructure protection (do not expose SCADA); DHS: Hazmat data handling |
| 7. Population | Encryption: TLS 1.3; S3: SSE-S3 | Census: Public (block group level); Building units: Inferred from public footprints; Assessor: Public records | Population counts: Aggregate only (no individual identification); Differential privacy: Apply noise if <50 people | Census Bureau: Compliance with DHHS regulations; FTC: Do not facilitate targeting of vulnerable populations for exploitation |
| 8. Digital Twin | Encryption: TLS 1.3 + KMS for keys; PostgreSQL: SSL/TLS + IAM auth; S3: SSE-KMS (customer-managed keys); Redis: AUTH + encryption at rest | Version audit log: CJIS-compliant (if handling law enforcement data); HIPAA: If health facilities included, de-identify | User-reported changes: PII removal (no names/phone); Change log: Do not expose exact location of emergency reports | State/local: Coordinate on data governance; FEMA: Provide copies of state-critical data on request |
| 9. Tile Delivery | Encryption: TLS 1.3 for CDN; S3: SSE-KMS; Client: Optionally sign tiles (hash verification) | PMTiles: Open format (no licensing); CloudFront: AWS terms of service | Tile data: Aggregated (not user-specific); No tracking of tile downloads (unless opt-in analytics) | Compliance: No data residency restrictions; US-based CDN acceptable globally |
| 10. Updates | Encryption: TLS 1.3; Approval workflow: Role-based access control (RBAC); Audit log: Signed entries (non-repudiation) | Update notification: EMS has authority to push alerts; User reports: Consent to share | Change audit log: Logged but not exposed to unauthorized users; Rollback: Notify affected parties | FEMA: Transparency on data updates during declared events |
| 11. Custom Layers | Encryption: TLS 1.3; PostgreSQL: SSL/TLS + role-based schema access | EMS zones: Jurisdictional data (owner determines sharing); Permission enforcement: Coded access control | Zone data: Only visible to authorized personnel; Audit log: Who drew zones when | Interoperability: Comply with NIEM (National Information Exchange Model) if EMS sharing across states |
| 12. Real-Time Sensors | Encryption: TLS 1.3 for sensor data ingest; Device-side: Optional encryption for stored readings | Sensor consent: User opts-in to sensor sharing; Data deletion: Honor user deletion requests | Sensor readings: Do not identify user by sensor patterns; Aggregation: Use differential privacy | Location services: Comply with state privacy laws (CCPA, similar); Age of users: Parental consent if <13 |
| 13. QA & Confidence | Encryption: TLS 1.3; Validation reports: Role-based access (QA team only) | Quality data: Internal use only (no public SLA guarantee on confidence scores) | Confidence scores: Do not expose to end-users (used internally by hazard models) | Transparency: Provide high-level "coverage tier" to public (full/enhanced/global/insufficient) |

### E. Mesh & Network Considerations

| Block | Mesh Traffic Management | Network Partition Behavior | Local Network Fallback |
|---|---|---|---|
| 1. Alignment | Not applicable (server-side only) | N/A | N/A |
| 2. Buildings | Mesh: Share building layer deltas peer-to-peer (reduce CDN bandwidth) | Offline: Use cached buildings; Mesh failure: Fallback to CDN | Mesh unavailable: Local device cache sufficient |
| 3. Roads | Mesh: Share road deltas + passability updates (critical for evacuation) | Offline: Use cached roads; Mesh failure: Fallback to scheduled CDN | Mesh unavailable: Use cached routes; No real-time passability update |
| 4. Terrain | Mesh: Share terrain raster tiles (large; medium priority for sharing) | Offline: Cached DEM sufficient for routing; Mesh failure: OK | Mesh unavailable: Cached DEM works; Static traversability |
| 5. Vegetation | Mesh: Share vegetation rasters (low priority; large size) | Offline: Cached vegetation OK; Mesh failure: Acceptable | Mesh unavailable: Use cached vegetation; No burn scar real-time updates |
| 6. Infrastructure | Mesh: Share facility discovery data (utilities, hydrants; low bandwidth) | Offline: Cached infrastructure OK; Mesh failure: Acceptable | Mesh unavailable: Cached facilities sufficient |
| 7. Population | Mesh: Share population grids (medium size; medium priority) | Offline: Cached population OK; Mesh failure: Acceptable | Mesh unavailable: Cached density sufficient |
| 8. Digital Twin | Mesh: Not applicable (server-side only); Version notifications via NATS/mesh | Offline: Client uses cached version; Mesh failure: Client stays on current version | Mesh unavailable: No live updates; cached version used |
| 9. Tile Delivery | Mesh: Delta sharing critical (reduce WAN bandwidth during updates) | Offline: Client caches tiles; Mesh failure: Use last cached version | Mesh unavailable: Cached tiles; CDN fallback if online later |
| 10. Updates | Mesh: Broadcast update availability (version number) peer-to-peer | Offline: Client unaware of new version until online; Mesh failure: Check CDN on reconnect | Mesh unavailable: Client caches prior version; checks CDN on reconnect |
| 11. Custom Layers | Mesh: Broadcast EMS zone drawings real-time (low bandwidth GeoJSON) | Offline: EMS team offline → cache zones locally until reconnect | Mesh unavailable: EMS zones cached locally; sync when online |
| 12. Real-Time Sensors | Mesh: Share sensor readings + inferred traversability (high bandwidth; prioritized) | Offline: Device uses local sensor model; Mesh failure: Fallback to base map passability | Mesh unavailable: Device sensor inference works standalone |
| 13. QA & Confidence | Mesh: Not applicable (internal reporting only) | N/A | N/A |

### F. Risk & Quality Management

| Block | Risk Analysis | Safety Criticality Rating | Mitigation Strategy |
|---|---|---|---|
| 1. Alignment | Risk: Source misalignment causes cascading errors; Confidentiality: Public data only | Low (detected at extraction stage) | Validation gates >50% coverage; visual spot-check 5% tiles |
| 2. Buildings | Risk: Missed footprints → low population estimates; False positives → clutter; False materials → fire risk miscalculation | Medium-High (fire/shelter decisions) | Confidence <0.4 flagged; EMS verification on 500 shelters; F1 >0.85 target |
| 3. Roads | Risk: Wrong width → vehicle stuck; Missed barriers → dangerous routing; Passability error → evacuation reroute | High (evacuation critical) | Width <0.5m RMSE target; Bridge detection >95%; Passability model validated against field data |
| 4. Terrain | Risk: DEM void → routing error; Cliff detection failure → off-road risk; Traversability underestimated → evacuation failure | Medium-High (routing, safe zones) | Void fill <0.5m RMSE; Cliff edge precision >0.95; Traversability F1 >0.85 |
| 5. Vegetation | Risk: Fuel loading overestimated → overpredicted fire spread; Underestimated → underprepared response | High (wildfire critical) | Fuel loading ±2 tons/ha validation; EVT accuracy >80%; Burn scar detection >90% |
| 6. Infrastructure | Risk: Missed utility → cascade failure unmodeled; Hazmat zone wrong → evacuation ineffective; Power line → ignition unaccounted | High (cascade modeling critical) | Power line >95% coverage; Hydrant <5m error; Hazmat zones >85% boundary accuracy |
| 7. Population | Risk: Overestimate → over-resource; Underestimate → insufficient sheltering; Time-of-day wrong → mismatch peak needs | Medium (resource planning) | Residential ±15% Census; Daytime ±30%; Special facilities ±10% capacity |
| 8. Digital Twin | Risk: Corruption → bad data propagates; Rollback failure → stuck on bad version; Confidence drift → users lose trust | Critical (foundation for all) | Multi-AZ RDS failover; Immutable snapshots; Rollback <30 min SLA; Integrity checks per write |
| 9. Tile Delivery | Risk: Tile missing → user offline without map; Delta corrupt → update fails; Cache stale → old data used | High (critical during events) | CDN hit >95%; Delta validation checksums; Version manifest signed; Cache invalidation tested quarterly |
| 10. Updates | Risk: Bad data promoted → cascading errors; Rollback too slow → delay response; Update window → real-time mismatch | Critical (live operations) | Validation gates >95% pass; Regression detection 100%; Rollback <30 min; Conflict resolution documented |
| 11. Custom Layers | Risk: Wrong zone drawn → evacuate wrong area; Permissions incorrect → data leaks; Zone overlap → conflicting instructions | High (EMS coordination critical) | Zone validation (no self-intersect); Permission audit trail; EMS training on tool |
| 12. Real-Time Sensors | Risk: False positive obstruction → unnecessary reroute; False negative → routing hazard; Model drift → inference unreliable | Medium (but real-time impact) | Sensor data validation; Model retraining on real-world feedback; Confidence scoring on predictions |
| 13. QA & Confidence | Risk: Confidence scoring drift → hazard model confidence unjustified; Low-quality tile used → wrong prediction | Medium-High (trust/safety) | Accuracy benchmarking quarterly; Field validation campaigns; Transparent scoring methodology |

**Safety Criticality Tiers:**
- **Critical:** Failure causes death/major injury (Blocks 3, 8, 9, 10)
- **High:** Failure causes significant operational impact (Blocks 2, 4, 5, 6, 11, 13)
- **Medium:** Failure causes resource misallocation or planning error (Blocks 1, 7, 12)

---

### G. Organizational & Cross-Team Coordination

| Block | Module Ownership | Inter-Module Dependencies | Cross-Team Coordination | External Partnerships | Training & Documentation |
|---|---|---|---|---|---|
| 1. Alignment | Data Pipeline Lead | Upstream: data sources; Downstream: all extractors | QA team (validation gates); Data Ops (S3/NATS ops) | USGS (3DEP), ESA (Copernicus), USDA (NAIP) | GIS training (GDAL, PostGIS alignment) |
| 2. Buildings | Building Extraction Lead | Upstream: Alignment; Downstream: Wildfire (spacing), EQ (fragility), Flood (depth), Routing (shelter), Population | ML team (model training); EMS (shelter verification); Field Ops (ground truth) | Mapillary (street-view), Assessor counties | Mask R-CNN training, attribute documentation |
| 3. Roads | Road Extraction Lead | Upstream: Alignment; Downstream: Routing (primary), Evacuation, Vehicle Manager | ML team (D-LinkNet, CV); Routing team (passability integration); Traffic team | DOT (road data), TIGER/Line, transit APIs | D-LinkNet training, width measurement SOP |
| 4. Terrain | Terrain Lead | Upstream: Alignment; Downstream: Hazard models (all), Routing (traversability) | Hazard modeling team (DEM requirements); Routing team | USGS (3DEP), NOAA (flood), SSURGO | DEM processing pipeline, traversability model |
| 5. Vegetation | Vegetation Lead | Upstream: Alignment; Downstream: Wildfire (fuel), Avalanche (density), Landslide (root) | Wildfire team (fuel validation); ML team (species classification) | USFS (LANDFIRE), ESA (Sentinel), Mapillary | LANDFIRE EVT guide, fuel loading validation |
| 6. Infrastructure | Infrastructure Lead | Upstream: Alignment; Downstream: EQ cascade (all utilities), Wildfire (power ignition), Routing (depots) | EQ team (cascade dependencies); Routing team (resource staging) | Utilities (GIS licensing), EPA, PHMSA, FCC, NRC | Facility database schema, hazmat zone modeling |
| 7. Population | Demographics Lead | Upstream: Buildings (units), Alignment; Downstream: Casualty modeling (all hazards), Evacuation demand | Casualty team (occupancy requirements); Planning team | Census Bureau (data), occupancy behavior data | Population estimation methodology, time-of-day factors |
| 8. Digital Twin | Digital Twin Custodian | Upstream: All extractors; Downstream: Tile Delivery, hazard models, routing, clients | All downstream teams (versioning expectations); Ops (backup/recovery) | Cloud vendor (AWS RDS, S3, backup tools) | Version control SOP, rollback procedures, audit logging |
| 9. Tile Delivery | Tile Delivery Lead | Upstream: Digital Twin; Downstream: Mobile app, web app, EMS clients, public web | App teams (client-side caching); CDN team (CloudFront ops) | Cloud vendor (CloudFront, S3); Browser vendors (PMTiles.js support) | Tile format spec, CDN caching policy, offline sync guide |
| 10. Updates | Post-Event Update Specialist (coordination) | Upstream: All data sources, Digital Twin; Downstream: All consumers | Data Refresh Coordinator (scheduled), Post-Event Specialist, Validation Specialist, NATS team | Satellite vendors (tasking), field survey contractors, EMS (post-event intel) | Update SLA documentation, conflict resolution guide |
| 11. Custom Layers | UX Lead + EMS Liaison | Upstream: Digital Twin; Downstream: Routing (zone respect), Hazard models (zone overlay) | EMS teams (zone drawing training); Routing team (zone integration); Permissions team | N/A | Zone editor UI guide, EMS training on tool, permissions model |
| 12. Real-Time Sensors | Sensor Systems Lead | Upstream: Device sensors, street-level cameras; Downstream: Routing (passability), Digital Twin (persistent changes) | ML team (traversability inference); Routing team (real-time layer); Privacy team (consent) | Device manufacturers (sensor APIs), camera vendors | Sensor data schema, inference model training, privacy compliance |
| 13. QA & Confidence | Validation Specialist (team) | Upstream: All extractors; Downstream: All consumers (transparency) | All teams (QA responsibilities); Field Ops (ground truth surveys) | Universities (research partnerships on validation); Survey contractors | Quality scoring methodology, accuracy benchmarking SOP |

**Cross-Team Coordination Cadence:**
- Weekly: Validation Specialist + extractors (quality issues)
- Bi-weekly: All Block leads + Base Map Director (progress, blockers)
- Monthly: Cross-module review (downstream impact assessment)
- Quarterly: Hazard model teams + Base Map (attribute requirements validation)

---

## 5. Codebase Structure

### 5.1 Directory Organization

```
beacon-base-map/
├── src/
│   ├── alignment_processor/
│   │   ├── crs_normalization.py          # EPSG:4326 conversion
│   │   ├── spatial_registration.py        # GCP-based alignment
│   │   ├── temporal_alignment.py          # Normalize timestamps
│   │   ├── resolution_harmonization.py    # Resample to 1km grid
│   │   ├── validation.py                  # Quality gates
│   │   └── orchestrator.py                # Pipeline coordination
│   │
│   ├── buildings/
│   │   ├── footprint_detection.py         # Mask R-CNN inference
│   │   ├── height_estimation.py           # DSM - DEM
│   │   ├── material_classification.py     # Street-view CV
│   │   ├── purpose_classification.py      # OSM + CV + assessor
│   │   ├── vulnerability_assessment.py    # Per-hazard scoring
│   │   ├── shelter_viability.py           # Capacity + accessibility
│   │   └── attributes_fusion.py           # Multi-source merge
│   │
│   ├── roads/
│   │   ├── network_conflation.py          # OSM ↔ TIGER matching
│   │   ├── width_measurement.py           # LiDAR point-wise
│   │   ├── surface_classification.py      # Paved/unpaved/condition
│   │   ├── bridge_detection.py            # Height, capacity
│   │   ├── gate_barrier_detection.py      # Fence, lock type
│   │   ├── turn_analysis.py               # U-turn/K-turn feasibility
│   │   ├── passability_model.py           # Dynamic traversability
│   │   └── transit_docks_parking.py       # Routes, stops, marinas
│   │
│   ├── terrain/
│   │   ├── dem_processing.py              # Load, fill voids
│   │   ├── slope_aspect_curvature.py      # Derivatives
│   │   ├── drainage_hydrology.py          # D8, flow accumulation
│   │   ├── traversability.py              # 8-direction costs
│   │   ├── terrain_classification.py      # flat/gentle/steep/cliff
│   │   └── validation.py                  # Void fill QA
│   │
│   ├── vegetation/
│   │   ├── evt_classification.py          # LANDFIRE EVT loading
│   │   ├── ndvi_calculation.py            # Sentinel-2 NDVI
│   │   ├── canopy_metrics.py              # Height, density
│   │   ├── fuel_loading.py                # FBFM40 estimation
│   │   ├── species_classification.py      # Satellite + LiDAR
│   │   └── burn_scar_detection.py         # Temporal NBR
│   │
│   ├── infrastructure/
│   │   ├── power_line_detection.py        # LiDAR + street-view
│   │   ├── facility_classification.py     # Hydrants, substations
│   │   ├── hazmat_facilities.py           # EPA/TRI integration
│   │   ├── utility_networks.py            # Graph redundancy
│   │   └── blast_zones.py                 # Hazmat modeling
│   │
│   ├── population/
│   │   ├── unit_estimation.py             # Building rooftop
│   │   ├── occupancy_model.py             # Time-of-day factors
│   │   ├── census_integration.py          # Block group data
│   │   ├── vulnerable_populations.py      # Age, mobility
│   │   └── aggregation.py                 # Grid-level counts
│   │
│   ├── digital_twin/
│   │   ├── postgres_schema.py             # Table definitions
│   │   ├── version_manager.py             # Snapshot creation
│   │   ├── conflict_resolver.py           # Multi-source fusion
│   │   ├── rollback.py                    # Version reversion
│   │   ├── redis_cache.py                 # Hot cache ops
│   │   └── timescaledb_archive.py         # Time-series logging
│   │
│   ├── tile_delivery/
│   │   ├── tile_composer.py               # Merge all attributes
│   │   ├── pmtiles_encoder.py             # Archive generation
│   │   ├── delta_encoding.py              # Hash-based diffs
│   │   ├── cdn_uploader.py                # S3 + CloudFront
│   │   ├── offline_cache.py               # Client LRU management
│   │   └── mesh_propagation.py            # Peer-to-peer sharing
│   │
│   ├── updates/
│   │   ├── source_monitor.py              # Release calendar tracking
│   │   ├── post_event_trigger.py          # Satellite tasking
│   │   ├── user_reports.py                # Photo + manual reports
│   │   ├── validation_gates.py            # Regression detection
│   │   ├── promotion.py                   # Live deployment
│   │   └── notification.py                # NATS publishing
│   │
│   ├── custom_layers/
│   │   ├── zone_editor.py                 # Polygon digitization
│   │   ├── permission_manager.py          # Private/public/federated
│   │   ├── geometry_validator.py          # Self-intersect check
│   │   └── real_time_sync.py              # NATS broadcast
│   │
│   ├── sensor_integration/
│   │   ├── traversability_inference.py    # Device motion ML
│   │   ├── occupancy_detection.py         # WiFi beacon analysis
│   │   ├── street_level_perception.py     # CV change detection
│   │   ├── sensor_fusion.py               # Multi-sensor merge
│   │   └── transient_layer.py             # Real-time routing update
│   │
│   ├── quality_assurance/
│   │   ├── confidence_scoring.py          # 0.0-1.0 per tile
│   │   ├── accuracy_validation.py         # Ground truth comparison
│   │   ├── coverage_gaps.py               # Underserved identification
│   │   ├── freshness_tracking.py          # Last update age
│   │   └── regression_detection.py        # Quality gates
│   │
│   ├── models/
│   │   ├── footprint_detection/
│   │   │   └── mask_rcnn_resnet101.pth    # Trained weights
│   │   ├── surface_classification/
│   │   │   └── resnet50_street_view.pth
│   │   ├── road_detection/
│   │   │   └── dlinknet_sentinel2.pth
│   │   ├── terrain_obstacles/
│   │   │   └── unet_lidar.pth
│   │   └── traversability_inference/
│   │       └── random_forest_imu.pkl
│   │
│   ├── config/
│   │   ├── sources.yaml                   # Data source definitions
│   │   ├── processing_tiers.yaml          # Batch schedule
│   │   ├── confidence_thresholds.yaml     # QA gates
│   │   ├── caching_policy.yaml            # Redis TTLs
│   │   └── hazard_requirements.yaml       # Downstream attr specs
│   │
│   └── utils/
│       ├── aws.py                         # S3/CloudFront ops
│       ├── postgres.py                    # PostgreSQL/PostGIS
│       ├── nats.py                        # Event publishing
│       ├── redis_ops.py                   # Cache ops
│       ├── gdal_wrappers.py               # Geospatial utilities
│       ├── logging.py                     # Audit/debug logging
│       └── metrics.py                     # Performance tracking
│
├── tests/
│   ├── alignment/
│   │   ├── test_crs_conversion.py
│   │   ├── test_registration_accuracy.py  # <0.5px RMSE
│   │   └── test_validation_gates.py
│   ├── buildings/
│   │   ├── test_footprint_detection.py    # mAP >0.85
│   │   ├── test_height_estimation.py      # RMSE <2m
│   │   ├── test_shelter_scoring.py        # Kappa >0.75 vs EMS
│   │   └── test_confidence_scoring.py
│   ├── roads/
│   │   ├── test_network_conflation.py     # Match >85%
│   │   ├── test_width_measurement.py      # RMSE <0.5m
│   │   ├── test_passability_model.py      # Field validation >0.8
│   │   └── test_routing_latency.py        # <200ms
│   ├── terrain/
│   │   ├── test_dem_void_fill.py          # RMSE <0.5m
│   │   ├── test_slope_computation.py      # <0.5° error
│   │   ├── test_cliff_detection.py        # Precision >0.95
│   │   └── test_traversability.py         # F1 >0.85
│   ├── integration/
│   │   ├── test_full_pipeline.py          # End-to-end
│   │   ├── test_version_rollback.py       # <30 min SLA
│   │   ├── test_tile_generation.py        # PMTiles integrity
│   │   ├── test_cdn_delivery.py           # <50ms p95
│   │   └── test_offline_sync.py           # <60 sec startup
│   └── qa/
│       ├── test_confidence_distribution.py
│       ├── test_source_agreement.py
│       └── test_coverage_gaps.py
│
├── docs/
│   ├── DEVELOPMENT.md                     # Setup guide
│   ├── ARCHITECTURE.md                    # System design
│   ├── API_SPEC.md                        # Query endpoints
│   ├── DATA_DICTIONARY.md                 # Attribute definitions
│   ├── ML_MODELS.md                       # Training pipelines
│   ├── DEPLOYMENT.md                      # Release procedures
│   ├── RUNBOOKS.md                        # Operational guides
│   └── CHANGELOG.md                       # Version history
│
├── docker/
│   ├── Dockerfile.processor               # Alignment + extractors
│   ├── Dockerfile.api                     # Query server
│   ├── docker-compose.yml                 # Local dev
│   └── kubernetes/                        # K8s manifests
│
├── requirements.txt                       # Python dependencies
├── setup.py                               # Package config
└── README.md                              # Project overview
```

### 5.2 Key Dependencies

```python
# Data Processing
gdal==3.6.0
rasterio==1.3.0
fiona==1.9.0
shapely==2.0.0
geopandas==0.12.0

# ML/CV
tensorflow==2.13.0
torch==2.0.0
torchvision==0.15.0
scikit-learn==1.3.0
xgboost==2.0.0

# Database
psycopg2-binary==2.9.0
sqlalchemy==2.0.0
timescaledb-python==0.0.1
redis==5.0.0

# Cloud
boto3==1.28.0  # AWS S3
botocore==1.31.0

# Messaging
nats-py==2.1.0

# Utilities
numpy==1.24.0
pandas==2.0.0
pyyaml==6.0
loguru==0.7.0

# Testing
pytest==7.4.0
pytest-cov==4.1.0
pytest-asyncio==0.21.0
```

---

## 6. Database Schema

### 6.1 Core PostgreSQL+PostGIS Tables

```sql
-- Buildings Layer
CREATE TABLE buildings (
  id UUID PRIMARY KEY,
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  height_m FLOAT,
  material_class VARCHAR(50),  -- wood, concrete, steel, other
  purpose VARCHAR(100),        -- residential, commercial, hospital, school, etc.
  year_built INT,
  unit_count INT,
  floor_count INT,
  soft_story BOOLEAN,
  seismic_retrofit BOOLEAN,
  shelter_score_fire FLOAT,    -- 0.0-1.0 per hazard
  shelter_score_flood FLOAT,
  shelter_score_eq FLOAT,
  confidence FLOAT,            -- 0.0-1.0
  source_agreement INT,        -- # sources confirming
  last_updated TIMESTAMP,
  version INT,                 -- versioning for rollback
  SPATIAL INDEX (geom)
);

-- Roads Layer
CREATE TABLE roads (
  id UUID PRIMARY KEY,
  geom GEOMETRY(LineString, 4326) NOT NULL,
  road_class VARCHAR(50),      -- highway, residential, service, etc.
  surface_type VARCHAR(50),    -- paved, unpaved, gravel
  surface_condition VARCHAR(50),-- excellent, good, fair, poor
  width_m FLOAT,               -- averaged width
  lane_count INT,
  one_way BOOLEAN,
  bridge BOOLEAN,
  gate_barrier BOOLEAN,
  gate_lock_type VARCHAR(50),  -- chain, padlock, electronic
  rammability FLOAT,           -- 0.0-1.0 (how easy to break barrier)
  u_turn_feasible BOOLEAN,
  k_turn_feasible BOOLEAN,
  passability_score FLOAT,     -- 0.0-1.0 (dynamic traversability)
  speed_limit_mph INT,
  confidence FLOAT,
  source_agreement INT,
  last_updated TIMESTAMP,
  version INT,
  SPATIAL INDEX (geom)
);

-- Vegetation Layer
CREATE TABLE vegetation (
  id UUID PRIMARY KEY,
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  evt_class INT,               -- LANDFIRE EVT (1-140)
  vegetation_type VARCHAR(50), -- tree, shrub, grass
  height_m FLOAT,              -- canopy height
  canopy_cover_pct FLOAT,      -- 0-100%
  health_ndvi FLOAT,           -- -1.0 to 1.0
  fuel_loading_tons_ha FLOAT,
  tree_species VARCHAR(100),
  burn_scar BOOLEAN,
  recovery_stage INT,          -- 0-5 (years post-burn)
  confidence FLOAT,
  source_agreement INT,
  last_updated TIMESTAMP,
  version INT,
  SPATIAL INDEX (geom)
);

-- Infrastructure Layer
CREATE TABLE infrastructure (
  id UUID PRIMARY KEY,
  geom GEOMETRY(Point, 4326) OR GEOMETRY(LineString, 4326),
  infrastructure_type VARCHAR(50),  -- power_line, hydrant, substation, hazmat_facility
  facility_type VARCHAR(100),       -- substation, power_pole, well, etc.
  name VARCHAR(255),
  status VARCHAR(50),               -- active, inactive, planned
  pressure_psi FLOAT,               -- for hydrants
  capacity INT,                     -- for reservoirs
  hazmat_rmp_id VARCHAR(100),       -- EPA facility ID
  hazmat_type VARCHAR(100),         -- chemical, radiological, biological
  blast_radius_m FLOAT,
  confidence FLOAT,
  source_agreement INT,
  last_updated TIMESTAMP,
  version INT,
  SPATIAL INDEX (geom)
);

-- Population Grid Layer
CREATE TABLE population_density (
  id UUID PRIMARY KEY,
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  population_total INT,
  population_residential INT,
  population_daytime INT,
  population_nighttime INT,
  vulnerable_elderly INT,      -- age 65+
  vulnerable_children INT,     -- age <5
  vulnerable_mobility INT,     -- with mobility challenges
  occupancy_factor_hour FLOAT, -- 0.0-1.0 (time-of-day)
  confidence FLOAT,
  last_updated TIMESTAMP,
  version INT,
  SPATIAL INDEX (geom)
);

-- Digital Twin Versioning
CREATE TABLE digital_twin_versions (
  version INT PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  trigger VARCHAR(100),       -- scheduled, post_event, user_report
  tiles_affected TEXT[],      -- tile IDs as array
  confidence_delta FLOAT[],   -- per-tile confidence change
  promoted_by VARCHAR(255),   -- staff who approved
  validation_status VARCHAR(50),
  previous_version INT,
  CONSTRAINT fk_prev_version FOREIGN KEY (previous_version)
    REFERENCES digital_twin_versions(version)
);

-- Attribute Change History (TimescaleDB)
CREATE TABLE attribute_changes (
  tile_id VARCHAR(50),
  timestamp TIMESTAMP NOT NULL,
  attribute VARCHAR(100),    -- "buildings", "roads", "confidence"
  entity_id UUID,            -- specific building/road/cell ID
  old_value TEXT,
  new_value TEXT,
  change_reason VARCHAR(255) -- "extraction_update", "user_report", "correction"
);

-- EMS Custom Layers
CREATE TABLE ems_evacuation_zones (
  id UUID PRIMARY KEY,
  jurisdiction_id VARCHAR(100),
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  zone_type VARCHAR(50),     -- immediate, shelter_in_place, stage
  hazard_type VARCHAR(50),   -- wildfire, flood, earthquake
  issued_by VARCHAR(255),    -- EMS staff
  issued_timestamp TIMESTAMP,
  version INT,
  SPATIAL INDEX (geom)
);

-- Real-Time Transient Layer
CREATE TABLE transient_obstructions (
  id UUID PRIMARY KEY,
  geom GEOMETRY(Point/LineString, 4326) NOT NULL,
  obstruction_type VARCHAR(50), -- fallen_tree, debris, road_closure
  severity_level INT,           -- 1-5 (impact severity)
  reported_by VARCHAR(255),     -- source (user, EMS, sensor)
  reported_timestamp TIMESTAMP,
  expected_clearance_time TIMESTAMP,
  confidence FLOAT
);
```

### 6.2 TimescaleDB Time-Series Tables

```sql
-- Sensor Readings (high-cardinality time-series)
CREATE TABLE sensor_readings (
  time TIMESTAMP NOT NULL,
  device_id UUID,
  sensor_type VARCHAR(50),  -- accelerometer, gps, camera
  latitude FLOAT,
  longitude FLOAT,
  value_1 FLOAT,            -- accel_x, or pixel_count, etc.
  value_2 FLOAT,            -- accel_y
  value_3 FLOAT,            -- accel_z
  confidence FLOAT
) PARTITION BY RANGE (time);

-- Confidence Score Time-Series
CREATE TABLE tile_confidence_history (
  time TIMESTAMP NOT NULL,
  tile_id VARCHAR(50),
  confidence_score FLOAT,
  source_count INT,
  freshness_days INT
) PARTITION BY RANGE (time);
```

### 6.3 Redis Cache Keys

```
# Tile Metadata
tile:{tile_id}:v{version}              # Serialized tile JSON (TTL: 1 hour)
tile:{tile_id}:metadata                # Timestamp, checksum, version (TTL: 7 days)
tile:{tile_id}:confidence              # Per-attribute confidence scores (TTL: 7 days)

# Alignment Processor
alignment:offset:{source_pair}         # Cached spatial offsets (TTL: 30 days)
alignment:validation_results           # Running QA results (TTL: 1 day)

# Roads Passability (Dynamic)
roads:passability:cached_grid          # 8-direction traversability raster (TTL: 24 hours)

# Population Cache
population:density:{tile_id}           # Population counts by category (TTL: 7 days)

# Version Management
version:current                        # Current live version number
version:{v}:metadata                   # Version snapshot metadata (TTL: 24 hours)

# Hazard Active Zones
hazard:active                          # List of active hazard zone IDs (TTL: 5 min)

# Session/Auth
session:{token}                        # User session (TTL: 24 hours sliding)
```

---

## 7. API Endpoints

### 7.1 Query Endpoints

```
GET /api/v1/tiles/{tile_id}/version
  Returns: { version: int, timestamp: ISO, confidence: float }
  SLA: <20ms (Redis)

GET /api/v1/tiles/{tile_id}?layers=buildings,roads
  Returns: PMTiles binary or GeoJSON per layer
  Range header support: yes (single segment fetch)
  SLA: <50ms (CDN hit), <100ms (origin)

GET /api/v1/tiles/delta/{old_version}/{new_version}/{tile_id}
  Returns: Zstandard-compressed binary delta
  SLA: <50ms (CDN hit)

GET /api/v1/buildings?bbox={lng0},{lat0},{lng1},{lat1}&confidence_min=0.7
  Returns: GeoJSON FeatureCollection
  SLA: <500ms

GET /api/v1/roads?bbox=...&surface_type=paved&passability_min=0.8
  Returns: GeoJSON FeatureCollection
  SLA: <500ms

GET /api/v1/population/density?location={lng},{lat}&radius_m=1000
  Returns: { total: int, breakdown: {...}, confidence: float }
  SLA: <200ms

GET /api/v1/infrastructure/hydrants?location={lng},{lat}&radius_m=5000
  Returns: GeoJSON FeatureCollection (nearest hydrants)
  SLA: <300ms

GET /api/v1/version/history?limit=50
  Returns: List of recent version snapshots with triggers
  SLA: <500ms

POST /api/v1/tiles/delta/check
  Body: { tile_id, local_version }
  Returns: { new_version_available: bool, delta_url?: string }
  SLA: <100ms
```

### 7.2 Mutation Endpoints (EMS/Admin Only)

```
POST /api/v1/admin/zones/draw
  Body: GeoJSON polygon, hazard_type, jurisdiction_id
  Returns: { zone_id: UUID, version: int }
  Auth: EMS role required
  SLA: <500ms (store + broadcast via NATS)

POST /api/v1/admin/reports/submit
  Body: location, photo (Base64), description, severity
  Returns: { report_id: UUID, confidence_score: float, status: "submitted" }
  Auth: Public or registered user
  SLA: <2 sec (store + async processing)

POST /api/v1/admin/updates/promote
  Body: staging_version, target_tier, approval_note
  Returns: { new_version: int, tiles_affected: int, promotion_status: "promoted" }
  Auth: Base Map Director only
  SLA: <5 sec (trigger tile generation + CDN invalidation)

GET /api/v1/admin/quality/report?region=us
  Returns: { confidence_distribution: {...}, coverage_gaps: [...], freshness: {...} }
  Auth: QA team
  SLA: <5 sec
```

---

## 8. UI Components & Mockups

### 8.1 Admin Dashboard - Base Map Module Home

**Purpose:** Monitor base map health, view recent updates, manage versions

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Base Map Module Dashboard                    [Settings] [Help] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Module Health Score: 87%                                    │
│  ├─ Coverage:  92% (26,000 tiles with data)                │
│  ├─ Freshness: 85% (updated in last 30 days)               │
│  └─ Confidence: 0.76 average (target: >0.70)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Live Version Information                                     │
│  Current Version: v20260325_001                             │
│  Updated: 6 hours ago                                       │
│  Trigger: Scheduled Sentinel-2 refresh                      │
│  Tiles Affected: 1,200                                      │
│  [View Version Details] [Rollback to Previous]              │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│ Layer Status                 │ Recent Updates (last 48h)    │
│                              │                              │
│ ✓ Buildings (v128)           │ 1. Sentinel-2 digest        │
│   27M features, 0.82 conf    │    Tiles: 1,200, Conf: +0.01│
│ ✓ Roads (v128)               │                              │
│   12M segments, 0.79 conf    │ 2. User reports (verified)  │
│ ✓ Terrain (v125)             │    Tiles: 8, Confidence: 0.6│
│   Elevation, slope, etc.     │                              │
│ ⚠ Vegetation (v122)          │ 3. Post-event update        │
│   24M polygons, last: 14d    │    (Wildfire perimeter)     │
│ ✓ Infrastructure (v126)      │    Tiles: 45, Conf: 0.75    │
│   400K facilities, fresh     │                              │
│ ⚠ Population (v121)          │                              │
│   Census data refresh needed │                              │
│                              │                              │
│ [Manage Versions] [Quality  │ [View All] [Approve Updates] │
│  Report] [Coverage Gaps]     │                              │
└──────────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Next Scheduled Updates                                       │
│  • Sentinel-2 weekly digest: Tomorrow 2:00 AM EDT           │
│  • NAIP annual refresh: May 15 (manual start)                │
│  • 3DEP LiDAR processing (select regions): Pending           │
│  • LANDFIRE EVT: December 2026                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 EMS Zone Editor

**Purpose:** Allow EMS to draw evacuation zones on base map

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ EMS Evacuation Zone Editor        [< Back] [Save] [X]  │
└────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│ Zone Tools           │ Map View (Interactive)           │
│                      │                                  │
│ ✓ Polygon Draw       │  [Satellite/Elevation/Roads]    │
│ ○ Line Draw          │  [Toggle Layers ▼]              │
│ ⚫ Point Marker       │                                  │
│                      │  [Map centered on current zone] │
│ Zone Type:           │  Orange polygon: Immediate Evac │
│  ✓ Immediate Evac    │  Blue polygon: Shelter-in-Place │
│  ○ Shelter-in-Place  │  [User can draw on map]         │
│  ○ Stage             │                                  │
│                      │                                  │
│ Hazard Type:         │                                  │
│  [Wildfire ▼]        │                                  │
│                      │                                  │
│ [Clear] [Undo]       │                                  │
└──────────────────────┴──────────────────────────────────┘

Zone Details:
  Area: 12.5 km²
  Buildings: 450 (est.)
  Population: 2,100 (est.)

  [Save Zone] [Cancel]
```

### 8.3 Quality Report - Confidence Heatmap

**Purpose:** Visualize data quality and coverage gaps by region

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Base Map Quality Report                                │
│ Region: Continental US  |  Time: Last 30 days         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Confidence Score Heatmap                               │
│  [Red = Low (0.2-0.4)] [Yellow = Medium (0.4-0.7)]   │
│  [Green = High (0.7-0.9)]                             │
│                                                        │
│  (Heatmap visualization)                              │
│  - High confidence along urban corridors              │
│  - Medium in rural/suburban                           │
│  - Low in remote mountain regions                     │
└────────────────────────────────────────────────────────┘

Coverage by Layer:
┌──────────────┬──────┬──────┬──────┬──────┐
│ Layer        │ High │ Med  │ Low  │ None │
├──────────────┼──────┼──────┼──────┼──────┤
│ Buildings    │ 85%  │ 12%  │ 3%   │ 0%   │
│ Roads        │ 82%  │ 15%  │ 3%   │ 0%   │
│ Terrain      │ 100% │ 0%   │ 0%   │ 0%   │
│ Vegetation   │ 75%  │ 20%  │ 5%   │ 0%   │
│ Infrastructure│ 65% │ 25%  │ 10%  │ 0%   │
└──────────────┴──────┴──────┴──────┴──────┘

Priority Coverage Gaps (lowest 5):
  1. Northern Montana (0.35 confidence) - LiDAR acquisition recommended
  2. Appalachian region (0.42) - Dense forest, building occlusion
  3. Southern Utah (0.38) - Sparse coverage
  4. Eastern Idaho (0.39) - Remote mountain
  5. North Dakota (0.41) - Flat, low feature density

[Request Priority Data Acquisition] [View Detailed Map]
```

### 8.4 Building Inspector Tool

**Purpose:** EMS can view and edit building attributes before use

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Building Inspector                              [X]    │
└────────────────────────────────────────────────────────┘

Building ID: BLD_N45W090_001_002_0157

Attributes:
  Height: 18.5m (5 stories) [estimated from LiDAR]
  Material: Wood frame (85% confidence)
  Purpose: Residential (multifamily)
  Year Built: 1985 (code era: moderate seismic)
  Occupancy: ~45 units, ~110 residents

  Shelter Scoring:
    Wildfire: 0.65 (moderate risk) ⚠️
      - Material flammable (wood)
      - 2.5m spacing to neighbors
      - Vegetation 8m away
      - Roof: Composition shingle (high risk)

    Flood: 0.72 (OK)
      - Elevation: 125m above flood level
      - Ground floor: <1m above grade

    Earthquake: 0.58 (moderate risk) ⚠️
      - Soft story: Yes (large ground floor, narrow upper)
      - Pre-code construction
      - Seismic retrofit: No

[Edit Building Data] [Flag for Field Verification] [Approve]
```

---

## 9. ML Model Training & Validation

### 9.1 Model Inventory

| Task | Architecture | Input | Output | Training Data | Accuracy Target | Inference Hardware |
|------|---|---|---|---|---|---|
| Building Footprint Detection | Mask R-CNN (ResNet-101 backbone) | LiDAR DSM, Sentinel-2 RGB | Polygon coordinates | 10K LiDAR tiles + manual labels | mAP >0.85 @ 0.5 IOU | 8× A100 (4-6 sec/tile) |
| Height Estimation | Random Forest Regression | LiDAR metrics (DSM-DEM, reflectance) | Height in meters | 5K field survey samples | RMSE <2m | CPU (1 sec/tile) |
| Material Classification | ResNet-50 | Street-view images (crop around building) | Material class | 500 EMS-verified images | Accuracy >85% | 2× A100 (2 sec/tile) |
| Purpose Classification | XGBoost | OSM tags, assessor data, material CV, height, area | Purpose/use type | 3K manually labeled buildings | Accuracy >80% | CPU (1 sec/tile) |
| Soft Story Detection | ResNet-18 | LiDAR height discontinuity analysis | Boolean flag | 200 labeled buildings | Recall >80% | CPU (1 sec/tile) |
| Shelter Viability Scoring | EMS-trained classifier | Material, height, occupancy, accessibility | Score 0.0-1.0 per hazard | 500 EMS consensus labels | Kappa >0.75 vs. EMS | CPU (instant) |
| Road Detection | D-LinkNet | Sentinel-2 RGB | Road centerline raster | 50K road segments + ground truth | F1 >0.90 | 2× A100 (2 sec/tile) |
| Width Measurement | LiDAR zonal statistics | LiDAR point cloud, road centerline | Width distribution | 5K manually measured road segments | RMSE <0.5m | CPU (2 sec/tile) |
| Surface Classification | ResNet-50 | Street-view image crops along roads | Surface type (paved/unpaved/condition) | 1K labeled street-view samples | F1 >0.90 | 2× A100 (2 sec/tile) |
| Passability Modeling | XGBoost | Terrain slope, surface type, obstacles, weather | Passability score 0.0-1.0 | 2K real-world field samples | Accuracy >80% | CPU (1 sec/tile) |
| Terrain Obstacle Detection | U-Net | LiDAR point cloud + hillshade | Obstacle mask | 5K LiDAR tiles + manual labels | F1 >0.85 | 1× A100 (3 sec/tile) |
| Cliff Edge Classification | ResNet-18 | Multi-directional slope analysis | Boolean (cliff/not) | 1K labeled terrain samples | Precision >0.95 | CPU (1 sec/tile) |
| Vegetation EVT Classification | Random Forest | Sentinel-2 multispectral, elevation, slope | EVT class (1-140) | LANDFIRE labeled training polygons | Accuracy >80% per class | CPU (1 sec/tile) |
| Canopy Height Estimation | Random Forest | LiDAR metrics + slope + aspect | Height in meters | 3K LiDAR-calibrated field plots | RMSE <1.5m | CPU (1 sec/tile) |
| Tree Species Classification | ResNet-18 | Sentinel-2 multispectral, LiDAR structure | Species class | 500 field-verified tree samples | Accuracy >70% | 1× A100 (2 sec/tile) |
| Burn Scar Detection | U-Net (temporal) | Pre/post Sentinel-2 pairs (dNBR) | Burn perimeter | MTBS labeled burn events | Precision >90%, Recall >85% | 1× A100 (5 sec/tile) |
| Power Line Detection | CNN (line detection) | LiDAR point cloud, satellite | Power line centerline | 2K manually labeled power lines | Precision >95% | 1× A100 (3 sec/tile) |
| Hydrant Detection | YOLOv8 | Street-view images | Hydrant bounding box + center | 2K street-view samples with hydrants | mAP >0.85 | 1× A100 (2 sec/tile) |
| Building Unit Counter | ResNet-50 | Rooftop imagery (NAIP) | Unit count (regression) | 500 field-surveyed buildings | RMSE ±20% | 2× A100 (2 sec/tile) |
| Occupancy Prediction | LSTM time-series | WiFi beacon density, cellular data (anonymized) | Occupancy probability | 50 buildings × 1 year data | Accuracy >85% | CPU (1 sec/tile) |
| Change Detection (street-level) | U-Net | Current camera frame vs. LiDAR baseline | Anomaly mask | 1K real/synthetic change scenes | F1 >0.85 | 1× A100 (100ms) |
| Traversability Inference | Random Forest | Device accelerometer, gyroscope, altitude | Traversability class | 10K device logs from evacuations | Accuracy >75% | CPU (10ms) |

### 9.2 Training & Validation Pipeline

```
Data Collection (Ground Truth)
    ↓
Dataset Preparation (splits, normalization, augmentation)
    ↓
Model Training (hyperparameter tuning, early stopping)
    ↓
Validation on Held-Out Test Set
    ↓
If accuracy <target: Retrain with more data / adjust hyperparams
    ↓
Field Validation (100-1000 samples, manual review)
    ↓
If field accuracy <target: Label more data, retrain
    ↓
Production Model Deployment (replace weights)
    ↓
Continuous Monitoring (accuracy drift detection)
    ↓
Quarterly Retraining (incorporate new ground truth)
```

---

## 10. Deployment & Release Procedures

### 10.1 Release Checklist

**Phase 1: Pre-Release Validation (4-8 hours)**
- [ ] All tests pass (unit, integration, QA)
- [ ] Confidence scores >target per tile type
- [ ] No regression detected (compare to prior version)
- [ ] Coverage gaps identified and logged
- [ ] NATS notification system ready
- [ ] CDN cache invalidation scripts ready

**Phase 2: Staging Deployment (1-2 hours)**
- [ ] Deploy to staging environment (1% traffic)
- [ ] Monitor for errors (logs, metrics, alerts)
- [ ] Validation Specialist sign-off
- [ ] Base Map Director approval

**Phase 3: Live Promotion (30 minutes)**
- [ ] Create version snapshot (v{YYYMMDDxxx})
- [ ] Upload new tiles to S3 live/
- [ ] Invalidate CloudFront cache (affected tiles only)
- [ ] Broadcast NATS update message
- [ ] Monitor tile delivery latency (<50ms p95)
- [ ] Notify downstream consumers (Slack)

**Phase 4: Post-Release Monitoring (24+ hours)**
- [ ] Hazard model accuracy metrics stable
- [ ] Routing latency <200ms
- [ ] Client cache hit rate >95%
- [ ] Error rate <0.1%
- [ ] No user complaints (public web, mobile app)
- [ ] Archive prior version (S3 → Glacier after 7 days)

---

## 11. Success Metrics & KPIs

### 11.1 Data Quality Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| Module Health Score | ≥85% | (coverage + freshness + confidence) weighted | Daily |
| Coverage Score | ≥80% | Tiles with data / total tiles | Daily |
| Freshness Score | ≥80% | Tiles updated in last 30 days / total | Daily |
| Mean Confidence (US) | >0.75 | Average per-tile confidence | Daily |
| Mean Confidence (Global) | >0.60 | Average per-tile confidence | Daily |
| Tiles <0.4 Confidence | <5% | Percentage flagged for review | Daily |
| Source Agreement | >3 sources | % of tiles with 3+ agreeing sources | Weekly |

### 11.2 Performance Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| Tile Fetch Latency p95 | <50ms | CloudFront hit latency | Real-time |
| CDN Hit Rate | >95% | (Cache hits / total requests) | Real-time |
| Routing Query Latency | <200ms | API response time for routing queries | Real-time |
| Offline Sync Time | <60 sec | Client cache refresh on app startup | Per-sync |
| Alignment Cycle (global) | 30-45 days | Raw → aligned multi-source stack | Per-cycle |
| Extraction Cycle (US) | <35 days | All processors complete | Per-cycle |
| Update Promotion SLA | 4-8 hrs (scheduled) / 4-6 hrs (post-event) | Validation → promotion time | Per-update |

### 11.3 Model Accuracy Metrics

| Model | Metric | Target | Frequency |
|-------|--------|--------|-----------|
| Building Footprint | mAP @ 0.5 IOU | >0.85 | Quarterly |
| Building Height | RMSE (meters) | <2.0 | Quarterly |
| Building Material | F1 Score | >0.85 | Quarterly |
| Building Purpose | Accuracy | >0.80 | Quarterly |
| Soft Story Detection | Recall | >0.80 | Quarterly |
| Road Conflation | Match Rate | >85% | Quarterly |
| Road Width | RMSE (meters) | <0.5 | Quarterly |
| Road Surface | F1 Score | >0.90 | Quarterly |
| Passability Model | Field Validation | >80% accuracy | Quarterly |
| Terrain Slope | Angular Error | <0.5° | Annually |
| Vegetation EVT | Per-Class Accuracy | >80% | Biennial |
| Fuel Loading | RMSE (tons/ha) | ±2.0 | Biennial |

### 11.4 User & Stakeholder Metrics

| Metric | Target | Measurement | Frequency |
|--------|--------|-------------|-----------|
| Hazard Model Accuracy (vs. observed) | Model-specific | Compare predictions to post-event truth | Per-event |
| Routing Success Rate | >95% | Routes navigable without blockage | Per-event |
| EMS Satisfaction | >4/5 stars | Survey after emergency event | Per-event |
| Public User Satisfaction | >4/5 stars | App store ratings + in-app surveys | Monthly |
| Data Freshness (EMS) | <6 hours | Age of most recent update | Daily |
| Coverage Gaps Identified | 100% | All underserved regions flagged | Monthly |

---

## 12. Risk Mitigation & Contingency Plans

### 12.1 Critical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| LiDAR data unavailable (delay/cost) | Medium | High (reduced footprint/width accuracy) | Pre-fund 3DEP licensing; fallback to satellite-only (lower confidence) |
| Model accuracy drift (real-world distribution shift) | Medium | High (hazard predictions off) | Quarterly retraining on new ground truth; continuous monitoring |
| PostgreSQL failure (data corruption) | Low | Critical (rollback required) | Multi-AZ RDS failover; daily snapshots; point-in-time recovery |
| CDN outage (CloudFront) | Low | High (tile delivery down) | S3 direct fallback; client-side caching; mesh propagation |
| User reports overwhelming validation queue | Medium | Medium (update SLA breach) | Confidence scoring triage; automated filtering (>70% anomaly) |
| Source data licensing changes (e.g., OSM CC-BY-SA) | Low | Medium (legal/attribution) | Track licensing terms; budget utility GIS licensing |
| Confidentiality breach (utility GIS, hazmat locations) | Low | Critical (national security) | Encrypt sensitive data at rest/transit; role-based access; audit logs |

### 12.2 Contingency Procedures

**Data Quality Regression:**
1. Detect via confidence score drop (>0.1 delta)
2. Quarantine affected tiles
3. Base Map Director review
4. Options: Revert to prior version, reprocess, manual correction
5. SLA: <30 min

**Tile Delivery Failure:**
1. S3 direct download (no CloudFront)
2. Client uses last cached version
3. Mesh network propagates available tiles
4. SLA: User sees "offline mode" alert, continues with cached data

**Post-Event Resurvey Bottleneck:**
1. Automated satellite tasking on magnitude >5.5 EQ, >5000-acre fire
2. If satellite unavailable: aerial survey + ground truth collection
3. Fast-track processing (4-6 hrs vs. standard 30 days)
4. EMS manual drawing of zones (doesn't block automated update)

---

## 13. Future Roadmap

### Phase 1 (MVP): Foundational US Coverage
- [x] Alignment Processor + terrain/buildings/roads extraction
- [x] Digital Twin + version management
- [x] Tile delivery via PMTiles/CDN
- [x] Scheduled updates (Sentinel-2, NAIP)
- Target: 6 months

### Phase 2: Event-Ready Operations
- [ ] Post-event resurvey automation (satellite tasking)
- [ ] User-reported changes integration
- [ ] EMS zone drawing tool
- [ ] Vegetation + infrastructure layers
- [ ] Real-time passability updates
- Target: +3-4 months

### Phase 3: Advanced Personalization
- [ ] Real-time sensor integration (device motion, street-level cameras)
- [ ] Building attribute inference from smart sensors
- [ ] Personalized "traveler model" (user-specific vehicle constraints)
- [ ] Mesh network delta propagation at scale
- Target: +3-4 months

### Phase 4: International Expansion
- [ ] Global fallback to enhanced coverage (regional LiDAR projects)
- [ ] Partnership with government mapping agencies (UK, Canada, Australia)
- [ ] Multi-language support in EMS interface
- [ ] Interoperability with NIEM (National Information Exchange Model)
- Target: Year 2+

### Long-Term Vision
- 100% global coverage with source-specific confidence tiers
- Real-time updates via autonomous sensor networks + satellite tasking
- Predictive modeling (building vulnerability evolution, infrastructure degradation)
- Agentic route planning (pack-aware evacuation + resource optimization)
- Integration with climate/weather forecasting (hazard probability updates)

---

## 14. Documentation Index

**Technical Documentation:**
- `/docs/ARCHITECTURE.md` - System design, data flows, storage layout
- `/docs/DEVELOPMENT.md` - Setup, local testing, debugging
- `/docs/API_SPEC.md` - All endpoints, request/response formats
- `/docs/DATA_DICTIONARY.md` - Complete attribute definitions, units, ranges
- `/docs/ML_MODELS.md` - Training datasets, evaluation, deployment

**Operational Documentation:**
- `/docs/DEPLOYMENT.md` - Release procedures, checklist, monitoring
- `/docs/RUNBOOKS.md` - Troubleshooting, incident response, rollback
- `/docs/CHANGELOG.md` - Version history, breaking changes
- `/runbooks/TILE_DELIVERY_OUTAGE.md` - CDN failure response
- `/runbooks/DATA_QUALITY_REGRESSION.md` - Detection + remediation

**User/EMS Documentation:**
- `/docs/ADMIN_GUIDE.md` - Dashboard tour, quality reports, version management
- `/docs/EMS_ZONE_EDITOR.md` - Zone drawing, permissions, real-time sync
- `/docs/USER_REPORTS.md` - Photo upload, validation, reward system

---

## 15. Glossary

- **Alignment:** Process of registering multi-source data to common CRS/grid
- **Confidence:** Score 0.0-1.0 indicating data quality per tile/attribute
- **Coverage Tier:** Classification (full/enhanced/global/insufficient) based on available sources
- **Digital Twin:** Versioned, persistent model of Earth's surface attributes
- **Fallback:** Global lower-resolution base map for areas lacking local data
- **GCP:** Ground Control Points; spatial reference markers for registration
- **LANDFIRE:** USFS/USGS database of vegetation EVT classes + fuel models
- **LiDAR:** Light Detection and Ranging; active remote sensing at 1m resolution
- **NATS:** Message broker for real-time event streaming between modules
- **PMTiles:** Cloud-optimized single-file tile archive format
- **PostGIS:** PostgreSQL spatial extension for vector queries
- **Resilience:** System ability to gracefully degrade or fail over
- **Transient Layer:** Real-time obstructions (event-duration) cached separately from base tiles
- **Zstandard (Zstd):** Compression algorithm (26-47% ratio on base map tiles)

---

**END OF MODULE_DOC.md**

