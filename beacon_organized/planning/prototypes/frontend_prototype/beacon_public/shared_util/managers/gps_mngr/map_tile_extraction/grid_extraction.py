#!/usr/bin/env python3
"""
Grid-Based Tile Extraction Functions
====================================

Core extraction functions for the systematic grid-based OSM tile extraction system.
These functions handle the actual downloading and processing of tiles for grid squares.
"""

import time
import sqlite3
from typing import List, Tuple, Optional
from gridmap_squares import GridSquare


async def extract_grid_tiles(grid_square: GridSquare, extractor, coverage_system, output_folder="osm_tiles") -> Tuple[int, int]:
    """Extract all tiles for a specific grid square

    Args:
        grid_square: The grid square to extract
        extractor: FastOSMExtractor instance for downloading
        coverage_system: SimpleGridCoverage instance for state assignment
        output_folder: Output directory for tiles

    Returns:
        Tuple of (success_count, total_tiles)
    """
    print(f"\n🎯 Extracting Grid: {grid_square.grid_id}")
    print(f"   Location: {grid_square.lat_min:.3f}°N to {grid_square.lat_max:.3f}°N")
    print(f"            {grid_square.lng_min:.3f}°W to {grid_square.lng_max:.3f}°W")

    # Calculate tiles in this grid
    tiles_to_extract = []

    # Get tile bounds for the grid
    min_tile_x, max_tile_y = extractor.deg2num(grid_square.lat_min, grid_square.lng_min, extractor.zoom_level)
    max_tile_x, min_tile_y = extractor.deg2num(grid_square.lat_max, grid_square.lng_max, extractor.zoom_level)

    # Generate all tiles in the grid
    for x in range(min_tile_x, max_tile_x + 1):
        for y in range(min_tile_y, max_tile_y + 1):
            # Determine which state this tile belongs to
            lat, lng = extractor.num2deg(x, y, extractor.zoom_level)
            state, _ = coverage_system.assign_tile_to_state(lat, lng)

            tiles_to_extract.append({
                'x': x,
                'y': y,
                'z': extractor.zoom_level,
                'state': state,
                'lat': lat,
                'lng': lng
            })

    print(f"   Total tiles in grid: {len(tiles_to_extract):,}")

    # Extract tiles using the fast extractor
    start_time = time.time()
    success_count = 0

    # Process tiles in batches for better progress tracking
    batch_size = 50
    for i in range(0, len(tiles_to_extract), batch_size):
        batch = tiles_to_extract[i:i + batch_size]
        batch_results = await extractor.download_tiles_batch_async(batch)
        success_count += sum(batch_results)

        # Update progress
        progress = (i + len(batch)) / len(tiles_to_extract) * 100
        print(f"   Progress: {progress:.1f}% ({success_count:,}/{i + len(batch):,} tiles)")

    extraction_time = time.time() - start_time
    success_rate = (success_count / len(tiles_to_extract)) * 100

    print(f"✅ Grid {grid_square.grid_id} completed!")
    print(f"   Extracted: {success_count:,}/{len(tiles_to_extract):,} tiles ({success_rate:.1f}%)")
    print(f"   Time: {extraction_time:.1f}s ({success_count/extraction_time:.1f} tiles/sec)")

    # Update grid status in database
    coverage_system.mark_grid_completed(grid_square.grid_id, success_count)

    return success_count, len(tiles_to_extract)


async def extract_single_grid(extractor, coverage_system):
    """Extract tiles for the next available grid

    Args:
        extractor: FastOSMExtractor instance
        coverage_system: SimpleGridCoverage instance

    Returns:
        Tuple of (success_count, total_tiles) or None if no grids available
    """
    next_grid = coverage_system.get_next_grid()
    if not next_grid:
        print("❌ No pending grids available for extraction")
        return None

    # Mark grid as in progress
    coverage_system.mark_grid_in_progress(next_grid.grid_id)

    try:
        # Extract the grid
        success_count, total_tiles = await extract_grid_tiles(next_grid, extractor, coverage_system)
        print(f"\n📊 Single grid extraction completed: {success_count:,}/{total_tiles:,} tiles")
        return success_count, total_tiles

    except Exception as e:
        print(f"❌ Error extracting grid {next_grid.grid_id}: {e}")
        # Reset grid status on error
        coverage_system.mark_grid_in_progress(next_grid.grid_id)  # Will keep as in_progress for retry
        return None


async def extract_multiple_grids(extractor, coverage_system, num_grids=5):
    """Extract tiles for multiple grids in sequence

    Args:
        extractor: FastOSMExtractor instance
        coverage_system: SimpleGridCoverage instance
        num_grids: Number of grids to extract

    Returns:
        Tuple of (total_success, total_tiles)
    """
    print(f"🚀 Starting extraction of {num_grids} grids...")

    total_success = 0
    total_tiles = 0

    for i in range(num_grids):
        print(f"\n--- Grid {i+1}/{num_grids} ---")

        next_grid = coverage_system.get_next_grid()
        if not next_grid:
            print(f"✅ No more grids available. Completed {i} grids.")
            break

        coverage_system.mark_grid_in_progress(next_grid.grid_id)

        try:
            success_count, grid_total = await extract_grid_tiles(next_grid, extractor, coverage_system)
            total_success += success_count
            total_tiles += grid_total

        except Exception as e:
            print(f"❌ Error extracting grid {next_grid.grid_id}: {e}")
            continue

    print(f"\n🎉 MULTI-GRID EXTRACTION COMPLETE!")
    print(f"   Total extracted: {total_success:,}/{total_tiles:,} tiles")
    print(f"   Success rate: {(total_success/total_tiles)*100:.1f}%")

    return total_success, total_tiles


async def extract_coastal_grids(extractor, coverage_system, num_grids=3):
    """Extract grids that are likely to contain coastal areas (for intersection variety)

    Args:
        extractor: FastOSMExtractor instance
        coverage_system: SimpleGridCoverage instance
        num_grids: Number of coastal grids to extract

    Returns:
        Tuple of (total_success, total_tiles)
    """
    print(f"🌊 Starting extraction of {num_grids} coastal grids...")

    # Get all pending grids and sort by proximity to coasts
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                   total_tiles, extracted_tiles, status
            FROM grid_squares
            WHERE status = 'pending'
            ORDER BY grid_y, grid_x  -- Start from south and west (more coastal areas)
            LIMIT ?
        ''', (num_grids * 3,))  # Get more options to filter

        results = cursor.fetchall()

    # Prefer grids closer to coasts (lower grid_y = southern, extreme grid_x = eastern/western)
    coastal_grids = []
    for result in results:
        grid = GridSquare(
            grid_id=result[0], grid_x=result[1], grid_y=result[2],
            lat_min=result[3], lat_max=result[4], lng_min=result[5], lng_max=result[6],
            total_tiles=result[7], extracted_tiles=result[8], status=result[9]
        )

        # Prioritize coastal areas (southern states, east/west coasts)
        is_coastal = (
            grid.lat_min < 35 or  # Southern states
            grid.lng_min > -75 or  # East coast
            grid.lng_max < -115    # West coast
        )

        if is_coastal:
            coastal_grids.append(grid)
            if len(coastal_grids) >= num_grids:
                break

    # Fall back to any grids if not enough coastal ones
    if len(coastal_grids) < num_grids:
        for result in results[len(coastal_grids):]:
            if len(coastal_grids) >= num_grids:
                break
            grid = GridSquare(
                grid_id=result[0], grid_x=result[1], grid_y=result[2],
                lat_min=result[3], lat_max=result[4], lng_min=result[5], lng_max=result[6],
                total_tiles=result[7], extracted_tiles=result[8], status=result[9]
            )
            coastal_grids.append(grid)

    # Extract the selected grids
    total_success = 0
    total_tiles = 0

    for i, grid in enumerate(coastal_grids):
        print(f"\n--- Coastal Grid {i+1}/{len(coastal_grids)} ---")

        coverage_system.mark_grid_in_progress(grid.grid_id)

        try:
            success_count, grid_total = await extract_grid_tiles(grid, extractor, coverage_system)
            total_success += success_count
            total_tiles += grid_total

        except Exception as e:
            print(f"❌ Error extracting grid {grid.grid_id}: {e}")
            continue

    print(f"\n🌊 COASTAL EXTRACTION COMPLETE!")
    print(f"   Total extracted: {total_success:,}/{total_tiles:,} tiles")
    print(f"   Success rate: {(total_success/total_tiles)*100:.1f}%")

    return total_success, total_tiles


async def test_single_extraction(extractor, coverage_system):
    """Test extracting one grid to verify everything works

    Args:
        extractor: FastOSMExtractor instance
        coverage_system: SimpleGridCoverage instance
    """
    print("🧪 Testing single grid extraction...")

    # Show what we're about to extract
    next_grid = coverage_system.get_next_grid()
    if next_grid:
        print(f"Will extract: {next_grid.grid_id}")
        print(f"Location: {next_grid.lat_min:.3f}°N to {next_grid.lat_max:.3f}°N")
        print(f"Expected tiles: {next_grid.total_tiles:,}")

        user_confirm = input("\nProceed with test extraction? (y/n): ")
        if user_confirm.lower() == 'y':
            return await extract_single_grid(extractor, coverage_system)
        else:
            print("Test cancelled")
            return None
    else:
        print("❌ No grids available for testing")
        return None