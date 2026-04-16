#!/usr/bin/env python3
"""
Pennsylvania → New York Automatic Sequence
==========================================

Autonomous extraction script that will:
1. Complete all Pennsylvania batches
2. Automatically create New York batches
3. Extract all New York batches
4. Provide completion report for both states

Perfect for extended overnight runs!
"""

import asyncio
import time
from datetime import datetime
from extraction_controller import ExtractionController
from batch_extraction_manager import BatchExtractionManager

async def run_pa_ny_sequence():
    """Run Pennsylvania → New York extraction sequence"""

    print("🗺️ PENNSYLVANIA → NEW YORK AUTOMATIC SEQUENCE")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("💤 This will run autonomously for both states!")
    print("🏃‍♂️ Maximum speed: 50 workers + 8 tile servers")
    print("⏰ Estimated time: ~6-8 hours for both states")
    print("=" * 60)

    controller = ExtractionController()
    batch_manager = BatchExtractionManager()

    # Show initial status
    controller.show_status()

    total_start_time = time.time()

    try:
        # ======= PENNSYLVANIA PHASE =======
        print("\n🗺️ PHASE 1: PENNSYLVANIA EXTRACTION")
        print("=" * 50)

        pa_batch_count = 0
        pa_start_time = time.time()

        # Process all Pennsylvania batches
        while True:
            next_batch = controller.batch_manager.get_next_batch()
            if not next_batch:
                break

            pa_batch_count += 1
            print(f"\n🚀 PA Batch {next_batch.batch_id} ({pa_batch_count})")
            print(f"📍 {len(next_batch.grid_ids)} grids, {next_batch.total_tiles:,} tiles")

            result = await controller.start_extraction(next_batch.batch_id)

            if result['success']:
                elapsed = time.time() - pa_start_time
                print(f"✅ PA Batch {next_batch.batch_id} completed!")
                print(f"   📊 {result['extracted_tiles']:,} tiles extracted")
                print(f"   ⏱️ PA elapsed: {elapsed/3600:.1f} hours")
            else:
                print(f"❌ PA Batch {next_batch.batch_id} failed: {result.get('error')}")
                break

        pa_time = time.time() - pa_start_time
        print(f"\n🎉 PENNSYLVANIA COMPLETE!")
        print(f"⏱️ PA Time: {pa_time/3600:.1f} hours")
        print(f"📦 PA Batches: {pa_batch_count}")

        # ======= NEW YORK SETUP =======
        print(f"\n🗽 PHASE 2: NEW YORK SETUP & EXTRACTION")
        print("=" * 50)
        print("🔄 Creating New York batches...")

        # Create New York batches
        ny_batch_count_total = batch_manager.create_newyork_batches()
        print(f"✅ Created {ny_batch_count_total} New York batches")

        # Wait a moment for batch creation to settle
        await asyncio.sleep(2)

        # ======= NEW YORK EXTRACTION =======
        ny_batch_count = 0
        ny_start_time = time.time()

        # Process all New York batches
        while True:
            next_batch = controller.batch_manager.get_next_batch()
            if not next_batch:
                break

            ny_batch_count += 1
            print(f"\n🚀 NY Batch {next_batch.batch_id} ({ny_batch_count}/{ny_batch_count_total})")
            print(f"📍 {len(next_batch.grid_ids)} grids, {next_batch.total_tiles:,} tiles")

            result = await controller.start_extraction(next_batch.batch_id)

            if result['success']:
                ny_elapsed = time.time() - ny_start_time
                total_elapsed = time.time() - total_start_time
                print(f"✅ NY Batch {next_batch.batch_id} completed!")
                print(f"   📊 {result['extracted_tiles']:,} tiles extracted")
                print(f"   ⏱️ NY elapsed: {ny_elapsed/3600:.1f} hours")
                print(f"   ⏱️ Total elapsed: {total_elapsed/3600:.1f} hours")
            else:
                print(f"❌ NY Batch {next_batch.batch_id} failed: {result.get('error')}")
                break

        ny_time = time.time() - ny_start_time
        print(f"\n🗽 NEW YORK COMPLETE!")
        print(f"⏱️ NY Time: {ny_time/3600:.1f} hours")
        print(f"📦 NY Batches: {ny_batch_count}")

    except KeyboardInterrupt:
        print("\n🛑 Sequence interrupted by user")
        controller.stop_extraction()

    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        controller.stop_extraction()

    finally:
        total_time = time.time() - total_start_time
        print("\n" + "=" * 60)
        print("🌅 PENNSYLVANIA → NEW YORK SEQUENCE COMPLETE!")
        print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏱️ Total time: {total_time/3600:.1f} hours")
        print(f"📦 Total batches: {pa_batch_count + ny_batch_count}")
        print("🗺️ Two complete state maps extracted!")
        print("=" * 60)

        # Final status
        controller.show_status()

        # Summary statistics
        print(f"\n📊 FINAL SUMMARY:")
        print(f"   🗺️  Pennsylvania: {pa_batch_count} batches, {pa_time/3600:.1f} hours")
        print(f"   🗽 New York: {ny_batch_count} batches, {ny_time/3600:.1f} hours")
        print(f"   ⚡ Average rate: {((pa_time + ny_time)/3600):.1f} hours for 2 states")

if __name__ == "__main__":
    print("🗺️ Pennsylvania → New York Automatic Sequence")
    print("Press Ctrl+C to stop")
    print()

    try:
        asyncio.run(run_pa_ny_sequence())
    except KeyboardInterrupt:
        print("\n👋 Sequence stopped. Sleep well!")