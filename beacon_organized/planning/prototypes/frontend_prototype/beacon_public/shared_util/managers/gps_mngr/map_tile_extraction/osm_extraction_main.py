#!/usr/bin/env python3
"""
OSM Tile Extraction - Main Script
=================================

Main entry point for the grid-based OSM tile extraction system.
This script provides a clean interface using the modular functions.
"""

import asyncio
import time
from pathlib import Path

# Import our modules
from gridmap_squares import SimpleGridCoverage
from fast_osm_extractor import FastOSMExtractor
from grid_extraction import (
    extract_single_grid,
    extract_multiple_grids,
    extract_coastal_grids,
    test_single_extraction
)
from grid_monitoring import (
    show_grid_progress,
    show_next_grids,
    show_state_statistics,
    show_recent_activity,
    quick_status,
    show_grid_details,
    show_extraction_summary,
    get_grid_recommendations
)


class OSMExtractionManager:
    """Main manager for OSM tile extraction operations"""

    def __init__(self, zoom_level=15, grid_size_km=25.0, output_folder="osm_tiles"):
        """Initialize the extraction manager

        Args:
            zoom_level: OSM zoom level for tiles
            grid_size_km: Size of grid squares in kilometers
            output_folder: Output directory for extracted tiles
        """
        self.zoom_level = zoom_level
        self.grid_size_km = grid_size_km
        self.output_folder = Path(output_folder)

        # Initialize systems
        print("🚀 Initializing OSM Extraction Manager...")

        # Create coverage system
        self.coverage_system = SimpleGridCoverage(
            db_path="simple_grid_coverage.db",
            zoom_level=zoom_level,
            grid_size_km=grid_size_km
        )

        # Create extractor
        self.extractor = FastOSMExtractor(
            zoom_level=zoom_level,
            output_dir=str(self.output_folder)
        )

        # Ensure output directory exists
        self.output_folder.mkdir(exist_ok=True)

        print(f"✅ Manager initialized:")
        print(f"   Zoom level: {zoom_level}")
        print(f"   Grid size: {grid_size_km}km")
        print(f"   Output: {self.output_folder}")

    def initialize_grid_system(self):
        """Initialize the grid coverage system"""
        print("\n🗺️  Initializing grid system...")
        grids = self.coverage_system.initialize_grid()
        print(f"✅ Grid system ready with {len(grids):,} grids")
        return grids

    # === Extraction Methods ===

    async def extract_single(self):
        """Extract the next single grid"""
        return await extract_single_grid(self.extractor, self.coverage_system)

    async def extract_multiple(self, num_grids=5):
        """Extract multiple grids in sequence"""
        return await extract_multiple_grids(self.extractor, self.coverage_system, num_grids)

    async def extract_coastal(self, num_grids=3):
        """Extract coastal grids for intersection variety"""
        return await extract_coastal_grids(self.extractor, self.coverage_system, num_grids)

    async def test_extraction(self):
        """Test the extraction workflow"""
        return await test_single_extraction(self.extractor, self.coverage_system)

    # === Monitoring Methods ===

    def show_progress(self):
        """Show full progress report"""
        show_grid_progress(self.coverage_system)

    def show_status(self):
        """Show quick status summary"""
        quick_status(self.coverage_system)

    def show_next(self, num_grids=10):
        """Show next grids to extract"""
        show_next_grids(self.coverage_system, num_grids)

    def show_states(self):
        """Show progress by state"""
        show_state_statistics(self.coverage_system)

    def show_recent(self):
        """Show recent activity"""
        show_recent_activity(self.coverage_system)

    def show_summary(self, num_recent=20):
        """Show comprehensive summary"""
        show_extraction_summary(self.coverage_system, num_recent)

    def show_grid(self, grid_id):
        """Show details for specific grid"""
        show_grid_details(self.coverage_system, grid_id)

    def get_recommendations(self, priority="coastal"):
        """Get recommended grids for extraction"""
        return get_grid_recommendations(self.coverage_system, priority)


def print_menu():
    """Print the main menu"""
    print("\n" + "="*60)
    print("🗺️  OSM TILE EXTRACTION SYSTEM")
    print("="*60)
    print("\n📥 EXTRACTION COMMANDS:")
    print("  1. Extract single grid")
    print("  2. Extract multiple grids")
    print("  3. Extract coastal grids")
    print("  4. Test extraction")

    print("\n📊 MONITORING COMMANDS:")
    print("  5. Show progress report")
    print("  6. Show quick status")
    print("  7. Show next grids")
    print("  8. Show state statistics")
    print("  9. Show recent activity")
    print(" 10. Show comprehensive summary")
    print(" 11. Show specific grid details")

    print("\n⚙️  SYSTEM COMMANDS:")
    print(" 12. Initialize grid system")
    print(" 13. Get grid recommendations")
    print("  0. Exit")
    print("\nChoice: ", end="")


async def interactive_mode():
    """Run interactive extraction mode"""
    print("🚀 Starting OSM Extraction System...")

    # Initialize manager
    manager = OSMExtractionManager(zoom_level=15, grid_size_km=25.0)

    while True:
        print_menu()
        choice = input().strip()

        try:
            if choice == "0":
                print("👋 Goodbye!")
                break

            elif choice == "1":
                print("\n🎯 Extracting single grid...")
                await manager.extract_single()

            elif choice == "2":
                num = int(input("Number of grids to extract: "))
                print(f"\n🚀 Extracting {num} grids...")
                await manager.extract_multiple(num)

            elif choice == "3":
                num = int(input("Number of coastal grids to extract: "))
                print(f"\n🌊 Extracting {num} coastal grids...")
                await manager.extract_coastal(num)

            elif choice == "4":
                print("\n🧪 Testing extraction...")
                await manager.test_extraction()

            elif choice == "5":
                manager.show_progress()

            elif choice == "6":
                manager.show_status()

            elif choice == "7":
                num = int(input("Number of grids to show (default 10): ") or "10")
                manager.show_next(num)

            elif choice == "8":
                manager.show_states()

            elif choice == "9":
                manager.show_recent()

            elif choice == "10":
                num = int(input("Number of recent grids to include (default 20): ") or "20")
                manager.show_summary(num)

            elif choice == "11":
                grid_id = input("Enter grid ID: ").strip()
                manager.show_grid(grid_id)

            elif choice == "12":
                manager.initialize_grid_system()

            elif choice == "13":
                priority = input("Priority type (coastal/balanced/default): ").strip() or "coastal"
                recommendations = manager.get_recommendations(priority)
                print(f"\n🎯 RECOMMENDED GRIDS ({priority}):")
                for i, grid_id in enumerate(recommendations, 1):
                    print(f"  {i}. {grid_id}")

            else:
                print("❌ Invalid choice")

        except KeyboardInterrupt:
            print("\n\n⏸️  Interrupted by user")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

        input("\nPress Enter to continue...")


async def quick_extraction_demo():
    """Quick demo extraction for testing"""
    print("🚀 Quick Extraction Demo")
    print("="*40)

    manager = OSMExtractionManager()

    # Show initial status
    print("\n📊 Initial Status:")
    manager.show_status()

    # Show next grids
    print("\n📋 Next Grids:")
    manager.show_next(5)

    # Test single extraction
    print("\n🧪 Testing single extraction...")
    await manager.test_extraction()

    # Show final status
    print("\n📊 Final Status:")
    manager.show_status()


def main():
    """Main entry point"""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        # Run quick demo
        asyncio.run(quick_extraction_demo())
    else:
        # Run interactive mode
        asyncio.run(interactive_mode())


if __name__ == "__main__":
    main()