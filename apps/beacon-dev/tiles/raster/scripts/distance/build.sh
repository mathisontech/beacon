#!/usr/bin/env bash
# Build all distance layers: dist_road, dist_water, dist_coast, dist_fault.
# Requires the elevation merged raster as grid template.
set -euo pipefail
cd "$(dirname "$0")/../.."

TEMPLATE="data/elevation/merged/elevation.tif"
if [ ! -s "$TEMPLATE" ]; then
  echo "error: build elevation layer first (need grid template)" >&2
  exit 1
fi

mkdir -p out data/distance

# Each entry: layer_name geojson_path
declare -A SOURCES=(
  [dist_road]="../us/data/geojson/us_roads_primary.geojson"
  [dist_water]="../world/data/geojson/rivers.geojson"
  [dist_coast]="../world/data/geojson/coastline.geojson"
  [dist_fault]="../us/data/geojson/us_faults.geojson"
)

for name in "${!SOURCES[@]}"; do
  src="${SOURCES[$name]}"
  if [ ! -s "$src" ]; then
    echo "skip $name (no source: $src)"
    continue
  fi

  echo "--- $name ---"
  dist_tif="data/distance/${name}.tif"
  rgb_tif="data/distance/${name}_rgb.tif"

  # Rasterize + compute distance
  python3 lib/rasterize_distance.py "$src" "$TEMPLATE" "$dist_tif"

  # Encode as terrain-RGB
  python3 lib/encode_terrain_rgb.py "$dist_tif" "$rgb_tif" 1.0 0

  # Tile
  bash lib/tile_raster.sh "$rgb_tif" "out/${name}.pmtiles" 0 17
done
