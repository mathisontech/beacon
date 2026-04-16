#!/usr/bin/env bash
# Download Copernicus GLO-30 DEM tiles from AWS open data.
# No credentials needed — public bucket (requester pays = false for this one).
# Downloads only the 1°x1° COGs that cover land.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p data/elevation/glo30
BUCKET="s3://copernicus-dem-30m"
MANIFEST="data/elevation/glo30/manifest.txt"

if [ -s "$MANIFEST" ]; then
  echo "glo30 manifest exists, skipping S3 list"
else
  echo "listing GLO-30 tiles (takes ~30s)"
  aws s3 ls "$BUCKET/" --no-sign-request --recursive \
    | grep '_DEM.tif$' \
    | awk '{print $4}' > "$MANIFEST"
  echo "$(wc -l < "$MANIFEST" | tr -d ' ') tiles listed"
fi

total=$(wc -l < "$MANIFEST" | tr -d ' ')
done=0
while read -r key; do
  fname=$(basename "$key")
  out="data/elevation/glo30/$fname"
  if [ -s "$out" ]; then
    done=$((done + 1))
    continue
  fi
  aws s3 cp "$BUCKET/$key" "$out" --no-sign-request --quiet
  done=$((done + 1))
  if [ $((done % 500)) -eq 0 ]; then
    echo "  $done / $total"
  fi
done < "$MANIFEST"
echo "glo30: $total tiles in data/elevation/glo30/"
