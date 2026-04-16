# Tile Generation

Functions to compose, index, compress, and package tiles into PMTiles format. Triggered after digital twin update.

## Functions: Tile Composition

| Function | Input | Output | Role | SLA |
|----------|-------|--------|------|-----|
| compose_tile_layers | Digital twin state (affected tiles) | Merged GeoJSON/GeoTIFF per tile | Combine all attributes | 30 sec/tile |
| build_tile_index | Merged tiles | B-tree index (tile_id → offset) | Fast lookup structure | 5 min/1M tiles |
| compute_tile_hash | Composed tile | SHA-256 hex string | Delta detection | 1 sec/tile |
| compress_tile_zstd | Uncompressed tile | Zstandard compressed bytes | Reduce storage | 5 sec/tile |
| generate_pmtiles_archive | Compressed tiles + index | Single .pmtiles file | Package all tiles | 10 min/1M tiles |
| compute_delta_tiles | Old tile hashes, new tile hashes | Delta binary files | Efficient updates | 2 sec/changed tile |
| validate_tile_integrity | Generated tile | Checksum report | Verify correctness | 500ms/tile |
| compute_tile_size | Composed tile | Estimated size in bytes | Storage planning | 10ms/tile |

## Data Source Composition

Merge all attributes from digital twin into single PMTiles per affected 1km tile:

```
compose_tile_layers(tile_id, digital_twin_version):
  tile_bbox = get_tile_bounds(tile_id)

  # Raster layers (elevation, land cover, population)
  elevation = query_digital_twin(
    source='copernicus_dem_elevation',
    bounds=tile_bbox,
    version=version
  )  # Returns float32 GeoTIFF

  slope = query_digital_twin('copernicus_dem_slope', tile_bbox, version)
  aspect = query_digital_twin('copernicus_dem_aspect', tile_bbox, version)
  landcover = query_digital_twin('esri_worldcover_10m', tile_bbox, version)
  population = query_digital_twin('population_density', tile_bbox, version)

  # Vector layers (buildings, roads, etc.)
  buildings = query_digital_twin(
    source='buildings_footprints',
    bounds=tile_bbox,
    version=version
  )  # Returns GeoJSON polygons

  roads = query_digital_twin('roads_network', tile_bbox, version)
  trees = query_digital_twin('vegetation_trees', tile_bbox, version)
  water = query_digital_twin('water_bodies', tile_bbox, version)
  hazards = query_digital_twin('hazard_zones', tile_bbox, version)

  # Compose single structure
  composed_tile = {
    'rasters': {
      'elevation': elevation,
      'slope': slope,
      'aspect': aspect,
      'landcover': landcover,
      'population': population
    },
    'vectors': {
      'buildings': buildings,
      'roads': roads,
      'trees': trees,
      'water': water,
      'hazards': hazards
    },
    'metadata': {
      'tile_id': tile_id,
      'bounds': tile_bbox,
      'coverage_tier': tile_coverage_tier,
      'timestamp': timestamp,
      'version': version
    }
  }

  return composed_tile
```

## Index Building

B-tree structure maps tile_id to byte offset in PMTiles archive:

```
build_tile_index(tile_list):
  index = {}
  offset = 0

  for tile_id in sorted(tile_list):
    tile_size = len(serialize(tiles[tile_id]))
    index[tile_id] = {
      'offset': offset,
      'size': tile_size,
      'hash': hash(tiles[tile_id])
    }
    offset += tile_size

  # Serialize index to JSON
  index_json = json.dumps(index)
  index_offset = offset

  # Write to archive
  archive = Archive()
  for tile_id in sorted(tile_list):
    archive.write_at(index[tile_id]['offset'], serialize(tiles[tile_id]))
  archive.write_at(index_offset, index_json)

  return archive
```

Clients can load index_json without downloading entire file, then fetch specific tiles by offset.

## Hash Computation

Per-tile content hash for change detection:

```
compute_tile_hash(composed_tile):
  # Serialize in canonical form (sorted keys, normalized geometry)
  canonical = {
    'rasters': sorted_by_key(composed_tile['rasters']),
    'vectors': sorted_by_key(composed_tile['vectors'])
  }
  serialized = json.dumps(canonical, sort_keys=True)

  return hashlib.sha256(serialized).hexdigest()
```

Used to detect if new tile differs from old. If hash identical, skip compression and delta generation (tile unchanged).

## Compression: Zstandard

Apply Zstandard compression at level 19 (slowest, best compression).

```
compress_tile_zstd(uncompressed_bytes, level=19):
  # Estimate compression ratio from tile type
  if tile['coverage_tier'] == 'full':
    expected_ratio = 0.26
  elif tile['coverage_tier'] == 'enhanced':
    expected_ratio = 0.29
  else:
    expected_ratio = 0.47

  compressed = zstd.compress(uncompressed_bytes, level=level)

  # Verify ratio is within expected bounds
  ratio = len(compressed) / len(uncompressed_bytes)
  if ratio > expected_ratio * 1.2:
    log_warning(f"Compression ratio {ratio:.2%} worse than expected")

  return compressed
```

## PMTiles Archive Generation

Combine all compressed tiles + index into single cloud-optimized file:

```
generate_pmtiles_archive(compressed_tiles, index, region_id):
  pmtiles_file = f"beacon-atlas-{region_id}-v{version}.pmtiles"

  with open(pmtiles_file, 'wb') as f:
    # Header
    f.write(b'PMTiles')  # Magic bytes
    f.write(version_bytes)  # Format version
    f.write(root_dir_offset)
    f.write(root_dir_length)
    f.write(json_metadata_offset)
    f.write(json_metadata_length)

    # Leaf directories (B-tree nodes)
    leaf_offsets = []
    for leaf_chunk in chunks(sorted(compressed_tiles), 256):
      leaf_offset = f.tell()
      for tile_id, tile_bytes in leaf_chunk:
        f.write(tile_id.encode())
        f.write(len(tile_bytes).to_bytes(4, 'big'))
        f.write(tile_bytes)
      leaf_offsets.append(leaf_offset)

    # Root directory (references leaves)
    root_offset = f.tell()
    for leaf_id, leaf_offset in enumerate(leaf_offsets):
      f.write(leaf_id.to_bytes(2, 'big'))
      f.write(leaf_offset.to_bytes(8, 'big'))

    # JSON metadata (tile count, bounds, version)
    metadata = {
      'tileset': f'Beacon {region_id}',
      'version': version,
      'tile_count': len(compressed_tiles),
      'bounds': [min_lon, min_lat, max_lon, max_lat],
      'center': [(min_lon + max_lon) / 2, (min_lat + max_lat) / 2],
      'minzoom': 0,
      'maxzoom': 20,
      'type': 'overlay'
    }
    json_offset = f.tell()
    f.write(json.dumps(metadata).encode())

  return pmtiles_file
```

## Delta Tile Computation

Binary diff between old and new tile versions:

```
compute_delta_tiles(old_hashes, new_hashes):
  deltas = {}

  for tile_id in new_hashes:
    old_hash = old_hashes.get(tile_id)
    new_hash = new_hashes[tile_id]

    if old_hash == new_hash:
      continue  # No change

    if old_hash is None:
      deltas[tile_id] = ('new', new_tiles[tile_id])  # New tile
    else:
      # Compute binary diff
      old_bytes = old_tiles[tile_id]
      new_bytes = new_tiles[tile_id]
      delta_bytes = bsdiff4.diff(old_bytes, new_bytes)
      deltas[tile_id] = ('delta', delta_bytes)

  # Package deltas per version pair
  for old_v, new_v in version_pairs:
    delta_archive = f"deltas/v{old_v}-to-v{new_v}.zstd"
    archive_deltas(deltas, output=delta_archive)

  return delta_archive
```

Typical delta size: 50-150KB per changed tile (5-15% of 1MB tile).

## Validation

Ensure generated tiles are correct:

```
validate_tile_integrity(generated_pmtiles):
  # Check header
  header = read_pmtiles_header(generated_pmtiles)
  assert header['magic'] == b'PMTiles'

  # Check root directory
  root_dir = read_pmtiles_directory(header['root_dir_offset'])
  assert len(root_dir) > 0

  # Spot-check 10 random tiles
  for _ in range(10):
    tile_id = random.choice(root_dir.keys())
    tile_bytes = read_pmtiles_tile(generated_pmtiles, tile_id)

    # Decompress and validate
    try:
      decompressed = zstd.decompress(tile_bytes)
      tile_data = json.loads(decompressed)
      assert 'rasters' in tile_data or 'vectors' in tile_data
    except Exception as e:
      raise TileValidationError(f"Tile {tile_id} corrupt: {e}")

  # Check metadata
  metadata = read_pmtiles_metadata(header)
  assert metadata['tile_count'] == len(root_dir)

  return True
```

Failed tiles abort promotion (do not proceed to live).

## Processing Load

Batch processing per update (e.g., 5 changed tiles in N45W090 region):

| Stage | Per-Tile Time | Total (5 tiles) | Per-Region |
|-------|---------------|-----------------|-----------|
| Compose layers | 30 sec | 2.5 min | 1 min + per-tile |
| Build index | ~10ms | 10ms | 5 min/1M tiles |
| Hash computation | 1 sec | 5 sec | 10 min/1M tiles |
| Zstandard compression | 5 sec | 25 sec | 1 hour/1M tiles |
| Generate PMTiles | ~100ms | 100ms | 10 min/1M tiles |
| Delta computation | 2 sec | 10 sec | 5 min changed tiles |
| Validation | 500ms | 2.5 sec | 10 min/1M tiles |
| **Total Elapsed** | ~40 sec | 3.5 min | **~2 hours (full continental)** |

Parallel processing: compose/compress run in parallel across tiles. Total time dominates: 1 hour to generate all continent tiles, another hour to promote + archive.

## Output Location

Generated tiles written to: `s3://beacon-atlas/live/tiles/{region}/{tile_id}-v{version}.pmtiles`

Versioned naming allows old versions to coexist (fallback if new version has bugs).

Archive old versions after 1 week: move to `s3://beacon-atlas/archive/tiles/{region}/v{old_version}/` with Glacier Deep Archive storage class.
