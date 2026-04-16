#!/usr/bin/env bash
# Download world vector sources from Natural Earth 10m.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data
node -e "require('./layers.json').layers.forEach(l=>console.log(l.name+'\t'+l.source))" \
| while IFS=$'\t' read -r name url; do
  zip="data/${name}.zip"
  dir="data/${name}"
  if [ -d "$dir" ] && [ -n "$(ls "$dir" 2>/dev/null || true)" ]; then
    echo "skip $name"
    continue
  fi
  echo "fetch $name"
  curl -fL --retry 3 -o "$zip" "$url"
  mkdir -p "$dir"
  unzip -q -o "$zip" -d "$dir"
done
