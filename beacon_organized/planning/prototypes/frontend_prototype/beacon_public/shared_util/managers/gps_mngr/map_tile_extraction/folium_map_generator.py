#!/usr/bin/env python3
"""
Folium Interactive Map Generator
================================

Creates interactive maps using Folium with grid overlays on real geographic tiles.
Provides much better visualization than canvas-based rendering.
"""

import folium
from folium import plugins
from typing import List, Dict, Optional, Tuple
import sqlite3
from gridmap_squares import SimpleGridCoverage


class FoliumGridMap:
    """Interactive map generator using Folium with grid overlays"""

    def __init__(self, coverage_system: SimpleGridCoverage):
        self.coverage_system = coverage_system

        # Color scheme for grid status
        self.colors = {
            'pending': '#ff4444',      # Red
            'in_progress': '#ffaa00',  # Orange/Yellow
            'completed': '#44ff44',    # Green
            'filtered_out': '#cccccc'  # Gray
        }

        # Continental US center point
        self.us_center = [39.8283, -98.5795]

    def create_interactive_map(self, grids: List[Dict], zoom_level: int = 4) -> str:
        """Create a Folium interactive map with grid overlays

        Args:
            grids: List of grid dictionaries with lat/lng bounds and status
            zoom_level: Initial zoom level for the map

        Returns:
            HTML string of the interactive map
        """
        # Create base map
        m = folium.Map(
            location=self.us_center,
            zoom_start=zoom_level,
            tiles='OpenStreetMap',
            prefer_canvas=True  # Better performance for many shapes
        )

        # Add different tile layer options
        folium.TileLayer(
            tiles='CartoDB positron',
            name='Light Theme',
            attr='CartoDB'
        ).add_to(m)

        folium.TileLayer(
            tiles='CartoDB dark_matter',
            name='Dark Theme',
            attr='CartoDB'
        ).add_to(m)

        # Filter out ocean grids for better performance
        land_grids = [grid for grid in grids if grid.get('status') != 'filtered_out']

        # Group grids by status for better organization
        grids_by_status = {
            'completed': [],
            'in_progress': [],
            'pending': []
        }

        for grid in land_grids:
            status = grid.get('status', 'pending')
            if status in grids_by_status:
                grids_by_status[status].append(grid)

        # Add grid squares as feature groups (for layer control)
        for status, status_grids in grids_by_status.items():
            if not status_grids:
                continue

            # Create feature group for this status
            fg = folium.FeatureGroup(name=f'{status.replace("_", " ").title()} ({len(status_grids):,})')

            for grid in status_grids:
                self._add_grid_rectangle(fg, grid, status)

            fg.add_to(m)

        # Add statistics panel
        self._add_statistics_panel(m, grids_by_status)

        # Add layer control
        folium.LayerControl().add_to(m)

        # Add fullscreen button
        plugins.Fullscreen().add_to(m)

        # Add measure tool
        plugins.MeasureControl().add_to(m)

        return m._repr_html_()

    def _add_grid_rectangle(self, feature_group: folium.FeatureGroup,
                           grid: Dict, status: str) -> None:
        """Add a single grid rectangle to the feature group"""
        # Calculate progress percentage
        progress = 0
        if grid.get('total_tiles', 0) > 0:
            progress = (grid.get('extracted_tiles', 0) / grid['total_tiles']) * 100

        # Create popup content
        popup_content = f"""
        <div style="font-family: Arial, sans-serif; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">{grid.get('grid_id', 'Unknown')}</h4>
            <table style="width: 100%; font-size: 12px;">
                <tr><td><b>Status:</b></td><td>{status.replace('_', ' ').title()}</td></tr>
                <tr><td><b>Progress:</b></td><td>{progress:.1f}%</td></tr>
                <tr><td><b>Tiles:</b></td><td>{grid.get('extracted_tiles', 0):,} / {grid.get('total_tiles', 0):,}</td></tr>
                <tr><td><b>Coordinates:</b></td><td>{grid.get('lat_min', 0):.3f}°N to {grid.get('lat_max', 0):.3f}°N</td></tr>
                <tr><td></td><td>{grid.get('lng_min', 0):.3f}°W to {grid.get('lng_max', 0):.3f}°W</td></tr>
            </table>
        </div>
        """

        # Determine opacity based on progress
        if status == 'in_progress':
            opacity = 0.4 + (progress / 100) * 0.4  # 40% to 80% opacity
        else:
            opacity = 0.6

        # Add rectangle
        folium.Rectangle(
            bounds=[
                [grid.get('lat_min', 0), grid.get('lng_min', 0)],
                [grid.get('lat_max', 0), grid.get('lng_max', 0)]
            ],
            color=self.colors.get(status, '#cccccc'),
            weight=1,
            opacity=0.8,
            fillColor=self.colors.get(status, '#cccccc'),
            fillOpacity=opacity,
            popup=folium.Popup(popup_content, max_width=300),
            tooltip=f"{grid.get('grid_id', 'Unknown')} - {status.replace('_', ' ').title()}"
        ).add_to(feature_group)

    def _add_statistics_panel(self, map_obj: folium.Map,
                             grids_by_status: Dict[str, List]) -> None:
        """Add a statistics panel to the map"""
        # Calculate statistics
        total_grids = sum(len(grids) for grids in grids_by_status.values())
        completed = len(grids_by_status.get('completed', []))
        in_progress = len(grids_by_status.get('in_progress', []))
        pending = len(grids_by_status.get('pending', []))

        # Calculate tile statistics
        total_tiles = 0
        extracted_tiles = 0

        for grids in grids_by_status.values():
            for grid in grids:
                total_tiles += grid.get('total_tiles', 0)
                extracted_tiles += grid.get('extracted_tiles', 0)

        completion_pct = (extracted_tiles / total_tiles * 100) if total_tiles > 0 else 0

        # Create HTML for statistics panel
        stats_html = f"""
        <div style="
            position: fixed;
            top: 10px;
            right: 10px;
            width: 250px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #ccc;
            border-radius: 10px;
            padding: 15px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
        ">
            <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">
                Grid Progress
            </h3>

            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: #333;">Overall Progress</div>
                <div style="background: #f0f0f0; border-radius: 10px; height: 20px; margin: 5px 0;">
                    <div style="
                        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
                        height: 100%;
                        border-radius: 10px;
                        width: {completion_pct:.1f}%;
                        transition: width 0.5s ease;
                    "></div>
                </div>
                <div style="text-align: center; font-weight: bold;">{completion_pct:.1f}% Complete</div>
            </div>

            <table style="width: 100%; font-size: 12px; margin-top: 10px;">
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 5px 0;"><span style="color: #44ff44;">●</span> Completed:</td>
                    <td style="text-align: right; font-weight: bold;">{completed:,}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 5px 0;"><span style="color: #ffaa00;">●</span> In Progress:</td>
                    <td style="text-align: right; font-weight: bold;">{in_progress:,}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 5px 0;"><span style="color: #ff4444;">●</span> Pending:</td>
                    <td style="text-align: right; font-weight: bold;">{pending:,}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; font-weight: bold;">Total Grids:</td>
                    <td style="text-align: right; font-weight: bold;">{total_grids:,}</td>
                </tr>
            </table>

            <hr style="margin: 15px 0; border: 1px solid #eee;">

            <table style="width: 100%; font-size: 12px;">
                <tr>
                    <td style="padding: 2px 0;">Total Tiles:</td>
                    <td style="text-align: right;">{total_tiles:,}</td>
                </tr>
                <tr>
                    <td style="padding: 2px 0;">Extracted:</td>
                    <td style="text-align: right;">{extracted_tiles:,}</td>
                </tr>
            </table>
        </div>
        """

        # Add to map
        map_obj.get_root().html.add_child(folium.Element(stats_html))

    def create_focused_map(self, grids: List[Dict], center_lat: float,
                          center_lng: float, zoom_level: int = 8) -> str:
        """Create a focused map around a specific location

        Args:
            grids: List of grid dictionaries
            center_lat: Latitude to center on
            center_lng: Longitude to center on
            zoom_level: Zoom level for focused view

        Returns:
            HTML string of the focused map
        """
        # Create focused map
        m = folium.Map(
            location=[center_lat, center_lng],
            zoom_start=zoom_level,
            tiles='OpenStreetMap'
        )

        # Filter grids to those in the focused area (rough bounds check)
        lat_range = 2.0  # degrees
        lng_range = 2.0  # degrees

        focused_grids = [
            grid for grid in grids
            if (center_lat - lat_range <= grid.get('lat_min', 0) <= center_lat + lat_range and
                center_lng - lng_range <= grid.get('lng_min', 0) <= center_lng + lng_range and
                grid.get('status') != 'filtered_out')
        ]

        # Add grids with more detailed popups
        for grid in focused_grids:
            status = grid.get('status', 'pending')

            # Enhanced popup for focused view
            popup_content = f"""
            <div style="font-family: Arial, sans-serif; min-width: 250px;">
                <h3 style="margin: 0 0 15px 0; color: #333; text-align: center;">
                    {grid.get('grid_id', 'Unknown')}
                </h3>
                <table style="width: 100%; font-size: 13px;">
                    <tr><td><b>Status:</b></td><td>{status.replace('_', ' ').title()}</td></tr>
                    <tr><td><b>Grid Position:</b></td><td>X: {grid.get('grid_x', 0)}, Y: {grid.get('grid_y', 0)}</td></tr>
                    <tr><td><b>Total Tiles:</b></td><td>{grid.get('total_tiles', 0):,}</td></tr>
                    <tr><td><b>Extracted:</b></td><td>{grid.get('extracted_tiles', 0):,}</td></tr>
                    <tr><td><b>Progress:</b></td><td>{(grid.get('extracted_tiles', 0) / max(grid.get('total_tiles', 1), 1) * 100):.1f}%</td></tr>
                    <tr><td colspan="2"><hr style="margin: 10px 0;"></td></tr>
                    <tr><td><b>Lat Range:</b></td><td>{grid.get('lat_min', 0):.4f}° to {grid.get('lat_max', 0):.4f}°</td></tr>
                    <tr><td><b>Lng Range:</b></td><td>{grid.get('lng_min', 0):.4f}° to {grid.get('lng_max', 0):.4f}°</td></tr>
                </table>
            </div>
            """

            folium.Rectangle(
                bounds=[
                    [grid.get('lat_min', 0), grid.get('lng_min', 0)],
                    [grid.get('lat_max', 0), grid.get('lng_max', 0)]
                ],
                color=self.colors.get(status, '#cccccc'),
                weight=2,
                opacity=0.9,
                fillColor=self.colors.get(status, '#cccccc'),
                fillOpacity=0.5,
                popup=folium.Popup(popup_content, max_width=350),
                tooltip=f"{grid.get('grid_id', 'Unknown')}"
            ).add_to(m)

        return m._repr_html_()


def create_grid_map_html(coverage_system: SimpleGridCoverage,
                        map_type: str = 'overview') -> str:
    """Create HTML for grid map using Folium

    Args:
        coverage_system: The grid coverage system
        map_type: Type of map ('overview', 'focused', 'california', etc.)

    Returns:
        HTML string for the interactive map
    """
    generator = FoliumGridMap(coverage_system)

    # Load grid data
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                   total_tiles, extracted_tiles, status
            FROM grid_squares
            WHERE status != 'filtered_out'
            ORDER BY
                CASE
                    WHEN status = 'completed' THEN 1
                    WHEN status = 'in_progress' THEN 2
                    ELSE 3
                END,
                grid_y, grid_x
        ''')

        grids = []
        for row in cursor.fetchall():
            grids.append({
                'grid_id': row[0],
                'grid_x': row[1],
                'grid_y': row[2],
                'lat_min': row[3],
                'lat_max': row[4],
                'lng_min': row[5],
                'lng_max': row[6],
                'total_tiles': row[7],
                'extracted_tiles': row[8],
                'status': row[9]
            })

    # Regional focus coordinates
    regions = {
        'california': (36.7783, -119.4179, 6),
        'texas': (31.9686, -99.9018, 6),
        'florida': (27.7663, -81.6868, 7),
        'northeast': (42.0, -73.0, 6)
    }

    if map_type == 'overview':
        return generator.create_interactive_map(grids)
    elif map_type in regions:
        lat, lng, zoom = regions[map_type]
        return generator.create_focused_map(grids, lat, lng, zoom)
    else:
        return generator.create_interactive_map(grids)


# Quick access functions for different map types
def create_overview_map(coverage_system: SimpleGridCoverage) -> str:
    """Create overview map of all US grids"""
    return create_grid_map_html(coverage_system, 'overview')

def create_california_map(coverage_system: SimpleGridCoverage) -> str:
    """Create focused map of California"""
    return create_grid_map_html(coverage_system, 'california')

def create_texas_map(coverage_system: SimpleGridCoverage) -> str:
    """Create focused map of Texas"""
    return create_grid_map_html(coverage_system, 'texas')

def create_florida_map(coverage_system: SimpleGridCoverage) -> str:
    """Create focused map of Florida"""
    return create_grid_map_html(coverage_system, 'florida')

def create_northeast_map(coverage_system: SimpleGridCoverage) -> str:
    """Create focused map of Northeast"""
    return create_grid_map_html(coverage_system, 'northeast')