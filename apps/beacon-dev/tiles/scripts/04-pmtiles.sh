#!/usr/bin/env bash
# Convert MBTiles -> PMTiles using the pmtiles CLI (bundled with
# tippecanoe on recent brews; otherwise install from
# https://github.com/protomaps/go-pmtiles).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v pmtiles >/dev/null 2>&1; then
  echo "pmtiles CLI not found. Install: brew install protomaps/tap/pmtiles" >&2
  exit 1
fi

pmtiles convert out/beacon-basemap.mbtiles out/beacon-basemap.pmtiles
echo "wrote out/beacon-basemap.pmtiles"
