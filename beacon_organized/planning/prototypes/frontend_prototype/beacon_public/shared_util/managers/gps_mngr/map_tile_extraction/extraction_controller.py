#!/usr/bin/env python3
"""
Extraction Controller with Start/Stop Interface
===============================================

Advanced controller for batch extraction with start/stop functionality,
interruption handling, and comprehensive progress tracking.
"""

import asyncio
import sqlite3
import time
import signal
import json
import sys
from dataclasses import dataclass
from typing import Optional, Dict, List
from pathlib import Path
import threading
from datetime import datetime

from batch_extraction_manager import BatchExtractionManager
from gridmap_squares import SimpleGridCoverage
from fast_osm_extractor import FastOSMExtractor


@dataclass
class ExtractionStatus:
    """Current extraction status"""
    is_running: bool = False
    current_batch_id: Optional[int] = None
    current_grid_index: int = 0
    total_grids_in_batch: int = 0
    session_start_time: Optional[float] = None
    session_tiles_extracted: int = 0
    session_grids_completed: int = 0


class ExtractionController:
    """Advanced extraction controller with start/stop functionality"""

    def __init__(self, db_path: str = "simple_grid_coverage.db"):
        self.db_path = db_path
        self.batch_manager = BatchExtractionManager(db_path=db_path)
        self.status = ExtractionStatus()
        self.stop_requested = False

        # Signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        # Initialize extraction state table
        self._init_controller_table()

    def _init_controller_table(self):
        """Initialize controller state tracking table"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS extraction_state (
                    id INTEGER PRIMARY KEY,
                    session_id TEXT UNIQUE,
                    is_running INTEGER DEFAULT 0,
                    current_batch_id INTEGER,
                    current_grid_index INTEGER DEFAULT 0,
                    session_start_time TIMESTAMP,
                    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()

    def _signal_handler(self, signum, frame):
        """Handle interruption signals gracefully"""
        print(f"\n🛑 Received signal {signum}, initiating graceful shutdown...")
        self.request_stop()

    def request_stop(self):
        """Request extraction to stop gracefully"""
        self.stop_requested = True
        print("🛑 Stop requested - will complete current grid and stop")

    def get_batch_progress(self) -> Dict:
        """Get comprehensive batch progress information"""
        batches = self.batch_manager.get_batch_status()

        completed_batches = [b for b in batches if b.status == 'completed']
        in_progress_batches = [b for b in batches if b.status == 'in_progress']
        pending_batches = [b for b in batches if b.status == 'pending']

        total_tiles = sum(b.total_tiles for b in batches)
        extracted_tiles = sum(b.extracted_tiles for b in batches)

        return {
            'total_batches': len(batches),
            'completed_batches': len(completed_batches),
            'in_progress_batches': len(in_progress_batches),
            'pending_batches': len(pending_batches),
            'total_tiles': total_tiles,
            'extracted_tiles': extracted_tiles,
            'completion_percentage': (extracted_tiles / total_tiles * 100) if total_tiles > 0 else 0,
            'current_status': self.status,
            'next_batch_id': pending_batches[0].batch_id if pending_batches else None
        }

    def cleanup_interrupted_batch(self, batch_id: int):
        """Clean up partially completed batch by resetting all grids to pending"""
        print(f"🧹 Cleaning up interrupted batch {batch_id}...")

        # Get grids in this batch
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                'SELECT grid_ids FROM extraction_batches WHERE batch_id = ?',
                (batch_id,)
            )
            result = cursor.fetchone()

            if not result:
                print(f"❌ Batch {batch_id} not found")
                return

            grid_ids = json.loads(result[0])

            # Reset all grids in batch to pending status and zero extracted tiles
            reset_count = 0
            for grid_id in grid_ids:
                cursor = conn.execute('''
                    UPDATE grid_squares
                    SET status = 'pending', extracted_tiles = 0
                    WHERE grid_id = ? AND status = 'in_progress'
                ''', (grid_id,))

                if cursor.rowcount > 0:
                    reset_count += 1

            # Reset batch status to pending
            conn.execute('''
                UPDATE extraction_batches
                SET status = 'pending', extracted_tiles = 0, started_at = NULL
                WHERE batch_id = ?
            ''', (batch_id,))

            conn.commit()

        print(f"✅ Reset {reset_count} grids to pending status")
        print(f"🔄 Batch {batch_id} status reset to pending")

    async def extract_batch_with_interruption_handling(self, batch_id: int) -> Dict:
        """Extract a batch with robust interruption handling"""
        self.stop_requested = False
        self.status.is_running = True
        self.status.current_batch_id = batch_id
        self.status.session_start_time = time.time()

        print(f"🚀 Starting controlled extraction of Batch {batch_id}")

        try:
            # Get batch info
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    'SELECT grid_ids, total_tiles FROM extraction_batches WHERE batch_id = ?',
                    (batch_id,)
                )
                result = cursor.fetchone()

                if not result:
                    return {'success': False, 'error': f'Batch {batch_id} not found'}

                grid_ids = json.loads(result[0])
                total_tiles = result[1]

            self.status.total_grids_in_batch = len(grid_ids)

            # Mark batch as in progress
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    UPDATE extraction_batches
                    SET status = 'in_progress', started_at = CURRENT_TIMESTAMP
                    WHERE batch_id = ?
                ''', (batch_id,))
                conn.commit()

            # Initialize extractor and coverage system
            extractor = FastOSMExtractor()
            coverage_system = SimpleGridCoverage(db_path=self.db_path)

            successful_grids = 0
            total_extracted_tiles = 0

            # Process each grid with interruption checking
            for i, grid_id in enumerate(grid_ids):
                if self.stop_requested:
                    print(f"\n🛑 Stop requested at grid {i+1}/{len(grid_ids)}")
                    break

                self.status.current_grid_index = i + 1

                print(f"\n📍 Processing grid {i+1}/{len(grid_ids)}: {grid_id}")

                # Get grid info
                grid_info = coverage_system.get_grid_info(grid_id)
                if not grid_info:
                    print(f"⚠️ Grid {grid_id} not found, skipping")
                    continue

                # Mark grid as in progress
                coverage_system.mark_grid_in_progress(grid_id)

                try:
                    # Import the extraction function
                    from grid_extraction import extract_grid_tiles

                    # Extract tiles for this grid
                    success_count, total_count = await extract_grid_tiles(
                        grid_info, extractor, coverage_system
                    )

                    if success_count > 0:
                        successful_grids += 1
                        total_extracted_tiles += success_count
                        self.status.session_tiles_extracted += success_count
                        self.status.session_grids_completed += 1

                        print(f"✅ Grid {grid_id}: {success_count}/{total_count} tiles extracted")
                    else:
                        print(f"❌ Grid {grid_id}: extraction failed")

                except Exception as e:
                    print(f"💥 Error extracting grid {grid_id}: {e}")
                    # Reset grid to pending on error
                    with sqlite3.connect(self.db_path) as conn:
                        conn.execute('''
                            UPDATE grid_squares
                            SET status = 'pending', extracted_tiles = 0
                            WHERE grid_id = ?
                        ''', (grid_id,))
                        conn.commit()
                    continue

                # Show progress
                batch_progress = ((i + 1) / len(grid_ids)) * 100
                print(f"   📈 Batch progress: {batch_progress:.1f}% ({i+1}/{len(grid_ids)} grids)")

            # Determine final batch status
            if self.stop_requested:
                print(f"\n⏹️ Batch {batch_id} extraction interrupted")
                batch_status = 'pending'  # Will be cleaned up
                success = False
            else:
                print(f"\n🎉 Batch {batch_id} completed successfully!")
                batch_status = 'completed'
                success = True

            # Update batch status
            with sqlite3.connect(self.db_path) as conn:
                if success:
                    conn.execute('''
                        UPDATE extraction_batches
                        SET status = 'completed', completed_at = CURRENT_TIMESTAMP,
                            extracted_tiles = ?
                        WHERE batch_id = ?
                    ''', (total_extracted_tiles, batch_id))
                else:
                    # Don't update status here - cleanup will handle it
                    pass
                conn.commit()

            extraction_time = time.time() - self.status.session_start_time

            result = {
                'success': success,
                'batch_id': batch_id,
                'successful_grids': successful_grids,
                'total_grids': len(grid_ids),
                'extracted_tiles': total_extracted_tiles,
                'extraction_time_hours': extraction_time / 3600,
                'interrupted': self.stop_requested
            }

            return result

        except Exception as e:
            print(f"💥 Critical error in batch extraction: {e}")
            return {'success': False, 'error': str(e)}

        finally:
            self.status.is_running = False
            self.status.current_batch_id = None

            # Clean up if interrupted
            if self.stop_requested:
                self.cleanup_interrupted_batch(batch_id)

    async def start_extraction(self, batch_id: Optional[int] = None) -> Dict:
        """Start extraction process"""
        if self.status.is_running:
            return {'success': False, 'error': 'Extraction already running'}

        if batch_id is None:
            # Get next pending batch
            next_batch = self.batch_manager.get_next_batch()
            if not next_batch:
                return {'success': False, 'error': 'No pending batches available'}
            batch_id = next_batch.batch_id

        print(f"🎯 Starting extraction of Batch {batch_id}")
        result = await self.extract_batch_with_interruption_handling(batch_id)

        return result

    def stop_extraction(self):
        """Stop current extraction gracefully"""
        if not self.status.is_running:
            print("ℹ️ No extraction currently running")
            return {'success': False, 'error': 'No extraction running'}

        print("🛑 Requesting extraction stop...")
        self.request_stop()
        return {'success': True, 'message': 'Stop requested'}

    def show_status(self):
        """Show detailed extraction status"""
        progress = self.get_batch_progress()

        print("\n" + "="*70)
        print("🗺️ OSM TILE EXTRACTION STATUS")
        print("="*70)

        print(f"📊 Overall Progress:")
        batch_pct = (progress['completed_batches']/progress['total_batches']*100) if progress['total_batches'] > 0 else 0
        print(f"   Batches: {progress['completed_batches']}/{progress['total_batches']} completed ({batch_pct:.1f}%)")
        print(f"   Tiles: {progress['extracted_tiles']:,}/{progress['total_tiles']:,} extracted ({progress['completion_percentage']:.1f}%)")

        if progress['in_progress_batches'] > 0:
            print(f"   🔄 In Progress: {progress['in_progress_batches']} batch(es)")

        if progress['pending_batches'] > 0:
            print(f"   ⏳ Pending: {progress['pending_batches']} batch(es)")

        print(f"\n🎯 Current Session:")
        if self.status.is_running:
            elapsed = time.time() - self.status.session_start_time if self.status.session_start_time else 0
            print(f"   Status: 🔄 RUNNING (Batch {self.status.current_batch_id})")
            print(f"   Grid: {self.status.current_grid_index}/{self.status.total_grids_in_batch}")
            print(f"   Session time: {elapsed/3600:.1f} hours")
            print(f"   Session tiles: {self.status.session_tiles_extracted:,}")
            print(f"   Session grids: {self.status.session_grids_completed}")
        else:
            print(f"   Status: ⏹️ STOPPED")

        if progress['next_batch_id']:
            print(f"\n➡️ Next batch: Batch {progress['next_batch_id']}")
        else:
            print(f"\n✅ All batches completed!")

        print("="*70)


# Convenience functions for command line use
async def start_extraction_cli(batch_id: Optional[int] = None):
    """Start extraction from command line"""
    controller = ExtractionController()
    controller.show_status()
    print()

    result = await controller.start_extraction(batch_id)

    if result['success']:
        print(f"\n✅ Extraction completed successfully!")
        print(f"   📊 {result['successful_grids']}/{result['total_grids']} grids completed")
        print(f"   🗺️ {result['extracted_tiles']:,} tiles extracted")
        print(f"   ⏱️ Time: {result['extraction_time_hours']:.1f} hours")
        if result.get('interrupted'):
            print(f"   ⏹️ Extraction was interrupted but cleaned up properly")
    else:
        print(f"\n❌ Extraction failed: {result.get('error', 'Unknown error')}")

    print()
    controller.show_status()

def stop_extraction_cli():
    """Stop extraction from command line"""
    controller = ExtractionController()
    result = controller.stop_extraction()

    if result['success']:
        print("✅ Stop request sent")
    else:
        print(f"❌ {result['error']}")

def show_status_cli():
    """Show status from command line"""
    controller = ExtractionController()
    controller.show_status()


if __name__ == "__main__":
    print("🎮 Extraction Controller")
    print("Available functions:")
    print("  • start_extraction_cli() - Start next batch")
    print("  • start_extraction_cli(5) - Start specific batch")
    print("  • stop_extraction_cli() - Stop current extraction")
    print("  • show_status_cli() - Show detailed status")