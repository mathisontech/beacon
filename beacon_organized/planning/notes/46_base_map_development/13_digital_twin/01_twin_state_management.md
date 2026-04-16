# Digital Twin State Management

Functions to initialize, update, version, and query digital twin state. Tracks all changes with immutable snapshots and time-series history.

## Functions: State Operations

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| initialize_twin_state | Full attribute extraction results | State v1 | Bootstrap from scratch | One-time |
| apply_attribute_update | New extraction results, version number | State updated, new version | Merge new attributes | <5 min |
| apply_realtime_update | Street-level perception changes | State updated, published | Merge real-time data | <1 min |
| apply_post_event_update | Post-event resurvey data | State updated, new version | Merge damage assessment | <6 hours |
| create_version_snapshot | Current state | Immutable checkpoint | Save state in time | <1 min |
| rollback_to_version | Target version number | State reverted | Undo failed update | <30 min |
| query_state_at_time | Tile ID, timestamp | Historical state | Time-travel queries | <100ms |
| compute_state_diff | Old version, new version | Changed attributes | Document changes | <5 min |
| detect_state_anomaly | New attribute values | Anomaly score | Flag unexpected changes | Real-time |
| propagate_state_to_tiles | Changed tiles | Tile composition triggered | Refresh affected tiles | <10 min |
| archive_old_versions | Version age threshold | Archived versions | Retire cold data | Daily |
| compute_twin_health_score | All tiles, all versions | Health % | Overall system health | 1/hour |

## State Initialization

```
initialize_twin_state(extraction_results, source_list):
  # Extract results from global + US pipelines
  # source_list = ['copernicus_dem', 'sentinel2', 'osm', 'lidar_us', 'naip_us', 'mapillary_us', ...]

  # Create schema
  CREATE TABLE buildings (
    id UUID PRIMARY KEY,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    version INTEGER NOT NULL,
    source TEXT,
    building_type TEXT,
    height_m FLOAT,
    materials TEXT[],
    year_built INTEGER,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_buildings_geom ON buildings USING GIST(geom);
  CREATE INDEX idx_buildings_version ON buildings(version);

  # Similar tables: roads, vegetation, water, infrastructure, hazard_zones

  # Create time-series tables
  CREATE TABLE attribute_changes (
    id BIGSERIAL PRIMARY KEY,
    tile_id TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    attribute TEXT,
    old_value JSONB,
    new_value JSONB,
    source TEXT,
    version INTEGER
  );
  SELECT create_hypertable('attribute_changes', 'timestamp');

  # Populate from extraction results
  INSERT INTO buildings SELECT * FROM extraction_results['lidar_buildings'];
  INSERT INTO buildings SELECT * FROM extraction_results['satellite_buildings'];
  # Etc for all sources

  # Create version record
  version = 1
  INSERT INTO digital_twin_versions (version, timestamp, trigger, status)
    VALUES (1, NOW(), 'initialization', 'complete');

  # Cache in Redis
  SET version:current 1
  SET version:1:metadata {timestamp, tiles_affected, status}

  return version = 1
```

Initial twin state combines:
- Global fallback sources (Copernicus DEM, Sentinel-2, OSM, HydroSHEDS)
- US sources where available (LiDAR, NAIP, Mapillary, county assessor)
- Fallback where US data not available

## Applying Attribute Updates

```
apply_attribute_update(new_extraction, tile_list, version):
  # Called after scheduled refresh or source ingest

  version_new = version + 1

  # Merge new data per tile
  for tile_id in tile_list:
    new_buildings = new_extraction[tile_id]['buildings']
    new_roads = new_extraction[tile_id]['roads']
    # Etc for all attributes

    # Buildings: spatial merge (new + prior)
    existing = SELECT * FROM buildings WHERE geom && tile_bbox AND version = version;

    for building in new_buildings:
      # Check if overlaps existing building
      prior_match = SELECT * FROM buildings
        WHERE ST_Overlaps(geom, building.geom)
          AND ST_Area(ST_Intersection(...)) > 0.5 * ST_Area(building.geom)
          AND version = version;

      if prior_match:
        # Update: modified building
        UPDATE buildings SET (height_m, materials, year_built) = (...)
          WHERE id = prior_match.id AND version < version_new;
        # Keep prior version for history
      else:
        # Insert: new building
        INSERT INTO buildings (..., version) VALUES (..., version_new);

      # Log change
      INSERT INTO attribute_changes (tile_id, attribute, old_value, new_value, version)
        VALUES (tile_id, 'buildings', prior_match, building, version_new);

  # Mark tiles as updated
  UPDATE twin_tile_status SET version = version_new, updated_at = NOW()
    WHERE tile_id IN tile_list;

  # Create version snapshot
  INSERT INTO digital_twin_versions (version, timestamp, trigger, tiles_affected, status)
    VALUES (version_new, NOW(), 'scheduled_refresh', tile_list, 'processing');

  return version_new
```

Conflicts handled by spatial overlap: if <50% overlap, treat as new building. If >50%, update existing.

## Real-Time Updates (Street-Level Perception)

```
apply_realtime_update(user_submission, tile_id):
  # Called when user reports persistent obstruction (road blocked, etc.)
  # Bypass version increment (transient updates not versioned)

  # Classify submission
  change_type = classify_change(user_submission)  # road_blocked, debris, vegetation, etc.
  anomaly_score = user_submission['anomaly_score']  # 0-100

  if change_type == 'road_blocked':
    # Update passability without creating new version
    UPDATE roads SET passability_status = 'blocked', passability_confidence = anomaly_score / 100.0
      WHERE geom && tile_bbox;

    # Publish real-time update via NATS
    NATS_PUBLISH('beacon.routing.obstruction_detected', {
      tile_id,
      location: user_submission['location'],
      severity: estimate_severity(change_type),
      duration_estimate: '2 hours',
      reporter_count: 1
    });

  elif change_type == 'vegetation_down':
    UPDATE vegetation SET damage_status = 'down'
      WHERE geom && user_submission['location'] AND ST_Distance(...) < 50m;

    NATS_PUBLISH('beacon.routing.obstruction_detected', {...});

  # Log submission (for historical analysis)
  INSERT INTO user_submissions (tile_id, timestamp, change_type, confidence)
    VALUES (tile_id, NOW(), change_type, anomaly_score / 100.0);

  return submission_id
```

Real-time updates do NOT increment version. Instead, published to transient routing layer. Persisted to base map only after 24-hour validation.

## Post-Event Updates

```
apply_post_event_update(post_event_data, event_id, tile_list):
  # Called after post-event resurvey (wildfire damage, earthquake, flood, etc.)

  version_new = version + 1

  for tile_id in tile_list:
    damage_raster = post_event_data[tile_id]['damage_raster']  # 0-10 severity
    damage_confidence = post_event_data[tile_id]['confidence']

    # Intersect damage raster with prior buildings
    affected_buildings = SELECT * FROM buildings
      WHERE geom && tile_bbox AND version = version;

    for building in affected_buildings:
      damage_severity = sample_raster(damage_raster, building.geom);

      if damage_severity > 7:
        # Building destroyed
        DELETE FROM buildings WHERE id = building.id AND version = version;
        INSERT INTO buildings (id, geom, building_type, status, version)
          VALUES (building.id, building.geom, building.building_type, 'destroyed', version_new);
      elif damage_severity > 4:
        # Building damaged
        UPDATE buildings SET status = 'damaged', confidence = damage_confidence
          WHERE id = building.id AND version < version_new;
      # else: intact

      # Log change
      INSERT INTO attribute_changes (...)
        VALUES (tile_id, 'buildings', {id, status: 'intact'}, {id, status: 'damaged'}, version_new);

    # Similar for roads: mark blocked if damage > threshold

  # Create version snapshot tagged with event
  INSERT INTO digital_twin_versions (version, timestamp, trigger, event_id, tiles_affected, status)
    VALUES (version_new, NOW(), 'post_event_' || event_type, event_id, tile_list, 'complete');

  # Cache
  SET version:current version_new
  NATS_PUBLISH('beacon.atlas.updates', {version: version_new, ...});

  return version_new
```

Post-event updates retain prior version for comparison (see damage in before/after).

## Version Snapshots (Immutable Checkpoints)

```
create_version_snapshot(version):
  # Capture current state in time
  # Used for rollback, historical analysis, archive

  timestamp = NOW();
  snapshot_metadata = {
    version,
    timestamp,
    tile_count: COUNT(*) FROM buildings WHERE version = version,
    attribute_counts: {
      buildings: ...,
      roads: ...,
      vegetation: ...
    },
    coverage_score: ...,
    confidence_score: ...,
    data_sources: [...]
  };

  # Write to PostgreSQL
  INSERT INTO digital_twin_versions (version, timestamp, metadata)
    VALUES (version, timestamp, snapshot_metadata);

  # Export full state to S3 (archive)
  backup_path = f"s3://beacon-atlas-data/archive/versions/v{version}_full_snapshot.tar.gz";
  export_all_tables_to_parquet(version);
  compress_to_tar_gz(parquet_files, backup_path);

  # Update Redis
  SET version:{version}:snapshot_path backup_path;

  return snapshot_metadata
```

Snapshots stored in Parquet (columnar format, efficient for analytics) then compressed.

Restoration from snapshot (rollback):

```sql
-- Restore from snapshot v126
WITH snapshot AS (
  SELECT * FROM archive.buildings_v126_parquet
)
UPDATE buildings SET * = snapshot.* WHERE version >= 127;
UPDATE digital_twin_versions SET current_version = 126;
```

## Rollback Procedure

```
rollback_to_version(target_version, reason, approver):
  current_v = GET version:current;

  if target_version >= current_v:
    raise ValueError("Cannot rollback to same or newer version");

  if target_version < current_v - 10:
    raise ValueError("Rollback limited to last 10 versions for safety");

  # Approval log
  INSERT INTO rollback_audit (from_version, to_version, reason, approver, timestamp)
    VALUES (current_v, target_version, reason, approver, NOW());

  # Restore state
  -- Delete all records added after target_version
  DELETE FROM buildings WHERE version > target_version;
  DELETE FROM roads WHERE version > target_version;
  -- Etc for all tables

  -- Update current_version
  UPDATE digital_twin_versions SET current_version = target_version WHERE current_version = current_v;

  # Cache update
  SET version:current target_version;
  FLUSHDB version:{current_v}:*;

  # Invalidate CDN tiles affected
  for tile_id in (SELECT DISTINCT tile_id FROM version_events WHERE version IN (target_version+1..current_v)):
    CLOUDFRONT_INVALIDATE(tile_id);

  # Notify consumers
  NATS_PUBLISH('beacon.atlas.rollback', {from: current_v, to: target_version, reason});

  return target_version
```

SLA: complete rollback <30 min.

## Query: Historical State

```
query_state_at_time(tile_id, timestamp):
  # Return state of tile at specific timestamp
  # Used for historical analysis, trend detection

  # Find version active at timestamp
  active_version = SELECT version FROM digital_twin_versions
    WHERE timestamp <= timestamp ORDER BY version DESC LIMIT 1;

  # Query state at that version
  buildings = SELECT * FROM buildings
    WHERE geom && tile_bbox AND version <= active_version
    ORDER BY version DESC;

  # Latest version per feature
  roads = SELECT DISTINCT ON (id) *
    FROM roads WHERE geom && tile_bbox AND version <= active_version
    ORDER BY id, version DESC;

  return {buildings, roads, ...}
```

Time-travel example: "Show me buildings that existed in N45W090 on 2026-01-01"

## Anomaly Detection

```
detect_state_anomaly(new_values, tile_id, attribute):
  # Flag unexpected changes (possible data errors)

  prior_values = SELECT * FROM buildings WHERE tile_id = tile_id;

  for new_val in new_values:
    prior_match = find_spatial_match(new_val, prior_values);

    if prior_match:
      # Check for unreasonable changes
      height_delta = new_val.height_m - prior_match.height_m;
      if abs(height_delta) > 20:  # Buildings rarely grow 20m overnight
        anomaly_score = min(1.0, abs(height_delta) / 50);  # Normalized to [0, 1]
        ALERT: f"Anomaly: building height changed {height_delta}m";

      materials_changed = set(new_val.materials) != set(prior_match.materials);
      if materials_changed:
        anomaly_score = 0.5;  # Material changes expected in updates
        # Log but don't alert

    else:
      # New building in location where prior existed
      # Check: did prior building get demolished or just missed?
      if is_plausible_demolition(prior_match, new_val):
        anomaly_score = 0.1;  # Expected
      else:
        anomaly_score = 0.8;  # Suspicious
        ALERT: f"Anomaly: building in {tile_id} disappeared";

  return anomaly_scores
```

Anomalies quarantined: version tagged with `quality_flag: 'anomaly_detected'`. Manual review before promotion to live.

## Database Schema Summary

```sql
-- Core tables
CREATE TABLE buildings (version INT, geom GEOMETRY, height_m FLOAT, confidence FLOAT, ...);
CREATE TABLE roads (version INT, geom GEOMETRY, surface TEXT, confidence FLOAT, ...);
CREATE TABLE vegetation (version INT, geom GEOMETRY, damage_status TEXT, ...);
CREATE TABLE water (version INT, geom GEOMETRY, type TEXT, ...);
CREATE TABLE infrastructure (version INT, geom GEOMETRY, type TEXT, ...);
CREATE TABLE hazard_zones (version INT, geom GEOMETRY, hazard_type TEXT, ...);

-- Version tracking
CREATE TABLE digital_twin_versions (
  version INT PRIMARY KEY,
  timestamp TIMESTAMP,
  trigger TEXT,
  tiles_affected TEXT[],
  status TEXT
);

-- Time-series (TimescaleDB hypertable)
CREATE TABLE attribute_changes (
  id BIGSERIAL,
  tile_id TEXT,
  timestamp TIMESTAMP,
  attribute TEXT,
  old_value JSONB,
  new_value JSONB,
  version INT
);
SELECT create_hypertable('attribute_changes', 'timestamp');

-- Audit trail
CREATE TABLE rollback_audit (from_version INT, to_version INT, reason TEXT, approver TEXT);
CREATE TABLE user_submissions (tile_id TEXT, timestamp TIMESTAMP, change_type TEXT, confidence FLOAT);
```

All queries use spatial indexes (GiST) for fast geometry lookups.
