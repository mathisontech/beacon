#!/usr/bin/env bash
# Derive slope, aspect, TPI from the merged elevation raster.
# HAND requires HydroSHEDS flowlines — built separately.
set -euo pipefail
cd "$(dirname "$0")/../.."

elev="data/elevation/merged/elevation.tif"
mkdir -p data/elevation/derived

# Slope (degrees)
echo "computing slope"
gdaldem slope "$elev" data/elevation/derived/slope.tif \
  -compute_edges -co COMPRESS=DEFLATE -co TILED=YES

# Aspect (degrees, 0=north, clockwise)
echo "computing aspect"
gdaldem aspect "$elev" data/elevation/derived/aspect.tif \
  -compute_edges -zero_for_flat -co COMPRESS=DEFLATE -co TILED=YES

# TPI (Topographic Position Index): cell minus mean of surrounding ring.
# GDAL doesn't have a TPI mode in gdaldem, so we use python.
echo "computing TPI"
python3 - <<'PYEOF'
import rasterio
import numpy as np
from scipy.ndimage import uniform_filter

RADIUS_PX = 150  # 150 pixels * 1 m = 150 m ring (300 m diameter)

with rasterio.open("data/elevation/merged/elevation.tif") as src:
    elev = src.read(1).astype(np.float32)
    profile = src.profile.copy()

mean = uniform_filter(elev, size=2*RADIUS_PX+1)
tpi = elev - mean

profile.update(dtype='float32', count=1, nodata=None, compress='deflate')
with rasterio.open("data/elevation/derived/tpi.tif", 'w', **profile) as dst:
    dst.write(tpi, 1)
print("tpi done")
PYEOF

echo "derived layers in data/elevation/derived/"
