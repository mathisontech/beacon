#!/usr/bin/env python3
"""
Auto-Restart 50-State Extraction System
=======================================

Robust wrapper that automatically restarts the 50-state extraction sequence
when it stops due to errors, server overload, or network issues.

Features:
- Automatic restart on failure
- Progress tracking across restarts
- Exponential backoff on consecutive failures
- Comprehensive logging of restart events
- Graceful handling of interruptions
"""

import subprocess
import time
import signal
import sys
import os
from datetime import datetime
from pathlib import Path

class AutoRestartSystem:
    def __init__(self, log_file="auto_restart_log.txt"):
        self.log_file = log_file
        self.restart_count = 0
        self.consecutive_failures = 0
        self.start_time = time.time()
        self.running = True
        self.current_process = None

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def log(self, message):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)

        with open(self.log_file, 'a') as f:
            f.write(log_entry + "\n")

    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        self.log(f"🛑 Received signal {signum}, shutting down gracefully...")
        self.running = False

        if self.current_process:
            self.log("💀 Terminating current extraction process...")
            try:
                self.current_process.terminate()
                self.current_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.log("🔥 Force killing extraction process...")
                self.current_process.kill()
                self.current_process.wait()

        self.log("👋 Auto-restart system shutdown complete")
        sys.exit(0)

    def check_process_running(self):
        """Check if the extraction process is still running"""
        if not self.current_process:
            return False

        return self.current_process.poll() is None

    def get_extraction_progress(self):
        """Parse the log file to get current progress"""
        fifty_state_log = Path("fifty_state_log.txt")

        if not fifty_state_log.exists():
            return "No progress yet", 0, 0

        try:
            with open(fifty_state_log, 'r') as f:
                content = f.read()

            # Find the latest state being processed
            import re
            state_matches = re.findall(r'🇺🇸 STATE (\d+)/50: ([^\\n]+)', content)

            if state_matches:
                state_num, state_name = state_matches[-1]
                return f"State {state_num}/50: {state_name}", int(state_num), 50
            else:
                return "Starting up...", 0, 50

        except Exception as e:
            return f"Error reading progress: {e}", 0, 50

    def calculate_backoff_delay(self):
        """Calculate exponential backoff delay for consecutive failures"""
        if self.consecutive_failures == 0:
            return 0

        # Exponential backoff: 30s, 60s, 120s, 300s (5min), 600s (10min), max 1800s (30min)
        delay = min(30 * (2 ** (self.consecutive_failures - 1)), 1800)
        return delay

    def start_extraction_process(self):
        """Start the 50-state extraction process"""
        self.log("🚀 Starting 50-state extraction process...")

        try:
            # Start the extraction process
            self.current_process = subprocess.Popen(
                ["python3", "fifty_state_sequence.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )

            # Stream output to the log file
            with open("fifty_state_log.txt", "a") as log_f:
                for line in iter(self.current_process.stdout.readline, ''):
                    if not self.running:
                        break
                    log_f.write(line)
                    log_f.flush()

            # Wait for process to complete
            return_code = self.current_process.wait()
            return return_code

        except Exception as e:
            self.log(f"💥 Error starting extraction process: {e}")
            return -1

    def run(self):
        """Main auto-restart loop"""
        self.log("🤖 AUTO-RESTART 50-STATE EXTRACTION SYSTEM")
        self.log("=" * 60)
        self.log("💡 This system will automatically restart the extraction on failures")
        self.log("💡 Press Ctrl+C to stop gracefully")
        self.log("=" * 60)

        while self.running:
            try:
                # Get current progress before starting
                progress_msg, current_state, total_states = self.get_extraction_progress()
                self.log(f"📊 Current progress: {progress_msg}")

                # Calculate backoff delay if there were consecutive failures
                backoff_delay = self.calculate_backoff_delay()
                if backoff_delay > 0:
                    self.log(f"⏱️ Waiting {backoff_delay}s before restart (backoff for {self.consecutive_failures} consecutive failures)")
                    time.sleep(backoff_delay)

                if not self.running:
                    break

                # Start the extraction process
                self.restart_count += 1
                self.log(f"🔄 Starting extraction attempt #{self.restart_count}")

                return_code = self.start_extraction_process()

                if not self.running:
                    break

                if return_code == 0:
                    # Process completed successfully
                    self.log("🎉 50-state extraction completed successfully!")
                    self.consecutive_failures = 0
                    break
                else:
                    # Process failed
                    self.consecutive_failures += 1
                    self.log(f"❌ Extraction process failed with return code {return_code}")
                    self.log(f"🔢 Consecutive failures: {self.consecutive_failures}")

                    # Check if we should continue
                    if self.consecutive_failures >= 10:
                        self.log("🛑 Too many consecutive failures (10), stopping auto-restart")
                        break

                    # Brief pause before restart
                    if self.running:
                        self.log("⏸️ Brief pause before restart...")
                        time.sleep(5)

            except KeyboardInterrupt:
                self.log("🛑 Received keyboard interrupt")
                break
            except Exception as e:
                self.consecutive_failures += 1
                self.log(f"💥 Unexpected error in restart loop: {e}")
                if self.consecutive_failures >= 5:
                    self.log("🛑 Too many consecutive errors, stopping auto-restart")
                    break
                time.sleep(10)

        # Final summary
        total_time = time.time() - self.start_time
        self.log("=" * 60)
        self.log("🏁 AUTO-RESTART SYSTEM SUMMARY")
        self.log(f"⏱️ Total runtime: {total_time/3600:.1f} hours")
        self.log(f"🔄 Total restart attempts: {self.restart_count}")
        self.log(f"❌ Final consecutive failures: {self.consecutive_failures}")

        # Final progress check
        progress_msg, current_state, total_states = self.get_extraction_progress()
        self.log(f"📊 Final progress: {progress_msg}")

        if current_state == total_states:
            self.log("🎉 All 50 states completed!")
        else:
            completion_pct = (current_state / total_states) * 100
            self.log(f"📈 Completion: {completion_pct:.1f}% ({current_state}/{total_states} states)")

        self.log("👋 Auto-restart system shutdown")

if __name__ == "__main__":
    print("🤖 Auto-Restart 50-State Extraction System")
    print("This will automatically restart the extraction when it stops")
    print("Press Ctrl+C to stop gracefully")
    print()

    # Create and run the auto-restart system
    auto_restart = AutoRestartSystem()
    auto_restart.run()