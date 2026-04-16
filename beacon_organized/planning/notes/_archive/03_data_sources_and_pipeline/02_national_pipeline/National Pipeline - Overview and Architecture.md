# World Base Map — National Processing Pipeline

**US-specific data sources that enhance the global base within the United States**

## Overview & Architecture

---

### What the National Pipeline Adds

The global pipeline provides a usable map of the entire planet. The national pipeline adds high-resolution US-specific data that the global sources can't provide:

- **1m DEM from LiDAR** (vs 30m Copernicus)
- **0.6m aerial imagery from NAIP** (vs 10m Sentinel-2)
- **Street-level object detection from Mapillary** (no global equivalent)
- **30m fuel models from LANDFIRE** (US fire modeling standard)
- **Building-level population from Census** (vs global estimates)
- **Authoritative flood zones from FEMA**
- **Jurisdiction boundaries for emergency response coordination**

### Key Design Principle: Independent Estimates

Every data source produces its **own independent extraction layers**. Multiple sources will produce estimates of the same features (buildings, vegetation, surfaces, barriers). These are NOT merged in the national pipeline — each source documents what it can see, with what confidence, and where its blind spots are. A downstream fusion pipeline (separate system, not documented here) will merge them.

This means:
- LiDAR produces a building footprint layer
- NAIP produces a building footprint layer
- Street view produces a building facade layer
- OSM provides existing crowdsourced building data

All four exist simultaneously. Each has different strengths, weaknesses, and coverage.

---

### Processing Order

Sources are processed in dependency order. Later sources can optionally reference earlier outputs for context, but each source pipeline is self-contained.

**Phase N1: Per-Source-Tile Processing (prerequisite)**
1. WorldCover (global land cover at 10m)
2. NLCD (US land cover at 30m + impervious surface)

*These are fast and provide land cover context for later processors.*

**Phase N2: Reference Data (no ML, download + standardize)**
3. LANDFIRE fuels (download + standardize, feeds fire modeling)
4. Census population (download + disaggregate to buildings)
5. FEMA flood zones (download + standardize)
6. Government boundaries (download + standardize)
7. Utility infrastructure (download + merge sources)
8. Seismic data (download + standardize)
9. Burn history (download + standardize)

*All are simple download-and-process layers. Can run in parallel.*

**Phase N3: LiDAR Processing (per project)**
10. Fetch 3DEP projects → raw LAZ on S3
11. Pass 1 deterministic: classify, DEM, terrain derivatives, canopy, intensity, buildings, shadow/coverage
12. Pass 2 ML-based: refined classification, advanced buildings, barriers, vegetation detail, surface features, soil estimate

*Per-project. Priority order: client regions → high-risk areas → fill gaps.*

**Phase N4: Satellite/Aerial Processing (per state flight)**
13. Fetch NAIP → raw COGs on S3
14. Buildings, vegetation, surfaces, pools, residential edge, helicopter landing, coverage

**Phase N5: Street View Processing (per coverage area)**
15. Fetch Mapillary metadata → image access on S3
16. Barriers, buildings/facades, storefronts, vegetation, ground surface, infrastructure, coverage

**Phase N6: Model Training (parallel with N3-N5)**
17. Foundation model pre-training (ALSO on LiDAR, DINOv2 on street view, SatMAE on NAIP)
18. Task-specific model training (classification, detection, material ID)
19. Active learning iterations

*ML models are needed for Phase N3 Pass 2 and parts of N4 and N5. Train them in parallel while running deterministic processors.*

---

### Storage Layout

All national data lives under `s3://beacon-atlas/national_base_map/`. Same lifecycle as global: raw/ → staging/ → live → archive/.

```
national_base_map/
├── raw/
│   ├── 3dep/v{NNN}/{project_id}/          # LAZ tiles per project
│   ├── naip/v{NNN}/{state}_{year}/        # COG tiles per state flight
│   ├── mapillary/v{NNN}/{region_id}/      # Image metadata per region
│   ├── landfire/v{NNN}/                   # National GeoTIFFs
│   ├── census/v{NNN}/                     # Census block data
│   ├── fema/v{NNN}/                       # Flood zone shapefiles
│   ├── boundaries/v{NNN}/                 # Jurisdiction boundaries
│   ├── utilities/v{NNN}/                  # Power, gas, water
│   ├── seismic/v{NNN}/                    # Fault lines, hazard maps
│   └── burn_history/v{NNN}/              # Fire perimeters
├── 3dep/v{NNN}/{project_id}/
│   ├── classified/                        # Classified LAZ (Pass 1)
│   ├── ml_classified/                     # ML-refined LAZ (Pass 2)
│   ├── dem/                               # Bare-earth DEM
│   ├── dsm/                               # Surface model
│   ├── slope/
│   ├── aspect/
│   ├── roughness/
│   ├── depressions/
│   ├── canopy/height/ cover/ strata_*/ understory/ gaps/
│   ├── surface/intensity/ texture/ flat_smooth/
│   ├── buildings/footprints.parquet centroids.parquet
│   ├── barriers/barriers.parquet
│   ├── vegetation/trees.parquet veg_structure_distance.parquet
│   ├── features/power_lines.parquet curbs.parquet road_widths.parquet parking.parquet driveways.parquet helicopter_landing.parquet
│   ├── soil/class/ confidence/
│   └── coverage/density/ confidence/ shadows/ shadow_depth/
├── naip/v{NNN}/{state}/
│   ├── buildings.parquet
│   ├── vegetation/ mask/ ndvi/ shrubs.parquet tree_canopy.parquet
│   ├── surfaces/ class/ impervious/ pavement.parquet parking_lots.parquet driveways.parquet road_widths.parquet
│   ├── pools.parquet
│   ├── residential_edge.parquet
│   ├── helicopter_landing.parquet
│   └── coverage/ date/ cloud_shadow/ canopy_occlusion/ confidence/
├── mapillary/v{NNN}/{region_id}/
│   ├── barriers.parquet
│   ├── buildings.parquet
│   ├── storefronts.parquet
│   ├── vegetation.parquet
│   ├── ground_surface.parquet
│   ├── infrastructure.parquet
│   └── coverage/ density/ recency/ visibility/ confidence/
├── landfire/v{NNN}/ fuel_model/ veg_type/ veg_cover/ etc.
├── census/v{NNN}/ population/
├── fema/v{NNN}/ flood_zones.parquet
├── boundaries/v{NNN}/ states/ counties/ etc.
├── utilities/v{NNN}/ power_transmission/ substations/ etc.
├── seismic/v{NNN}/ fault_lines/ hazard/
├── burn_history/v{NNN}/ perimeters/ years_since_burn/
├── staging/                               # Same structure, pre-validation
├── archive/                               # Previous versions, Glacier
├── quarantine/                            # Failed validation
└── update_logs/                           # Processing + validation logs
```

---

### Version Comparison (LiDAR-Specific)

When new LiDAR data supersedes old for an area, the orchestrator runs a comparison before promoting:
1. Load overlapping outputs from previous version
2. Flag: buildings appeared/disappeared, elevation changes > 1m, vegetation height changes > 5m
3. Gross anomalies (building vanished with no construction evidence) → quarantine for review
4. Comparison report written to update_logs

This catches classification errors and processing bugs before they corrupt live data.

---

### Orchestration

Same orchestrator architecture as the global pipeline: processor → validator → promote or quarantine. The national orchestrator adds:

- **Project-level tracking:** Know which 3DEP projects have been processed, which are pending, which superseded
- **Priority queue:** Client regions processed first, high-risk areas second, fill gaps third
- **Dependency management:** ML processors (Pass 2) wait for deterministic processors (Pass 1) + trained models
- **Coverage tracking:** Dashboard showing which cells have which layers from which sources at what recency

---

### Companion Documents

| Document | Contents |
|----------|----------|
| National Pipeline - 3DEP LiDAR Layer.md | All LiDAR processors (Pass 1 + Pass 2), ~15 processors, ~40 output layers |
| National Pipeline - NAIP Satellite Layer.md | All aerial imagery processors, ~7 processors |
| National Pipeline - Street View (Mapillary) Layer.md | All street view processors, ~8 layer types |
| National Pipeline - Reference Data Layers.md | LANDFIRE, Census, FEMA, Boundaries, Utilities, Seismic, Burn History |
| National Pipeline - ML Model Training Plan.md | Foundation models, task-specific models, cross-modal fusion, training data strategy, hardware costs |
| National Pipeline - Development Plan.md | Step-by-step Claude Code build guide |
