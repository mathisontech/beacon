#!/usr/bin/env bash
# Download US vector sources. Skips layers flagged manual.
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p data
jq -c '.layers[]' layers.json | while read -r row; do
  name=$(echo "$row" | jq -r .name)
  manual=$(echo "$row" | jq -r '.manual // false')
  dir="data/${name}"
  if [ "$manual" = "true" ]; then
    if [ -d "$dir" ] && [ -n "$(ls "$dir" 2>/dev/null || true)" ]; then
      echo "skip $name (manual, present)"
    else
      echo "manual $name: $(echo "$row" | jq -r .how)"
    fi
    continue
  fi
  if [ -d "$dir" ] && [ -n "$(ls "$dir" 2>/dev/null || true)" ]; then
    echo "skip $name"
    continue
  fi
  url=$(echo "$row" | jq -r .source)
  zip="data/${name}.zip"
  echo "fetch $name"
  if ! curl -fL --retry 3 -o "$zip" "$url"; then
    echo "warn: $name download failed; skipping" >&2
    rm -f "$zip"
    continue
  fi
  mkdir -p "$dir"
  unzip -q -o "$zip" -d "$dir"
done
