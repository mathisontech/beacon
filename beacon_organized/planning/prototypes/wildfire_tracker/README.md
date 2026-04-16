# Wildfire Tracking System

A comprehensive wildfire spread modeling and tracking application for fire departments and the public.

## Overview

This system provides:
- **Fire Department Dashboard**: Accurate wildfire spread predictions with real-time crowd-sourced data integration
- **Public Mobile App**: Lightweight app for citizens to report fire sightings
- **ML-Enhanced Predictions**: Machine learning models that incorporate crowd-sourced observations
- **Real-time Updates**: WebSocket-based live updates across all connected clients

## Architecture

```
wildfire-tracker/
├── backend/          # FastAPI server with ML models
├── dashboard/        # React web dashboard (Fire Department)
├── mobile-app/       # React Native mobile app (Public)
└── ml-models/        # Machine learning models
```

## Features

### Fire Department Dashboard
- Interactive map with fire incident tracking
- Real-time crowd-sourced report visualization
- Accurate wildfire spread predictions (6-48 hours)
- Create and manage fire incidents
- Verify public reports
- WebSocket real-time updates

### Public Mobile App
- Report fire sightings with GPS location
- View nearby active fires
- Lightweight spread predictions (optimized for mobile)
- Simple, intuitive interface

### Backend API
- RESTful API with FastAPI
- SQLite database (scalable to PostgreSQL)
- Wildfire spread modeling based on Rothermel equations
- Crowd-sourced data integration
- WebSocket support for real-time updates

## Tech Stack

- **Backend**: Python 3.9+, FastAPI, SQLAlchemy, PyTorch
- **Dashboard**: React 18, Leaflet, Recharts
- **Mobile**: React Native, Expo
- **Database**: SQLite (development), PostgreSQL (production)
- **Real-time**: WebSockets

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Dashboard Setup

```bash
cd dashboard

# Install dependencies
npm install

# Start development server
npm start
```

The dashboard will open at `http://localhost:3000`

### Mobile App Setup

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## API Endpoints

### Incidents
- `POST /api/incidents` - Create new fire incident
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/{id}` - Get incident details

### Reports
- `POST /api/reports` - Submit public fire report
- `GET /api/reports` - List reports

### Predictions
- `POST /api/predictions` - Generate spread prediction (accurate)
- `GET /api/predictions/mobile/{id}` - Get lightweight prediction

### WebSocket
- `WS /ws` - Real-time updates

## Wildfire Spread Models

### Accurate Model (Dashboard)
Based on simplified Rothermel fire spread equations:
- Wind speed and direction
- Temperature and humidity
- Fuel load and moisture content
- Terrain slope
- Crowd-sourced data adjustment

### Lightweight Model (Mobile)
- Pre-computed lookup tables
- Fast inference on mobile devices
- Simplified calculations
- Suitable for real-time mobile updates

## Crowd-Sourced Data Integration

The system analyzes public reports to adjust predictions:
1. Calculates distance of reports from fire center
2. Compares with model predictions
3. Applies adjustment factor (0.9x - 1.3x)
4. Increases confidence when reports align with model

## Configuration

### Backend Configuration
Edit `backend/database.py` to change database:
```python
DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/wildfire"
```

### Mobile App Configuration
Edit `mobile-app/App.js` to set API endpoint:
```javascript
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000';
```

## Deployment

### Backend (Production)
```bash
# Use production ASGI server
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Dashboard (Production)
```bash
npm run build
# Serve build folder with nginx or similar
```

### Mobile App (Production)
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Future Enhancements

- [ ] Integration with real weather APIs (NOAA, Weather.com)
- [ ] ELMFIRE or ForeFire integration for physics-based modeling
- [ ] Satellite imagery integration (MODIS, VIIRS)
- [ ] Machine learning model training pipeline
- [ ] Photo verification with computer vision
- [ ] Push notifications for nearby fires
- [ ] Historical fire data analytics
- [ ] Evacuation route planning
- [ ] Integration with emergency services

## Open Source Models

This project is designed to integrate with:
- **ELMFIRE**: EPLv2 license (commercial use allowed)
- **Pyregence**: Open source, free for all
- **ForeFire**: Open source wildfire simulation

See research documentation for integration guides.

## License

MIT License - see LICENSE file

## Contributing

Contributions welcome! Please see CONTRIBUTING.md

## Support

For issues and questions:
- GitHub Issues: [Link to repo]
- Documentation: [Link to docs]

## Acknowledgments

Based on research into:
- Rothermel fire spread equations
- ELMFIRE modeling system
- Crowd-sourced disaster reporting systems
- Mobile-optimized ML inference

---

Built for fire departments and communities to better track and predict wildfire spread.
