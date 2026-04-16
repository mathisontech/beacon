# Tile Delivery System

Cloud-optimized tile delivery via PMTiles format, 1km grid, Zstandard compression, CloudFront CDN, and offline client cache. SLA: tile fetch <50ms (CDN hit), offline refresh <1 minute on startup.

## Architecture Overview

```
Digital Twin (PostgreSQL + S3 rasters)
    ↓
Tile Composition (merge all attributes)
    ↓
Tile Generation (PMTiles archive)
    ↓
Delta Encoding (hash-based diffs)
    ↓
CloudFront CDN (origin: S3)
    ↓
Client (cached tiles, offline capable)
    ↓
Mesh Network (propagate deltas locally)
```

## Tile Format and Grid

### PMTiles

Cloud-native format: single-file archive containing all zoom levels and tiles. Range-request friendly (fetch single tile without downloading entire file). Indices optimized for fast lookups.

Advantages:
- Reduced S3 API calls (one file per region, not millions of individual tiles)
- Atomic updates (single file replace vs. per-tile overwrites)
- Efficient bandwidth (only requested bytes transferred)
- Browser-native support (via pmtiles.js library)

### Grid: 1km x 1km Cells

Grid aligned to:
- UTM zone boundaries (50km blocks)
- Tile pyramid z20 (roughly 1km at equator, higher zoom in temperate zones)
- Web Mercator EPSG:3857

Tile ID format: `{region}_{z}_{x}_{y}.pmtiles`

Example: `N45W090_001_002.pmtiles` = PMTiles archive for region N45W090, zoom level 1, tile indices x=0, y=2.

## Layers Per Tile

All non-transient attributes packed into single PMTiles file for 1km cell:

| Layer | Type | Format | Compression |
|-------|------|--------|-------------|
| Elevation + derivatives | Raster | GeoTIFF (Float32, 30m resampled to 1km) | Zstandard |
| Land cover | Raster | GeoTIFF (UInt8, 11-class, 10m resampled) | Zstandard |
| Building footprints | Vector | GeoJSON | Zstandard |
| Road network | Vector | GeoJSON | Zstandard |
| Vegetation (trees, shrubs) | Vector | GeoJSON polygons | Zstandard |
| Infrastructure (power lines, hydrants) | Vector | GeoJSON points/lines | Zstandard |
| Water bodies | Vector | GeoJSON polygons | Zstandard |
| Hazard zones (volcanic, tsunami, seismic) | Vector | GeoJSON polygons | Zstandard |
| Population density | Raster | GeoTIFF (UInt16, population/km²) | Zstandard |

## Compression and Size

Compression ratio: Zstandard at level 19 (slow, best compression).

Typical tile sizes:

| Coverage Tier | Uncompressed | Compressed | Ratio |
|---------------|-------------|-----------|-------|
| Full US | 4.2 MB | 1.1 MB | 26% |
| Enhanced US | 2.8 MB | 0.8 MB | 29% |
| Global Fallback | 1.5 MB | 0.7 MB | 47% |

Average: ~1 MB/tile compressed. Continental US (~3M tiles): ~3 TB live + ~6 TB archive/history.

Storage cost (S3 Standard): ~$72/month (3TB @ $0.023/GB).

## Delta Encoding and Updates

When new tile version generated, compute hash-based delta:

```
old_tile_hash = SHA-256(old_pmtiles)
new_tile_hash = SHA-256(new_pmtiles)

if hash_changed:
  delta_tile = binary_diff(old_pmtiles, new_pmtiles)
  delta_size = ~5-15% of tile_size
  publish_to_cdn: delta_tile.zstd
else:
  no_change, skip
```

Client-side application:
1. Check local version number against live version
2. If outdated: download delta tile
3. Apply binary patch: local_tile + delta = new_tile
4. Update local version cache

Delta delivery reduces bandwidth: 30-50MB per continental update vs. 3TB full re-download.

## CDN Distribution

### CloudFront Configuration

Distribution origin: S3 bucket (`s3://beacon-atlas/live/tiles/`)

Behaviors:

| Path Pattern | Origin | Cache TTL | Compression |
|--------------|--------|-----------|-------------|
| `*.pmtiles` | S3 | 7 days | Gzip (CloudFront auto) |
| `*/delta/*.zstd` | S3 | 1 day | Gzip |
| `*/version.json` | S3 | 1 hour | Gzip |

Headers:
- Content-Type: application/octet-stream (PMTiles)
- CORS: Access-Control-Allow-Origin: *
- Cache-Control: public, max-age=604800 (for tiles), max-age=3600 (for version)

Edge locations: 400+ worldwide (North America, Europe, Asia, etc.)

### Range Request Performance

Tile fetch SLA: <50ms p95 on CDN hit.

Typical workflow:
1. Client requests bytes 5000000-5001000 from tile.pmtiles (single road segment)
2. CloudFront checks cache:
   - HIT: <10ms response (cached bytes returned)
   - MISS: fetch from S3 + edge cache, <50ms
3. Response: 1000 bytes (one road segment geometry)

No need to download entire 1MB tile.

## Offline Cache Management

### Cache Scope

Client maintains 5GB LRU cache for:
- User's saved locations (home, work, family): precache 1km around each
- Hazard proximity (5km buffer around active hazard zones): precache dynamically
- Recent history: cache tiles visited in past 7 days

### Precaching Strategy

```
compute_cache_priority(user_locations, active_hazards, recent_tiles):
  priority_score = [
    100 × is_saved_location +
    50 × distance_to_active_hazard_inverse +
    10 × recency_weight
  ]
  rank tiles by priority_score
  download top tiles until 5GB reached
```

User saved location (home): 25 1km tiles (5km×5km square) = ~25MB.
Hazard proximity (5km buffer): varies, typically 50-200 tiles depending on hazard footprint.

### Sync Triggers

1. **App startup**: check live version_number, download delta tiles if outdated
2. **Wi-Fi connection**: background sync in batches (500MB at a time)
3. **Active hazard alert**: immediately re-precache hazard proximity zones
4. **User requests location**: precache on-demand if not cached

Offline users: if tile not cached, show "offline" indicator. User can choose to wait/refresh when connectivity available.

### Mesh Integration

Delta tiles can propagate via mesh network: device A downloads new tile from CDN, shares delta with nearby device B (via mesh). Reduces cumulative bandwidth when multiple users in same area.

Mesh protocol: send delta_tile to peer if peer's version_number < local version_number.

## Tile Serving Endpoints

| Endpoint | Format | Purpose | SLA |
|----------|--------|---------|-----|
| `/tiles/region/{tile_id}.pmtiles` | PMTiles | Full tile fetch or range request | <50ms CDN |
| `/tiles/region/version.json` | JSON | Current version number per tile | <20ms CDN |
| `/tiles/region/delta/{old_v}/{new_v}.zstd` | Zstandard | Binary delta for version upgrade | <50ms CDN |
| `/tiles/manifest.json` | JSON | List of all tile IDs + current versions | <100ms CDN |

CloudFront automatically caches all responses. Stale tiles archived to Glacier (1 year retention minimum).

## Monitoring and Metrics

| Metric | Target | Action on Miss |
|--------|--------|-----------------|
| CDN hit rate | >95% | Investigate cache invalidation |
| Average tile size | <1.2MB | Optimize compression parameters |
| P95 fetch latency | <50ms | Add edge locations or optimize origin |
| Offline sync time | <60 sec | Reduce delta size or prioritize tiles |

Real-time dashboard: CloudFront metrics + client-side telemetry (fetch times, cache hits, sync errors).

## Cost Model

| Component | Monthly Cost |
|-----------|--------------|
| S3 storage (3TB live + 1TB staging) | $92 |
| S3 API calls (~500M reads/month) | $250 |
| CloudFront data transfer (100GB/month) | $8 |
| CloudFront requests (50M requests/month) | $250 |
| **Total** | **$600/month** |

Per-tile cost: ~$0.0002/month (600 tiles average daily active).
