# Beacon Data - Status Updates and Alert Types

This folder contains standardized data definitions for the Beacon Emergency GPS application.

## Files

### 📍 `locationAlerts.js`
**Location-based emergency alerts and hazards**

Contains 41+ hazard types across 6 categories with timing predictions:

- **Weather Hazards** (12): Tornado, Hurricane, Thunderstorm, Floods, Winter Storm, etc.
- **Natural Disasters** (6): Wildfire, Earthquake, Tsunami, Landslide, Avalanche, Volcano
- **Infrastructure** (7): Power Outage, Gas Leak, Dam Failure, Road Closure, etc.
- **Environmental** (6): Air Quality, Smoke, Chemical Spill, Radiation, Water Contamination
- **Public Safety** (5): Civil Unrest, Active Threat, Bomb Threat, Terrorism, Amber Alert
- **Health** (4): Pandemic, Food Recall, Biological Hazard, Pest Infestation

**Features:**
- Icon and color for each alert
- Severity levels (Extreme, Severe, Moderate, Minor, Advisory)
- Timing predictions (Imminent, Approaching, Expected, Possible, Ongoing, Ending)
- Estimated duration and end times
- Multiple variants per hazard type (Watch vs Warning)

**Example Usage:**
```javascript
import { LOCATION_ALERTS, SEVERITY_LEVELS, TIMING_TYPES } from './data/locationAlerts'

// Find a specific alert
const tornado = LOCATION_ALERTS.find(a => a.id === 'tornado')

// Get alerts by category
const weatherAlerts = LOCATION_ALERTS.filter(a => a.category === 'weather')

// Get tornado warning variant
const tornadoWarning = tornado.variants.find(v => v.id === 'tornado_warning')
console.log(tornadoWarning.timingType) // 'imminent'
console.log(tornadoWarning.estimatedDuration) // '15-60 minutes'
```

---

### 👤 `userStatusUpdates.js`
**Personal status updates for users to broadcast**

Contains 70 status types across 7 categories:

- **Safety** (6): Safe, Sheltering in Place, Need Help, Injured, Trapped, Isolated
- **Location** (8): At Home, At Shelter, Evacuating, Evacuated, etc.
- **Resources** (10): Have/Need Food, Water, Supplies, Medication, Cash
- **Medical** (7): Healthy, Need Medical Care, With Children, With Pets, etc.
- **Assistance** (9): Can Help Others, Shelter Available, Can Transport, Medical Professional, etc.
- **Infrastructure** (14): Have/No Electricity, Internet, Cell Service, Water, Heat, AC, Gas
- **Transportation** (6): Have Vehicle, Need Fuel, Roads Clear/Blocked

**Features:**
- Icon and color for each status
- Category grouping
- Clear descriptions
- Helper functions to filter positive vs. need statuses

**Example Usage:**
```javascript
import { STATUS_TYPES, getStatusById, getPositiveStatuses } from './data/userStatusUpdates'

// Get a specific status
const safe = getStatusById('safe')
console.log(safe.icon) // '✅'
console.log(safe.color) // '#10b981'

// Get all "have" statuses (green/positive)
const positiveStatuses = getPositiveStatuses()

// Get all "need" statuses (red/emergency)
const needStatuses = STATUS_TYPES.filter(s => s.id.startsWith('need_'))
```

---

## Data Structure

### Location Alert Object
```javascript
{
  id: 'tornado',
  name: 'Tornado',
  category: 'weather',
  icon: '🌪️',
  color: '#7c3aed',
  hasTiming: true,
  variants: [
    {
      id: 'tornado_warning',
      name: 'Tornado Warning',
      severity: 'extreme',
      timingType: 'imminent',
      estimatedDuration: '15-60 minutes',
      estimatedEnd: 'Expected to pass in 30 minutes' // Optional
    }
  ]
}
```

### User Status Object
```javascript
{
  id: 'sheltering_in_place',
  name: 'Sheltering in Place',
  category: 'safety',
  icon: '🏠',
  color: '#f59e0b',
  description: 'Staying inside, not evacuating'
}
```

---

## Usage Guidelines

### When to Use Location Alerts
- **PRIMARY**: Automatic location-based risk updates in contact status feeds when beacon is active
- Display on Map page as pins/markers
- Show in Alerts page feed
- Trigger notifications
- Display in Community resource maps

### When to Use User Status Updates
- **SECONDARY**: Manual updates users can add to their status feed
- Contact status updates
- Profile status broadcasting
- Community feed updates
- Status timeline in chat

**Important**: When beacon is active, location alerts are automatically pushed to the status feed based on the user's GPS location. User status updates are optional additions to provide context or additional information.

---

## Adding New Items

### To add a new location alert:
1. Add to appropriate category in `locationAlerts.js`
2. Include all required fields (id, name, category, icon, color)
3. Add timing info if applicable
4. Create variants for different severity levels

### To add a new user status:
1. Add to appropriate category in `userStatusUpdates.js`
2. Include all required fields (id, name, category, icon, color, description)
3. Use consistent naming: `have_*`, `need_*`, `no_*`, `can_*`
4. Choose appropriate color: green (#10b981) for positive, red (#dc2626) for emergency

---

## Color Scheme

### Severity Colors (Location Alerts)
- **Extreme**: `#dc2626` (red) - Life-threatening
- **Severe**: `#f59e0b` (orange) - Dangerous
- **Moderate**: `#eab308` (yellow) - Potentially dangerous
- **Minor**: `#10b981` (green) - Low risk
- **Advisory**: `#3b82f6` (blue) - Information only

### Status Colors (User Updates)
- **Have/Positive**: `#10b981` (green)
- **Need/Emergency**: `#dc2626` (red)
- **Caution**: `#f59e0b` (orange)
- **Neutral**: `#3b82f6` (blue)
- **Offline**: `#64748b` (gray)

---

## Notes

- All icons are emoji-based for universal display
- Colors follow Tailwind CSS color palette
- IDs use snake_case for consistency
- Categories use lowercase with underscores
- All exports include helper functions for easy filtering