#!/usr/bin/env python3
"""
Grid Visualization System
========================

Interactive map visualization showing the grid coverage system with color-coded
progress status. Grids change colors based on extraction status:
- Red: Pending (not started)
- Yellow: In Progress (currently extracting)
- Green: Completed (extraction finished)
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.animation as animation
from matplotlib.widgets import Button
import numpy as np
import sqlite3
from typing import Dict, List, Tuple, Optional
from gridmap_squares import SimpleGridCoverage
from us_shape_filter import get_us_shaped_grids, is_grid_in_continental_us


class GridVisualization:
    """Interactive visualization of the grid extraction progress"""

    def __init__(self, coverage_system: SimpleGridCoverage):
        self.coverage_system = coverage_system

        # Color scheme
        self.colors = {
            'pending': '#ff4444',      # Red
            'in_progress': '#ffaa00',  # Orange/Yellow
            'completed': '#44ff44'     # Green
        }

        # Map bounds (continental US)
        self.bounds = {
            'lat_min': 24.5, 'lat_max': 49.0,
            'lng_min': -125.0, 'lng_max': -66.5
        }

        # Initialize plot
        self.fig, self.ax = plt.subplots(figsize=(16, 10))
        self.patches = {}  # Store grid patches for updates

    def load_grid_data(self) -> List[Dict]:
        """Load all grid data from database"""
        with sqlite3.connect(self.coverage_system.db_path) as conn:
            cursor = conn.execute('''
                SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                       total_tiles, extracted_tiles, status
                FROM grid_squares
                ORDER BY grid_y, grid_x
            ''')

            results = cursor.fetchall()

        grids = []
        for result in results:
            grids.append({
                'grid_id': result[0],
                'grid_x': result[1],
                'grid_y': result[2],
                'lat_min': result[3],
                'lat_max': result[4],
                'lng_min': result[5],
                'lng_max': result[6],
                'total_tiles': result[7],
                'extracted_tiles': result[8],
                'status': result[9]
            })

        return grids

    def create_map(self, us_shape_only=True):
        """Create the initial map with grid squares"""
        self.ax.clear()
        self.patches = {}

        # Set up the map
        self.ax.set_xlim(self.bounds['lng_min'], self.bounds['lng_max'])
        self.ax.set_ylim(self.bounds['lat_min'], self.bounds['lat_max'])
        self.ax.set_aspect('equal')

        if us_shape_only:
            self.ax.set_title('Continental US Grid Extraction Progress', fontsize=16, fontweight='bold')
            # Load only US-shaped grids
            grids = get_us_shaped_grids(self.coverage_system)
        else:
            self.ax.set_title('Full Grid Extraction Progress', fontsize=16, fontweight='bold')
            # Load all grids
            grids = self.load_grid_data()

        self.ax.set_xlabel('Longitude', fontsize=12)
        self.ax.set_ylabel('Latitude', fontsize=12)

        for grid in grids:
            self.add_grid_patch(grid)

        # Add legend
        self.add_legend()

        # Add statistics
        self.add_statistics(grids)

        plt.tight_layout()

    def add_grid_patch(self, grid: Dict):
        """Add a single grid patch to the map"""
        # Calculate patch dimensions
        width = grid['lng_max'] - grid['lng_min']
        height = grid['lat_max'] - grid['lat_min']

        # Choose color based on status
        color = self.colors.get(grid['status'], '#cccccc')

        # Calculate alpha (transparency) based on progress
        if grid['total_tiles'] > 0 and grid['status'] == 'in_progress':
            progress = grid['extracted_tiles'] / grid['total_tiles']
            alpha = 0.4 + (progress * 0.4)  # 40% to 80% opacity
        else:
            alpha = 0.7

        # Create patch
        patch = patches.Rectangle(
            (grid['lng_min'], grid['lat_min']),
            width, height,
            linewidth=0.5,
            edgecolor='black',
            facecolor=color,
            alpha=alpha
        )

        self.ax.add_patch(patch)
        self.patches[grid['grid_id']] = patch

        # Add grid ID label for small sample (to avoid clutter)
        if len(self.patches) < 100:  # Only show labels for first 100 grids
            center_x = grid['lng_min'] + width / 2
            center_y = grid['lat_min'] + height / 2

            # Show abbreviated grid ID
            short_id = grid['grid_id'].replace('GRID_', '')
            self.ax.text(center_x, center_y, short_id,
                        ha='center', va='center', fontsize=6,
                        color='white', fontweight='bold')

    def add_legend(self):
        """Add color legend to the map"""
        legend_elements = []

        for status, color in self.colors.items():
            legend_elements.append(
                patches.Patch(color=color, label=status.replace('_', ' ').title())
            )

        self.ax.legend(handles=legend_elements, loc='upper right',
                      bbox_to_anchor=(0.98, 0.98))

    def add_statistics(self, grids: List[Dict]):
        """Add statistics text to the map"""
        # Calculate statistics
        total_grids = len(grids)
        completed = sum(1 for g in grids if g['status'] == 'completed')
        in_progress = sum(1 for g in grids if g['status'] == 'in_progress')
        pending = sum(1 for g in grids if g['status'] == 'pending')

        total_tiles = sum(g['total_tiles'] for g in grids)
        extracted_tiles = sum(g['extracted_tiles'] for g in grids)

        completion_pct = (extracted_tiles / total_tiles * 100) if total_tiles > 0 else 0

        # Create statistics text
        stats_text = f"""EXTRACTION PROGRESS
Grids: {completed:,}/{total_grids:,} ({completed/total_grids*100:.1f}%)
Tiles: {extracted_tiles:,}/{total_tiles:,} ({completion_pct:.1f}%)

Status Breakdown:
Completed: {completed:,}
In Progress: {in_progress:,}
Pending: {pending:,}"""

        # Add text box
        self.ax.text(0.02, 0.98, stats_text, transform=self.ax.transAxes,
                    fontsize=10, verticalalignment='top',
                    bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    def update_map(self):
        """Update the map with current progress"""
        grids = self.load_grid_data()

        # Update existing patches
        for grid in grids:
            if grid['grid_id'] in self.patches:
                patch = self.patches[grid['grid_id']]

                # Update color
                color = self.colors.get(grid['status'], '#cccccc')
                patch.set_facecolor(color)

                # Update alpha based on progress
                if grid['total_tiles'] > 0 and grid['status'] == 'in_progress':
                    progress = grid['extracted_tiles'] / grid['total_tiles']
                    alpha = 0.4 + (progress * 0.4)
                else:
                    alpha = 0.7
                patch.set_alpha(alpha)

        # Update statistics
        self.add_statistics(grids)

        plt.draw()

    def show_interactive_map(self):
        """Show interactive map with refresh button"""
        self.create_map()

        # Add refresh button
        ax_button = plt.axes([0.02, 0.02, 0.1, 0.04])
        button = Button(ax_button, 'Refresh')
        button.on_clicked(lambda x: self.update_map())

        plt.show()

    def save_map(self, filename: str = "grid_progress_map.png"):
        """Save the current map to file"""
        self.create_map()
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"Map saved as {filename}")

    def create_focused_map(self, center_lat: float, center_lng: float,
                          zoom_factor: float = 5.0):
        """Create a focused map around a specific location"""
        # Calculate zoom bounds
        lat_range = (self.bounds['lat_max'] - self.bounds['lat_min']) / zoom_factor
        lng_range = (self.bounds['lng_max'] - self.bounds['lng_min']) / zoom_factor

        focus_bounds = {
            'lat_min': max(center_lat - lat_range/2, self.bounds['lat_min']),
            'lat_max': min(center_lat + lat_range/2, self.bounds['lat_max']),
            'lng_min': max(center_lng - lng_range/2, self.bounds['lng_min']),
            'lng_max': min(center_lng + lng_range/2, self.bounds['lng_max'])
        }

        # Create focused plot
        fig, ax = plt.subplots(figsize=(12, 8))
        ax.set_xlim(focus_bounds['lng_min'], focus_bounds['lng_max'])
        ax.set_ylim(focus_bounds['lat_min'], focus_bounds['lat_max'])
        ax.set_aspect('equal')
        ax.set_title(f'Focused Grid View - {center_lat:.2f}°N, {center_lng:.2f}°W',
                    fontsize=14, fontweight='bold')

        # Load grids in focus area
        grids = self.load_grid_data()
        focused_grids = []

        for grid in grids:
            if (focus_bounds['lat_min'] <= grid['lat_min'] <= focus_bounds['lat_max'] and
                focus_bounds['lng_min'] <= grid['lng_min'] <= focus_bounds['lng_max']):
                focused_grids.append(grid)

        # Draw focused grids with labels
        for grid in focused_grids:
            width = grid['lng_max'] - grid['lng_min']
            height = grid['lat_max'] - grid['lat_min']
            color = self.colors.get(grid['status'], '#cccccc')

            patch = patches.Rectangle(
                (grid['lng_min'], grid['lat_min']),
                width, height,
                linewidth=1,
                edgecolor='black',
                facecolor=color,
                alpha=0.7
            )
            ax.add_patch(patch)

            # Add detailed labels
            center_x = grid['lng_min'] + width / 2
            center_y = grid['lat_min'] + height / 2

            progress = 0
            if grid['total_tiles'] > 0:
                progress = grid['extracted_tiles'] / grid['total_tiles'] * 100

            label = f"{grid['grid_id']}\n{progress:.0f}%"
            ax.text(center_x, center_y, label, ha='center', va='center',
                   fontsize=8, color='white', fontweight='bold')

        # Add legend
        legend_elements = [patches.Patch(color=color, label=status.replace('_', ' ').title())
                          for status, color in self.colors.items()]
        ax.legend(handles=legend_elements, loc='upper right')

        plt.tight_layout()
        plt.show()

    def create_heatmap(self):
        """Create a heatmap showing extraction density"""
        grids = self.load_grid_data()

        # Create grid arrays
        x_coords = sorted(set(g['grid_x'] for g in grids))
        y_coords = sorted(set(g['grid_y'] for g in grids))

        # Create progress matrix
        progress_matrix = np.zeros((len(y_coords), len(x_coords)))

        for grid in grids:
            x_idx = x_coords.index(grid['grid_x'])
            y_idx = y_coords.index(grid['grid_y'])

            if grid['total_tiles'] > 0:
                progress = grid['extracted_tiles'] / grid['total_tiles']
            else:
                progress = 0

            progress_matrix[y_idx, x_idx] = progress

        # Create heatmap
        fig, ax = plt.subplots(figsize=(14, 8))

        im = ax.imshow(progress_matrix, cmap='RdYlGn', aspect='auto',
                      extent=[self.bounds['lng_min'], self.bounds['lng_max'],
                             self.bounds['lat_min'], self.bounds['lat_max']])

        ax.set_title('Grid Extraction Heatmap', fontsize=16, fontweight='bold')
        ax.set_xlabel('Longitude')
        ax.set_ylabel('Latitude')

        # Add colorbar
        cbar = plt.colorbar(im, ax=ax)
        cbar.set_label('Extraction Progress (0-1)', rotation=270, labelpad=20)

        plt.tight_layout()
        plt.show()


def show_grid_map(coverage_system: SimpleGridCoverage, us_shape_only=True):
    """Quick function to show the grid progress map"""
    viz = GridVisualization(coverage_system)
    viz.create_map(us_shape_only=us_shape_only)
    plt.show()


def save_grid_map(coverage_system: SimpleGridCoverage, filename: str = "grid_progress.png"):
    """Quick function to save the grid progress map"""
    viz = GridVisualization(coverage_system)
    viz.save_map(filename)


def show_focused_map(coverage_system: SimpleGridCoverage, lat: float, lng: float, zoom: float = 5.0):
    """Quick function to show a focused map around a location"""
    viz = GridVisualization(coverage_system)
    viz.create_focused_map(lat, lng, zoom)


def show_progress_heatmap(coverage_system: SimpleGridCoverage):
    """Quick function to show extraction progress heatmap"""
    viz = GridVisualization(coverage_system)
    viz.create_heatmap()


# Example usage functions for different US regions
def show_california_map(coverage_system: SimpleGridCoverage):
    """Show focused map of California region"""
    show_focused_map(coverage_system, 36.7783, -119.4179, zoom=3.0)


def show_texas_map(coverage_system: SimpleGridCoverage):
    """Show focused map of Texas region"""
    show_focused_map(coverage_system, 31.9686, -99.9018, zoom=3.0)


def show_florida_map(coverage_system: SimpleGridCoverage):
    """Show focused map of Florida region"""
    show_focused_map(coverage_system, 27.7663, -81.6868, zoom=4.0)


def show_northeast_map(coverage_system: SimpleGridCoverage):
    """Show focused map of Northeast region"""
    show_focused_map(coverage_system, 42.0, -73.0, zoom=4.0)