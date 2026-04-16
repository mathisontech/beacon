#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pmtiles convert out/beacon-us.mbtiles out/beacon-us.pmtiles --force
pmtiles verify out/beacon-us.pmtiles
echo "wrote out/beacon-us.pmtiles"
