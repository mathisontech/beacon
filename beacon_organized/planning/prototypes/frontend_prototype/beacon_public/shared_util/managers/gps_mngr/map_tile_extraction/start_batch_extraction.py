#!/usr/bin/env python3
"""
Start Batch Extraction
======================

Simple script to start extracting batches of 100 grid squares.
"""

import asyncio
import sys
from batch_extraction_manager import BatchExtractionManager

async def main():
    """Main extraction function"""

    if len(sys.argv) > 1:
        try:
            batch_id = int(sys.argv[1])
            print(f"🎯 Starting extraction of specific Batch {batch_id}")

            manager = BatchExtractionManager()
            await manager.extract_batch(batch_id)
            manager.show_batch_summary()

        except ValueError:
            print("❌ Invalid batch ID. Please provide a number.")
            sys.exit(1)
    else:
        print("🚀 Starting extraction of next pending batch...")

        manager = BatchExtractionManager()

        # Show current status
        print("📊 Current status:")
        manager.show_batch_summary()
        print()

        # Extract next batch
        success = await manager.extract_next_batch()

        if not success:
            print("✅ All batches completed!")

if __name__ == "__main__":
    print("🗺️ OSM Tile Extraction - Batch Processing")
    print("=========================================")
    print()
    print("Usage:")
    print("  python3 start_batch_extraction.py           # Extract next pending batch")
    print("  python3 start_batch_extraction.py 5         # Extract specific batch 5")
    print()

    asyncio.run(main())