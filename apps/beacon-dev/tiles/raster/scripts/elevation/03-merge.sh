#!/usr/bin/env bash
# Priority merge: 3DEP over GLO-30. Where 3DEP has valid data, it wins.
# Output: data/elevation/merged/elevation.tif — globally continuous, no nodata.
set -euo pipefail
cd "$(dirname "$0")/../.."

mkdir -p data/elevation/merged

glo="data/elevation/warped/glo30_3857.tif"
dep="data/elevation/warped/3dep_3857.tif"
out="data/elevation/merged/elevation.tif"

if [ ! -s "$glo" ]; then
  echo "missing $glo" >&2
  exit 1
fi

if [ -s "$dep" ]; then
  echo "merging 3DEP over GLO-30"
  python3 lib/merge_priority.py "$dep" "$glo" "$out"
else
  echo "no 3DEP; using GLO-30 only"
  cp "$glo" "$out"
fi

# Verify no remaining nodata.
python3 -c "
import rasterio, numpy as np, sys
with rasterio.open('$out') as ds:
    for i in range(1, ds.count+1):
        d = ds.read(i)
        nd = ds.nodata
        if nd is not None and np.any(d == nd):
            print(f'WARN: band {i} has {np.sum(d==nd)} nodata cells')
            sys.exit(1)
print('elevation merge: gap-free')
"
