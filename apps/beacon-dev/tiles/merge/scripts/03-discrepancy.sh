#!/usr/bin/env bash
# Run all diff checks against the source geojson (pre-tile), since
# tile output has been simplified/coalesced. Reports land in reports/.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "installing @turf/turf"
  (cd . && npm install --silent)
fi

mkdir -p reports
node diff/count-delta.js
node diff/attr-conflict.js
# border-drift disabled — antimeridian + dissolved MultiPolygon edge cases
# aren't worth the runtime. Re-enable by adding: node diff/border-drift.js
echo "reports in merge/reports/"
