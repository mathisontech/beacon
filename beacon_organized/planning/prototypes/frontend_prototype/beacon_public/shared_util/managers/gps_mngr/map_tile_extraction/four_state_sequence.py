#!/usr/bin/env python3
"""
Pennsylvania → Florida → North Carolina → South Carolina Sequence
================================================================

Autonomous extraction script that will extract 4 complete states:
1. 🗺️  Pennsylvania (Northeast)
2. 🌴 Florida (Southeast)
3. 🏔️  North Carolina (Southeast)
4. 🌊 South Carolina (Southeast)

Perfect for extended overnight runs - wake up to 4 complete state maps!
"""

import asyncio
import time
from datetime import datetime
from extraction_controller import ExtractionController
from batch_extraction_manager import BatchExtractionManager

async def extract_state_phase(controller, batch_manager, state_name, state_emoji, create_batches_func):
    """Extract a single state phase"""
    print(f"\n{state_emoji} PHASE: {state_name.upper()} EXTRACTION")
    print("=" * 60)

    phase_start = time.time()

    # Create batches for this state
    print(f"🔄 Creating {state_name} batches...")
    batch_count_total = create_batches_func()
    print(f"✅ Created {batch_count_total} {state_name} batches")

    if batch_count_total == 0:
        print(f"⚠️  No {state_name} grids found - skipping")
        return 0, 0, 0

    # Wait for batch creation to settle
    await asyncio.sleep(2)

    # Extract all batches for this state
    batch_count = 0
    state_tiles = 0

    while True:
        next_batch = controller.batch_manager.get_next_batch()
        if not next_batch:
            break

        batch_count += 1
        print(f"\n🚀 {state_name} Batch {next_batch.batch_id} ({batch_count}/{batch_count_total})")
        print(f"📍 {len(next_batch.grid_ids)} grids, {next_batch.total_tiles:,} tiles")

        result = await controller.start_extraction(next_batch.batch_id)

        if result['success']:
            state_elapsed = time.time() - phase_start
            state_tiles += result['extracted_tiles']
            print(f"✅ {state_name} Batch {next_batch.batch_id} completed!")
            print(f"   📊 {result['extracted_tiles']:,} tiles extracted")
            print(f"   ⏱️ {state_name} elapsed: {state_elapsed/3600:.1f} hours")
        else:
            print(f"❌ {state_name} Batch {next_batch.batch_id} failed: {result.get('error')}")
            break

    phase_time = time.time() - phase_start
    print(f"\n{state_emoji} {state_name.upper()} COMPLETE!")
    print(f"⏱️ Time: {phase_time/3600:.1f} hours")
    print(f"📦 Batches: {batch_count}")
    print(f"🗺️  Tiles: {state_tiles:,}")

    return batch_count, state_tiles, phase_time

async def run_four_state_sequence():
    """Run the complete 4-state extraction sequence"""

    print("🗺️ FOUR STATE EXTRACTION SEQUENCE")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("💤 This will run autonomously for all 4 states!")
    print("🏃‍♂️ Maximum speed: 100 workers + 8 tile servers")
    print("⏰ Estimated time: ~4-6 hours for all 4 states")
    print()
    print("📋 EXTRACTION SEQUENCE:")
    print("   1. 🗺️  Pennsylvania (Mid-Atlantic)")
    print("   2. 🌴 Florida (Southeast)")
    print("   3. 🏔️  North Carolina (Southeast)")
    print("   4. 🌊 South Carolina (Southeast)")
    print("=" * 60)

    controller = ExtractionController()
    batch_manager = BatchExtractionManager()

    # Show initial status
    controller.show_status()

    total_start_time = time.time()
    total_batches = 0
    total_tiles = 0

    # State extraction sequence
    states = [
        ("Pennsylvania", "🗺️", batch_manager.create_pennsylvania_batches),
        ("Florida", "🌴", batch_manager.create_florida_batches),
        ("North Carolina", "🏔️", batch_manager.create_north_carolina_batches),
        ("South Carolina", "🌊", batch_manager.create_south_carolina_batches)
    ]

    state_results = []

    try:
        for state_name, state_emoji, create_func in states:
            batch_count, tiles_extracted, phase_time = await extract_state_phase(
                controller, batch_manager, state_name, state_emoji, create_func
            )

            total_batches += batch_count
            total_tiles += tiles_extracted

            state_results.append({
                'name': state_name,
                'emoji': state_emoji,
                'batches': batch_count,
                'tiles': tiles_extracted,
                'time': phase_time
            })

            if batch_count == 0:
                continue

            # Brief pause between states
            print(f"\n⏸️  Brief pause before next state...")
            await asyncio.sleep(5)

    except KeyboardInterrupt:
        print("\n🛑 Sequence interrupted by user")
        controller.stop_extraction()

    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        controller.stop_extraction()

    finally:
        total_time = time.time() - total_start_time

        print("\n" + "=" * 60)
        print("🌅 FOUR STATE SEQUENCE COMPLETE!")
        print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏱️ Total time: {total_time/3600:.1f} hours")
        print(f"📦 Total batches: {total_batches}")
        print(f"🗺️ Total tiles: {total_tiles:,}")
        print("🎉 Four complete state maps extracted!")
        print("=" * 60)

        # Final detailed summary
        print(f"\n📊 DETAILED RESULTS:")
        for result in state_results:
            if result['batches'] > 0:
                print(f"   {result['emoji']} {result['name']}: {result['batches']} batches, "
                      f"{result['tiles']:,} tiles, {result['time']/3600:.1f}h")

        if total_tiles > 0:
            avg_rate = total_tiles / total_time
            print(f"\n⚡ Average extraction rate: {avg_rate:.0f} tiles/second")

        # Final status
        print(f"\n📈 FINAL STATUS:")
        controller.show_status()

if __name__ == "__main__":
    print("🗺️ Four State Extraction Sequence")
    print("Pennsylvania → Florida → North Carolina → South Carolina")
    print("Press Ctrl+C to stop")
    print()

    try:
        asyncio.run(run_four_state_sequence())
    except KeyboardInterrupt:
        print("\n👋 Sequence stopped. Sweet dreams!")