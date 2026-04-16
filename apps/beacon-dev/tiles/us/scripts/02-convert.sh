#!/usr/bin/env bash
# Shapefile/GDB -> GeoJSON (WGS84). Skips layer if source dir empty.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data/geojson
jq -r '.layers[].name' layers.json | while read -r name; do
  out="data/geojson/${name}.geojson"
  if [ -s "$out" ]; then
    echo "skip $name"
    continue
  fi
  if [ ! -d "data/${name}" ]; then
    echo "missing data/${name} — skipping"
    continue
  fi
  src_shp=$( { find "data/${name}" -maxdepth 4 -iname '*.shp' 2>/dev/null || true; } | head -1 )
  src_gdb=$( { find "data/${name}" -maxdepth 3 -iname '*.gdb' -type d 2>/dev/null || true; } | head -1 )
  if [ -n "$src_shp" ]; then
    echo "convert $name (shp)"
    ogr2ogr -f GeoJSON -t_srs EPSG:4326 -makevalid "$out" "$src_shp"
  elif [ -n "$src_gdb" ]; then
    echo "convert $name (gdb)"
    ogr2ogr -f GeoJSON -t_srs EPSG:4326 -makevalid "$out" "$src_gdb"
  else
    echo "missing source for $name — skipping" >&2
  fi
done
