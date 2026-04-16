#!/usr/bin/env python3
"""
Interactive Grid Map with Widgets
=================================

Enhanced interactive map with Jupyter widgets for real-time control and monitoring.
Includes buttons, sliders, and automatic refresh capabilities.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.widgets import Button
import ipywidgets as widgets
from IPython.display import display, clear_output
import time
import threading
from typing import Dict, List
from gridmap_squares import SimpleGridCoverage
from grid_visualization import GridVisualization


class InteractiveGridMap:
    """Interactive map with real-time updates and control widgets"""

    def __init__(self, coverage_system: SimpleGridCoverage):
        self.coverage_system = coverage_system
        self.viz = GridVisualization(coverage_system)
        self.auto_refresh = False
        self.refresh_interval = 30  # seconds
        self.refresh_thread = None

        # Create widgets
        self.create_widgets()

    def create_widgets(self):
        """Create interactive widgets for map control"""

        # Map control buttons
        self.refresh_btn = widgets.Button(
            description='🔄 Refresh Map',
            button_style='info',
            layout=widgets.Layout(width='120px')
        )

        self.save_btn = widgets.Button(
            description='📸 Save Map',
            button_style='success',
            layout=widgets.Layout(width='120px')
        )

        self.heatmap_btn = widgets.Button(
            description='🌡️ Heatmap',
            button_style='warning',
            layout=widgets.Layout(width='120px')
        )

        # Auto-refresh controls
        self.auto_refresh_toggle = widgets.ToggleButton(
            value=False,
            description='Auto Refresh',
            button_style='',
            layout=widgets.Layout(width='120px')
        )

        self.refresh_slider = widgets.IntSlider(
            value=30,
            min=10,
            max=300,
            step=10,
            description='Interval (s):',
            layout=widgets.Layout(width='200px')
        )

        # Region focus dropdown
        self.region_dropdown = widgets.Dropdown(
            options=[
                ('Full US', 'full'),
                ('California', 'california'),
                ('Texas', 'texas'),
                ('Florida', 'florida'),
                ('Northeast', 'northeast')
            ],
            value='full',
            description='Focus:',
            layout=widgets.Layout(width='150px')
        )

        # Progress display
        self.progress_output = widgets.Output()

        # Wire up event handlers
        self.refresh_btn.on_click(self.on_refresh_click)
        self.save_btn.on_click(self.on_save_click)
        self.heatmap_btn.on_click(self.on_heatmap_click)
        self.auto_refresh_toggle.observe(self.on_auto_refresh_change, names='value')
        self.refresh_slider.observe(self.on_interval_change, names='value')
        self.region_dropdown.observe(self.on_region_change, names='value')

    def create_control_panel(self):
        """Create the main control panel widget"""
        # Organize widgets into rows
        row1 = widgets.HBox([
            self.refresh_btn,
            self.save_btn,
            self.heatmap_btn,
            self.region_dropdown
        ])

        row2 = widgets.HBox([
            self.auto_refresh_toggle,
            self.refresh_slider
        ])

        # Progress section
        progress_section = widgets.VBox([
            widgets.HTML("<h3>📊 Real-time Progress</h3>"),
            self.progress_output
        ])

        # Main panel
        control_panel = widgets.VBox([
            widgets.HTML("<h2>🗺️ Interactive Grid Map Control Panel</h2>"),
            row1,
            row2,
            progress_section
        ])

        return control_panel

    def on_refresh_click(self, button):
        """Handle refresh button click"""
        with self.progress_output:
            clear_output()
            print("🔄 Refreshing map...")

        # Refresh the map
        self.viz.update_map()
        self.update_progress_display()

        with self.progress_output:
            print("✅ Map refreshed!")

    def on_save_click(self, button):
        """Handle save button click"""
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"grid_progress_{timestamp}.png"

        with self.progress_output:
            clear_output()
            print(f"📸 Saving map as {filename}...")

        self.viz.save_map(filename)

        with self.progress_output:
            print(f"✅ Map saved as {filename}")

    def on_heatmap_click(self, button):
        """Handle heatmap button click"""
        with self.progress_output:
            clear_output()
            print("🌡️ Generating heatmap...")

        self.viz.create_heatmap()

    def on_auto_refresh_change(self, change):
        """Handle auto-refresh toggle"""
        self.auto_refresh = change['new']

        if self.auto_refresh:
            self.start_auto_refresh()
            with self.progress_output:
                clear_output()
                print(f"🔄 Auto-refresh started (every {self.refresh_interval}s)")
        else:
            self.stop_auto_refresh()
            with self.progress_output:
                clear_output()
                print("⏹️ Auto-refresh stopped")

    def on_interval_change(self, change):
        """Handle refresh interval change"""
        self.refresh_interval = change['new']

        if self.auto_refresh:
            # Restart auto-refresh with new interval
            self.stop_auto_refresh()
            self.start_auto_refresh()

            with self.progress_output:
                clear_output()
                print(f"🔄 Auto-refresh interval updated to {self.refresh_interval}s")

    def on_region_change(self, change):
        """Handle region focus change"""
        region = change['new']

        with self.progress_output:
            clear_output()
            print(f"🔍 Focusing on {region}...")

        if region == 'full':
            self.viz.show_interactive_map()
        elif region == 'california':
            self.viz.create_focused_map(36.7783, -119.4179, zoom=3.0)
        elif region == 'texas':
            self.viz.create_focused_map(31.9686, -99.9018, zoom=3.0)
        elif region == 'florida':
            self.viz.create_focused_map(27.7663, -81.6868, zoom=4.0)
        elif region == 'northeast':
            self.viz.create_focused_map(42.0, -73.0, zoom=4.0)

    def start_auto_refresh(self):
        """Start automatic refresh in background thread"""
        if self.refresh_thread and self.refresh_thread.is_alive():
            return

        def refresh_loop():
            while self.auto_refresh:
                time.sleep(self.refresh_interval)
                if self.auto_refresh:  # Check again in case it was disabled
                    self.viz.update_map()
                    self.update_progress_display()

                    with self.progress_output:
                        clear_output()
                        timestamp = time.strftime("%H:%M:%S")
                        print(f"🔄 Auto-refreshed at {timestamp}")

        self.refresh_thread = threading.Thread(target=refresh_loop, daemon=True)
        self.refresh_thread.start()

    def stop_auto_refresh(self):
        """Stop automatic refresh"""
        self.auto_refresh = False

    def update_progress_display(self):
        """Update the progress display with current statistics"""
        progress = self.coverage_system.get_progress_report()

        progress_html = f"""
        <div style='background-color: #f0f0f0; padding: 10px; border-radius: 5px;'>
            <b>📊 Current Progress:</b><br>
            <b>Grids:</b> {progress['completed_grids']:,}/{progress['total_grids']:,}
            ({progress['completed_grids']/progress['total_grids']*100:.1f}%)<br>
            <b>Tiles:</b> {progress['extracted_tiles']:,}/{progress['total_tiles']:,}
            ({progress['completion_percentage']:.1f}%)<br>
            <b>Status:</b> ✅ {progress['completed_grids']:,} |
            🔄 {progress['in_progress_grids']:,} |
            ⏳ {progress['pending_grids']:,}<br>
        """

        if progress['recent_tiles_24h'] > 0:
            remaining_tiles = progress['total_tiles'] - progress['extracted_tiles']
            eta_days = remaining_tiles / progress['daily_rate'] if progress['daily_rate'] > 0 else float('inf')
            progress_html += f"""
            <b>Recent Activity:</b> {progress['recent_tiles_24h']:,} tiles/24h<br>
            <b>ETA:</b> {eta_days:.1f} days at current rate
            """

        progress_html += "</div>"

        # Update the progress display
        with self.progress_output:
            clear_output()
            display(widgets.HTML(progress_html))

    def show(self):
        """Display the complete interactive interface"""
        # Create and display control panel
        control_panel = self.create_control_panel()
        display(control_panel)

        # Show initial map
        self.viz.show_interactive_map()

        # Show initial progress
        self.update_progress_display()


class LiveProgressTracker:
    """Live progress tracker that updates during extraction"""

    def __init__(self, coverage_system: SimpleGridCoverage):
        self.coverage_system = coverage_system
        self.viz = GridVisualization(coverage_system)
        self.tracking_active = False

        # Create progress widgets
        self.progress_bar = widgets.IntProgress(
            value=0, min=0, max=100,
            description='Overall:',
            bar_style='info',
            style={'bar_color': '#1f77b4'},
            layout=widgets.Layout(width='400px')
        )

        self.current_grid_bar = widgets.IntProgress(
            value=0, min=0, max=100,
            description='Current Grid:',
            bar_style='warning',
            style={'bar_color': '#ff7f0e'},
            layout=widgets.Layout(width='400px')
        )

        self.status_output = widgets.Output()
        self.map_output = widgets.Output()

    def create_live_display(self):
        """Create live tracking display"""
        header = widgets.HTML("<h2>🔴 LIVE EXTRACTION TRACKING</h2>")

        progress_section = widgets.VBox([
            widgets.HTML("<h3>📊 Progress Bars</h3>"),
            self.progress_bar,
            self.current_grid_bar
        ])

        status_section = widgets.VBox([
            widgets.HTML("<h3>📋 Status Updates</h3>"),
            self.status_output
        ])

        map_section = widgets.VBox([
            widgets.HTML("<h3>🗺️ Live Map</h3>"),
            self.map_output
        ])

        return widgets.VBox([
            header,
            progress_section,
            status_section,
            map_section
        ])

    def start_tracking(self):
        """Start live tracking display"""
        self.tracking_active = True

        # Display the interface
        display(self.create_live_display())

        # Start monitoring loop
        self.monitor_progress()

    def monitor_progress(self):
        """Monitor and update progress in real-time"""
        def update_loop():
            while self.tracking_active:
                # Update overall progress
                progress = self.coverage_system.get_progress_report()
                overall_pct = int(progress['completion_percentage'])
                self.progress_bar.value = overall_pct

                # Update status
                with self.status_output:
                    clear_output()
                    timestamp = time.strftime("%H:%M:%S")
                    print(f"⏰ {timestamp}")
                    print(f"📊 Overall: {progress['extracted_tiles']:,}/{progress['total_tiles']:,} tiles")
                    print(f"🗂️ Grids: {progress['completed_grids']:,}/{progress['total_grids']:,}")

                    if progress['in_progress_grids'] > 0:
                        print(f"🔄 {progress['in_progress_grids']:,} grids in progress")

                # Update map periodically
                if time.time() % 60 < 5:  # Update map every minute
                    with self.map_output:
                        clear_output()
                        self.viz.create_map()
                        plt.show()

                time.sleep(5)  # Update every 5 seconds

        thread = threading.Thread(target=update_loop, daemon=True)
        thread.start()

    def stop_tracking(self):
        """Stop live tracking"""
        self.tracking_active = False


# Convenience functions for easy use

def show_interactive_map(coverage_system: SimpleGridCoverage):
    """Show the interactive map with full controls"""
    interactive_map = InteractiveGridMap(coverage_system)
    interactive_map.show()


def start_live_tracking(coverage_system: SimpleGridCoverage):
    """Start live progress tracking during extraction"""
    tracker = LiveProgressTracker(coverage_system)
    tracker.start_tracking()
    return tracker  # Return so user can call stop_tracking() later