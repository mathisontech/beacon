#!/usr/bin/env bash
# Shapefile -> GeoJSON (one file per layer, EPSG:4326).
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data/geojson
node -e "
const ls=require('./layers.json').layers;
for (const l of ls) {
  const dir = 'data/' + require('path').basename(l.source, '.zip');
  process.stdout.write(l.name + '|' + dir + '\n');
}
" | while IFS='|' read -r name dir; do
  [ -z "$name" ] && continue
  shp=$(find "$dir" -maxdepth 1 -name '*.shp' | head -n1)
  if [ -z "$shp" ]; then
    echo "no shp for $name in $dir" >&2
    exit 1
  fi
  out="data/geojson/${name}.geojson"
  echo "convert $name"
  ogr2ogr -f GeoJSON -t_srs EPSG:4326 "$out" "$shp"
done
