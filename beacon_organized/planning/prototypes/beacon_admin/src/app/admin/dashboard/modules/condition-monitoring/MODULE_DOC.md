# Condition Monitoring & Situation Data Module

Comprehensive development documentation for external sensor data ingestion, normalization, quality control, and confidence scoring across global authoritative sources feeding Beacon hazard detection and risk assessment.

---

## 1. Module Metadata

**Team:** Data Ingestion & Situation Data Management

**Parent Module:** Data Science / Base Map Infrastructure

**Sub-Modules:**
- Official Situation Data Manager
- Real-Time Feed Ingestion
- Static Data Processing
- Schema Validation & QC
- Confidence Scoring & Merging
- Source Health Monitoring

**Goal:** Ingest 50+ authoritative sensor feeds, normalize to common schema, tag with confidence scores, deliver normalized data streams to all hazard modeling modules without data loss or corruption.

**Mission Alignment:** Provides the authoritative ground truth about world state before any risk assessment occurs. This module answers "What does the world look like right now?" — enabling accurate hazard predictions and timely evacuation decisions that save lives.

**Owner:** Data Ingestion Lead (VP Data Science org)

---

## 2. Inputs/Outputs

| Item | Source | Type | Frequency | Schema/Example |
|------|--------|------|-----------|----------------|
| **Real-time feeds** | USGS, NOAA, NWS, RAWS, GOES/VIIRS, seismic networks, DART | JSON/CSV/XML | 1-30 min | Temperature, flow rate, magnitude, hotspot lat/lon |
| **Static data sources** | USGS, Census, FEMA, EPA, NBI, SSURGO | Shapefile/GeoJSON/Database | Weekly-annual | Flood zones, bridges, census blocks, soil properties |
| **Sensor outage reports** | Network monitoring, user reports | JSON | Real-time | Sensor ID, last good reading, downtime duration |
| **Schema change notifications** | Source APIs, data partnerships | JSON | On-demand | Source ID, old schema, new schema, breaking changes |
| **Quality control feedback** | Hazard modeling teams | JSON | Daily-weekly | Data layer, accuracy concerns, downstream impact |
| **Output: Normalized sensor data** | Hazard models, event managers, UI dashboards | GeoJSON + metadata | Real-time / 15-60 min batches | Location, value, timestamp, confidence, source lineage |
| **Output: Data quality reports** | EMS dashboard, data team | JSON/HTML | Daily | Source freshness, validation pass rate, schema violations |
| **Output: Confidence-tagged layers** | Hazard models (wildfire, flood, etc.) | GeoJSON with confidence | Real-time | Feature + {confidence: 0.0-1.0, sources: ["USGS", "NOAA"], last_update} |

**Output Consumers:**
- All hazard modeling modules (wildfire, flood, earthquake, etc.)
- Event Management module
- Admin dashboards (EMS/responders)
- Public user mobile app
- Weather simulator
- Evacuation routing engine

---

## 3. Function Breakdown

### 3.1 Real-Time Feed Ingestion

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `ingest_usgs_stream_gauge()` | Poll USGS water flow, depth at monitoring stations | USGS API endpoint | Normalized flow/depth readings with coordinates | 15 min | Stream database | ±5% accuracy vs. USGS, no dropped readings |
| `ingest_noaa_weather_stations()` | Fetch temperature, wind, humidity from NWS grid points | NWS API | Interpolated weather to user coordinates | 60 min | Interpolation engine | ±2°F temp, ±5% humidity accuracy |
| `ingest_raws_fire_weather()` | Download RAWS station data (Keetch-Byram Drought Index, fuel moisture) | RAWS FTP/API | KBDI, dead fuel moisture, live fuel moisture | 60 min | Wildfire spread model | Match RAWS values within ±10% |
| `ingest_goes_viirs_hotspots()` | Query NOAA FIRMS API for active fire detections | NOAA FIRMS API | Hotspot lat/lon, radiative power, confidence | 3 hr / real-time mode | Fire detection CV | Geolocation accuracy ±375m |
| `ingest_seismic_network()` | Fetch earthquake magnitude, depth, location from USGS/IRIS | Seismic network APIs | EQ lat/lon, magnitude, depth, timestamp | 2-5 min | Earthquake model | Magnitude ±0.2 units, location ±5km |
| `ingest_dart_buoys()` | Poll tsunami warning buoys for sea level anomalies | NOAA DART API | Sea surface height, pressure, timestamp | 30 min | Tsunami model | ±2cm accuracy vs. buoy |
| `ingest_air_quality_monitors()` | Fetch PM2.5, ozone, CO from EPA/state monitors | EPA API | AQI, PM2.5 concentration, location | 60 min | Air quality module | ±10% vs. EPA values |
| `detect_sensor_outage()` | Compare current reading to historical pattern | Sensor timeseries | Outage flag, last good reading, estimated downtime | Real-time | Historical baselines | Flag outages >2x normal gap |
| `backfill_missing_periods()` | Fetch historical data for sensors that were offline | API historical endpoints | Complete timeseries with flagged gaps | On-demand | Data archive | Fill gaps within 24 hours of outage end |

### 3.2 Static Data Processing

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `process_flood_zones()` | Load FEMA flood zone designations (100-yr, 500-yr, floodway) | FEMA database | Flood zone polygon set with confidence | 1 hr | PostGIS database | 100% coverage of jurisdiction, no gaps |
| `process_usgs_nhd_hydrology()` | Ingest NHD Plus stream network, flow direction | USGS NHD API | Stream polyline set, flow direction | 1 hr | Hydrology model | Network connectivity validated |
| `process_census_demographics()` | Load census block population, building counts | Census FTP | Polygon set with population density | 1 hr | Database | Totals match official Census counts ±1% |
| `process_soil_properties()` | Ingest SSURGO/SoilGrids soil characteristics | USGS/Copernicus APIs | Soil polygon set (infiltration, porosity, slope stability) | 2 hr | Landslide/flood models | Properties match published maps |
| `process_volcano_risk_zones()` | Load Smithsonian volcano database, hazard zones | Smithsonian API | Volcano point set + lahar/ashfall zones | 2 hr | Volcano model | Coverage of all major volcanoes in region |
| `process_bridge_inventory()` | Ingest NBI bridge data (location, material, condition) | NBI dataset | Bridge point set with structural rating | 30 min | Infrastructure failure model | 100% coverage of inspected bridges |

### 3.3 Schema Validation & Quality Control

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `validate_geospatial_extent()` | Check that all readings fall within expected geographic bounds | Data layer | Extent validation report (pass/fail + count of outliers) | 5 min | Bbox registry | Flag readings >100km outside jurisdiction |
| `check_null_coverage()` | Identify geographic gaps where no data exists | Data layer | Null mask showing uncovered regions | 10 min | PostGIS | Document blind spots in alerts |
| `detect_schema_drift()` | Compare new reading schema to baseline schema | Current reading, baseline schema | Schema diff report + confidence impact | 2 min | Schema registry | Alert if new fields without documentation |
| `compare_against_baseline()` | Check for regressions vs. previous version | New data, historical baseline | Comparison report (mean, std dev, outlier count) | 15 min | Archive storage | Flag if >10% of values are outliers |
| `validate_timestamp_ordering()` | Ensure readings are in chronological order | Timeseries data | Pass/fail + count of out-of-order records | 2 min | Database | Reject data if timestamps non-monotonic |
| `cross_check_overlapping_sources()` | Compare readings from overlapping sensors | Multiple source data | Correlation analysis + divergence flagging | 20 min | Sensor registry | Alert if sources disagree >2 std devs |
| `quarantine_failed_data()` | Move failed data to isolated storage for investigation | Failed validation data | Quarantine entry (source, reason, timestamp) | 5 min | S3 quarantine bucket | Prevent downstream propagation of bad data |
| `promote_to_live()` | Release validated data to production systems | Staging data | Prod data (PostGIS + NATS broadcast) | 10 min | Staging environment | Version tracked, previous version archived |

### 3.4 Confidence Scoring & Merging

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `compute_confidence_score()` | Assign 0.0-1.0 confidence based on validation results | Validation report, source metadata | Score (float 0.0-1.0) | 2 min | Scoring rules engine | Scores reproduce test cases 100% |
| `apply_cross_source_pattern()` | Apply multi-source merging logic (agreement, recency, resolution) | Scoring rules, multiple sources | Applied confidence score | 5 min | Scoring rules | Agreement detection validates 100% |
| `merge_independent_estimates()` | Fuse multiple source readings into single best estimate | Score set, readings from 2+ sources | Merged value + merged confidence | 10 min | Weighting rules | Merged value within ±1 std dev of mean |
| `document_blind_spots()` | Record known data gaps and source limitations | All validations, source metadata | Gap document + recommendations | 30 min | Documentation system | 100% of known gaps documented |
| `tag_source_lineage()` | Attach metadata showing which sources contributed to merged result | Source IDs, confidence scores | Lineage metadata (JSON) | 2 min | Source registry | All inputs traced back to original source |

### 3.5 Outage Detection & Recovery

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `detect_feed_lateness()` | Alert if expected data arrives >threshold late | Sensor schedule, current time, last arrival | Lateness flag + expected vs. actual | 5 min | Scheduler | Detect 95% of real outages within 10 min |
| `estimate_outage_duration()` | Project how long sensor will be offline based on trend | Outage start time, recent recovery pattern | Duration estimate (minutes) | 5 min | Historical patterns | Estimates within ±50% of actual |
| `trigger_backfill()` | Request historical data retrieval for offline period | Outage duration, sensor ID | Backfill job submitted | 5 min | API availability | Backfill completes within 24 hours |
| `publish_outage_alert()` | Notify downstream systems that data is missing | Sensor ID, outage metadata | Alert message (JSON) | Real-time | NATS pub/sub | All hazard modules notified <5 min |

### 3.6 Polling & Update Management

| Function | Purpose | Input | Output | Latency SLA | Dependencies | Test Criteria |
|----------|---------|-------|--------|-------------|--------------|---------------|
| `schedule_polling_intervals()` | Determine optimal poll frequency per source | Source SLA, cost, hazard criticality | Poll schedule (cron expression) | On-deploy | Cost tracking | Respects API rate limits, balances freshness vs. cost |
| `execute_polling_cycle()` | Run all scheduled polls in priority order | Sensor registry, current time | Raw readings from all sources | Per-sensor SLA | Scheduler | All scheduled sensors polled within 10 min of schedule |
| `apply_polling_tier()` | Assign sensor to tier (global 15-min, national 60-min, local on-demand) | Source characteristics, hazard phase | Tier assignment | On-deploy | Tier registry | Critical fires polled >national tier frequency |
| `distribute_polling_load()` | Stagger requests across minute to avoid thundering herd | Poll list, time window | Staggered request schedule | 10 min before poll | Load balancing | Requests distributed evenly across minute |

**Key Algorithms:**

1. **Confidence Scoring Formula:**
   - Base: 0.5 (neutral prior)
   - +0.15 per corroborating source (up to +0.45)
   - +0.2 if data <24h old
   - +0.1 if resolution/accuracy matches expected
   - -0.2 per known source limitation
   - -0.1 per outlier detection flag
   - Clamp to [0.0, 1.0]

2. **Source Conflict Resolution:**
   - If 2+ sources available: Weight by confidence score, take weighted mean
   - If sources differ >2 std dev: Flag as anomaly, keep both in metadata
   - If <50% sources agree: Lower confidence to 0.3 (conservative)

3. **Outage Detection:**
   - If gap >2x median inter-arrival time: Declare outage
   - Estimate duration = current_time - last_good_reading
   - When new reading arrives: Calculate fill rate, merge backfilled data

---

## 4. Databases & Tables

**Systems Used:** PostgreSQL + PostGIS, TimescaleDB, Redis, NATS, S3

### PostgreSQL + PostGIS

```sql
-- Sensor registry: all source definitions and metadata
CREATE TABLE sensor_sources (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'real_time', 'static', 'polling'
  api_endpoint VARCHAR(512),
  format VARCHAR(50), -- 'JSON', 'CSV', 'XML', 'shapefile'
  update_frequency_minutes INT,
  coverage_bbox GEOMETRY(Polygon, 4326),
  confidence_base NUMERIC(3,2),
  is_critical BOOLEAN DEFAULT FALSE,
  documentation_url VARCHAR(512),
  contact_email VARCHAR(255),
  api_key_reference VARCHAR(255), -- Reference to vault, not actual key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sensor_sources_type ON sensor_sources(source_type);
CREATE INDEX idx_sensor_sources_coverage ON sensor_sources USING GIST(coverage_bbox);

-- Normalized sensor readings: all ingested values, deduplicated and timestamped
CREATE TABLE sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  reading_value NUMERIC,
  reading_unit VARCHAR(50),
  raw_value_source_format TEXT, -- Original before normalization
  confidence_score NUMERIC(3,2),
  is_validated BOOLEAN DEFAULT FALSE,
  is_quarantined BOOLEAN DEFAULT FALSE,
  data_quality_flags JSONB, -- {"has_outlier": true, "late_arrival": true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sensor_readings_source ON sensor_readings(sensor_source_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(reading_timestamp DESC);
CREATE INDEX idx_sensor_readings_location ON sensor_readings USING GIST(location);
CREATE INDEX idx_sensor_readings_validated ON sensor_readings(is_validated) WHERE NOT is_quarantined;
SELECT create_hypertable('sensor_readings', 'reading_timestamp', if_not_exists => TRUE);

-- Source version tracking: schema history and breaking changes
CREATE TABLE source_versions (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  version_number INT NOT NULL,
  released_at TIMESTAMP WITH TIME ZONE NOT NULL,
  schema_json JSONB NOT NULL, -- {field_name: {type, required, units, range}}
  breaking_changes JSONB, -- {removed_fields: [], renamed_fields: {}}
  documentation_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sensor_source_id, version_number)
);
CREATE INDEX idx_source_versions_source ON source_versions(sensor_source_id);

-- Data quality validation results: one record per batch processed
CREATE TABLE validation_results (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  batch_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  record_count INT,
  passed_count INT,
  failed_count INT,
  null_coverage_percent NUMERIC(5,2),
  outlier_count INT,
  schema_violations INT,
  validation_details JSONB, -- {extent_check: "pass", null_check: "fail"}
  status VARCHAR(20) NOT NULL, -- 'pass', 'fail', 'warning'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_validation_results_source ON validation_results(sensor_source_id);
CREATE INDEX idx_validation_results_timestamp ON validation_results(batch_timestamp DESC);

-- Sensor outage log: tracks when feeds go offline
CREATE TABLE sensor_outages (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  outage_start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  outage_end_timestamp TIMESTAMP WITH TIME ZONE,
  expected_duration_minutes INT,
  is_ongoing BOOLEAN DEFAULT TRUE,
  estimated_missed_readings INT,
  recovery_status VARCHAR(50), -- 'pending', 'backfilling', 'complete'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sensor_outages_ongoing ON sensor_outages(is_ongoing) WHERE is_ongoing;
CREATE INDEX idx_sensor_outages_source ON sensor_outages(sensor_source_id);

-- Quarantine log: records failed data for investigation
CREATE TABLE quarantine_log (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  quarantine_reason VARCHAR(255) NOT NULL,
  record_count INT,
  details JSONB,
  s3_quarantine_path VARCHAR(512),
  investigator_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_quarantine_log_source ON quarantine_log(sensor_source_id);

-- Source coverage map: what geographic areas have data from each source
CREATE TABLE coverage_maps (
  id BIGSERIAL PRIMARY KEY,
  sensor_source_id BIGINT NOT NULL REFERENCES sensor_sources(id),
  version_number INT NOT NULL,
  coverage_percent NUMERIC(5,2),
  covered_bbox GEOMETRY(Polygon, 4326),
  null_regions GEOMETRY(MultiPolygon, 4326),
  last_update TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_coverage_maps_source ON coverage_maps(sensor_source_id);

-- Merged/normalized layers with confidence: output of cross-source merging
CREATE TABLE merged_data_layers (
  id BIGSERIAL PRIMARY KEY,
  layer_name VARCHAR(255) NOT NULL, -- 'flood_extent', 'fire_hotspots', 'seismic_risk'
  data_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  feature_geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
  feature_properties JSONB, -- {value: 42, units: "cfs", ...}
  confidence_score NUMERIC(3,2),
  source_lineage JSONB, -- {sources: ["USGS", "NOAA"], contribution: [0.6, 0.4]}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_merged_layers_name ON merged_data_layers(layer_name);
CREATE INDEX idx_merged_layers_timestamp ON merged_data_layers(data_timestamp DESC);
CREATE INDEX idx_merged_layers_geometry ON merged_data_layers USING GIST(feature_geometry);
```

### TimescaleDB (Time-Series Data)

```sql
-- High-frequency sensor readings: ingest rate 1000s/sec during events
CREATE TABLE IF NOT EXISTS timeseries_readings (
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  sensor_id BIGINT NOT NULL,
  location GEOMETRY(Point, 4326),
  value NUMERIC,
  unit VARCHAR(50),
  confidence NUMERIC(3,2),
  metadata JSONB
);
SELECT create_hypertable('timeseries_readings', 'time', if_not_exists => TRUE);
CREATE INDEX idx_ts_readings_sensor_time ON timeseries_readings (sensor_id, time DESC);
CREATE INDEX idx_ts_readings_location ON timeseries_readings USING GIST(location);

-- Continuous aggregate: 1-minute rolling averages
CREATE MATERIALIZED VIEW readings_1min_agg WITH (timescaledb.continuous) AS
  SELECT
    time_bucket('1 minute', time) AS bucket,
    sensor_id,
    AVG(value) AS avg_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value,
    COUNT(*) AS reading_count
  FROM timeseries_readings
  GROUP BY bucket, sensor_id;

-- Continuous aggregate: hourly summaries (compressed storage)
CREATE MATERIALIZED VIEW readings_1hr_agg WITH (timescaledb.continuous) AS
  SELECT
    time_bucket('1 hour', time) AS bucket,
    sensor_id,
    AVG(value) AS avg_value,
    STDDEV(value) AS stddev_value,
    COUNT(*) AS reading_count
  FROM timeseries_readings
  GROUP BY bucket, sensor_id;
```

### Redis

```
Key patterns:
- sensor:{source_id}:last_reading -> JSON of most recent reading
- sensor:{source_id}:health_check -> {last_update, status, outage_flag}
- poll_schedule:{minute}:{second} -> [list of sensor_ids to poll at this time]
- outage_alert:{sensor_id} -> {outage_start, duration, backfill_status}
- validation_queue:{source_id} -> {record_count, processing_status}

TTL:
- last_reading: 2 hours (auto-purge, recompute from PostGIS if needed)
- health_check: 30 minutes
- poll_schedule: Permanent (updated on deploy)
- outage_alert: Persist until resolved + 24h grace
- validation_queue: 24 hours

Use cases:
- Caching most recent readings for fast API response
- Tracking sensor health for outage detection
- Scheduling distributed polling across workers
- Broadcasting outage alerts in real-time
```

### NATS Streams

```
Subjects:
- sensor.reading.{source_id} -> Raw readings from ingestion worker
- sensor.validated.{source_id} -> Validated + confidence-scored readings
- sensor.outage -> Outage alerts for all modules
- sensor.schema_change -> Schema version updates
- qc.validation_result -> Validation pass/fail summaries
- data.confidence_updated -> Confidence score recalculations

Retention:
- Raw readings: 24 hours (detailed audit trail)
- Validated readings: 7 days (for replay during outages)
- Outage alerts: 30 days (incident investigation)
- Schema changes: Permanent (immutable audit)

Consumers:
- Hazard models (wildfire, flood, etc.) subscribe to sensor.validated.*
- Admin dashboards subscribe to sensor.outage
- Data quality monitoring subscribes to qc.validation_result
- Schema registry subscribers: sensor.schema_change
```

### S3 Storage Layout

```
Bucket: beacon-{environment}
Prefix structure:

s3://beacon-prod/
├── sensor-data/
│   ├── raw/{source_id}/v{NNN}/{YYYY-MM-DD}/{HH-MM-SS}.json
│   ├── staging/{source_id}/{batch_id}/
│   └── validated/{source_id}/v{NNN}/{YYYY-MM-DD}/
├── quarantine/
│   ├── failed-validation/{source_id}/{timestamp}/
│   └── investigation-notes/{quarantine_id}/
├── coverage-maps/
│   ├── {source_id}/v{NNN}/coverage.geojson
│   └── blind-spots/regional/{YYYY-MM-DD}.geojson
├── archive/
│   ├── {source_id}/versions/
│   └── validation-reports/{YYYY}/{MM-DD}.json
└── merged-layers/
    ├── flood-extent/latest.pmtiles
    ├── fire-hotspots/hourly/{YYYY-MM-DD}/{HH}.geojson
    └── seismic-risk/current.geojson

Retention:
- Raw/staging: 30 days (debug, replay)
- Validated: 1 year (analysis, model training)
- Quarantine: 2 years (incident investigation)
- Archive: 7+ years (compliance, historical analysis)
- Merged layers: 30 days rolling + "latest" snapshot

Access:
- Raw/staging/validated: Private (internal systems only)
- Coverage maps: Signed URLs (internal dashboards)
- Merged layers (live): Public CloudFront + CDN caching
- Archive: Private (audit access only)
```

**Data Size Estimate:**

- Per day ingestion: ~50GB (50+ sensors × 100K readings/sensor/day)
- PostgreSQL tables: ~500GB/year (readings, validation results, outage log)
- TimescaleDB hot storage: ~50GB (7 days of high-frequency sensors, compressed)
- S3 raw/validated: ~500GB/year (archival, compression 3:1)
- S3 merged layers: ~50GB active (hourly snapshots, 30-day rolling)

**Archival Strategy:**

1. Real-time (0-7 days): Hot storage in PostgreSQL + TimescaleDB + Redis cache
2. Warm (7-90 days): Compressed TimescaleDB (10x compression via chunks)
3. Cold (90+ days): Archived to S3 Glacier as Parquet files
4. Compliance hold (7 years): Immutable S3 Object Lock for incident investigation
5. Post-retention purge: Automated deletion after retention window

---

## 5. UI Components

**Screens:**
- Sensor Health Dashboard (admin only)
- Data Quality Report (EMS/analysts)
- Outage Alert View (notifications)
- Confidence Score Transparency (public via API)
- Source Registry Admin Panel (data engineers)
- Coverage Map Viewer (operational planning)

**Buttons/Controls:**
- "Acknowledge Outage": Mark outage as seen, start backfill
- "Quarantine Review": Investigate failed data batch
- "Force Resync": Manually trigger poll of specific sensor
- "Promote to Live": Release staging data to production
- "View Source Lineage": Show which sources contributed to merged data

**Map Layers:**
- Sensor coverage heatmap: Polygon coverage, color opacity by confidence (0.0-1.0), z-order 5, update every 60 min
- Active sensor locations: Point markers, green=healthy, yellow=stale (>2h), red=offline, z-order 6, real-time
- Outage zones: Polygon overlay for regions with >30% sensor offline, z-order 7, real-time
- Merged data confidence: Heatmap 0.0-1.0 (red=low, green=high), z-order 8, 15-min refresh

**Notifications/Alerts:**
- "Sensor {name} offline": Trigger after 2x normal gap, CRITICAL level (red), SMS + app push
- "Data quality degraded": Trigger if validation pass rate <90%, WARNING level (orange), app push only
- "Schema change detected": Trigger on new source version with breaking changes, ADVISORY level (yellow), email to data team
- "Backfill complete": Trigger when outage recovery finishes, INFO level (blue), app notification

**Brand Compliance:** WCAG 2.2 AA, Inter font, navy #0B0F2A / teal #0097B2, status colors (red #DC2626, yellow #EAB308, green #16A34A)

---

## 6. Codebases

| Repo | Stack | Build | Responsible |
|------|-------|-------|-------------|
| beacon-data-ingestion | Python 3.11 + FastAPI, APScheduler | `make build-ingestion` | Data Ingestion Team |
| beacon-validation-qc | Python 3.11 + Pydantic, Great Expectations | `make build-validation` | Data QC Team |
| beacon-confidence-scoring | Python 3.11 + NumPy/Pandas | `make build-scoring` | Data Science |
| beacon-admin-dashboard | React/TypeScript + Next.js | `npm run build` | Frontend Team |
| beacon-db-migrations | SQL + Terraform | `terraform apply` | DevOps |

**Deployment:** Docker containers on Kubernetes (EKS), scheduled jobs via CronJobs, real-time workers via Deployments

**CI/CD:** GitHub Actions
- On PR: lint, unit tests (>80% coverage), security scan
- On merge: integration tests, E2E validation (test data pipeline)
- On tag: build Docker images, push to ECR, deploy to staging
- Manual approval: Deploy to production

---

## 7. Lifecycle

**Milestones:**
1. Months 1-2: Requirements review, source selection, schema design
2. Months 2-4: Polling/ingestion framework, 5 critical sensors (USGS water, NOAA weather, RAWS, GOES, seismic)
3. Months 4-5: Validation + QC pipeline, confidence scoring logic
4. Months 5-6: Cross-source merging, outage detection, backfill
5. Months 6-7: Dashboard + monitoring, integration with hazard models
6. Month 7+: Expand to full 50+ source catalog, tuning, production rollout

**Build Phases:**
- Phase 1 (MVP): 5 critical sensors, basic validation, manual confidence scoring
- Phase 2 (Beta): 20 sensors, automated QC, confidence algorithm, outage alerts
- Phase 3 (Production): 50+ sensors, cross-source merging, public API, dashboard

**Test Coverage Targets:**
- Unit tests: 85% coverage (all functions tested independently)
- Integration tests: 70% coverage (data pipeline end-to-end)
- E2E tests: 50% coverage (critical paths: ingest → validate → merge → consume)

**Deployment Strategy:** Canary (5% → 25% → 100% of sensors), with automatic rollback if validation pass rate drops >5%

**Monitoring Metrics:**
- Ingestion: Throughput (readings/sec), latency (p95), API success rate (>99.5%)
- Validation: Pass rate (target >95%), false positive rate (<2%), processing latency (p95 <30s)
- Confidence: Score distribution (should be ~normal, μ=0.75), outlier frequency (<5%)
- Outages: Detection latency (<10 min), false alarm rate (<5%), backfill completeness (>98%)
- Freshness: Median lag vs. source (should be <update_frequency)

**Improvement Research:**
- A/B test confidence scoring weights against real event ground truth
- Analyze false positive patterns → adjust thresholds quarterly
- Benchmark against USGS/NOAA internal validation
- Gather user feedback on "data quality" alerts → simplify messaging

---

## 8. Legal/Privacy/Security

**Applicable Regulations:**
- CCPA (California location data retention limits)
- HIPAA (if health-related data from sensors)
- FedRAMP (federal data handling)
- Good Samaritan (protection from liability if data used in emergency decisions)
- NEPA (environmental data disclosure requirements)

**PII Handled:**
- Location data (sensor coordinates, but aggregated/anonymized per CCPA)
- Timestamps (for temporal analysis, not personal)
- No personal health records, financial data, or identity information

**Encryption:**
- In-transit: TLS 1.3 (API calls to source endpoints, NATS pub/sub)
- At-rest: AES-256-GCM (PostgreSQL, S3, TimescaleDB backups)
- Keys: AWS KMS (rotated annually), accessed via IAM roles (no hardcoded secrets)

**Audit Trail:**
- All ingestion logged: Timestamp, source_id, action, row_count, success/failure
- All QC decisions logged: Which data quarantined, why, by whom
- All merging decisions logged: Which sources weighted how, result confidence
- Access logs: Who viewed sensitive data (outage details, source credentials)
- Retention: 7 years (compliance requirement)

**Data Retention:**
- Raw readings: 30 days (diagnostic replay)
- Validated readings: 1 year (model training, accuracy analysis)
- Quarantine records: 2 years (incident investigation)
- Aggregated statistics: 7+ years (historical analysis, regulatory audit)
- User location data: 90 days post-event (post-event analysis), then anonymized

**Third-Party Integrations:**
- USGS: No DPA (public data), but respect rate limits, attribute data
- NOAA: No DPA (public data), acknowledge in UI
- Commercial sources: DPA required, data use restricted to Beacon product
- API keys: Stored in AWS Secrets Manager, rotated quarterly

---

## 9. Mesh/Offline

**Offline-First Features:**
- Last-known readings cached on-device (24h worth, ~10MB)
- Coverage maps downloaded periodically, enable offline queries ("Is this area covered?")
- Confidence scores included in cache (so users see uncertainty even offline)

**Sync Strategy:**
- On reconnect: Upload any local sensor reports user made (e.g., "I saw flames here")
- Download latest readings from last 24 hours
- If conflict (user said readings were X, server says Y): Keep both versions, let merge algorithm resolve
- Retry failed uploads with exponential backoff (1s → 5s → 30s)

**Cache Size:**
- Readings (24h): ~10MB per region (100K readings × 100 bytes)
- Coverage maps: ~5MB per region (tiled polygon set)
- Confidence scores: ~1MB per region (lookup table)
- Total: ~20MB per region (user can cache 3-5 regions = 60-100MB)

**Priority Queue:** On reconnect, sync in order: (1) user incident reports, (2) critical sensors (wildfire, flood), (3) static layers, (4) optional nice-to-have

**Compression:** Protocol Buffers for readings (binary, ~40% smaller than JSON), gzip for coverage maps

---

## 10. Update Protocols

**Update Frequency:**
- Real-time feeds: 5 min - 30 min polling (source-dependent)
- Static data: Weekly - annual refresh (LANDFIRE biennial, Census decennial)
- Schema updates: On-demand (API breaking changes trigger backcompat layer)
- Confidence scoring rules: Quarterly review + retraining on new events

**Rollout Strategy:**
- Staged: Test region first (e.g., single county), then expand to state, then national
- Canary: Update 5% of sensors/sources at a time, validate for 24h before expanding
- Feature flags: New QC rules behind flags, enable gradual rollout

**Rollback Plan:**
- Automatic: If validation pass rate drops >5%, revert to previous version
- Manual: Data team can manually rollback within 24h of deployment
- Archive: All versions kept in S3, can restore any previous version
- Communication: Alert module lead + on-call engineer within 5 minutes of rollback

**User Notification:**
- Public data updates: Added to "Data Sources" section in app settings
- Breaking changes: Notify downstream modules (hazard models) with migration guide
- Schema changes: Email to data engineers, Slack alert to on-call

**Testing Before Release:**
- Staging env: Run 7-day parallel ingestion (stage vs. prod), compare outputs
- Validation gating: New data must achieve >95% pass rate before promotion
- Manual review: Data lead reviews spot-checks of 100 records before release
- Monitor metrics: Have dashboards showing ingestion lag, validation pass rate during rollout

---

## 11. Cross-Module Dependencies

**Consumes:**
- Base Map: Geographic boundaries, census blocks, infrastructure locations (for sensor location context)
- Mesh Networking: Last-known-good location of users (for proximity-based sensor recommendations)
- Notifications: Alert delivery infrastructure for outage notifications

**Provides:**
- Hazard Models (Wildfire, Flood, Earthquake, etc.): Normalized sensor readings + confidence scores
- Event Manager: Real-time feed data to trigger automatic event declarations
- Admin Dashboard: Data quality reports, sensor health, outage history
- Public Mobile App: Last-known readings, coverage map, confidence transparency
- Search & Rescue: Real-time sensor data (e.g., current river flow) for tactical decisions
- Weather Simulator: Historical sensor readings for scenario modeling

**Critical Path:** Must ship before:
- Any hazard model can go to production (all models require normalized inputs)
- Event manager can declare events automatically (needs real-time feed validation)
- Admin dashboard can show situation picture (needs data quality reporting)

**Teams to Consult:**
- Hazard modeling leads: Which sensors does your model need? What confidence is "good enough"?
- DevOps: How to scale polling to 50+ sources? Network/cost limits?
- Legal: CCPA compliance for location data retention
- Data partnerships: Negotiate API access, rate limits, licensing for commercial data sources

**Potential Conflicts:**
- Sensor location privacy vs. transparency: Can we show "sensor coverage" maps without revealing exact sensor coordinates? (Answer: Show coverage polygons, not points)
- Confidence vs. simplicity: Users may find 0.0-1.0 confidence scale confusing. Consider 3-tier system? (Answer: Show both numeric + icon (red/yellow/green))
- Real-time cost vs. completeness: Some sensors expensive to poll hourly. Skip during non-critical periods? (Answer: Use polling tiers, reduce frequency during low-hazard season)

---

## 12. Cost Tracking

**Infrastructure (Monthly):**
- Compute (polling workers): ~$500 (2 CPU, 4GB RAM, multi-zone)
- Database (PostgreSQL + TimescaleDB): ~$1500 (15TB, Multi-AZ, automated backups)
- Redis (caching): ~$100 (6-node cluster, 16GB total)
- NATS streaming: ~$200 (included in EKS, just monitoring/alerting)
- S3 storage (raw + validated + archive): ~$800 (with Glacier archival)
- Data transfer (inter-region + CDN): ~$200
- **Subtotal: ~$3300/month**

**API Costs (Third-Party Data Sources):**
- USGS 3DEP LiDAR downloads: ~$100/month (volume discount)
- NOAA/NWS API (free tier)
- Copernicus Sentinel-2: ~$50/month (cloud credits)
- Mapillary API: ~$50/month
- LANDFIRE data: Free (USGS)
- Commercial data (if needed): ~$500/month
- **Subtotal: ~$700/month**

**Personnel (Monthly, FTE @ $150K/year = $12.5K/month):**
- Data Ingestion Engineer: 0.5 FTE = $6.25K
- Data QC/Validation Lead: 0.5 FTE = $6.25K
- Data Scientist (confidence scoring): 0.25 FTE = $3.1K
- **Subtotal: ~$15.6K/month**

**Total Monthly: ~$19.6K**
**Total Annual: ~$235K**

**Optimization Ideas:**
- Implement intelligent polling: Reduce frequency during calm periods (95% cost savings on non-critical sensors)
- Use spot instances for batch processing (40% savings)
- Negotiate annual contracts with data providers (10-20% discount)
- Cache more aggressively in Redis (reduce DB queries by 30%)

---

## 13. Agent Monitor Team

See `02_agent_monitor_template.md` for detailed agent structure.

**5 Agents:**

1. **Quality Agent (Data QC)**
   - Monitors: Validation pass rate, null coverage, outlier frequency, schema violations
   - Alert thresholds: Pass rate <90%, null coverage >5%, >3% outliers
   - Action: Quarantine data, page on-call engineer, start investigation
   - Reports to: Data QC Lead

2. **Research Agent (Data Science)**
   - Monitors: Confidence score distribution, source agreement rates, model accuracy vs. real events
   - Alert thresholds: Confidence <0.65 avg (too conservative), <0.45 avg (miscalibrated)
   - Action: Recommend confidence retraining, flag problematic sources
   - Reports to: Data Science Lead

3. **Business Agent (Operations)**
   - Monitors: API uptime (target 99.5%), freshness lag (vs. source SLA), cost trends
   - Alert thresholds: Uptime <99%, lag >1.5x SLA, cost increase >15% month-over-month
   - Action: Investigate API failures, negotiate SLA with vendors, optimize polling
   - Reports to: VP Data Science

4. **Compliance Agent (Legal/Security)**
   - Monitors: Data retention compliance (7-year hold), PII anonymization post-90d, access audit logs
   - Alert thresholds: Found unanonymized data >90d old, unauthorized access detected
   - Action: Trigger data deletion workflows, security incident response
   - Reports to: Chief Legal Officer

5. **Lead Agent (Orchestrator)**
   - Aggregates alerts from 4 agents
   - Makes decisions: Is this a critical incident? Page module lead? Escalate to CTO?
   - Maintains on-call schedule, incident log
   - Reports to: Module Lead + VP Data Science

**Reporting:** Each agent reports (1) to module owner + (2) to area head (e.g., Quality Agent → Data QC Lead + Chief Data Officer)

---

## 14. Validation Practices

**Accuracy Targets:**
- USGS water readings: ±5% vs. official USGS values
- NOAA weather: ±2°F temperature, ±5% humidity, ±10% wind speed
- Hotspot geolocation: ±375m (VIIRS native accuracy)
- Seismic data: Magnitude ±0.2 units, location ±5km
- Confidence scores: Correlation with post-event ground truth ≥0.85

**Loss Weighting (asymmetric cost):**
- False negative (missed sensor): Cost = 1000x (dangerous to miss wildfire data)
- False positive (spurious sensor): Cost = 1x (annoying alert, but safe)
- This drives QC logic: Validate extensively before quarantine, very permissive ingestion

**A/B Testing:**
- Test 1: Confidence scoring v1 (Bayesian) vs. v2 (empirical weights) on same data, compare post-event accuracy
- Test 2: Polling tier cutoff (national threshold for reducing frequency) at 30-min vs. 60-min, measure cost vs. freshness tradeoff
- Test 3: Outage detection threshold at 1.5x vs. 2x normal gap, measure latency vs. false alarms

**Drift Detection:**
- Metric 1: Validation pass rate trending downward → something changed in source or schema
- Metric 2: Confidence score distribution shifting (e.g., mean dropping from 0.75 to 0.65) → source quality degrading
- Alert threshold: >5% change from 7-day baseline triggers investigation

**Validation Data:**
- Source: Historical readings from all 50+ sensors spanning 2+ years
- Size: ~500M records (~50GB compressed)
- Refresh: Weekly, append new data as it arrives
- Use: Baseline comparisons, drift detection, confidence calibration

---

## 15. Data Science Considerations

**Model Selection:**
- Confidence scoring: Bayesian network (expert-elicited priors) + empirical weights (learned from validation outcomes)
- Outage detection: Simple statistical threshold (gap >2x median) rather than ML (low signal-to-noise ratio, simple rule sufficient)
- Source conflict resolution: Weighted averaging by confidence score (no complex ML needed)

**Training Data:**
- Source: All historical readings (2+ years) + expert annotations on ground truth
- Size: ~500M readings, ~50K annotated "ground truth" labels (from post-event analysis)
- Features: For each reading: {source_id, recency, agreement_with_neighbors, past_reliability}
- Retraining: Quarterly after each major event (capture improved understanding)

**Retraining Schedule:**
- Quarterly: After significant events (wildfire, flood), retrain confidence weights
- Monthly: Drift detection on hold-out validation set
- On-demand: If major source undergoes API change or quality degradation

**Benchmarks:**
- Baseline: Default confidence all 0.7 (no differentiation)
- Current: V2 algorithm, weighted confidence = 0.75 avg
- Target: Improve to 0.8 avg, <5% false positive outlier rate

**Failure Cases:**
- Sources disagree >2 std dev: Can indicate data corruption or actual anomaly. Keep both in metadata, flag for human review
- All sources offline: Degrade gracefully to last-known-good readings, clearly mark as stale
- Sensor drifts (value slowly shifts): Detect via trend analysis, flag as "low confidence until re-calibration"

**Explainability:**
- For each merged reading: Show which sources contributed, weights, and why
- Example: "Flow rate 250 cfs (confidence 0.82) from 3 sources: USGS (0.90), NOAA (0.75), local station (0.80). Weighted average."
- For outage alerts: Show gap size, expected arrival time, estimated recovery time

---

## 16. Software Engineering Considerations

**Technology Stack:**
- Ingestion: Python 3.11 + FastAPI (async HTTP), APScheduler (polling)
- Validation: Python 3.11 + Pydantic (schema), Great Expectations (QA framework)
- Scoring: Python 3.11 + NumPy/Pandas (numeric computation)
- Storage: PostgreSQL 15 + PostGIS, TimescaleDB, Redis 7, NATS 2.10
- Deployment: Docker, Kubernetes (EKS)

**External Dependencies:**
- Version pinning: All Python packages pinned to minor version (e.g., requests==2.31.0)
- Security scanning: Trivy scans Docker images, Dependabot alerts for outdated packages
- License scanning: FOSSA checks all dependencies for GPL/AGPL licenses

**CI/CD Pipeline:**
1. Lint/format checks: `black`, `isort`, `flake8` (fail if violations)
2. Unit tests: pytest with >85% coverage (fail if coverage drops)
3. Integration tests: Spin up test databases, run full pipeline end-to-end
4. Security scanning: Trivy (container), Bandit (code), Dependabot (dependencies)
5. Performance benchmarks: Measure ingestion throughput, latency — fail if >10% regression
6. Deployment automation: Push to ECR, deploy to staging, approval for prod

**Technical Debt:**
- Confidence scoring algorithm: Currently Bayesian + empirical. Refactor to ML model (3mo effort)
- Database indexes: Some query patterns slow, need index optimization (2w effort)
- Error handling: Inconsistent error messages across modules, standardize (1mo effort)

**SLA & Runbooks:**
- Availability target: 99.5% uptime (4.4 hours downtime/month)
- Latency target: p95 <30s per ingestion cycle (all sensors polled within 30s)
- Error rate target: <0.1% (1 in 1000 readings corrupted)
- Oncall runbook: https://wiki.beacon.internal/runbooks/data-ingestion

**Scalability:**
- Current: 50 sensors, 100K readings/day, scales to 1M readings/day
- Bottleneck 1: Database ingestion (need connection pooling increase)
- Bottleneck 2: Validation (can parallelize across 8 workers)
- Mitigation: Kubernetes HPA scales workers 1-10 based on queue depth

---

## Development Blocks (Independent, Parallelizable)

### Block 1: Polling Infrastructure (Weeks 1-3)
**Deliverable:** Ingest 5 critical sensors (USGS water, NOAA weather, RAWS, GOES/VIIRS, seismic)

**Functions:** `schedule_polling_intervals()`, `execute_polling_cycle()`, `detect_feed_lateness()`, ingest functions for each sensor

**Dependencies:** AWS credentials, source API documentation, database schema

**Validation:** All 5 sensors polling within SLA, no dropped readings

---

### Block 2: Schema Validation & QC (Weeks 2-4, parallel to Block 1)
**Deliverable:** QC pipeline filters bad data, validates schema, quarantines failures

**Functions:** `validate_geospatial_extent()`, `check_null_coverage()`, `detect_schema_drift()`, `compare_against_baseline()`, `quarantine_failed_data()`

**Dependencies:** Base sensor data from Block 1, database schema, validation rule definitions

**Validation:** >95% pass rate on historical test data, <2% false positives

---

### Block 3: Confidence Scoring (Weeks 4-6)
**Deliverable:** Assign 0.0-1.0 confidence scores to all readings based on validation outcomes

**Functions:** `compute_confidence_score()`, `apply_cross_source_pattern()`, `merge_independent_estimates()`, `tag_source_lineage()`

**Dependencies:** Validated data from Block 2, scoring rules specification

**Validation:** Calibrated scores (0.8 confidence ≈ 80% accuracy), <5% miscalibrated sources

---

### Block 4: Outage Detection & Backfill (Weeks 5-7)
**Deliverable:** Detect sensor outages, alert, and recover missing data

**Functions:** `detect_feed_lateness()`, `estimate_outage_duration()`, `trigger_backfill()`, `publish_outage_alert()`

**Dependencies:** Polling infrastructure (Block 1), validation (Block 2), alert system

**Validation:** Detect 95% of real outages within 10 minutes, <5% false alarms, backfill success >98%

---

### Block 5: Cross-Source Merging (Weeks 6-8)
**Deliverable:** Merge overlapping sensor data into single best estimate with lineage tracking

**Functions:** `merge_independent_estimates()`, `document_blind_spots()`, `tag_source_lineage()`, output merged layers

**Dependencies:** Confidence scores (Block 3), source registry, merge rules

**Validation:** Merged values within ±1 std dev of constituent readings, 100% lineage traceability

---

### Block 6: Dashboard & Monitoring (Weeks 7-9)
**Deliverable:** Admin UI shows sensor health, data quality, outages, coverage

**Functions:** Admin dashboard screens, monitoring queries, alert triggering

**Dependencies:** All ingestion blocks (1-5), Redis caching, NATS pub/sub

**Validation:** Dashboard loads <1s, real-time updates <5s, all metrics accurate

---

### Block 7: Integration with Hazard Models (Weeks 8-10)
**Deliverable:** Hazard modules consume normalized sensor data via NATS + API

**Functions:** NATS subject definitions, API endpoints, consumer applications

**Dependencies:** All prior blocks, hazard model interfaces

**Validation:** Wildfire model receives sensor data, flood model receives stream data, etc.

---

### Block 8: Source Expansion (Weeks 10+)
**Deliverable:** Add remaining 45+ sensors beyond critical 5

**Functions:** Ingest functions for each source, schema definitions, test data

**Dependencies:** All prior blocks, per-source documentation

**Validation:** Each source passes validation, confidence scores calibrated

---

## Final Operational Checklist

- [ ] All 50+ sensor sources registered in `sensor_sources` table with metadata
- [ ] Polling intervals configured per source (real-time tier, national tier, or static)
- [ ] QC validation rules defined and tested against historical data
- [ ] Confidence scoring weights calibrated on post-event ground truth
- [ ] Outage detection thresholds tuned (avoid false alarms)
- [ ] NATS subjects and consumers configured for hazard models
- [ ] Admin dashboard deployed with real-time metrics
- [ ] On-call runbooks documented (outage response, data quality issues)
- [ ] Legal review completed (CCPA, data retention, third-party licenses)
- [ ] Cost tracking verified (infrastructure + API + personnel)
- [ ] Agent monitor team trained and on standby
- [ ] Rollback plan tested (can restore previous version in <15 min)
- [ ] Capacity plan finalized (can scale to 1M readings/day)

---

**Last Updated:** 2026-03-25
**Module Lead:** [Data Ingestion Lead]
**Status:** Design phase, ready for development block 1 kickoff
