#!/usr/bin/env python3
"""
Simple Grid Coverage System
===========================

Creates a uniform grid of fixed-size squares covering the continental US.
No state boundaries, no overlaps, just systematic coverage.
"""

import sqlite3
import math
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class GridSquare:
    """A single square in the coverage grid"""
    grid_id: str
    grid_x: int
    grid_y: int
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float
    total_tiles: int = 0
    extracted_tiles: int = 0
    status: str = 'pending'  # pending, in_progress, completed

class SimpleGridCoverage:
    """Simple uniform grid system covering continental US"""

    def __init__(self, db_path: str = "simple_grid_coverage.db",
                 zoom_level: int = 15, grid_size_km: float = 25.0):
        self.db_path = Path(db_path)
        self.zoom_level = zoom_level
        self.grid_size_km = grid_size_km

        # Full US bounds (including Alaska and Hawaii)
        self.bounds = {
            'lat_min': 18.0,    # Southern tip of Hawaii
            'lat_max': 72.0,    # Northern tip of Alaska
            'lng_min': -180.0,  # Western Aleutian Islands
            'lng_max': -66.5    # Eastern coast (Maine)
        }

        self._init_database()

    def _init_database(self):
        """Initialize the grid coverage database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS grid_squares (
                    grid_id TEXT PRIMARY KEY,
                    grid_x INTEGER NOT NULL,
                    grid_y INTEGER NOT NULL,
                    lat_min REAL NOT NULL,
                    lat_max REAL NOT NULL,
                    lng_min REAL NOT NULL,
                    lng_max REAL NOT NULL,
                    total_tiles INTEGER DEFAULT 0,
                    extracted_tiles INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS extraction_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grid_id TEXT NOT NULL,
                    tiles_extracted INTEGER NOT NULL,
                    extraction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (grid_id) REFERENCES grid_squares (grid_id)
                )
            ''')

            conn.commit()

    def deg2num(self, lat_deg: float, lon_deg: float, zoom: int) -> Tuple[int, int]:
        """Convert lat/lng to tile numbers"""
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return (xtile, ytile)

    def generate_grid(self) -> List[GridSquare]:
        """Generate uniform grid covering continental US"""

        # Convert km to degrees (approximate)
        lat_degree_km = 111.0  # 1 degree latitude ≈ 111 km
        # Longitude varies by latitude, use average for continental US
        avg_lat = (self.bounds['lat_min'] + self.bounds['lat_max']) / 2
        lng_degree_km = 111.0 * math.cos(math.radians(avg_lat))

        lat_step = self.grid_size_km / lat_degree_km
        lng_step = self.grid_size_km / lng_degree_km

        print(f"Grid parameters:")
        print(f"  Size: {self.grid_size_km}km x {self.grid_size_km}km")
        print(f"  Lat step: {lat_step:.4f}° ({lat_degree_km:.1f} km/degree)")
        print(f"  Lng step: {lng_step:.4f}° ({lng_degree_km:.1f} km/degree)")

        grids = []
        grid_y = 0
        lat = self.bounds['lat_min']

        while lat < self.bounds['lat_max']:
            lat_max = min(lat + lat_step, self.bounds['lat_max'])

            grid_x = 0
            lng = self.bounds['lng_min']

            while lng < self.bounds['lng_max']:
                lng_max = min(lng + lng_step, self.bounds['lng_max'])

                # Calculate total tiles in this grid square
                min_tile_x, max_tile_y = self.deg2num(lat, lng, self.zoom_level)
                max_tile_x, min_tile_y = self.deg2num(lat_max, lng_max, self.zoom_level)

                total_tiles = (max_tile_x - min_tile_x + 1) * (max_tile_y - min_tile_y + 1)

                grid_square = GridSquare(
                    grid_id=f"GRID_{grid_x:03d}_{grid_y:03d}",
                    grid_x=grid_x,
                    grid_y=grid_y,
                    lat_min=lat,
                    lat_max=lat_max,
                    lng_min=lng,
                    lng_max=lng_max,
                    total_tiles=total_tiles
                )

                grids.append(grid_square)

                lng += lng_step
                grid_x += 1

            lat += lat_step
            grid_y += 1

        return grids

    def initialize_grid(self) -> List[GridSquare]:
        """Initialize the grid system and store in database"""
        print("Generating continental US grid...")
        grids = self.generate_grid()

        with sqlite3.connect(self.db_path) as conn:
            # Clear existing data
            conn.execute("DELETE FROM grid_squares")

            # Insert all grid squares
            for grid in grids:
                conn.execute('''
                    INSERT INTO grid_squares
                    (grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max, total_tiles)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (grid.grid_id, grid.grid_x, grid.grid_y,
                      grid.lat_min, grid.lat_max, grid.lng_min, grid.lng_max,
                      grid.total_tiles))

            conn.commit()

        print(f"Initialized {len(grids)} grid squares")
        return grids

    def get_next_grid(self) -> Optional[GridSquare]:
        """Get the next grid square to extract"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                       total_tiles, extracted_tiles, status
                FROM grid_squares
                WHERE status = 'pending'
                ORDER BY grid_y, grid_x  -- Process south to north, west to east
                LIMIT 1
            ''')

            result = cursor.fetchone()
            if result:
                return GridSquare(
                    grid_id=result[0],
                    grid_x=result[1],
                    grid_y=result[2],
                    lat_min=result[3],
                    lat_max=result[4],
                    lng_min=result[5],
                    lng_max=result[6],
                    total_tiles=result[7],
                    extracted_tiles=result[8],
                    status=result[9]
                )
            return None

    def mark_grid_in_progress(self, grid_id: str):
        """Mark a grid as currently being processed"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE grid_squares
                SET status = 'in_progress'
                WHERE grid_id = ?
            ''', (grid_id,))
            conn.commit()

    def mark_grid_completed(self, grid_id: str, tiles_extracted: int):
        """Mark a grid as completed"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE grid_squares
                SET status = 'completed',
                    extracted_tiles = ?,
                    completed_at = CURRENT_TIMESTAMP
                WHERE grid_id = ?
            ''', (tiles_extracted, grid_id))

            # Record extraction progress
            conn.execute('''
                INSERT INTO extraction_progress (grid_id, tiles_extracted)
                VALUES (?, ?)
            ''', (grid_id, tiles_extracted))

            conn.commit()

    def get_progress_report(self) -> Dict:
        """Generate progress report"""
        with sqlite3.connect(self.db_path) as conn:
            # Overall statistics
            cursor = conn.execute('''
                SELECT
                    COUNT(*) as total_grids,
                    SUM(total_tiles) as total_tiles,
                    SUM(extracted_tiles) as extracted_tiles,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_grids,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_grids,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_grids
                FROM grid_squares
            ''')

            overall = cursor.fetchone()

            # Recent progress (last 24 hours)
            cursor = conn.execute('''
                SELECT COUNT(*), SUM(tiles_extracted)
                FROM extraction_progress
                WHERE extraction_date >= datetime('now', '-1 day')
            ''')

            recent = cursor.fetchone()
            recent_grids = recent[0] if recent[0] else 0
            recent_tiles = recent[1] if recent[1] else 0

            # Calculate percentages
            total_tiles = overall[1] if overall[1] else 1
            extracted_tiles = overall[2] if overall[2] else 0
            completion_pct = (extracted_tiles / total_tiles) * 100

            return {
                'total_grids': overall[0],
                'total_tiles': overall[1],
                'extracted_tiles': overall[2],
                'completed_grids': overall[3],
                'in_progress_grids': overall[4],
                'pending_grids': overall[5],
                'completion_percentage': completion_pct,
                'recent_grids_24h': recent_grids,
                'recent_tiles_24h': recent_tiles,
                'daily_rate': recent_tiles if recent_tiles else 0
            }

    def get_grid_info(self, grid_id: str) -> Optional[GridSquare]:
        """Get information about a specific grid"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                       total_tiles, extracted_tiles, status
                FROM grid_squares
                WHERE grid_id = ?
            ''', (grid_id,))

            result = cursor.fetchone()
            if result:
                return GridSquare(
                    grid_id=result[0],
                    grid_x=result[1],
                    grid_y=result[2],
                    lat_min=result[3],
                    lat_max=result[4],
                    lng_min=result[5],
                    lng_max=result[6],
                    total_tiles=result[7],
                    extracted_tiles=result[8],
                    status=result[9]
                )
            return None

    def generate_report(self) -> str:
        """Generate a formatted text report"""
        progress = self.get_progress_report()

        report = []
        report.append("🗺️  CONTINENTAL US GRID COVERAGE REPORT")
        report.append("=" * 50)
        report.append("")

        report.append("📊 OVERALL PROGRESS:")
        report.append(f"  Grid Size: {self.grid_size_km}km x {self.grid_size_km}km")
        report.append(f"  Total Grids: {progress['total_grids']:,}")
        report.append(f"  Total Tiles: {progress['total_tiles']:,}")
        report.append(f"  Extracted: {progress['extracted_tiles']:,}")
        report.append(f"  Progress: {progress['completion_percentage']:.2f}%")
        report.append("")

        report.append("📈 STATUS BREAKDOWN:")
        report.append(f"  ✅ Completed: {progress['completed_grids']:,} grids")
        report.append(f"  🔄 In Progress: {progress['in_progress_grids']:,} grids")
        report.append(f"  ⏳ Pending: {progress['pending_grids']:,} grids")
        report.append("")

        if progress['recent_grids_24h'] > 0:
            report.append("⚡ RECENT ACTIVITY (24h):")
            report.append(f"  Grids completed: {progress['recent_grids_24h']:,}")
            report.append(f"  Tiles extracted: {progress['recent_tiles_24h']:,}")
            report.append(f"  Daily rate: {progress['daily_rate']:,} tiles/day")

            if progress['daily_rate'] > 0:
                remaining_tiles = progress['total_tiles'] - progress['extracted_tiles']
                days_remaining = remaining_tiles / progress['daily_rate']
                report.append(f"  ETA: {days_remaining:.1f} days")
        else:
            report.append("⚡ No recent activity")

        report.append("")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        return "\n".join(report)

    def assign_tile_to_state(self, lat: float, lng: float) -> tuple:
        """
        Assign a tile coordinate to a US state

        Args:
            lat: Latitude of the tile center
            lng: Longitude of the tile center

        Returns:
            Tuple of (state_name, distance_to_center) where distance is always 0

        Note:
            This is a simplified implementation that returns "US" for all tiles.
            A more sophisticated version could use state boundary data.
        """
        # Simple bounds check for continental US
        if (24.0 <= lat <= 49.0) and (-125.0 <= lng <= -66.0):
            return ("US", 0.0)
        # Check for Alaska
        elif (54.0 <= lat <= 72.0) and (-180.0 <= lng <= -129.0):
            return ("Alaska", 0.0)
        # Check for Hawaii
        elif (18.0 <= lat <= 23.0) and (-161.0 <= lng <= -154.0):
            return ("Hawaii", 0.0)
        else:
            return ("Unknown", 0.0)

def main():
    """Example usage"""
    # Create grid system with 25km squares
    coverage = SimpleGridCoverage(grid_size_km=25.0, zoom_level=15)

    # Initialize the grid
    grids = coverage.initialize_grid()

    # Show report
    print(coverage.generate_report())

    # Show next few grids to extract
    print("\n🎯 NEXT GRIDS TO EXTRACT:")
    for i in range(5):
        next_grid = coverage.get_next_grid()
        if next_grid:
            print(f"  {i+1}. {next_grid.grid_id}: "
                  f"{next_grid.lat_min:.3f}°N-{next_grid.lat_max:.3f}°N, "
                  f"{next_grid.lng_min:.3f}°W-{next_grid.lng_max:.3f}°W "
                  f"({next_grid.total_tiles:,} tiles)")
            # Mark as in progress so we get the next one
            coverage.mark_grid_in_progress(next_grid.grid_id)
        else:
            break

if __name__ == "__main__":
    main()