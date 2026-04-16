#!/usr/bin/env python3
"""
Overnight Pennsylvania Extraction
=================================

Autonomous extraction script that will run all Pennsylvania batches
continuously until completion. Perfect for overnight runs.
"""

import asyncio
import time
from datetime import datetime
from extraction_controller import ExtractionController

async def run_overnight_extraction():
    """Run continuous extraction until all Pennsylvania batches are complete"""

    print("🌙 OVERNIGHT PENNSYLVANIA EXTRACTION STARTING")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("💤 This will run autonomously while you sleep!")
    print("🏃‍♂️ Maximum speed: 50 workers + 8 tile servers")
    print("⏰ Estimated time: 3-4 hours for all Pennsylvania")
    print("=" * 60)

    controller = ExtractionController()

    # Show initial status
    controller.show_status()

    batch_count = 0
    start_time = time.time()

    try:
        while True:
            # Get next batch
            next_batch = controller.batch_manager.get_next_batch()
            if not next_batch:
                break

            batch_count += 1
            print(f"\n🚀 Starting Batch {next_batch.batch_id} ({batch_count}/59)")
            print(f"📍 {len(next_batch.grid_ids)} grids, {next_batch.total_tiles:,} tiles")

            # Extract the batch
            result = await controller.start_extraction(next_batch.batch_id)

            if result['success']:
                elapsed = time.time() - start_time
                print(f"✅ Batch {next_batch.batch_id} completed!")
                print(f"   📊 {result['extracted_tiles']:,} tiles extracted")
                print(f"   ⏱️ Total elapsed: {elapsed/3600:.1f} hours")
                print(f"   🏃‍♂️ Rate: {result['extracted_tiles']/result['extraction_time_hours']:.0f} tiles/hour")
            else:
                print(f"❌ Batch {next_batch.batch_id} failed: {result.get('error')}")
                break

    except KeyboardInterrupt:
        print("\n🛑 Extraction interrupted by user")
        controller.stop_extraction()

    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        controller.stop_extraction()

    finally:
        total_time = time.time() - start_time
        print("\n" + "=" * 60)
        print("🌅 OVERNIGHT EXTRACTION COMPLETE!")
        print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏱️ Total time: {total_time/3600:.1f} hours")
        print(f"📦 Batches completed: {batch_count}")
        print("🗺️ Pennsylvania map extraction finished!")
        print("=" * 60)

        # Final status
        controller.show_status()

if __name__ == "__main__":
    print("🌙 Pennsylvania Overnight Extraction")
    print("Press Ctrl+C to stop")
    print()

    try:
        asyncio.run(run_overnight_extraction())
    except KeyboardInterrupt:
        print("\n👋 Goodnight! Extraction stopped.")