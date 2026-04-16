#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
../../lib/check-tools.sh
for s in 01-download.sh 02-convert.sh 03-tile.sh 04-pmtiles.sh; do
  echo "--- us/$s ---"
  bash "./$s"
done
echo "done: us/out/beacon-us.pmtiles"
