# Offline Cache Management

Client-side 5GB LRU cache for offline capability. Precaches saved locations and hazard proximity zones. Syncs deltas on startup/Wi-Fi.

## Cache Scope and Priority

### Saved Locations

User specifies home, work, family addresses. System precaches 5km × 5km (25 1km tiles) around each:

```
precache_user_saved_locations(user_locations):
  for location in user_locations:
    # Tile grid centered on location
    tiles_to_cache = get_tiles_in_radius(location, radius_km=5)
    # 25 tiles × 1MB = 25MB per location
    cache_manager.enqueue_download(tiles_to_cache, priority=100)

  # Typical user: home (100) + work (90) = 50 tiles, 50MB
```

### Hazard Proximity Zones

When evacuation alert issued, system identifies tiles within 5km of hazard perimeter:

```
precache_hazard_proximity(active_hazard):
  hazard_bbox = get_hazard_boundary(active_hazard)
  buffer = expand_bbox(hazard_bbox, buffer_km=5)
  tiles_to_cache = get_tiles_in_bbox(buffer)

  # Wildfire: 5000 acres = ~10km², 5km buffer = ~65km² = ~65 tiles, 65MB
  # Hurricane: coastal cells, up to 200 tiles, 200MB
  cache_manager.enqueue_download(tiles_to_cache, priority=50)
```

### Recent History

Cache tiles visited in past 7 days (user's normal movements):

```
precache_recent_history(user_history, days=7):
  for tile_id in recent_tiles[past_7_days]:
    if tile_id not in cache:
      cache_manager.enqueue_download(tile_id, priority=10)

  # Typical user: 20 tiles/day × 7 days = 140 tiles, 140MB
```

## Priority Computation

Tiles ranked by relevance score for download order:

```
compute_cache_priority(all_tiles):
  for each tile_id:
    priority_score = (
      100.0 × is_saved_location[tile_id] +
      50.0 × (1.0 - distance_to_active_hazard_km[tile_id] / 5) +
      10.0 × days_since_visit[tile_id] / 7
    )
  return sorted(tiles, key=priority_score, reverse=True)
```

Examples:
- Home (saved location): 100
- Work (saved location): 100
- 1km from active wildfire: 50 × (1 - 1/5) = 40
- Visited yesterday: 10 × 1/7 ≈ 1.4
- Visited 7 days ago: 10 × 7/7 = 10

Total: 50 tiles typical cache, up to 5000 tiles if maximum hazard + saved locations + history.

## Cache Budget Management

5GB constraint enforced by LRU (Least Recently Used) eviction:

```
manage_cache_budget(budget_bytes=5_000_000_000):
  current_size = sum(os.path.getsize(f) for f in cache_files)

  if current_size > budget_bytes:
    # Evict oldest tiles until under budget
    sorted_by_access_time = sorted(
      cache_files,
      key=os.path.getatime
    )
    for file in sorted_by_access_time:
      os.remove(file)
      current_size -= os.path.getsize(file)
      if current_size <= budget_bytes * 0.9:  # 10% safety margin
        break

  return evicted_count
```

Eviction strategy: protected tiers
1. Never evict: saved locations (pinned)
2. Evict last: active hazard zones
3. Evict first: old history tiles (>7 days old)

## Sync Protocols

### On App Startup

```
sync_delta_on_startup():
  # Check for version updates
  local_versions = read_cache_manifest()
  remote_manifest = fetch_json('/tiles/manifest.json')

  for tile_id in local_versions:
    local_v = local_versions[tile_id]
    remote_v = remote_manifest[tile_id]['version']

    if local_v < remote_v:
      # Download delta, apply patch
      delta_file = download_delta(tile_id, local_v, remote_v)
      patch_tile(
        tile_path=cache_path(tile_id),
        delta=delta_file
      )
      update_cache_manifest(tile_id, remote_v)
      delete(delta_file)  # Cleanup

  return tiles_updated_count
```

SLA: complete within 60 seconds on startup (else user sees "offline" warning).

### On Wi-Fi Connection

Background sync when device detects Wi-Fi:

```
sync_delta_on_wifi():
  if not is_wifi_connected():
    return

  # Chunk downloads to avoid network saturation
  chunk_size = 500_000_000  # 500MB per background sync
  tiles_to_update = get_outdated_tiles()

  for chunk in chunks(tiles_to_update, chunk_size):
    for tile_id in chunk:
      try:
        sync_delta_on_startup()  # Per-tile sync
      except NetworkException:
        # Retry on next Wi-Fi session
        break

  # Cleanup old versions after successful sync
  cleanup_old_tile_versions()
```

Runs in background, does not block UI. Pauses if user initiates streaming/downloads.

## Compression for Offline Storage

Additional compression applied for offline cache (beyond CDN compression):

```
compress_for_offline(pmtiles_file):
  # Re-compress raster layers with optimized settings
  # Raster layers (elevation, landcover): often repetitive
  compressed = {
    'rasters': apply_png_filtering_then_zstd(raster_data, level=22),
    'vectors': zstd.compress(vector_data, level=15)
  }

  # Estimate space savings
  original_size = os.path.getsize(pmtiles_file)
  compressed_size = sum(len(v) for v in compressed.values())

  compression_ratio = compressed_size / original_size
  # Typical: 0.25 → 0.18 (28% additional savings)

  return compressed
```

Offline storage cost: ~1.5× smaller than CDN tiles due to aggressive compression.

Storage: 5GB budget / 0.8MB per tile = ~6250 tiles. Enough for 5 saved locations (125 tiles) + large hazard zone (200 tiles) + 1 month history (100 tiles) = still 5000 tiles spare for hazard growth.

## Tile Serving from Cache

```
serve_tile_from_cache(tile_id, offline_mode):
  if offline_mode:
    # Prefer cache, fail if not present
    try:
      return read_from_disk_cache(tile_id)
    except FileNotFoundError:
      return TileNotAvailable()

  # Online mode: check cache first, fallback to network
  if tile_id in disk_cache:
    cached_tile = read_from_disk_cache(tile_id)
    if is_fresh(cached_tile):  # < 7 days old
      return cached_tile
    # Stale but available; fetch fresher version in background
    fetch_in_background(tile_id)
    return cached_tile  # Show stale data immediately

  # Cache miss: fetch from network
  tile = fetch_from_cdn(tile_id)
  write_to_disk_cache(tile)
  return tile
```

Offline users: see cached tiles immediately. Online users: always get freshest data from CDN if available, or cached fallback.

## Mesh Network Integration

Tiles propagate via mesh between nearby devices:

```
mesh_tile_propagation(own_tile_version, neighbor_devices):
  for neighbor in neighbor_devices:
    neighbor_versions = get_neighbor_versions()

    for tile_id in own_cache:
      my_v = own_tile_version[tile_id]
      their_v = neighbor_versions.get(tile_id, 0)

      if my_v > their_v:
        # Share delta with neighbor
        delta = compute_delta(
          old_version=their_v,
          new_version=my_v
        )
        send_via_mesh(neighbor, tile_id, delta)

  # Receive from neighbors
  for (tile_id, delta) in mesh_inbox:
    apply_delta(tile_id, delta)
    update_cache_manifest()
```

Mesh propagation reduces CDN bandwidth when multiple users in same area (e.g., evacuation zone with 10K people). First device gets delta from CDN, shares with others via mesh.

Bandwidth saved: if 10 devices in area, 9 get tiles via mesh (0KB CDN each), 1 gets from CDN (50KB).

## Cache Lifecycle

Tile versions retained:

| Version Age | Storage | Accessibility |
|-------------|---------|----------------|
| Current (v_current) | Local cache | Hot (instant) |
| Previous (v_current - 1) | Local cache | Warm (instant if space) |
| Older (v_current - 2+) | Deleted | Not available (fetch from CDN) |

Rotation: when new version arrives, keep 2 versions locally (current + previous). Oldest evicted per LRU.

Rationale: allows quick rollback if latest version has bug (use v_previous). Saves space by not keeping all versions.

## Monitoring (Client-Side)

App telemetry:

| Metric | How Tracked | Threshold |
|--------|------------|-----------|
| Cache hit rate (startup) | count_disk_hits / total_requests | >80% (target) |
| Sync time | wall clock ms on app launch | <60 sec (target) |
| Cache size | sum of cache files | keep <5GB |
| Eviction count | count per day | <20 tiles/day (means good priority) |
| Stale tile count | tiles older than 7 days | <5% |

App reports to server: `{cache_hit_rate, sync_time_ms, cache_size_mb, tile_count, device_storage_free}`.

Server aggregates: if sync_time trending up or hit_rate down, indicates cache thrashing (too many tiles, too small budget).

## Cost Model

Offline storage reduces CDN cost: users on Wi-Fi download deltas (~30KB) instead of full tiles (~1MB).

Assuming 50% of users sync on Wi-Fi weekly:
- Full tile CDN cost: $0.008/tile × 1M tiles = $8K/month
- Delta tile CDN cost: $0.0003/tile × 1M tiles = $0.3K/month
- Storage cost (5GB × 10M devices): negligible (on-device, no server cost)

Savings: ~$7.7K/month (delta approach) vs. $8K/month (full tile approach).

Payoff: reduces operational costs while improving user experience (faster sync, offline access).
