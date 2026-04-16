#!/usr/bin/env bash
# Cut encoded rasters into raster PMTiles archives.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p out

for name in elevation slope aspect tpi; do
  src="data/elevation/encoded/${name}_rgb.tif"
  dst="out/${name}.pmtiles"
  if [ ! -s "$src" ]; then
    echo "skip $name (no encoded tif)"
    continue
  fi
  echo "tiling $name"
  bash lib/tile_raster.sh "$src" "$dst" 0 17
done
