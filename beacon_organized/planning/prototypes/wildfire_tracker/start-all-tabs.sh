#!/bin/bash

# macOS-specific script that opens each service in a new Terminal tab

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🔥 Starting Wildfire Tracking System in separate tabs..."

# Open backend in new tab
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$SCRIPT_DIR/backend' && source venv/bin/activate && echo '🚀 Starting Backend...' && uvicorn main:app --reload"
end tell
EOF

# Wait a moment
sleep 2

# Open dashboard in new tab
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$SCRIPT_DIR/dashboard' && echo '🖥️  Starting Dashboard...' && npm start"
end tell
EOF

echo ""
echo "✅ Services starting in separate Terminal tabs!"
echo ""
echo "📊 Dashboard will open at: http://localhost:3000"
echo "🔌 API available at:       http://localhost:8000"
echo "📖 API Docs at:            http://localhost:8000/docs"
echo ""
echo "To stop: Close the terminal tabs or run ./stop-all.sh"
