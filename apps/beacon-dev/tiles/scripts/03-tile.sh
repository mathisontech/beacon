#!/usr/bin/env bash
# tippecanoe: merge all GeoJSON layers into one MBTiles archive.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p out
args=()
node -e "
for (const l of require('./layers.json').layers) {
  process.stdout.write('-L|' + l.name + ':data/geojson/' + l.name + '.geojson|--minimum-zoom=' + l.minzoom + '|--maximum-zoom=' + l.maxzoom + '\n');
}
" | while IFS='|' read -r flag value minz maxz; do
  [ -z "$flag" ] && continue
  echo "${flag} ${value} ${minz} ${maxz}" >> /tmp/tt-args
done

# tippecanoe supports repeated -L name:file; zooms are per-run not
# per-layer, so pick the widest range (min of mins, max of maxes).
minz=$(node -e "console.log(Math.min(...require('./layers.json').layers.map(l=>l.minzoom)))")
maxz=$(node -e "console.log(Math.max(...require('./layers.json').layers.map(l=>l.maxzoom)))")

set -- --force \
       --minimum-zoom="$minz" \
       --maximum-zoom="$maxz" \
       --coalesce-densest-as-needed \
       --extend-zooms-if-still-dropping \
       -o out/beacon-basemap.mbtiles

for l in $(node -e "require('./layers.json').layers.forEach(l=>console.log(l.name))"); do
  set -- "$@" -L "$l:data/geojson/$l.geojson"
done

echo "tippecanoe -> out/beacon-basemap.mbtiles"
tippecanoe "$@"
