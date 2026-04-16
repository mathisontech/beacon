#!/usr/bin/env bash
# Tile GeoJSON layers into a single MBTiles archive.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p out
minz=$(node -e "console.log(Math.min(...require('./layers.json').layers.map(l=>l.minzoom)))")
maxz=$(node -e "console.log(Math.max(...require('./layers.json').layers.map(l=>l.maxzoom)))")

set -- --force \
       --minimum-zoom="$minz" \
       --maximum-zoom="$maxz" \
       --drop-densest-as-needed \
       --coalesce-densest-as-needed \
       --extend-zooms-if-still-dropping \
       --maximum-tile-bytes=1000000 \
       --simplification=10 \
       --no-tile-compression \
       -o out/beacon-world.mbtiles

for name in $(node -e "require('./layers.json').layers.forEach(l=>console.log(l.name))"); do
  set -- "$@" -L "${name}:data/geojson/${name}.geojson"
done

echo "tippecanoe -> out/beacon-world.mbtiles"
tippecanoe "$@"
