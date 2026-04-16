# 54. Data Storage Architecture

## Overview
Multi-tier database system: PostgreSQL+PostGIS for relational data (users, events, alerts), TimescaleDB for time-series (sensors, metrics), Redis for real-time caching, NATS for event streaming, S3+CloudFront for static assets (tiles, models, media). Hot/warm/cold data lifecycle; 7-year compliance retention.

## Ownership
- **Module Lead:** Database Architect
- **Reports to:** Infrastructure Lead
- **Team Size:** 2 (1 DBA, 1 data platform engineer)

## Parent/Submodules
- Parent: 36_data_storage
- Submodules: PostgreSQL, TimescaleDB, Redis, NATS, S3 CDN

## Goals
- <100ms query latency (95th percentile) for hot data
- 50M user scale, 1M concurrent, 500GB primary database
- Auto-failover <2 minutes (RDS Multi-AZ)
- Zero data loss for critical events
- Data lifecycle: 7-year compliance retention

---

## Functions (Database Operations)

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| query_user_by_id | Fetch user record | user_id | User object | <10ms | PostgreSQL |
| insert_event | Create disaster event | Event data (title, location, hazard) | event_id | <100ms | PostgreSQL |
| query_events_by_region | Spatial query for active events | Bounding box (lat/lon) | Event list | <50ms | PostGIS index |
| insert_alert | Create hazard alert | Alert data (message, location, severity) | alert_id | <100ms | PostgreSQL |
| query_alerts_by_user | Fetch user alerts | user_id + date_range | Alert list | <20ms | PostgreSQL index |
| insert_location | Log user location | user_id + GPS + timestamp | location_id | <50ms | TimescaleDB |
| query_location_history | Get user movement trail | user_id + date_range | Location timeline | <100ms | TimescaleDB compression |
| insert_sensor_data | Log phone sensor reading | device_id + barometric_pa + timestamp | data_id | <20ms | TimescaleDB |
| query_sensor_timeseries | Fetch sensor stream | device_id + date_range | Time series data | <100ms | TimescaleDB continuous aggregate |
| insert_hazard_observation | Log real-time hazard measurement | hazard_type + location + value | obs_id | <50ms | TimescaleDB |
| aggregate_hazard_statistics | Compute hourly/daily summary | hazard_type + date | Aggregated metrics | 5min | TimescaleDB continuous aggregate |
| insert_group_membership | Add user to group | user_id + group_id | membership_id | <50ms | PostgreSQL |
| query_group_members | Fetch group roster | group_id | User list | <30ms | PostgreSQL index |
| insert_contact | Store user contact | user_id + contact_user_id | contact_id | <50ms | PostgreSQL |
| query_contacts_nearby | Find contacts in region | user_id + bbox | Contact list + distance | <100ms | PostGIS |
| upsert_resource_position | Update EMS resource location | resource_id + location | Updated position | <30ms | Redis (real-time), PostgreSQL (persist) |
| query_resource_availability | Get available resources | resource_type + region | Resource list + capacity | <50ms | Redis |
| write_audit_log | Log security event | user_id + action + resource | log_id | <100ms | PostgreSQL + S3 Object Lock |
| query_audit_trail | Fetch access logs | user_id/resource_id + date_range | Audit entries | <200ms | PostgreSQL (recent), S3 (archived) |
| backup_database_snapshot | Create RDS snapshot | - | Snapshot created + S3 copy | <30min | AWS RDS |
| restore_from_snapshot | Point-in-time recovery | Snapshot ID + target timestamp | Database restored | <15min | AWS RDS |
| replicate_to_standby | Continuous replication | Primary database state | Secondary replica synced | <1s | RDS replication |
| compress_timeseries_data | Archive old sensor data | Data >90 days old | Compressed in S3 (Parquet) | 1hr | TimescaleDB + S3 |
| archive_event_data | Move old events to cold storage | Event >1 year old | S3 Glacier archive | <1hr | PostgreSQL + S3 |
| purge_expired_data | Delete data past retention | Data >7 years old | Data deleted from all stores | 1hr (batch) | Auto-expire job |
| validate_data_integrity | Check for corruption | Database segment | Corruption report | 1hr (weekly) | pg_dump, checksum |
| vacuum_database | Reclaim storage from deletes | - | Database optimized | 2hrs (nightly) | PostgreSQL VACUUM |
| reindex_tables | Rebuild B-tree indexes | - | Indexes rebuilt | <30min (monthly) | PostgreSQL REINDEX |
| partition_time_series | Split TimescaleDB by month | - | Partitions created | <5min | TimescaleDB |
| configure_connection_pooling | Limit database connections | Max connections count | Pool configured | <1min | PgBouncer |
| publish_message_event | Publish to NATS stream | Channel + message | Message delivered | <10ms | NATS |
| subscribe_message_stream | Consumer group for NATS | Channel name | Consumer connected | <50ms | NATS |
| cache_value_redis | Store in Redis | Key + value + TTL | Cached | <5ms | Redis |
| invalidate_cache | Clear Redis entries | Key pattern | Cache cleared | <5ms | Redis |
| store_s3_object | Upload file to S3 | Filename + content | Object URL | <1sec | AWS S3 |
| generate_s3_presigned_url | Time-limited download link | Object key + expiry | Presigned URL | <10ms | AWS S3 |
| cloudfront_cache_invalidation | Purge CDN cache | Path pattern | Invalidation queued | <1min | AWS CloudFront |

---

## Database Schemas

### PostgreSQL Core Tables

| Table | Purpose | Key Fields | Indexes |
|-------|---------|-----------|---------|
| users | User accounts | user_id, email, phone, location, created_at | (email), (phone), (user_id) |
| events | Disaster events | event_id, event_type, jurisdiction, start_time, end_time, hazard_extent | (jurisdiction), (start_time), (event_type) |
| alerts | Hazard alerts | alert_id, event_id, message, severity, geographic_extent, created_by | (event_id), (severity), (created_by), GIST(geographic_extent) |
| hazard_data | Hazard observations | hazard_id, event_id, lat, lon, hazard_type, confidence, magnitude | (event_id), (hazard_type), GIST(lat,lon) |
| groups | User groups | group_id, name, created_by, members_count | (created_by), (name) |
| group_members | Group membership | group_id, user_id, joined_at | (group_id), (user_id) |
| contacts | Contact relationships | user_id, contact_id, relationship_type, created_at | (user_id), (contact_id) |
| shelters | Evacuation shelters | shelter_id, name, location, capacity, occupancy | GIST(location), (capacity) |
| resources | EMS resources | resource_id, type, jurisdiction, capacity, status | (jurisdiction), (type), (status) |

### TimescaleDB Hypertables

| Table | Purpose | Time Column | Partitioning | Retention |
|-------|---------|------------|--------------|-----------|
| locations | User GPS locations | timestamp | 1 month | 90 days (hot), 7 years (archived) |
| sensor_readings | Phone sensors (barometric, etc.) | timestamp | 1 day | 30 days (hot), 1 year (archive) |
| weather_observations | Weather data from APIs | timestamp | 1 day | 90 days |
| hazard_predictions | Model predictions | timestamp | 1 day | 1 year |
| system_metrics | App performance metrics | timestamp | 1 hour | 30 days |
| alert_acknowledgments | When users see alerts | timestamp | 1 week | 2 years |

---

## Data Storage

| System | Purpose | Capacity | Cost/Month | Backup |
|--------|---------|----------|-----------|--------|
| PostgreSQL RDS Multi-AZ | Primary relational DB | 500GB | $8,000 | 6-hourly snapshots |
| TimescaleDB Cloud | Time-series data | 1GB/day ingestion | $200 | Continuous replication |
| Redis ElastiCache (6 nodes) | Real-time cache | 16GB total | $100 | RDB snapshots hourly |
| NATS cluster | Event streaming | Unlimited (in-memory) | $200 | Persistent JetStream |
| S3 storage | Tiles, models, archives | 50TB | $500 | Versioning enabled |
| CloudFront CDN | Content delivery | 10TB/month transfer | $30 | Origin fallback |
| Backup storage (S3 Glacier) | Long-term archives | 100TB | $200 | Indexed for restore |

---

## Message Bus (NATS)

| Channel | Subject | Producers | Consumers | Retention |
|---------|---------|-----------|-----------|-----------|
| Event stream | hazard.wildfire.predictions | Wildfire model | Analysis agents | 2 weeks |
| Event stream | hazard.flood.predictions | Flood model | Analysis agents | 2 weeks |
| Event stream | mesh.node.location_update | Mobile clients | World model | 2 weeks |
| Event stream | ems.alerts.critical | Alert system | EMS dashboard | 1 month |
| Event stream | simulation.evacuation.progress | Evacuation sim | Dashboard, EMS | 1 week |
| Event stream | user.location.update | Mobile apps | Analytics, mesh | 7 days |
| Event stream | model.inference.error | Model consumers | Monitoring | 30 days |

---

## Cache (Redis)

| Key Pattern | Purpose | TTL | Size | Frequency |
|-------------|---------|-----|------|-----------|
| session:{token_id} | Active JWT sessions | 24hr | 500B | Per login |
| user:{user_id}:location | Current user location | 15min | 1KB | 1Hz (GPS) |
| resource:{resource_id}:position | EMS unit location | 30sec | 1KB | Real-time |
| event:{event_id}:active | Active event flag | 7 days | 100B | Per event |
| mesh:peers:{node_id} | Mesh network peers | 1min | 5KB | Per node handshake |
| pop:density:{jurisdiction}:{hour} | Hourly population | 24hr | 5MB | Daily midnight |
| model:cache:{model_id}:output | Recent model predictions | 1hr | 10MB | Per prediction |
| rate_limit:{user_id}:{endpoint} | API rate limiting | 1hr | 100B | Per request |

---

## External Integrations

| System | Purpose | Protocol | Data Sync |
|--------|---------|----------|-----------|
| AWS RDS Backup | Automated snapshots | AWS API | 6-hourly |
| AWS S3 (tiles, models) | Static asset hosting | S3 API | Via EAS Update |
| CloudFront CDN | Content delivery | HTTPS | Origin pull |
| AWS KMS | Encryption key management | AWS API | Real-time |
| GitHub (backup mirror) | Git-based backup | HTTPS | Continuous |

---

## API Contracts

### Query Events by Region
```
GET /api/v1/events?bbox=40.0,-121.0,40.5,-120.5&active_only=true
Response: {
  events: [
    {event_id, event_type, start_time, hazard_extent, severity},
    ...
  ],
  count: 5
}
```

### Insert Location
```
POST /api/v1/locations
Body: {
  user_id: "user123",
  latitude: 40.1234,
  longitude: -120.5678,
  accuracy_meters: 10,
  timestamp: "2026-03-09T14:30:00Z"
}
Response: {
  location_id: "loc456",
  stored_at: "2026-03-09T14:30:01Z"
}
```

### Query Alert History
```
GET /api/v1/users/{user_id}/alerts?start_date=2026-03-01&end_date=2026-03-09
Response: {
  alerts: [
    {alert_id, message, severity, created_at, acknowledged_at},
    ...
  ],
  total_count: 23
}
```

### Get Current Resources
```
GET /api/v1/resources?type=ambulance&jurisdiction=santa_clara
Response: {
  resources: [
    {resource_id, location, occupancy, available_capacity},
    ...
  ],
  total_available: 45
}
```

---

## Data Lifecycle & Retention

| Data Class | Hot (Days) | Warm (Days) | Cold (Years) | Purge |
|------------|-----------|-----------|-----------|-------|
| User location | 90 | - | 7 | Anonymize before delete |
| Event alerts | 30 | 1 year | 7 | Summarize, then delete |
| Sensor readings | 7 | 90 | 1 | Compress to Parquet |
| Audit logs | 30 | 1 year | 7 | Immutable (S3 Object Lock) |
| User passwords | - | - | - | Deleted on reset (hash only stored) |
| API keys | - | - | - | Deleted on revocation |
| Payment info | - | - | - | Never stored (3rd-party processor) |

---

## Cost Breakdown (1M Users)

| Component | Cost/Month | Assumptions |
|-----------|-----------|-------------|
| PostgreSQL RDS (500GB Multi-AZ) | $8,000 | Primary + standby, daily snapshots |
| TimescaleDB Cloud (1GB/day) | $200 | Sensor + metric ingestion |
| Redis ElastiCache (16GB) | $100 | Session caching, real-time state |
| NATS self-hosted (Kubernetes) | $200 | Included in EKS costs |
| S3 storage (50TB) | $500 | Tiles, models, archives |
| CloudFront transfer (10TB) | $30 | Tile CDN, media delivery |
| Data transfer (inter-region) | $200 | Backup replication |
| Backup/Glacier (100TB) | $200 | Long-term archival |
| Monitoring + logging | $50 | CloudWatch, ELK |
| **Subtotal** | **$9,480** | Steady state |
| **Peak event (10x)** | **$94,800** | Surge in location/sensor traffic |

---

## Backup & Disaster Recovery

| Objective | Target | Mechanism | Test Schedule |
|-----------|--------|-----------|---------------|
| RTO (Recovery Time) | 2 min (failover) / 15 min (regional) | RDS Multi-AZ + cross-region replica | Monthly |
| RPO (Recovery Point) | 6 hours (database) / <1 min (alerts) | Continuous replication + 6-hourly snapshots | Monthly |
| Data durability | 99.99% | S3 Multi-AZ, encrypted backups | Quarterly |
| Backup retention | 35 days (auto snapshots) + 7 year (archive) | S3 Glacier, Glacier Deep Archive | Annual restore test |

---

## Monitoring (5-Agent Team)

| Agent | Role | Frequency | Key Metrics | Escalation |
|-------|------|-----------|-------------|-----------|
| Quality | Query latency, index health | Daily | P95 latency, missing indexes | Latency >200ms, index fragmentation |
| Research | Data growth trends, optimization opportunities | Weekly | Table size, replication lag | Replication lag >1min |
| Business | Storage cost, data volume | Weekly | Cost per user, storage efficiency | Cost spike >20% |
| Compliance | Backup integrity, retention compliance | Daily | Backup success rate, archive age | Failed backup, expired retention |
| Lead | Incident response authority | Per incident | RTO/RPO SLA compliance | Any RTO >2min, RPO >6hrs |

---

## Dependencies

| Module | Dependency | Type | Criticality |
|--------|-----------|------|------------|
| All other modules | PostgreSQL, TimescaleDB, Redis, NATS | Hard | Critical |
| 53_cybersecurity | Encryption keys, audit logging | Hard | Critical |
| 52_system_updates | S3 tile storage, model distribution | Soft | High |
| 50_modeling_simulation | TimescaleDB for sensor data | Hard | Critical |

---

## Implementation Notes

- **PostgreSQL partitioning:** `locations` table partitioned by month; indexes on (user_id, timestamp) for quick range queries
- **TimescaleDB compression:** Automatic after 7 days; reduces storage 10x; queries on compressed segments have ~100ms latency
- **Redis clustering:** 6-node cluster with replication; LRU eviction policy; RDB snapshots every 1hr, AOF every 30sec
- **NATS JetStream:** Persistent storage for event streams; 2-week retention for hazard predictions, 30-day for audit events
- **S3 delta encoding:** Tiles hashed; only changed tiles uploaded; CloudFront cache invalidation via pattern (e.g., `/tiles/hazard/*`)
- **Cross-region replication:** Secondary PostgreSQL in different AWS region; failover manual to prevent split-brain; ~5min to activate
- **Offline data sync:** Mobile clients cache user profile + recent alerts locally; sync on network reconnect
