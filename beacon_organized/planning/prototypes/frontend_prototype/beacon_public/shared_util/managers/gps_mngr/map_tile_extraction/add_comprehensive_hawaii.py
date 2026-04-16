#!/usr/bin/env python3
"""
Add Comprehensive Hawaii Coverage
=================================

Systematically adds all valid Hawaii grids covering all major islands.
"""

import sqlite3
from gridmap_squares import SimpleGridCoverage
from cartopy_us_filter import CartopyUSFilter

def add_comprehensive_hawaii_grids():
    """Add comprehensive Hawaii grid coverage"""

    coverage_system = SimpleGridCoverage()
    us_filter = CartopyUSFilter()

    # Main Hawaiian islands with expanded coverage areas
    hawaii_regions = {
        'Big_Island': (18.8, 20.4, -156.2, -154.7),
        'Maui_County': (20.4, 21.1, -157.0, -155.8),  # Includes Maui, Molokai, Lanai
        'Oahu': (21.1, 21.8, -158.4, -157.5),
        'Kauai_County': (21.7, 22.4, -160.0, -159.2),  # Includes Kauai and Niihau
    }

    print("🌺 Generating comprehensive Hawaii grid coverage...")

    all_hawaii_grids = []
    grid_counter = 0

    for region_name, (lat_min, lat_max, lng_min, lng_max) in hawaii_regions.items():
        print(f"\\n🏝️ Processing {region_name.replace('_', ' ')}...")
        region_grids = 0

        # Use fine-grained grid size for detailed coverage
        lat_step = 0.12  # ~13km grid size
        lng_step = 0.12

        lat = lat_min
        while lat < lat_max:
            lng = lng_min
            while lng < lng_max:
                test_lat_min = lat
                test_lat_max = min(lat + lat_step, lat_max)
                test_lng_min = lng
                test_lng_max = min(lng + lng_step, lng_max)

                # Test if this grid is valid using Cartopy
                if us_filter.is_grid_in_continental_us(test_lat_min, test_lat_max, test_lng_min, test_lng_max):
                    # Calculate tile count
                    min_tile_x, max_tile_y = coverage_system.deg2num(test_lat_min, test_lng_min, coverage_system.zoom_level)
                    max_tile_x, min_tile_y = coverage_system.deg2num(test_lat_max, test_lng_max, coverage_system.zoom_level)
                    tile_count = (max_tile_x - min_tile_x + 1) * (max_tile_y - min_tile_y + 1)

                    grid_id = f"HAWAII_{region_name}_{grid_counter:03d}"

                    all_hawaii_grids.append({
                        'grid_id': grid_id,
                        'grid_x': 8000 + grid_counter,  # Use high numbers to avoid conflicts
                        'grid_y': 8000 + grid_counter,
                        'lat_min': test_lat_min,
                        'lat_max': test_lat_max,
                        'lng_min': test_lng_min,
                        'lng_max': test_lng_max,
                        'total_tiles': tile_count,
                        'extracted_tiles': 0,
                        'status': 'pending'
                    })

                    region_grids += 1
                    grid_counter += 1

                lng += lng_step
            lat += lat_step

        print(f"  ✅ Found {region_grids} valid grids in {region_name.replace('_', ' ')}")

    print(f"\\n🏖️ Total Hawaii grids to add: {len(all_hawaii_grids)}")

    if all_hawaii_grids:
        # Remove existing Hawaii grids first
        with sqlite3.connect(coverage_system.db_path) as conn:
            cursor = conn.execute("DELETE FROM grid_squares WHERE grid_id LIKE 'HAWAII_%'")
            deleted = cursor.rowcount
            print(f"🗑️ Removed {deleted} existing Hawaii grids")

            # Add all new Hawaii grids
            for grid in all_hawaii_grids:
                conn.execute('''
                    INSERT INTO grid_squares
                    (grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                     total_tiles, extracted_tiles, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    grid['grid_id'], grid['grid_x'], grid['grid_y'],
                    grid['lat_min'], grid['lat_max'], grid['lng_min'], grid['lng_max'],
                    grid['total_tiles'], grid['extracted_tiles'], grid['status']
                ))

            conn.commit()

        print(f"✅ Successfully added {len(all_hawaii_grids)} comprehensive Hawaii grids")

        # Verify and show final statistics
        with sqlite3.connect(coverage_system.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*), SUM(total_tiles) FROM grid_squares WHERE grid_id LIKE 'HAWAII_%'")
            count, total_tiles = cursor.fetchone()

            print(f"📊 Final Hawaii coverage:")
            print(f"  🌺 Hawaii grids: {count:,}")
            print(f"  🗺️ Hawaii tiles: {total_tiles:,}")

            # Show breakdown by region
            for region_name in hawaii_regions.keys():
                cursor = conn.execute("SELECT COUNT(*) FROM grid_squares WHERE grid_id LIKE ?", (f'HAWAII_{region_name}_%',))
                region_count = cursor.fetchone()[0]
                print(f"  🏝️ {region_name.replace('_', ' ')}: {region_count} grids")

    else:
        print("❌ No valid Hawaii grids found")

if __name__ == '__main__':
    add_comprehensive_hawaii_grids()