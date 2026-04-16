#!/usr/bin/env bash
# Top-level orchestrator. Run world, then us, then merge.
set -euo pipefail
cd "$(dirname "$0")"

./lib/check-tools.sh

echo "=== WORLD ==="
bash world/scripts/build.sh

echo "=== US ==="
bash us/scripts/build.sh

echo "=== MERGE ==="
bash merge/scripts/build.sh

echo "all outputs:"
ls -lh world/out/beacon-world.pmtiles us/out/beacon-us.pmtiles merge/out/beacon-merged.pmtiles 2>/dev/null || true
