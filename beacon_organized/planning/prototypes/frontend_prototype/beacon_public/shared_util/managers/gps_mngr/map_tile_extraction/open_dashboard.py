#!/usr/bin/env python3
"""
Simple script to open the dashboard and handle macOS permission issues
"""

import subprocess
import webbrowser
import time
import sys
import os

def main():
    print("🚀 Starting OSM Grid Dashboard...")

    # Check if server is already running
    try:
        import urllib.request
        response = urllib.request.urlopen('http://localhost:8080', timeout=2)
        print("✅ Server is already running!")
    except:
        print("📡 Starting server...")
        # Start the server
        try:
            server_process = subprocess.Popen([
                sys.executable, 'test_server.py'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

            # Wait for server to start
            time.sleep(3)

            # Test if server is responding
            try:
                response = urllib.request.urlopen('http://localhost:8080', timeout=5)
                print("✅ Server started successfully!")
            except Exception as e:
                print(f"❌ Server failed to start: {e}")
                return 1

        except Exception as e:
            print(f"❌ Failed to start server: {e}")
            return 1

    # Try different approaches to open the dashboard
    dashboard_url = 'http://localhost:8080'

    print(f"\n🌐 Dashboard URL: {dashboard_url}")
    print("\n🔧 TROUBLESHOOTING:")
    print("If the browser doesn't open automatically, try these solutions:")
    print()
    print("1. 📋 COPY & PASTE this URL into your browser:")
    print(f"   {dashboard_url}")
    print()
    print("2. 🔒 macOS PERMISSION FIX:")
    print("   • Go to System Preferences → Security & Privacy → Privacy")
    print("   • Select 'Local Network' in the left sidebar")
    print("   • Make sure Firefox/Chrome is checked ✅")
    print()
    print("3. 🌐 ALTERNATIVE BROWSERS:")
    print("   • Try Chrome: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome")
    print("   • Try Safari: open -a Safari")
    print()
    print("4. 🔄 RESTART & RETRY:")
    print("   • Close this script (Ctrl+C)")
    print("   • Run again with: python3 open_dashboard.py")

    # Try to open in different browsers
    browsers_to_try = [
        'open',  # Default macOS opener
        'open -a "Google Chrome"',
        'open -a "Firefox"',
        'open -a "Safari"'
    ]

    for browser_cmd in browsers_to_try:
        try:
            print(f"\n🔄 Trying to open with: {browser_cmd}")
            if browser_cmd == 'open':
                os.system(f'{browser_cmd} {dashboard_url}')
            else:
                os.system(f'{browser_cmd} {dashboard_url}')
            print(f"✅ Attempted to open with {browser_cmd}")
            break
        except Exception as e:
            print(f"❌ Failed with {browser_cmd}: {e}")
            continue

    print(f"\n🎯 If nothing opened, manually go to: {dashboard_url}")
    print("🛑 Press Ctrl+C to stop the server when done")

    # Keep script running
    try:
        while True:
            time.sleep(10)
            # Check if server is still running
            try:
                response = urllib.request.urlopen('http://localhost:8080', timeout=2)
            except:
                print("⚠️  Server seems to have stopped. Restarting...")
                server_process = subprocess.Popen([
                    sys.executable, 'test_server.py'
                ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                time.sleep(2)

    except KeyboardInterrupt:
        print("\n🛑 Stopping dashboard...")
        try:
            server_process.terminate()
        except:
            pass
        print("✅ Dashboard stopped!")
        return 0

if __name__ == '__main__':
    sys.exit(main())