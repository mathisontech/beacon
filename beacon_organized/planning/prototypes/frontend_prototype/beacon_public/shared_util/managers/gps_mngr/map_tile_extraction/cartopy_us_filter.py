#!/usr/bin/env python3
"""
Cartopy-based US Geographic Filter
=================================

Uses Cartopy's precise coastline and state boundary data to accurately filter
grid squares to only those within the continental United States.
"""

import numpy as np
from shapely.geometry import Point, Polygon, box
from shapely.ops import unary_union
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import cartopy.io.shapereader as shpreader
import sqlite3
from typing import List, Tuple
import matplotlib.pyplot as plt


class CartopyUSFilter:
    """High-precision US boundary filter using Cartopy geographic data"""

    def __init__(self):
        self.us_boundary = None
        self.us_states_polygons = None
        self._load_us_boundaries()

    def _load_us_boundaries(self):
        """Load precise US boundaries from Cartopy's Natural Earth data"""
        print("Loading US boundary data from Cartopy...")

        try:
            # Get US state boundaries from Natural Earth data
            states_shp = shpreader.natural_earth(
                resolution='50m',
                category='cultural',
                name='admin_1_states_provinces_lakes'
            )

            # Include all US states (continental US, Alaska, and Hawaii)
            all_us_states = {
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
                'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
                'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
                'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
                'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
                'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
                'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
                'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
                'West Virginia', 'Wisconsin', 'Wyoming'
            }

            us_polygons = []
            for record in shpreader.Reader(states_shp).records():
                # Check if this is a US state
                country = record.attributes.get('admin', '')
                state_name = record.attributes.get('name', '')

                if (country == 'United States of America' and
                    state_name in all_us_states):

                    # Convert to Shapely polygon
                    geom = record.geometry
                    if geom.geom_type == 'Polygon':
                        us_polygons.append(Polygon(geom.exterior.coords))
                    elif geom.geom_type == 'MultiPolygon':
                        for part in geom.geoms:
                            us_polygons.append(Polygon(part.exterior.coords))

            if us_polygons:
                # Create unified US boundary
                self.us_boundary = unary_union(us_polygons)
                self.us_states_polygons = us_polygons
                print(f"✅ Loaded {len(us_polygons)} state boundary polygons")
            else:
                print("⚠️  No US boundary data found, falling back to simple method")
                self._create_fallback_boundary()

        except Exception as e:
            print(f"⚠️  Error loading Cartopy data: {e}")
            print("Using fallback boundary method...")
            self._create_fallback_boundary()

    def _create_fallback_boundary(self):
        """Create a more accurate fallback boundary if Cartopy data fails"""
        # More precise continental US boundary approximation
        us_coords = [
            # Pacific Coast (California to Washington)
            (-124.7, 32.5), (-117.1, 32.5), (-117.1, 33.0), (-118.4, 34.0),
            (-120.0, 34.4), (-120.7, 35.1), (-121.3, 36.2), (-122.4, 37.8),
            (-123.0, 38.9), (-123.5, 40.2), (-124.2, 41.7), (-124.5, 43.5),
            (-124.6, 45.5), (-124.1, 46.2), (-123.0, 47.0), (-122.7, 48.4),
            (-122.7, 49.0),

            # Northern Border (Washington to Maine)
            (-95.2, 49.0), (-95.2, 49.4), (-94.6, 49.4), (-94.6, 48.0),
            (-89.5, 48.0), (-89.0, 47.0), (-84.0, 46.5), (-83.0, 46.0),
            (-82.4, 45.3), (-79.0, 43.3), (-78.9, 42.8), (-79.8, 42.3),
            (-75.3, 45.0), (-71.5, 45.3), (-70.3, 45.3), (-69.2, 45.1),
            (-67.8, 45.7), (-67.8, 47.1), (-67.1, 47.1), (-67.1, 45.1),

            # Atlantic Coast (Maine to Florida)
            (-67.1, 44.8), (-67.8, 44.3), (-68.0, 44.3), (-69.2, 43.7),
            (-70.6, 43.3), (-70.8, 42.9), (-70.8, 42.0), (-71.1, 41.5),
            (-71.9, 41.4), (-73.7, 40.6), (-74.0, 40.5), (-75.5, 39.5),
            (-75.5, 38.4), (-76.0, 38.0), (-76.5, 37.9), (-76.0, 36.9),
            (-75.7, 36.1), (-75.9, 35.2), (-76.7, 34.6), (-78.0, 33.9),
            (-78.5, 33.9), (-79.0, 33.2), (-80.3, 32.5), (-81.0, 31.0),
            (-81.4, 30.7), (-81.8, 30.2), (-82.3, 29.9), (-82.8, 29.1),
            (-82.9, 28.9), (-83.0, 28.9), (-83.6, 29.9), (-84.3, 29.9),
            (-85.0, 29.6), (-85.3, 29.3), (-86.5, 30.4), (-87.5, 30.3),
            (-88.4, 30.4), (-89.0, 29.2), (-89.4, 29.2), (-89.2, 29.0),
            (-89.0, 29.0), (-88.8, 28.9), (-88.9, 28.9), (-89.0, 29.0),
            (-89.2, 29.0), (-89.4, 29.2), (-94.0, 29.3),

            # Gulf Coast and Texas Border
            (-94.0, 29.3), (-93.8, 29.8), (-94.0, 33.6), (-94.4, 33.5),
            (-94.7, 33.0), (-94.0, 33.6), (-94.0, 36.5), (-103.0, 36.5),
            (-103.0, 37.0), (-109.0, 37.0), (-109.0, 41.0), (-111.0, 41.0),
            (-111.0, 42.0), (-114.0, 42.0), (-117.0, 42.0), (-120.0, 42.0),
            (-124.4, 42.0), (-124.7, 32.5)  # Back to start
        ]

        self.us_boundary = Polygon(us_coords)
        print("✅ Created fallback US boundary polygon")

    def is_grid_in_continental_us(self, lat_min: float, lat_max: float,
                                 lng_min: float, lng_max: float) -> bool:
        """
        Check if a grid square is within the continental US using precise boundaries

        Args:
            lat_min, lat_max: Latitude bounds of grid square
            lng_min, lng_max: Longitude bounds of grid square

        Returns:
            True if grid is within continental US, False otherwise
        """
        if self.us_boundary is None:
            print("⚠️  No US boundary loaded, defaulting to True")
            return True

        # Create grid square as a polygon
        grid_polygon = box(lng_min, lat_min, lng_max, lat_max)

        # Check if grid intersects with US boundary
        try:
            # Use intersection area ratio to determine if grid is "in" the US
            intersection = self.us_boundary.intersection(grid_polygon)

            if intersection.is_empty:
                # For areas with no intersection, check if it's near the Great Lakes
                # where we want to be more inclusive of nearshore areas
                center_lat = (lat_min + lat_max) / 2
                center_lng = (lng_min + lng_max) / 2

                # Check if this is in the Great Lakes region
                if (40.0 < center_lat < 50.0 and -95.0 < center_lng < -75.0):
                    # Use a distance-based check for Great Lakes nearshore areas
                    # Check if any corner of the grid is close to the US boundary
                    corners = [
                        (lat_min, lng_min), (lat_min, lng_max),
                        (lat_max, lng_min), (lat_max, lng_max)
                    ]

                    from shapely.geometry import Point
                    for corner_lat, corner_lng in corners:
                        corner_point = Point(corner_lng, corner_lat)
                        # If any corner is within ~25km of the US boundary, include it
                        if self.us_boundary.distance(corner_point) < 0.25:  # ~25km in degrees
                            return True

                return False

            # If more than 10% of the grid is within US boundaries, include it
            # This ensures coastal areas are properly included while avoiding pure ocean
            overlap_ratio = intersection.area / grid_polygon.area
            return overlap_ratio > 0.10

        except Exception as e:
            print(f"Error checking grid intersection: {e}")
            # Fall back to center point check
            center_lat = (lat_min + lat_max) / 2
            center_lng = (lng_min + lng_max) / 2
            center_point = Point(center_lng, center_lat)

            return self.us_boundary.contains(center_point)

    def visualize_grid_filtering(self, grids: List[dict], output_file: str = None):
        """
        Create a visualization showing grid filtering results

        Args:
            grids: List of grid dictionaries with lat/lng bounds
            output_file: Optional file path to save the visualization
        """
        fig = plt.figure(figsize=(15, 10))
        ax = fig.add_subplot(1, 1, 1, projection=ccrs.PlateCarree())

        # Set extent for continental US
        ax.set_extent([-125, -66.5, 20, 50], crs=ccrs.PlateCarree())

        # Add geographic features
        ax.add_feature(cfeature.COASTLINE, linewidth=0.8)
        ax.add_feature(cfeature.BORDERS, linestyle=':', linewidth=0.5)
        ax.add_feature(cfeature.STATES, edgecolor='gray', linewidth=0.3)
        ax.add_feature(cfeature.LAND, color='lightgray', alpha=0.3)
        ax.add_feature(cfeature.OCEAN, color='lightblue', alpha=0.3)

        # Plot grids with different colors based on filter results
        included_count = 0
        excluded_count = 0

        for grid in grids:
            lat_min = grid.get('lat_min', 0)
            lat_max = grid.get('lat_max', 0)
            lng_min = grid.get('lng_min', 0)
            lng_max = grid.get('lng_max', 0)

            # Check if grid should be included
            is_included = self.is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max)

            # Create grid rectangle
            grid_coords = [
                [lng_min, lat_min], [lng_max, lat_min],
                [lng_max, lat_max], [lng_min, lat_max], [lng_min, lat_min]
            ]

            if is_included:
                color = 'green'
                alpha = 0.6
                included_count += 1
            else:
                color = 'red'
                alpha = 0.3
                excluded_count += 1

            ax.plot([c[0] for c in grid_coords], [c[1] for c in grid_coords],
                   color=color, alpha=alpha, linewidth=0.5, transform=ccrs.PlateCarree())

        ax.set_title(f'Continental US Grid Filtering\n'
                    f'Included: {included_count:,} grids | Excluded: {excluded_count:,} grids',
                    fontsize=14, fontweight='bold')

        # Add legend
        from matplotlib.lines import Line2D
        legend_elements = [
            Line2D([0], [0], color='green', alpha=0.6, label=f'Included ({included_count:,})'),
            Line2D([0], [0], color='red', alpha=0.3, label=f'Excluded ({excluded_count:,})')
        ]
        ax.legend(handles=legend_elements, loc='upper right')

        plt.tight_layout()

        if output_file:
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            print(f"📊 Visualization saved to {output_file}")

        plt.show()
        return included_count, excluded_count


def update_database_with_cartopy_filter(db_path: str = "simple_grid_coverage.db"):
    """
    Update the grid database with improved filtering using Cartopy

    Args:
        db_path: Path to the SQLite database
    """
    print("🗺️  Updating grid database with Cartopy-based filtering...")

    # Initialize filter
    us_filter = CartopyUSFilter()

    # Load existing grids
    with sqlite3.connect(db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, lat_min, lat_max, lng_min, lng_max, status
            FROM grid_squares
            ORDER BY grid_y, grid_x
        ''')
        grids = cursor.fetchall()

        updated_count = 0

        for grid_id, lat_min, lat_max, lng_min, lng_max, current_status in grids:
            # Check if grid should be included using Cartopy filter
            should_include = us_filter.is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max)

            new_status = current_status if should_include else 'filtered_out'

            # Update status if it changed
            if new_status != current_status:
                conn.execute('''
                    UPDATE grid_squares
                    SET status = ?
                    WHERE grid_id = ?
                ''', (new_status, grid_id))
                updated_count += 1

        conn.commit()

        # Get final statistics
        cursor = conn.execute('''
            SELECT status, COUNT(*)
            FROM grid_squares
            GROUP BY status
        ''')
        final_stats = dict(cursor.fetchall())

    print(f"✅ Updated {updated_count:,} grid statuses")
    print("📊 Final grid distribution:")
    for status, count in final_stats.items():
        print(f"   • {status}: {count:,}")

    return updated_count, final_stats


# Quick test function
def test_cartopy_filter():
    """Test the Cartopy filter with sample coordinates"""
    us_filter = CartopyUSFilter()

    test_locations = [
        # Should be included
        (40.7128, -74.0060, "New York City"),
        (34.0522, -118.2437, "Los Angeles"),
        (25.7617, -80.1918, "Miami"),
        (47.6062, -122.3321, "Seattle"),

        # Should be excluded
        (19.4326, -155.5821, "Hawaii"),
        (64.2008, -149.4937, "Alaska"),
        (25.0, -110.0, "Baja California"),
        (45.0, -60.0, "Atlantic Ocean"),
    ]

    print("🧪 Testing Cartopy filter:")
    for lat, lng, name in test_locations:
        # Test with small grid around point
        is_included = us_filter.is_grid_in_continental_us(lat-0.1, lat+0.1, lng-0.1, lng+0.1)
        status = "✅ INCLUDED" if is_included else "❌ EXCLUDED"
        print(f"   {name}: {status}")


if __name__ == '__main__':
    test_cartopy_filter()