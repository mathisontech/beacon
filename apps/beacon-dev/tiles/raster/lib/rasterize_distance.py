#!/usr/bin/env python3
"""Rasterize a vector source then compute distance-to-nearest-feature grid.

1. Burns vector features onto an aligned raster (1 where feature, 0 elsewhere).
2. Computes Euclidean distance in meters from every pixel to nearest burned cell.
3. Output: single-band float32 GeoTIFF, values in meters.

Usage: python3 rasterize_distance.py vector.geojson template.tif out_dist.tif
       template.tif is any aligned raster (we copy its grid spec).
"""
import sys
import subprocess
import tempfile
import numpy as np
import rasterio
from osgeo import gdal

def run(vector_path, template_path, out_path):
    with rasterio.open(template_path) as tmpl:
        profile = tmpl.profile.copy()
        bounds = tmpl.bounds
        width = tmpl.width
        height = tmpl.height
        res = tmpl.res

    # Step 1: rasterize vector to binary grid.
    with tempfile.NamedTemporaryFile(suffix='.tif') as tmp:
        burn_path = tmp.name
        subprocess.run([
            'gdal_rasterize',
            '-burn', '1',
            '-init', '0',
            '-te', str(bounds.left), str(bounds.bottom), str(bounds.right), str(bounds.top),
            '-ts', str(width), str(height),
            '-ot', 'Byte',
            '-co', 'COMPRESS=DEFLATE',
            vector_path, burn_path,
        ], check=True)

        # Step 2: gdal_proximity for distance.
        ds_burn = gdal.Open(burn_path)
        drv = gdal.GetDriverByName('GTiff')
        ds_out = drv.Create(out_path, width, height, 1, gdal.GDT_Float32,
                            ['COMPRESS=DEFLATE', 'TILED=YES', 'BLOCKXSIZE=512', 'BLOCKYSIZE=512'])
        ds_out.SetGeoTransform(ds_burn.GetGeoTransform())
        ds_out.SetProjection(ds_burn.GetProjection())

        gdal.ComputeProximity(
            ds_burn.GetRasterBand(1),
            ds_out.GetRasterBand(1),
            [f'VALUES=1', f'DISTUNITS=GEO']
        )
        ds_out.FlushCache()
        ds_out = None
        ds_burn = None

    print(f"distance grid → {out_path}")

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2], sys.argv[3])
