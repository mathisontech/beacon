# Alignment Processor System Architecture

Operational design: compute, storage, messaging, monitoring.

## Compute Architecture

### Processing Tiers

| Tier | Scope | Hardware | Parallelism | Schedule |
|------|-------|----------|-------------|----------|
| Global All-at-Once | 26,000 tiles | 64 vCPU, 512GB RAM, A100 GPU | 1000 tiles parallel | Monthly |
| Per-Source-Tile | Variable region | 16 vCPU, 128GB RAM | 100 tiles parallel | Variable (weekly) |
| National Per-Source | US + deps | 32 vCPU, 256GB RAM | 500 tiles parallel | 7-14 days |
| Per-Cell | Single 1km | 4 vCPU, 32GB RAM | Sequential | On-demand (minutes) |

### Processor Pipeline Topology

```
                                  Raw Data Ingest
                                        ↓
                    ┌───────────────────┼───────────────────┐
                    ↓                   ↓                   ↓
              Satellite Align       LiDAR Align        Street-View Align
                    ↓                   ↓                   ↓
                    ├───────────────────┼───────────────────┤
                    ↓                   ↓                   ↓
                DEM Align         Vector Align       Reference Data Align
                    ↓                   ↓                   ↓
                    └───────────────────┼───────────────────┘
                                        ↓
                            Cross-Source Registration
                                        ↓
                            Alignment Validation
                                        ↓
                                  Live Promotion
```

Processors run in parallel where dependencies allow. Cross-source registration waits for all source processors to complete.

## Storage Architecture

### S3 Organization

```
s3://beacon-atlas/alignment_processor/
├── raw/v{NNN}/                          # Staging for raw downloads
│   ├── sentinel2/{tile}_{date}.tif
│   ├── naip/{state}_{tile}.tif
│   ├── lidar/{project}/{tile}.laz
│   ├── osm/extract.pbf
│   ├── dem/{tile}.tif
│   └── street_view/{region}.parquet
├── staging/v{NNN}/                      # Per-processor outputs (pre-validation)
│   ├── satellite/{tile}/
│   ├── lidar/{tile}/
│   ├── street_view/{tile}/
│   ├── dem/{tile}/
│   ├── vector/{tile}/
│   ├── reference/{tile}/
│   └── cross_source/{tile}/
├── aligned/v{NNN}/                      # Live aligned stacks
│   └── {tile}/
│       ├── metadata.json
│       ├── dem.tif
│       ├── satellite_rgb.tif
│       ├── buildings.parquet
│       └── ...
├── archive/                             # Previous versions (Glacier)
├── quarantine/                          # Failed validation
│   └── {failed_processor}/{tile}_{date}/
└── update_logs/                         # Processor telemetry
    └── {date}/{processor}.json
```

### Storage Lifecycle

| Path | Retention | Class | Accessed |
|------|-----------|-------|----------|
| raw | 2 months | Standard | Validation only |
| staging | 2 weeks | Standard | Development only |
| aligned (live) | Permanent | Standard | Production |
| archive (>1 version) | 2 years | Glacier | Rarely |
| quarantine | 30 days | Standard | Investigation |

### Estimated Sizes (Per Version)

| Component | Size |
|-----------|------|
| Raw Sentinel-2 (monthly global) | 150 GB |
| Raw NAIP (per state, tri-annual) | 50 GB (active states) |
| Raw LiDAR (per project) | 2-5 TB |
| Raw DEM (global Copernicus) | 50 GB |
| Staging (all processors) | 200 GB (temporary) |
| Aligned stack (live) | 500 GB |
| **Total per version** | **~1 TB** (excluding LiDAR) |
| **LiDAR archived** | 10-50 TB (one-time) |

## Messaging Architecture

### NATS Topics

All state changes published for streaming consumption (dashboards, alerts, downstream systems).

| Topic | Frequency | Consumers |
|-------|-----------|-----------|
| `alignment.global.started` | Monthly | Dashboard, alert system |
| `alignment.global.satellite_complete` | Per-batch | Monitoring |
| `alignment.global.lidar_complete` | Per-batch | Monitoring |
| `alignment.global.cross_source_started` | Once/month | Orchestrator |
| `alignment.global.tile_complete` | Per-tile (26k/month) | Live update feed |
| `alignment.global.validation_pass` | Per-tile | Quality dashboard |
| `alignment.global.validation_fail` | Per-tile | Alert queue |
| `alignment.global.finished` | Once/month | Federation broadcast |

Subject hierarchy: `alignment.{tier}.{processor}.{event}`

### Message Format

```json
{
  "event_type": "tile_complete",
  "tile_id": "12345",
  "version": "v202603121",
  "processor": "satellite_alignment",
  "timestamp": "2026-03-12T14:30:00Z",
  "status": "success",
  "telemetry": {
    "runtime_seconds": 45,
    "tiles_processed": 100,
    "source_count": 3,
    "mean_confidence": 0.68
  }
}
```

## Cache Architecture

### Redis Patterns

| Key | Type | TTL | Size |
|-----|------|-----|------|
| `alignment:tile:{tile_id}:metadata` | Hash | 7 days | 10 KB |
| `alignment:tile:{tile_id}:sources` | Set | 7 days | 1 KB |
| `alignment:offset:{source1}:{source2}` | Hash | 30 days | 5 KB |
| `alignment:confidence:{tile_id}` | Hash | 7 days | 20 KB |
| `alignment:validation_queue` | List | 24 hours | 1 MB |

Expected memory: ~50-100 GB for full global coverage + 30-day history.

## Database Architecture

### PostGIS Tables (Main)

Core operational tables:

| Table | Size | Indexed Columns | Use |
|-------|------|-----------------|-----|
| `alignment_tiles` | 26k rows | tile_id, version | Tile metadata |
| `source_offsets` | 100k rows | source_pair, tile_id | Spatial registration |
| `conflicts_detected` | 50k rows | tile_id, attribute | Conflict tracking |
| `validation_results` | 1M rows (per month) | tile_id, check_type | QA history |
| `quality_scores` | 26k rows | tile_id, version | Tile scoring |

All tables sharded by tile_id for scalability.

### Operational Tables

| Table | Purpose | Retention |
|-------|---------|-----------|
| `processor_runs` | Execution log | 90 days |
| `quarantined_tiles` | Failed validation | 30 days |
| `source_metadata` | Source timestamps, versions | Permanent |
| `confidence_history` | Confidence tracking (monthly snapshots) | 2 years |

## Monitoring & Observability

### Metrics

Prometheus metrics exported per processor:

| Metric | Type | Labels |
|--------|------|--------|
| `alignment_tiles_processed` | Counter | processor, tier, status |
| `alignment_processing_seconds` | Histogram | processor, tier |
| `alignment_confidence_score` | Histogram | tile_id, processor |
| `alignment_positional_rmse` | Histogram | layer, source |
| `alignment_conflicts_detected` | Counter | tile_id, attribute |
| `alignment_queue_depth` | Gauge | processor |

### Dashboards

| Dashboard | Audience | Refresh |
|-----------|----------|---------|
| Processing Status | Operators | Real-time (NATS) |
| Quality Metrics | QA team | 5 min (Prometheus) |
| Drift Detection | Data leads | Daily |
| Per-Source Performance | Source team leads | Weekly |

## Authentication & Authorization

### IAM Roles

| Role | Permissions | Users |
|------|-------------|-------|
| Pipeline Executor | Run processors, write staging/live | 2-4 service accounts |
| QA Reviewer | Read live/staging, approve promotions | 5 QA staff |
| Data Admin | Full control (rare) | 2 data leads |
| Monitoring | Read-only metrics + dashboards | All staff |

### S3 Bucket Policies

```
- Processors: read raw/, write staging/
- QA: read staging/ + live/
- Promotion: move staging → live (via orchestrator only)
- Archive: move old live → Glacier
```

## High-Availability Design

### Failover Strategy

| Component | Failure Mode | Recovery |
|-----------|--------------|----------|
| EC2 instance crash | Processor stops mid-tile | Automatic restart (ASG), retry failed tile |
| S3 temporary outage | Cannot read/write | Exponential backoff + alert |
| PostGIS unavailable | Cannot write results | Buffer to local DB, replay on recovery |
| NATS disconnect | Events not published | Re-publish on reconnect (dedupe on consumer side) |

### Retry Logic

```
Processor exceptions:
  retry_limit = 3
  backoff_factor = 2^attempt_number (exponential)

  Attempt 1: immediate
  Attempt 2: 2 seconds later
  Attempt 3: 4 seconds later

  On failure: log, alert, quarantine tile
```

### Backup Strategy

| Data | Backup Frequency | Retention |
|------|------------------|-----------|
| PostGIS tables | Daily snapshot | 30 days |
| Redis cache | None (ephemeral) | N/A |
| Update logs (S3) | Versioned | Permanent |
| Aligned stacks (S3) | Versioned | 2+ versions live |

## Scaling Characteristics

### Per-Processor Parallelism

Designed for horizontal scaling:

| Processor | Tiles per Instance | Instances (Global) | Throughput |
|-----------|-------------------|-------------------|-----------|
| satellite_alignment | 100 | 10 | 1000 tiles/hour |
| lidar_alignment | 10 | 20 | 200 tiles/hour |
| street_view_alignment | 50 | 5 | 250 tiles/hour |
| dem_alignment | 100 | 5 | 500 tiles/hour |
| vector_alignment | 50 | 3 | 150 tiles/hour |
| reference_alignment | 500 | 1 | 500 tiles/hour |
| cross_source_registration | 100 | 10 | 1000 tiles/hour |
| validation | 100 | 10 | 1000 tiles/hour |

Total: 64 EC2 instances (16 vCPU / 128 GB RAM each) for full global monthly cycle.

### Storage Scaling

```
Projected 5-year growth:

Year 1: 1 TB/month (aligned) + 10 TB LiDAR archive
Year 2: 1.5 TB/month (more US LiDAR) + 30 TB archive
Year 3: 2 TB/month (global LiDAR pilot) + 60 TB archive
Year 4: 3 TB/month (global LiDAR scale) + 100 TB archive
Year 5: 3.5 TB/month (full steady state) + 150 TB archive

S3 budget: $200-400/month operational, $50-100/month archive (Glacier)
```

## Security Architecture

### Data Security

- S3 default encryption (AES-256)
- VPC isolation for compute
- No direct public access to S3
- All API calls logged to CloudTrail

### Processing Security

- Processors run in isolated containers (ECS)
- No hardcoded credentials (use IAM roles)
- Logs sanitized (no PII in telemetry)
- Street-view images anonymized before storage (faces/plates blurred)

### Access Control

- ReadOnly access to live data for all services
- WriteOnly to staging (processors only)
- Promotion to live requires dual approval (orchestrator + QA)

## Cost Projections

### Monthly Operating Cost (Global Tier)

| Component | Cost |
|-----------|------|
| EC2 compute (64 instances × 30 days) | $3,000-5,000 |
| GPU (A100, shared) | $1,000-1,500 |
| S3 storage (aligned + staging) | $500-800 |
| Data transfer (egress) | $200-400 |
| PostGIS (RDS) | $500-1,000 |
| Redis (ElastiCache) | $200-400 |
| NATS messaging | $100-200 |
| Monitoring (CloudWatch, Grafana) | $100-200 |
| **Total** | **$5,600-9,500** |

Add 20-30% for per-source-tile + national tier updates (weekly).

### One-Time Costs

| Component | Cost |
|----------|------|
| Infrastructure setup | $5,000-10,000 |
| Data licensing (Copernicus, Sentinel-2) | Free (open data) |
| USGS 3DEP download | Free (open data) |
| Assessor data aggregation (3000 counties) | $5,000-10,000 |
| **Total** | **$10,000-20,000** |

## Operations Runbook

### Daily Checks

```
08:00 - Check overnight processing status
        - NATS message count
        - Processor queue depth
        - S3 staging folder size

12:00 - Mid-day health check
        - Metric dashboards
        - Alert queue (any?)

18:00 - End-of-day summary
        - Tile completion count
        - Validation pass rate
        - Alert review
```

### Monthly Cycle

```
Day 1-3:   Fetchers download new data (satellite, LiDAR, vector)
Day 4-15:  Processors run (parallelized by source)
Day 16-20: Cross-source registration
Day 21-25: Validation + manual review
Day 26-28: Promotion to live
Day 29-30: Archive previous version, cleanup
```

### Incident Response

| Issue | Escalation | SLA |
|-------|-----------|-----|
| Processor crash | Alert ops, retry | Resolve within 1 hour |
| Validation failures (>5% tiles) | Alert data lead | Investigate within 2 hours |
| Quality score collapse | Block promotion | Root cause within 4 hours |
| Data corruption detected | Rollback to previous version | Restore within 1 hour |

---

## Next Steps

1. **Infrastructure provisioning:** Terraform scripts for EC2, RDS, S3, ElastiCache
2. **Processor implementation:** One processor per Claude Code session (follow Global Pipeline guide)
3. **Testing:** Phase 0 PoC on 4 test tiles before full deployment
4. **Staffing:** Hire/train 5-person QA team + 2 data engineers
5. **Go-live:** Staged rollout (test region → national → global)
