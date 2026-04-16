#!/usr/bin/env bash
# Verify CLI deps are present. Fails fast with install hint.
set -euo pipefail

want=(curl unzip node ogr2ogr tippecanoe pmtiles jq)
missing=()
for cmd in "${want[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    missing+=("$cmd")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "missing: ${missing[*]}" >&2
  echo "install: brew install gdal tippecanoe pmtiles jq node" >&2
  exit 1
fi
