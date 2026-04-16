#!/bin/bash

echo "🛑 Stopping Wildfire Tracking System..."
echo ""

# Kill processes on ports 8000 and 3000
echo "Stopping backend (port 8000)..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
echo "Stopping dashboard (port 3000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Kill any remaining node/uvicorn processes from this project
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo ""
echo "✅ All services stopped"
