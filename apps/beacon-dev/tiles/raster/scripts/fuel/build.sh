#!/usr/bin/env bash
# Build unified fuel model layer: LANDFIRE FM40 (US) + WorldCover→FM40 LUT (global).
set -euo pipefail
cd "$(dirname "$0")/../.."
source lib/grid.sh

mkdir -p data/fuel out

# --- LANDFIRE FM40 (US) ---
FM40="data/fuel/lf_fm40.tif"
if [ ! -s "$FM40" ]; then
  echo "LANDFIRE FM40 requires manual download."
  echo "Go to https://landfire.gov/fuel.php → FBFM40 → download CONUS GeoTIFF"
  echo "Save as $FM40"
  echo "Then rerun this script."
fi

# --- Global fallback from WorldCover ---
WC="data/landcover/worldcover_3857.tif"
FM40_GLOBAL="data/fuel/fm40_global.tif"
FM40_US="data/fuel/fm40_us_3857.tif"
FM40_MERGED="data/fuel/fm40_merged.tif"

if [ ! -s "$WC" ]; then
  echo "error: build landcover layer first" >&2
  exit 1
fi

echo "applying WorldCover→FM40 LUT (global fallback)"
python3 - <<'PYEOF'
import rasterio, json, numpy as np

with open("lib/worldcover-to-fm40.json") as f:
    lut_raw = json.load(f)
lut = {int(k): v["fm40"] for k, v in lut_raw.items() if k != "_doc"}

with rasterio.open("data/landcover/worldcover_3857.tif") as src:
    wc = src.read(1)
    profile = src.profile.copy()

fm = np.zeros_like(wc, dtype=np.uint8)
for wc_class, fm40_class in lut.items():
    fm[wc == wc_class] = fm40_class

profile.update(dtype='uint8', count=1, nodata=0, compress='deflate')
with rasterio.open("data/fuel/fm40_global.tif", 'w', **profile) as dst:
    dst.write(fm, 1)
print("fm40_global done")
PYEOF

# --- Merge: LANDFIRE over global ---
if [ -s "$FM40" ]; then
  echo "warping LANDFIRE FM40 to grid"
  gdalwarp \
    $(grid_warp_flags_nearest) \
    -dstnodata 0 \
    "$FM40" "$FM40_US"

  echo "merging LANDFIRE over global"
  python3 lib/merge_priority.py "$FM40_US" "$FM40_GLOBAL" "$FM40_MERGED"
else
  echo "no LANDFIRE; using global fallback only"
  cp "$FM40_GLOBAL" "$FM40_MERGED"
fi

echo "tiling"
bash lib/tile_raster.sh "$FM40_MERGED" out/fuel_model.pmtiles 0 17
