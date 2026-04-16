#!/usr/bin/env bash
# Generate raster tile pyramid from a terrain-RGB or categorical TIFF.
# Outputs tile dir, then packs to PMTiles.
#
# Usage: bash tile_raster.sh input.tif output.pmtiles [minzoom] [maxzoom]
set -euo pipefail

input="$1"
output="$2"
minz="${3:-0}"
maxz="${4:-17}"
tmp_dir=$(mktemp -d)
ncpu=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)

echo "gdal2tiles → $tmp_dir (z${minz}-${maxz}, ${ncpu} cores)"
gdal2tiles.py \
  -z "${minz}-${maxz}" \
  --tilesize=1024 \
  --processes="$ncpu" \
  -w none \
  --xyz \
  "$input" "$tmp_dir"

echo "packing → $output"
pmtiles convert "$tmp_dir" "$output" --force
pmtiles verify "$output"

rm -rf "$tmp_dir"
echo "done: $output"
