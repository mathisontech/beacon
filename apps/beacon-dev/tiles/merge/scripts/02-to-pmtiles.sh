#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pmtiles convert out/beacon-merged.mbtiles out/beacon-merged.pmtiles --force
pmtiles verify out/beacon-merged.pmtiles
echo "wrote out/beacon-merged.pmtiles"
