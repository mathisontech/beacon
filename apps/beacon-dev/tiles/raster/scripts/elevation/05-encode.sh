#!/usr/bin/env bash
# Encode elevation + derived layers as terrain-RGB TIFFs.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p data/elevation/encoded

echo "encoding elevation (scale=0.1, offset=-10000)"
python3 lib/encode_terrain_rgb.py data/elevation/merged/elevation.tif data/elevation/encoded/elevation_rgb.tif 0.1 -10000

echo "encoding slope (scale=0.01, offset=0)"
python3 lib/encode_terrain_rgb.py data/elevation/derived/slope.tif data/elevation/encoded/slope_rgb.tif 0.01 0

echo "encoding aspect (scale=0.1, offset=0)"
python3 lib/encode_terrain_rgb.py data/elevation/derived/aspect.tif data/elevation/encoded/aspect_rgb.tif 0.1 0

echo "encoding tpi (scale=0.1, offset=-1000)"
python3 lib/encode_terrain_rgb.py data/elevation/derived/tpi.tif data/elevation/encoded/tpi_rgb.tif 0.1 -1000
