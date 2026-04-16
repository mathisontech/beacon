#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

pmtiles convert out/beacon-world.mbtiles out/beacon-world.pmtiles --force
pmtiles verify out/beacon-world.pmtiles
echo "wrote out/beacon-world.pmtiles"
