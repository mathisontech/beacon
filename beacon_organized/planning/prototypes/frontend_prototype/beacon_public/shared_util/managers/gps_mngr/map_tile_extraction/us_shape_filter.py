#!/usr/bin/env python3
"""
US Shape Filter
==============

Filter grids to only show those that are actually within the continental US,
creating a more accurate US-shaped visualization.

Updated to use Cartopy-based precise boundary detection.
"""

import sqlite3

# Global variable to store the Cartopy filter instance
_cartopy_filter = None

def _get_cartopy_filter():
    """Get or create the Cartopy filter instance"""
    global _cartopy_filter
    if _cartopy_filter is None:
        try:
            from cartopy_us_filter import CartopyUSFilter
            _cartopy_filter = CartopyUSFilter()
            print("✅ Using Cartopy-based precise US boundary filtering")
        except ImportError as e:
            print(f"⚠️  Cartopy not available ({e}), falling back to simple filtering")
            _cartopy_filter = False
    return _cartopy_filter

def is_grid_in_continental_us(lat_min: float, lat_max: float, lng_min: float, lng_max: float) -> bool:
    """
    Determine if a grid square is actually within the continental US boundaries

    Now uses Cartopy-based precise boundary detection when available,
    falls back to approximate geographic boundaries if Cartopy is not available.
    """

    # Try to use Cartopy-based precise filtering
    cartopy_filter = _get_cartopy_filter()
    if cartopy_filter and cartopy_filter != False:
        return cartopy_filter.is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max)

    # Fallback to original simple filtering if Cartopy is not available
    return _simple_us_filter(lat_min, lat_max, lng_min, lng_max)


def _simple_us_filter(lat_min: float, lat_max: float, lng_min: float, lng_max: float) -> bool:
    """
    Original simple filtering logic as fallback when Cartopy is not available
    """
    # Grid center point
    center_lat = (lat_min + lat_max) / 2
    center_lng = (lng_min + lng_max) / 2

    # Rough continental US boundaries (more detailed than simple rectangle)

    # Far northern areas (above northern US border)
    if center_lat > 49.0:
        return False

    # Far southern areas (below southern border)
    if center_lat < 24.5:
        return False

    # Far western areas (Pacific Ocean)
    if center_lng < -125.0:
        return False

    # Far eastern areas (Atlantic Ocean)
    if center_lng > -66.5:
        return False

    # Additional filtering for specific regions

    # Northeast corner (above Maine/New Hampshire)
    if center_lat > 47.0 and center_lng > -70.0:
        return False

    # Northwest corner (above Washington state)
    if center_lat > 48.5 and center_lng < -120.0:
        return False

    # Southwest corner (Baja California/Pacific) - IMPROVED
    if center_lat < 32.5 and center_lng < -115.0:  # More restrictive to exclude Baja
        return False

    # Southeast corner (below Florida) - IMPROVED
    if center_lat < 25.5 and center_lng > -81.0:  # Less restrictive to include more of Florida
        return False

    # Gulf of Mexico exclusions - IMPROVED
    if center_lat < 28.5 and -96.0 < center_lng < -84.0:  # More restrictive
        return False

    # Great Lakes exclusions (rough)
    # Lake Superior
    if 46.0 < center_lat < 48.5 and -92.0 < center_lng < -84.0:
        return False

    # Lake Michigan
    if 41.5 < center_lat < 46.0 and -88.0 < center_lng < -84.5:
        return False

    # Lake Huron
    if 43.0 < center_lat < 46.0 and -85.0 < center_lng < -82.0:
        return False

    # Lake Erie
    if 41.0 < center_lat < 43.0 and -83.0 < center_lng < -78.5:
        return False

    # Lake Ontario
    if 43.0 < center_lat < 44.5 and -80.0 < center_lng < -76.0:
        return False

    # Additional ocean exclusions

    # Atlantic Ocean off East Coast - IMPROVED
    if center_lng > -74.0 and center_lat < 35.0:  # Less restrictive to include more coast
        return False

    # Atlantic Ocean off Northeast
    if center_lng > -70.0 and center_lat > 42.0:
        return False

    # Pacific Ocean off California - IMPROVED
    if center_lng < -121.0 and center_lat < 36.0:  # Adjusted to include more California coast
        return False

    # Pacific Ocean off Oregon/Washington
    if center_lng < -123.0 and center_lat > 42.0:
        return False

    # If we made it through all exclusions, it's probably in the US
    return True


def get_us_shaped_grids(coverage_system) -> list:
    """Get only the grids that are within the continental US shape"""

    # Load all grids
    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, grid_x, grid_y, lat_min, lat_max, lng_min, lng_max,
                   total_tiles, extracted_tiles, status
            FROM grid_squares
            ORDER BY grid_y, grid_x
        ''')
        results = cursor.fetchall()

    us_grids = []
    total_grids = len(results)
    filtered_count = 0

    for result in results:
        grid_data = {
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
        }

        # Check if this grid is within the US
        if is_grid_in_continental_us(
            grid_data['lat_min'], grid_data['lat_max'],
            grid_data['lng_min'], grid_data['lng_max']
        ):
            us_grids.append(grid_data)
        else:
            filtered_count += 1

    print(f"🗺️ Filtered grids: {filtered_count:,} ocean/foreign grids removed")
    print(f"🇺🇸 US grids: {len(us_grids):,} grids within continental US")
    print(f"📊 Efficiency: {len(us_grids)/total_grids*100:.1f}% of total area is useful")

    return us_grids


def update_grid_database_with_us_filter(coverage_system):
    """Update the database to mark non-US grids as 'filtered' status"""

    with sqlite3.connect(coverage_system.db_path) as conn:
        cursor = conn.execute('''
            SELECT grid_id, lat_min, lat_max, lng_min, lng_max, status
            FROM grid_squares
            WHERE status = 'pending'
        ''')
        results = cursor.fetchall()

        filtered_count = 0

        for grid_id, lat_min, lat_max, lng_min, lng_max, status in results:
            if not is_grid_in_continental_us(lat_min, lat_max, lng_min, lng_max):
                # Mark as filtered (not needed)
                conn.execute('''
                    UPDATE grid_squares
                    SET status = 'filtered_out'
                    WHERE grid_id = ?
                ''', (grid_id,))
                filtered_count += 1

        conn.commit()

    print(f"🗑️ Marked {filtered_count:,} grids as 'filtered_out' (ocean/foreign areas)")
    print(f"✅ Database updated - only US grids will show as pending")

    return filtered_count


# Enhanced visualization function that only shows US-shaped grids
def show_us_shaped_grid_map(coverage_system):
    """Show map with only US-shaped grids (no ocean areas)"""
    from grid_visualization import GridVisualization
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches

    # Get US-shaped grids
    us_grids = get_us_shaped_grids(coverage_system)

    # Create visualization
    viz = GridVisualization(coverage_system)
    viz.create_map_from_grid_list(us_grids)


# Add method to GridVisualization class to handle custom grid list
def create_map_from_grid_list(self, grids_list):
    """Create map from a custom list of grids (for US-shaped display)"""
    self.ax.clear()
    self.patches = {}

    # Set up the map
    self.ax.set_xlim(self.bounds['lng_min'], self.bounds['lng_max'])
    self.ax.set_ylim(self.bounds['lat_min'], self.bounds['lat_max'])
    self.ax.set_aspect('equal')
    self.ax.set_title('🇺🇸 Continental US Grid Extraction Progress', fontsize=16, fontweight='bold')
    self.ax.set_xlabel('Longitude', fontsize=12)
    self.ax.set_ylabel('Latitude', fontsize=12)

    # Draw only US grids
    for grid in grids_list:
        self.add_grid_patch(grid)

    # Add legend and statistics
    self.add_legend()
    self.add_statistics(grids_list)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    # Example usage
    import sqlite3
    print("🇺🇸 US Shape Filter Ready!")
    print("\nAvailable functions:")
    print("  • get_us_shaped_grids(coverage_system) - Get only US grids")
    print("  • update_grid_database_with_us_filter(coverage_system) - Filter database")
    print("  • show_us_shaped_grid_map(coverage_system) - Show US-shaped map")