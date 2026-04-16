#!/bin/bash

echo "🔥 Starting Wildfire Tracking System..."
echo "========================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo "🚀 Starting Backend API..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn main:app --reload --port 8000 > /tmp/wildfire-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend running on http://localhost:8000 (PID: $BACKEND_PID)"
echo "   Logs: /tmp/wildfire-backend.log"

# Wait for backend to start
echo "   Waiting for backend to initialize..."
sleep 3

# Start Dashboard
echo ""
echo "🖥️  Starting Dashboard..."
cd "$SCRIPT_DIR/dashboard"
BROWSER=none npm start > /tmp/wildfire-dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo "   Dashboard running on http://localhost:3000 (PID: $DASHBOARD_PID)"
echo "   Logs: /tmp/wildfire-dashboard.log"

echo ""
echo "========================================"
echo "✅ All services started!"
echo "========================================"
echo ""
echo "📊 Dashboard:  http://localhost:3000"
echo "🔌 API:        http://localhost:8000"
echo "📖 API Docs:   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for processes
wait
