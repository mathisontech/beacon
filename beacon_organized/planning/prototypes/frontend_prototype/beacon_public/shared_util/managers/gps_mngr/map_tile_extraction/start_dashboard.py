#!/usr/bin/env python3
"""
Quick Start Script for OSM Grid Extraction Dashboard
====================================================

This script provides an easy way to start the dashboard with your existing
grid extraction system.
"""

import os
import sys
import webbrowser
import time
import threading
from pathlib import Path

def main():
    """Start the dashboard server and open browser"""
    print("🚀 OSM Grid Extraction Dashboard Quick Start")
    print("=" * 50)

    # Check if the dashboard files exist
    current_dir = Path(__file__).parent
    dashboard_html = current_dir / 'grid_progress_dashboard.html'
    server_script = current_dir / 'dashboard_server.py'

    if not dashboard_html.exists():
        print("❌ Error: grid_progress_dashboard.html not found")
        return 1

    if not server_script.exists():
        print("❌ Error: dashboard_server.py not found")
        return 1

    print("✅ Dashboard files found")

    # Try to import required modules
    try:
        from gridmap_squares import SimpleGridCoverage
        from osm_extraction_main import OSMExtractionManager
        print("✅ Required modules available")
    except ImportError as e:
        print(f"❌ Error: Missing required modules: {e}")
        print("   Make sure you're in the correct directory with all extraction files")
        return 1

    # Check for existing database
    try:
        coverage_system = SimpleGridCoverage()
        progress = coverage_system.get_progress_report()

        if progress['total_grids'] > 0:
            print(f"✅ Found existing grid database with {progress['total_grids']:,} grids")
            print(f"   • Completed: {progress['completed_grids']:,}")
            print(f"   • In Progress: {progress['in_progress_grids']:,}")
            print(f"   • Pending: {progress['pending_grids']:,}")
        else:
            print("⚠️  No grids found in database")
            print("   You may need to run the Jupyter notebook first to initialize grids")

    except Exception as e:
        print(f"⚠️  Warning: Could not access grid database: {e}")
        print("   Dashboard will start but may not show data until grids are initialized")

    # Start the server
    print("\n🌐 Starting dashboard server...")

    # Import and run the server
    try:
        import subprocess

        # Start server in a subprocess
        server_process = subprocess.Popen([
            sys.executable, str(server_script),
            '--host', 'localhost',
            '--port', '8080'
        ])

        print("⏳ Waiting for server to start...")
        time.sleep(2)  # Give server time to start

        # Open browser
        dashboard_url = 'http://localhost:8080'
        print(f"🌐 Opening dashboard at: {dashboard_url}")

        try:
            webbrowser.open(dashboard_url)
            print("✅ Dashboard opened in your default browser")
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print(f"   Please manually open: {dashboard_url}")

        print("\n" + "=" * 50)
        print("🎉 DASHBOARD IS RUNNING!")
        print("=" * 50)
        print(f"📊 Dashboard URL: {dashboard_url}")
        print("🔄 The dashboard will auto-refresh every 30 seconds")
        print("🛑 Press Ctrl+C to stop the server")
        print("\n💡 FEATURES:")
        print("   • Real-time grid progress visualization")
        print("   • Color-coded map (Red=Pending, Yellow=Progress, Green=Complete)")
        print("   • Live statistics and extraction rates")
        print("   • Regional focus views")
        print("   • Auto-refresh capabilities")

        # Wait for user to stop
        try:
            server_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping dashboard server...")
            server_process.terminate()
            server_process.wait()
            print("✅ Dashboard stopped successfully!")

    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())