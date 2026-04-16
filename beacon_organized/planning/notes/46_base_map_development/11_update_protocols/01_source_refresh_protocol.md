# Source Refresh Protocol

Scheduled data update processing when official sources release new data. Triggered by release calendar, processed through alignment, extraction, validation, and promotion.

## Release Calendar and Detection

| Source | Frequency | Check Method | Coordinator Action |
|--------|-----------|--------------|-------------------|
| Sentinel-2 | Every 5 days | Copernicus Hub API | Weekly digest compilation |
| NAIP | Annual (spring/summer) | USGS EarthExplorer | Trigger per-state download on release |
| 3DEP LiDAR | 1-3 projects/year | OpenTopography email | Trigger download on email notification |
| OpenStreetMap | Continuous | Geofabrik diff feed | Weekly diff extraction (auto) |
| LANDFIRE | Biennial (Dec even) | Calendar + email | Manual trigger in December |
| Census | Annual (ACS), decennial (full) | Census Bureau schedule | Manual trigger, July (ACS) / April (full) |
| FEMA flood maps | Irregular | FEMA Updates email | Manual trigger on notification |
| County assessor | Annual (varies) | County-by-county calls | Batch quarterly requests |

`track_release_calendar` monitors all sources. `detect_new_release` queries each source API/website and returns new versions available.

## Ingestion Pipeline

### Step 1: Detect and Validate Schema

```
detect_new_release()
    → Returns: [(source, version, url, size, release_date)]

validate_new_schema(source, version)
    → Checks: expected fields, data types, coordinate systems match prior versions
    → Returns: schema_compatible (bool), breaking_changes (list)
```

Examples:
- Sentinel-2 band layout same as prior? Yes → compatible.
- FEMA flood map feature classes same? No "BFE" field → breaking change, manual review.
- LiDAR new project has different vertical datum? Flag for alignment calibration.

### Step 2: Ingest New Version

```
ingest_new_version(source, version, url)
    → Download to raw/{source}/v{NNN}/
    → Compute SHA-256 checksum
    → Verify against provider's published checksum
    → Write manifest.json: [(file, size, checksum), ...]
    → Log download time, file count, total size
```

Retry logic: 3 attempts, exponential backoff (1s, 5s, 30s). Timeout: 30 min per file. Resume partial downloads.

### Step 3: Alignment and Extraction

```
run_alignment_pipeline(source, version)
    → If source is satellite/LiDAR: align new imagery to prior basemap using SIFT features
    → If source is vector (OSM/assessor): snap to prior road/building layer
    → Returns: alignment_error_meters (median) per tile
    → Threshold: >50m → manual review required
```

`run_extraction_pipeline(source, version, aligned_data)`:
    → Feed aligned data through all attribute extractors
    → Extract buildings, roads, vegetation, barriers, etc. per processor docs
    → Returns: attribute rasters + confidence maps per tile
    → Compare against prior version: count new/deleted/modified features

### Step 4: Staging and Testing

```
stage_test_deployment(extracted_data)
    → Copy extracted tiles to staging/source/v{NNN}/
    → Build test digital twin v_test merging new source into prior twin
    → Deploy v_test to test environment
    → Return: test_url, test_version_hash
```

### Step 5: Quality Validation

```
validate_no_regression(old_version, new_version)
    → Per-tile comparison:
        - Attribute count: new ≥ old × 0.95 (allow 5% loss)
        - Confidence scores: new ≥ old × 0.90
        - Feature count delta: |new - old| < 20% per class
    → Cross-source consistency: new building count vs. prior OSM + satellite
    → Validation report: [(tile, check, result, delta), ...]
    → Returns: pass/fail, risk_score (0-100)
```

Thresholds:
- Risk score 0-20: auto-promote
- Risk score 21-60: promote with notification
- Risk score 61-100: quarantine, manual review

### Step 6: Promotion and Notification

```
promote_to_production(source, version)
    → Copy staging/source/v{NNN}/ → live/source/v{NNN}/
    → Update config.current_versions[source] = version
    → Keep prior version live (fallback)
    → Older versions (>2) moved to archive

archive_previous_version(source, old_version)
    → Move old version to archive/source/v{old}/
    → Set S3 storage class: Glacier Deep Archive
    → Write archive_log.json with retirement reason, timestamp

notify_downstream_consumers(source, new_version)
    → NATS publish: beacon.atlas.updates
    → Payload: source, version, tiles_affected, confidence_delta
    → All hazard models, routing, clients subscribe and refresh
```

## Function Reference

| Function | Input | Output | Role |
|----------|-------|--------|------|
| track_release_calendar | Config (release_schedule) | Schedule dict per source | Populate/maintain release dates |
| detect_new_release | Source name | New versions available? | Poll for updates |
| validate_new_schema | Source name, version | Schema compatible? | Ensure format stability |
| ingest_new_version | URL, source, version | Manifest.json | Download and verify |
| run_alignment_pipeline | New raw data, prior basemap | Aligned tiles + error map | Register imagery spatially |
| run_extraction_pipeline | Aligned data, extractors | Attribute rasters + confidence | Extract all attributes |
| stage_test_deployment | Extracted data | Test version URL | Deploy to staging |
| validate_no_regression | Old version, new version | Quality report, risk score | Detect regressions |
| promote_to_production | Validated version | Live version | Release to production |
| archive_previous_version | Old version | Archived version | Retire old data |
| notify_downstream_consumers | Source, version, tiles | NATS message | Broadcast update |

## Processing Load and Timing

| Source | Ingest Time | Align Time | Extract Time | Validate Time | Total SLA |
|--------|-------------|-----------|--------------|--------------|-----------|
| Sentinel-2 (weekly digest) | 2 hrs | 3 hrs | 4 hrs | 1 hr | 10 hrs |
| NAIP state (~500 scenes) | 4 hrs | 6 hrs | 8 hrs | 2 hrs | 20 hrs |
| 3DEP project (~1000 tiles) | 2 hrs | 4 hrs | 6 hrs | 1 hr | 13 hrs |
| OSM weekly diff | 30 min | 1 hr | 2 hrs | 30 min | 4 hrs |
| LANDFIRE biennial | 1 hr | 2 hrs | 3 hrs | 1 hr | 7 hrs |

## Conflict Handling

Two updates to same tile within 24 hours:

1. If both scheduled (e.g., Sentinel-2 + LANDFIRE): merge extractions, confidence = max(conf1, conf2)
2. If one scheduled + one post-event: post-event overrides if confidence higher
3. If both post-event: use most recent

Merge log written to update_logs/ documenting decision.

## Rollback Procedure

If promoted version introduces critical errors:

1. Base Map Director approves rollback
2. Promotion reversed: live pointer reset to prior version
3. Failed version moved to quarantine/
4. Downstream consumers notified within 15 min
5. RCA required before re-promotion

Rollback SLA: <30 min from detection to live revert.
