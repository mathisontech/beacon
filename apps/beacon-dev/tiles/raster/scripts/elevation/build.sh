#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for s in 01-download-glo30.sh 01-download-3dep.sh 02-warp.sh 03-merge.sh 04-derive.sh 05-encode.sh 06-tile.sh; do
  echo "--- elevation/$s ---"
  bash "./$s"
done
echo "done: elevation, slope, aspect, tpi PMTiles in raster/out/"
