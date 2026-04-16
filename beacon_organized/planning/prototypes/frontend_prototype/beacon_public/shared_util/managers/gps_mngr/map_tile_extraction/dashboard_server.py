#!/usr/bin/env python3
"""
Dashboard Server for Extraction Control
=======================================

Web server that serves the extraction dashboard and provides API endpoints
for controlling batch extraction with start/stop functionality.
"""

import asyncio
import json
from pathlib import Path
from flask import Flask, render_template_string, jsonify, request
from flask_cors import CORS
from extraction_controller import ExtractionController
import threading
import time
import argparse
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global controller instance
controller = ExtractionController()
extraction_task = None


@app.route('/')
def dashboard():
    """Serve the extraction dashboard"""
    dashboard_path = Path(__file__).parent / "extraction_dashboard.html"
    with open(dashboard_path, 'r') as f:
        return f.read()

@app.route('/api/extraction-status')
def get_status():
    """Get current extraction status"""
    try:
        progress = controller.get_batch_progress()

        return jsonify({
            'success': True,
            'is_running': controller.status.is_running,
            'current_batch_id': controller.status.current_batch_id,
            'current_grid_index': controller.status.current_grid_index,
            'total_grids_in_batch': controller.status.total_grids_in_batch,
            'session_tiles_extracted': controller.status.session_tiles_extracted,
            'session_grids_completed': controller.status.session_grids_completed,
            'session_time': time.time() - controller.status.session_start_time if controller.status.session_start_time else 0,
            'total_batches': progress['total_batches'],
            'completed_batches': progress['completed_batches'],
            'in_progress_batches': progress['in_progress_batches'],
            'pending_batches': progress['pending_batches'],
            'total_tiles': progress['total_tiles'],
            'extracted_tiles': progress['extracted_tiles'],
            'completion_percentage': progress['completion_percentage'],
            'next_batch_id': progress['next_batch_id']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/start-extraction', methods=['POST'])
def start_extraction():
    """Start extraction process"""
    global extraction_task

    try:
        print(f"Received start extraction request")

        if controller.status.is_running:
            return jsonify({'success': False, 'error': 'Extraction already running'}), 400

        data = request.get_json() or {}
        batch_id = data.get('batch_id')

        print(f"Starting extraction for batch: {batch_id}")

        # Start extraction in background thread
        def run_extraction():
            global extraction_task
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                result = loop.run_until_complete(controller.start_extraction(batch_id))
                print(f"Extraction completed: {result}")
            except Exception as e:
                print(f"Extraction error: {e}")
            finally:
                extraction_task = None
                loop.close()

        extraction_task = threading.Thread(target=run_extraction)
        extraction_task.daemon = True
        extraction_task.start()

        response = {
            'success': True,
            'message': f'Started extraction of batch {batch_id or "next available"}'
        }
        print(f"Returning response: {response}")

        return jsonify(response), 200

    except Exception as e:
        error_response = {'success': False, 'error': str(e)}
        print(f"Error in start_extraction: {e}")
        return jsonify(error_response), 500

@app.route('/api/stop-extraction', methods=['POST'])
def stop_extraction():
    """Stop extraction process"""
    try:
        result = controller.stop_extraction()
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/batch-grid/<int:batch_id>')
def get_batch_details(batch_id):
    """Get detailed information about a specific batch"""
    try:
        batches = controller.batch_manager.get_batch_status()
        batch = next((b for b in batches if b.batch_id == batch_id), None)

        if not batch:
            return jsonify({'success': False, 'error': f'Batch {batch_id} not found'})

        return jsonify({
            'success': True,
            'batch_id': batch.batch_id,
            'status': batch.status,
            'grid_count': len(batch.grid_ids),
            'total_tiles': batch.total_tiles,
            'extracted_tiles': batch.extracted_tiles,
            'completion_percentage': (batch.extracted_tiles / batch.total_tiles * 100) if batch.total_tiles > 0 else 0,
            'estimated_duration_hours': batch.estimated_duration_hours,
            'started_at': batch.started_at,
            'completed_at': batch.completed_at
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/map/<map_type>')
def serve_folium_map(map_type):
    """Serve Folium interactive maps"""
    try:
        from folium_map_generator import (
            create_overview_map, create_california_map, create_texas_map,
            create_florida_map, create_northeast_map
        )
        from gridmap_squares import SimpleGridCoverage

        # Initialize coverage system
        coverage_system = SimpleGridCoverage()

        # Map type to function mapping
        map_functions = {
            'overview': create_overview_map,
            'california': create_california_map,
            'texas': create_texas_map,
            'florida': create_florida_map,
            'northeast': create_northeast_map
        }

        # Get the appropriate function
        if map_type in map_functions:
            map_html = map_functions[map_type](coverage_system)
            return map_html
        else:
            return f"""
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>Unknown Map Type</h2>
            <p>Map type '{map_type}' not supported.</p>
            <p>Available types: overview, california, texas, florida, northeast</p>
            </body>
            </html>
            """

    except ImportError as e:
        return f"""
        <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>Map Visualization Unavailable</h2>
        <p>Map generation module not found: {str(e)}</p>
        <p>Map type requested: {map_type}</p>
        </body>
        </html>
        """
    except Exception as e:
        return f"""
        <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>Map Generation Error</h2>
        <p>Error generating map: {str(e)}</p>
        <p>Map type: {map_type}</p>
        </body>
        </html>
        """

def run_server(host='localhost', port=8080):
    """Run the dashboard server"""
    print(f"🌐 Starting extraction dashboard server...")
    print(f"📍 Access dashboard at: http://{host}:{port}")
    print(f"🎮 Use Ctrl+C to stop server")

    app.run(host=host, port=port, debug=True, threaded=True)

def main():
    """Main function to start the dashboard server"""
    parser = argparse.ArgumentParser(description='Extraction Control Dashboard Server')
    parser.add_argument('--port', type=int, default=8080, help='Port to serve on (default: 8080)')
    parser.add_argument('--host', default='localhost', help='Host to bind to (default: localhost)')

    args = parser.parse_args()

    print("🚀 Starting Extraction Control Dashboard...")
    print(f"   Host: {args.host}")
    print(f"   Port: {args.port}")

    # Initialize the extraction controller
    try:
        progress = controller.get_batch_progress()
        print(f"✅ Found {progress['total_batches']} batches ({progress['pending_batches']} pending)")
        print(f"📊 Overall progress: {progress['completion_percentage']:.1f}%")
    except Exception as e:
        print(f"⚠️  Warning: Could not access batch data: {e}")

    print(f"\n🌐 Dashboard server running at: http://{args.host}:{args.port}")
    print("📊 Available endpoints:")
    print(f"   • http://{args.host}:{args.port}/ - Main dashboard")
    print(f"   • http://{args.host}:{args.port}/api/extraction-status - Current status")
    print(f"   • http://{args.host}:{args.port}/api/start-extraction - Start extraction")
    print(f"   • http://{args.host}:{args.port}/api/stop-extraction - Stop extraction")
    print("\n🛑 Press Ctrl+C to stop the server")

    try:
        run_server(args.host, args.port)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down dashboard server...")
        print("✅ Server stopped successfully!")

if __name__ == '__main__':
    main()