#!/usr/bin/env python3
"""
Test script to add Hawaii grids specifically
"""

import sqlite3
from gridmap_squares import SimpleGridCoverage
from cartopy_us_filter import CartopyUSFilter

def add_hawaii_grids_manually():
    """Manually add Hawaii grids by testing specific coordinates"""

    coverage_system = SimpleGridCoverage()
    us_filter = CartopyUSFilter()

    # Test Hawaii coordinates that we know should work
    hawaii_test_coords = [
        (21.0, 21.225, -158.0, -157.682, 'Honolulu'),
        (19.5, 19.725, -155.5, -155.182, 'Big Island'),
        (20.8, 21.025, -156.5, -156.182, 'Maui'),
        (21.8, 22.025, -159.8, -159.482, 'Kauai'),
        (20.5, 20.725, -157.0, -156.682, 'Molokai'),
    ]

    hawaii_grids = []

    print("🌺 Testing specific Hawaii coordinates:")
    for lat_min, lat_max, lng_min, lng_max, island in hawaii_test_coords:
        result = us_filter.is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max)
        center_lat = (lat_min + lat_max) / 2
        center_lng = (lng_min + lng_max) / 2

        print(f"  {island}: ({center_lat:.3f}, {center_lng:.3f}) - {'✅ VALID' if result else '❌ INVALID'}")

        if result:
            # Calculate tile count
            min_tile_x, max_tile_y = coverage_system.deg2num(lat_min, lng_min, coverage_system.zoom_level)
            max_tile_x, min_tile_y = coverage_system.deg2num(lat_max, lng_max, coverage_system.zoom_level)
            tile_count = (max_tile_x - min_tile_x + 1) * (max_tile_y - min_tile_y + 1)

            # Create manual grid ID
            grid_id = f"HAWAII_{island.upper()}_{len(hawaii_grids):02d}"

            hawaii_grids.append({
                'grid_id': grid_id,
                'grid_x': 999,  # Placeholder
                'grid_y': 999,  # Placeholder
                'lat_min': lat_min,
                'lat_max': lat_max,
                'lng_min': lng_min,
                'lng_max': lng_max,
                'total_tiles': tile_count,
                'extracted_tiles': 0,
                'status': 'pending'
            })

    if hawaii_grids:
        print(f"\\n🏖️ Adding {len(hawaii_grids)} Hawaii grids manually:")

        with sqlite3.connect(coverage_system.db_path) as conn:
            for grid in hawaii_grids:
                print(f"  Adding {grid['grid_id']}: ({(grid['lat_min']+grid['lat_max'])/2:.3f}, {(grid['lng_min']+grid['lng_max'])/2:.3f})")

                conn.execute('''
                    INSERT OR REPLACE INTO grid_squares
                    (grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                     total_tiles, extracted_tiles, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    grid['grid_id'], grid['grid_x'], grid['grid_y'],
                    grid['lat_min'], grid['lat_max'], grid['lng_min'], grid['lng_max'],
                    grid['total_tiles'], grid['extracted_tiles'], grid['status']
                ))
            conn.commit()

        print(f"✅ Successfully added {len(hawaii_grids)} Hawaii grids")

        # Verify they were added
        with sqlite3.connect(coverage_system.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM grid_squares WHERE grid_id LIKE 'HAWAII_%'")
            count = cursor.fetchone()[0]
            print(f"📊 Verified: {count} Hawaii grids now in database")
    else:
        print("❌ No valid Hawaii grids found to add")

if __name__ == '__main__':
    add_hawaii_grids_manually()