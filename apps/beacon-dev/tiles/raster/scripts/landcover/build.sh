#!/usr/bin/env bash
# Download ESA WorldCover 10m, warp to grid, tile as categorical PMTiles.
set -euo pipefail
cd "$(dirname "$0")/../.."
source lib/grid.sh

mkdir -p data/landcover out

# --- Download ---
BUCKET="s3://esa-worldcover/v200/2021/map"
MANIFEST="data/landcover/manifest.txt"

if [ -s "$MANIFEST" ]; then
  echo "worldcover manifest exists"
else
  echo "listing WorldCover tiles"
  aws s3 ls "$BUCKET/" --no-sign-request --recursive \
    | grep '_Map.tif$' \
    | awk '{print $4}' > "$MANIFEST"
  echo "$(wc -l < "$MANIFEST" | tr -d ' ') tiles"
fi

total=$(wc -l < "$MANIFEST" | tr -d ' ')
done=0
while read -r key; do
  fname=$(basename "$key")
  out_f="data/landcover/$fname"
  [ -s "$out_f" ] && { done=$((done+1)); continue; }
  aws s3 cp "s3://esa-worldcover/$key" "$out_f" --no-sign-request --quiet
  done=$((done+1))
  [ $((done % 100)) -eq 0 ] && echo "  $done / $total"
done < "$MANIFEST"

# --- VRT + warp ---
echo "building VRT"
gdalbuildvrt -overwrite data/landcover/worldcover.vrt data/landcover/*_Map.tif

echo "warping to grid (nearest neighbor for categorical)"
gdalwarp \
  $(grid_warp_flags_nearest) \
  -dstnodata 0 \
  data/landcover/worldcover.vrt \
  data/landcover/worldcover_3857.tif

# --- Tile ---
# Categorical — use nearest resampling in gdal2tiles.
# Encode as grayscale PNG (class IDs 0-100).
echo "tiling"
bash lib/tile_raster.sh data/landcover/worldcover_3857.tif out/landcover.pmtiles 0 17
