#!/usr/bin/env bash
# Combine world + us MBTiles into one archive via tile-join.
# Layer names are disjoint (world: land/countries/states/...; us: us_*)
# so no rename is needed. Zoom range is the union.
set -euo pipefail
cd "$(dirname "$0")/.."

world="../world/out/beacon-world.mbtiles"
us="../us/out/beacon-us.mbtiles"
out="out/beacon-merged.mbtiles"

mkdir -p out

for f in "$world" "$us"; do
  if [ ! -s "$f" ]; then
    echo "missing $f — build that archive first" >&2
    exit 1
  fi
done

tile-join --force -o "$out" "$world" "$us"
echo "wrote $out"
