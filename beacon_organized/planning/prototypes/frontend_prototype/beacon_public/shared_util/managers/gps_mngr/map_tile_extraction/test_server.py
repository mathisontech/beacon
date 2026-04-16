#!/usr/bin/env python3
"""
Simple test server to debug the dashboard
"""

import json
import sqlite3
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os
from pathlib import Path
from folium_map_generator import create_grid_map_html, FoliumGridMap
from gridmap_squares import SimpleGridCoverage

class TestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)

        if parsed_path.path == '/':
            # Serve the dashboard HTML
            try:
                with open('grid_progress_dashboard.html', 'r') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(content.encode())
            except Exception as e:
                self.send_error(500, str(e))

        elif parsed_path.path == '/api/grid-data':
            # Serve test data
            try:
                self.serve_grid_data()
            except Exception as e:
                error_data = {'error': str(e)}
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_data).encode())

        elif parsed_path.path.startswith('/api/map'):
            # Serve Folium maps
            try:
                self.serve_folium_map(parsed_path, parse_qs(parsed_path.query))
            except Exception as e:
                error_data = {'error': str(e)}
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_data).encode())

        elif parsed_path.path == '/api/grid-data-old':
            # Serve test data
            try:
                # Check if database exists
                if os.path.exists('simple_grid_coverage.db'):
                    with sqlite3.connect('simple_grid_coverage.db') as conn:
                        cursor = conn.execute('SELECT COUNT(*) FROM grid_squares')
                        total_grids = cursor.fetchone()[0]

                        cursor = conn.execute('''
                            SELECT status, COUNT(*)
                            FROM grid_squares
                            GROUP BY status
                        ''')
                        status_counts = dict(cursor.fetchall())

                        # Get a better sample of grids across the entire US
                        cursor = conn.execute('''
                            SELECT grid_id, lat_min, lat_max, lng_min, lng_max, status
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
                        all_grids = cursor.fetchall()

                        # Sample grids more evenly across the geography
                        grids = []
                        if len(all_grids) > 1000:
                            # Take every nth grid to get a representative sample
                            step = len(all_grids) // 1000
                            sampled_grids = all_grids[::step]
                        else:
                            sampled_grids = all_grids

                        for row in sampled_grids:
                            grids.append({
                                'grid_id': row[0],
                                'lat_min': row[1],
                                'lat_max': row[2],
                                'lng_min': row[3],
                                'lng_max': row[4],
                                'status': row[5]
                            })
                else:
                    # Return dummy data if no database
                    total_grids = 0
                    status_counts = {}
                    grids = []

                data = {
                    'stats': {
                        'completed': status_counts.get('completed', 0),
                        'in_progress': status_counts.get('in_progress', 0),
                        'pending': status_counts.get('pending', 0),
                        'total_tiles': 1000000,
                        'extracted_tiles': 250000
                    },
                    'grids': grids
                }

                json_data = json.dumps(data)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json_data.encode())

            except Exception as e:
                error_data = {'error': str(e)}
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_data).encode())
        else:
            super().do_GET()

    def serve_grid_data(self):
        """Serve grid data as JSON"""
        # Check if database exists
        if os.path.exists('simple_grid_coverage.db'):
            with sqlite3.connect('simple_grid_coverage.db') as conn:
                cursor = conn.execute('SELECT COUNT(*) FROM grid_squares')
                total_grids = cursor.fetchone()[0]

                cursor = conn.execute('''
                    SELECT status, COUNT(*)
                    FROM grid_squares
                    GROUP BY status
                ''')
                status_counts = dict(cursor.fetchall())

                cursor = conn.execute('''
                    SELECT SUM(total_tiles), SUM(extracted_tiles)
                    FROM grid_squares
                    WHERE status != 'filtered_out'
                ''')
                tile_data = cursor.fetchone()

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
                    LIMIT 1000
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
        else:
            # Return dummy data if no database
            status_counts = {'pending': 16953, 'in_progress': 6, 'completed': 0}
            tile_data = (1000000, 250000)
            grids = []

        data = {
            'stats': {
                'completed': status_counts.get('completed', 0),
                'in_progress': status_counts.get('in_progress', 0),
                'pending': status_counts.get('pending', 0),
                'total_tiles': tile_data[0] or 0,
                'extracted_tiles': tile_data[1] or 0
            },
            'grids': grids
        }

        json_data = json.dumps(data)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json_data.encode())

    def serve_folium_map(self, parsed_path, query_params):
        """Serve Folium interactive maps"""
        # Extract map type from path: /api/map/overview, /api/map/california, etc.
        path_parts = parsed_path.path.split('/')
        map_type = path_parts[-1] if len(path_parts) > 2 else 'overview'

        # Initialize coverage system
        try:
            if os.path.exists('simple_grid_coverage.db'):
                coverage_system = SimpleGridCoverage(db_path='simple_grid_coverage.db')
            else:
                coverage_system = SimpleGridCoverage()
        except Exception as e:
            raise Exception(f"Could not initialize coverage system: {e}")

        # Generate map HTML
        try:
            map_html = create_grid_map_html(coverage_system, map_type)

            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(map_html.encode('utf-8'))

        except Exception as e:
            raise Exception(f"Error generating map: {e}")

def main():
    print("🧪 Starting test dashboard server on port 8080...")
    print("📊 Dashboard: http://localhost:8080")
    print("🛑 Press Ctrl+C to stop")

    server = HTTPServer(('localhost', 8080), TestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        server.shutdown()

if __name__ == '__main__':
    main()