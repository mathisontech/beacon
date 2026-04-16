# Quick Start Guide

Get the Wildfire Tracking System running in 5 minutes!

## Step 1: Start the Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The API will start at `http://localhost:8000`

## Step 2: Start the Dashboard

Open a new terminal:

```bash
cd dashboard

# Install dependencies
npm install

# Start the dashboard
npm start
```

The dashboard will open at `http://localhost:3000`

## Step 3: Create a Test Fire Incident

In the dashboard:
1. Look at the left sidebar
2. Find "Create New Incident" form
3. Fill in:
   - Name: "Test Fire"
   - Latitude: 37.7749 (San Francisco)
   - Longitude: -122.4194
   - Severity: 3
4. Click "Create Incident"

You should see a marker appear on the map!

## Step 4: Generate a Prediction

1. Click on the fire incident you just created
2. In the left sidebar, find "Generate Prediction"
3. Click "24 Hours" button
4. Watch as a red polygon appears showing predicted spread

## Step 5: Simulate a Public Report

You can test the public reporting API:

```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": 1,
    "latitude": 37.7849,
    "longitude": -122.4094,
    "description": "I see smoke and flames!"
  }'
```

Refresh the incident in the dashboard to see the report appear as an orange dot!

## Step 6: Try the Mobile App (Optional)

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

**Important**: If running on a physical device, edit `mobile-app/App.js`:
```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000';
```

## Test the Full Workflow

1. **Dashboard**: Create a fire incident
2. **Dashboard**: Generate a 12-hour prediction
3. **Mobile App** (or API): Submit a public report nearby
4. **Dashboard**: Generate a new prediction - it will adjust based on the report!
5. **Dashboard**: See real-time updates via WebSocket

## Common Issues

### Backend won't start
- Make sure Python 3.9+ is installed: `python --version`
- Try: `pip install --upgrade pip`
- Then reinstall: `pip install -r requirements.txt`

### Dashboard won't start
- Make sure Node.js 16+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check for port conflicts (3000)

### Mobile app can't connect to API
- Change `API_BASE_URL` to your computer's IP address
- Make sure backend is running
- Check firewall settings

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API at `http://localhost:8000/docs` (FastAPI auto-docs)
- Customize the fire spread model parameters
- Integrate real weather data APIs
- Deploy to production servers

## Demo Data

Want to populate with sample data? Run this script:

```bash
cd backend
python demo_data.py
```

This will create:
- 3 sample fire incidents
- 10 public reports
- Predictions for each incident

Enjoy tracking wildfires! 🔥
