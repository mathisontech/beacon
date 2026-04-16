#!/usr/bin/env python3
"""
Add Hawaii and Alaska Grids
===========================

Extends the existing continental US grid system to include Hawaii and Alaska.
"""

import sqlite3
from gridmap_squares import SimpleGridCoverage
from cartopy_us_filter import CartopyUSFilter
import math

def add_hawaii_alaska_grids():
    """Add Hawaii and Alaska grids to the existing database"""

    # Initialize the coverage system (this will use the new expanded bounds)
    print("🗺️ Initializing expanded grid system...")
    coverage_system = SimpleGridCoverage()

    # Initialize the Cartopy filter for Hawaii/Alaska detection
    print("🌺 Loading Hawaii and Alaska boundary data...")
    us_filter = CartopyUSFilter()

    # Calculate grid dimensions using the same method as original system
    lat_range = coverage_system.bounds['lat_max'] - coverage_system.bounds['lat_min']
    lng_range = coverage_system.bounds['lng_max'] - coverage_system.bounds['lng_min']

    # Calculate number of grids (using same logic as original)
    avg_lat = (coverage_system.bounds['lat_min'] + coverage_system.bounds['lat_max']) / 2
    lat_km_per_degree = 111.32
    lng_km_per_degree = 111.32 * math.cos(math.radians(avg_lat))

    grids_lat = int(lat_range / (coverage_system.grid_size_km / lat_km_per_degree))
    grids_lng = int(lng_range / (coverage_system.grid_size_km / lng_km_per_degree))

    lat_step = lat_range / grids_lat
    lng_step = lng_range / grids_lng

    print(f"📊 Grid system dimensions: {grids_lng} x {grids_lat} = {grids_lng * grids_lat:,} total grids")

    # Check how many grids already exist
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('SELECT COUNT(*) FROM grid_squares')
        existing_count = cursor.fetchone()[0]
        print(f"📋 Existing grids: {existing_count:,}")

    # Generate all grids and filter for Hawaii/Alaska only
    hawaii_alaska_grids = []
    total_generated = 0

    print("🏝️ Generating Hawaii and Alaska grids...")

    for grid_y in range(grids_lat):
        for grid_x in range(grids_lng):
            lat_min = coverage_system.bounds['lat_min'] + (grid_y * lat_step)
            lat_max = lat_min + lat_step
            lng_min = coverage_system.bounds['lng_min'] + (grid_x * lng_step)
            lng_max = lng_min + lng_step

            total_generated += 1

            # Check if this grid is in Hawaii or Alaska region
            center_lat = (lat_min + lat_max) / 2
            center_lng = (lng_min + lng_max) / 2

            # Skip if it's in continental US region (we already have those)
            if (24.5 <= center_lat <= 49.0 and -125.0 <= center_lng <= -66.5):
                continue

            # Check if it's in Hawaii or Alaska using Cartopy filter
            if us_filter.is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max):
                grid_id = f"GRID_{grid_x:03d}_{grid_y:03d}"

                # Calculate tile count for this grid (using same logic as original)
                min_tile_x, max_tile_y = coverage_system.deg2num(lat_min, lng_min, coverage_system.zoom_level)
                max_tile_x, min_tile_y = coverage_system.deg2num(lat_max, lng_max, coverage_system.zoom_level)
                tile_count = (max_tile_x - min_tile_x + 1) * (max_tile_y - min_tile_y + 1)

                hawaii_alaska_grids.append({
                    'grid_id': grid_id,
                    'grid_x': grid_x,
                    'grid_y': grid_y,
                    'lat_min': lat_min,
                    'lat_max': lat_max,
                    'lng_min': lng_min,
                    'lng_max': lng_max,
                    'total_tiles': tile_count,
                    'extracted_tiles': 0,
                    'status': 'pending'
                })

    print(f"✅ Found {len(hawaii_alaska_grids):,} Hawaii/Alaska grids to add")

    # Add the new grids to the database
    if hawaii_alaska_grids:
        with sqlite3.connect(coverage_system.db_path) as conn:
            for grid in hawaii_alaska_grids:
                conn.execute('''
                    INSERT OR IGNORE INTO grid_squares
                    (grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                     total_tiles, extracted_tiles, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    grid['grid_id'], grid['grid_x'], grid['grid_y'],
                    grid['lat_min'], grid['lat_max'], grid['lng_min'], grid['lng_max'],
                    grid['total_tiles'], grid['extracted_tiles'], grid['status']
                ))
            conn.commit()

        print(f"🏖️ Added {len(hawaii_alaska_grids):,} new Hawaii/Alaska grids to database")

        # Show breakdown by region
        hawaii_grids = [g for g in hawaii_alaska_grids if 18.0 <= (g['lat_min'] + g['lat_max'])/2 <= 23.0]
        alaska_grids = [g for g in hawaii_alaska_grids if (g['lat_min'] + g['lat_max'])/2 > 50.0]

        print(f"  🌺 Hawaii grids: {len(hawaii_grids):,}")
        print(f"  🏔️ Alaska grids: {len(alaska_grids):,}")

        # Show final statistics
        with sqlite3.connect(coverage_system.db_path) as conn:
            cursor = conn.execute('SELECT COUNT(*) FROM grid_squares')
            final_count = cursor.fetchone()[0]

            cursor = conn.execute('SELECT SUM(total_tiles) FROM grid_squares')
            total_tiles = cursor.fetchone()[0] or 0

        print(f"📈 Final database: {final_count:,} total grids, {total_tiles:,} total tiles")
    else:
        print("⚠️ No new Hawaii/Alaska grids found to add")

if __name__ == '__main__':
    add_hawaii_alaska_grids()