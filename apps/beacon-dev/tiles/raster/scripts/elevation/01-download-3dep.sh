#!/usr/bin/env bash
# Download USGS 3DEP 10m DEM (1/3 arc-second) for CONUS.
# Source: USGS TNM (The National Map) via S3 open data.
# ~950 1°x1° COGs covering CONUS + AK + HI.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p data/elevation/3dep
BUCKET="s3://prd-tnm"
PREFIX="StagedProducts/Elevation/13/TIFF/current"
MANIFEST="data/elevation/3dep/manifest.txt"

if [ -s "$MANIFEST" ]; then
  echo "3dep manifest exists, skipping S3 list"
else
  echo "listing 3DEP tiles (takes ~30s)"
  aws s3 ls "$BUCKET/$PREFIX/" --no-sign-request --recursive \
    | grep '\.tif$' \
    | grep -v '_thumb' \
    | awk '{print $4}' > "$MANIFEST"
  echo "$(wc -l < "$MANIFEST" | tr -d ' ') tiles listed"
fi

total=$(wc -l < "$MANIFEST" | tr -d ' ')
done=0
while read -r key; do
  fname=$(basename "$key")
  out="data/elevation/3dep/$fname"
  if [ -s "$out" ]; then
    done=$((done + 1))
    continue
  fi
  aws s3 cp "$BUCKET/$key" "$out" --no-sign-request --quiet
  done=$((done + 1))
  if [ $((done % 100)) -eq 0 ]; then
    echo "  $done / $total"
  fi
done < "$MANIFEST"
echo "3dep: $total tiles in data/elevation/3dep/"
