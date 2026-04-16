# Digital Twin: System Overview

The digital twin is the persistent, updateable model of Earth's surface. Single source of truth integrating all attribute extractors' output. Versioned, immutable snapshots enable rollback. Real-time updates reflected within minutes. Historical time-series tracks changes.

## Architecture

Digital twin state = current best-estimate of every attribute at every location (1km grid cells globally).

Versioning: every change creates new version snapshot (v1, v2, ..., v_N). Immutable.

Rollback: revert to any prior version if update introduces errors.

Real-time: street-level perception, user reports, and post-event resurveys reflected within minutes.

Historical: time-series of all versions for trend analysis (e.g., "how many buildings destroyed in last 6 months").

## Data Flow

```
Global Fallback Pipeline → Global Fallback Tiles
National US Pipeline → US Attribute Extractors
Street-Level Perception → Real-Time Change Detection

    All feed into:
    ↓
Digital Twin State (PostgreSQL + S3 rasters)
    ↓ (on update: create new version)
Version Snapshot (immutable checkpoint)
    ↓
Tile Composition and Generation
    ↓
Tile Delivery (PMTiles, CDN, offline cache)
    ↓
Clients (hazard models, routing, mobile apps, public web)

    Real-Time Updates (street-level, post-event)
    bypass tile generation and go directly to:
    ↓
Transient Routing Layer (duration of event)
    ↓
Clients (routing engine applies immediately)
```

## Storage Infrastructure

### PostgreSQL+PostGIS (Spatial Queries)

Tables per attribute:

| Table | Type | Columns | Spatial Index |
|-------|------|---------|---------------|
| buildings | Polygon | geom, uuid, building_type, height_m, materials, year_built, confidence | GiST on geom |
| roads | LineString | geom, uuid, class, surface, width_m, speed_limit, lanes, confidence | GiST on geom |
| vegetation | Polygon | geom, uuid, type (tree/shrub), height_m, species, damage_status, confidence | GiST on geom |
| water | Polygon | geom, uuid, type (river/lake/ocean), name, flow_direction | GiST on geom |
| infrastructure | Point/LineString | geom, uuid, type (power_line/hydrant/pole), status | GiST on geom |
| hazard_zones | Polygon | geom, uuid, hazard_type, scenario, intensity, affected_population | GiST on geom |

Each table has version column (integer, immutable per row).

### TimescaleDB (Time-Series)

Time-stamped events:

| Table | Schema | Retention | Use Case |
|-------|--------|-----------|----------|
| attribute_changes | (tile_id, timestamp, attribute, old_value, new_value) | 5 years | Track all modifications |
| version_events | (version, timestamp, trigger, tiles_affected, status) | 5 years | Version history |
| tile_confidence_history | (tile_id, timestamp, confidence_score) | 1 year | Confidence trends |

Query example: "Show me all buildings added/destroyed in N45W090 in last month"

```sql
SELECT geom, building_type, timestamp, old_value, new_value
FROM attribute_changes
WHERE tile_id = 'N45W090_001_002'
  AND attribute = 'buildings'
  AND timestamp > now() - interval '1 month'
ORDER BY timestamp DESC;
```

### S3 (Tile Archives and Snapshots)

Storage structure:

```
s3://beacon-atlas-data/
  live/
    tiles/
      N45W090_001_002-v128.pmtiles
      N45W090_001_002-v129.pmtiles (current)
    version_manifest/
      v129_metadata.json
  archive/
    tiles/
      v1-v127/  (Glacier Deep Archive)
    versions/
      v1-v127_full_snapshot.tar.gz
  staging/
    (temporary work during updates)
```

Snapshot example (v129_metadata.json):

```json
{
  "version": 129,
  "timestamp": "2026-03-09T14:30:00Z",
  "trigger": "post_event_wildfire",
  "previous_version": 128,
  "tiles_affected": [
    "N45W090_001_002",
    "N45W090_001_003",
    "N45W090_002_002"
  ],
  "changes_summary": {
    "buildings_added": 0,
    "buildings_destroyed": 45,
    "roads_blocked": 12,
    "vegetation_burned": 2500
  },
  "promoted_by": "post_event_update_specialist",
  "validation_status": "passed"
}
```

### Redis (Hot Cache)

Caches frequently-accessed data:

| Key Pattern | Value Type | TTL | Use Case |
|-------------|----------|-----|----------|
| `tile:{tile_id}:v{version}` | Serialized tile JSON | 1 hour | Repeat reads |
| `version:{v}:metadata` | Version metadata | 24 hours | Version lookups |
| `hazard:active` | List of active hazard zones | 5 min | Real-time alerts |
| `attribution:confidence` | Confidence scores per attribute per tile | 1 hour | Client display |

Hit rate target: >85% for tile reads during peak load.

## Consumers

| Consumer | Query Pattern | Freshness Requirement |
|----------|---------------|----------------------|
| Hazard models | "Buildings in flood zone" | <5 min (streaming) |
| Evacuation routing | "Passable roads in area" | Real-time (events), hourly (normal) |
| Mobile client | "Tiles for current location" | <1 hour (cached) |
| Public web map | "Basemap tiles for viewport" | <1 day (CDN cached) |
| EMS dispatcher | "Damage assessment post-event" | <1 min (real-time feed) |
| Analytics | "Change trends over time" | Historical (no SLA) |
| Agentic planners | "Resource allocation queries" | <15 min |

## Version Control and Rollback

Current version number: always available as `version:current` in Redis.

Rollback procedure:

1. Base Map Director approves rollback
2. Query: `SELECT * FROM digital_twin_versions WHERE version = <old_v>`
3. Restore all tables to <old_v>: `UPDATE buildings SET ... WHERE version < <old_v>`
4. Update `version:current = <old_v>`
5. Invalidate CDN cache for affected tiles
6. Notify consumers (NATS)
7. Audit log: who, when, why

Rollback SLA: <30 minutes.

## Retention Policy

| Content | Hot (PostgreSQL) | Warm (S3) | Cold (Glacier) |
|---------|-----------------|-----------|----------------|
| Current version | Yes | Yes | No |
| Last 9 prior versions | Yes | Yes | No |
| Versions 10-50 | No | Yes | No |
| Versions 51+ | No | No | Yes |
| Age cutoff | Current | <1 year | 5 years |

Hot → Warm: version v_current-10 moved to S3 Standard after 1 day of inactivity.
Warm → Cold: versions >1 year old moved to Glacier Deep Archive.

Restoration time:
- Hot: <100ms
- Warm: <1 sec (S3 retrieval)
- Cold: 12 hours (Glacier restore time, but rarely needed)

## Freshness Guarantees

| Update Source | Latency to Twin | Latency to Tiles | Latency to Clients |
|--------------|-----------------|------------------|-------------------|
| Scheduled refresh | 5-10 min (processing) | +10 min (composition) | +1 min (CDN) = 16-21 min |
| Post-event resurvey | 4-6 hours (processing) | +10 min | +1 min = 4-6 hrs |
| User report (persistent) | 30 min (validation) | +10 min | +1 min = 41 min |
| User report (transient) | 1 min (real-time) | N/A (routing layer) | <5 min (mesh) |

Transient changes bypass tile generation and go directly to real-time routing layer (NATS topic `beacon.routing.obstruction_detected`).

## Monitoring and Health

Twin health score combines three factors:

```
twin_health_score = (
  0.4 × coverage_score +
  0.4 × freshness_score +
  0.2 × confidence_score
)

where:
  coverage_score = (tiles_with_data / total_tiles) × 100%
  freshness_score = (tiles_updated_in_last_30_days / total_tiles) × 100%
  confidence_score = avg(per_tile_confidence_scores)
```

Target: twin_health_score >= 85%.

Alerts:
- coverage_score < 70% → data acquisition needed
- freshness_score < 60% → update pipeline stalled
- confidence_score < 0.5 → fallback data only, unsafe for critical predictions

Dashboard: real-time twin health per region (US, APAC, Europe, etc.).

## NATS Integration

Pub/sub topics for real-time state updates:

| Topic | Payload | Subscribers |
|-------|---------|-------------|
| `beacon.atlas.updates` | Version bump, tiles affected, confidence delta | Hazard models, routing, clients |
| `beacon.routing.obstruction` | Transient obstruction (location, severity, duration) | Routing engine, mobile app |
| `beacon.atlas.versions` | Version history stream | Analytics, audit |
| `beacon.atlas.rollback` | Rollback event (old version, new version, reason) | All consumers (refresh cache) |

Publish immediately on twin state change (no batching for critical updates).
