# Tornado Evacuation Visualization Simulator

A real-time tornado evacuation decision support system for testing optimal routing algorithms with synthetic populations.

## Features

- **Tornado Path Projection**: Linear path projection with timestamps showing EF rating decay over time
- **Synthetic Town Data**:
  - 5-8 trailer parks (vulnerable locations)
  - 3-5 sturdy shelters (hospitals, schools, community centers)
  - 10-15 commercial buildings
  - 20-30 residential areas
  - 20-50 active drivers and residents

- **Automated Decision Logic**:
  - Calculates time-to-impact for every person
  - Recommends: Monitor, Shelter in Place, Evacuate, or Evacuate Urgently
  - Factors in drive time, safety margins, and shelter capabilities

- **Interactive Visualization**:
  - Mapbox map with roads and buildings
  - Color-coded danger zones (2-mile and 5-mile buffers)
  - Path timestamps every 5 minutes
  - Real-time simulation playback
  - Layer toggles for different data views

- **Statistics Dashboard**:
  - Population summary
  - Recommendation breakdown
  - Urgent situations alerts
  - Active evacuations tracking

## Setup

### Get a Mapbox Access Token (Free)

1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Copy your default public token
4. Replace the token in `frontend/src/components/MapView.jsx` line 8:
   ```javascript
   mapboxgl.accessToken = 'YOUR_TOKEN_HERE';
   ```

### Run the Application

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## How to Use

### 1. Configure Scenario
- Click "Configure Scenario" in the left panel
- Adjust tornado parameters:
  - **EF Rating**: 0-5 (strength)
  - **Direction**: 0-359 degrees
  - **Speed**: 10-70 mph
  - **Active Drivers**: 5-50 people
- Click "Generate New Scenario"

### 2. Control Map Layers
Toggle visibility of:
- Tornado Path (red dashed line)
- Danger Zones (yellow/red buffers)
- Time Stamps (show tornado position at T+5, T+10, etc.)
- Buildings (trailer parks, commercial)
- Shelters (hospitals, schools)
- People (drivers and residents)

### 3. Timeline Playback
- Press ▶ to start simulation
- Drag slider to jump to specific time
- Watch tornado move along projected path
- See people's decisions update in real-time

### 4. Review Statistics
Right panel shows:
- Total population and vulnerable count
- Breakdown of recommendations
- Urgent situations requiring immediate action
- Active evacuations with destinations

## Understanding the Visualization

### Map Markers
- 🌪️ **Tornado** (spinning) - Current tornado position
- 🏘️ **Trailer Park** - Vulnerable location (red glow)
- 🏥 **Shelter** - Safe building (green glow)
- 🏢 **Commercial** - Moderate shelter (blue glow)
- 🚗 **Driver** - Person in vehicle
- 👤 **Resident** - Person in building

### Action Colors
People are color-coded by recommended action:
- **Green**: Monitor (safe, no action needed)
- **Yellow**: Shelter in Place (stay where you are)
- **Orange**: Evacuate (leave for shelter now)
- **Red**: Evacuate Urgently (critical time window)

### Danger Zones
- **Red zone**: 2-mile radius (direct impact + debris)
- **Yellow zone**: 5-mile radius (outer danger area)

### Timestamps
Red boxes along tornado path show:
- Time from now (T+0, T+5, T+10, etc.)
- Tornado strength at that time (EF rating)

## Use Cases

### For Routing Algorithm Development
1. Generate a scenario with specific parameters
2. Note positions of vulnerable populations
3. Observe which people need to evacuate
4. Implement A* routing that:
   - Avoids tornado path (2-5 mile buffer)
   - Routes to nearest adequate shelter
   - Factors in time-to-impact constraints
5. Test with different tornado speeds/directions
6. Simulate congestion by adding more drivers

### For Emergency Planning
1. Model your actual town layout
2. Mark real trailer parks and shelters
3. Test different tornado scenarios
4. Identify which locations need evacuation plans
5. Calculate required shelter capacity
6. Determine evacuation time windows

## Technical Details

### Time-to-Impact Calculation
```
1. Project tornado path as straight line
2. Find closest point on path to location
3. Calculate distance to that point
4. Time = distance / tornado_speed
```

### Evacuation Decision Logic
```
IF distance_to_path > 5 miles:
    → MONITOR

ELSE IF time_to_impact < 5 minutes:
    → SHELTER_IN_PLACE (too late)

ELSE IF current_location has good shelter AND time < 15 min:
    → SHELTER_IN_PLACE

ELSE:
    nearest_shelter = find_nearest_shelter()
    drive_time = estimate_drive_time()
    safety_margin = time_to_impact - drive_time

    IF safety_margin > 10 minutes:
        → EVACUATE
    ELSE IF safety_margin > 0:
        → EVACUATE_URGENTLY
    ELSE:
        → SHELTER_IN_PLACE (can't make it)
```

### Path Projection with Decay
Tornado strength decays linearly over 60 minutes:
```
strength(t) = initial_EF * (1 - t/60)
```

## Limitations & Future Work

### Current Limitations
- Tornado path is linear (real tornadoes can turn)
- No road network routing (just straight-line distance estimates)
- Simplified building/shelter generation
- No traffic congestion modeling
- No weather deterioration effects

### Recommended Enhancements
1. **Monte Carlo Uncertainty**:
   - Add ±30° direction variance
   - Add ±20 mph speed variance
   - Show probability heat map instead of single path

2. **Real Road Routing**:
   - Integrate OSRM or GraphHopper
   - Calculate actual drive routes
   - Avoid tornado path with A* modifications

3. **Traffic Modeling**:
   - Simulate congestion from mass evacuation
   - Adjust drive times dynamically
   - Show bottlenecks on map

4. **Historical Data Integration**:
   - Load real tornado events from NOAA
   - Compare predictions vs actual paths
   - Validate decision logic

5. **Real-Time NWS Integration**:
   - Fetch live tornado warnings
   - Use actual warning polygons
   - Auto-update scenarios

## Data Sources

- **Tornado Parameters**: Based on NOAA Storm Events Database statistics
- **EF Scale**: Official Enhanced Fujita Scale (NOAA)
- **Safety Distances**: Storm chaser best practices (1-4 miles)
- **Decision Logic**: NWS emergency management guidelines

## License

MIT

## Contact

For questions or collaboration: [Your contact info]

---

**Note**: This is a simulation tool for research and algorithm development. In a real tornado situation, always follow official NWS warnings and local emergency management guidance.
