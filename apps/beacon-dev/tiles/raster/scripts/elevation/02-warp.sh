#!/usr/bin/env bash
# Warp all elevation sources to the common EPSG:3857 10m grid.
# Produces two VRTs (virtual rasters) — one for GLO-30, one for 3DEP.
set -euo pipefail
cd "$(dirname "$0")/../.."
source lib/grid.sh

mkdir -p data/elevation/warped

# --- GLO-30 → single VRT → warp to grid ---
echo "building GLO-30 VRT"
gdalbuildvrt -overwrite data/elevation/glo30.vrt data/elevation/glo30/*.tif

echo "warping GLO-30 to $GRID_CRS ${GRID_RES_M}m"
gdalwarp \
  $(grid_warp_flags) \
  -dstnodata -9999 \
  data/elevation/glo30.vrt \
  data/elevation/warped/glo30_3857.tif

# --- 3DEP → single VRT → warp to grid ---
if [ -d data/elevation/3dep ] && ls data/elevation/3dep/*.tif >/dev/null 2>&1; then
  echo "building 3DEP VRT"
  gdalbuildvrt -overwrite data/elevation/3dep.vrt data/elevation/3dep/*.tif

  echo "warping 3DEP to $GRID_CRS ${GRID_RES_M}m"
  gdalwarp \
    $(grid_warp_flags) \
    -dstnodata -9999 \
    data/elevation/3dep.vrt \
    data/elevation/warped/3dep_3857.tif
else
  echo "no 3DEP tiles found; skipping (global-only build)"
fi
