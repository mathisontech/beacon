#!/usr/bin/env python3
"""
Complete 50-State Extraction Sequence
====================================

Autonomous extraction script that will extract ALL 50 US states in priority order:
1. Southeastern Seaboard & Gulf of Mexico states FIRST
2. Then remaining states alphabetically

Priority Order (Southeastern Seaboard & Gulf):
🌊 Florida, 🌊 South Carolina, 🏔️ North Carolina, 🍑 Georgia, 🏈 Alabama, 🎸 Mississippi, 🎺 Louisiana, 🤠 Texas

Perfect for extended multi-day runs - wake up to complete US coverage!
"""

import asyncio
import time
import sqlite3
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
        # Check if this state was already completed
        with sqlite3.connect(batch_manager.db_path) as conn:
            cursor = conn.execute('''
                SELECT COUNT(*) FROM grid_squares
                WHERE status = 'completed'
            ''')
            completed_grids = cursor.fetchone()[0]

        if completed_grids > 0:
            print(f"✅ {state_name} already completed - skipping")
        else:
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

async def run_fifty_state_sequence():
    """Run the complete 50-state extraction sequence"""

    print("🇺🇸 COMPLETE 50-STATE EXTRACTION SEQUENCE")
    print("=" * 60)
    print(f"🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("💤 This will run autonomously for ALL 50 states!")
    print("🏃‍♂️ Optimized speed: 50 workers + 8 tile servers")
    print("⏰ Estimated time: ~50-100 hours for complete US coverage")
    print()
    print("📋 EXTRACTION SEQUENCE:")
    print("🌊 PRIORITY: Southeastern Seaboard & Gulf of Mexico")
    print("   1. 🌴 Florida          2. 🌊 South Carolina    3. 🏔️  North Carolina")
    print("   4. 🍑 Georgia          5. 🏈 Alabama           6. 🎸 Mississippi")
    print("   7. 🎺 Louisiana        8. 🤠 Texas")
    print()
    print("🗺️  REMAINING: All other states alphabetically")
    print("=" * 60)

    controller = ExtractionController()
    batch_manager = BatchExtractionManager()

    # Show initial status
    controller.show_status()

    total_start_time = time.time()
    total_batches = 0
    total_tiles = 0

    # Clear all existing batches before starting the 50-state sequence
    print("🧹 Clearing all existing batches to start fresh...")
    with sqlite3.connect(batch_manager.db_path) as conn:
        conn.execute("DELETE FROM extraction_batches WHERE status = 'pending'")
        conn.commit()
    print("✅ All pending batches cleared")

    # Complete 50-state extraction sequence
    # PRIORITY: Southeastern Seaboard & Gulf of Mexico states FIRST
    states = [
        # PRIORITY: Southeastern Seaboard & Gulf of Mexico
        ("Florida", "🌴", batch_manager.create_florida_batches),
        ("South Carolina", "🌊", batch_manager.create_south_carolina_batches),
        ("North Carolina", "🏔️", batch_manager.create_north_carolina_batches),
        ("New Mexico", "🌶️", batch_manager.create_new_mexico_batches),
        ("Washington", "🌲", batch_manager.create_washington_batches),
        ("Georgia", "🍑", batch_manager.create_georgia_batches),
        ("Alabama", "🏈", batch_manager.create_alabama_batches),
        ("Mississippi", "🎸", batch_manager.create_mississippi_batches),
        ("Louisiana", "🎺", batch_manager.create_louisiana_batches),
        ("Texas", "🤠", batch_manager.create_texas_batches),

        # Remaining states alphabetically
        ("Alaska", "🐻", batch_manager.create_alaska_batches),
        ("Arizona", "🌵", batch_manager.create_arizona_batches),
        ("Arkansas", "🎣", batch_manager.create_arkansas_batches),
        ("California", "☀️", batch_manager.create_california_batches),
        ("Colorado", "🏔️", batch_manager.create_colorado_batches),
        ("Connecticut", "🍂", batch_manager.create_connecticut_batches),
        ("Delaware", "🏖️", batch_manager.create_delaware_batches),
        ("Hawaii", "🌺", batch_manager.create_hawaii_batches),
        ("Idaho", "🥔", batch_manager.create_idaho_batches),
        ("Illinois", "🌽", batch_manager.create_illinois_batches),
        ("Indiana", "🏀", batch_manager.create_indiana_batches),
        ("Iowa", "🌾", batch_manager.create_iowa_batches),
        ("Kansas", "🌪️", batch_manager.create_kansas_batches),
        ("Kentucky", "🐎", batch_manager.create_kentucky_batches),
        ("Maine", "🦞", batch_manager.create_maine_batches),
        ("Maryland", "🦀", batch_manager.create_maryland_batches),
        ("Massachusetts", "🫖", batch_manager.create_massachusetts_batches),
        ("Michigan", "🏭", batch_manager.create_michigan_batches),
        ("Minnesota", "❄️", batch_manager.create_minnesota_batches),
        ("Missouri", "⚾", batch_manager.create_missouri_batches),
        ("Montana", "🦬", batch_manager.create_montana_batches),
        ("Nebraska", "🌾", batch_manager.create_nebraska_batches),
        ("Nevada", "🎰", batch_manager.create_nevada_batches),
        ("New Hampshire", "🍁", batch_manager.create_new_hampshire_batches),
        ("New Jersey", "🏖️", batch_manager.create_new_jersey_batches),
        ("New Mexico", "🌶️", batch_manager.create_new_mexico_batches),
        ("New York", "🗽", batch_manager.create_newyork_batches),
        ("North Dakota", "🛢️", batch_manager.create_north_dakota_batches),
        ("Ohio", "🌰", batch_manager.create_ohio_batches),
        ("Oklahoma", "🤠", batch_manager.create_oklahoma_batches),
        ("Oregon", "🌲", batch_manager.create_oregon_batches),
        ("Pennsylvania", "🗺️", batch_manager.create_pennsylvania_batches),
        ("Rhode Island", "⚓", batch_manager.create_rhode_island_batches),
        ("South Dakota", "🗿", batch_manager.create_south_dakota_batches),
        ("Tennessee", "🎵", batch_manager.create_tennessee_batches),
        ("Utah", "🏜️", batch_manager.create_utah_batches),
        ("Vermont", "🍁", batch_manager.create_vermont_batches),
        ("Virginia", "🏛️", batch_manager.create_virginia_batches),
        ("Washington", "🌲", batch_manager.create_washington_batches),
        ("West Virginia", "⛰️", batch_manager.create_west_virginia_batches),
        ("Wisconsin", "🧀", batch_manager.create_wisconsin_batches),
        ("Wyoming", "🦌", batch_manager.create_wyoming_batches)
    ]

    state_results = []

    try:
        for i, (state_name, state_emoji, create_func) in enumerate(states):
            print(f"\n🇺🇸 STATE {i+1}/50: {state_name}")

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

            # Progress update
            progress = (i + 1) / len(states) * 100
            total_elapsed = time.time() - total_start_time
            print(f"\n📈 OVERALL PROGRESS: {i+1}/50 states ({progress:.1f}%) - {total_elapsed/3600:.1f} hours elapsed")

    except KeyboardInterrupt:
        print("\n🛑 Sequence interrupted by user")
        controller.stop_extraction()

    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        controller.stop_extraction()

    finally:
        total_time = time.time() - total_start_time

        print("\n" + "=" * 60)
        print("🌅 FIFTY STATE SEQUENCE COMPLETE!")
        print(f"🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏱️ Total time: {total_time/3600:.1f} hours ({total_time/86400:.1f} days)")
        print(f"📦 Total batches: {total_batches}")
        print(f"🗺️ Total tiles: {total_tiles:,}")
        print("🎉 Complete United States map extracted!")
        print("=" * 60)

        # Final detailed summary
        print(f"\n📊 DETAILED RESULTS:")
        completed_states = [r for r in state_results if r['batches'] > 0]

        print(f"\n🌊 SOUTHEASTERN SEABOARD & GULF STATES:")
        priority_states = completed_states[:8]  # First 8 are priority
        for result in priority_states:
            print(f"   {result['emoji']} {result['name']}: {result['batches']} batches, "
                  f"{result['tiles']:,} tiles, {result['time']/3600:.1f}h")

        print(f"\n🗺️  OTHER STATES:")
        other_states = completed_states[8:]  # Remaining states
        for result in other_states:
            print(f"   {result['emoji']} {result['name']}: {result['batches']} batches, "
                  f"{result['tiles']:,} tiles, {result['time']/3600:.1f}h")

        if total_tiles > 0:
            avg_rate = total_tiles / total_time
            print(f"\n⚡ Average extraction rate: {avg_rate:.0f} tiles/second")
            print(f"📊 States completed: {len(completed_states)}/50")

        # Final status
        print(f"\n📈 FINAL STATUS:")
        controller.show_status()

if __name__ == "__main__":
    print("🇺🇸 Complete 50-State Extraction Sequence")
    print("Southeastern Seaboard & Gulf → All Remaining States")
    print("Press Ctrl+C to stop")
    print()

    try:
        asyncio.run(run_fifty_state_sequence())
    except KeyboardInterrupt:
        print("\n👋 Sequence stopped. Until next time!")