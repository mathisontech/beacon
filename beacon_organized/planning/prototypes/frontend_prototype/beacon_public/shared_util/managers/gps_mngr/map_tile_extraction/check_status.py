#!/usr/bin/env python3
"""
Pennsylvania Extraction Status Checker
======================================
Quick status check to see if overnight extraction is complete.
"""

import subprocess
import os
from pathlib import Path

def check_extraction_status():
    print("🔍 PENNSYLVANIA EXTRACTION STATUS CHECK")
    print("=" * 50)

    # Check if process is running
    try:
        result = subprocess.run(['pgrep', '-f', 'overnight_extraction'],
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("🏃‍♂️ Status: STILL RUNNING")
            print(f"   Process ID: {result.stdout.strip()}")
        else:
            print("✅ Status: EXTRACTION COMPLETE!")
    except:
        print("❓ Could not check process status")

    # Check log file for completion
    log_file = Path("extraction_log.txt")
    if log_file.exists():
        with open(log_file, 'r') as f:
            content = f.read()
            if "OVERNIGHT EXTRACTION COMPLETE" in content:
                print("🌅 Log shows: COMPLETE!")
            elif "Starting Batch" in content:
                # Find last batch started
                lines = content.split('\n')
                for line in reversed(lines):
                    if "Starting Batch" in line:
                        print(f"📦 Last activity: {line.strip()}")
                        break
            else:
                print("📝 Log file exists but no activity yet")
    else:
        print("❌ No log file found")

    # Count extracted tiles
    try:
        result = subprocess.run(['find', 'osm_tiles/15/', '-name', '*.png'],
                              capture_output=True, text=True)
        if result.returncode == 0:
            tile_count = len(result.stdout.strip().split('\n')) if result.stdout.strip() else 0
            target = 286932
            percentage = (tile_count / target) * 100 if target > 0 else 0
            print(f"🗺️  Tiles extracted: {tile_count:,}/{target:,} ({percentage:.1f}%)")

            if percentage >= 95:
                print("🎉 Pennsylvania map is essentially COMPLETE!")
            elif percentage >= 50:
                print("⏱️  More than halfway done!")
            else:
                print("🚀 Extraction in progress...")
        else:
            print("❓ Could not count tiles")
    except:
        print("❓ Could not check tile count")

    print("=" * 50)

    # Quick commands reminder
    print("\n📋 Quick check commands:")
    print("   tail -20 extraction_log.txt     # See latest progress")
    print("   tail -f extraction_log.txt      # Watch live progress")
    print("   python3 check_status.py         # Run this check again")

if __name__ == "__main__":
    check_extraction_status()