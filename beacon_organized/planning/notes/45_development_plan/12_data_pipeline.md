# Data Pipeline Module

## 1. Overview
Ingests, transforms, validates, and delivers all external data to consuming modules with quality assurance and confidence scoring across global, national, and per-tile processing tiers.

## 2. Ownership
- Leads: Data Ingestion (shared with Base Map), Data Partnerships (VP Data Science org), Real-Time Feed, Static Data, Source Refresh
- Coordination: Cross-functional data acquisition team

## 3. Parent Module
Base Map + Data Science

## 4. Submodules
- Global Pipeline
- National Pipeline
- Per-Tile Pipeline
- Source Management
- Validation & QA
- Cross-Source Integration

## 5. Goals
1. Ingest 50+ authoritative data sources monthly
2. Achieve 95% validation pass rate
3. Maintain <24h lag for static data updates
4. Provide confidence scores for all merged datasets

## 6. Functions

| Function | Purpose | Input | Output | SLA | Tier |
|----------|---------|-------|--------|-----|------|
| download_copernicus_dem | Fetch global elevation model | Region bbox | DEM raster | 2h | Global |
| process_sentinel2_scene | Process satellite imagery | S3 scene path | Multispectral raster | 4h | Global |
| extract_osm_roads | Download OSM road network | Bbox | Road shapefile | 1h | Global |
| compute_slope_aspect | Calculate terrain attributes | DEM raster | Slope, aspect rasters | 30m | Global |
| process_hydrosheds | Ingest hydrographic zones | HydroSHEDS file | Watershed polygon set | 2h | Global |
| generate_hand_layer | Compute height above nearest drainage | DEM, Hydrography | HAND raster | 1h | Global |
| process_volcanic_zones | Ingest volcano risk data | Smithsonian API | Volcano polygon set | 30m | Global |
| compute_tsunami_scenarios | Generate tsunami inundation maps | Coastal DEM, Seismic model | Inundation raster | 6h | Global |
| compute_landslide_runout | Model landslide extent | DEM, Slope, Soil data | Runout polygon set | 4h | Global |
| download_3dep_lidar_project | Fetch USGS 3DEP LiDAR | Project ID | Point cloud (LAZ) | 3h | National |
| classify_lidar_points | Filter/classify point cloud | LAZ file | Classified LAZ | 2h | National |
| process_naip_aerial | Download/orthorectify NAIP | Quad code | Orthophoto raster | 2h | National |
| extract_mapillary_objects | Extract detected objects | Mapillary API | Object set | 1h | National |
| ingest_landfire_fuel | Load vegetation fuel data | LANDFIRE source | Fuel raster | 1h | National |
| load_census_demographics | Ingest census block data | Census FTP | Census polygon set | 30m | National |
| load_fema_flood_zones | Import flood zone designations | FEMA geodatabase | Flood zone polygon set | 30m | National |
| load_nhd_hydrology | Ingest National Hydrography | USGS NHD source | Hydrology polyline set | 1h | National |
| load_epa_facilities | Import EPA facility locations | EPA database | Facility point set | 30m | National |
| load_nbi_bridges | Ingest bridge inspection data | NBI dataset | Bridge point set + table | 30m | National |
| register_data_source | Create source registry entry | Source metadata | Source ID | 10m | Source Mgmt |
| track_source_version | Record version released | Source ID, Version | Version ID | 5m | Source Mgmt |
| compare_schema_versions | Detect schema differences | Old schema, New schema | Schema diff report | 2m | Source Mgmt |
| generate_coverage_map | Map data availability | Data layer | Coverage raster | 15m | Source Mgmt |
| calculate_source_overlap | Find conflicting sources | Multiple sources | Overlap analysis | 20m | Source Mgmt |
| estimate_processing_cost | Calculate ingest cost | Data size, Tier | Cost estimate | 5m | Source Mgmt |
| validate_geospatial_extent | Check spatial bounds | Data layer | Extent validation | 5m | Validation |
| check_null_coverage | Find missing data regions | Data layer | Null mask | 10m | Validation |
| compare_against_baseline | Check for regressions | New data, Baseline | Comparison report | 15m | Validation |
| quarantine_failed_data | Isolate bad data | Failed validation | Quarantine entry | 5m | Validation |
| promote_to_live | Release validated data | Staging data | Prod data | 10m | Validation |
| archive_old_version | Move previous version | Prod data | Archive data | 5m | Validation |
| compute_confidence_score | Assign merged data score | Validation results | Score (0-1) | 2m | Cross-Source |
| apply_cross_source_pattern | Use multi-source logic | Scoring rules | Applied score | 5m | Cross-Source |
| merge_independent_estimates | Fuse multiple sources | Score set | Merged value | 10m | Cross-Source |
| document_blind_spots | Record known gaps | All validations | Gap document | 30m | Cross-Source |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| data_sources | Source registry | source_id, name, endpoint, format, update_frequency | Indefinite |
| source_versions | Version tracking | source_id, version, released_at, row_count | 2 years |
| processing_runs | Job records | run_id, source_id, status, duration, row_count | 1 year |
| validation_results | QA outcomes | run_id, checks_passed, checks_failed, details | 6 months |
| quarantine_log | Failed data audit | quarantine_id, source_id, reason, date_quarantined | 2 years |
| coverage_maps | Coverage records | source_id, version, coverage_percent, bbox | 1 year |

## 8. S3 Storage Layout
```
s3://beacon-data/
├── raw/v{NNN}/               (Raw downloads)
├── staging/                  (Processing temp)
├── {layer}/v{NNN}/           (Ready-to-use layers)
├── archive/                  (Historical versions)
├── quarantine/               (Failed data)
└── update_logs/              (Processing history)
```

## 9. Processing Tiers

| Tier | Scope | Frequency | SLA |
|------|-------|-----------|-----|
| Global All-at-Once | Entire Earth | Monthly | 30 days |
| Per-Source-Tile | Per source, gridded | Variable | Source dependent |
| National Per-Source | US nation only | Variable | 7-14 days |
| Per-Cell | Individual grid cells | On-demand | 24 hours |

## 10. Confidence Scoring Rules

| Factor | Points | Notes |
|--------|--------|-------|
| Agreeing source | +0.1 | Per additional source agreement |
| Higher resolution | +0.2 | Finer grid/vector resolution |
| Data recency | +0.15 | <1 month old |
| Human confirmation | +0.3 | Manually verified point |
| Source conflict | -0.2 | Per contradicting source |
| Known weakness | -0.1 | Documented source limitation |

**Formula:** base_score + sum(factors), clamped to [0, 1]

## 11. Data Sources

| Source | Type | Update | Coverage |
|--------|------|--------|----------|
| Copernicus DEM | Global elevation | Annual | Global |
| Sentinel-2 | Satellite imagery | 5-day revisit | Global |
| OpenStreetMap | Roads, features | Continuous | Global |
| HydroSHEDS | Watersheds | Annual | Global (except Antarctica) |
| USGS 3DEP LiDAR | Elevation point cloud | Ongoing | US |
| NAIP | Aerial imagery | Annual | US |
| LANDFIRE | Vegetation fuel | Biennial | US |
| Census Bureau | Demographics | Decennial | US |
| FEMA | Flood zones | Continuous | US |
| EPA | Facilities | Monthly | US |
| Mapillary | Street imagery | Continuous | Global |

## 12. External Integrations
- USGS APIs (3DEP, NHD, NAIP)
- Copernicus Open Access Hub
- OpenStreetMap API
- FEMA databases
- EPA facility database
- Mapillary API
- Smithsonian Institution (volcanoes)

## 13. Quality Assurance Pipeline
1. Download & validation (extent, schema, nulls)
2. Baseline comparison (check for regressions)
3. Confidence scoring (assign data quality)
4. Quarantine or promote decision
5. Archive previous version
6. Update coverage metadata

## 14. Cross-Source Merging Strategy
- Apply confidence scores to all inputs
- Weight by score in merged datasets
- Document contradictions
- Flag blind spots where no data exists
- Track which source "won" each decision

## 15. Cost Breakdown
- Data licensing: ~$15K/yr (varies by project)
- API/download bandwidth: ~$5K/yr
- Processing compute: ~$8K/yr
- Storage (S3 + archive): ~$10K/yr

## 16. Monitoring & Alerts
- Source freshness tracking (alert if >30d old)
- Processing job failures
- Validation pass rate trending
- Coverage regression detection
- Confidence score distribution
- Quarantine queue buildup
- Daily data ingestion summary report
