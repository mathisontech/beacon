# CDN Distribution

CloudFront distribution configuration, cache management, and tile serving. Delivers tiles globally with <50ms p95 latency via edge caching.

## CloudFront Distribution Setup

### Origin Configuration

Origin: S3 bucket `s3://beacon-atlas-live-tiles`

| Setting | Value | Rationale |
|---------|-------|-----------|
| Origin Path | `/tiles` | Organize all tile assets in one prefix |
| Origin Access | CloudFront OAI | S3 bucket not publicly accessible |
| SSL | HTTPS only | Encrypt in transit |
| Custom Headers | X-Origin-Verify | Prevent direct S3 access |

### Behaviors (Cache Rules)

| Path Pattern | Cache TTL | Compress | Headers |
|--------------|-----------|----------|---------|
| `*.pmtiles` | 7 days | Gzip | Content-Type: application/octet-stream |
| `*/delta/*.zstd` | 1 day | None (already compressed) | Content-Type: application/x-zstd |
| `*/version.json` | 1 hour | Gzip | Content-Type: application/json |
| `*/manifest.json` | 1 hour | Gzip | Content-Type: application/json |

### CORS and Headers

Tiles served with permissive CORS to allow client-side requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Content-Type, Range
Access-Control-Max-Age: 3600
```

Range request support (HTTP 206):
- Allows clients to fetch byte ranges from tile (e.g., bytes 1000000-1000100)
- Reduces bandwidth: fetch single feature instead of whole tile
- CloudFront passes through Range header to origin

Headers sent to clients:

```
Content-Type: application/octet-stream (for .pmtiles)
Content-Length: {actual_file_size}
Cache-Control: public, max-age=604800 (7 days for tiles)
Cache-Control: public, max-age=3600 (1 hour for version.json)
ETag: "{SHA-256_hex}"
Last-Modified: {timestamp}
Accept-Ranges: bytes
```

### Edge Locations

CloudFront uses 400+ edge locations globally:

| Region | Edge Count | Latency (p50) |
|--------|-----------|---------------|
| North America | 120 | <20ms |
| Europe | 80 | <20ms |
| Asia Pacific | 100 | <40ms |
| South America | 40 | <50ms |
| Middle East/Africa | 60 | <50ms |

Automatic routing: client connects to nearest edge location.

## Cache Management

### Cache Invalidation

Trigger: when new version of tile published to S3

```
on_tile_version_update(tile_id, new_version):
  # Invalidate old version in CloudFront
  cloudfront.create_invalidation(
    distribution_id='ABCDEF123456',
    paths=[f'/tiles/{tile_id}-v*.pmtiles']
  )
  # Invalidation propagates to all edges within 1-3 minutes
```

Cost: invalidations cost $0.005 per path. Batch updates: invalidate region at a time, not per-tile. Monthly cost: ~$5K for max 1M tiles updating daily.

### Stale-While-Revalidate

Optional cache header for graceful handling during updates:

```
Cache-Control: public, max-age=604800, stale-while-revalidate=86400

If client requests tile older than max-age but fresher than stale-while-revalidate:
  → Return stale cached tile immediately
  → Revalidate in background
  → Next request gets fresh tile
```

Reduces cache invalidation need: clients tolerate 1-day stale tiles rather than immediate refresh.

### Hit Rate Monitoring

Real-time dashboard metrics:

| Metric | Target | Current (Pilot) |
|--------|--------|-----------------|
| Cache hit rate (%) | >95 | 94-97 |
| Edge cache bytes/sec | Peak 50GB/s | 10-20GB/s (pilot scale) |
| Origin bytes/sec | <5GB/s | <1GB/s (pilot) |
| Bytes from cache | >90% | 92-95% |

Hit rate depends on:
- Geographic distribution of users (concentrated → higher hit rate)
- Tile update frequency (frequent → miss more often)
- Precaching strategy (good → better hit rate)

If hit rate drops below 90%:
1. Check if many tiles invalidated recently (expect temporary dip)
2. Increase edge capacity (CloudFront auto-scales)
3. Review stale-while-revalidate strategy
4. Consider regional prefetch (push popular tiles to edges proactively)

## Tile Serving

### Standard Flow

Client requests tile from CloudFront:

```
Client: GET /tiles/N45W090_001_002.pmtiles HTTP/1.1
        Host: tiles.beacon.example.com

CloudFront (edge location):
  1. Check local cache for /tiles/N45W090_001_002.pmtiles
  2. If cached + valid:
       → Return 200 OK with cached bytes (p50: <5ms)
  3. If not cached or expired:
       → Forward to S3 origin
       → S3 returns 200 OK (p50: <100ms for first byte)
       → CloudFront caches for 7 days
       → Return to client (p50: <50ms total)

Client receives:
  HTTP/1.1 200 OK
  Content-Type: application/octet-stream
  Content-Length: 1048576
  ETag: "abc123def456"
  Cache-Control: public, max-age=604800
  X-Cache: Hit from cloudfront (or Miss from cloudfront)
  Age: {seconds_in_cache}
```

### Range Request Flow (Efficient Single Feature)

Client wants single road segment (~1KB) from 1MB tile:

```
Client: GET /tiles/N45W090_001_002.pmtiles HTTP/1.1
        Range: bytes=500000-501000

CloudFront (edge):
  1. Check cache for /tiles/N45W090_001_002.pmtiles
  2. If full tile cached:
       → Return 206 Partial Content (cached bytes)
  3. If not cached:
       → Forward Range request to S3
       → S3 returns 206 with requested range only
       → CloudFront caches full tile (will serve faster next time)
       → Return 206 with range bytes

Client receives:
  HTTP/1.1 206 Partial Content
  Content-Type: application/octet-stream
  Content-Length: 1001
  Content-Range: bytes 500000-501000/1048576
  X-Cache: Hit from cloudfront
```

Bandwidth saved: 1001 bytes vs. 1048576 bytes (99.9% reduction).

### Caching Strategy for Version Updates

When new version published:

```
Old version (v128):
  GET /tiles/N45W090_001_002-v128.pmtiles (cached, hits edge)

New version (v129) available:
  Invalidate v128 pattern from CDN
  GET /tiles/N45W090_001_002-v129.pmtiles (not cached, fetches from S3)

Client strategy (recommended):
  1. Check version.json for current_version
  2. If local_version < current_version:
       → Download delta tile (smaller, ~50KB vs. 1MB)
       → Apply patch locally (30ms on device)
  3. Update local version_number
  4. Next fetch of pmtiles uses v129 (now cached at edge)
```

Result: only first client to request new version pays full 1MB cost; subsequent clients get cached v129.

## Origin Failover

Secondary origin for reliability:

| Setting | Primary | Secondary |
|---------|---------|-----------|
| Origin | S3 standard region | S3 cross-region replica |
| Failover | Automatic on 5xx | <30 sec switchover |
| Consistency | Strong (read-after-write) | Eventual (few seconds) |

Failover trigger: if S3 origin returns 5xx errors for >5 consecutive requests, CloudFront automatically switches to secondary. Automatic fallback to primary when healthy again.

RTO: <30 seconds (time to redirect all edge traffic).

## Functions

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| publish_to_cdn | Generated PMTiles file | CloudFront request | Push to S3 origin | <1 min |
| cache_tile_cloudfront | Tile ID, version | Cache warmed | Pre-populate edge cache | <5 min/tile |
| invalidate_stale_tiles | Old tile versions | Invalidation ID | Expire old versions | <3 min |
| deliver_tile_range_request | Client Range header | Partial content bytes | Serve byte range | <50ms |
| compute_cdn_hit_rate | CloudFront metrics | Hit rate % | Monitor cache effectiveness | Real-time |
| manage_origin_failover | Origin health | Active origin | Switch if needed | Automatic |

## Cost Optimization

| Strategy | Savings | Trade-off |
|----------|---------|-----------|
| Increase TTL (7 → 30 days) | 40% lower invalidations | Slower update propagation |
| Stale-while-revalidate | 20% fewer cache misses | Clients see 1-day stale data |
| Compress vectors (GeoJSON) | 30% smaller tiles | CPU cost for decompression |
| Regional precaching (push to edges) | 60% higher hit rate | 100MB preload per edge (AWS cost) |
| Delta tiles instead of full | 90% bandwidth reduction | Complexity of patch logic |

Recommended: use stale-while-revalidate + delta tiles for optimal cost.

## Monitoring

Real-time alerts:

| Alert | Threshold | Action |
|-------|-----------|--------|
| Hit rate drops | <80% | Investigate cache invalidation |
| Origin 5xx | >5 in 1 min | Failover trigger |
| Latency p95 | >100ms | Check edge capacity, add locations |
| Data transfer surge | >100GB/day unexplained | Investigate DDoS or bot traffic |

CloudWatch dashboard: hit rate, bytes from cache, requests per second, origin latency, edge locations (geographic heatmap).
