#!/usr/bin/env python3
"""
Fast OSM Tile Extractor - Clean Version for Grid System
======================================================

Optimized tile extractor designed to work with the SimpleGridCoverage system.
Includes concurrent downloads, multiple tile servers, and rate limiting.
"""

import asyncio
import aiohttp
import time
import math
from typing import List, Dict, Optional, Tuple
import random
from dataclasses import dataclass
from pathlib import Path
import json


@dataclass
class TileServer:
    """Configuration for a tile server"""
    name: str
    url_template: str
    max_requests_per_second: float = 1.0
    user_agent: str = "OSM Training Data Extractor 1.0"


class FastOSMExtractor:
    """High-speed OSM tile extractor optimized for grid-based extraction"""

    def __init__(self, output_dir: str = "osm_tiles", max_workers: int = 50, zoom_level: int = 15):
        self.output_dir = Path(output_dir)
        self.max_workers = max_workers
        self.zoom_level = zoom_level

        # Setup tile servers
        self.tile_servers = self._setup_tile_servers()
        self.server_rotation_index = 0

        # Rate limiting per server
        self.server_delays = {}
        self.last_request_times = {}

        self.setup_directories()

    def _setup_tile_servers(self) -> List[TileServer]:
        """Setup multiple tile servers for load distribution"""
        return [
            TileServer(
                name="OpenStreetMap",
                url_template="https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                max_requests_per_second=4.0,  # MAXIMUM SPEED
                user_agent="OSM ML Training Data Collector"
            ),
            TileServer(
                name="OpenStreetMap-DE",
                url_template="https://tile.openstreetmap.de/{z}/{x}/{y}.png",
                max_requests_per_second=4.0  # MAXIMUM SPEED
            ),
            TileServer(
                name="OpenTopoMap",
                url_template="https://tile.opentopomap.org/{z}/{x}/{y}.png",
                max_requests_per_second=2.0  # MAXIMUM SPEED
            ),
            TileServer(
                name="OpenStreetMap-FR",
                url_template="https://tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
                max_requests_per_second=3.0  # MAXIMUM SPEED
            ),
            TileServer(
                name="CartoDB-Positron",
                url_template="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
                max_requests_per_second=5.0  # MAXIMUM SPEED
            ),
            # ADD MORE HIGH-SPEED SERVERS
            TileServer(
                name="CartoDB-Dark",
                url_template="https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
                max_requests_per_second=5.0
            ),
            TileServer(
                name="ESRI-WorldImagery",
                url_template="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                max_requests_per_second=4.0
            ),
            TileServer(
                name="Stamen-Terrain",
                url_template="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png",
                max_requests_per_second=6.0
            )
        ]

    def setup_directories(self):
        """Create necessary directories"""
        self.output_dir.mkdir(exist_ok=True)

        # Create zoom level directory
        zoom_dir = self.output_dir / str(self.zoom_level)
        zoom_dir.mkdir(exist_ok=True)

    def deg2num(self, lat_deg: float, lon_deg: float, zoom: int) -> Tuple[int, int]:
        """Convert latitude/longitude to tile numbers"""
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return (xtile, ytile)

    def num2deg(self, xtile: int, ytile: int, zoom: int) -> Tuple[float, float]:
        """Convert tile numbers to latitude/longitude"""
        n = 2.0 ** zoom
        lon_deg = xtile / n * 360.0 - 180.0
        lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
        lat_deg = math.degrees(lat_rad)
        return (lat_deg, lon_deg)

    def get_next_server(self) -> TileServer:
        """Get next server using round-robin rotation"""
        server = self.tile_servers[self.server_rotation_index]
        self.server_rotation_index = (self.server_rotation_index + 1) % len(self.tile_servers)
        return server

    async def respect_rate_limit(self, server: TileServer):
        """Ensure we respect server rate limits"""
        server_name = server.name
        min_interval = 1.0 / server.max_requests_per_second

        if server_name in self.last_request_times:
            time_since_last = time.time() - self.last_request_times[server_name]
            if time_since_last < min_interval:
                sleep_time = min_interval - time_since_last
                await asyncio.sleep(sleep_time)

        self.last_request_times[server_name] = time.time()

    async def download_tile(self, session: aiohttp.ClientSession, tile_info: Dict) -> bool:
        """Download a single tile"""
        x, y, z = tile_info['x'], tile_info['y'], tile_info['z']

        # Create tile path
        tile_dir = self.output_dir / str(z) / str(x)
        tile_dir.mkdir(parents=True, exist_ok=True)
        tile_path = tile_dir / f"{y}.png"

        # Skip if already exists
        if tile_path.exists():
            return True

        # Get server and respect rate limits
        server = self.get_next_server()
        await self.respect_rate_limit(server)

        # Build URL
        url = server.url_template.format(z=z, x=x, y=y)

        try:
            headers = {'User-Agent': server.user_agent}
            async with session.get(url, headers=headers, timeout=30) as response:
                if response.status == 200:
                    content = await response.read()
                    tile_path.write_bytes(content)
                    return True
                else:
                    print(f"❌ Failed to download {x}/{y}/{z}: HTTP {response.status}")
                    return False

        except asyncio.TimeoutError:
            print(f"⏰ Timeout downloading {x}/{y}/{z}")
            return False
        except Exception as e:
            print(f"❌ Error downloading {x}/{y}/{z}: {e}")
            return False

    async def download_tiles_batch_async(self, tiles: List[Dict]) -> List[bool]:
        """Download a batch of tiles concurrently"""
        if not tiles:
            return []

        # Create semaphore to limit concurrent downloads
        semaphore = asyncio.Semaphore(self.max_workers)

        async def download_with_semaphore(tile_info):
            async with semaphore:
                async with aiohttp.ClientSession() as session:
                    return await self.download_tile(session, tile_info)

        # Create tasks for all tiles
        tasks = [download_with_semaphore(tile) for tile in tiles]

        # Wait for all downloads to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Convert exceptions to False
        success_results = []
        for result in results:
            if isinstance(result, Exception):
                success_results.append(False)
            else:
                success_results.append(result)

        return success_results

    def generate_tiles_for_bbox(self, lat_min: float, lat_max: float,
                               lng_min: float, lng_max: float) -> List[Dict]:
        """Generate list of tiles for a bounding box"""
        tiles = []

        # Convert bounds to tile coordinates
        min_x, max_y = self.deg2num(lat_min, lng_min, self.zoom_level)
        max_x, min_y = self.deg2num(lat_max, lng_max, self.zoom_level)

        # Generate all tiles in the bounding box
        for x in range(min_x, max_x + 1):
            for y in range(min_y, max_y + 1):
                lat, lng = self.num2deg(x, y, self.zoom_level)
                tiles.append({
                    'x': x,
                    'y': y,
                    'z': self.zoom_level,
                    'lat': lat,
                    'lng': lng
                })

        return tiles

    async def extract_bbox_async(self, lat_min: float, lat_max: float,
                                lng_min: float, lng_max: float) -> Dict:
        """Extract all tiles for a bounding box"""
        print(f"🎯 Extracting bbox: {lat_min:.3f}-{lat_max:.3f}, {lng_min:.3f}-{lng_max:.3f}")

        # Generate tiles
        tiles = self.generate_tiles_for_bbox(lat_min, lat_max, lng_min, lng_max)

        if not tiles:
            return {'success': 0, 'total': 0, 'success_rate': 0}

        print(f"📦 Total tiles to extract: {len(tiles):,}")

        # Download tiles in batches
        start_time = time.time()
        batch_size = 50
        total_success = 0

        for i in range(0, len(tiles), batch_size):
            batch = tiles[i:i + batch_size]
            batch_results = await self.download_tiles_batch_async(batch)
            batch_success = sum(batch_results)
            total_success += batch_success

            # Progress update
            progress = (i + len(batch)) / len(tiles) * 100
            print(f"⚡ Progress: {progress:.1f}% ({total_success:,}/{i + len(batch):,} tiles)")

        total_time = time.time() - start_time
        success_rate = (total_success / len(tiles)) * 100

        print(f"✅ Extraction complete!")
        print(f"   Success: {total_success:,}/{len(tiles):,} tiles ({success_rate:.1f}%)")
        print(f"   Time: {total_time:.1f}s ({total_success/total_time:.1f} tiles/sec)")

        return {
            'success': total_success,
            'total': len(tiles),
            'success_rate': success_rate,
            'time': total_time
        }

    def get_extraction_stats(self) -> Dict:
        """Get statistics about extracted tiles"""
        total_files = 0
        total_size = 0

        if self.output_dir.exists():
            for file_path in self.output_dir.rglob("*.png"):
                total_files += 1
                total_size += file_path.stat().st_size

        return {
            'total_tiles': total_files,
            'total_size_mb': total_size / (1024 * 1024),
            'avg_tile_size_kb': (total_size / total_files / 1024) if total_files > 0 else 0
        }


# Convenience functions for easy use
async def extract_region_async(lat_min: float, lat_max: float, lng_min: float, lng_max: float,
                              zoom_level: int = 15, output_dir: str = "osm_tiles"):
    """Quick function to extract a region"""
    extractor = FastOSMExtractor(output_dir=output_dir, zoom_level=zoom_level)
    return await extractor.extract_bbox_async(lat_min, lat_max, lng_min, lng_max)


def test_extractor():
    """Test the extractor with a small area"""
    async def run_test():
        # Small test area (downtown area)
        lat_min, lat_max = 37.7749, 37.7849  # San Francisco - small area
        lng_min, lng_max = -122.4294, -122.4194

        extractor = FastOSMExtractor(output_dir="test_tiles", zoom_level=15)
        result = await extractor.extract_bbox_async(lat_min, lat_max, lng_min, lng_max)

        print(f"\n🧪 Test Results:")
        print(f"   Tiles extracted: {result['success']}/{result['total']}")
        print(f"   Success rate: {result['success_rate']:.1f}%")

        stats = extractor.get_extraction_stats()
        print(f"   Total files: {stats['total_tiles']}")
        print(f"   Total size: {stats['total_size_mb']:.2f} MB")

    asyncio.run(run_test())


if __name__ == "__main__":
    test_extractor()