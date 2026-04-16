# Alignment Processor Overview

Multi-source data registration to common coordinate system and grid before attribute extraction.

## Purpose

Transform raw geospatial data from heterogeneous sources into a unified, co-registered stack per 1km tile. All data aligned to:
- Coordinate system: EPSG:4326 (WGS84)
- Grid: 1km cells at integer lat/lon boundaries
- Reference epoch: monthly per global tier, variable per source/national tier

Output: per-tile multi-source stack with confidence scores. Feeds all downstream attribute extraction (buildings, roads, terrain, vegetation, barriers).

## Pipeline

```
Raw Data Ingest
       ↓
CRS Normalization (EPSG:4326)
       ↓
Spatial Registration (GCP-based alignment)
       ↓
Temporal Alignment (normalize timestamps)
       ↓
Resolution Harmonization (resample to 1km grid)
       ↓
Quality Validation (completeness, confidence)
       ↓
Aligned Multi-Source Stack (per 1km tile)
       ↓
Attribute Extraction Processors
```

## Ownership

| Role | Responsibility |
|------|-----------------|
| Data Pipeline Lead | Overall system design, version management, SLA |
| Alignment Specialist | CRS/registration/grid operations, validation |
| Quality Assurance Team | Spot-check tiles, flag issues, track drift |
| GIS Infrastructure | S3 paths, NATS topics, Redis cache tuning |

## Processing Tiers

| Tier | Scope | Frequency | Timeline | Use Case |
|------|-------|-----------|----------|----------|
| Global All-at-Once | Full planet coverage | Monthly | 30-45 days | Baseline refresh |
| Per-Source-Tile | Single source, variable region | Variable | 1-7 days | Source-specific updates |
| National Per-Source | US + dependencies | 7-14 days | 1-2 weeks | CONUS priority |
| Per-Cell | Single 1km cell | 24 hours | Minutes-hours | Real-time event updates |

## Storage Layout

```
s3://beacon-atlas/alignment_processor/
├── raw/v{NNN}/                  # Raw data before alignment
│   ├── sentinel2/
│   ├── naip/
│   ├── lidar/
│   ├── osm/
│   ├── dem/
│   └── ...sources/
├── staging/v{NNN}/              # Post-processing, pre-validation
│   └── {tile_id}/               # Per-tile stacks
├── aligned/v{NNN}/              # Live aligned data
│   └── {tile_id}/
│       ├── metadata.json
│       ├── confidence.tif
│       └── source_inventory.parquet
├── archive/                     # Previous versions (Glacier)
└── quarantine/                  # Failed validation
```

## Aligned Stack Contents (Per 1km Tile)

| Layer | Source | Resolution | Type | Confidence |
|-------|--------|------------|------|-----------|
| dem | 3DEP / Copernicus | 1m / 30m | Raster (Float32) | Source-specific |
| slope | DEM-derived | 1m / 30m | Raster (Float32) | DEM confidence |
| satellite_rgb | Sentinel-2 / NAIP | 10m / 0.6m | Raster (UInt8) | Cloud/QA mask |
| lidar_dsm | 3DEP | 1m | Raster (Float32) | Coverage confidence |
| buildings | LiDAR + satellite | Vector | GeoParquet | Multi-source consensus |
| roads | OSM + satellite + LiDAR | Vector | GeoParquet | Conflation score |
| barriers | LiDAR + street-view | Vector | GeoParquet | Multi-source consensus |
| land_cover | Multiple | 10m | Raster (UInt8) | Overall accuracy |

## NATS Messaging

All state changes published to NATS for streaming consumers (dashboards, alerting, federation).

| Topic | Event | Frequency |
|-------|-------|-----------|
| alignment.{tier}.started | Processor start | At launch |
| alignment.{tier}.tile_complete | Tile finished | Per-tile |
| alignment.{tier}.validation_result | QA pass/fail | Per-tile |
| alignment.{tier}.conflict_detected | Source mismatch | On detection |
| alignment.{tier}.finished | Tier complete | At finish |

## Redis Cache Patterns

| Key | TTL | Use |
|-----|-----|-----|
| `alignment:tile:{tile_id}:metadata` | 7 days | Tile timestamp, version, checksum |
| `alignment:tile:{tile_id}:confidence` | 7 days | Per-attribute confidence scores |
| `alignment:offset:{source_pair}` | 30 days | Cached spatial offsets between sources |
| `alignment:validation_results` | 1 day | Running QA results |

## Version Management

Version numbering: `v{YYYMMDDxxx}` where xxx is sequence.

| Lifecycle | Description | Retention |
|-----------|-------------|-----------|
| raw | Downloaded, unprocessed | 2 months |
| staging | Aligned, pre-validation | 2 weeks |
| live | Validated, in-service | Permanent |
| archive | Superseded version | 2 years (Glacier) |
| quarantine | Failed validation | 1 month (review) |

## Cost Estimates

Assume 26,000 tiles, monthly refresh for global tier.

| Component | Monthly Cost |
|-----------|-------------|
| Sentinel-2/NAIP ingestion | $150-200 |
| DEM processing (resampling) | $80-120 |
| LiDAR alignment (US subset) | $200-300 |
| S3 storage (raw + staging + live) | $500-800 |
| NATS / Redis | $100-150 |
| EC2 processing (16 vCPU, 30 days) | $400-600 |
| **Total** | **$1,430-2,170** |

Per-source-tile updates (weekly) add 20-30% per update.

## Quality Gates

| Check | Threshold | Action |
|-------|-----------|--------|
| Positional RMSE | <0.5 pixels | Pass/fail per source |
| Temporal span | <6 months | Flag if exceeded |
| Attribute coverage | >50% per tile | Promote / hold |
| Confidence distribution | >20% high confidence | Promote / quarantine |
| Conflicting sources | <5% area | Resolve / escalate |

## Success Metrics

| Metric | Target |
|--------|--------|
| Alignment cycle time (global) | 30-45 days |
| Per-source-tile latency | 1-7 days |
| Positional accuracy (RMS) | <1 pixel at source resolution |
| Confidence score mean | >0.6 globally, >0.75 US |
| Data completeness | >80% cells have >3 sources |
| False conflicts resolved | >95% automated |
