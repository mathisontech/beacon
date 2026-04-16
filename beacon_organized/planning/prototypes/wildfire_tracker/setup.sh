#!/bin/bash

echo "🔥 Wildfire Tracking System - Setup Script"
echo "=========================================="
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created virtual environment"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies installed"

cd ..
echo ""

# Setup Dashboard
echo "📦 Setting up Dashboard..."
cd dashboard

if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo "✅ Dashboard dependencies installed"
else
    echo "✅ Dashboard dependencies already installed"
fi

cd ..
echo ""

# Setup Mobile App
echo "📦 Setting up Mobile App..."
cd mobile-app

if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo "✅ Mobile app dependencies installed"
else
    echo "✅ Mobile app dependencies already installed"
fi

cd ..
echo ""

echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "2. Start Dashboard (Terminal 2):"
echo "   cd dashboard"
echo "   npm start"
echo ""
echo "3. Optional - Start Mobile App (Terminal 3):"
echo "   cd mobile-app"
echo "   npm start"
echo ""
echo "📚 See QUICKSTART.md for a guided tutorial"
echo ""
