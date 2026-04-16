# Data Storage Architecture

## Primary Databases

**PostgreSQL + PostGIS**
- Role: Primary relational database for user data, events, alerts
- Version: PostgreSQL 15+
- Extension: PostGIS 3.3+ (geospatial indexing)
- Hosting: AWS RDS Multi-AZ (automated failover, daily snapshots)
- Size estimate: 500GB for 1M users (10 events/user history)
- Backup: Continuous replication to standby, automated snapshots every 6 hours

**Schema Design**
```
users (id, email, phone, location, password_hash, created_at)
events (id, event_type, jurisdiction, start_time, end_time, hazard_extent)
alerts (id, event_id, message, severity, geographic_extent, created_by, published_at)
hazard_data (id, event_id, latitude, longitude, hazard_type, confidence, magnitude)
groups (id, name, created_by, members)
locations (id, user_id, latitude, longitude, timestamp, accuracy)
```

**Query Optimization**
- Indexes on (user_id), (event_id), (timestamp), (geographic_extent) with GIST indexing for PostGIS
- Partitioning by month for `locations` table (hot storage: 3 months, cold storage: 7 years)
- Connection pooling via PgBouncer (max 1000 connections, transaction pooling mode)

## TimescaleDB for Time-Series Event Data

**TimescaleDB Purpose**
- Optimized for sensor readings, hazard observations (temperature, humidity, seismic activity)
- Automatic data compression reduces storage 10x vs. PostgreSQL
- Continuous aggregates for real-time analytics

**Data Points Tracked**
- USGS earthquake magnitude, depth, location (every event)
- NOAA precipitation measurements (every 6 hours per weather station)
- Temperature, wind speed from weather APIs (every 30 minutes per location)
- Particulate matter (PM2.5) from EPA sensors (every hour)

**Retention Policy**
- Hot data (recent 7 days): Uncompressed, instant query access
- Warm data (7-90 days): Compressed, ~100ms query latency
- Cold data (>90 days): Archived to S3 in Parquet format
- Purge: Auto-delete after 7 years (regulatory requirement)

**Cost**: ~$200/month for managed TimescaleDB Cloud (1GB/day ingestion, 500K data points/day average).

## Redis for Real-Time Caching & Session Management

**Use Cases**
- Session tokens: User auth tokens stored with 24-hour TTL
- Rate limiting: API call counters per user (resets hourly)
- Mesh network state: Active node presence, last seen timestamp
- Real-time alerts: Queue of unacknowledged alerts per user

**Configuration**
- 6-node cluster (for high availability)
- Memory: 16GB total (8GB per node)
- Eviction policy: LRU (least recently used) if memory threshold exceeded
- Persistence: RDB snapshots every 1 hour, AOF every 30 seconds

**Key Expiration**
- Session tokens: 24 hours from last activity (sliding window)
- Rate limit counters: Expire after 60 minutes
- Mesh state: Expire after 30 minutes (forces re-registration if node inactive)
- Alerts: Persist until user acknowledges (no auto-expire)

**Cost**: ~$100/month for AWS ElastiCache managed Redis.

## NATS for Pub/Sub Event Streaming

**NATS Role**
- Broker for inter-agent communication (wildfire alerts trigger flood analysis)
- Event streaming from mobile clients (location updates, hazard reports)
- Real-time notifications to EMS systems

**Channel Structure**
```
hazard.wildfire.predictions      -> Wildfire Analysis Agent publishes
hazard.flood.predictions         -> Flood Analysis Agent publishes
hazard.*.recommendations         -> Recommendation Agents subscribe
mesh.node.location_update        -> Mobile clients publish mesh state
ems.alerts.critical              -> Alerts published for EMS consumption
```

**Performance**
- Throughput: 100K messages/second per subject
- Latency: Sub-1ms message delivery
- Ordering: Guaranteed per subject (FIFO)
- Retention: 2-week rolling window (configured per subject)

**Cost**: Self-hosted on Kubernetes (included in EKS costs), ~$200/month additional for monitoring/scaling.

## Tile Storage: PMTiles on S3/CloudFront

**PMTiles Format**
- Single-file tile archive (instead of XYZ directory structure)
- Self-contained, no server-side indexing required
- Efficient random access (tiles retrieved via HTTP range requests)
- Size: ~500MB per zoom level 0-14 for continental US

**Storage Architecture**
- Basemap tiles (OSM via Overture Maps): 1GB, updated quarterly
- Hazard tiles (dynamically generated): 50MB per active event
- Satellite imagery (Sentinel-2 for flood extent): 5GB monthly archive

**CDN Configuration**
- CloudFront distribution with S3 origin
- Cache TTL: 1 hour for dynamic hazard tiles, 30 days for basemap
- Geo-replication: Edge locations in US (9 cities minimum)
- Cost: ~$30/month for 10TB/month transfer (assuming 1M users, 100KB/user/month)

**Tile Generation Pipeline**
- Real-time: Hazard extents rendered to tiles via Tippecanoe (vectorized)
- Batch: Weekly tile refresh for basemap layers (runs overnight)
- Format: Protocol Buffer format (.pbf), GeoJSON fallback

## Database Cost Estimate: ~$45K/year Infrastructure

**Breakdown (1M active users, concurrent peak 50K)**
- PostgreSQL RDS (15TB, Multi-AZ): $8K/month = $96K/year
- TimescaleDB Cloud: $200/month = $2.4K/year
- Redis ElastiCache: $100/month = $1.2K/year
- S3 storage (tile cache, backups): $500/month = $6K/year
- CloudFront CDN: $30/month = $360/year
- Data transfer (inter-region): $200/month = $2.4K/year
- Backup/replication: $100/month = $1.2K/year
- Monitoring & logging: $50/month = $600/year
- **Total: ~$4.8K/month = $57.6K/year**

**Scale Adjustment**
- MVP (10K users): ~$3K/month
- Beta (100K users): ~$12K/month
- Launch (1M users): ~$48K/month

## Backup & Disaster Recovery

**Backup Strategy**
- RDS automated snapshots: Every 6 hours, retained for 35 days
- Cross-region replica: Secondary database in different AWS region (for geo-redundancy)
- S3 versioning: All tiles and static data versioned, 30-day history
- Point-in-time recovery: Enabled (restores to any 5-minute window in past 7 days)

**Recovery Time Objectives (RTO)**
- Database failure: 2 minutes (automatic failover to standby)
- Tile service failure: 1 minute (CloudFront fallback to stale cache)
- Regional outage: 15 minutes (manual failover to secondary region)

**Recovery Point Objectives (RPO)**
- User data: 6-hour snapshot window (acceptable given non-time-critical nature)
- Event alerts: <1 minute (replicated in real-time to secondary)
- Mesh network state: <30 minutes (can be re-discovered)

**Annual Disaster Recovery Test**
- Simulate database corruption (month 6)
- Simulate regional outage (month 12)
- Document recovery procedures, update runbooks

## Data Retention & Compliance

**User Location Data**
- Operational: Retained for 90 days post-event (for post-event analysis)
- Compliance: Kept for 7 years in immutable audit log
- Deletion: User can request deletion; purged within 30 days
- Anonymization: User ID removed from location data after 90 days (retain geographic coordinates only for aggregate analysis)

**Event Alerts & Predictions**
- Historical archive: Retained for 10 years (benchmarking, regulatory audit)
- Public disclosure: Only summarized statistics released (never individual user identities)

**Server Logs**
- Application logs: 30 days operational retention, then archived to Glacier
- Access logs (API): 1 year retention (security audit trail)
- Error logs: 2 years retention (root cause analysis)
