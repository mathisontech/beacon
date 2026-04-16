#!/usr/bin/env bash
# Master build: all raster layers → unified tile stack in out/.
# Usage: bash build.sh [region_name]   (default: la_county)
# Regions defined in lib/regions.json.
set -euo pipefail
cd "$(dirname "$0")"

REGION="${1:-la_county}"
BBOX=$(python3 -c "import json; r=json.load(open('lib/regions.json'))['$REGION']['bbox']; print(f'{r[0]} {r[1]} {r[2]} {r[3]}')")
export BBOX
echo "region: $REGION ($BBOX)"

# Prereqs
command -v gdalwarp >/dev/null   || { echo "missing gdal" >&2; exit 1; }
command -v python3 >/dev/null    || { echo "missing python3" >&2; exit 1; }
command -v pmtiles >/dev/null    || { echo "missing pmtiles" >&2; exit 1; }
python3 -c "import rasterio" 2>/dev/null || { echo "missing rasterio: pip3 install rasterio numpy scipy --break-system-packages" >&2; exit 1; }

echo "=== ELEVATION + SLOPE + ASPECT + TPI ==="
bash scripts/elevation/build.sh

echo "=== LANDCOVER ==="
bash scripts/landcover/build.sh

echo "=== FUEL MODEL ==="
bash scripts/fuel/build.sh

echo "=== DISTANCE LAYERS ==="
bash scripts/distance/build.sh

echo "=== VALIDATION ==="
python3 lib/validate_stack.py

echo "=== MANIFEST ==="
python3 lib/write_manifest.py

echo "done — all raster PMTiles in raster/out/"
