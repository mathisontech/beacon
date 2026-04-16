#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

for step in 01-download.sh 02-convert.sh 03-tile.sh 04-pmtiles.sh; do
  echo "--- $step ---"
  bash "./$step"
done

echo "done: ../out/beacon-basemap.pmtiles"
