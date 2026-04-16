#!/usr/bin/env bash
# Shapefile -> GeoJSON (WGS84) via ogr2ogr. One file per layer.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data/geojson
node -e "require('./layers.json').layers.forEach(l=>console.log(l.name))" \
| while read -r name; do
  out="data/geojson/${name}.geojson"
  if [ -s "$out" ]; then
    echo "skip $name"
    continue
  fi
  shp=$(find "data/${name}" -maxdepth 2 -iname '*.shp' | head -1)
  if [ -z "$shp" ]; then
    echo "missing shp for $name" >&2
    exit 1
  fi
  echo "convert $name"
  ogr2ogr -f GeoJSON -t_srs EPSG:4326 -makevalid "$out" "$shp"
done
