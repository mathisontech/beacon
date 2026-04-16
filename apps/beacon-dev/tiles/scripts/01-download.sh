#!/usr/bin/env bash
# Pull each Natural Earth zip listed in layers.json into ./data/.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data
urls=$(node -e "console.log(require('./layers.json').layers.map(l=>l.source).join('\n'))")

while IFS= read -r url; do
  [ -z "$url" ] && continue
  fname=$(basename "$url")
  if [ -f "data/$fname" ]; then
    echo "skip $fname"
    continue
  fi
  echo "get $fname"
  curl -fsSL -o "data/$fname" "$url"
  unzip -o -q "data/$fname" -d "data/${fname%.zip}"
done <<< "$urls"
