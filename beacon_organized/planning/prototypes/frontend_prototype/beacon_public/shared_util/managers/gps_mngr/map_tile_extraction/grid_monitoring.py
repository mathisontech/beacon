#!/usr/bin/env python3
"""
Grid Progress Monitoring and Reporting
======================================

Functions for monitoring extraction progress, generating reports, and tracking
the status of the grid-based OSM tile extraction system.
"""

import sqlite3
from typing import List, Dict, Optional
from gridmap_squares import GridSquare


def show_grid_progress(coverage_system):
    """Display current progress of the grid coverage system

    Args:
        coverage_system: SimpleGridCoverage instance
    """
    report = coverage_system.generate_report()
    print(report)


def show_next_grids(coverage_system, num_grids=10):
    """Show the next grids scheduled for extraction

    Args:
        coverage_system: SimpleGridCoverage instance
        num_grids: Number of grids to display
    """
    print(f"📋 NEXT {num_grids} GRIDS TO EXTRACT:")
    print("=" * 60)

    # Get next grids without marking them as in progress
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                   total_tiles, extracted_tiles, status
            FROM grid_squares
            WHERE status = 'pending'
            ORDER BY grid_y, grid_x
            LIMIT ?
        ''', (num_grids,))

        results = cursor.fetchall()

    if not results:
        print("❌ No pending grids available")
        return

    for i, result in enumerate(results, 1):
        grid_id = result[0]
        lat_min, lat_max = result[3], result[4]
        lng_min, lng_max = result[5], result[6]
        total_tiles = result[7]

        # Determine primary state for this grid
        center_lat = (lat_min + lat_max) / 2
        center_lng = (lng_min + lng_max) / 2
        primary_state, distance = coverage_system.assign_tile_to_state(center_lat, center_lng)

        print(f"  {i:2}. {grid_id}")
        print(f"      📍 {lat_min:.3f}°N to {lat_max:.3f}°N, {lng_min:.3f}°W to {lng_max:.3f}°W")
        print(f"      🗺️  Primary State: {primary_state} ({total_tiles:,} tiles)")
        print()


def show_state_statistics(coverage_system):
    """Show extraction progress by state

    Args:
        coverage_system: SimpleGridCoverage instance
    """
    coverage_stats = coverage_system.get_coverage_report()

    print("🗺️  EXTRACTION PROGRESS BY STATE")
    print("=" * 50)

    # Sort states by total tiles
    sorted_states = sorted(coverage_stats['by_state'], key=lambda x: x['total_tiles'], reverse=True)

    print(f"{'State':<15} {'Total Tiles':<12} {'Extracted':<12} {'Progress':<10}")
    print("-" * 50)

    for state_info in sorted_states:
        state = state_info['state']
        total = state_info['total_tiles']
        extracted = state_info['extracted_tiles']
        progress = (extracted / total * 100) if total > 0 else 0

        print(f"{state:<15} {total:,<12} {extracted:,<12} {progress:>6.1f}%")


def show_recent_activity(coverage_system):
    """Show recent extraction activity

    Args:
        coverage_system: SimpleGridCoverage instance
    """
    with sqlite3.connect(coverage_system.db_path) as conn:
        # Recent completed grids
        cursor = conn.execute('''
            SELECT grid_id, extracted_tiles, completed_at
            FROM grid_squares
            WHERE status = 'completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC
            LIMIT 10
        ''')

        recent_grids = cursor.fetchall()

    if recent_grids:
        print("⚡ RECENT COMPLETED GRIDS (Last 10)")
        print("=" * 40)

        for grid_id, tiles, completed_at in recent_grids:
            print(f"  ✅ {grid_id}: {tiles:,} tiles at {completed_at}")
    else:
        print("⚡ No completed grids yet")


def quick_status(coverage_system):
    """Show a quick status summary

    Args:
        coverage_system: SimpleGridCoverage instance
    """
    progress = coverage_system.get_progress_report()

    total_grids = progress['total_grids']
    completed_grids = progress['completed_grids']
    total_tiles = progress['total_tiles']
    extracted_tiles = progress['extracted_tiles']
    completion_pct = progress['completion_percentage']

    print(f"📊 QUICK STATUS")
    print(f"   Grids: {completed_grids:,}/{total_grids:,} ({completed_grids/total_grids*100:.1f}%)")
    print(f"   Tiles: {extracted_tiles:,}/{total_tiles:,} ({completion_pct:.1f}%)")

    if progress['recent_tiles_24h'] > 0:
        print(f"   Recent: {progress['recent_tiles_24h']:,} tiles in 24h")
        remaining_tiles = total_tiles - extracted_tiles
        days_remaining = remaining_tiles / progress['daily_rate']
        print(f"   ETA: {days_remaining:.1f} days at current rate")


def show_grid_details(coverage_system, grid_id: str):
    """Show detailed information about a specific grid

    Args:
        coverage_system: SimpleGridCoverage instance
        grid_id: ID of the grid to inspect
    """
    grid_info = coverage_system.get_grid_info(grid_id)

    if not grid_info:
        print(f"❌ Grid {grid_id} not found")
        return

    print(f"🔍 GRID DETAILS: {grid_id}")
    print("=" * 40)
    print(f"  Position: ({grid_info.grid_x}, {grid_info.grid_y})")
    print(f"  Location: {grid_info.lat_min:.3f}°N to {grid_info.lat_max:.3f}°N")
    print(f"           {grid_info.lng_min:.3f}°W to {grid_info.lng_max:.3f}°W")
    print(f"  Status: {grid_info.status}")
    print(f"  Tiles: {grid_info.extracted_tiles:,}/{grid_info.total_tiles:,}")

    if grid_info.total_tiles > 0:
        progress = (grid_info.extracted_tiles / grid_info.total_tiles) * 100
        print(f"  Progress: {progress:.1f}%")

    # Determine primary state
    center_lat = (grid_info.lat_min + grid_info.lat_max) / 2
    center_lng = (grid_info.lng_min + grid_info.lng_max) / 2
    primary_state, distance = coverage_system.assign_tile_to_state(center_lat, center_lng)
    print(f"  Primary State: {primary_state} ({distance:.1f}km from center)")


def show_extraction_summary(coverage_system, num_recent=20):
    """Show a comprehensive extraction summary

    Args:
        coverage_system: SimpleGridCoverage instance
        num_recent: Number of recent grids to include
    """
    print("📊 COMPREHENSIVE EXTRACTION SUMMARY")
    print("=" * 60)

    # Overall progress
    progress = coverage_system.get_progress_report()

    print(f"\n🎯 OVERALL PROGRESS:")
    print(f"   Total Grids: {progress['total_grids']:,}")
    print(f"   Completed: {progress['completed_grids']:,} ({progress['completed_grids']/progress['total_grids']*100:.1f}%)")
    print(f"   In Progress: {progress['in_progress_grids']:,}")
    print(f"   Pending: {progress['pending_grids']:,}")

    print(f"\n📈 TILE STATISTICS:")
    print(f"   Total Tiles: {progress['total_tiles']:,}")
    print(f"   Extracted: {progress['extracted_tiles']:,} ({progress['completion_percentage']:.1f}%)")
    print(f"   Remaining: {progress['total_tiles'] - progress['extracted_tiles']:,}")

    if progress['recent_tiles_24h'] > 0:
        print(f"\n⚡ RECENT ACTIVITY:")
        print(f"   Last 24h: {progress['recent_tiles_24h']:,} tiles in {progress['recent_grids_24h']:,} grids")
        print(f"   Rate: {progress['daily_rate']:,} tiles/day")

        remaining_tiles = progress['total_tiles'] - progress['extracted_tiles']
        eta_days = remaining_tiles / progress['daily_rate'] if progress['daily_rate'] > 0 else float('inf')
        print(f"   ETA: {eta_days:.1f} days")

    # Show recent completed grids
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, extracted_tiles, completed_at
            FROM grid_squares
            WHERE status = 'completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC
            LIMIT ?
        ''', (num_recent,))

        recent_grids = cursor.fetchall()

    if recent_grids:
        print(f"\n✅ RECENT COMPLETED GRIDS (Last {len(recent_grids)}):")
        for grid_id, tiles, completed_at in recent_grids:
            print(f"   {grid_id}: {tiles:,} tiles ({completed_at})")


def monitor_grid_progress(coverage_system, watch_grids: List[str]):
    """Monitor progress of specific grids

    Args:
        coverage_system: SimpleGridCoverage instance
        watch_grids: List of grid IDs to monitor
    """
    print(f"👁️  MONITORING {len(watch_grids)} GRIDS")
    print("=" * 50)

    for grid_id in watch_grids:
        grid_info = coverage_system.get_grid_info(grid_id)

        if grid_info:
            if grid_info.total_tiles > 0:
                progress = (grid_info.extracted_tiles / grid_info.total_tiles) * 100
            else:
                progress = 0

            status_icon = "✅" if grid_info.status == "completed" else "🔄" if grid_info.status == "in_progress" else "⏳"

            print(f"  {status_icon} {grid_id}: {progress:.1f}% ({grid_info.extracted_tiles:,}/{grid_info.total_tiles:,})")
        else:
            print(f"  ❌ {grid_id}: Not found")


def get_grid_recommendations(coverage_system, priority="coastal") -> List[str]:
    """Get recommended grids for extraction based on priority

    Args:
        coverage_system: SimpleGridCoverage instance
        priority: Type of recommendation ("coastal", "urban", "rural", "balanced")

    Returns:
        List of recommended grid IDs
    """
    recommendations = []

    with sqlite3.connect(coverage_system.db_path) as conn:
        if priority == "coastal":
            # Prefer grids near coasts
            cursor = conn.execute('''
                SELECT grid_id, lat_min, lat_max, lng_min, lng_max
                FROM grid_squares
                WHERE status = 'pending'
                ORDER BY grid_y, grid_x
                LIMIT 20
            ''')

            results = cursor.fetchall()
            for result in results:
                grid_id, lat_min, lat_max, lng_min, lng_max = result

                # Check if coastal
                is_coastal = (
                    lat_min < 35 or  # Southern states
                    lng_min > -75 or  # East coast
                    lng_max < -115   # West coast
                )

                if is_coastal:
                    recommendations.append(grid_id)

                if len(recommendations) >= 10:
                    break

        elif priority == "balanced":
            # Get a mix from different regions
            cursor = conn.execute('''
                SELECT grid_id
                FROM grid_squares
                WHERE status = 'pending'
                ORDER BY grid_y, grid_x
                LIMIT 10
            ''')
            recommendations = [row[0] for row in cursor.fetchall()]

        else:  # Default to next in order
            cursor = conn.execute('''
                SELECT grid_id
                FROM grid_squares
                WHERE status = 'pending'
                ORDER BY grid_y, grid_x
                LIMIT 10
            ''')
            recommendations = [row[0] for row in cursor.fetchall()]

    return recommendations