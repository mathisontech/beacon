#!/usr/bin/env python3
"""Encode a single-band float32 GeoTIFF as terrain-RGB PNG-compatible TIFF.

Usage: python3 encode_terrain_rgb.py input.tif output.tif [scale] [offset]

Default scale=0.1, offset=-10000 (Mapbox terrain-RGB compat).
value = (R * 65536 + G * 256 + B) * scale + offset
"""
import sys
import numpy as np
import rasterio
from rasterio.transform import from_bounds

def encode(in_path, out_path, scale=0.1, offset=-10000.0):
    with rasterio.open(in_path) as src:
        data = src.read(1).astype(np.float64)
        nodata = src.nodata
        profile = src.profile.copy()

    # Encode: v = (value - offset) / scale, clamp to 0..16777215
    v = (data - offset) / scale
    if nodata is not None:
        mask = data == nodata
        v[mask] = 0
    v = np.clip(v, 0, 16777215).astype(np.uint32)

    r = (v >> 16).astype(np.uint8)
    g = ((v >> 8) & 0xFF).astype(np.uint8)
    b = (v & 0xFF).astype(np.uint8)

    profile.update(
        dtype='uint8',
        count=3,
        nodata=None,
        compress='deflate',
        tiled=True,
        blockxsize=512,
        blockysize=512,
    )

    with rasterio.open(out_path, 'w', **profile) as dst:
        dst.write(r, 1)
        dst.write(g, 2)
        dst.write(b, 3)

if __name__ == '__main__':
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.1
    offset = float(sys.argv[4]) if len(sys.argv) > 4 else -10000.0
    encode(in_path, out_path, scale, offset)
    print(f"encoded {out_path}")
