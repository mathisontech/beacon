#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
../../lib/check-tools.sh
for s in 01-merge-tiles.sh 02-to-pmtiles.sh 03-discrepancy.sh; do
  echo "--- merge/$s ---"
  bash "./$s"
done
echo "done: merge/out/beacon-merged.pmtiles"
