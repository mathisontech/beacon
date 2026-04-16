#!/usr/bin/env python3
"""Validate that two raster layers are pixel-aligned.

Checks: CRS, transform (origin + pixel size), shape.
Usage: python3 validate_alignment.py layer_a.tif layer_b.tif
"""
import sys
import rasterio

def check(a_path, b_path):
    with rasterio.open(a_path) as a, rasterio.open(b_path) as b:
        errors = []
        if a.crs != b.crs:
            errors.append(f"CRS mismatch: {a.crs} vs {b.crs}")
        if a.transform != b.transform:
            errors.append(f"transform mismatch:\n  {a.transform}\n  vs\n  {b.transform}")
        if a.shape != b.shape:
            errors.append(f"shape mismatch: {a.shape} vs {b.shape}")
        if errors:
            for e in errors:
                print(f"FAIL: {e}")
            return False
        print(f"OK: {a_path} aligns with {b_path}")
        return True

if __name__ == '__main__':
    ok = check(sys.argv[1], sys.argv[2])
    sys.exit(0 if ok else 1)
