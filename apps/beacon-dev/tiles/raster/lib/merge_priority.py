#!/usr/bin/env python3
"""Merge two aligned rasters by priority: high-res patches onto global base.

Where hi has valid data (not nodata), hi wins. Otherwise lo fills.
Both inputs must be pixel-aligned (same CRS, transform, shape).

Usage: python3 merge_priority.py hi.tif lo.tif out.tif
"""
import sys
import numpy as np
import rasterio

def merge(hi_path, lo_path, out_path):
    with rasterio.open(hi_path) as hi_ds, rasterio.open(lo_path) as lo_ds:
        assert hi_ds.shape == lo_ds.shape, "shape mismatch"
        assert hi_ds.crs == lo_ds.crs, "crs mismatch"

        profile = lo_ds.profile.copy()
        profile.update(compress='deflate', tiled=True, blockxsize=512, blockysize=512)

        hi_nodata = hi_ds.nodata
        lo_nodata = lo_ds.nodata

        with rasterio.open(out_path, 'w', **profile) as dst:
            for band in range(1, lo_ds.count + 1):
                lo = lo_ds.read(band)
                hi = hi_ds.read(band)

                # Where hi has valid data, use it; otherwise use lo.
                if hi_nodata is not None:
                    mask = hi != hi_nodata
                else:
                    mask = np.isfinite(hi)

                out = lo.copy()
                out[mask] = hi[mask]

                # Fill remaining nodata with 0 (no gaps allowed).
                if lo_nodata is not None:
                    still_nodata = out == lo_nodata
                    out[still_nodata] = 0

                dst.write(out, band)

    print(f"merged → {out_path}")

if __name__ == '__main__':
    merge(sys.argv[1], sys.argv[2], sys.argv[3])
