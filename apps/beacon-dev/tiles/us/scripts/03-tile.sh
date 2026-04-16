#!/usr/bin/env bash
# Tile US GeoJSON layers into a single MBTiles. Layers with missing
# geojson are skipped with a warning (manual downloads may be pending).
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p out
minz=$(jq '[.layers[].minzoom] | min' layers.json)
maxz=$(jq '[.layers[].maxzoom] | max' layers.json)

set -- --force \
       --minimum-zoom="$minz" \
       --maximum-zoom="$maxz" \
       --coalesce-densest-as-needed \
       --extend-zooms-if-still-dropping \
       --no-tile-compression \
       -o out/beacon-us.mbtiles

present=0
for name in $(jq -r '.layers[].name' layers.json); do
  f="data/geojson/${name}.geojson"
  if [ ! -s "$f" ]; then
    echo "skip $name (no geojson)" >&2
    continue
  fi
  set -- "$@" -L "${name}:${f}"
  present=$((present+1))
done

if [ "$present" -eq 0 ]; then
  echo "no us layers to tile" >&2
  exit 1
fi

echo "tippecanoe -> out/beacon-us.mbtiles ($present layers)"
tippecanoe "$@"
