# Base Map Module

## 1. Overview
Maintains accurate, current base map of Earth's surface features for all hazard models and user-facing map display.

## 2. Ownership
- Director: Base Map Management
- Leads: Atlas Pipeline, Data Ingestion, Update Protocols, Geospatial (x2), Tile System, Real-Time Feed, Static Data, Post-Event Update, Source Refresh

## 3. Parent Module
None (foundation). Consumed by all map-rendering modules.

## 4. Submodules
- Atlas Pipeline
- Data Ingestion
- Update Protocols
- Tile System

## 5. Goals
1. Maintain Earth surface accuracy across all hazard models
2. Deliver <100ms tile response time
3. Support real-time updates within 6 hours
4. Enable offline access (5GB delta tile cache)

## 6. Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| ingest_source | Import raw geospatial data | File path | Staged data | 2h | Storage |
| georeference_layer | Align to coordinate system | Raw data | Georeferenced data | 1h | proj4 |
| resample_to_grid | Convert to standard grid | Raster data | Grid-aligned raster | 30m | Grid config |
| fuse_multi_source | Merge conflicting sources | Multiple layers | Fused layer | 4h | Conflict resolver |
| validate_tile_quality | Check integrity and completeness | Tile data | QA report | 5m | Quality rules |
| score_tile_quality | Assign confidence score | QA report | Score (0-100) | 2m | Scoring model |
| generate_pmtiles | Create cloud-optimized tiles | Raster data | PMTiles file | 15m | PMTiles lib |
| publish_to_cdn | Push to CloudFront | PMTiles file | CDN URL | 5m | AWS SDK |
| compute_delta_tiles | Calculate tile diffs | Old tiles, New tiles | Delta set | 10m | Tile hasher |
| precache_user_area | Stage tiles for region | User bbox | Cached tiles | 20m | Cache layer |
| poll_realtime_feed | Check live data source | Feed endpoint | New data | 5m | Feed config |
| poll_static_source | Check versioned data | Source URL | New version | 30m | HTTP client |
| detect_schema_change | Identify field/type changes | Old schema, New schema | Change report | 2m | Schema validator |
| monitor_feed_health | Track feed reliability | Feed metrics | Health status | 1m | Metrics store |
| calculate_freshness_score | Measure data age | Timestamp | Freshness (0-1) | 1m | Time config |
| resolve_source_conflict | Handle contradictory data | Conflicting sources | Resolved data | 30m | Priority rules |
| apply_priority_rules | Rank data sources | Multiple sources | Ranked sources | 5m | Priority config |
| track_release_calendar | Monitor data releases | Release schedule | Calendar view | 10m | External APIs |
| detect_new_release | Identify available updates | Release calendar | New release flag | 5m | Calendar monitor |
| validate_new_schema | Test new data structure | New data sample | Validation result | 15m | Schema rules |
| stage_test_deployment | Deploy to test env | Validated data | Test tiles | 20m | Test infra |
| promote_to_production | Release to live | Test tiles | Prod tiles | 10m | Prod infra |
| trigger_post_event_resurvey | Request updated imagery | Event location | Survey order | 30m | Vendor API |
| request_satellite_tasking | Order specific satellite pass | Bbox, Date | Task order | 1h | Vendor API |
| flag_affected_tiles | Mark changed areas | Change geometry | Tile ID list | 5m | Tile index |
| generate_diff_report | Document changes | Old state, New state | Diff report | 10m | Change detector |
| build_tile_index | Create lookup structure | All tiles | Index | 5m | B-tree lib |
| compute_tile_hash | Generate content hash | Tile data | Hash | 1s | Crypto lib |
| compress_tile_zstd | Compress for CDN | Tile data | Compressed tile | 5s | Zstd lib |
| deliver_tile_range_request | Serve tile to client | HTTP range request | Tile bytes | 50ms | CDN cache |
| cache_tile_cloudfront | Stage in edge cache | Tile ID | Cached | 10m | CloudFront API |
| invalidate_stale_tiles | Remove expired tiles | Tile ID list | Invalidation done | 2h | Cache manager |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| base_map_tiles | Tile cache | tile_id, tile_hash, version | 1 year |
| data_sources | Source registry | source_id, name, endpoint, format | Indefinite |
| source_versions | Version tracking | source_id, version, released_at | 2 years |
| tile_quality_scores | QA metrics | tile_id, score, timestamp | 6 months |
| feed_health_log | Health history | feed_id, status, timestamp | 90 days |
| conflict_resolutions | Resolution audit | conflict_id, resolution, rule_used | 1 year |
| post_event_surveys | Survey records | event_id, bbox, survey_date, imagery_url | 3 years |

## 8. Message Bus (NATS)
- `tile.updated`: Tile changed
- `source.new_version`: Data source updated
- `feed.health.alert`: Feed status change

## 9. Cache (Redis)
- `tile:{tile_id}`: Tile metadata
- `feed:health:{feed_id}`: Feed status
- `quality:score:{tile_id}`: Quality score

## 10. External Integrations
- AWS S3: Tile storage
- CloudFront: CDN
- Copernicus/USGS: Data sources
- Satellite vendors: Tasking APIs

## 11. API Contracts
Consumed by: All map rendering modules, hazard models
Provides: getTile(z, x, y), getSourceStatus(), getQualityMetrics()

## 12. UI Components
None (server-side only)

## 13. Offline & Mesh
- Delta tiles over mesh network
- Simplified offline cache (5GB limit)
- Tile sync on device startup

## 14. Cost Breakdown
- S3 storage: $7K/yr
- Processing compute: $15K/yr
- LiDAR licensing: Varies by project
- CDN bandwidth: ~$3K/yr

## 15. Monitoring & Metrics
| Agent | Metrics |
|-------|---------|
| Quality | Tile quality scores, processing throughput, validation pass rate |
| Research | New data source availability, improved processing algorithms, coverage gaps |
| Business | Storage costs, CDN bandwidth, data licensing spend, cost per tile |
| Compliance | Data licensing terms, retention policy adherence, audit trail completeness |
| Lead | Daily synthesis of all above |

## 16. Dependencies
- Geospatial libraries (GDAL, proj4, Rasterio)
- Cloud infrastructure (AWS S3, CloudFront)
- Message bus (NATS)
- Cache layer (Redis)
- GPU compute (for resampling, fusion)
