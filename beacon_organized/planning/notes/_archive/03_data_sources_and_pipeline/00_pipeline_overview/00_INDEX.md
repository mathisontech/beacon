# World Base Map — Complete Pipeline Documentation Index

**All documents for the Atlas World Base Map module, organized by processing class**

---

## Document Set Overview

The World Base Map processes data at four tiers, each requiring different pipeline architectures:

### Already Complete (Global "All-at-Once" Sources)
These docs already exist and cover data processed worldwide in a single pass:
- **Global Pipeline - Overview & Storage.docx** — Architecture, storage layout, database schemas
- **Global Pipeline - Copernicus DEM Layer.docx** — Elevation + all terrain derivatives + landslide
- **Global Pipeline - HydroSHEDS Layer.docx** — HAND processor
- **Global Pipeline - Sentinel-2 Layer.docx** — Satellite imagery tiles
- **Global Pipeline - OpenStreetMap Layer.docx** — Road topology
- **Global Pipeline - Volcanic Hazard Layer.docx** — Pyroclastic + lahar
- **Global Pipeline - Coastal & Tsunami Layer.docx** — Tsunami inundation
- **Global Pipeline - Beacon Tile Standards.docx** — BTS rendering specs
- **Global Pipeline - Development Plan.md** — 22-step Claude Code build guide

### To Be Created: Per-Source-Tile Processing
Data that arrives in natural tiles and is processed per source tile before cell chopping:
- **Per-Tile Pipeline - WorldCover and NLCD.md** ✅

### To Be Created: National Base Map (US-Specific Refinements)
US-specific data sources that enhance the global base within the US:
- **National Pipeline - Overview and Architecture.md** ✅
- **National Pipeline - 3DEP LiDAR Layer.md** ✅ — Per-project processing, ~15 processors, ~40 extraction layers
- **National Pipeline - NAIP Satellite Layer.md** ✅ — 0.6m aerial imagery, ~7 extraction processors
- **National Pipeline - Street View (Mapillary) Layer.md** ✅ — Object detection, ~8 layer types
- **National Pipeline - Reference Data Layers.md** ✅ — LANDFIRE, Census, FEMA, Boundaries, Utilities, Seismic, Burn History
- **National Pipeline - ML Model Training Plan.md** ✅ — ALSO, LeJEPA, task models, training data strategy, hardware costs
- **National Pipeline - Development Plan.md** ✅ — 34-step Claude Code build guide

### To Be Created: Per-Cell Compositing
Final per-cell processing that merges and scores:
- **Per-Cell Pipeline - Overview & Architecture.md**
- **Per-Cell Pipeline - Development Plan.md**

---

## Processing Class Definitions

| Class | Scale | Examples | When to Use |
|-------|-------|----------|-------------|
| Global All-at-Once | Entire planet | Copernicus DEM, Sentinel-2, OSM, volcanic/tsunami/landslide | Source updates globally, operations need full coverage (slope needs neighbors) |
| Per-Source-Tile | Natural source tiles (1°, 3°) | WorldCover 3° tiles, NLCD | Source arrives tiled, each tile independent |
| National Per-Source | By project/region/state | 3DEP LiDAR projects, NAIP state flights, Mapillary coverage areas | Source updates regionally, processing is source-geometry-dependent |
| Per-Cell | 1km grid cells | Land cover %, population sums, risk composites, layer merging | Pure per-pixel operations, cell summaries, final compositing |

---

## Layer Overlap Strategy

Multiple data sources produce **independent estimates** of the same features. These are NOT merged in the source processors — each source produces its own layer. A downstream fusion model (not covered in these docs) will merge them. Sources are responsible for extracting everything they can see, even if another source also extracts it.

**Example: Building footprints are extracted independently by:**
- LiDAR (height-based extraction from point cloud)
- Satellite/NAIP (image segmentation)
- Street view (facade detection → footprint inference)
- OSM (existing crowd-sourced data, passed through)

**Example: Pavement/surface type is estimated independently by:**
- LiDAR (intensity + texture on flat ground surfaces)
- Satellite/NAIP (color/texture classification)
- Street view (visible surface in camera view)
- OSM (surface tags where available)

Each extraction includes a confidence score and a coverage/blind-spot layer documenting what the source could and could not observe.
