#!/usr/bin/env python3
"""
Batch Extraction Manager
========================

Organizes tile extraction into manageable batches of 100 grid squares.
Provides tracking, progress monitoring, and batch management functions.
"""

import sqlite3
import asyncio
import time
from dataclasses import dataclass
from typing import List, Optional, Dict, Tuple
from pathlib import Path
from gridmap_squares import SimpleGridCoverage, GridSquare
from fast_osm_extractor import FastOSMExtractor
from grid_extraction import extract_grid_tiles


@dataclass
class ExtractionBatch:
    """Represents a batch of 100 grid squares for extraction"""
    batch_id: int
    grid_ids: List[str]
    status: str = 'pending'  # pending, in_progress, completed, failed
    total_tiles: int = 0
    extracted_tiles: int = 0
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    estimated_duration_hours: float = 0.0


class BatchExtractionManager:
    """Manages extraction in batches of 100 grid squares"""

    def __init__(self, db_path: str = "simple_grid_coverage.db",
                 batch_size: int = 100, output_folder: str = "osm_tiles"):
        """Initialize the batch extraction manager

        Args:
            db_path: Path to the grid coverage database
            batch_size: Number of grids per batch (default 100)
            output_folder: Output directory for tiles
        """
        self.db_path = db_path
        self.batch_size = batch_size
        self.output_folder = output_folder
        self.coverage_system = SimpleGridCoverage(db_path=db_path)
        self.extractor = FastOSMExtractor(output_dir=output_folder)

        # Create batch tracking table
        self._init_batch_table()

    def _init_batch_table(self):
        """Initialize the batch tracking table"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS extraction_batches (
                    batch_id INTEGER PRIMARY KEY,
                    grid_ids TEXT NOT NULL,  -- JSON list of grid IDs
                    status TEXT DEFAULT 'pending',
                    total_tiles INTEGER DEFAULT 0,
                    extracted_tiles INTEGER DEFAULT 0,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    estimated_duration_hours REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def create_batches(self) -> int:
        """Create batches from all pending grids, organized in square regions

        Returns:
            Number of batches created
        """
        print("📦 Creating extraction batches in square regions...")

        # Get all pending grids with their grid coordinates
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            pending_grids = cursor.fetchall()

        if not pending_grids:
            print("❌ No pending grids found to create batches")
            return 0

        print(f"📊 Found {len(pending_grids):,} pending grids")

        # Clear ALL existing batches to rebuild with square regions
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches")
            conn.commit()
            print("🧹 Cleared all existing batches to rebuild with square regions")

        # Group grids into square regions (10x10 grids = 100 grids per batch)
        batches_created = 0
        region_size = 10  # 10x10 grid squares per batch

        # Create a dictionary to group grids by region
        regions = {}
        for grid_data in pending_grids:
            grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y = grid_data

            # Calculate which 10x10 region this grid belongs to
            region_x = grid_x // region_size
            region_y = grid_y // region_size
            region_key = (region_x, region_y)

            if region_key not in regions:
                regions[region_key] = []
            regions[region_key].append(grid_data)

        # Create batches from each region
        for region_key, region_grids in regions.items():
            region_x, region_y = region_key

            # Extract grid info
            grid_ids = [grid[0] for grid in region_grids]
            total_tiles = sum(grid[1] for grid in region_grids)

            # Estimate extraction time (MAXIMUM SPEED: 25-30 tiles/second with 50 workers + 8 servers)
            estimated_hours = (total_tiles / 25) / 3600

            # Create batch record
            batches_created += 1
            import json
            grid_ids_json = json.dumps(grid_ids)

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO extraction_batches
                    (batch_id, grid_ids, total_tiles, estimated_duration_hours)
                    VALUES (?, ?, ?, ?)
                ''', (batches_created, grid_ids_json, total_tiles, estimated_hours))
                conn.commit()

            # Calculate region bounds for display
            lats = [grid[2] for grid in region_grids]  # lat_min
            lngs = [grid[3] for grid in region_grids]  # lng_min
            region_lat_range = f"{min(lats):.2f}°-{max(lats):.2f}°N"
            region_lng_range = f"{max(lngs):.2f}°-{min(lngs):.2f}°W"

            print(f"  📦 Batch {batches_created}: Region({region_x},{region_y}) - {len(grid_ids)} grids")
            print(f"      📍 {region_lat_range}, {region_lng_range}")
            print(f"      🗺️  {total_tiles:,} tiles (~{estimated_hours:.1f}h)")

        print(f"✅ Created {batches_created} extraction batches organized in 10x10 regions")
        return batches_created

    def create_pennsylvania_batches(self) -> int:
        """Create batches focused on Pennsylvania state only

        Returns:
            Number of batches created
        """
        print("🗺️ Creating Pennsylvania-focused extraction batches...")

        # Pennsylvania bounds: roughly 39.0°-43.0°N, 81.0°-74.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 39.0 AND lat_max <= 43.0
                AND lng_min >= -81.0 AND lng_max <= -74.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            pa_grids = cursor.fetchall()

        if not pa_grids:
            print("❌ No Pennsylvania grids found")
            return 0

        print(f"📊 Found {len(pa_grids):,} Pennsylvania grids")

        # Clear ALL existing batches and focus on Pennsylvania
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches")
            conn.commit()
            print("🧹 Cleared all batches to focus on Pennsylvania")

        # Group Pennsylvania grids into very small regions (3x3 = 9 grids per batch for fastest completion)
        batches_created = 0
        region_size = 3  # 3x3 grid squares per batch for Pennsylvania - fastest feedback

        # Create a dictionary to group grids by region
        regions = {}
        for grid_data in pa_grids:
            grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y = grid_data

            # Calculate which 5x5 region this grid belongs to
            region_x = grid_x // region_size
            region_y = grid_y // region_size
            region_key = (region_x, region_y)

            if region_key not in regions:
                regions[region_key] = []
            regions[region_key].append(grid_data)

        # Create batches from each Pennsylvania region
        for region_key, region_grids in regions.items():
            region_x, region_y = region_key

            # Extract grid info
            grid_ids = [grid[0] for grid in region_grids]
            total_tiles = sum(grid[1] for grid in region_grids)

            # Estimate extraction time (MAXIMUM SPEED: 25-30 tiles/second with 50 workers + 8 servers)
            estimated_hours = (total_tiles / 25) / 3600

            # Create batch record
            batches_created += 1
            import json
            grid_ids_json = json.dumps(grid_ids)

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO extraction_batches
                    (batch_id, grid_ids, total_tiles, estimated_duration_hours)
                    VALUES (?, ?, ?, ?)
                ''', (batches_created, grid_ids_json, total_tiles, estimated_hours))
                conn.commit()

            # Calculate region bounds for display
            lats = [grid[2] for grid in region_grids]  # lat_min
            lngs = [grid[3] for grid in region_grids]  # lng_min
            region_lat_range = f"{min(lats):.2f}°-{max(lats):.2f}°N"
            region_lng_range = f"{max(lngs):.2f}°-{min(lngs):.2f}°W"

            print(f"  📦 PA Batch {batches_created}: Region({region_x},{region_y}) - {len(grid_ids)} grids")
            print(f"      📍 {region_lat_range}, {region_lng_range}")
            print(f"      🗺️  {total_tiles:,} tiles (~{estimated_hours:.1f}h)")

        total_tiles = sum(grid[1] for grid in pa_grids)
        print(f"✅ Created {batches_created} Pennsylvania extraction batches")
        print(f"📊 Total: {len(pa_grids)} grids, {total_tiles:,} tiles (~{total_tiles/25/3600:.1f} hours)")
        return batches_created

    def create_newyork_batches(self) -> int:
        """Create batches focused on New York state only

        Returns:
            Number of batches created
        """
        print("🗽 Creating New York-focused extraction batches...")

        # New York bounds: roughly 40.5°-45.0°N, 79.8°-71.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 40.5 AND lat_max <= 45.0
                AND lng_min >= -79.8 AND lng_max <= -71.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ny_grids = cursor.fetchall()

        if not ny_grids:
            print("❌ No New York grids found")
            return 0

        print(f"📊 Found {len(ny_grids):,} New York grids")

        # Clear existing pending batches and focus on New York
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on New York")

        # Group New York grids into small regions (3x3 = 9 grids per batch for fastest completion)
        batches_created = 0
        region_size = 3  # 3x3 grid squares per batch for New York - fastest feedback

        # Create a dictionary to group grids by region
        regions = {}
        for grid_data in ny_grids:
            grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y = grid_data

            # Calculate which 3x3 region this grid belongs to
            region_x = grid_x // region_size
            region_y = grid_y // region_size
            region_key = (region_x, region_y)

            if region_key not in regions:
                regions[region_key] = []
            regions[region_key].append(grid_data)

        # Create batches from each New York region
        for region_key, region_grids in regions.items():
            region_x, region_y = region_key

            # Extract grid info
            grid_ids = [grid[0] for grid in region_grids]
            total_tiles = sum(grid[1] for grid in region_grids)

            # Estimate extraction time (MAXIMUM SPEED: 25-30 tiles/second with 50 workers + 8 servers)
            estimated_hours = (total_tiles / 25) / 3600

            # Create batch record
            batches_created += 1
            import json
            grid_ids_json = json.dumps(grid_ids)

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO extraction_batches
                    (batch_id, grid_ids, total_tiles, estimated_duration_hours)
                    VALUES (?, ?, ?, ?)
                ''', (batches_created, grid_ids_json, total_tiles, estimated_hours))
                conn.commit()

            # Calculate region bounds for display
            lats = [grid[2] for grid in region_grids]  # lat_min
            lngs = [grid[3] for grid in region_grids]  # lng_min
            region_lat_range = f"{min(lats):.2f}°-{max(lats):.2f}°N"
            region_lng_range = f"{max(lngs):.2f}°-{min(lngs):.2f}°W"

            print(f"  📦 NY Batch {batches_created}: Region({region_x},{region_y}) - {len(grid_ids)} grids")
            print(f"      📍 {region_lat_range}, {region_lng_range}")
            print(f"      🗺️  {total_tiles:,} tiles (~{estimated_hours:.1f}h)")

        total_tiles = sum(grid[1] for grid in ny_grids)
        print(f"✅ Created {batches_created} New York extraction batches")
        print(f"📊 Total: {len(ny_grids)} grids, {total_tiles:,} tiles (~{total_tiles/25/3600:.1f} hours)")
        return batches_created

    def create_florida_batches(self) -> int:
        """Create batches focused on Florida state only"""
        print("🌴 Creating Florida-focused extraction batches...")

        # Florida bounds: roughly 24.5°-31.0°N, 87.6°-80.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 24.5 AND lat_max <= 31.0
                AND lng_min >= -87.6 AND lng_max <= -80.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            fl_grids = cursor.fetchall()

        if not fl_grids:
            print("❌ No Florida grids found")
            return 0

        print(f"📊 Found {len(fl_grids):,} Florida grids")

        # Clear existing pending batches and focus on Florida
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Florida")

        return self._create_state_batches(fl_grids, "FL")

    def create_north_carolina_batches(self) -> int:
        """Create batches focused on North Carolina state only"""
        print("🏔️ Creating North Carolina-focused extraction batches...")

        # North Carolina bounds: roughly 33.8°-36.6°N, 84.3°-75.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 33.8 AND lat_max <= 36.6
                AND lng_min >= -84.3 AND lng_max <= -75.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nc_grids = cursor.fetchall()

        if not nc_grids:
            print("❌ No North Carolina grids found")
            return 0

        print(f"📊 Found {len(nc_grids):,} North Carolina grids")

        # Clear existing pending batches and focus on North Carolina
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on North Carolina")

        return self._create_state_batches(nc_grids, "NC")

    def create_south_carolina_batches(self) -> int:
        """Create batches focused on South Carolina state only"""
        print("🌊 Creating South Carolina-focused extraction batches...")

        # South Carolina bounds: roughly 32.0°-35.2°N, 83.4°-78.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 32.0 AND lat_max <= 35.2
                AND lng_min >= -83.4 AND lng_max <= -78.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            sc_grids = cursor.fetchall()

        if not sc_grids:
            print("❌ No South Carolina grids found")
            return 0

        print(f"📊 Found {len(sc_grids):,} South Carolina grids")

        # Clear existing pending batches and focus on South Carolina
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on South Carolina")

        return self._create_state_batches(sc_grids, "SC")

    def create_alabama_batches(self) -> int:
        """Create batches focused on Alabama state only"""
        print("🏈 Creating Alabama-focused extraction batches...")

        # Alabama bounds: roughly 30.2°-35.0°N, 88.5°-84.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 30.2 AND lat_max <= 35.0
                AND lng_min >= -88.5 AND lng_max <= -84.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            al_grids = cursor.fetchall()

        if not al_grids:
            print("❌ No Alabama grids found")
            return 0

        print(f"📊 Found {len(al_grids):,} Alabama grids")

        # Clear existing pending batches and focus on Alabama
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Alabama")

        return self._create_state_batches(al_grids, "AL")

    def create_alaska_batches(self) -> int:
        """Create batches focused on Alaska state only"""
        print("🐻 Creating Alaska-focused extraction batches...")

        # Alaska bounds: roughly 54.0°-71.5°N, 172.0°-129.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 54.0 AND lat_max <= 71.5
                AND lng_min >= -172.0 AND lng_max <= -129.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ak_grids = cursor.fetchall()

        if not ak_grids:
            print("❌ No Alaska grids found")
            return 0

        print(f"📊 Found {len(ak_grids):,} Alaska grids")

        # Clear existing pending batches and focus on Alaska
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Alaska")

        return self._create_state_batches(ak_grids, "AK")

    def create_arizona_batches(self) -> int:
        """Create batches focused on Arizona state only"""
        print("🌵 Creating Arizona-focused extraction batches...")

        # Arizona bounds: roughly 31.3°-37.0°N, 114.8°-109.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 31.3 AND lat_max <= 37.0
                AND lng_min >= -114.8 AND lng_max <= -109.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            az_grids = cursor.fetchall()

        if not az_grids:
            print("❌ No Arizona grids found")
            return 0

        print(f"📊 Found {len(az_grids):,} Arizona grids")

        # Clear existing pending batches and focus on Arizona
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Arizona")

        return self._create_state_batches(az_grids, "AZ")

    def create_arkansas_batches(self) -> int:
        """Create batches focused on Arkansas state only"""
        print("🎣 Creating Arkansas-focused extraction batches...")

        # Arkansas bounds: roughly 33.0°-36.5°N, 94.6°-89.6°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 33.0 AND lat_max <= 36.5
                AND lng_min >= -94.6 AND lng_max <= -89.6
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ar_grids = cursor.fetchall()

        if not ar_grids:
            print("❌ No Arkansas grids found")
            return 0

        print(f"📊 Found {len(ar_grids):,} Arkansas grids")

        # Clear existing pending batches and focus on Arkansas
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Arkansas")

        return self._create_state_batches(ar_grids, "AR")

    def create_california_batches(self) -> int:
        """Create batches focused on California state only"""
        print("☀️ Creating California-focused extraction batches...")

        # California bounds: roughly 32.5°-42.0°N, 124.4°-114.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 32.5 AND lat_max <= 42.0
                AND lng_min >= -124.4 AND lng_max <= -114.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ca_grids = cursor.fetchall()

        if not ca_grids:
            print("❌ No California grids found")
            return 0

        print(f"📊 Found {len(ca_grids):,} California grids")

        # Clear existing pending batches and focus on California
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on California")

        return self._create_state_batches(ca_grids, "CA")

    def create_colorado_batches(self) -> int:
        """Create batches focused on Colorado state only"""
        print("🏔️ Creating Colorado-focused extraction batches...")

        # Colorado bounds: roughly 37.0°-41.0°N, 109.1°-102.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.0 AND lat_max <= 41.0
                AND lng_min >= -109.1 AND lng_max <= -102.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            co_grids = cursor.fetchall()

        if not co_grids:
            print("❌ No Colorado grids found")
            return 0

        print(f"📊 Found {len(co_grids):,} Colorado grids")

        # Clear existing pending batches and focus on Colorado
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Colorado")

        return self._create_state_batches(co_grids, "CO")

    def create_connecticut_batches(self) -> int:
        """Create batches focused on Connecticut state only"""
        print("🍂 Creating Connecticut-focused extraction batches...")

        # Connecticut bounds: roughly 40.9°-42.1°N, 73.7°-71.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 40.9 AND lat_max <= 42.1
                AND lng_min >= -73.7 AND lng_max <= -71.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ct_grids = cursor.fetchall()

        if not ct_grids:
            print("❌ No Connecticut grids found")
            return 0

        print(f"📊 Found {len(ct_grids):,} Connecticut grids")

        # Clear existing pending batches and focus on Connecticut
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Connecticut")

        return self._create_state_batches(ct_grids, "CT")

    def create_delaware_batches(self) -> int:
        """Create batches focused on Delaware state only"""
        print("🏖️ Creating Delaware-focused extraction batches...")

        # Delaware bounds: roughly 38.4°-39.8°N, 75.8°-75.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 38.4 AND lat_max <= 39.8
                AND lng_min >= -75.8 AND lng_max <= -75.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            de_grids = cursor.fetchall()

        if not de_grids:
            print("❌ No Delaware grids found")
            return 0

        print(f"📊 Found {len(de_grids):,} Delaware grids")

        # Clear existing pending batches and focus on Delaware
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Delaware")

        return self._create_state_batches(de_grids, "DE")

    def create_georgia_batches(self) -> int:
        """Create batches focused on Georgia state only"""
        print("🍑 Creating Georgia-focused extraction batches...")

        # Georgia bounds: roughly 30.4°-35.0°N, 85.6°-80.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 30.4 AND lat_max <= 35.0
                AND lng_min >= -85.6 AND lng_max <= -80.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ga_grids = cursor.fetchall()

        if not ga_grids:
            print("❌ No Georgia grids found")
            return 0

        print(f"📊 Found {len(ga_grids):,} Georgia grids")

        # Clear existing pending batches and focus on Georgia
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Georgia")

        return self._create_state_batches(ga_grids, "GA")

    def create_hawaii_batches(self) -> int:
        """Create batches focused on Hawaii state only"""
        print("🌺 Creating Hawaii-focused extraction batches...")

        # Hawaii bounds: roughly 18.9°-28.4°N, 178.3°-154.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 18.9 AND lat_max <= 28.4
                AND lng_min >= -178.3 AND lng_max <= -154.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            hi_grids = cursor.fetchall()

        if not hi_grids:
            print("❌ No Hawaii grids found")
            return 0

        print(f"📊 Found {len(hi_grids):,} Hawaii grids")

        # Clear existing pending batches and focus on Hawaii
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Hawaii")

        return self._create_state_batches(hi_grids, "HI")

    def create_idaho_batches(self) -> int:
        """Create batches focused on Idaho state only"""
        print("🥔 Creating Idaho-focused extraction batches...")

        # Idaho bounds: roughly 42.0°-49.0°N, 117.2°-111.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.0 AND lat_max <= 49.0
                AND lng_min >= -117.2 AND lng_max <= -111.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            id_grids = cursor.fetchall()

        if not id_grids:
            print("❌ No Idaho grids found")
            return 0

        print(f"📊 Found {len(id_grids):,} Idaho grids")

        # Clear existing pending batches and focus on Idaho
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Idaho")

        return self._create_state_batches(id_grids, "ID")

    def create_illinois_batches(self) -> int:
        """Create batches focused on Illinois state only"""
        print("🌽 Creating Illinois-focused extraction batches...")

        # Illinois bounds: roughly 36.9°-42.5°N, 91.5°-87.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 36.9 AND lat_max <= 42.5
                AND lng_min >= -91.5 AND lng_max <= -87.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            il_grids = cursor.fetchall()

        if not il_grids:
            print("❌ No Illinois grids found")
            return 0

        print(f"📊 Found {len(il_grids):,} Illinois grids")

        # Clear existing pending batches and focus on Illinois
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Illinois")

        return self._create_state_batches(il_grids, "IL")

    def create_indiana_batches(self) -> int:
        """Create batches focused on Indiana state only"""
        print("🏀 Creating Indiana-focused extraction batches...")

        # Indiana bounds: roughly 37.8°-41.8°N, 88.1°-84.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.8 AND lat_max <= 41.8
                AND lng_min >= -88.1 AND lng_max <= -84.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            in_grids = cursor.fetchall()

        if not in_grids:
            print("❌ No Indiana grids found")
            return 0

        print(f"📊 Found {len(in_grids):,} Indiana grids")

        # Clear existing pending batches and focus on Indiana
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Indiana")

        return self._create_state_batches(in_grids, "IN")

    def create_iowa_batches(self) -> int:
        """Create batches focused on Iowa state only"""
        print("🌾 Creating Iowa-focused extraction batches...")

        # Iowa bounds: roughly 40.4°-43.5°N, 96.6°-90.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 40.4 AND lat_max <= 43.5
                AND lng_min >= -96.6 AND lng_max <= -90.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ia_grids = cursor.fetchall()

        if not ia_grids:
            print("❌ No Iowa grids found")
            return 0

        print(f"📊 Found {len(ia_grids):,} Iowa grids")

        # Clear existing pending batches and focus on Iowa
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Iowa")

        return self._create_state_batches(ia_grids, "IA")

    def create_kansas_batches(self) -> int:
        """Create batches focused on Kansas state only"""
        print("🌪️ Creating Kansas-focused extraction batches...")

        # Kansas bounds: roughly 37.0°-40.0°N, 102.1°-94.6°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.0 AND lat_max <= 40.0
                AND lng_min >= -102.1 AND lng_max <= -94.6
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ks_grids = cursor.fetchall()

        if not ks_grids:
            print("❌ No Kansas grids found")
            return 0

        print(f"📊 Found {len(ks_grids):,} Kansas grids")

        # Clear existing pending batches and focus on Kansas
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Kansas")

        return self._create_state_batches(ks_grids, "KS")

    def create_kentucky_batches(self) -> int:
        """Create batches focused on Kentucky state only"""
        print("🐎 Creating Kentucky-focused extraction batches...")

        # Kentucky bounds: roughly 36.5°-39.1°N, 89.6°-81.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 36.5 AND lat_max <= 39.1
                AND lng_min >= -89.6 AND lng_max <= -81.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ky_grids = cursor.fetchall()

        if not ky_grids:
            print("❌ No Kentucky grids found")
            return 0

        print(f"📊 Found {len(ky_grids):,} Kentucky grids")

        # Clear existing pending batches and focus on Kentucky
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Kentucky")

        return self._create_state_batches(ky_grids, "KY")

    def create_louisiana_batches(self) -> int:
        """Create batches focused on Louisiana state only"""
        print("🎺 Creating Louisiana-focused extraction batches...")

        # Louisiana bounds: roughly 28.9°-33.0°N, 94.0°-88.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 28.9 AND lat_max <= 33.0
                AND lng_min >= -94.0 AND lng_max <= -88.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            la_grids = cursor.fetchall()

        if not la_grids:
            print("❌ No Louisiana grids found")
            return 0

        print(f"📊 Found {len(la_grids):,} Louisiana grids")

        # Clear existing pending batches and focus on Louisiana
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Louisiana")

        return self._create_state_batches(la_grids, "LA")

    def create_maine_batches(self) -> int:
        """Create batches focused on Maine state only"""
        print("🦞 Creating Maine-focused extraction batches...")

        # Maine bounds: roughly 43.1°-47.5°N, 71.1°-66.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 43.1 AND lat_max <= 47.5
                AND lng_min >= -71.1 AND lng_max <= -66.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            me_grids = cursor.fetchall()

        if not me_grids:
            print("❌ No Maine grids found")
            return 0

        print(f"📊 Found {len(me_grids):,} Maine grids")

        # Clear existing pending batches and focus on Maine
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Maine")

        return self._create_state_batches(me_grids, "ME")

    def create_maryland_batches(self) -> int:
        """Create batches focused on Maryland state only"""
        print("🦀 Creating Maryland-focused extraction batches...")

        # Maryland bounds: roughly 37.9°-39.7°N, 79.5°-75.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.9 AND lat_max <= 39.7
                AND lng_min >= -79.5 AND lng_max <= -75.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            md_grids = cursor.fetchall()

        if not md_grids:
            print("❌ No Maryland grids found")
            return 0

        print(f"📊 Found {len(md_grids):,} Maryland grids")

        # Clear existing pending batches and focus on Maryland
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Maryland")

        return self._create_state_batches(md_grids, "MD")

    def create_massachusetts_batches(self) -> int:
        """Create batches focused on Massachusetts state only"""
        print("🫖 Creating Massachusetts-focused extraction batches...")

        # Massachusetts bounds: roughly 41.2°-42.9°N, 73.5°-69.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 41.2 AND lat_max <= 42.9
                AND lng_min >= -73.5 AND lng_max <= -69.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ma_grids = cursor.fetchall()

        if not ma_grids:
            print("❌ No Massachusetts grids found")
            return 0

        print(f"📊 Found {len(ma_grids):,} Massachusetts grids")

        # Clear existing pending batches and focus on Massachusetts
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Massachusetts")

        return self._create_state_batches(ma_grids, "MA")

    def create_michigan_batches(self) -> int:
        """Create batches focused on Michigan state only"""
        print("🏭 Creating Michigan-focused extraction batches...")

        # Michigan bounds: roughly 41.7°-48.3°N, 90.4°-82.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 41.7 AND lat_max <= 48.3
                AND lng_min >= -90.4 AND lng_max <= -82.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            mi_grids = cursor.fetchall()

        if not mi_grids:
            print("❌ No Michigan grids found")
            return 0

        print(f"📊 Found {len(mi_grids):,} Michigan grids")

        # Clear existing pending batches and focus on Michigan
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Michigan")

        return self._create_state_batches(mi_grids, "MI")

    def create_minnesota_batches(self) -> int:
        """Create batches focused on Minnesota state only"""
        print("❄️ Creating Minnesota-focused extraction batches...")

        # Minnesota bounds: roughly 43.5°-49.4°N, 97.2°-89.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 43.5 AND lat_max <= 49.4
                AND lng_min >= -97.2 AND lng_max <= -89.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            mn_grids = cursor.fetchall()

        if not mn_grids:
            print("❌ No Minnesota grids found")
            return 0

        print(f"📊 Found {len(mn_grids):,} Minnesota grids")

        # Clear existing pending batches and focus on Minnesota
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Minnesota")

        return self._create_state_batches(mn_grids, "MN")

    def create_mississippi_batches(self) -> int:
        """Create batches focused on Mississippi state only"""
        print("🎸 Creating Mississippi-focused extraction batches...")

        # Mississippi bounds: roughly 30.2°-35.0°N, 91.7°-88.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 30.2 AND lat_max <= 35.0
                AND lng_min >= -91.7 AND lng_max <= -88.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ms_grids = cursor.fetchall()

        if not ms_grids:
            print("❌ No Mississippi grids found")
            return 0

        print(f"📊 Found {len(ms_grids):,} Mississippi grids")

        # Clear existing pending batches and focus on Mississippi
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Mississippi")

        return self._create_state_batches(ms_grids, "MS")

    def create_missouri_batches(self) -> int:
        """Create batches focused on Missouri state only"""
        print("⚾ Creating Missouri-focused extraction batches...")

        # Missouri bounds: roughly 36.0°-40.6°N, 95.8°-89.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 36.0 AND lat_max <= 40.6
                AND lng_min >= -95.8 AND lng_max <= -89.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            mo_grids = cursor.fetchall()

        if not mo_grids:
            print("❌ No Missouri grids found")
            return 0

        print(f"📊 Found {len(mo_grids):,} Missouri grids")

        # Clear existing pending batches and focus on Missouri
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Missouri")

        return self._create_state_batches(mo_grids, "MO")

    def create_montana_batches(self) -> int:
        """Create batches focused on Montana state only"""
        print("🦬 Creating Montana-focused extraction batches...")

        # Montana bounds: roughly 45.0°-49.0°N, 116.1°-104.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 45.0 AND lat_max <= 49.0
                AND lng_min >= -116.1 AND lng_max <= -104.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            mt_grids = cursor.fetchall()

        if not mt_grids:
            print("❌ No Montana grids found")
            return 0

        print(f"📊 Found {len(mt_grids):,} Montana grids")

        # Clear existing pending batches and focus on Montana
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Montana")

        return self._create_state_batches(mt_grids, "MT")

    def create_nebraska_batches(self) -> int:
        """Create batches focused on Nebraska state only"""
        print("🌾 Creating Nebraska-focused extraction batches...")

        # Nebraska bounds: roughly 40.0°-43.0°N, 104.1°-95.3°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 40.0 AND lat_max <= 43.0
                AND lng_min >= -104.1 AND lng_max <= -95.3
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ne_grids = cursor.fetchall()

        if not ne_grids:
            print("❌ No Nebraska grids found")
            return 0

        print(f"📊 Found {len(ne_grids):,} Nebraska grids")

        # Clear existing pending batches and focus on Nebraska
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Nebraska")

        return self._create_state_batches(ne_grids, "NE")

    def create_nevada_batches(self) -> int:
        """Create batches focused on Nevada state only"""
        print("🎰 Creating Nevada-focused extraction batches...")

        # Nevada bounds: roughly 35.0°-42.0°N, 120.0°-114.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 35.0 AND lat_max <= 42.0
                AND lng_min >= -120.0 AND lng_max <= -114.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nv_grids = cursor.fetchall()

        if not nv_grids:
            print("❌ No Nevada grids found")
            return 0

        print(f"📊 Found {len(nv_grids):,} Nevada grids")

        # Clear existing pending batches and focus on Nevada
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Nevada")

        return self._create_state_batches(nv_grids, "NV")

    def create_new_hampshire_batches(self) -> int:
        """Create batches focused on New Hampshire state only"""
        print("🍁 Creating New Hampshire-focused extraction batches...")

        # New Hampshire bounds: roughly 42.7°-45.3°N, 72.6°-70.7°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.7 AND lat_max <= 45.3
                AND lng_min >= -72.6 AND lng_max <= -70.7
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nh_grids = cursor.fetchall()

        if not nh_grids:
            print("❌ No New Hampshire grids found")
            return 0

        print(f"📊 Found {len(nh_grids):,} New Hampshire grids")

        # Clear existing pending batches and focus on New Hampshire
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on New Hampshire")

        return self._create_state_batches(nh_grids, "NH")

    def create_new_jersey_batches(self) -> int:
        """Create batches focused on New Jersey state only"""
        print("🏖️ Creating New Jersey-focused extraction batches...")

        # New Jersey bounds: roughly 38.9°-41.4°N, 75.6°-73.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 38.9 AND lat_max <= 41.4
                AND lng_min >= -75.6 AND lng_max <= -73.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nj_grids = cursor.fetchall()

        if not nj_grids:
            print("❌ No New Jersey grids found")
            return 0

        print(f"📊 Found {len(nj_grids):,} New Jersey grids")

        # Clear existing pending batches and focus on New Jersey
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on New Jersey")

        return self._create_state_batches(nj_grids, "NJ")

    def create_new_mexico_batches(self) -> int:
        """Create batches focused on New Mexico state only"""
        print("🌶️ Creating New Mexico-focused extraction batches...")

        # New Mexico bounds: roughly 31.3°-37.0°N, 109.1°-103.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 31.3 AND lat_max <= 37.0
                AND lng_min >= -109.1 AND lng_max <= -103.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nm_grids = cursor.fetchall()

        if not nm_grids:
            print("❌ No New Mexico grids found")
            return 0

        print(f"📊 Found {len(nm_grids):,} New Mexico grids")

        # Clear existing pending batches and focus on New Mexico
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on New Mexico")

        return self._create_state_batches(nm_grids, "NM")

    def create_north_dakota_batches(self) -> int:
        """Create batches focused on North Dakota state only"""
        print("🛢️ Creating North Dakota-focused extraction batches...")

        # North Dakota bounds: roughly 45.9°-49.0°N, 104.1°-96.6°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 45.9 AND lat_max <= 49.0
                AND lng_min >= -104.1 AND lng_max <= -96.6
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            nd_grids = cursor.fetchall()

        if not nd_grids:
            print("❌ No North Dakota grids found")
            return 0

        print(f"📊 Found {len(nd_grids):,} North Dakota grids")

        # Clear existing pending batches and focus on North Dakota
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on North Dakota")

        return self._create_state_batches(nd_grids, "ND")

    def create_ohio_batches(self) -> int:
        """Create batches focused on Ohio state only"""
        print("🌰 Creating Ohio-focused extraction batches...")

        # Ohio bounds: roughly 38.4°-41.9°N, 84.8°-80.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 38.4 AND lat_max <= 41.9
                AND lng_min >= -84.8 AND lng_max <= -80.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            oh_grids = cursor.fetchall()

        if not oh_grids:
            print("❌ No Ohio grids found")
            return 0

        print(f"📊 Found {len(oh_grids):,} Ohio grids")

        # Clear existing pending batches and focus on Ohio
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Ohio")

        return self._create_state_batches(oh_grids, "OH")

    def create_oklahoma_batches(self) -> int:
        """Create batches focused on Oklahoma state only"""
        print("🤠 Creating Oklahoma-focused extraction batches...")

        # Oklahoma bounds: roughly 33.6°-37.0°N, 103.0°-94.4°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 33.6 AND lat_max <= 37.0
                AND lng_min >= -103.0 AND lng_max <= -94.4
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ok_grids = cursor.fetchall()

        if not ok_grids:
            print("❌ No Oklahoma grids found")
            return 0

        print(f"📊 Found {len(ok_grids):,} Oklahoma grids")

        # Clear existing pending batches and focus on Oklahoma
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Oklahoma")

        return self._create_state_batches(ok_grids, "OK")

    def create_oregon_batches(self) -> int:
        """Create batches focused on Oregon state only"""
        print("🌲 Creating Oregon-focused extraction batches...")

        # Oregon bounds: roughly 42.0°-46.3°N, 124.6°-116.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.0 AND lat_max <= 46.3
                AND lng_min >= -124.6 AND lng_max <= -116.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            or_grids = cursor.fetchall()

        if not or_grids:
            print("❌ No Oregon grids found")
            return 0

        print(f"📊 Found {len(or_grids):,} Oregon grids")

        # Clear existing pending batches and focus on Oregon
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Oregon")

        return self._create_state_batches(or_grids, "OR")

    def create_rhode_island_batches(self) -> int:
        """Create batches focused on Rhode Island state only"""
        print("⚓ Creating Rhode Island-focused extraction batches...")

        # Rhode Island bounds: roughly 41.1°-42.0°N, 71.9°-71.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 41.1 AND lat_max <= 42.0
                AND lng_min >= -71.9 AND lng_max <= -71.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ri_grids = cursor.fetchall()

        if not ri_grids:
            print("❌ No Rhode Island grids found")
            return 0

        print(f"📊 Found {len(ri_grids):,} Rhode Island grids")

        # Clear existing pending batches and focus on Rhode Island
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Rhode Island")

        return self._create_state_batches(ri_grids, "RI")

    def create_south_dakota_batches(self) -> int:
        """Create batches focused on South Dakota state only"""
        print("🗿 Creating South Dakota-focused extraction batches...")

        # South Dakota bounds: roughly 42.5°-45.9°N, 104.1°-96.4°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.5 AND lat_max <= 45.9
                AND lng_min >= -104.1 AND lng_max <= -96.4
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            sd_grids = cursor.fetchall()

        if not sd_grids:
            print("❌ No South Dakota grids found")
            return 0

        print(f"📊 Found {len(sd_grids):,} South Dakota grids")

        # Clear existing pending batches and focus on South Dakota
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on South Dakota")

        return self._create_state_batches(sd_grids, "SD")

    def create_tennessee_batches(self) -> int:
        """Create batches focused on Tennessee state only"""
        print("🎵 Creating Tennessee-focused extraction batches...")

        # Tennessee bounds: roughly 35.0°-36.7°N, 90.3°-81.6°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 35.0 AND lat_max <= 36.7
                AND lng_min >= -90.3 AND lng_max <= -81.6
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            tn_grids = cursor.fetchall()

        if not tn_grids:
            print("❌ No Tennessee grids found")
            return 0

        print(f"📊 Found {len(tn_grids):,} Tennessee grids")

        # Clear existing pending batches and focus on Tennessee
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Tennessee")

        return self._create_state_batches(tn_grids, "TN")

    def create_texas_batches(self) -> int:
        """Create batches focused on Texas state only"""
        print("🤠 Creating Texas-focused extraction batches...")

        # Texas bounds: roughly 25.8°-36.5°N, 106.6°-93.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 25.8 AND lat_max <= 36.5
                AND lng_min >= -106.6 AND lng_max <= -93.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            tx_grids = cursor.fetchall()

        if not tx_grids:
            print("❌ No Texas grids found")
            return 0

        print(f"📊 Found {len(tx_grids):,} Texas grids")

        # Clear existing pending batches and focus on Texas
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Texas")

        return self._create_state_batches(tx_grids, "TX")

    def create_utah_batches(self) -> int:
        """Create batches focused on Utah state only"""
        print("🏜️ Creating Utah-focused extraction batches...")

        # Utah bounds: roughly 37.0°-42.0°N, 114.1°-109.0°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.0 AND lat_max <= 42.0
                AND lng_min >= -114.1 AND lng_max <= -109.0
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            ut_grids = cursor.fetchall()

        if not ut_grids:
            print("❌ No Utah grids found")
            return 0

        print(f"📊 Found {len(ut_grids):,} Utah grids")

        # Clear existing pending batches and focus on Utah
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Utah")

        return self._create_state_batches(ut_grids, "UT")

    def create_vermont_batches(self) -> int:
        """Create batches focused on Vermont state only"""
        print("🍁 Creating Vermont-focused extraction batches...")

        # Vermont bounds: roughly 42.7°-45.0°N, 73.4°-71.5°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.7 AND lat_max <= 45.0
                AND lng_min >= -73.4 AND lng_max <= -71.5
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            vt_grids = cursor.fetchall()

        if not vt_grids:
            print("❌ No Vermont grids found")
            return 0

        print(f"📊 Found {len(vt_grids):,} Vermont grids")

        # Clear existing pending batches and focus on Vermont
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Vermont")

        return self._create_state_batches(vt_grids, "VT")

    def create_virginia_batches(self) -> int:
        """Create batches focused on Virginia state only"""
        print("🏛️ Creating Virginia-focused extraction batches...")

        # Virginia bounds: roughly 36.5°-39.5°N, 83.7°-75.2°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 36.5 AND lat_max <= 39.5
                AND lng_min >= -83.7 AND lng_max <= -75.2
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            va_grids = cursor.fetchall()

        if not va_grids:
            print("❌ No Virginia grids found")
            return 0

        print(f"📊 Found {len(va_grids):,} Virginia grids")

        # Clear existing pending batches and focus on Virginia
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Virginia")

        return self._create_state_batches(va_grids, "VA")

    def create_washington_batches(self) -> int:
        """Create batches focused on Washington state only"""
        print("🌲 Creating Washington-focused extraction batches...")

        # Washington bounds: roughly 45.5°-49.0°N, 124.8°-116.9°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 45.5 AND lat_max <= 49.0
                AND lng_min >= -124.8 AND lng_max <= -116.9
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            wa_grids = cursor.fetchall()

        if not wa_grids:
            print("❌ No Washington grids found")
            return 0

        print(f"📊 Found {len(wa_grids):,} Washington grids")

        # Clear existing pending batches and focus on Washington
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Washington")

        return self._create_state_batches(wa_grids, "WA")

    def create_west_virginia_batches(self) -> int:
        """Create batches focused on West Virginia state only"""
        print("⛰️ Creating West Virginia-focused extraction batches...")

        # West Virginia bounds: roughly 37.2°-40.6°N, 82.6°-77.7°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 37.2 AND lat_max <= 40.6
                AND lng_min >= -82.6 AND lng_max <= -77.7
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            wv_grids = cursor.fetchall()

        if not wv_grids:
            print("❌ No West Virginia grids found")
            return 0

        print(f"📊 Found {len(wv_grids):,} West Virginia grids")

        # Clear existing pending batches and focus on West Virginia
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on West Virginia")

        return self._create_state_batches(wv_grids, "WV")

    def create_wisconsin_batches(self) -> int:
        """Create batches focused on Wisconsin state only"""
        print("🧀 Creating Wisconsin-focused extraction batches...")

        # Wisconsin bounds: roughly 42.5°-47.1°N, 92.9°-86.8°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 42.5 AND lat_max <= 47.1
                AND lng_min >= -92.9 AND lng_max <= -86.8
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            wi_grids = cursor.fetchall()

        if not wi_grids:
            print("❌ No Wisconsin grids found")
            return 0

        print(f"📊 Found {len(wi_grids):,} Wisconsin grids")

        # Clear existing pending batches and focus on Wisconsin
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Wisconsin")

        return self._create_state_batches(wi_grids, "WI")

    def create_wyoming_batches(self) -> int:
        """Create batches focused on Wyoming state only"""
        print("🦌 Creating Wyoming-focused extraction batches...")

        # Wyoming bounds: roughly 41.0°-45.0°N, 111.1°-104.1°W
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y
                FROM grid_squares
                WHERE lat_min >= 41.0 AND lat_max <= 45.0
                AND lng_min >= -111.1 AND lng_max <= -104.1
                AND status = 'pending'
                ORDER BY grid_y, grid_x
            ''')
            wy_grids = cursor.fetchall()

        if not wy_grids:
            print("❌ No Wyoming grids found")
            return 0

        print(f"📊 Found {len(wy_grids):,} Wyoming grids")

        # Clear existing pending batches and focus on Wyoming
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
            conn.commit()
            print("🧹 Cleared pending batches to focus on Wyoming")

        return self._create_state_batches(wy_grids, "WY")

    def _create_state_batches(self, state_grids, state_code):
        """Helper function to create batches for any state"""
        batches_created = 0
        region_size = 3  # 3x3 grid squares per batch for fastest completion

        # Create a dictionary to group grids by region
        regions = {}
        for grid_data in state_grids:
            grid_id, total_tiles, lat_min, lng_min, grid_x, grid_y = grid_data

            # Calculate which 3x3 region this grid belongs to
            region_x = grid_x // region_size
            region_y = grid_y // region_size
            region_key = (region_x, region_y)

            if region_key not in regions:
                regions[region_key] = []
            regions[region_key].append(grid_data)

        # Create batches from each region
        for region_key, region_grids in regions.items():
            region_x, region_y = region_key

            # Extract grid info
            grid_ids = [grid[0] for grid in region_grids]
            total_tiles = sum(grid[1] for grid in region_grids)

            # Estimate extraction time (MAXIMUM SPEED: 25-30 tiles/second)
            estimated_hours = (total_tiles / 25) / 3600

            # Create batch record
            batches_created += 1
            import json
            grid_ids_json = json.dumps(grid_ids)

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO extraction_batches
                    (batch_id, grid_ids, total_tiles, estimated_duration_hours)
                    VALUES (?, ?, ?, ?)
                ''', (batches_created, grid_ids_json, total_tiles, estimated_hours))
                conn.commit()

            # Calculate region bounds for display
            lats = [grid[2] for grid in region_grids]  # lat_min
            lngs = [grid[3] for grid in region_grids]  # lng_min
            region_lat_range = f"{min(lats):.2f}°-{max(lats):.2f}°N"
            region_lng_range = f"{max(lngs):.2f}°-{min(lngs):.2f}°W"

            print(f"  📦 {state_code} Batch {batches_created}: Region({region_x},{region_y}) - {len(grid_ids)} grids")
            print(f"      📍 {region_lat_range}, {region_lng_range}")
            print(f"      🗺️  {total_tiles:,} tiles (~{estimated_hours:.1f}h)")

        total_tiles = sum(grid[1] for grid in state_grids)
        print(f"✅ Created {batches_created} {state_code} extraction batches")
        print(f"📊 Total: {len(state_grids)} grids, {total_tiles:,} tiles (~{total_tiles/25/3600:.1f} hours)")
        return batches_created

    def get_batch_status(self) -> List[ExtractionBatch]:
        """Get status of all batches

        Returns:
            List of ExtractionBatch objects
        """
        batches = []

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT batch_id, grid_ids, status, total_tiles, extracted_tiles,
                       started_at, completed_at, estimated_duration_hours
                FROM extraction_batches
                ORDER BY batch_id
            ''')

            for row in cursor.fetchall():
                batch_id, grid_ids_json, status, total_tiles, extracted_tiles, \
                started_at, completed_at, estimated_hours = row

                import json
                grid_ids = json.loads(grid_ids_json)

                batches.append(ExtractionBatch(
                    batch_id=batch_id,
                    grid_ids=grid_ids,
                    status=status,
                    total_tiles=total_tiles,
                    extracted_tiles=extracted_tiles,
                    started_at=started_at,
                    completed_at=completed_at,
                    estimated_duration_hours=estimated_hours
                ))

        return batches

    def get_next_batch(self) -> Optional[ExtractionBatch]:
        """Get the next pending batch for extraction

        Returns:
            ExtractionBatch object or None if no pending batches
        """
        batches = self.get_batch_status()
        pending_batches = [b for b in batches if b.status == 'pending']

        if pending_batches:
            return pending_batches[0]
        return None

    async def extract_batch(self, batch_id: int) -> Tuple[int, int]:
        """Extract all grids in a specific batch

        Args:
            batch_id: ID of the batch to extract

        Returns:
            Tuple of (successful_grids, total_grids)
        """
        # Get batch info
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_ids, total_tiles FROM extraction_batches
                WHERE batch_id = ?
            ''', (batch_id,))
            result = cursor.fetchone()

            if not result:
                print(f"❌ Batch {batch_id} not found")
                return 0, 0

            import json
            grid_ids = json.loads(result[0])
            total_tiles = result[1]

        print(f"🚀 Starting extraction of Batch {batch_id}")
        print(f"   📊 {len(grid_ids)} grids, {total_tiles:,} tiles")

        # Mark batch as in progress
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE extraction_batches
                SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
                WHERE batch_id = ?
            ''', (batch_id,))
            conn.commit()

        start_time = time.time()
        successful_grids = 0
        total_extracted_tiles = 0

        # Extract each grid in the batch
        for i, grid_id in enumerate(grid_ids):
            print(f"\n📍 Processing grid {i+1}/{len(grid_ids)}: {grid_id}")

            # Get grid info
            grid_info = self.coverage_system.get_grid_info(grid_id)
            if not grid_info:
                print(f"⚠️ Grid {grid_id} not found, skipping")
                continue

            # Mark grid as in progress
            self.coverage_system.mark_grid_in_progress(grid_id)

            try:
                # Extract tiles for this grid
                success_count, total_count = await extract_grid_tiles(
                    grid_info, self.extractor, self.coverage_system, self.output_folder
                )

                if success_count > 0:
                    successful_grids += 1
                    total_extracted_tiles += success_count
                    print(f"✅ Grid {grid_id}: {success_count}/{total_count} tiles extracted")
                else:
                    print(f"❌ Grid {grid_id}: extraction failed")

            except Exception as e:
                print(f"💥 Error extracting grid {grid_id}: {e}")
                continue

            # Update batch progress
            batch_progress = ((i + 1) / len(grid_ids)) * 100
            print(f"   📈 Batch progress: {batch_progress:.1f}% ({i+1}/{len(grid_ids)} grids)")

        # Mark batch as completed
        extraction_time = time.time() - start_time

        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                UPDATE extraction_batches
                SET status = 'completed',
                    completed_at = CURRENT_TIMESTAMP,
                    extracted_tiles = ?
                WHERE batch_id = ?
            ''', (total_extracted_tiles, batch_id))
            conn.commit()

        print(f"\n🎉 Batch {batch_id} completed!")
        print(f"   ✅ Successful grids: {successful_grids}/{len(grid_ids)}")
        print(f"   📊 Total tiles extracted: {total_extracted_tiles:,}")
        print(f"   ⏱️ Time: {extraction_time/3600:.1f} hours")
        print(f"   🚀 Rate: {total_extracted_tiles/extraction_time:.1f} tiles/second")

        return successful_grids, len(grid_ids)

    def show_batch_summary(self):
        """Display a summary of all batches"""
        batches = self.get_batch_status()

        if not batches:
            print("📦 No extraction batches found. Run create_batches() first.")
            return

        print(f"\n📦 Extraction Batch Summary ({len(batches)} batches)")
        print("=" * 70)

        # Summary statistics
        total_tiles = sum(b.total_tiles for b in batches)
        extracted_tiles = sum(b.extracted_tiles for b in batches)
        pending_batches = [b for b in batches if b.status == 'pending']
        completed_batches = [b for b in batches if b.status == 'completed']
        in_progress_batches = [b for b in batches if b.status == 'in_progress']

        print(f"📊 Overall Progress: {extracted_tiles:,}/{total_tiles:,} tiles ({extracted_tiles/total_tiles*100:.1f}%)")
        print(f"📈 Batch Status:")
        print(f"   ✅ Completed: {len(completed_batches)}")
        print(f"   🔄 In Progress: {len(in_progress_batches)}")
        print(f"   ⏳ Pending: {len(pending_batches)}")
        print()

        # Show first 10 batches
        print("📋 Batch Details (first 10):")
        for batch in batches[:10]:
            status_icon = {'pending': '⏳', 'in_progress': '🔄', 'completed': '✅', 'failed': '❌'}.get(batch.status, '❓')
            progress = (batch.extracted_tiles / batch.total_tiles * 100) if batch.total_tiles > 0 else 0

            print(f"   {status_icon} Batch {batch.batch_id:3d}: {len(batch.grid_ids):3d} grids, "
                  f"{batch.extracted_tiles:,}/{batch.total_tiles:,} tiles ({progress:.1f}%) "
                  f"~{batch.estimated_duration_hours:.1f}h")

        if len(batches) > 10:
            print(f"   ... and {len(batches) - 10} more batches")

    async def extract_next_batch(self) -> bool:
        """Extract the next pending batch

        Returns:
            True if a batch was extracted, False if no pending batches
        """
        next_batch = self.get_next_batch()
        if not next_batch:
            print("✅ No pending batches found - all extraction complete!")
            return False

        print(f"🎯 Starting next batch: Batch {next_batch.batch_id}")
        await self.extract_batch(next_batch.batch_id)
        return True


# Convenience functions for easy use
async def create_and_show_batches():
    """Create batches and show summary"""
    manager = BatchExtractionManager()
    manager.create_batches()
    manager.show_batch_summary()

async def extract_one_batch():
    """Extract the next pending batch"""
    manager = BatchExtractionManager()
    success = await manager.extract_next_batch()
    if success:
        manager.show_batch_summary()
    return success


if __name__ == "__main__":
    print("🚀 Batch Extraction Manager")
    print("Available functions:")
    print("  • create_and_show_batches() - Create all batches and show summary")
    print("  • extract_one_batch() - Extract the next pending batch")
    print("  • manager.show_batch_summary() - Show current batch status")